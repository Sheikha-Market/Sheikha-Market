'use strict';

const tiers = Object.freeze({
  FREE: ['chat'],
  PRO: ['chat', 'ai'],
  BUSINESS: ['chat', 'ai', 'inspector'],
  ENTERPRISE: ['chat', 'ai', 'governance', 'inspector', 'extension', 'mcp', 'sdk'],
  GOVERNMENT: ['chat', 'ai', 'governance', 'inspector', 'extension', 'mcp', 'sdk', 'audit']
});

function getTier(tier = 'ENTERPRISE') {
  return { tier, capabilities: tiers[tier] || tiers.ENTERPRISE };
}

module.exports = { getTier };
