import pool from './db/pool.js';

// Images from Unsplash & Trade Innovation site
const categoryImages = {
  // ===== PARENTS =====
  'objets-publicitaires': 'https://images.unsplash.com/photo-1612831455740-1ad22a9cb6bf?w=600&q=80',
  'electromenager': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  'hotellerie': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',

  // ===== OBJETS PUBLICITAIRES =====
  'cartes-de-visite': 'https://images.unsplash.com/photo-1586380951230-ddbf0015bec8?w=600&q=80',
  'flyers-tracts': 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&q=80',
  'affiches-publicitaires': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'plaquettes-depliants': 'https://images.unsplash.com/photo-1616628339038-06b95614db4e?w=600&q=80',
  'calendriers': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80',
  'broderie': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',

  // ===== ELECTROMENAGER =====
  'climatiseurs': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
  'refrigerateurs': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80',
  'cuisinieres': 'https://images.unsplash.com/photo-1556909114-b9748af9d5a6?w=600&q=80',
  'congelateurs': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
  'machines-a-laver': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80',
  'televiseurs': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80',
  'micro-ondes': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80',
  'petit-electromenager': 'https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=600&q=80',

  // ===== HOTELLERIE =====
  'gel': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
  'gel-cheveux': 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=600&q=80',
  'lotion': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
  'savon-plisse': 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
  'shampooing-conditionneur': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
  'gamme-arganine': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
  'linge-hotelier': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  'produit-daccueil': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
  'mobilier-et-accessoires': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
  'communication-et-branding': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
  'equipement-de-chambre': 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&q=80',
  'signaletique-et-article-personnalise': 'https://images.unsplash.com/photo-1612831455740-1ad22a9cb6bf?w=600&q=80',
  'textiles-personnalises': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  'objet-publicitaire-et-packaging': 'https://images.unsplash.com/photo-1586380951230-ddbf0015bec8?w=600&q=80',
  'impression-corporate-cadeaux-institutionnels': 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&q=80',
};

async function updateImages() {
  const client = await pool.connect();
  console.log('Connected to DB via pool.');

  try {
    for (const [slug, imageUrl] of Object.entries(categoryImages)) {
      const res = await client.query(
        'UPDATE categories SET image_url = $1 WHERE slug = $2 RETURNING name',
        [imageUrl, slug]
      );
      if (res.rows.length > 0) {
        console.log(`✅ ${res.rows[0].name} → image updated`);
      } else {
        // Try partial match since slugs may differ slightly
        const fuzzy = await client.query(
          "UPDATE categories SET image_url = $1 WHERE slug ILIKE $2 RETURNING name",
          [imageUrl, `%${slug.split('-').slice(0, 2).join('-')}%`]
        );
        if (fuzzy.rows.length > 0) {
          console.log(`🔶 ${fuzzy.rows[0].name} (fuzzy) → image updated`);
        } else {
          console.log(`❌ Slug not found: ${slug}`);
        }
      }
    }
  } finally {
    client.release();
    console.log('\nDone updating category images.');
    process.exit(0);
  }
}

updateImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
