'use strict';

const { sheikhaSmartRoute } = require('./src/sheikhaApiClient');
const { detectIntent } = require('./src/sheikhaIntentRouter');

(async () => {
  const tests = [
    'حلل المشروع واذكر البيئة',
    'pwd',
    'git status',
    'rag: sheikha-runtime-chat',
    'registry: chat',
    'graphics: route-map',
    'اكتب دالة JavaScript تجمع رقمين فقط',
    'فعّل debugger'
  ];

  for (const t of tests) {
    console.log('\n==============================');
    console.log('INPUT:', t);
    console.log('INTENT:', detectIntent(t));
    const r = await sheikhaSmartRoute(t);
    console.log(JSON.stringify(r, null, 2).slice(0, 3000));
  }
})();
