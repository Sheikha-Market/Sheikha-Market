const fs = require('fs');
const path = require('path');

function safeLoadEngine(enginePath) {
  try {
    const fullPath = path.join(process.cwd(), enginePath);

    if (!fs.existsSync(fullPath)) {
      return {
        ok: false,
        reason: 'missing',
        engine: null,
      };
    }

    const engine = require(fullPath);

    return {
      ok: true,
      engine,
    };
  } catch (err) {
    return {
      ok: false,
      reason: err.message,
      engine: null,
    };
  }
}

module.exports = safeLoadEngine;
