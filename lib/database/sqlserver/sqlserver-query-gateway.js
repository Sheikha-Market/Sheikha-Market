'use strict';

const crypto = require('crypto');
const { getPool } = require('./sqlserver-connection-manager');

const BLOCKED = [
  'DROP ',
  'TRUNCATE ',
  'ALTER LOGIN ',
  'CREATE LOGIN ',
  'SHUTDOWN ',
  'XP_CMDSHELL',
  'SP_CONFIGURE'
];

function governanceCheck(query) {
  const normalized = String(query || '').toUpperCase();

  for (const blocked of BLOCKED) {
    if (normalized.includes(blocked)) {
      return {
        allowed: false,
        reason: `BLOCKED_PATTERN:${blocked.trim()}`
      };
    }
  }

  return {
    allowed: true
  };
}

async function executeQuery(query) {
  const startedAt = Date.now();

  const governance = governanceCheck(query);

  if (!governance.allowed) {
    return {
      success: false,
      governance,
      latencyMs: Date.now() - startedAt
    };
  }

  const pool = await getPool();

  const result = await pool.request().query(query);

  return {
    success: true,
    governance,
    latencyMs: Date.now() - startedAt,
    rows: result.recordset || [],
    rowsAffected: result.rowsAffected || [],
    auditId: crypto.randomUUID()
  };
}

module.exports = {
  executeQuery,
  governanceCheck
};
