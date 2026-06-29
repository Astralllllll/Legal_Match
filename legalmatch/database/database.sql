-- 1. DATABASE SETUP
-- CREATE DATABASE legal_matching_db;
-- \c legal_matching_db;

-- Enable pgvector for NLP text-matching via cosine similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. CORE ANCHOR TABLE
CREATE TABLE Users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Client', 'Lawyer', 'Admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SPECIALIZED PROFILE TABLES
CREATE TABLE Admins (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LawyerProfiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    lsk_registration_number VARCHAR(100) UNIQUE NOT NULL,
    academic_qualifications TEXT,
    years_of_experience INT,
    specializations TEXT,
    case_type_descriptions TEXT,
    -- The vector column dimensions (e.g., 768) should match your chosen NLP model's output
    profile_embedding VECTOR(768), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONAL TABLES
CREATE TABLE ClientIssues (
    issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    issue_title VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    budget_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES ClientIssues(issue_id) ON DELETE CASCADE,
    similarity_score FLOAT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES Matches(match_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AnalyticsReports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES Admins(admin_id) ON DELETE CASCADE,
    report_title VARCHAR(255) NOT NULL,
    report_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEXES FOR PERFORMANCE OPTIMIZATION
-- Vector index for fast cosine similarity searches (using vector_cosine_ops)
CREATE INDEX idx_lawyer_profile_embedding ON LawyerProfiles 
USING ivfflat (profile_embedding vector_cosine_ops) WITH (lists = 100);

-- Standard indexes for read-heavy foreign key lookups
CREATE INDEX idx_lawyerprofiles_user_id ON LawyerProfiles(user_id);
CREATE INDEX idx_clientissues_client_id ON ClientIssues(client_id);
CREATE INDEX idx_matches_client_id ON Matches(client_id);
CREATE INDEX idx_matches_lawyer_id ON Matches(lawyer_id);
CREATE INDEX idx_matches_issue_id ON Matches(issue_id);
CREATE INDEX idx_reviews_lawyer_id ON Reviews(lawyer_id);
CREATE INDEX idx_reviews_client_id ON Reviews(client_id);