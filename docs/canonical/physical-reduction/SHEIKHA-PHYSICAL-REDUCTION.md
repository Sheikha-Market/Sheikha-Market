# SHEIKHA Physical Repository Reduction

## الهدف
تقليل التضخم الفعلي للمستودع دون حذف عشوائي.

## المجالات المعزولة
- sheikha-vscode-extension/
- runtime/audits/
- data/
- dist/
- exports/
- scripts/
- tools/

## القواعد
- لا حذف تلقائي.
- الاحتفاظ فقط بآخر snapshots لاحقًا.
- vscode-extension ليست authoritative runtime.
- أي إزالة فعلية تحتاج review + verification + governance.
