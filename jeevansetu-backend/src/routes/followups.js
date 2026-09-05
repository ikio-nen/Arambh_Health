const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { patientId, consultationId, dueDate, notes } = req.body;
    const result = await db.query(
      `INSERT INTO followups (patient_id, consultation_id, due_date, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, consultationId, dueDate, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:patientId', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM followups WHERE patient_id = $1', [req.params.patientId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;