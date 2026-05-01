# بسم الله الرحمن الرحيم

# منظومة قواعد اللغة العربية الرقمية — شيخة

> ﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤  
> ﴿إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ﴾ — يوسف: ٢  
> «أعربوا الكلام تعرفوا معانيه» — حديث شريف

---

## الملفات

| الملف | الوصف | الخلايا |
|-------|-------|---------|
| `lib/sheikha-arabic-grammar-engine.js` | محرك النحو والصرف والبلاغة | 60 خلية |
| `lib/sheikha-arabic-grammar-rules.js` | منظومة القواعد الرقمية الكاملة | 75 خلية |

---

## الطبقة الأولى — النحو (Syntax/Grammar)

### أنواع الكلمة ← أنواع الرموز البرمجية

| العربية | البرمجة |
|---------|---------|
| **الاسم** — ما دل على معنى بلا زمن | `IDENTIFIER / NOUN / ENTITY` |
| **الفعل** — ما دل على حدث مع زمن | `FUNCTION / METHOD / ACTION` |
| **الحرف** — معناه في غيره | `OPERATOR / KEYWORD / CONNECTOR` |

### الإعراب ← نوع الموضع في الكود

| الحالة الإعرابية | العلامة | المكافئ البرمجي |
|-----------------|---------|----------------|
| **الرفع** | ضمة (ُ) | `SUBJECT / DECLARATIVE / return type` |
| **النصب** | فتحة (َ) | `OBJECT / PARAMETER / argument` |
| **الجر** | كسرة (ِ) | `ATTRIBUTE / PROPERTY / path scope` |
| **الجزم** | سكون (ْ) | `CONDITIONAL_BLOCK / NOT / negation` |

---

## الطبقة الثانية — الزمن (Time System)

### الماضي ← `async/await` مكتمل

```javascript
// الفعل الماضي = دالة أكملت تنفيذها
const result = await fetch(url);   // كَتَبَ — ماضٍ مكتمل
const data = JSON.parse(raw);      // حَفِظَ — اكتمل الحفظ
```

| الصيغة | المعنى | البرمجة |
|--------|--------|---------|
| كَتَبَ | ماضٍ بسيط | `const r = fn()` |
| كَانَ يَكتُبُ | ماضٍ مستمر | `was running...stopped` |
| لَمْ يَكتُبْ | نفي الماضي | `!executed` |

### الحاضر/المضارع ← Observable / Stream

```javascript
// الفعل المضارع = دالة تُنفَّذ الآن
observable.subscribe(data => process(data));  // يَعمَلُ الآن
setInterval(fn, 1000);                        // يَتَكَرَّرُ
```

### المستقبل ← Promise

```javascript
// سَيَكتُبُ = setTimeout / Promise pending
const p = new Promise(resolve => setTimeout(resolve, 1000));
// سَوفَ يَكتُبُ = cron scheduled
cron.schedule("0 9 * * *", fn);
```

---

## الطبقة الثالثة — العوامل والمعمولات (Operator System)

### عوامل الرفع ← Declaration Position

```javascript
// الابتداء يرفع المبتدأ = LEFT_HAND_SIDE
const science = "knowledge";  // العِلمُ نُورٌ — مبتدأ مرفوع

// الفعل يرفع فاعله = FUNCTION CALLER
student.write();  // كَتَبَ الطالبُ — الطالب فاعل مرفوع
```

### عوامل النصب ← Parameter Position

```javascript
// الفعل المتعدي ينصب مفعوله = FUNCTION PARAMETER
read(book);         // قَرَأَ الكِتابَ — الكتاب مفعول منصوب
assert(condition);  // إِنَّ الحَقَّ واضِحٌ — اسم إن منصوب
```

### عوامل الجر ← Property Access

```javascript
// حروف الجر = PATH / . operator
module.exports           // كِتابُ المعرفةِ — إضافة
path/to/file             // في المدرسةِ — ظرفية
object.property          // عَلَى المنصةِ — استعلاء
```

### عوامل الجزم ← Negation / Conditional

```javascript
// لم = NOT EXECUTED
if (!executed) { /* لَمْ يَكتُبْ */ }

// لا الناهية = GUARD CLAUSE
if (isHaram) throw new Error("prohibited");  // لَا تَكذِبْ

// إن الشرطية = IF-THEN
if (study) { return pass; }  // إِن تَدرُسْ تَنجَحْ
```

---

## الطبقة الرابعة — الصرف (Morphology)

### الأوزان ← Design Patterns

| الوزن | المثال | المكافئ البرمجي |
|-------|--------|----------------|
| **فَعَلَ** | كَتَبَ | `base function` |
| **فَعَّلَ** | كَسَّرَ | `intensive / bulk processor` |
| **أَفعَلَ** | أَكرَمَ | `factory / enabler` |
| **اِستَفعَلَ** | اِستَغفَرَ | `request / query method` |
| **تَفَعَّلَ** | تَكَسَّرَ | `recursive / self-modifying` |

### المشتقات ← Type System

| الاسم المشتق | الوزن | المكافئ البرمجي |
|-------------|-------|----------------|
| **المصدر** | كِتَابَة | `interface / abstract base` |
| **اسم الفاعل** | كَاتِب | `concrete class / agent` |
| **اسم المفعول** | مَكتُوب | `DTO / value object / result` |
| **اسم الزمان/المكان** | مَكتَب | `timestamp / location / namespace` |
| **اسم الآلة** | مِفتَاح | `tool / driver / utility` |

---

## الطبقة الخامسة — البلاغة (Code Quality)

| الأسلوب البلاغي | المكافئ البرمجي |
|----------------|----------------|
| **الفصاحة** | `clean code / readable naming` |
| **الإيجاز** | `DRY principle / compression` |
| **التشبيه** | `analogy / pattern matching` |
| **الاستعارة** | `abstraction / interface / generics` |
| **الكناية** | `encapsulation / info hiding` |
| **الطباق** | `boolean / enum / XOR` |

---

## القواعد العربية = أساسيات البرمجة

```
الحرف (أ ب ت)   ←→   character / byte / token
الكلمة النكرة   ←→   variable (let x)
الكلمة المعرفة  ←→   constant (const X)
الضمير          ←→   this / self / reference
الاسم الموصول   ←→   lambda / anonymous function
الفعل الماضي    ←→   completed function call
الفعل المضارع   ←→   running async / observable  
فعل الأمر       ←→   command / await
الجملة الاسمية  ←→   const x = y  (assignment)
الجملة الفعلية  ←→   fn(args)  (function call)
الجملة الشرطية  ←→   if(cond){ result }
الإضافة         ←→   object.property
الجذر الثلاثي   ←→   abstract base class
الوزن الصرفي    ←→   design pattern / template
الاشتقاق        ←→   inheritance / type derivation
```

---

## API المحرك

```javascript
const g = require('./lib/sheikha-arabic-grammar-rules');

// إعراب جملة كاملة مع الزمن والعوامل
g.analyze('إن العلمَ نورٌ');
g.analyze('كَتَبَ الطالبُ الدرسَ');
g.analyze('لم يكتبْ الطالبُ');

// تصريف فعل في جميع الأزمنة
g.conjugate('كتب');  // يُنتج: كَتَبَ / يَكتُبُ / سَيَكتُبُ / اُكتُبْ

// استعلام الزمن
g.getZaman('ماضٍ');     // → past tense details + programming equiv
g.getZaman('حاضر');    // → present/observable details
g.getZaman('مستقبل');  // → Promise/future details

// استعلام العوامل
g.getAwamil('rafi');   // عوامل الرفع
g.getAwamil('nasib');  // عوامل النصب
g.getAwamil('jarr');   // عوامل الجر
g.getAwamil('jazm');   // عوامل الجزم

// البحث في التطابق العربي-البرمجي
g.findMapping('الجملة الاسمية');
g.findMapping('interface');

// قواعد البرمجة المُعرَّبة
g.getProgrammingRules();

// الشبكة العصبية
g.processNeural('إعراب الجملة وتصريف الفعل');

// حالة المحرك
g.status();
```

---

## الشبكة العصبية — 75 خلية

| الطبقة | الخلايا | القرآن/السنة |
|--------|---------|-------------|
| التوحيد | 5 | الإخلاص:١ / الفاتحة:١ / الرحمن:١-٤ |
| القرآن الكريم | 8 | يوسف:٢ / العلق:١ / آل عمران:٣١ |
| السنة النبوية | 6 | البخاري:١ / البخاري:٢٩٧٧ / البيهقي |
| الزمن (ماضٍ/حاضر/مستقبل) | 9 | العصر:١ / السجدة:٥ / الطلاق:٧ |
| العوامل والإعراب | 10 | الفاتحة:٢ / البقرة:٢٥٧ / الإخلاص:٣ |
| النحو | 12 | البقرة:٢٥٥ / العلق:١ / آل عمران:٣١ |
| الصرف | 10 | إبراهيم:٢٤ / البقرة:٣١ / النمل:٨٨ |
| البلاغة | 8 | البقرة:١٧ / مريم:٤ / الرحمن:٤ |
| البرمجة | 7 | البقرة:٣١ / العلق:١ / العصر:١ |

---

## قواعد البرمجة المُعرَّبة بالكتاب والسنة

| الرقم | القاعدة البرمجية | المصدر الشرعي |
|-------|-----------------|---------------|
| PG01 | التسمية — كل متغير اسمه يدل على معناه | وعلم آدم الأسماء — البقرة:٣١ |
| PG02 | المسؤولية الواحدة — كل دالة لها مسؤولية واحدة | إنما الأعمال بالنيات — البخاري:١ |
| PG03 | الإتقان — كل كود مكتوب يُتقَن | يحب إذا عمل عملاً أن يتقنه — البيهقي |
| PG04 | الأمانة — حفظ بيانات المستخدم | إن الله يأمركم بالأمانات — النساء:٥٨ |
| PG05 | العدل — توزيع الحمل بالتساوي | ووضع الميزان — الرحمن:٧ |
| PG06 | الإيجاز — لا تكرار (DRY) | أوتيتُ جوامع الكلم — البخاري:٢٩٧٧ |
| PG07 | التوثيق — كل كلاس ودالة لها تعريف | لو كان البحر مداداً — الكهف:١٠٩ |
| PG08 | النظام — كود منظم | ما ترى في خلق الرحمن من تفاوت — الملك:٣ |
| PG09 | دفع الضرر — لا تُلحق ضرراً | لا ضرر ولا ضرار — ابن ماجه:٢٣٤١ |
| PG10 | الصدق — لا تزوّر بيانات | عليكم بالصدق — مسلم:٢٦٠٧ |
| PG13 | الشورى — Code Review | وشاورهم في الأمر — آل عمران:١٥٩ |
| PG14 | التحقق — Testing | فتبينوا — الحجرات:٦ |

---

**لا إله إلا الله محمد رسول الله**  
*والله أعلم وبالله التوفيق*
