# Sheikha Copilot — Installation & Setup Guide

**العربية** | [English](#english-version)

---

## النسخة العربية

### المتطلبات الأساسية

قبل تثبيت Sheikha Copilot، تأكد من توفر:

- **VS Code** الإصدار 1.85.0 أو أحدث
- **Node.js** الإصدار 18.0.0 أو أحدث (لتشغيل الخادم)
- **npm** أو **yarn** لإدارة الحزم
- متصفح إنترنت (Chrome, Firefox, Safari)
- خادم Sheikha يعمل على البورت 8080

### خطوات التثبيت

#### الطريقة 1: من ملف .vsix (الموصى به للاستخدام المحلي)

```bash
# 1. بناء ملف .vsix
cd sheikha-vscode-extension
bash build-vsix.sh

# 2. تثبيت الملف
code --install-extension dist/sheikha.sheikha-copilot-1.0.0.vsix

# 3. إعادة تحميل VS Code
# (Ctrl+R أو من قائمة Developer > Reload Window)
```

#### الطريقة 2: من واجهة VS Code

1. افتح **مدير الإضافات** (Ctrl+Shift+X)
2. انقر على قائمة ⋯ (المزيد)
3. اختر **تثبيت من VSIX** (Install from VSIX)
4. حدد ملف `sheikha.sheikha-copilot-*.vsix`
5. أعد تحميل VS Code

#### الطريقة 3: من سطر الأوامر (للمطورين)

```bash
# نسخ ملف .vsix إلى موقع يسهل الوصول إليه
cp dist/sheikha.sheikha-copilot-*.vsix ~/Downloads/

# تثبيت المحمول (Portable Installation)
code --extensions-dir ./extensions --install-extension ~/Downloads/sheikha.sheikha-copilot-*.vsix
```

### التحقق من التثبيت

بعد التثبيت، تحقق من:

```bash
# 1. قائمة الإضافات
code --list-extensions | grep sheikha

# أو من VS Code:
# Ctrl+Shift+X → ابحث عن "Sheikha Copilot"

# 2. تشغيل الخادم (في نافذة منفصلة)
cd /path/to/sheikha-main-portal
npm start
# أو: npm run dev

# 3. اختبار الاتصال
curl -s http://localhost:8080/api/sheikha/copilot/status | jq

# المتوقع:
# {
#   "success": true,
#   "data": {
#     "name": "Sheikha Copilot",
#     "version": "1.0.0",
#     "status": "active",
#     "shariaGuardrails": true
#   }
# }
```

### الإعدادات الأولية

#### 1. تكوين الاتصال بالخادم

افتح **إعدادات VS Code** (Ctrl+,):

```json
{
  "sheikha-copilot.serverUrl": "http://localhost:8080",
  "sheikha-copilot.apiTimeout": 30000,
  "sheikha-copilot.retryAttempts": 3
}
```

#### 2. اختر نموذج AI الافتراضي

```json
{
  "sheikha-copilot.defaultModel": "sheikha-copilot-base"
  // الخيارات:
  // - sheikha-copilot-base (سرعة + جودة)
  // - sheikha-copilot-chat (محادثات طويلة)
  // - sheikha-copilot-agent (مهام أتمتة)
  // - sheikha-copilot-sharia-safe (التحقق الشرعي الصارم)
}
```

#### 3. تفعيل/تعطيل الميزات

```json
{
  "sheikha-copilot.enableInlineCompletions": true,
  "sheikha-copilot.enableChat": true,
  "sheikha-copilot.enableAgent": true,
  "sheikha-copilot.enableNES": true,
  "sheikha-copilot.completionDelay": 200
}
```

### اختبار الأداة

بعد التثبيت مباشرة، اختبر الميزات الأساسية:

#### 1. افتح لوحة المحادثة

اضغط **Ctrl+Shift+I** أو:
- Ctrl+Shift+P → "Sheikha Copilot: Open Chat"

#### 2. اطلب منها شيء بسيط

```
السلام عليكم، كيف أكتب دالة JavaScript لحساب المجموع؟
```

المتوقع: ستجيب بكود JavaScript مع شرح بالعربية.

#### 3. جرب الإكمال التلقائي

1. افتح ملف `.js` جديد
2. اكتب: `function calculate(`
3. اضغط **Ctrl+I** أو انتظر 200ms
4. يجب أن ترى اقتراحات للإكمال

#### 4. تحقق من حالة النظام

Ctrl+Shift+P → "Sheikha Copilot: Show Status"

يجب أن تعرض:
- إصدار Copilot: 1.0.0
- حالة الخادم: متصل
- عدد النماذج: 4
- عدد اللغات المدعومة: 23

### استكشاف الأخطاء

#### المشكلة: الإضافة لم تظهر

**الحل:**
```bash
# 1. تحقق من VS Code version
code --version

# 2. أعد تحميل VS Code
# Ctrl+R

# 3. حاول التثبيت اليدوي
code --install-extension ~/Downloads/sheikha.sheikha-copilot-1.0.0.vsix --force
```

#### المشكلة: لا توجد اتصلاحية بالخادم

**الأعراض:** "محتويات وخادم Sheikha غير متصل"

**الحل:**
```bash
# 1. اختبر الخادم
curl http://localhost:8080/api/sheikha/copilot/status

# 2. إذا فشل، شغل الخادم
cd /path/to/sheikha-main-portal
npm start

# 3. تحقق من الإعدادات
# VS Code Settings → sheikha-copilot.serverUrl
# يجب أن يكون: http://localhost:8080
```

#### المشكلة: لا تظهر اقتراحات الإكمال

**الحل:**
```json
// في إعدادات VS Code:
{
  "sheikha-copilot.enableInlineCompletions": true,
  "sheikha-copilot.completionDelay": 200,
  "[javascript]": {
    "editor.inlineSuggestionsInsertMode": "replace"
  }
}
```

#### المشكلة: "منع شرعي" على طلب معين

**الأعراض:** رسالة "محتويات محجوبة بسبب معايير شيخة الشرعية"

هذا طبيعي! Sheikha Copilot يحظر:
- ربا (رiba) و استثمارات ربوية
- غش وعمليات احتيالية
- القمار و الرهان
- هacking و برامج خبيثة

جرب طلب شرعي بدلاً منه.

#### المشكلة: بطء في الاستجابة

**الحل:**
```json
{
  "sheikha-copilot.completionDelay": 500,  // زيادة التأخير
  "sheikha-copilot.apiTimeout": 60000,     // زيادة المهلة الزمنية
  "sheikha-copilot.enableOfflineMode": false
}
```

### الإزالة

إذا رغبت في إزالة Sheikha Copilot:

```bash
# من سطر الأوامر:
code --uninstall-extension sheikha.sheikha-copilot

# أو من VS Code:
# Ctrl+Shift+X → ابحث عن "Sheikha Copilot" → اضغط "Uninstall"
```

### الدعم

في حالة المشاكل أو الأسئلة:

- 📧 **البريد الإلكتروني:** support@sheikha.top
- 🌐 **الموقع:** https://sheikha.top
- 📱 **الهاتف:** +966 (معروف من البريد الرسمي)

---

## English Version

### System Requirements

Before installing Sheikha Copilot, ensure you have:

- **VS Code** v1.85.0 or later
- **Node.js** v18.0.0 or later (to run the backend server)
- **npm** or **yarn** for package management
- A web browser (Chrome, Firefox, Safari)
- Sheikha server running on port 8080

### Installation Steps

#### Method 1: From .vsix File (Recommended)

```bash
# 1. Build the .vsix file
cd sheikha-vscode-extension
bash build-vsix.sh

# 2. Install the extension
code --install-extension dist/sheikha.sheikha-copilot-1.0.0.vsix

# 3. Reload VS Code
# (Ctrl+R or Developer > Reload Window)
```

#### Method 2: From VS Code UI

1. Open **Extensions** (Ctrl+Shift+X)
2. Click the **⋯** menu (More)
3. Select **Install from VSIX**
4. Choose `sheikha.sheikha-copilot-*.vsix`
5. Reload VS Code

#### Method 3: From Command Line

```bash
# Copy the .vsix file to an accessible location
cp dist/sheikha.sheikha-copilot-*.vsix ~/Downloads/

# Install it
code --install-extension ~/Downloads/sheikha.sheikha-copilot-*.vsix
```

### Verify Installation

After installation, verify everything:

```bash
# 1. List extensions
code --list-extensions | grep sheikha

# 2. Start the Sheikha server (in separate terminal)
cd /path/to/sheikha-main-portal
npm start

# 3. Test API connection
curl -s http://localhost:8080/api/sheikha/copilot/status | jq

# Expected output:
# {
#   "success": true,
#   "data": {
#     "name": "Sheikha Copilot",
#     "version": "1.0.0",
#     "status": "active"
#   }
# }
```

### Initial Configuration

#### 1. Set Server Connection

Open VS Code Settings (Ctrl+,):

```json
{
  "sheikha-copilot.serverUrl": "http://localhost:8080",
  "sheikha-copilot.apiTimeout": 30000,
  "sheikha-copilot.retryAttempts": 3
}
```

#### 2. Choose Default AI Model

```json
{
  "sheikha-copilot.defaultModel": "sheikha-copilot-base",
  // Options:
  // - sheikha-copilot-base (balanced)
  // - sheikha-copilot-chat (conversations)
  // - sheikha-copilot-agent (automation)
  // - sheikha-copilot-sharia-safe (strict Sharia checks)
}
```

#### 3. Enable/Disable Features

```json
{
  "sheikha-copilot.enableInlineCompletions": true,
  "sheikha-copilot.enableChat": true,
  "sheikha-copilot.enableAgent": true,
  "sheikha-copilot.enableNES": true,
  "sheikha-copilot.completionDelay": 200
}
```

### Quick Test

#### 1. Open the Chat Panel

Press **Ctrl+Shift+I** or run:
- Ctrl+Shift+P → "Sheikha Copilot: Open Chat"

#### 2. Ask a Simple Question

```
Write me a JavaScript function to calculate the sum of an array
```

Expected: Response with code and explanation.

#### 3. Try Inline Completions

1. Create a new `.js` file
2. Type: `function calculate(`
3. Press **Ctrl+I** or wait 200ms
4. You should see completion suggestions

#### 4. Check System Status

Ctrl+Shift+P → "Sheikha Copilot: Show Status"

Should display:
- Copilot Version: 1.0.0
- Server Status: Connected
- Models Available: 4
- Languages Supported: 23

### Troubleshooting

#### Issue: Extension Doesn't Appear

**Solution:**
```bash
# 1. Check VS Code version
code --version

# 2. Reload VS Code
# Ctrl+R

# 3. Force reinstall
code --install-extension ~/Downloads/sheikha.sheikha-copilot-1.0.0.vsix --force
```

#### Issue: Cannot Connect to Server

**Symptoms:** "Cannot connect to Sheikha server"

**Solution:**
```bash
# 1. Test the server
curl http://localhost:8080/api/sheikha/copilot/status

# 2. If failed, start the server
cd /path/to/sheikha-main-portal
npm start

# 3. Verify settings
# VS Code Settings → sheikha-copilot.serverUrl
# Must be: http://localhost:8080
```

#### Issue: Inline Completions Not Showing

**Solution:**
```json
{
  "sheikha-copilot.enableInlineCompletions": true,
  "sheikha-copilot.completionDelay": 200,
  "[javascript]": {
    "editor.inlineSuggestionsInsertMode": "replace"
  }
}
```

#### Issue: "Sharia Compliance Block" on Request

**Symptoms:** "Content blocked by Sheikha compliance standards"

This is normal! Sheikha Copilot blocks:
- riba (usury) and interest-based systems
- fraud and deceptive practices
- gambling and betting
- hacking and malicious code

Try a halal-compliant request instead.

#### Issue: Slow Responses

**Solution:**
```json
{
  "sheikha-copilot.completionDelay": 500,
  "sheikha-copilot.apiTimeout": 60000,
  "sheikha-copilot.enableOfflineMode": false
}
```

### Uninstall

To remove Sheikha Copilot:

```bash
# From command line:
code --uninstall-extension sheikha.sheikha-copilot

# Or from VS Code:
# Ctrl+Shift+X → Search "Sheikha Copilot" → Click Uninstall
```

### Support

For issues or questions:

- 📧 **Email:** support@sheikha.top
- 🌐 **Website:** https://sheikha.top
- 📱 **Phone:** Available from official email

---

**Version:** 1.0.0  
**Last Updated:** March 16, 2026  
**License:** Proprietary (Sheikha Platform)
