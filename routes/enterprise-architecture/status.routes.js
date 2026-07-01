'use strict';

const express = require('express');
const {
  getEnterpriseArchitecture,
  getArchitectureStatus,
  validateEnterpriseArchitecture
} = require('../../core/enterprise-architecture/sheikha-enterprise-architecture');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: getArchitectureStatus(),
      validation: validateEnterpriseArchitecture(),
      architecture: getEnterpriseArchitecture()
    },
    message: 'Sheikha Enterprise Architecture is active'
  });
});

module.exports = router;
