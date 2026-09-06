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
       (role, hospital_id, email, phone, password_hash, registration_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, role, hospital_id, email, phone, registration_status`,
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

    if (user.registration_status === 'pending') {
      return res.status(403).json({
        error: 'Your registration is pending approval'
      });
    }

    if (user.registration_status === 'rejected') {
      return res.status(403).json({
        error: 'Your registration has been rejected'
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
        `SELECT id, role, hospital_id, email, phone, registration_status, created_at
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
        'receptionist',
        'admin',
        'super_admin'
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role'
        });
      }

      // Admin can manage doctors and receptionists,
      // but cannot create/promote another Admin or Super Admin.
      if (
        req.user.role === 'admin' &&
        (role === 'admin' || role === 'super_admin')
      ) {
        return res.status(403).json({
          error: 'Admin cannot assign this role'
        });
      }

      // Only Super Admin can assign the Super Admin role.
      if (
        role === 'super_admin' &&
        req.user.role !== 'super_admin'
      ) {
        return res.status(403).json({
          error: 'Only Super Admin can assign Super Admin role'
        });
      }
            
      const targetResult = await db.query(
     `SELECT id, role
      FROM users
      WHERE id = $1`,
  [id]
);

if (targetResult.rows.length === 0) {
  return res.status(404).json({
    error: 'User not found'
  });
}

const targetUser = targetResult.rows[0];

if (
  targetUser.role === 'super_admin' &&
  req.user.role !== 'super_admin'
) {
  return res.status(403).json({
    error: 'Admin cannot modify Super Admin'
  });
}


      const result = await db.query(
        `UPDATE users
         SET role = $1
         WHERE id = $2
         RETURNING id, role, hospital_id, email, phone, registration_status`,
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
router.patch(
  '/users/:id/registration-status',
  verifyToken,
  requireRole('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { registration_status } = req.body;
      const { id } = req.params;

      const allowedStatuses = [
        'pending',
        'approved',
        'rejected'
      ];

      if (!allowedStatuses.includes(registration_status)) {
        return res.status(400).json({
          error: 'Invalid registration status'
        });
      }

      const result = await db.query(
        `UPDATE users
         SET registration_status = $1
         WHERE id = $2
         RETURNING id, role, hospital_id, email, phone, registration_status`,
        [registration_status, id]
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
        error: 'Failed to update registration status'
      });
    }
  }
);
module.exports = router;