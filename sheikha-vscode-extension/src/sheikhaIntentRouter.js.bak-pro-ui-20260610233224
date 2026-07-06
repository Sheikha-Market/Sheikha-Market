'use strict';

function detectIntent(message = '', selectedMode = 'agentic') {
  const raw = String(message || '').trim();
  const m = raw.toLowerCase();
  const mode = String(selectedMode || '').toLowerCase();

  if (/^(pwd|ls|whoami|date|uptime|df|free|pm2|git status|git branch)$/.test(m)) return 'CLI';
  if (/^(cli|terminal):/i.test(raw)) return 'CLI';

  if (m.includes('debug') || m.includes('debugger') || m.includes('مصصح') || m.includes('مصحح')) return 'DEBUG';
  if (m.includes('todo') || m.includes('مهام') || m.includes('مهمة')) return 'TODO';
  if (m.includes('tag') || m.includes('وسم') || m.includes('تصنيف')) return 'TAG';

  if (
    m.includes('global registry') ||
    m.includes('registry') ||
    m.includes('ريجستري') ||
    m.includes('افتح global') ||
    m.includes('افتح الرجستري')
  ) return 'GLOBAL_REGISTRY';

  if (/^rag:/i.test(raw) || mode === 'rag') return 'RAG';
  if (/^mcp:/i.test(raw) || mode === 'mcp') return 'MCP';
  if (/^sdk:/i.test(raw) || mode === 'sdk') return 'SDK';
  if (/^graphics:/i.test(raw) || mode === 'graphics') return 'GRAPHICS';

  if (m.includes('حلل المشروع') || m.includes('بيئة') || m.includes('workspace') || m.includes('environment')) return 'ENVIRONMENT';

  if (m.includes('javascript') || m.includes('python') || m.includes('اكتب دالة') || m.includes('اكتب كود')) return 'CODE';

  return 'CHAT';
}

module.exports = { detectIntent };
