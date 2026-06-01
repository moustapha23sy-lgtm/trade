import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/cart — Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        ci.id, ci.quantity,
        p.id as product_id, p.name, p.slug, p.price, p.original_price,
        p.stock_quantity, p.stock_status,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [req.user.id]);

    const total = rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ items: rows, total, count: rows.length });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/cart — Add to cart
router.post('/', auth, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // Check product exists and is in stock
    const { rows: products } = await pool.query(
      'SELECT id, stock_status FROM products WHERE id = $1 AND is_published = true',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    if (products[0].stock_status === 'out_of_stock') {
      return res.status(400).json({ error: 'Produit en rupture de stock.' });
    }

    // Upsert: increase quantity if already in cart
    const { rows } = await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + $3
      RETURNING *
    `, [req.user.id, product_id, quantity]);

    res.status(201).json({ item: rows[0] });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/cart/:id — Update quantity
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantité invalide.' });
    }

    const { rows } = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, parseInt(req.params.id), req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé dans le panier.' });
    }

    res.json({ item: rows[0] });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/cart/:id — Remove from cart
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id), req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Article non trouvé dans le panier.' });
    }

    res.json({ message: 'Article retiré du panier.' });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/cart — Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Panier vidé.' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
