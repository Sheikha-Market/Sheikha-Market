'use strict';

const JAR = new Set(['من', 'الى', 'إلى', 'على', 'في', 'عن', 'ب', 'بـ']);

function executeIrab(parsed) {
  const roles = [];

  if (parsed.فعل) roles.push({ role: 'فعل', token: parsed.فعل, حكم: 'عامل' });
  if (parsed.فاعل) roles.push({ role: 'فاعل', token: parsed.فاعل, إعراب: 'مرفوع' });
  if (parsed.مفعول) roles.push({ role: 'مفعول', token: parsed.مفعول, إعراب: 'منصوب' });

  for (const relation of parsed.حروف_جر || []) {
    roles.push({
      role: 'جار_ومجرور',
      عامل: relation.حرف,
      معمول: relation.يجر,
      إعراب: 'مجرور',
      قاعدة: 'حرف الجر يجر الاسم بعده'
    });
  }

  return {
    الجملة: parsed.الجملة,
    الإعراب: roles,
    صالح_تنفيذيا: Boolean(parsed.فعل && (parsed.فاعل || parsed.مفعول || parsed.حروف_جر?.length))
  };
}

module.exports = { executeIrab };
