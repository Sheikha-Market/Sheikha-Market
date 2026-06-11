'use strict';

function decideSmartRoute(message, selectedMode = 'smart') {
  const text = String(message || '');
  const mode = String(selectedMode || 'smart').toLowerCase();

  const route = {
    selectedMode: mode,
    governance: 'SHEIKHA_SMART_CHAT_GOVERNANCE_V1',
    capabilities: [],
    finalRoute: 'SMART_CHAT_ORCHESTRATOR'
  };

  if (mode === 'mcp' || /ملف|ملفات|terminal|docker|github|git|نفذ|شغل/i.test(text)) {
    route.capabilities.push('MCP');
  }

  if (mode === 'rag' || /وثائق|معمارية|سياسة|حوكمة|اشرح من المشروع|docs|architecture/i.test(text)) {
    route.capabilities.push('RAG');
  }

  if (mode === 'agent' || mode === 'smart' || /حلل|خطط|افحص|اصلح|اكتب|تقرير/i.test(text)) {
    route.capabilities.push('AGENT');
  }

  if (mode === 'graphics' || /رسم|مخطط|graph|diagram|واجهة|تصميم/i.test(text)) {
    route.capabilities.push('GRAPHICS');
  }

  if (mode === 'cli' || /أمر|اوامر|npm|node|curl|systemctl|docker|pm2/i.test(text)) {
    route.capabilities.push('CLI');
  }

  if (mode === 'sdk' || /sdk|api|تكامل|client|extension/i.test(text)) {
    route.capabilities.push('SDK');
  }

  if (!route.capabilities.length) {
    route.capabilities.push('AGENT');
  }

  route.capabilities = [...new Set(route.capabilities)];

  return route;
}

module.exports = { decideSmartRoute };
