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
