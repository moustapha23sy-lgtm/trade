import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

// GET /api/settings - Public or authenticated
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    if (rows.length === 0) {
      return res.json({ settings: {} });
    }
    res.json({ settings: rows[0] });
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/settings - Admin only
router.put('/', auth, adminOnly, async (req, res) => {
  try {
    const { 
      store_name, logo_url, currency, language, 
      social_facebook, social_instagram, social_twitter, 
      contact_email, contact_phone, contact_address 
    } = req.body;

    const { rows: existing } = await pool.query('SELECT id FROM settings ORDER BY id ASC LIMIT 1');
    
    let query;
    let values;
    
    if (existing.length > 0) {
      query = `
        UPDATE settings SET 
          store_name = COALESCE($1, store_name),
          logo_url = $2,
          currency = COALESCE($3, currency),
          language = COALESCE($4, language),
          social_facebook = $5,
          social_instagram = $6,
          social_twitter = $7,
          contact_email = $8,
          contact_phone = $9,
          contact_address = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;
      values = [
        store_name, logo_url, currency, language, 
        social_facebook, social_instagram, social_twitter, 
        contact_email, contact_phone, contact_address,
        existing[0].id
      ];
    } else {
      query = `
        INSERT INTO settings (
          store_name, logo_url, currency, language, 
          social_facebook, social_instagram, social_twitter, 
          contact_email, contact_phone, contact_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      values = [
        store_name, logo_url, currency || 'FCFA', language || 'fr', 
        social_facebook, social_instagram, social_twitter, 
        contact_email, contact_phone, contact_address
      ];
    }

    const { rows } = await pool.query(query, values);
    res.json({ settings: rows[0] });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
