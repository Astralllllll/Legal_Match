import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET: Fetch matches for a lawyer dashboard
router.get('/lawyer/:lawyerId', async (req, res) => {
  const { lawyerId } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!lawyerId) {
    return res.status(400).json({ error: "lawyerId is required." });
  }

  if (!uuidRegex.test(lawyerId)) {
    return res.status(400).json({ error: "lawyerId must be a valid UUID." });
  }

  try {
    const queryText = `
      SELECT
        m.match_id,
        CASE
          WHEN LOWER(m.status) = 'pending' THEN 'requested'
          ELSE LOWER(m.status)
        END AS status,
        m.created_at,
        m.updated_at,
        m.similarity_score,
        ci.issue_title,
        ci.legal_category,
        ci.client_id,
        u.email AS client_email,
        TRIM(
          REGEXP_REPLACE(
            INITCAP(
              REPLACE(
                REPLACE(
                  SPLIT_PART(COALESCE(u.email, ''), '@', 1),
                  '.',
                  ' '
                ),
                '_',
                ' '
              )
            ),
            '\\s+',
            ' ',
            'g'
          )
        ) AS client_display_name,
        AVG(r.rating)::numeric(3,2) AS rating,
        COUNT(r.review_id)::int AS review_count
      FROM Matches m
      LEFT JOIN ClientIssues ci ON ci.issue_id = m.issue_id
      LEFT JOIN Users u ON u.user_id = m.client_id
      LEFT JOIN Reviews r ON r.match_id = m.match_id
      WHERE m.lawyer_id = $1
      GROUP BY
        m.match_id,
        m.status,
        m.created_at,
        m.updated_at,
        m.similarity_score,
        ci.issue_title,
        ci.legal_category,
        ci.client_id,
        u.email
      ORDER BY COALESCE(m.updated_at, m.created_at) DESC;
    `;

    const result = await pool.query(queryText, [lawyerId]);

    return res.json({
      cases: result.rows,
    });
  } catch (err) {
    console.error("Error fetching lawyer matches:", err.message);
    return res.status(500).json({ error: "Server error while fetching lawyer cases." });
  }
});

// POST: Generate matches for a specific client issue
router.post('/generate', async (req, res) => {
  const { client_id, issue_id, issue_text } = req.body;

  if (!client_id || !issue_id || !issue_text) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 💡 FUTURE NLP HOOK: Here, your backend will send 'issue_text' to your NLP model 
    // (e.g., HuggingFace or OpenAI) to generate the 768-dimensional vector array.
    // We are using a dummy array of 768 zeros so your current database schema accepts it.
    const issueVector = Array(768).fill(0.1); 

    // 1. Execute the Cosine Similarity Query in PostgreSQL
    // We use the <=> operator for cosine distance. We LIMIT to the top 5 matches.
    const findMatchesQuery = `
      SELECT 
        user_id AS lawyer_id,
        full_name,
        lsk_registration_number,
        biography,
        years_of_experience,
        specializations,
        academic_qualifications,
        courts,
        languages,
        price_guidance,
        average_rating,
        total_reviews,
        1 - (profile_embedding <=> $1::vector) AS similarity_score
      FROM LawyerProfiles
      ORDER BY profile_embedding <=> $1::vector
      LIMIT 5;
    `;
    
    const vectorString = JSON.stringify(issueVector);
    const topLawyers = await pool.query(findMatchesQuery, [vectorString]);

    if (topLawyers.rows.length === 0) {
      return res.status(404).json({ message: "No suitable lawyers found." });
    }

    // 2. Save these matches into the 'Matches' transactional table
    const savedMatches = [];
    for (const lawyer of topLawyers.rows) {
      const insertMatchQuery = `
        INSERT INTO Matches (client_id, lawyer_id, issue_id, similarity_score, status)
        VALUES ($1, $2, $3, $4, 'Pending')
        RETURNING *;
      `;
      const matchValues = [client_id, lawyer.lawyer_id, issue_id, lawyer.similarity_score];
      const result = await pool.query(insertMatchQuery, matchValues);
      
      // Combine the lawyer details with the match record to send back to React
      savedMatches.push({
        ...result.rows[0],
        full_name: lawyer.full_name,
        lsk_registration_number: lawyer.lsk_registration_number,
        biography: lawyer.biography,
        years_of_experience: lawyer.years_of_experience,
        specializations: lawyer.specializations,
        academic_qualifications: lawyer.academic_qualifications,
        courts: lawyer.courts,
        languages: lawyer.languages,
        price_guidance: lawyer.price_guidance,
        average_rating: lawyer.average_rating,
        total_reviews: lawyer.total_reviews,
      });
    }

    // 3. Return the saved matches to the frontend
    res.status(200).json({
      message: "Matches generated successfully",
      matches: savedMatches
    });

  } catch (err) {
    console.error("Error generating matches:", err.message);
    res.status(500).json({ error: "Server error while generating matches" });
  }
});

export default router;