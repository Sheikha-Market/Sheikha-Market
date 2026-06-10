'use strict';

const { classifyIntent, readVsCodeAwareness, sheikhaSmartRoute } = require('./src/sheikhaApiClient');

(async () => {
  console.log('=== AWARENESS ===');
  console.log(JSON.stringify(readVsCodeAwareness(), null, 2));

  console.log('\n=== ROUTER: ENVIRONMENT ===');
  console.log(JSON.stringify(await classifyIntent('حلل المشروع واذكر البيئة'), null, 2));

  console.log('\n=== SMART ENVIRONMENT ===');
  console.log(JSON.stringify(await sheikhaSmartRoute('حلل المشروع واذكر البيئة'), null, 2));

  console.log('\n=== SMART CODE ===');
  console.log(JSON.stringify(await sheikhaSmartRoute('اكتب دالة JavaScript تجمع رقمين فقط'), null, 2));

  console.log('\n=== SMART RAG ===');
  console.log(JSON.stringify(await sheikhaSmartRoute('rag: sheikha-runtime-chat'), null, 2));

  console.log('\n=== SMART REGISTRY ===');
  console.log(JSON.stringify(await sheikhaSmartRoute('registry: chat'), null, 2));
})();
