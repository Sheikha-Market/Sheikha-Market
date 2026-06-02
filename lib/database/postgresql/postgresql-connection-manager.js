const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT || 5432),
      database: process.env.POSTGRES_DATABASE || 'sheikha_runtime',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: String(process.env.POSTGRES_SSL || 'false') === 'true'
    });
  }
  return pool;
}

async function health() {
  const startedAt = Date.now();

  try {
    const result = await getPool().query('SELECT 1 AS ok');
    return {
      success: true,
      status: 'connected',
      latencyMs: Date.now() - startedAt,
      result: result.rows[0]
    };
  } catch (error) {
    return {
      success: false,
      status: 'unavailable',
      error: error.message,
      latencyMs: Date.now() - startedAt
    };
  }
}

module.exports = { getPool, health };
