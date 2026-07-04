'use strict';

if (process.env.SHEIKHA_DISABLE_INLINE_CRON === '1') {
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function patchedRequire(name) {
    const mod = originalRequire.apply(this, arguments);

    if (name === 'node-cron' && mod && typeof mod.schedule === 'function') {
      return {
        ...mod,
        schedule(expression, task, options) {
          console.warn('[SHEIKHA_SAFE_MODE] node-cron schedule disabled in main runtime:', expression);
          return {
            start() {},
            stop() {},
            destroy() {},
            getStatus() { return 'disabled'; }
          };
        }
      };
    }

    return mod;
  };

  console.warn('[SHEIKHA_SAFE_MODE] Inline cron disabled for production runtime stabilization');
}
