import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// POST /api/contact - Public
router.post('/', [
  body('name').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('message').notEmpty().withMessage('Message requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    const { rows } = await pool.query(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, email, subject || '', message]);

    res.status(201).json({ message: 'Message envoyé avec succès.', data: rows[0] });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

// GET /api/contact - Admin only
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ messages: rows });
  } catch (err) {
    console.error('Fetch contact messages error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/contact/:id/status - Admin only
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(`
      UPDATE contact_messages 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `, [status, parseInt(req.params.id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Message non trouvé.' });
    }

    res.json({ message: rows[0] });
  } catch (err) {
    console.error('Update contact message status error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
