import pkg from 'pg';
import env from '../env.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: env.databaseUrl,
});

export async function query(sql: string, params?: any[]) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function queryOne(sql: string, params?: any[]) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export default pool;
