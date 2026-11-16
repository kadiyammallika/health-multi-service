import { Pool } from 'pg';

let pool;

/**
 * Validates whether the DATABASE_URL is configured and not using placeholder text.
 */
export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes('[YOUR-PASSWORD]') || url.includes('YOUR_PASSWORD') || url.includes('PASSWORD_HERE')) {
    return false;
  }
  return true;
}

/**
 * Returns the singleton PostgreSQL connection pool.
 */
export function getDbPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.warn('⚠️ DATABASE_URL environment variable is missing.');
    }

    const isLocalhost = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('❌ Unexpected database pool error:', err.message);
    });
  }

  return pool;
}

/**
 * Executes a parameterized SQL query.
 * @param {string} text - SQL statement
 * @param {Array} [params] - Query parameters
 */
export async function query(text, params) {
  if (!isDatabaseConfigured()) {
    throw new Error(
      'DATABASE_URL is not properly configured. Please update .env with your actual Supabase database password.'
    );
  }

  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ DB Query failed (${duration}ms):`, text, params, error.message);
    throw error;
  }
}

/**
 * Acquires a client from the pool (ideal for transactions).
 */
export async function getClient() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not properly configured.');
  }
  const p = getDbPool();
  return await p.connect();
}

/**
 * Tests the PostgreSQL connection to Supabase.
 */
export async function testConnection() {
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      error: 'DATABASE_URL contains placeholder password or is undefined.',
    };
  }

  try {
    const res = await query('SELECT NOW() as current_time, current_database() as db_name, version() as pg_version');
    return {
      connected: true,
      time: res.rows[0].current_time,
      database: res.rows[0].db_name,
      version: res.rows[0].pg_version,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
}
