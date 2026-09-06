const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { createAuditLog } = require('../utils/auditLog');

router.post('/', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const { patientId, chiefComplaint, history, symptoms, physicalExam } = req.body;
    const result = await db.query(
      `INSERT INTO consultations (patient_id, doctor_id, chief_complaint, history, symptoms, physical_exam)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [patientId, req.user.id, chiefComplaint, history, symptoms, physicalExam]
    );
    await createAuditLog(req.user.id, 'CONSULTATION_CREATED', patientId);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM consultations WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const { chiefComplaint, history, symptoms, physicalExam } = req.body;
    const result = await db.query(
      `UPDATE consultations SET
       chief_complaint = COALESCE($1, chief_complaint),
       history = COALESCE($2, history),
       symptoms = COALESCE($3, symptoms),
       physical_exam = COALESCE($4, physical_exam)
       WHERE id = $5 RETURNING *`,
      [chiefComplaint, history, symptoms, physicalExam, req.params.id]
    );
    await createAuditLog(req.user.id, 'CONSULTATION_UPDATED', result.rows[0].patient_id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;