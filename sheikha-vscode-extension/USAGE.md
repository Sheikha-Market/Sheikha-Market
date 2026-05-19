# Sheikha Copilot — Usage Guide & Examples

**العربية** | [English](#english-version)

---

## النسخة العربية

### البدء السريع

بعد التثبيت، لديك 6 طرق لاستخدام Sheikha Copilot:

| الميزة | الاختصار | الوصف |
|--------|----------|-------|
| **فتح المحادثة** | Ctrl+Shift+I | محادثة مباشرة مع Copilot |
| **إكمال سطري** | Ctrl+I | اقتراحات للكود أثناء الكتابة |
| **Next Edit Suggestions** | Ctrl+Space | توقع التعديل التالي |
| **Inline Chat** | Ctrl+Alt+I | تعديل الكود المختار |
| **وضع Agent** | Ctrl+Shift+A | تنفيذ مهام متعددة الخطوات |
| **عرض الحالة** | Ctrl+Shift+P > Status | معلومات النظام |

### مثال 1: إكتابة دالة بالمحادثة

#### الخطوات:

1. اضغط **Ctrl+Shift+I** لفتح لوحة المحادثة
2. اكتب السؤال:
   ```
   أريد دالة JavaScript لحساب مضروب العدد (Factorial)
   مع التعليقات بالعربية
   ```
3. اضغط Enter
4. Copilot سيرد مع الكود:
   ```javascript
   /**
   * حساب مضروب العدد
   * @param {number} n - العدد المراد حساب مضروبه
   * @return {number} المضروب
   */
   function factorial(n) {
     // التحقق من أن العدد موجب
     if (n < 0) return undefined;
     
     // الحالة الأساسية
     if (n === 0 || n === 1) return 1;
     
     // الدالة العودية
     return n * factorial(n - 1);
   }
   ```

#### ميزات المحادثة:

- **معالجة متعددة اللغات:** أسأل بالعربية، أجب بالعربية
- **السياق:** Copilot يتذكر الأسئلة السابقة في نفس المحادثة
- **Copy to Editor:** انقر على "نسخ" لإدراج الكود في الملف

---

### مثال 2: الإكمال التلقائي أثناء الكتابة

#### الخطوات:

1. افتح ملف جديد `.js`
2. اكتب:
   ```javascript
   function validateEmail(
   ```
3. انتظر **200ms** (أو اضغط **Ctrl+I**)
4. ستظهر اقتراحات:
   - `validateEmail(email) { return email.includes('@'); }`
   - `validateEmail(email, options = {}) { ... }`
   - `validateEmail(email) { const regex = /^[^@]+@[^@]+\.[^@]+$/; return regex.test(email); }`

#### اختيار الاقتراح:

- اضغط **Tab** أو **Enter** لقبول الأول
- اضغط **↑** / **↓** للتنقل بين الاقتراحات
- اضغط **Esc** لإلغاء

---

### مثال 3: تعديل الكود مع Inline Chat

#### الحالة: لديك كود قديم تريد تحسينه

```javascript
function getData(id) {
  return fetch('http://api.example.com/data/' + id)
    .then(res => res.json())
    .then(data => data);
}
```

#### الخطوات:

1. حدد الدالة بالكامل
2. اضغط **Ctrl+Alt+I**
3. اكتب التعليمة:
   ```
   حول إلى async/await وأضف معالجة الأخطاء
   ```
4. Copilot سيعيد الكود:
   ```javascript
   async function getData(id) {
     try {
       const response = await fetch(`http://api.example.com/data/${id}`);
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       const data = await response.json();
       return data;
     } catch (error) {
       console.error('Failed to fetch data:', error);
       throw error;
     }
   }
   ```

---

### مثال 4: Next Edit Suggestions (NES)

#### الحالة: تكتب كود وتريد التنبؤ بالخطوة التالية

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  // الآن ستقترح Copilot ما تحتاجه بعده
```

#### اضغط **Ctrl+Space** :

Copilot يقترح:
```javascript
  validate() {
    if (!this.name || this.name.trim() === '') {
      throw new Error('Name is required');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Invalid email');
    }
    return true;
  }
}
```

---

### مثال 5: وضع Agent للمهام المعقدة

#### الحالة: تريد أتمتة مهمة متعددة الخطوات

#### الخطوات:

1. اضغط **Ctrl+Shift+P** → "Sheikha Copilot: Start Agent"
2. صف المهمة:
   ```
   أريد إنشاء ملف database.js مع نموذج User:
   - اتصال بـ MongoDB
   - دالة create
   - دالة findById
   - دالة update
   ```
3. Agent سيقوم بـ:
   - ✅ بناء الخطة (عرض الخطوات)
   - ✅ إنشاء الملف
   - ✅ كتابة الكود
   - ✅ تعليقات توضيحية

#### رؤية التقدم:

ستظهر نافذة "Agent Progress":
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Sheikha Agent in Progress

Task: Create database layer with MongoDB models

Step 1/4: تحليل المتطلبات... ✅
Step 2/4: إنشاء هيكل الملف... ✅
Step 3/4: كتابة نموذج User... ⏳ (جاري)
Step 4/4: إضافة معالجة الأخطاء... ⏳

Advanced: النماذج المدعومة: 4 | المدة المتوقعة: 45 ثانية
```

---

### مثال 6: اختيار نموذج AI مختلف

#### الحالة: تريد استخدام نموذج مختلف لمهمة معينة

#### من لوحة المحادثة:

1. اضغط **⚙️** (إعدادات) أعلى المحادثة
2. اختر نموذجًا:
   - **Sheikha Base** — توازن السرعة والجودة
   - **Sheikha Chat** — محادثات طويلة ومفصلة
   - **Sheikha Agent** — تنفيذ مهام معقدة
   - **Sheikha Sharia-Safe** — تحقق شرعي صارم

#### أو من الإعدادات:

```json
// Settings.json
{
  "sheikha-copilot.defaultModel": "sheikha-copilot-agent"
}
```

---

### مثال 7: استكشاف لغات مدعومة

Sheikha Copilot يدعم 23 لغة برمجة:

```javascript
// 1. JavaScript/TypeScript
const sum = (a, b) => a + b;

// 2. Python
def calculate(x, y): return x + y

// 3. Java
public int calculate(int a, int b) { return a + b; }

// 4. C++
int calculate(int a, int b) { return a + b; }

// 5. Rust
fn calculate(a: i32, b: i32) -> i32 { a + b }

// 6. Go
func Calculate(a, b int) int { return a + b }

// 7. SQL
SELECT SUM(amount) FROM transactions WHERE user_id = 1;

// 8. HTML/CSS
<div class="container">...</div>

// و 15 لغة أخرى...
```

#### تحرير اللغة:

Copilot يكتشف اللغة تلقائيًا من امتداد الملف:
- `.js` / `.ts` → JavaScript/TypeScript
- `.py` → Python
- `.java` → Java
- إلخ.

---

### مثال 8: الحواجز الشرعية في التطبيق

#### الحالة: تطلب شيئًا غير شرعي

```
اكتب لي كود لحساب الفائدة المركبة (compound interest)
```

**النتيجة:**
```
⛔ محتويات محجوبة بسبب معايير شيخة الشرعية

السبب: الطلب يتعلق بـ "الربا" (Riba/Usury)

الكلمات المحظورة: ["interest", "riba"]

سياسة شيخة: حرام - لا يسمح في المنصة الإسلامية

💡 البديل الشرعي:
  - حساب الربح الثابت (Fixed Profit)
  - صيغ المضاربة الشرعية
  - استثمار صكوك إسلامية
```

---

### نصائح وحيل

#### 1. استخدم السياق

```javascript
/**
 * Function to calculate Zakat
 * @param {number} wealth - الثروة الكلية
 * @param {string} type - نوع الزكاة: "gold", "silver", "wealth"
 */
```

ثم في المحادثة: "أكمل هذه الدالة بناءً على التعليقات"

#### 2. اطلب شرح الكود

```javascript
// حدد الكود
const complexFunction = ...

// اضغط Ctrl+Alt+I
// اكتب: "شرح هذا الكود بالتفصيل"
```

#### 3. استخدم Refactoring

```javascript
// الكود القديم
if (x > 0) {
  if (y > 0) {
    console.log("positive");
  } else {
    console.log("negative");
  }
} else {
  console.log("zero");
}

// حدد + Ctrl+Alt+I + اكتب: "بسّط هذا الكود"
// النتيجة:
const result = x > 0 && y > 0 ? "positive" : x > 0 ? "negative" : "zero";
```

#### 4. اطلب اختبارات

```javascript
// حدد الدالة
function validateEmail(email) { ... }

// اضغط Ctrl+Alt+I
// اطلب: "اكتب اختبارات Jest لهذه الدالة"
```

#### 5. توثيق سريع

```javascript
// اكتب الدالة
function getUserById(id) {
  return db.users.findOne({ id });
}

// حدد + Ctrl+Alt+I
// اطلب: "أضف JSDoc comments"
```

---

### الأوامر المتاحة

من **Ctrl+Shift+P**:

```
> Sheikha Copilot: Open Chat
> Sheikha Copilot: Trigger Completion
> Sheikha Copilot: Start Agent
> Sheikha Copilot: Show Status
> Sheikha Copilot: Next Edit Suggestions
> Sheikha Copilot: Inline Chat
```

---

### إعدادات الأداء

إذا كنت على اتصال بطيء:

```json
{
  "sheikha-copilot.completionDelay": 500,      // زد التأخير
  "sheikha-copilot.maxCompletions": 1,         // قلل عدد الاقتراحات
  "sheikha-copilot.enableNES": false,          // عطّل التنبؤ
  "sheikha-copilot.apiTimeout": 60000          // زد المهلة
}
```

---

## English Version

### Quick Start

After installation, you have 6 ways to use Sheikha Copilot:

| Feature | Shortcut | Description |
|---------|----------|-------------|
| **Open Chat** | Ctrl+Shift+I | Direct conversation with Copilot |
| **Inline Completions** | Ctrl+I | Code suggestions while typing |
| **Next Edit Suggestions** | Ctrl+Space | Predict next code edit |
| **Inline Chat** | Ctrl+Alt+I | Edit selected code |
| **Agent Mode** | Ctrl+Shift+A | Execute multi-step tasks |
| **Show Status** | Ctrl+Shift+P > Status | System information |

### Example 1: Write a Function via Chat

#### Steps:

1. Press **Ctrl+Shift+I** to open chat
2. Ask:
   ```
   Write me a JavaScript function to calculate the factorial of a number
   with comments
   ```
3. Press Enter
4. Copilot responds with code:
   ```javascript
   /**
   * Calculate factorial of a number
   * @param {number} n - The number
   * @return {number} The factorial
   */
   function factorial(n) {
     if (n < 0) return undefined;
     if (n === 0 || n === 1) return 1;
     return n * factorial(n - 1);
   }
   ```

#### Chat Features:

- **Multilingual:** Ask in Arabic, get response in Arabic
- **Context Memory:** Remembers previous questions in same conversation
- **Copy to Editor:** Click "Copy" to insert code into your file

---

### Example 2: Inline Completions

#### Steps:

1. Open a new `.js` file
2. Type:
   ```javascript
   function validateEmail(
   ```
3. Wait **200ms** (or press **Ctrl+I**)
4. See suggestions:
   - `validateEmail(email) { return email.includes('@'); }`
   - `validateEmail(email, options = {}) { ... }`
   - `validateEmail(email) { const regex = /^[^@]+@[^@]+\.[^@]+$/; ... }`

#### Accept Suggestion:

- Press **Tab** or **Enter** for first
- **↑** / **↓** to navigate
- **Esc** to cancel

---

### Example 3: Edit Code with Inline Chat

#### Scenario: You have old code to improve

```javascript
function getData(id) {
  return fetch('http://api.example.com/data/' + id)
    .then(res => res.json())
    .then(data => data);
}
```

#### Steps:

1. Select the entire function
2. Press **Ctrl+Alt+I**
3. Type instruction:
   ```
   Convert to async/await and add error handling
   ```
4. Get improved code:
   ```javascript
   async function getData(id) {
     try {
       const response = await fetch(`http://api.example.com/data/${id}`);
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       return await response.json();
     } catch (error) {
       console.error('Failed to fetch:', error);
       throw error;
     }
   }
   ```

---

### Example 4: Next Edit Suggestions

#### Scenario: Type code and want to predict next step

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  // Copilot predicts what comes next
```

#### Press **Ctrl+Space** :

Get suggestion:
```javascript
  validate() {
    if (!this.name) throw new Error('Name required');
    if (!this.email.includes('@')) throw new Error('Invalid email');
    return true;
  }
}
```

---

### Example 5: Agent Mode for Complex Tasks

#### Scenario: Automate multi-step task

#### Steps:

1. Press **Ctrl+Shift+P** → "Sheikha Copilot: Start Agent"
2. Describe task:
   ```
   Create a database.js with User model:
   - MongoDB connection
   - create() function
   - findById() function
   - update() function
   ```
3. Agent executes:
   - ✅ Plan building
   - ✅ File creation
   - ✅ Code generation
   - ✅ Comments

#### Progress View:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Sheikha Agent in Progress

Task: Create database layer

Step 1/4: Analyze requirements... ✅
Step 2/4: Create file structure... ✅
Step 3/4: Write User model... ⏳
Step 4/4: Add error handling... ⏳

Models: 4 | Estimated: 45s
```

---

### Example 6: Choose Different AI Model

#### Steps:

1. Press **⚙️** (Settings) in chat
2. Choose model:
   - **Sheikha Base** — Balanced speed/quality
   - **Sheikha Chat** — Long conversations
   - **Sheikha Agent** — Complex tasks
   - **Sheikha Sharia-Safe** — Strict Sharia checks

#### Or set in settings:

```json
{
  "sheikha-copilot.defaultModel": "sheikha-copilot-agent"
}
```

---

### Example 7: Supported Languages

Sheikha Copilot supports 23 programming languages:

- JavaScript/TypeScript
- Python
- Java
- C++
- Rust
- Go
- PHP
- Ruby
- C#
- Swift
- Kotlin
- Scala
- SQL
- HTML/CSS
- Bash/Shell
- JSON/YAML
- XML
- Markdown
- And more...

---

### Example 8: Sharia Compliance Gates

#### Scenario: Request something non-Sharia

```
Write code for compound interest calculation
```

**Result:**
```
⛔ Content Blocked by Sheikha Sharia Standards

Reason: Request relates to "Riba" (Usury)

Blocked terms: ["interest", "riba"]

Policy: Haram - Not allowed on Islamic platform

💡 Sharia-Compliant Alternatives:
  - Fixed profit calculation
  - Mudaraba (partnership) structures
  - Islamic bonds (Sukuk)
```

---

### Tips & Tricks

#### 1. Use Code Context

```javascript
/**
 * Calculate Zakat
 * @param {number} wealth - Total wealth
 * @param {string} type - "gold", "silver", or "wealth"
 */
```

Then in chat: "Complete this function based on comments"

#### 2. Request Code Explanation

Select code → **Ctrl+Alt+I** → "Explain this code in detail"

#### 3. Refactor Code

Select code → **Ctrl+Alt+I** → "Simplify this code"

#### 4. Generate Tests

Select function → **Ctrl+Alt+I** → "Write Jest unit tests"

#### 5. Quick Documentation

Write function → Select → **Ctrl+Alt+I** → "Add JSDoc comments"

---

### Available Commands

From **Ctrl+Shift+P**:

```
> Sheikha Copilot: Open Chat
> Sheikha Copilot: Trigger Completion
> Sheikha Copilot: Start Agent
> Sheikha Copilot: Show Status
> Sheikha Copilot: Next Edit Suggestions
> Sheikha Copilot: Inline Chat
```

---

### Performance Tuning

For slow connections:

```json
{
  "sheikha-copilot.completionDelay": 500,
  "sheikha-copilot.maxCompletions": 1,
  "sheikha-copilot.enableNES": false,
  "sheikha-copilot.apiTimeout": 60000
}
```

---

**Version:** 1.0.0  
**Last Updated:** March 16, 2026  
**License:** Proprietary (Sheikha Platform)
