import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST: Submit a new free-text client legal issue
router.post('/', async (req, res) => {
  const { client_id, issue_title, issue_description, budget_range } = req.body;

  // Basic validation to protect the database integrity
  if (!client_id || !issue_title || !issue_description) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const queryText = `
      INSERT INTO ClientIssues (client_id, issue_title, issue_description, budget_range, status)
      VALUES ($1, $2, $3, $4, 'Open')
      RETURNING *;
    `;
    
    const values = [client_id, issue_title, issue_description, budget_range];
    const result = await pool.query(queryText, values);

    res.status(201).json({
      message: "Legal issue submitted successfully",
      issue: result.rows[0]
    });

  } catch (err) {
    console.error("Error submitting client issue:", err.message);
    res.status(500).json({ error: "Server error while submitting your issue" });
  }
});

export default router;