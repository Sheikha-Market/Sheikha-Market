'use strict';

const PREPOSITIONS = new Set(['من', 'إلى', 'على', 'في', 'عن', 'بـ', 'ب']);
const VERBS = new Set(['حوّل', 'حول', 'سجل', 'سجّل', 'بع', 'باع', 'اشترى', 'قبض', 'دفع', 'سدّد', 'سدد', 'قيّد', 'قيد']);
const ACTORS = new Set(['المورد', 'المشتري', 'سوق', 'شيخة', 'الناقل', 'المحاسب', 'العميل', 'المدير']);

function classifyToken(token) {
  if (VERBS.has(token)) return 'فعل';
  if (PREPOSITIONS.has(token)) return 'حرف_جر';
  if (ACTORS.has(token)) return 'فاعل_محتمل';
  if (token.startsWith('حساب')) return 'حساب';
  if (/^\d+(\.\d+)?$/.test(token)) return 'رقم';
  return 'اسم';
}

function nextNonPreposition(tokens, start) {
  for (let i = start; i < tokens.length; i++) {
    if (!PREPOSITIONS.has(tokens[i])) return tokens[i];
  }
  return null;
}

function parseArabicAccountingCommand(input) {
  const tokens = String(input || '').trim().split(/\s+/).filter(Boolean);

  const result = {
    input,
    tokens: tokens.map((token, index) => ({ index, token, نوع: classifyToken(token) })),
    الجملة: tokens.length && VERBS.has(tokens[0]) ? 'فعلية' : 'اسمية',
    فعل: null,
    فاعل: null,
    مفعول: null,
    حروف_جر: [],
    علاقات: [],
    قيود: [],
    أثر_محاسبي: null
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!result.فعل && VERBS.has(token)) {
      result.فعل = token;
      continue;
    }

    if (result.فعل && !result.فاعل && ACTORS.has(token)) {
      result.فاعل = token;
      continue;
    }

    if (PREPOSITIONS.has(token)) {
      const governed = tokens[i + 1] || null;
      result.حروف_جر.push({ حرف: token, يجر: governed });
      result.علاقات.push({ عامل: token, معمول: governed, قاعدة: 'حرف الجر يجر الاسم بعده' });
      continue;
    }

    if (result.فعل && result.فاعل && !result.مفعول && !PREPOSITIONS.has(token)) {
      result.مفعول = token;
    }
  }

  const source = result.حروف_جر.find(x => x.حرف === 'من')?.يجر || null;
  const destination = result.حروف_جر.find(x => x.حرف === 'إلى')?.يجر || null;
  const liability = result.حروف_جر.find(x => x.حرف === 'على')?.يجر || null;
  const container = result.حروف_جر.find(x => x.حرف === 'في')?.يجر || null;

  if (source && destination) {
    result.أثر_محاسبي = { نوع: 'تحويل', منفذ: result.فاعل, محل: result.مفعول, من: source, إلى: destination };
    result.قيود.push({ مدين: destination, دائن: source, بيان: `${result.فعل} ${result.فاعل || ''} ${result.مفعول || ''} من ${source} إلى ${destination}`.trim() });
  } else if (destination) {
    result.أثر_محاسبي = { نوع: 'قبض/دفع', منفذ: result.فاعل, محل: result.مفعول, إلى: destination };
    result.قيود.push({ مدين: destination, دائن: result.فاعل || 'غير_محدد', بيان: `${result.فعل} ${result.فاعل || ''} ${result.مفعول || ''} إلى ${destination}`.trim() });
  }

  if (liability) result.قيود.push({ على: liability, بيان: `إثبات التزام على ${liability}` });
  if (container) result.علاقات.push({ عامل: 'في', معمول: container, قاعدة: 'في تفيد الوعاء أو الحساب الحاوي' });

  return result;
}

module.exports = { parseArabicAccountingCommand };
