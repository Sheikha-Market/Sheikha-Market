const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadBridge() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'runtime/mcp-unified-bridge/sheikha-mcp-unified-bridge.json'),
      'utf8'
    )
  );
}

const tools = [
  'code_analysis',
  'code_generation',
  'code_refactor',
  'test_generation',
  'sharia_compliance_check',
  'performance_optimization'
];

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadBridge(),
    mcpEnabled: true,
    activeRuntime: '/api/sheikha/neural-mcp',
    registeredTools: tools.length,
    timestamp: new Date().toISOString()
  });
});

router.get('/health', (_req, res) => {
  return res.json({
    success: true,
    status: 'healthy',
    mcpEnabled: true,
    activeRuntime: '/api/sheikha/neural-mcp',
    timestamp: new Date().toISOString()
  });
});

router.get('/tools', (_req, res) => {
  return res.json({
    success: true,
    tools,
    sourceRuntime: '/api/sheikha/neural-mcp/tools',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
