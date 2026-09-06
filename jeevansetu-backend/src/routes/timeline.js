const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

router.get('/:patientId', verifyToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const consultations = await db.query('SELECT * FROM consultations WHERE patient_id = $1', [patientId]);
    const followups = await db.query('SELECT * FROM followups WHERE patient_id = $1', [patientId]);

    const timeline = [
      ...consultations.rows.map(c => ({ type: 'consultation', date: c.created_at, ...c })),
      ...followups.rows.map(f => ({ type: 'followup', date: f.due_date, ...f }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;