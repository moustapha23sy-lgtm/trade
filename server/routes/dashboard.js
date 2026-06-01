import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// GET /api/dashboard/stats — Admin dashboard statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    // Total revenue
    const { rows: revenueRows } = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE payment_status = 'paid'
    `);

    // Revenue this month
    const { rows: monthlyRows } = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue
      FROM orders
      WHERE payment_status = 'paid'
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `);

    // Total orders
    const { rows: orderCountRows } = await pool.query(
      'SELECT COUNT(*) as total FROM orders'
    );

    // Pending orders
    const { rows: pendingRows } = await pool.query(
      "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'"
    );

    // Total products
    const { rows: productCountRows } = await pool.query(
      'SELECT COUNT(*) as total FROM products'
    );

    // Published products
    const { rows: publishedRows } = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE is_published = true'
    );

    // Low stock products (quantity <= 5)
    const { rows: lowStockRows } = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE stock_quantity <= 5 AND stock_quantity > 0'
    );

    // Out of stock products
    const { rows: outOfStockRows } = await pool.query(
      "SELECT COUNT(*) as total FROM products WHERE stock_status = 'out_of_stock' OR stock_quantity = 0"
    );

    // Total customers
    const { rows: customerRows } = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'customer'"
    );

    // Recent orders (last 5)
    const { rows: recentOrders } = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.payment_status, o.created_at,
        u.first_name, u.last_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Top selling products (last 30 days)
    const { rows: topProducts } = await pool.query(`
      SELECT 
        p.id, p.name, p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Orders by status
    const { rows: statusBreakdown } = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    // Monthly sales (last 6 months)
    const { rows: monthlySales } = await pool.query(`
      SELECT 
        TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY month
    `);

    res.json({
      stats: {
        total_revenue: parseInt(revenueRows[0].total_revenue),
        monthly_revenue: parseInt(monthlyRows[0].monthly_revenue),
        total_orders: parseInt(orderCountRows[0].total),
        pending_orders: parseInt(pendingRows[0].total),
        total_products: parseInt(productCountRows[0].total),
        published_products: parseInt(publishedRows[0].total),
        low_stock: parseInt(lowStockRows[0].total),
        out_of_stock: parseInt(outOfStockRows[0].total),
        total_customers: parseInt(customerRows[0].total),
      },
      recent_orders: recentOrders,
      top_products: topProducts,
      status_breakdown: statusBreakdown,
      monthly_sales: monthlySales,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
