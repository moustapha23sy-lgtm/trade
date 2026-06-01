import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// GET /api/users - Admin only (get all users)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, first_name, last_name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json({ users: rows });
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/users/:id/role - Admin only
router.put('/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide.' });
    }

    const { rows } = await pool.query(`
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING id, first_name, last_name, email, role
    `, [role, parseInt(req.params.id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/users - Admin only (create user)
router.post('/', auth, adminOnly, [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('first_name').notEmpty().withMessage('Prénom requis'),
  body('last_name').notEmpty().withMessage('Nom requis'),
  body('role').isIn(['customer', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, role } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, password_hash, first_name, last_name, role]
    );

    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/users/:id - Admin only (edit user params)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    
    // Check if email taken by another user
    if (email) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, parseInt(req.params.id)]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte.' });
      }
    }

    const { rows } = await pool.query(`
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 
      RETURNING id, first_name, last_name, email, role, created_at
    `, [first_name, last_name, email, role, parseInt(req.params.id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
