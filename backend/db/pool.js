// ==========================================================================
// db/pool.js — Tek PostgreSQL bağlantı havuzu (node-postgres)
//
// Tüm controller'lar veritabanına SADECE buradan erişir. Supabase JS SDK'nın
// yerini alır. Parametreli sorgu zorunludur (SQL injection koruması).
// ==========================================================================
import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://flend:flend@localhost:5432/flend';

export const pool = new Pool({ connectionString: DATABASE_URL });

pool.on('error', (err) => {
  console.error('❌ [pg] Beklenmeyen havuz hatası:', err.message);
});

/**
 * Parametreli SQL çalıştırır.
 * @param {string} text  - $1, $2 ... placeholder'lı SQL
 * @param {any[]} [params]
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Bağlantıyı doğrular (boot'ta ve /health için).
 * @returns {Promise<boolean>}
 */
export async function pingDb() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
