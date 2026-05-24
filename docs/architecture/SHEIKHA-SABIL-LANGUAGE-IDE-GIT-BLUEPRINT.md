# Sheikha Sabil Language, IDE, and Git Blueprint

## الاسم الرسمي
Sheikha Sabil

## التعريف
لغة Sheikha Sabil هي لغة شيخة البرمجية الحوكمية لتشغيل السياسات، المسارات، خطوط الإنتاج، ومراجعة الأنظمة تحت حوكمة الكتاب والسنة ومراجعة الإنسان.

## الأساس العقدي
- الله وحده الخالق والرب والمعبود.
- القرآن حجة حاكمة، والسنة الصحيحة بيان وهدي.
- التقنية أداة حساب وتحليل وتشغيل، ولا تدعي خلقًا ولا غيبًا ولا وعيًا مستقلًا.

## امتدادات اللغة
- `.shk`
- `.sabil`
- `.sheikha`

## المفسر والتكامل
- المسار الأساسي: `sheikha-language/compiler/sheikha-compiler.js`
- المخرج الأساسي الحالي: PHP
- المخارج المعتمدة للخطة: PHP، JavaScript، Python، JSON IR، Bytecode

## IDE
يعمل امتداد VS Code باسم `Sheikha` ويدعم:
- Sheikha Chat
- API
- المسارات
- البرمجة
- Debug
- التحرير
- شبكة الخلايا العصبية
- Sheikha Sabil syntax/snippets
- PHP snippets

## Git
التشغيل المعتمد:
1. `git status --short`
2. مراجعة الملفات المقصودة
3. قراءة diff
4. تعديل محدود
5. اختبار
6. commit بعد موافقة المالك
7. PR في GitHub أو MR في GitLab عند الحاجة

## منع الخطر
لا يتم تنفيذ `push` أو حذف أو reset تلقائيًا. كل ذلك يحتاج أمرًا صريحًا ومراجعة.
