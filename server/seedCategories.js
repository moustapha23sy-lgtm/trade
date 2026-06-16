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
    slug: 'objets-publicitaires',
    description: 'Objets promotionnels, textile personnalisé, signalétique et impression.',
    children: [
      {
        name: 'Objets promotionnels',
        children: ['Stylo', 'Carnet', 'Clé USB', 'Gourdes', 'Mugs', 'Porte-clés'],
      },
      {
        name: 'Textile personnalisé',
        children: ['T-shirts', 'Polos', 'Casquettes', 'Sac', 'Uniforme'],
      },
      {
        name: 'Signalétique & Impression',
        children: ['Panneaux', 'Plaques', 'Bâches', 'Roll-up', 'Stickers', 'Carte de visite', 'Flyers', 'Dépliant', 'Bloc note'],
      },
    ],
  },
  {
    name: 'Électroménager',
    slug: 'electromenager',
    description: 'Climatiseurs, réfrigérateurs, téléviseurs, machines à laver et bien plus.',
    children: [
      'Climatiseurs', 'Réfrigérateurs', 'Cuisinières', 'Congélateurs',
      'Machines à laver', 'Téléviseurs', 'Micro-ondes', 'Petit électroménager',
    ],
  },
  {
    name: 'Fournitures et Équipement Hôtelier',
    slug: 'fournitures-equipement-hotelier',
    description: 'Équipements de chambre, linge hôtelier, salle de bain et produits d\'accueil.',
    children: [
      {
        name: 'Équipements de chambre',
        children: ['Lits & matelas', 'Mobilier de chambre', 'Coffres-forts', 'Minibars', 'TV & accessoires', 'Rideaux & stores'],
      },
      {
        name: 'Linge Hôteliers',
        children: ['Draps', 'Housses de couette', 'Oreillers et couette', 'Serviettes', 'Peignoir'],
      },
      {
        name: 'Salle de bain',
        children: ['Sèche-cheveux', 'Distributeurs de savon', 'Accessoires sanitaire', 'Poubelles & porte-serviette'],
      },
      {
        name: 'Produits d\'accueil (Amenities)',
        children: ['Savon & Shampoings', 'Gel de douche & lotion', 'Kit dentaire & rasage', 'Chausson et bonnets de douche', 'Distributeur & emballages'],
      },
    ],
  },
];

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function upsertCategory(client, { name, slug, parentId, description, sortOrder }) {
  const existing = await client.query('SELECT id FROM categories WHERE slug = $1', [slug]);
  if (existing.rows.length > 0) {
    await client.query(
      'UPDATE categories SET name = $1, parent_id = $2, description = COALESCE($3, description), sort_order = $4, is_active = true WHERE id = $5',
      [name, parentId, description || null, sortOrder, existing.rows[0].id]
    );
    return existing.rows[0].id;
  }
  const insert = await client.query(
    'INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, slug, description || null, parentId, sortOrder]
  );
  return insert.rows[0].id;
}

async function resetPoleDescendants(client, poleId) {
  await client.query(`
    WITH RECURSIVE descendants AS (
      SELECT id FROM categories WHERE parent_id = $1
      UNION ALL
      SELECT c.id FROM categories c JOIN descendants d ON c.parent_id = d.id
    )
    DELETE FROM categories WHERE id IN (SELECT id FROM descendants)
  `, [poleId]);
}

async function seedChildren(client, children, parentId, depth = 0) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (typeof child === 'string') {
      await upsertCategory(client, {
        name: child,
        slug: slugify(child),
        parentId,
        sortOrder: i + 1,
      });
    } else {
      const groupId = await upsertCategory(client, {
        name: child.name,
        slug: slugify(child.name),
        parentId,
        sortOrder: i + 1,
      });
      if (child.children?.length) {
        await seedChildren(client, child.children, groupId, depth + 1);
      }
    }
  }
}

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB.');

  // Migrate old Hôtellerie pole name/slug
  await client.query(`
    UPDATE categories
    SET name = 'Fournitures et Équipement Hôtelier',
        slug = 'fournitures-equipement-hotelier',
        description = 'Équipements de chambre, linge hôtelier, salle de bain et produits d''accueil.'
    WHERE slug IN ('hotellerie', 'fournitures-equipement-hotelier')
  `);

  for (const pole of data) {
    const poleSlug = pole.slug || slugify(pole.name);
    let poleId = (await client.query('SELECT id FROM categories WHERE slug = $1', [poleSlug])).rows[0]?.id;

    if (!poleId) {
      console.log(`Inserting pole: ${pole.name}`);
      poleId = await upsertCategory(client, {
        name: pole.name,
        slug: poleSlug,
        parentId: null,
        description: pole.description,
        sortOrder: data.indexOf(pole) + 1,
      });
    } else {
      console.log(`Updating pole: ${pole.name}`);
      await upsertCategory(client, {
        name: pole.name,
        slug: poleSlug,
        parentId: null,
        description: pole.description,
        sortOrder: data.indexOf(pole) + 1,
      });
    }

    console.log(`  Resetting descendants of ${pole.name}...`);
    await resetPoleDescendants(client, poleId);
    await seedChildren(client, pole.children, poleId);
  }

  console.log('Done seeding categories.');
  await client.end();
}

seed().catch(console.error);
