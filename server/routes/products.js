import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// Helper: slugify
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/products — List with pagination, filters, search
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      category,
      brand,
      search,
      min_price,
      max_price,
      stock_status,
      badge,
      featured,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['p.is_published = true'];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`c.id IN (
        WITH RECURSIVE descendants AS (
          SELECT id FROM categories WHERE slug = $${paramIndex}
          UNION ALL
          SELECT cat.id FROM categories cat
          INNER JOIN descendants d ON cat.parent_id = d.id
        )
        SELECT id FROM descendants
      )`);
      params.push(category);
      paramIndex++;
    }

    if (brand) {
      conditions.push(`b.slug = $${paramIndex}`);
      params.push(brand);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (min_price) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(parseInt(min_price));
      paramIndex++;
    }

    if (max_price) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(parseInt(max_price));
      paramIndex++;
    }

    if (stock_status) {
      conditions.push(`p.stock_status = $${paramIndex}`);
      params.push(stock_status);
      paramIndex++;
    }

    if (featured === 'true') {
      conditions.push('p.is_featured = true');
    }

    const allowedSorts = ['created_at', 'price', 'name', 'stock_quantity'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].total);

    // Fetch products
    const dataQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.${sortCol} ${sortOrder}, p.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(dataQuery, params);

    res.json({
      products: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/products/featured — Featured products
router.get('/featured', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_published = true AND p.is_featured = true
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 8
    `);
    res.json({ products: rows });
  } catch (err) {
    console.error('Featured products error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/products/admin — Admin list (all products, including drafts)
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      category,
      brand,
      search,
      stock_status,
      is_published,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`p.category_id = $${paramIndex}`);
      params.push(parseInt(category));
      paramIndex++;
    }

    if (brand) {
      conditions.push(`p.brand_id = $${paramIndex}`);
      params.push(parseInt(brand));
      paramIndex++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (stock_status) {
      conditions.push(`p.stock_status = $${paramIndex}`);
      params.push(stock_status);
      paramIndex++;
    }

    if (is_published !== undefined) {
      conditions.push(`p.is_published = $${paramIndex}`);
      params.push(is_published === 'true');
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].total);

    const allowedSorts = ['created_at', 'price', 'name', 'stock_quantity'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.${sortCol} ${sortOrder}, p.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(dataQuery, params);

    res.json({
      products: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Admin products list error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/products/admin/:id — Admin Product detail
router.get('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1
    `, [parseInt(req.params.id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    const product = rows[0];

    // Get images
    const { rows: images } = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
      [product.id]
    );

    // Get tags
    const { rows: tags } = await pool.query(
      'SELECT tag FROM product_tags WHERE product_id = $1',
      [product.id]
    );

    res.json({
      ...product,
      image_url: product.primary_image,
      images,
      tags: tags.map(t => t.tag),
    });
  } catch (err) {
    console.error('Admin Product detail error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/products/:slug — Product detail
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = $1 AND p.is_published = true
    `, [req.params.slug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    const product = rows[0];

    // Get images
    const { rows: images } = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
      [product.id]
    );

    // Get tags
    const { rows: tags } = await pool.query(
      'SELECT tag FROM product_tags WHERE product_id = $1',
      [product.id]
    );

    // Get related products (same category)
    const { rows: related } = await pool.query(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, p.badge,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1 AND p.id != $2 AND p.is_published = true
      LIMIT 4
    `, [product.category_id, product.id]);

    res.json({
      product: {
        ...product,
        images,
        tags: tags.map(t => t.tag),
        related,
      },
    });
  } catch (err) {
    console.error('Product detail error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/products — Create product (admin)
router.post('/', auth, adminOnly, [
  body('name').notEmpty().withMessage('Nom du produit requis'),
  body('price').isInt({ min: 0 }).withMessage('Prix invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, price, original_price,
      category_id, brand_id, sku, stock_quantity,
      stock_status, badge, is_published, is_featured,
      images, tags,
    } = req.body;

    const slug = slugify(name) + '-' + Date.now().toString(36);

    const { rows } = await pool.query(`
      INSERT INTO products (name, slug, description, price, original_price,
        category_id, brand_id, sku, stock_quantity, stock_status,
        badge, is_published, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name, slug, description || null, price, original_price || null,
      category_id || null, brand_id || null, sku || null,
      stock_quantity || 0, stock_status || 'in_stock',
      badge || null, is_published !== false, is_featured || false,
    ]);

    const product = rows[0];

    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
           VALUES ($1, $2, $3, $4)`,
          [product.id, images[i], i, i === 0]
        );
      }
    }

    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await pool.query(
          'INSERT INTO product_tags (product_id, tag) VALUES ($1, $2)',
          [product.id, tag]
        );
      }
    }

    res.status(201).json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/products/:id — Update product (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const {
      name, description, price, original_price,
      category_id, brand_id, sku, stock_quantity,
      stock_status, badge, is_published, is_featured,
      images, tags,
    } = req.body;

    // Check product exists
    const existing = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    const { rows } = await pool.query(`
      UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        original_price = $4,
        category_id = $5,
        brand_id = $6,
        sku = $7,
        stock_quantity = COALESCE($8, stock_quantity),
        stock_status = COALESCE($9, stock_status),
        badge = $10,
        is_published = COALESCE($11, is_published),
        is_featured = COALESCE($12, is_featured)
      WHERE id = $13
      RETURNING *
    `, [
      name, description, price, original_price || null,
      category_id || null, brand_id || null, sku || null,
      stock_quantity, stock_status, badge || null,
      is_published, is_featured, productId,
    ]);

    // Update images if provided
    if (images) {
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
           VALUES ($1, $2, $3, $4)`,
          [productId, images[i], i, i === 0]
        );
      }
    }

    // Update tags if provided
    if (tags) {
      await pool.query('DELETE FROM product_tags WHERE product_id = $1', [productId]);
      for (const tag of tags) {
        await pool.query(
          'INSERT INTO product_tags (product_id, tag) VALUES ($1, $2)',
          [productId, tag]
        );
      }
    }

    res.json({ product: rows[0] });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/products/:id — Delete product (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [parseInt(req.params.id)]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    res.json({ message: 'Produit supprimé.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
