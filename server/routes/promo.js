import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// GET /api/promo/active — Public endpoint to get active promo for front banner
router.get('/active', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT code, type, value, expires_at 
      FROM promo_codes 
      WHERE is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses IS NULL OR current_uses < max_uses)
      ORDER BY created_at DESC
      LIMIT 1
    `);
    if (rows.length === 0) {
      return res.json({ promo: null });
    }
    res.json({ promo: rows[0] });
  } catch (err) {
    console.error('Get active promo error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/promo/validate — Validate a promo code (public)
router.post('/validate', async (req, res) => {
  try {
    const { code, order_total = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code promo requis.' });
    }

    const { rows } = await pool.query(`
      SELECT * FROM promo_codes 
      WHERE code = $1 AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (max_uses IS NULL OR current_uses < max_uses)
    `, [code.toUpperCase()]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Code promo invalide ou expiré.' });
    }

    const promo = rows[0];

    if (order_total < promo.min_order_amount) {
      return res.status(400).json({ 
        error: `Montant minimum de commande : ${promo.min_order_amount} FCFA.` 
      });
    }

    const discount = promo.type === 'percentage'
      ? Math.floor(order_total * promo.value / 100)
      : promo.value;

    res.json({
      valid: true,
      promo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discount,
      },
    });
  } catch (err) {
    console.error('Validate promo error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/promo — All promo codes (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM promo_codes ORDER BY created_at DESC'
    );
    res.json({ promos: rows });
  } catch (err) {
    console.error('Get promos error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/promo — Create promo code (admin)
router.post('/', auth, adminOnly, [
  body('code').notEmpty().withMessage('Code requis'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Type invalide'),
  body('value').isInt({ min: 1 }).withMessage('Valeur invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, type, value, min_order_amount, max_uses, expires_at } = req.body;

    const { rows } = await pool.query(`
      INSERT INTO promo_codes (code, type, value, min_order_amount, max_uses, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      code.toUpperCase(), type, value,
      min_order_amount || 0, max_uses || null, expires_at || null,
    ]);

    res.status(201).json({ promo: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ce code promo existe déjà.' });
    }
    console.error('Create promo error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/promo/:id — Update promo (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { code, type, value, min_order_amount, max_uses, expires_at, is_active } = req.body;

    const { rows } = await pool.query(`
      UPDATE promo_codes SET
        code = COALESCE($1, code),
        type = COALESCE($2, type),
        value = COALESCE($3, value),
        min_order_amount = COALESCE($4, min_order_amount),
        max_uses = $5,
        expires_at = $6,
        is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING *
    `, [
      code ? code.toUpperCase() : null, type, value,
      min_order_amount, max_uses || null, expires_at || null,
      is_active, parseInt(req.params.id),
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Code promo non trouvé.' });
    }

    res.json({ promo: rows[0] });
  } catch (err) {
    console.error('Update promo error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/promo/:id — Delete promo (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM promo_codes WHERE id = $1',
      [parseInt(req.params.id)]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Code promo non trouvé.' });
    }

    res.json({ message: 'Code promo supprimé.' });
  } catch (err) {
    console.error('Delete promo error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
