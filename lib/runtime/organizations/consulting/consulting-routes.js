const express = require('express');

function createConsultingRouter(context) {
  const router = express.Router();
  const {
    consultingRegistry,
    consultingGovernance,
    consultingKpi,
    consultingKnowledgeBase,
    consultingEngine,
    hsRuntimeRegistry,
    supplyChain,
    recycling
  } = context;

  router.get('/status', (req, res) => {
    res.json({
      success: true,
      organization: consultingRegistry.organization,
      data: consultingEngine.getStatus(),
      timestamp: new Date().toISOString()
    });
  });

  router.get('/projects', (req, res) => {
    res.json({
      success: true,
      projects: {
        active: 0,
        pipeline: 0,
        completed: 0,
        note: 'Project runtime connected and ready for real data binding.'
      },
      timestamp: new Date().toISOString()
    });
  });

  router.get('/markets', (req, res) => {
    res.json({
      success: true,
      market: consultingRegistry.market,
      consultingMarkets: consultingRegistry.consultingMarkets,
      timestamp: new Date().toISOString()
    });
  });

  router.get('/governance', (req, res) => {
    res.json({
      success: true,
      governance: consultingGovernance,
      timestamp: new Date().toISOString()
    });
  });

  router.get('/hs-codes', (req, res) => {
    res.json({
      success: true,
      hsRegistry: hsRuntimeRegistry.meta,
      chapters: hsRuntimeRegistry.chapters,
      timestamp: new Date().toISOString()
    });
  });

  router.get('/supply-chain', (req, res) => {
    res.json({
      success: true,
      supplyChain: supplyChain.getStatus(),
      timestamp: new Date().toISOString()
    });
  });

  router.get('/recycling', (req, res) => {
    res.json({
      success: true,
      recycling: recycling.getStatus(),
      timestamp: new Date().toISOString()
    });
  });

  router.get('/economic-analysis', (req, res) => {
    res.json({
      success: true,
      kpi: consultingKpi,
      knowledge: consultingKnowledgeBase,
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

module.exports = createConsultingRouter;
