'use strict';

const express = require('express');
const {
  getRuntimeIdentity
} = require('../../../lib/runtime-identity/sheikha-runtime-identity');

const router = express.Router();

function buildPayload(req) {
  const identity = req.app?.locals?.sheikhaRuntimeIdentity || getRuntimeIdentity();

  return {
    success: true,
    data: {
      identity,
      activeHighestIdentity: identity.highestIdentityName,
      activeHighestIdentityArabic: identity.highestIdentityArabic,
      activeMethodologicalLayer: identity.officialName,
      activeMethodologicalLayerArabic: identity.arabicName,
      rootOperatingCore: identity.rootOperatingCore,
      legacyCompatibility: {
        repositoryName: identity.legacyRepositoryName,
        shortName: identity.legacyShortName,
        portalIsCompatibilityLayer: identity.portalIsCompatibilityLayer,
        doNotBreakExistingPaths: identity.doNotBreakExistingPaths
      }
    },
    message: 'Sheikha Operating System identity is bound to the runtime',
    timestamp: new Date().toISOString()
  };
}

router.get('/', (req, res) => {
  return res.json(buildPayload(req));
});

router.get('/status', (req, res) => {
  return res.json(buildPayload(req));
});

module.exports = router;
