'use strict';

const ROOTS = {
  حول: ['حوّل', 'حول', 'تحويل', 'محول', 'تحويلات'],
  سجل: ['سجل', 'سجّل', 'تسجيل', 'مسجل', 'سجل'],
  دفع: ['دفع', 'دفعة', 'مدفوع', 'دافع'],
  قبض: ['قبض', 'قبضه', 'مقبوض', 'قابض'],
  قيد: ['قيد', 'قيّد', 'قيد', 'تقييد'],
  بيع: ['باع', 'بع', 'بيع', 'مبيع', 'بائع']
};

function analyzeRoot(token) {
  const t = String(token || '').replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه');
  for (const [root, forms] of Object.entries(ROOTS)) {
    if (forms.includes(token) || forms.includes(t)) {
      return { token, root, matched: true };
    }
  }
  return { token, root: null, matched: false };
}

module.exports = { analyzeRoot };
