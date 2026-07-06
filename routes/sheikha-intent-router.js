'use strict';

const express = require('express');
const router = express.Router();
router.use(express.json());

function classify(message = '', mode = '') {
  const m = String(message).toLowerCase();
  const x = String(mode).toLowerCase();

  if (x === 'cli' || /^cli:/.test(m) || m.includes('نفذ pwd') || m.includes('terminal')) return 'CLI';
  if (x === 'rag' || /^rag:/.test(m) || m.includes('ابحث') || m.includes('search')) return 'RAG';
  if (x === 'mcp' || /^mcp:/.test(m)) return 'MCP';
  if (x === 'sdk' || /^sdk:/.test(m)) return 'SDK';
  if (x === 'graphics' || /^graphics:/.test(m) || m.includes('خريطة') || m.includes('diagram')) return 'GRAPHICS';
  if (x === 'environment' || m.includes('حلل المشروع') || m.includes('بيئة') || m.includes('environment')) return 'ENVIRONMENT';
  if (m.includes('debug') || m.includes('debugger') || m.includes('صلح الخطأ')) return 'DEBUG';
  if (m.includes('git') || m.includes('commit') || m.includes('branch')) return 'GIT';
  if (m.includes('اكتب كود') || m.includes('اكتب دالة') || m.includes('python') || m.includes('javascript') || m.includes('function')) return 'CODE';
  if (m.includes('registry') || m.includes('ريجستري') || m.includes('تعلم من البرمجيات')) return 'SOFTWARE_REGISTRY';

  return 'CHAT';
}

router.post('/api/sheikha/router/classify', (req, res) => {
  const message = req.body?.message || '';
  const mode = req.body?.mode || '';
  const intent = classify(message, mode);

  const routes = {
    CHAT: '/api/sheikha/ai-gateway/chat',
    CODE: '/api/sheikha/programming/ask',
    DEBUG: '/api/sheikha/programming/ask',
    CLI: '/api/sheikha/cli/run',
    GIT: '/api/sheikha/cli/run',
    RAG: '/api/sheikha/rag/search',
    MCP: '/api/sheikha/mcp/tools',
    SDK: '/api/sheikha/sdk/registry',
    GRAPHICS: '/api/sheikha/graphics/render',
    ENVIRONMENT: '/api/sheikha/environment/scan',
    SOFTWARE_REGISTRY: '/api/sheikha/software-registry/search'
  };

  res.json({
    success: true,
    data: {
      intent,
      route: routes[intent],
      message,
      mode,
      router: 'Sheikha Intent Router',
      version: 'v1'
    }
  });
});

module.exports = router;
