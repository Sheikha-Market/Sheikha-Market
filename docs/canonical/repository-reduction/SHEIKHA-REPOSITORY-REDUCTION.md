# SHEIKHA Repository Reduction

## الهدف
تقليل تضخم المستودع دون حذف عشوائي.

## القواعد
- Runtime المرجعية فقط: core/ runtime/ routes/ governance/ registry/ verification/ optimization/.
- data/ و dist/ و exports/ و runtime/audits/ ليست Runtime مرجعية.
- لا حذف تلقائي.
- أي إزالة أو أرشفة فعلية تحتاج مراجعة.
- الأولوية: منع Git inflation و filesystem inflation.
