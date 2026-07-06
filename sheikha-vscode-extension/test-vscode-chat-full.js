'use strict';

process.env.SHEIKHA_RUNTIME_URL = 'https://api.sheikha.top';

const { askSheikha, health, BASE_URL } = require('./src/sheikhaApiClient');

(async () => {
  console.log('=== VS CODE SHEIKHA CHAT FULL TEST ===');
  console.log('BASE_URL:', BASE_URL);

  console.log('\n=== HEALTH ===');
  console.log(JSON.stringify(await health(), null, 2));

  console.log('\n=== GENERAL CHAT PATH ===');
  console.log(JSON.stringify(await askSheikha(
    'حلل مسار مشروع شيخة الحالي واذكر runtimeUrl و route فقط',
    { mode: 'agentic' }
  ), null, 2));

  console.log('\n=== CODING CHAT PATH ===');
  console.log(JSON.stringify(await askSheikha(
    'اكتب دالة JavaScript تجمع رقمين فقط',
    { task: 'coding' }
  ), null, 2));
})();
