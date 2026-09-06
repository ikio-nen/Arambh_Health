const express = require('express');
const router = express.Router();

const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

router.post('/signup', async (req, res) => {
  try {
    const { email, phone, password, hospital_id } = req.body;

    // Public signup can only create patient accounts
    const role = 'patient';

    const password_hash = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users
       (role, hospital_id, email, phone, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, role, hospital_id, email, phone`,
      [role, hospital_id, email, phone, password_hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (
      !user ||
      !(await comparePassword(password, user.password_hash))
    ) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    res.json({
      token: signToken(user)
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Login failed'
    });
  }
});

router.get('/verify', verifyToken, (req, res) => {
  res.json({
    user: req.user
  });
});


router.get(
  '/users',
  verifyToken,
  requireRole('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT id, role, hospital_id, email, phone, created_at
         FROM users
         ORDER BY created_at DESC`
      );

      res.json(result.rows);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: 'Failed to fetch users'
      });
    }
  }
);

router.patch(
  '/users/:id/role',
  verifyToken,
  requireRole('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { role } = req.body;
      const { id } = req.params;

      const allowedRoles = [
        'patient',
        'doctor',
        'admin',
        'super_admin'
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role'
        });
      }

      const result = await db.query(
        `UPDATE users
         SET role = $1
         WHERE id = $2
         RETURNING id, role, hospital_id, email, phone`,
        [role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Failed to update user role'
      });
    }
  }
);

module.exports = router;