'use strict';

process.env.SHEIKHA_RUNTIME_URL = 'https://api.sheikha.top';

const { askSheikha, health, BASE_URL } = require('./src/sheikhaApiClient');

(async () => {
  console.log('=== SHEIKHA EXTENSION CHAT TEST ===');
  console.log('Runtime URL:', BASE_URL);

  console.log('\n=== HEALTH ===');
  const h = await health();
  console.log(JSON.stringify(h, null, 2));

  console.log('\n=== CHAT ===');
  const r = await askSheikha('اختبار من مسار الإضافة: اذكر runtimeUrl و runtimeTarget فقط', {
    mode: 'agentic',
    source: 'extension-path-test'
  });

  console.log(JSON.stringify(r, null, 2));
})();
