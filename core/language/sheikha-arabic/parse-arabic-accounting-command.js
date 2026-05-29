'use strict';

const PREPOSITIONS = new Set(['من', 'إلى', 'على', 'في', 'عن', 'بـ', 'ب']);
const VERBS = new Set(['حوّل', 'حول', 'سجل', 'بع', 'اشترى', 'قبض', 'دفع']);
const ACTORS = new Set(['المورد', 'المشتري', 'سوق', 'شيخة', 'الناقل']);

function parseArabicAccountingCommand(input) {
  const tokens = String(input || '').trim().split(/\s+/).filter(Boolean);

  const result = {
    input,
    فعل: null,
    فاعل: null,
    مفعول: null,
    حروف_جر: [],
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
      result.حروف_جر.push({
        حرف: token,
        يجر: tokens[i + 1] || null
      });
      continue;
    }

    if (result.فعل && result.فاعل && !result.مفعول && !PREPOSITIONS.has(token)) {
      result.مفعول = token;
    }
  }

  const source = result.حروف_جر.find(x => x.حرف === 'من')?.يجر || null;
  const destination = result.حروف_جر.find(x => x.حرف === 'إلى')?.يجر || null;

  if (result.فعل && source && destination) {
    result.أثر_محاسبي = {
      نوع: 'تحويل',
      من: source,
      إلى: destination,
      محل: result.مفعول,
      منفذ: result.فاعل
    };

    result.قيود.push({
      مدين: destination,
      دائن: source,
      بيان: `${result.فعل} ${result.فاعل || ''} ${result.مفعول || ''} من ${source} إلى ${destination}`.trim()
    });
  }

  return result;
}

module.exports = { parseArabicAccountingCommand };
