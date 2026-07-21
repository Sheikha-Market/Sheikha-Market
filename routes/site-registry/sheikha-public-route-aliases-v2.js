'use strict';

const express = require('express');
const path = require('node:path');

const policy = require('../../config/sheikha-site-route-policy-v2.json');

const router = express.Router();
const publicRoot = path.resolve(__dirname, '..', '..', 'public');

router.use((req, res, next) => {
  const hostname = String(req.hostname || '').toLowerCase();
  const shouldCanonicalize = process.env.NODE_ENV === 'production' &&
    policy.policies.canonicalizePublicHostnameInProduction === true &&
    hostname === policy.identity.publicAliasHostname;
  if (shouldCanonicalize) {
    return res.redirect(
      308,
      `https://${policy.identity.canonicalHostname}${req.originalUrl}`
    );
  }
  return next();
});

router.get('/', (_req, res) => {
  res.sendFile(path.join(publicRoot, 'index.html'));
});

router.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  const declaredFile = policy.primaryRoutes[req.path];
  if (!declaredFile || req.path === '/') return next();
  const relativeFile = declaredFile.replace(/^public\//, '');
  return res.sendFile(path.join(publicRoot, relativeFile));
});

router.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  let requestPath = req.path;
  try {
    requestPath = decodeURIComponent(requestPath);
  } catch {
    return res.status(400).json({
      ok: false,
      error: 'MALFORMED_ROUTE_ENCODING',
    });
  }
  const canonical = policy.aliases[requestPath];
  return canonical ? res.redirect(308, canonical) : next();
});

for (const prefix of policy.hiddenPrefixes) {
  router.use(prefix, (_req, res) => {
    res.status(404).json({
      ok: false,
      error: 'ROUTE_NOT_PUBLIC',
    });
  });
}

module.exports = router;
