'use strict';

const { sheikhaSmartRoute } = require('./src/sheikhaApiClient');

(async () => {
  const tests = [
    'حلل المشروع واذكر البيئة',
    'rag: sheikha-runtime-chat',
    'registry: chat',
    'cli: pwd',
    'اكتب دالة JavaScript تجمع رقمين فقط'
  ];

  for (const t of tests) {
    console.log('\n===', t, '===');
    console.log(JSON.stringify(await sheikhaSmartRoute(t), null, 2));
  }
})();
