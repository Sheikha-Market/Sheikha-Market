'use strict';

const sql = require('mssql');

let pool = null;

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function getConfig() {
  return {
    server: process.env.SQLSERVER_HOST || '127.0.0.1',
    port: Number(process.env.SQLSERVER_PORT || 1433),
    database: process.env.SQLSERVER_DATABASE || 'sheikha',
    user: process.env.SQLSERVER_USER || '',
    password: process.env.SQLSERVER_PASSWORD || '',
    options: {
      encrypt: bool(process.env.SQLSERVER_ENCRYPT, false),
      trustServerCertificate: bool(process.env.SQLSERVER_TRUST_SERVER_CERTIFICATE, true)
    },
    pool: {
      max: Number(process.env.SQLSERVER_POOL_MAX || 10),
      min: Number(process.env.SQLSERVER_POOL_MIN || 0),
      idleTimeoutMillis: Number(process.env.SQLSERVER_POOL_IDLE_MS || 30000)
    }
  };
}

async function getPool() {
  if (!bool(process.env.SQLSERVER_ENABLED, false)) {
    throw new Error('SQLSERVER_DISABLED');
  }

  if (pool && pool.connected) return pool;

  const config = getConfig();

  if (!config.user || !config.password) {
    throw new Error('SQLSERVER_CREDENTIALS_REQUIRED');
  }

  pool = await sql.connect(config);
  return pool;
}

async function health() {
  const startedAt = Date.now();

  try {
    const activePool = await getPool();
    const result = await activePool.request().query('SELECT 1 AS ok');
    return {
      success: true,
      status: 'connected',
      latencyMs: Date.now() - startedAt,
      result: result.recordset?.[0] || null
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

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = {
  getConfig,
  getPool,
  health,
  closePool
};
