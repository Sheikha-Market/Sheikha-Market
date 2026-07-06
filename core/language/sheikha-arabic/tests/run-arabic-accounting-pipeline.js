'use strict';

const { runArabicAccountingPipeline } = require('../runtime/sheikha-arabic-accounting-pipeline');

const samples = [
  'حوّل المورد مبلغًا من حساب_المشتري إلى حساب_سوق_شيخة',
  'دفع المشتري مبلغًا إلى حساب_سوق_شيخة',
  'سجل المحاسب فاتورة على المشتري في حساب_المبيعات'
];

for (const sample of samples) {
  console.log(JSON.stringify(runArabicAccountingPipeline(sample), null, 2));
}
