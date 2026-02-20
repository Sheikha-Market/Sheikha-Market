# استكشاف أخطاء Node والتشغيل — بوابة شيخه

## خطأ: `No such file or directory` أو `cd: no such file or directory: sheikha-main-portal`

### السبب

الأمر يُنفَّذ من **المجلد الرئيسي للمستخدم** (`~`) وليس من داخل مجلد المشروع، فالمسار `sheikha-main-portal` غير موجود هناك.

### الحل

انتقل أولاً إلى مجلد شيخه ثم شغّل السكربت:

```bash
cd "/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha"
bash شغل-البوابة.sh
```

أو مباشرة إلى مجلد البوابة:

```bash
cd "/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal"
source ~/.nvm/nvm.sh
nvm use 20
npm install
npm start
```

ملف **تشغيل-الآن-انسخ-هذه-الأوامر.txt** في مجلد Sheikha يحتوي نفس الأوامر جاهزة للنسخ.

---

## خطأ: `dyld: Symbol not found: (__ZNSt3__122__libcpp_verbose_abortEPKcz)` و `Abort trap: 6`

### ماذا يعني؟

نسخة **Node.js** التي يشغّلها الأمر `node server.js` مبنية بمكتبات C++ أحدث من الموجودة في نظامك (أو العكس)، فيفشل التشغيل عند تحميل `libc++.1.dylib`.

غالباً يظهر عندما:
- Node مثبت في مكان غير معتاد (مثل `/Users/اسمك/node_modules/node/bin/node`).
- تم تحديث نظام macOS ولم تُحدَّث Node.
- تثبيت Node قديم أو تالف.

### الحل الأسرع إن كنت تستخدم nvm (مثل Node v25)

Node v25 مبني لمكتبات أحدث؛ على **macOS 12** يستحسن استخدام **Node 18 أو 20 LTS**:

```bash
nvm install 20
nvm use 20
```

ثم من مجلد البوابة:

```bash
cd "/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal"
npm install
npm start
```

(يمكنك استخدام `nvm install 18` و `nvm use 18` بدلاً من 20 إن رغبت.)

---

### الحل الموصى به: تثبيت Node من الموقع الرسمي

1. **حمّل Node.js LTS** (إصدار طويل الدعم) من:  
   **https://nodejs.org**  
   اختر النسخة المناسبة لـ macOS (Apple Silicon أو Intel).

2. **ثبّت** الملف المحمّل (`.pkg`) كأي برنامج عادي.

3. **أغلق نافذة الطرفية (Terminal)** وافتحها من جديد حتى يتحدّث مسار `node`.

4. **تحقق من المسار:**
   ```bash
   which node
   ```
   يُفضّل أن تكون النتيجة: **`/usr/local/bin/node`** (أو مسار مشابه للنظام، وليس داخل مجلدك الشخصي).

5. **تحقق من النسخة:**
   ```bash
   node -v
   ```
   يجب أن تظهر نسخة مثل `v20.x.x` أو `v22.x.x`.

6. **من مجلد البوابة شغّل:**
   ```bash
   cd "/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal"
   npm install
   npm start
   ```

### بديل: تثبيت Node عبر Homebrew

إذا كان Homebrew مثبتاً لديك:

```bash
brew install node
```

ثم أغلق الطرفية وافتحها من جديد، وتحقّق بـ `which node` و `node -v`، ثم نفّذ `npm install` و `npm start` من مجلد البوابة.

### إذا ظهر أن Node يأتي من مجلدك الشخصي

عند تنفيذ `which node` إن ظهر شيء مثل:

```
/Users/salmanalrajeh/node_modules/node/bin/node
```

فهذا تثبيت خاطئ أو قديم. يمكنك:

- **حذف هذا المسار** (مجلد `node` داخل `~/node_modules/`) إن لم تكن تحتاجه لأي مشروع آخر، ثم تثبيت Node من الموقع الرسمي كما أعلاه، **أو**
- **تعديل متغير PATH** في ملف الطرفية (مثل `~/.zshrc`) بحيث يكون مسار Node الرسمي (مثل `/usr/local/bin`) يظهر **قبل** أي مسار داخل مجلدك الشخصي.

بعد تصحيح مصدر Node، أعد تشغيل الطرفية ثم نفّذ من مجلد البوابة:

```bash
npm install && npm start
```

---

## أخطاء أخرى

- **`cd: no such file or directory`** — استخدم المسار الكامل لمجلد `sheikha-main-portal` (انظر `تشغيل-الآن.txt`).
- **`Missing script: "start"`** — أنت لست داخل مجلد `sheikha-main-portal`؛ نفّذ `cd` للمسار الكامل أولاً.
- **`Cannot GET /api/business-model`** — الخادم غير مشغّل؛ شغّله بـ `npm start` من مجلد البوابة ثم حدّث الصفحة.
