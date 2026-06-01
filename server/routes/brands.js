import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/brands
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id AND p.is_published = true) as product_count
      FROM brands b
      ORDER BY b.name
    `);
    res.json({ brands: rows });
  } catch (err) {
    console.error('Brands error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/brands
router.post('/', auth, adminOnly, [
  body('name').notEmpty().withMessage('Nom de marque requis'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, logo_url } = req.body;
    const slug = slugify(name);

    const { rows } = await pool.query(
      'INSERT INTO brands (name, slug, logo_url) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, logo_url || null]
    );

    res.status(201).json({ brand: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cette marque existe déjà.' });
    }
    console.error('Create brand error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/brands/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, logo_url } = req.body;

    const { rows } = await pool.query(`
      UPDATE brands SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        logo_url = $3
      WHERE id = $4
      RETURNING *
    `, [name, name ? slugify(name) : null, logo_url || null, parseInt(req.params.id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Marque non trouvée.' });
    }

    res.json({ brand: rows[0] });
  } catch (err) {
    console.error('Update brand error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/brands/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM brands WHERE id = $1', [parseInt(req.params.id)]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Marque non trouvée.' });
    }

    res.json({ message: 'Marque supprimée.' });
  } catch (err) {
    console.error('Delete brand error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
