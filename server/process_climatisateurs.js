import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import pg from 'pg';

const { Pool } = pg;
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB connection
const pool = new Pool({
  connectionString: "postgresql://postgres:password@localhost:5432/trade_innovation",
});

const BASE_DIR = '/home/chiffer/Bureau/tradeinnove-product/electromenager/climatisateurs';
const UPLOADS_DIR = '/home/chiffer/CascadeProjects/trade-innovation-react/server/public/uploads';

async function ocrImage(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('language', 'eng');
  form.append('OCREngine', '2'); // Engine 2 is sometimes better for receipts/docs
  
  try {
    const res = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: {
        'apikey': 'helloworld',
        ...form.getHeaders()
      }
    });
    if (res.data && res.data.ParsedResults && res.data.ParsedResults.length > 0) {
      return res.data.ParsedResults[0].ParsedText || '';
    }
    return '';
  } catch (err) {
    console.error(`OCR Error for ${filePath}: ${err.message}`);
    return '';
  }
}

async function run() {
  const folders = fs.readdirSync(BASE_DIR).filter(f => fs.statSync(path.join(BASE_DIR, f)).isDirectory());
  
  for (const folder of folders) {
    const folderPath = path.join(BASE_DIR, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg'));
    
    if (files.length === 0) continue;
    
    console.log(`Processing folder: ${folder} (found ${files.length} files)`);
    
    let textImage = null;
    let productImg = null;
    let extractedName = '';
    let extractedDesc = '';
    
    // OCR all to find the one with "Nom produit"
    for (const file of files) {
      const p = path.join(folderPath, file);
      console.log(`  OCR-ing ${file}...`);
      const text = await ocrImage(p);
      if (text.toLowerCase().includes('nom produit')) {
        textImage = file;
        
        // Parse text
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        let nameIndex = lines.findIndex(l => l.toLowerCase().includes('nom produit'));
        let descIndex = lines.findIndex(l => l.toLowerCase().includes('description'));
        
        if (nameIndex !== -1 && nameIndex + 1 < lines.length) {
          extractedName = lines[nameIndex + 1];
        }
        
        if (descIndex !== -1) {
          extractedDesc = lines.slice(descIndex + 1).join('\n');
        } else {
          // If description block not explicitly found, just take everything after name
          extractedDesc = lines.slice(nameIndex + 2).join('\n');
        }
        break; 
      }
    }
    
    if (!textImage) {
      console.log(`  Could not find text image in ${folder}, skipping.`);
      continue;
    }
    
    productImg = files.find(f => f !== textImage);
    if (!productImg) {
      console.log(`  Could not find product image in ${folder}, skipping.`);
      continue;
    }
    
    console.log(`  => Name: ${extractedName}`);
    // console.log(`  => Description: ${extractedDesc.substring(0, 50)}...`);
    
    // Copy image
    const origPath = path.join(folderPath, productImg);
    const destName = `file_${Date.now()}_${folder}${path.extname(productImg)}`;
    const destPath = path.join(UPLOADS_DIR, destName);
    fs.copyFileSync(origPath, destPath);
    
    // Insert into DB
    try {
      const getSlug = (text) => text.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slug = getSlug(extractedName || 'climatiseur-' + folder);
      
      const dbRes = await pool.query(`
        INSERT INTO products (name, description, category_id, stock_status, slug, price)
        VALUES ($1, $2, $3, 'in_stock', $4, 0)
        RETURNING id
      `, [extractedName || 'Climatiseur Inconnu', extractedDesc, 34, slug]);
      
      const productId = dbRes.rows[0].id;
      
      await pool.query(`
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES ($1, $2, true)
      `, [productId, `http://localhost:5000/uploads/${destName}`]);
      
      console.log(`  [SUCCESS] Inserted as product ID ${productId}`);
    } catch (dbErr) {
      console.error(`  [ERROR] Database insert failed for ${folder}: ${dbErr.message}`);
    }
  }
  
  pool.end();
  console.log("Done.");
}

run();
