const crypto = require('crypto');

function isEnabled() {
  return process.env.MONGODB_ENABLED === 'true';
}

async function health() {
  const startedAt = Date.now();
  try {
    if (!isEnabled()) {
      return {
        success: true,
        status: 'planned',
        engine: 'mongodb',
        result: { ready: false, reason: 'not_enabled' },
        latencyMs: Date.now() - startedAt
      };
    }

    // محاكاة الاتصال
    return {
      success: true,
      status: 'connected',
      engine: 'mongodb',
      result: { ok: 1, version: '7.0' },
      latencyMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      success: false,
      status: 'error',
      engine: 'mongodb',
      error: error.message,
      latencyMs: Date.now() - startedAt
    };
  }
}

module.exports = {
  isEnabled,
  health
};
