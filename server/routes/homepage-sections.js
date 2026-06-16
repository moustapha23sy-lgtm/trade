import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

const VALID_SECTIONS = ['trending', 'electro'];

// GET /api/homepage-sections/:key — Get products for a section (public)
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  if (!VALID_SECTIONS.includes(key)) {
    return res.status(400).json({ error: 'Section invalide.' });
  }
  try {
    const { rows } = await pool.query(`
      SELECT 
        hs.id as section_id, hs.position,
        p.id, p.slug, p.name, p.price, p.original_price, p.badge, p.stock_status,
        p.description,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM homepage_sections hs
      JOIN products p ON hs.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE hs.section_key = $1
      ORDER BY hs.position ASC, hs.created_at ASC
    `, [key]);
    res.json({ products: rows });
  } catch (err) {
    console.error('Get section error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/homepage-sections/:key — Add a product to a section (admin)
router.post('/:key', auth, adminOnly, async (req, res) => {
  const { key } = req.params;
  if (!VALID_SECTIONS.includes(key)) {
    return res.status(400).json({ error: 'Section invalide.' });
  }
  try {
    const { product_id, position = 0 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id requis.' });

    const { rows } = await pool.query(`
      INSERT INTO homepage_sections (section_key, product_id, position)
      VALUES ($1, $2, $3)
      ON CONFLICT (section_key, product_id) DO UPDATE SET position = $3
      RETURNING *
    `, [key, product_id, position]);

    res.status(201).json({ entry: rows[0] });
  } catch (err) {
    console.error('Add to section error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/homepage-sections/:key/:productId — Remove a product from a section (admin)
router.delete('/:key/:productId', auth, adminOnly, async (req, res) => {
  const { key, productId } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM homepage_sections WHERE section_key = $1 AND product_id = $2',
      [key, parseInt(productId)]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Produit non trouvé dans cette section.' });
    res.json({ message: 'Produit retiré de la section.' });
  } catch (err) {
    console.error('Remove from section error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/homepage-sections/:key/available — Products NOT yet in section (admin)
router.get('/:key/available/search', auth, adminOnly, async (req, res) => {
  const { key } = req.params;
  const { q = '' } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.description, p.price,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id NOT IN (
        SELECT product_id FROM homepage_sections WHERE section_key = $1
      )
      AND ($2 = '' OR p.name ILIKE $3)
      ORDER BY p.name ASC
      LIMIT 30
    `, [key, q, `%${q}%`]);
    res.json({ products: rows });
  } catch (err) {
    console.error('Search available error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
