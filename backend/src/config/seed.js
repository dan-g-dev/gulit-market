// Applies database/seed.sql against the configured MySQL database.
// Run with: npm run db:seed  (after npm run db:migrate)
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

async function main() {
  const sql = fs.readFileSync(seedPath, 'utf-8');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'gulit',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gulit_market',
    multipleStatements: true,
  });

  await connection.query(sql);
  console.log('Seed data applied from database/seed.sql');
  await connection.end();
}

main().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
