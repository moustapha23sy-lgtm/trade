import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runSeed() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema created successfully');

    console.log('🔄 Seeding data...');
    
    // Hash the admin password
    const adminPassword = 'Admin@2026!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Read seed SQL and replace placeholder password hash
    let seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    seed = seed.replace('$2a$10$placeholder_will_be_set_by_seed_script', hashedPassword);
    
    await client.query(seed);
    console.log('✅ Seed data inserted successfully');
    
    // Verify
    const { rows: users } = await client.query('SELECT id, email, role FROM users');
    const { rows: cats } = await client.query('SELECT COUNT(*) as count FROM categories');
    const { rows: prods } = await client.query('SELECT COUNT(*) as count FROM products');
    
    console.log('\n📊 Database summary:');
    console.log(`   Users: ${users.length} (admin: ${users.find(u => u.role === 'admin')?.email})`);
    console.log(`   Categories: ${cats[0].count}`);
    console.log(`   Products: ${prods[0].count}`);
    console.log(`\n🔑 Admin login: admin@tradeinnovation.sn / ${adminPassword}`);
    
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
