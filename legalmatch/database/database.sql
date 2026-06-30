
-- 1. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector: cosine similarity matching
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()


-- 2. CORE ANCHOR TABLE
-- =============================================================================
-- server.js queries: SELECT user_id, email, password_hash, role FROM Users
-- server.js inserts: INSERT INTO Users (email, password_hash, role)
CREATE TABLE Users (
    user_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(50)  NOT NULL CHECK (role IN ('Client', 'Lawyer', 'Admin')),
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 3. SPECIALIZED PROFILE TABLES
-- =============================================================================

CREATE TABLE Admins (
    admin_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    department  VARCHAR(100),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE LawyerProfiles (
    profile_id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID          NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,

    lsk_registration_number  VARCHAR(100)  UNIQUE NOT NULL,
    full_name                VARCHAR(255),           -- NEW: shown in dashboard header
    biography                TEXT,                   -- NEW: "About" section

    academic_qualifications  TEXT,
    institutions             TEXT,                   -- NEW: university/college
    graduation_year          SMALLINT,               -- NEW: e.g. 2014
    bar_admission_year       SMALLINT,               -- NEW: year called to bar
    courts                   TEXT,                   -- NEW: e.g. "High Court, ELC"
    languages                TEXT,                   -- NEW: e.g. "English, Kiswahili"

    specializations          TEXT,
    years_of_experience      INT           CHECK (years_of_experience >= 0),
    firm_name                VARCHAR(255),           -- NEW: current employer

    case_type_descriptions   TEXT,
    previous_cases_handled   INT           CHECK (previous_cases_handled >= 0),
    success_rate             NUMERIC(5,2)  CHECK (success_rate >= 0 AND success_rate <= 100),
    price_guidance           TEXT,

    profile_text             TEXT,                   -- NEW: full searchable blob

   
    profile_embedding        VECTOR(768),

    
    average_rating           NUMERIC(3,2)  DEFAULT 0.00,  -- NEW: shown in dashboard
    total_reviews            INT           DEFAULT 0,      -- NEW: shown in dashboard

    created_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ClientIssues (
    issue_id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         UUID          NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    issue_title       VARCHAR(255)  NOT NULL,
    issue_description TEXT          NOT NULL,
    legal_category    VARCHAR(100),                  -- NEW: Family Law, Criminal Law …
    jurisdiction      VARCHAR(100),                  -- NEW: county / court jurisdiction
    urgency_level     VARCHAR(50),                   -- NEW: Low / Medium / High
    budget_range      VARCHAR(100),                  -- kept for backward compat
    budget_min        NUMERIC(12,2),                 -- NEW: structured min
    budget_max        NUMERIC(12,2),                 -- NEW: structured max
  
    status            VARCHAR(50)   NOT NULL DEFAULT 'Open'
                          CHECK (status IN ('Open', 'Matched', 'Closed')),
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Matches (
    match_id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         UUID          NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    lawyer_id         UUID          NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    issue_id          UUID          NOT NULL REFERENCES ClientIssues(issue_id) ON DELETE CASCADE,
    similarity_score  FLOAT,
    
    status            VARCHAR(50)   NOT NULL DEFAULT 'requested'
                          CHECK (status IN ('Pending','requested','ongoing','completed','declined')),
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Reviews (
    review_id    UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID     NOT NULL REFERENCES Users(user_id)    ON DELETE CASCADE,
    lawyer_id    UUID     NOT NULL REFERENCES Users(user_id)    ON DELETE CASCADE,
    match_id     UUID     NOT NULL REFERENCES Matches(match_id) ON DELETE CASCADE,
    rating       INT      NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text  TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AnalyticsReports (
    report_id    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id     UUID          NOT NULL REFERENCES Admins(admin_id) ON DELETE CASCADE,
    report_title VARCHAR(255)  NOT NULL,
    report_data  JSONB,
    generated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);



CREATE INDEX idx_lawyer_profile_embedding
    ON LawyerProfiles USING ivfflat (profile_embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX idx_lawyerprofiles_user_id   ON LawyerProfiles(user_id);
CREATE INDEX idx_clientissues_client_id   ON ClientIssues(client_id);
CREATE INDEX idx_matches_client_id        ON Matches(client_id);
CREATE INDEX idx_matches_lawyer_id        ON Matches(lawyer_id);
CREATE INDEX idx_matches_issue_id         ON Matches(issue_id);
CREATE INDEX idx_reviews_lawyer_id        ON Reviews(lawyer_id);
CREATE INDEX idx_reviews_client_id        ON Reviews(client_id);

CREATE INDEX idx_matches_lawyer_status    ON Matches(lawyer_id, status);
CREATE INDEX idx_matches_updated_at       ON Matches(updated_at DESC);

CREATE INDEX idx_lawyerprofiles_profile_text
    ON LawyerProfiles USING GIN (to_tsvector('english', COALESCE(profile_text, '')));



CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lawyerprofiles_updated_at
    BEFORE UPDATE ON LawyerProfiles
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON Matches
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


CREATE OR REPLACE FUNCTION fn_sync_lawyer_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_lawyer_id UUID;
BEGIN
    v_lawyer_id := COALESCE(NEW.lawyer_id, OLD.lawyer_id);

    UPDATE LawyerProfiles
    SET
        total_reviews  = sub.cnt,
        average_rating = sub.avg_r
    FROM (
        SELECT
            COUNT(*)           AS cnt,
            COALESCE(AVG(rating), 0) AS avg_r
        FROM Reviews
        WHERE lawyer_id = v_lawyer_id
    ) sub
    WHERE user_id = v_lawyer_id;

    RETURN NULL;   -- AFTER trigger; return value ignored
END;
$$;

CREATE TRIGGER trg_sync_lawyer_rating
    AFTER INSERT OR UPDATE OR DELETE ON Reviews
    FOR EACH ROW EXECUTE FUNCTION fn_sync_lawyer_rating();


-- =============================================================================
-- MIGRATION — run this block ONLY if you already have the old schema in place.
-- Skip this section entirely on a fresh install.
-- =============================================================================

/*

-- Step 1: New columns on LawyerProfiles
ALTER TABLE LawyerProfiles
    ADD COLUMN IF NOT EXISTS full_name             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS biography             TEXT,
    ADD COLUMN IF NOT EXISTS institutions          TEXT,
    ADD COLUMN IF NOT EXISTS graduation_year       SMALLINT,
    ADD COLUMN IF NOT EXISTS bar_admission_year    SMALLINT,
    ADD COLUMN IF NOT EXISTS courts                TEXT,
    ADD COLUMN IF NOT EXISTS languages             TEXT,
    ADD COLUMN IF NOT EXISTS firm_name             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS profile_text          TEXT,
    ADD COLUMN IF NOT EXISTS average_rating        NUMERIC(3,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS total_reviews         INT          DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: New columns on ClientIssues
ALTER TABLE ClientIssues
    ADD COLUMN IF NOT EXISTS legal_category  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS jurisdiction    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS urgency_level   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS budget_min      NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS budget_max      NUMERIC(12,2);

-- Step 3: Widen the Matches status CHECK to include the dashboard values.
--         Drop the old constraint, add the new one.
ALTER TABLE Matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE Matches
    ADD CONSTRAINT matches_status_check
    CHECK (status IN ('Pending','requested','ongoing','completed','declined'));

-- Backfill: rename any existing 'Pending' rows to 'requested'
UPDATE Matches SET status = 'requested' WHERE status = 'Pending';

-- Set the new default for future inserts
ALTER TABLE Matches ALTER COLUMN status SET DEFAULT 'requested';

-- Step 4: Add updated_at to Matches if missing
ALTER TABLE Matches
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 5: New indexes (IF NOT EXISTS guard prevents errors on re-run)
CREATE INDEX IF NOT EXISTS idx_matches_lawyer_status
    ON Matches(lawyer_id, status);

CREATE INDEX IF NOT EXISTS idx_matches_updated_at
    ON Matches(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_lawyerprofiles_profile_text
    ON LawyerProfiles USING GIN (to_tsvector('english', COALESCE(profile_text, '')));

-- Step 6: Install triggers (CREATE OR REPLACE is safe to re-run)
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lawyerprofiles_updated_at ON LawyerProfiles;
CREATE TRIGGER trg_lawyerprofiles_updated_at
    BEFORE UPDATE ON LawyerProfiles
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_matches_updated_at ON Matches;
CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON Matches
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_sync_lawyer_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_lawyer_id UUID;
BEGIN
    v_lawyer_id := COALESCE(NEW.lawyer_id, OLD.lawyer_id);
    UPDATE LawyerProfiles
    SET
        total_reviews  = sub.cnt,
        average_rating = sub.avg_r
    FROM (
        SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg_r
        FROM Reviews WHERE lawyer_id = v_lawyer_id
    ) sub
    WHERE user_id = v_lawyer_id;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_lawyer_rating ON Reviews;
CREATE TRIGGER trg_sync_lawyer_rating
    AFTER INSERT OR UPDATE OR DELETE ON Reviews
    FOR EACH ROW EXECUTE FUNCTION fn_sync_lawyer_rating();

-- Step 7: Backfill average_rating / total_reviews for any pre-existing reviews
UPDATE LawyerProfiles lp
SET
    total_reviews  = sub.cnt,
    average_rating = sub.avg_r
FROM (
    SELECT lawyer_id, COUNT(*) AS cnt, AVG(rating) AS avg_r
    FROM Reviews
    GROUP BY lawyer_id
) sub
WHERE lp.user_id = sub.lawyer_id;

*/

-- =============================================================================
-- END OF FILE
-- =============================================================================