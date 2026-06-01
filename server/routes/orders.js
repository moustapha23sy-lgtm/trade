import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// POST /api/orders/guest — Place an order for non-logged-in users
router.post('/guest', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      firstName, lastName, email, phone, address, city,
      items, // [{ product_id, quantity, unit_price, name }]
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide.' });
    }

    await client.query('BEGIN');

    const subtotal = items.reduce((sum, i) => sum + (i.unit_price || 0) * i.quantity, 0);

    // Apply promo code if provided
    let discount_amount = 0;
    if (req.body.promo_code) {
      const { rows: promos } = await client.query(
        `SELECT * FROM promo_codes WHERE code = $1 AND is_active = true 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR current_uses < max_uses)`,
        [req.body.promo_code]
      );

      if (promos.length > 0) {
        const promo = promos[0];
        if (subtotal >= promo.min_order_amount) {
          discount_amount = promo.type === 'percentage'
            ? Math.floor(subtotal * promo.value / 100)
            : promo.value;
          
          // Increment usage
          await client.query(
            'UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = $1',
            [promo.id]
          );
        }
      }
    }

    const total_amount = subtotal - discount_amount;

    const { rows: orderRows } = await client.query(`
      INSERT INTO orders (user_id, total_amount, shipping_first_name, shipping_last_name,
        shipping_address, shipping_city, shipping_phone, shipping_email, payment_method, promo_code, discount_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      null, total_amount,
      firstName || '', lastName || '',
      address || '', city || '',
      phone || '', email || '',
      'cash', req.body.promo_code || null, discount_amount
    ]);

    const order = orderRows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
        VALUES ($1, $2, $3, $4, $5)
      `, [order.id, item.product_id, item.name || 'Produit', item.quantity, item.unit_price || 0]);

      if (item.product_id) {
        await client.query(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Guest order error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  } finally {
    client.release();
  }
});

// POST /api/orders — Place an order (authenticated users)
router.post('/', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      shipping_first_name, shipping_last_name,
      shipping_address, shipping_city,
      shipping_phone, shipping_email,
      payment_method, promo_code, notes,
    } = req.body;

    await client.query('BEGIN');

    // Get cart items
    const { rows: cartItems } = await client.query(`
      SELECT ci.*, p.name as product_name, p.price, p.stock_quantity, p.stock_status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `, [req.user.id]);

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Votre panier est vide.' });
    }

    // Check stock and calculate total
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.stock_status === 'out_of_stock') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `${item.product_name} est en rupture de stock.` });
      }
      if (item.quantity > item.stock_quantity && item.stock_status !== 'on_backorder') {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Stock insuffisant pour ${item.product_name}. Disponible: ${item.stock_quantity}` 
        });
      }
      subtotal += item.price * item.quantity;
    }

    // Apply promo code if provided
    let discount_amount = 0;
    if (promo_code) {
      const { rows: promos } = await client.query(
        `SELECT * FROM promo_codes WHERE code = $1 AND is_active = true 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR current_uses < max_uses)`,
        [promo_code]
      );

      if (promos.length > 0) {
        const promo = promos[0];
        if (subtotal >= promo.min_order_amount) {
          discount_amount = promo.type === 'percentage'
            ? Math.floor(subtotal * promo.value / 100)
            : promo.value;
          
          // Increment usage
          await client.query(
            'UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = $1',
            [promo.id]
          );
        }
      }
    }

    const total_amount = subtotal - discount_amount;

    // Create order
    const { rows: orderRows } = await client.query(`
      INSERT INTO orders (user_id, total_amount, shipping_first_name, shipping_last_name,
        shipping_address, shipping_city, shipping_phone, shipping_email,
        payment_method, promo_code, discount_amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      req.user.id, total_amount,
      shipping_first_name, shipping_last_name,
      shipping_address, shipping_city,
      shipping_phone, shipping_email,
      payment_method || 'cash', promo_code || null,
      discount_amount, notes || null,
    ]);

    const order = orderRows[0];

    // Create order items and update stock
    for (const item of cartItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
        VALUES ($1, $2, $3, $4, $5)
      `, [order.id, item.product_id, item.product_name, item.quantity, item.price]);

      // Decrease stock
      await client.query(`
        UPDATE products SET stock_quantity = stock_quantity - $1
        WHERE id = $2
      `, [item.quantity, item.product_id]);
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  } finally {
    client.release();
  }
});

// GET /api/orders — My orders
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id, 'product_name', oi.product_name,
          'quantity', oi.quantity, 'unit_price', oi.unit_price,
          'product_id', oi.product_id
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json({ orders: rows });
  } catch (err) {
    console.error('My orders error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/orders/all — All orders (admin)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause = `WHERE o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`, params
    );
    const total = parseInt(countRows[0].total);

    const { rows } = await pool.query(`
      SELECT o.*,
        u.first_name, u.last_name, u.email,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, parseInt(limit), offset]);

    res.json({
      orders: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('All orders error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/orders/:id — Order detail (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    const queryCondition = req.user.role === 'admin' 
      ? 'WHERE o.id = $1' 
      : 'WHERE o.id = $1 AND o.user_id = $2';
    const queryParams = req.user.role === 'admin' 
      ? [orderId] 
      : [orderId, req.user.id];

    const { rows } = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email, u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${queryCondition}
    `, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    const order = rows[0];

    const { rows: items } = await pool.query(`
      SELECT oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1) as product_image
      FROM order_items oi
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({ order: { ...order, items } });
  } catch (err) {
    console.error('Order detail error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/orders/:id/status — Update order status (admin)
router.put('/:id/status', auth, adminOnly, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Statut invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, payment_status } = req.body;

    let query = 'UPDATE orders SET status = $1';
    const params = [status];
    
    if (payment_status) {
      query += ', payment_status = $2 WHERE id = $3 RETURNING *';
      params.push(payment_status, parseInt(req.params.id));
    } else {
      query += ' WHERE id = $2 RETURNING *';
      params.push(parseInt(req.params.id));
    }

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // If cancelled, restore stock
    if (status === 'cancelled') {
      const { rows: items } = await pool.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [parseInt(req.params.id)]
      );
      for (const item of items) {
        await pool.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }

    res.json({ order: rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
