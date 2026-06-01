import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/wishlist — Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        w.id, w.created_at,
        p.id as product_id, p.name, p.slug, p.price, p.original_price, p.badge,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    res.json({ items: rows });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/wishlist — Add to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { product_id } = req.body;

    const { rows: products } = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND is_published = true',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    const { rows } = await pool.query(`
      INSERT INTO wishlist (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `, [req.user.id, product_id]);

    res.status(201).json({ item: rows[0] || { user_id: req.user.id, product_id } });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/wishlist/:productId — Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM wishlist WHERE product_id = $1 AND user_id = $2',
      [parseInt(req.params.productId), req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Produit non trouvé dans les favoris.' });
    }

    res.json({ message: 'Retiré des favoris.' });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
