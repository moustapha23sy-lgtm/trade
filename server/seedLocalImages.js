import fs from 'fs';
import path from 'path';
import pool from './db/pool.js';

const sourceDir = '/home/chiffer/Bureau/tradeinnove-product/electromenager';
const destDir = path.join(process.cwd(), 'public', 'uploads');

const categoryMappings = {
  'climatisateurs': 'climatiseur',
  'congelateur': 'congelateur',
  'cuisinieres': 'cuisiniere',
  'machine a laver': 'machine-a-laver',
  'micro-onde': 'micro-ondes',
  'petite electromenagers': 'petit-electromenager',
  'refrigerateurs': 'refrigerateur',
  'televiseur': 'televiseur'
};

async function seedLocalImages() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const client = await pool.connect();
  console.log('Connected to DB via pool.');

  try {
    const categories = fs.readdirSync(sourceDir);

    for (const catDir of categories) {
      const catPath = path.join(sourceDir, catDir);
      if (!fs.statSync(catPath).isDirectory()) continue;

      const firstProductDir = path.join(catPath, '01');
      if (!fs.existsSync(firstProductDir)) {
        console.log(`No 01 directory for ${catDir}`);
        continue;
      }

      const files = fs.readdirSync(firstProductDir);
      const imgFile = files.find(f => f.match(/\.(jpg|jpeg|png)$/i));

      if (imgFile) {
        const ext = path.extname(imgFile);
        const slugPrefix = categoryMappings[catDir] || catDir;
        const newFileName = `cat_electromenager_${slugPrefix}${ext}`;
        const destPath = path.join(destDir, newFileName);

        // Copy file
        fs.copyFileSync(path.join(firstProductDir, imgFile), destPath);
        console.log(`Copied image for ${catDir} -> ${newFileName}`);

        // Update DB
        const imageUrl = `http://localhost:5000/uploads/${newFileName}`;
        const query = `UPDATE categories SET image_url = $1 WHERE slug ILIKE $2 RETURNING name, slug`;
        
        const res = await client.query(query, [imageUrl, `%${slugPrefix}%`]);
        if (res.rows.length > 0) {
          console.log(`✅ DB Updated for ${res.rows[0].name} (${res.rows[0].slug})`);
        } else {
          console.log(`❌ No category matched in DB for ${slugPrefix}`);
        }
      } else {
        console.log(`No image found in ${firstProductDir}`);
      }
    }
  } finally {
    client.release();
    process.exit(0);
  }
}

seedLocalImages().catch(err => {
  console.error(err);
  process.exit(1);
});
