# سياسة فرض حوكمة الدمج في منظومة شيخة

## الهدف الأعلى

لا ضرر ولا ضرار.

## القاعدة الأساسية

لا يسمح بأي دمج أو commit أو push داخل المسارات المحمية إلا بعد:

- classification
- ownership
- governance review
- integrity verification
- safety validation

## المسارات المحمية

- core/
- runtime/
- governance/
- scripts/
- tools/governance/
- routes/

## قواعد المنع

يتم منع:
- الأسرار
- المفاتيح
- ملفات البيئة الحقيقية
- runtime غير المصنف
- الملفات مجهولة الملكية
- التعديلات غير المحكومة

## القرار

أي خرق يؤدي إلى:
BLOCKED
