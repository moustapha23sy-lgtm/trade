import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: "postgresql://postgres:password@localhost:5432/trade_innovation",
});

const UPLOADS_DIR = '/home/chiffer/CascadeProjects/trade-innovation-react/server/public/uploads';

const products = [
  {
    folder: '02',
    name: 'SPLIT ASTECH 24000BTU ARMOIRE 24LDMA',
    desc: 'Marque : ASTECH\nAlimentation : 220-240V ~ 50Hz\nType de produit : split armoire\nCapacité de refroidissement : 24000BTU\nPuissance : 3CV\nAir fraiche',
    img: '/home/chiffer/Bureau/tradeinnove-product/electromenager/climatisateurs/02/WhatsApp Image 2026-05-04 at 12.29.29(1).jpeg'
  },
  {
    folder: '03',
    name: 'SPLIT ASTECH CASSETTE 12000BTU AST12CA102TE',
    desc: 'Type de produit :climatiseur\nMarque :astech\nmodèle :12000BTU /1.5CV\nReference:AST-12CA102-TE',
    img: '/home/chiffer/Bureau/tradeinnove-product/electromenager/climatisateurs/03/WhatsApp Image 2026-05-04 at 12.30.39(1).jpeg'
  }
];

async function run() {
  for (const p of products) {
    const slug = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const destName = `file_${Date.now()}_${p.folder}.jpeg`;
    fs.copyFileSync(p.img, path.join(UPLOADS_DIR, destName));
    
    try {
      const dbRes = await pool.query(
        "INSERT INTO products (name, description, category_id, stock_status, slug, price) VALUES ($1, $2, 34, 'in_stock', $3, 0) RETURNING id",
        [p.name, p.desc, slug]
      );
      const id = dbRes.rows[0].id;
      await pool.query(
        "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)",
        [id, `http://localhost:5000/uploads/${destName}`]
      );
      console.log(`Inserted ${p.name}`);
    } catch (e) {
      console.log(e.message);
    }
  }
  pool.end();
}
run();
