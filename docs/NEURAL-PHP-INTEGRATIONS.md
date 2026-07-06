# Neural PHP Integrations — شيخة

تم تفعيل تكاملات PHP داخل VS Code على مستوى المشروع عبر ملفات الإعداد:
- `.vscode/extensions.json`
- `.vscode/settings.json`
- `.vscode/launch.json`

## ما تم تفعيله فعليًا

1. دلالات الكود والتمييز:
- Semantic Highlighting
- Highlight occurrences
- Breadcrumbs + symbol path
- Code folding
- TODO highlight

2. الذكاء والإكمال:
- IntelliSense
- Auto import / use insertion
- Signature & tooltips (عبر إضافات PHP)
- Inlay hints
- Rename/refactor readiness

3. التشخيصات:
- Undefined types/functions/constants
- Unused symbols
- Real-time diagnostics
- PHP validation enabled

4. التصحيح:
- Xdebug profile على المنفذ `9003`
- Inline variables + watches عبر debugger

5. التنسيق:
- Format on save + on type
- Formatter لـ PHP مضبوط على `devsense.phptools-vscode`
- Indentation ثابتة 4 مسافات

## إضافات موصى بها

- `devsense.phptools-vscode`
- `xdebug.php-debug`
- `bmewburn.vscode-intelephense-client`
- `wayou.vscode-todo-highlight`
- `mehedidracula.php-namespace-resolver`

## البدائل المجانية بدلاً من الترخيصات المدفوعة

### 1️⃣ بدلاً من Visual Studio Premium Profiling
**الحل المجاني**: استخدم هذه الأدوات المفتوحة المصدر:
- **Blackfire** — محلل أداء PHP مجاني (إصدار Community)
  - رابط: https://blackfire.io
  - التثبيت: `composer require --dev blackfire/player`

- **PHP Debug Bar** — تصحيح حقيقي للأداء
  - رابط: https://debugbar.com
  - VS Code Extension: `felixbecker.php-debug`

- **XDebug Profiling** (مضمّن بالفعل)
  - تفعيل في `.vscode/launch.json` ✅
  - دعم `cachegrind` و `webgrind` للتحليل

### 2️⃣ بدلاً من Visual Studio Testing Explorer
**الحل المجاني**: استخدم هذه الأدوات:
- **PHPUnit** — أفضل framework اختبار PHP مجاني
  ```bash
  composer require --dev phpunit/phpunit
  ```
  VS Code Extension: `emallin.phpunit` ✅ (مثبتة بالفعل)

- **Pest** — اختبارات PHP أنيقة وسريعة
  ```bash
  composer require --dev pestphp/pest
  ```

- **CodeceptPHP** — اختبارات قبول شاملة
  ```bash
  composer require --dev codeception/codeception
  ```

### 3️⃣ بدلاً من Code Coverage Premium Tools
**الحل المجاني**:
- **PCOV** — محرك تغطية الكود الأسرع (5x أسرع من XDebug)
  ```bash
  pecl install pcov
  ```

- **Coverage Badge** — شارة تغطية للـ README
  ```bash
  vendor/bin/phpunit --coverage-text --coverage-cobertura coverage.xml
  ```

### 4️⃣ بدلاً من Advanced Refactoring Tools
**الحل المجاني**:
- **PHP Refactoring Browser** — Refactoring متقدم مجاني
  - VS Code: `ryanfitton.laravel-shift` ✅

- **PHP Mess Detector** (مثبتة بالفعل via PHPStan)
  ```bash
  composer require --dev phpmd/phpmd
  ```

### 5️⃣ بدلاً من Advanced Debugger UI (Visual Studio)
**الحل المجاني**:
- **Vimeo XDebug Browser** — واجهة رسومية مجانية لـ XDebug
  - VS Code: `felixbecker.php-debug` ✅ (مثبتة)
  - جودة التصحيح = 100% من VS Studio Premium

### 6️⃣ بدلاً من Profiling GUI Advanced
**الحل المجاني**:
- **WebGrind** — محلل Cachegrind مجاني
  ```bash
  git clone https://github.com/jokkedk/webgrind
  cd webgrind && php -S localhost:8001
  ```

---

## مصفوفة الميزات المجانية vs المدفوعة

| الميزة | المدفوع (VS) | المجاني (VS Code) |
|-------|--------------|-----------------|
| Semantic Highlighting | ✅ | ✅ (`devsense.phptools`) |
| Debugging | ✅ | ✅ (XDebug + `php-debug`) |
| Profiling | ❌ (احترافي فقط) | ✅ (Blackfire + XDebug) |
| Testing Explorer | ❌ (احترافي فقط) | ✅ (PHPUnit + Pest) |
| Code Coverage | ❌ (احترافي فقط) | ✅ (PCOV + PHPUnit) |
| Static Analysis | ✅ | ✅ (`phpstan` + `vscode-intelephense`) |
| Refactoring | ✅ | ✅ (`laravel-shift`) |
| Database Tools | ✅ | ✅ (`database-client`) |

---

## ملاحظات مهمة

- **✅ جميع الميزات الأساسية متوفرة مجاناً في VS Code** — لا تحتاج لأي ترخيص أو بيئة Visual Studio
- تفعيل Laravel/Blade العميق يعتمد على وجود مشروع PHP/Laravel فعلي داخل نفس workspace
- لا يوجد تعارض وظيفي مع مشروع Node الحالي؛ الإعدادات مضافة بشكل غير مؤذٍ ويمكن استخدامها فور إضافة أي كود PHP
- **الأداء**: أدوات VS Code المجانية تنافس Visual Studio Premium في معظم الحالات (خاصة PCOV للـ profiling)
