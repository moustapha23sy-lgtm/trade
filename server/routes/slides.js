import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// GET /api/slides — Active slides (public)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM hero_slides WHERE is_active = true ORDER BY sort_order'
    );
    res.json({ slides: rows });
  } catch (err) {
    console.error('Get slides error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/slides/all — All slides (admin)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM hero_slides ORDER BY sort_order'
    );
    res.json({ slides: rows });
  } catch (err) {
    console.error('Get all slides error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/slides — Create slide (admin)
router.post('/', auth, adminOnly, [
  body('title').notEmpty().withMessage('Titre requis'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tag, title, title_highlight, subtitle, cta_text, cta_link, image_url, sort_order } = req.body;

    const { rows } = await pool.query(`
      INSERT INTO hero_slides (tag, title, title_highlight, subtitle, cta_text, cta_link, image_url, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      tag || null, title, title_highlight || null,
      subtitle || null, cta_text || 'Découvrir', cta_link || '#',
      image_url || null, sort_order || 0,
    ]);

    res.status(201).json({ slide: rows[0] });
  } catch (err) {
    console.error('Create slide error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/slides/:id — Update slide (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { tag, title, title_highlight, subtitle, cta_text, cta_link, image_url, sort_order, is_active } = req.body;

    const { rows } = await pool.query(`
      UPDATE hero_slides SET
        tag = COALESCE($1, tag),
        title = COALESCE($2, title),
        title_highlight = COALESCE($3, title_highlight),
        subtitle = COALESCE($4, subtitle),
        cta_text = COALESCE($5, cta_text),
        cta_link = COALESCE($6, cta_link),
        image_url = $7,
        sort_order = COALESCE($8, sort_order),
        is_active = COALESCE($9, is_active)
      WHERE id = $10
      RETURNING *
    `, [
      tag, title, title_highlight, subtitle,
      cta_text, cta_link, image_url || null,
      sort_order, is_active, parseInt(req.params.id),
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Slide non trouvé.' });
    }

    res.json({ slide: rows[0] });
  } catch (err) {
    console.error('Update slide error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/slides/:id — Delete slide (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM hero_slides WHERE id = $1',
      [parseInt(req.params.id)]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Slide non trouvé.' });
    }

    res.json({ message: 'Slide supprimé.' });
  } catch (err) {
    console.error('Delete slide error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
