'use strict';

process.env.SHEIKHA_RUNTIME_URL = 'https://api.sheikha.top';

const { askSheikha, health, BASE_URL } = require('./src/sheikhaApiClient');

(async () => {
  console.log('BASE_URL:', BASE_URL);

  console.log('\n=== HEALTH ===');
  console.log(JSON.stringify(await health(), null, 2));

  console.log('\n=== GENERAL CHAT ===');
  console.log(JSON.stringify(await askSheikha('اختبار شات المنظومة العام: عرف نفسك باختصار', {
    mode: 'agentic'
  }), null, 2));

  console.log('\n=== PROGRAMMING CHAT ===');
  console.log(JSON.stringify(await askSheikha('اكتب دالة JavaScript تجمع رقمين فقط', {
    task: 'coding'
  }), null, 2));
})();
