'use strict';

const { runTool } = require('./src/sheikhaApiClient');

(async () => {
  console.log('=== CLI ===');
  console.log(JSON.stringify(await runTool('cli', 'pwd'), null, 2));

  console.log('\n=== RAG ===');
  console.log(JSON.stringify(await runTool('rag', 'sheikha-runtime-chat'), null, 2));

  console.log('\n=== MCP ===');
  console.log(JSON.stringify(await runTool('mcp', 'اعرض الأدوات'), null, 2));

  console.log('\n=== SDK ===');
  console.log(JSON.stringify(await runTool('sdk', 'اعرض السجل'), null, 2));

  console.log('\n=== GRAPHICS ===');
  console.log(JSON.stringify(await runTool('graphics', 'route-map'), null, 2));
})();
