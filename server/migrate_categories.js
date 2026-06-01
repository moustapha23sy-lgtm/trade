import { v2 as cloudinary } from 'cloudinary';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/trade_innovation',
});

async function run() {
  try {
    const { rows } = await pool.query(`SELECT id, image_url FROM categories WHERE image_url LIKE '%localhost:5000%'`);
    console.log(`Found ${rows.length} categories to migrate.`);

    for (const row of rows) {
      const { id, image_url } = row;
      const parts = image_url.split('/uploads/');
      if (parts.length < 2) continue;
      const filename = parts[1];
      const localFilePath = path.join(__dirname, 'public', 'uploads', filename);

      if (!fs.existsSync(localFilePath)) {
        console.error(`File not found: ${localFilePath}`);
        continue;
      }

      console.log(`Uploading ${filename}...`);
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'trade_innovation/categories',
      });

      console.log(`Uploaded! New URL: ${result.secure_url}`);
      await pool.query(`UPDATE categories SET image_url = $1 WHERE id = $2`, [result.secure_url, id]);
    }
    console.log('Categories Migration to Cloudinary complete!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    pool.end();
  }
}

run();
