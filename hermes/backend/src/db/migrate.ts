import pkg from 'pg';
import { schema } from './schema.js';
import env from '../env.js';

const { Pool } = pkg;

async function migrate() {
  const pool = new Pool({
    connectionString: env.databaseUrl,
  });

  try {
    console.log('🔄 Running migrations...');
    await pool.query(schema);
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
