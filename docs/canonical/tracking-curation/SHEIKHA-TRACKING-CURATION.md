# SHEIKHA Tracking Curation

## الهدف
تقليل ضوضاء git status ومنع تتبع الملفات غير المرجعية.

## القواعد
- التتبع الأساسي للمسارات المرجعية فقط.
- data/ و dist/ و exports/ و runtime/audits/ و tooling ليست Runtime مرجعية.
- لا `git add .` عشوائي.
- أي تتبع جديد يحتاج review + verification + governance.
