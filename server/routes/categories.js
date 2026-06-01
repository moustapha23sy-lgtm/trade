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

// GET /api/categories — All categories (with subcategories)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_published = true) as product_count
      FROM categories c
      WHERE c.is_active = true
      ORDER BY c.sort_order, c.name
    `);

    // Organize into tree structure
    const parents = rows.filter(c => !c.parent_id);
    const tree = parents.map(parent => ({
      ...parent,
      children: rows.filter(c => c.parent_id === parent.id),
    }));

    res.json({ categories: tree, all: rows });
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }

    const category = rows[0];

    // Get subcategories
    const { rows: children } = await pool.query(
      'SELECT * FROM categories WHERE parent_id = $1 AND is_active = true ORDER BY sort_order',
      [category.id]
    );

    res.json({ category: { ...category, children } });
  } catch (err) {
    console.error('Category detail error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/categories — Create (admin)
router.post('/', auth, adminOnly, [
  body('name').notEmpty().withMessage('Nom de catégorie requis'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, image_url, parent_id, sort_order } = req.body;
    const slug = slugify(name);

    const { rows } = await pool.query(`
      INSERT INTO categories (name, slug, description, image_url, parent_id, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, slug, description || null, image_url || null, parent_id || null, sort_order || 0]);

    res.status(201).json({ category: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cette catégorie existe déjà.' });
    }
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/categories/:id — Update (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, image_url, parent_id, sort_order, is_active } = req.body;

    const { rows } = await pool.query(`
      UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        image_url = $4,
        parent_id = $5,
        sort_order = COALESCE($6, sort_order),
        is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING *
    `, [
      name, name ? slugify(name) : null,
      description, image_url || null,
      parent_id || null, sort_order,
      is_active, parseInt(req.params.id),
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }

    res.json({ category: rows[0] });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/categories/:id — Delete (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [parseInt(req.params.id)]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }

    res.json({ message: 'Catégorie supprimée.' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
