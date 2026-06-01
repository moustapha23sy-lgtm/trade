import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const data = [
  {
    name: 'Objets Publicitaires',
    children: [
      'Cartes de visite', 'Flyers / Tracts', 'Affiches publicitaires',
      'Plaquettes / Dépliants', 'Calendriers', 'Broderie'
    ]
  },
  {
    name: 'Électroménager',
    children: [
      'Climatiseurs', 'Réfrigérateurs', 'Cuisinières', 'Congélateurs',
      'Machines à laver', 'Téléviseurs', 'Micro-ondes', 'Petit électroménager'
    ]
  },
  {
    name: 'Hôtellerie',
    children: [
      'Gel', 'Gel Cheveux', 'Lotion', 'Savon Plissé', 'Shampooing & Conditionneur',
      'Gamme Arganine', 'Linge hôtelier', "Produit d'accueil", 'Mobilier et accessoires',
      'Communication et branding', 'Équipement de chambre', 'Signalétique et article personnalisé',
      'Textiles personnalisés', 'Objet publicitaire et packaging', 'Impression corporate & cadeaux institutionnels'
    ]
  }
];

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  console.log("Connected to DB.");

  for (let parent of data) {
    const pSlug = slugify(parent.name);
    let pRes = await client.query('SELECT id FROM categories WHERE slug = $1', [pSlug]);
    let parentId;
    if (pRes.rows.length === 0) {
      console.log(`Inserting parent: ${parent.name}`);
      const insert = await client.query(
        'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id',
        [parent.name, pSlug]
      );
      parentId = insert.rows[0].id;
    } else {
      console.log(`Found parent: ${parent.name}`);
      parentId = pRes.rows[0].id;
    }

    for (let child of parent.children) {
      const cSlug = slugify(child);
      const cRes = await client.query('SELECT id FROM categories WHERE slug = $1', [cSlug]);
      if (cRes.rows.length === 0) {
        console.log(`  Inserting child: ${child}`);
        await client.query(
          'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3)',
          [child, cSlug, parentId]
        );
      } else {
        console.log(`  Found child: ${child}`);
      }
    }
  }

  console.log("Done seeding categories.");
  await client.end();
}

seed().catch(console.error);
