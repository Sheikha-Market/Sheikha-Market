'use strict';

const express = require('express');
const router = express.Router();

const {
  loadFederationOmega
} = require('../../runtime/federation-omega/sheikha-federation-omega');

router.get('/api/sheikha/federation-omega/v1/status', (_req, res) => {

  res.json({
    success: true,
    system: 'SHEIKHA_FEDERATION_OMEGA_V1',
    federation: loadFederationOmega()
  });

});

module.exports = router;
