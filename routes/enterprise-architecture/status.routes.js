'use strict';

const express = require('express');
const {
  getEnterpriseArchitecture,
  getArchitectureStatus,
  getArchitectureLayerById,
  getArchitectureRegistry,
  getArchitectureRelationshipGraph,
  getArchitectureLayerRelationships,
  validateEnterpriseArchitecture
} = require('../../core/enterprise-architecture/sheikha-enterprise-architecture');

const {
  buildFederationOperatingFabricIntegrationV9,
  buildFederationOperatingFabricStatus
} = require('../../core/federation-operating-fabric-integration/sheikha-federation-operating-fabric-integration-v9');

const {
  evaluateOperatingIntegration,
  getOperatingIntegrationStatus
} = require('../../core/enterprise-architecture/sheikha-enterprise-architecture-operating-integration-v3');

const {
  buildUniversalGovernedFederationPlatformV10,
  buildUniversalGovernedFederationPlatformStatus
} = require('../../core/universal-governed-federation-platform/sheikha-universal-governed-federation-platform-v10');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: getArchitectureStatus(),
      validation: validateEnterpriseArchitecture()
    },
    message: 'Sheikha Enterprise Architecture Registry V2 is active'
  });
});

router.get('/registry', (req, res) => {
  res.json({
    success: true,
    data: {
      registry: getArchitectureRegistry(),
      validation: validateEnterpriseArchitecture()
    },
    message: 'Sheikha Enterprise Architecture Registry V2'
  });
});


router.get('/relationships', (req, res) => {
  res.json({
    success: true,
    data: {
      relationships: getArchitectureRelationshipGraph(),
      validation: validateEnterpriseArchitecture()
    },
    message: 'Sheikha Enterprise Architecture Relationship Graph'
  });
});

router.get('/relationships/:id', (req, res) => {
  const relationships = getArchitectureLayerRelationships(req.params.id);

  if (!relationships) {
    return res.status(404).json({
      success: false,
      error: 'ARCHITECTURE_RELATIONSHIPS_NOT_FOUND',
      layerId: req.params.id
    });
  }

  return res.json({
    success: true,
    data: { relationships },
    message: 'Sheikha Enterprise Architecture Layer Relationships'
  });
});

router.get('/federation-operating-fabric/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: buildFederationOperatingFabricStatus()
    },
    message: 'Sheikha Federation Operating Fabric Integration V9'
  });
});

router.get('/federation-operating-fabric/full', (req, res) => {
  res.json({
    success: true,
    data: {
      integration: buildFederationOperatingFabricIntegrationV9()
    },
    message: 'Sheikha Federation Operating Fabric Integration V9 Full Report'
  });
});

router.get('/operating-integration/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: getOperatingIntegrationStatus()
    },
    message: 'Sheikha Enterprise Architecture Operating Integration V3'
  });
});

router.get('/operating-integration/full', (req, res) => {
  res.json({
    success: true,
    data: {
      integration: evaluateOperatingIntegration()
    },
    message: 'Sheikha Enterprise Architecture Operating Integration V3 Full Report'
  });
});

router.get('/universal-governed-platform/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: buildUniversalGovernedFederationPlatformStatus()
    },
    message: 'Sheikha Universal Governed Federation Platform V10'
  });
});

router.get('/universal-governed-platform/full', (req, res) => {
  res.json({
    success: true,
    data: {
      platform: buildUniversalGovernedFederationPlatformV10()
    },
    message: 'Sheikha Universal Governed Federation Platform V10 Full Report'
  });
});


router.get('/layers/:id', (req, res) => {
  const layer = getArchitectureLayerById(req.params.id);

  if (!layer) {
    return res.status(404).json({
      success: false,
      error: 'ARCHITECTURE_LAYER_NOT_FOUND',
      layerId: req.params.id
    });
  }

  return res.json({
    success: true,
    data: { layer },
    message: 'Sheikha Enterprise Architecture Layer'
  });
});

router.get('/full', (req, res) => {
  res.json({
    success: true,
    data: {
      architecture: getEnterpriseArchitecture(),
      validation: validateEnterpriseArchitecture()
    },
    message: 'Sheikha Enterprise Architecture Full Registry V2'
  });
});

module.exports = router;
