import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST /api/profiles/lawyer
// Creates or updates a lawyer profile.
// Called by LawyerOnboarding.jsx via authApi.js → saveLawyerProfile().
// All new columns from the updated schema are handled here.
router.post('/lawyer', async (req, res) => {
  const {
    // Required
    user_id,
    lsk_registration_number,

    // Step 1 — Personal & Education
    full_name,
    biography,
    academic_qualifications,
    institutions,
    graduation_year,
    bar_admission_year,
    courts,
    languages,

    // Step 2 — Practice
    specializations,
    years_of_experience,
    firm_name,

    // Step 3 — Case history & fees
    case_type_descriptions,
    previous_cases_handled,
    success_rate,
    price_guidance,

    // TF-IDF searchable blob built by buildProfileText() in LawyerOnboarding.jsx
    profile_text,
  } = req.body;

  if (!user_id || !lsk_registration_number) {
    return res.status(400).json({ error: "user_id and lsk_registration_number are required." });
  }

  try {
    // Placeholder embedding until the real NLP model is wired in.
    // Dimensions must match the VECTOR(768) column in LawyerProfiles.
    const dummyEmbedding = JSON.stringify(Array(768).fill(0.0));

    const queryText = `
      INSERT INTO LawyerProfiles (
        user_id,
        lsk_registration_number,
        full_name,
        biography,
        academic_qualifications,
        institutions,
        graduation_year,
        bar_admission_year,
        courts,
        languages,
        specializations,
        years_of_experience,
        firm_name,
        case_type_descriptions,
        previous_cases_handled,
        success_rate,
        price_guidance,
        profile_text,
        profile_embedding
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      ON CONFLICT (lsk_registration_number)
      DO UPDATE SET
        full_name               = EXCLUDED.full_name,
        biography               = EXCLUDED.biography,
        academic_qualifications = EXCLUDED.academic_qualifications,
        institutions            = EXCLUDED.institutions,
        graduation_year         = EXCLUDED.graduation_year,
        bar_admission_year      = EXCLUDED.bar_admission_year,
        courts                  = EXCLUDED.courts,
        languages               = EXCLUDED.languages,
        specializations         = EXCLUDED.specializations,
        years_of_experience     = EXCLUDED.years_of_experience,
        firm_name               = EXCLUDED.firm_name,
        case_type_descriptions  = EXCLUDED.case_type_descriptions,
        previous_cases_handled  = EXCLUDED.previous_cases_handled,
        success_rate            = EXCLUDED.success_rate,
        price_guidance          = EXCLUDED.price_guidance,
        profile_text            = EXCLUDED.profile_text,
        profile_embedding       = EXCLUDED.profile_embedding
      RETURNING *;
    `;

    const values = [
      user_id,
      lsk_registration_number,
      full_name             ?? null,
      biography             ?? null,
      academic_qualifications ?? null,
      institutions          ?? null,
      graduation_year       ? Number(graduation_year)        : null,
      bar_admission_year    ? Number(bar_admission_year)     : null,
      courts                ?? null,
      languages             ?? null,
      specializations       ?? null,
      years_of_experience !== undefined && years_of_experience !== ""
        ? parseInt(years_of_experience)  : null,
      firm_name             ?? null,
      case_type_descriptions ?? null,
      previous_cases_handled !== undefined && previous_cases_handled !== ""
        ? parseInt(previous_cases_handled) : null,
      success_rate !== undefined && success_rate !== ""
        ? Number(success_rate) : null,
      price_guidance        ?? null,
      profile_text          ?? null,
      dummyEmbedding,
    ];

    const result = await pool.query(queryText, values);

    return res.status(200).json({
      message: "Lawyer profile saved successfully.",
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("Error saving lawyer profile:", err.message);
    return res.status(500).json({ error: "Server error while saving profile." });
  }
});

export default router;