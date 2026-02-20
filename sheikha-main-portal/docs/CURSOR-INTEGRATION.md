# 🔗 تكامل Cursor IDE مع منظومة شيخة

## نظرة عامة

يوفر هذا التكامل ربط كامل بين منظومة شيخة و Cursor IDE عبر عدة مستويات:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cursor IDE                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ MCP Protocol  │  │ .cursorrules  │  │ Custom Prompts    │   │
│  │ (الأدوات)     │  │ (القواعد)     │  │ (البرومبتات)      │   │
│  └───────┬───────┘  └───────┬───────┘  └─────────┬─────────┘   │
│          │                  │                    │              │
│          ▼                  ▼                    ▼              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AI Assistant in Cursor                      │   │
│  │         (Claude Opus 4.5 / GPT-5.2)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Sheikha MCP Server                          │   │
│  │    - تحليل الشركات    - البحث في السوق                  │   │
│  │    - سلسلة التوريد    - إنشاء الكود                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## طرق التكامل

### 1. MCP (Model Context Protocol) - الأقوى

MCP يعطي Cursor أدوات مخصصة للتفاعل مع منظومة شيخة.

#### التثبيت:
```bash
# من مجلد المشروع
cd mcp-servers
npm install
```

#### التفعيل:
1. افتح Cursor Settings → Features → MCP
2. أضف الإعداد من `.cursor/mcp.json`
3. أعد تشغيل Cursor

#### الأدوات المتاحة عبر MCP:

| الأداة | الوصف | مثال الاستخدام |
|--------|-------|----------------|
| `analyze_company` | تحليل شركة سعودية | "حلل شركة معادن" |
| `search_market` | بحث في السوق | "ابحث عن موردي الحديد" |
| `get_supply_chain` | سلسلة التوريد | "سلسلة توريد الذهب" |
| `analyze_concept` | تحليل لغوي | "حلل مفهوم النمو" |
| `generate_api_code` | إنشاء API | "أنشئ API للمنتجات" |
| `get_gaps_solutions` | الفجوات والحلول | "فجوات شركة لازوردي" |
| `create_component` | مكون UI | "أنشئ بطاقة منتج" |

### 2. .cursorrules - قواعد المشروع

ملف `.cursorrules` يعلم Cursor كيف يتعامل مع المشروع:
- أسلوب الكود
- الألوان والتصميم
- معايير الشريعة
- التقنيات المستخدمة

### 3. Custom Prompts - برومبتات مخصصة

في مجلد `.cursor/prompts/`:
- `sheikha-developer.md` - برومبت المطور
- `sheikha-analyst.md` - برومبت المحلل

#### استخدام البرومبتات:
1. افتح Cursor Chat (Cmd+L)
2. اكتب `@sheikha-developer` أو `@sheikha-analyst`
3. اطلب ما تريد

### 4. Code Snippets - قوالب الكود

في `.cursor/snippets/sheikha.code-snippets`:

| Snippet | الاختصار | الوصف |
|---------|----------|-------|
| Express API | `api-endpoint` | endpoint كامل |
| Async Function | `async-ar` | دالة مع توثيق عربي |
| HTML Section | `section-rtl` | قسم RTL |
| Card | `card` | بطاقة |
| Modal | `modal` | نافذة منبثقة |
| Fetch | `fetch-api` | استدعاء API |
| OpenAI | `openai-call` | استدعاء OpenAI |
| Claude | `claude-call` | استدعاء Claude |

## أمثلة الاستخدام

### مثال 1: تحليل شركة عبر MCP
في Cursor Chat:
```
استخدم أداة analyze_company لتحليل شركة معادن
```

### مثال 2: إنشاء API جديد
في Cursor Chat:
```
أنشئ API لإضافة منتج جديد باستخدام أسلوب منظومة شيخة
```
(سيستخدم Cursor القواعد من .cursorrules)

### مثال 3: استخدام Snippet
1. في ملف JavaScript
2. اكتب `api-endpoint`
3. اضغط Tab
4. سيظهر قالب API كامل

## الإعدادات المتقدمة

### ربط MCP بخادم شيخة الرئيسي
إذا كان الخادم يعمل على http://localhost:8080:

```javascript
// في sheikha-mcp-server.js
const SHEIKHA_API = 'http://localhost:8080/api';

async function analyzeCompany(name) {
    const response = await fetch(`${SHEIKHA_API}/sheikha/analyze-company/${name}`);
    return await response.json();
}
```

### إضافة أدوات MCP جديدة
1. افتح `mcp-servers/sheikha-mcp-server.js`
2. أضف الأداة في `ListToolsRequestSchema`
3. أضف المعالجة في `CallToolRequestSchema`

## استكشاف الأخطاء

### MCP لا يعمل:
1. تأكد من تثبيت `@modelcontextprotocol/sdk`
2. تأكد من صحة مسار الملف في `mcp.json`
3. أعد تشغيل Cursor

### Snippets لا تظهر:
1. تأكد من فتح ملف بالامتداد الصحيح
2. اكتب البادئة بالكامل
3. انتظر قائمة الاقتراحات

### الألوان لا تتطبق:
1. افتح Settings → Workbench → Color Customizations
2. تأكد من تحميل `.cursor/settings.json`

## الموارد

- [Cursor MCP Documentation](https://docs.cursor.com/en/context/mcp)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [Cursor Rules Guide](https://docs.cursor.com/en/context/rules)

---

📧 للمساعدة: تواصل مع فريق منظومة شيخة
