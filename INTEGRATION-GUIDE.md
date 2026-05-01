# بسم الله الرحمن الرحيم
# دليل التكامل الشامل — منظومة وسوق شيخة
# ═══════════════════════════════════════════════
# كيف تعمل على مشروعك من أي بيئة تملكها بأمان

---

## الخطوة 1: رفع المشروع على GitHub (خاص — Private)

هذه الخطوة تخلي الكود متاح لك من أي مكان بأمان:

```bash
# 1. أنشئ repository خاص على github.com/new
#    الاسم: sheikha-main-portal
#    نوع: Private (خاص)
#    لا تضف README أو .gitignore (موجودين عندنا)

# 2. اربط المشروع المحلي بـ GitHub
cd sheikha-main-portal
git remote add origin https://github.com/YOUR_USERNAME/sheikha-main-portal.git

# 3. أضف كل الملفات وارفعها
git add .
git commit -m "منظومة شيخة — النسخة الكاملة مع حزمة التكامل"
git push -u origin main
```

**مهم:** تأكد أن الـ Repository خاص (Private) لحماية الكود.

---

## الخطوة 2: إعداد كل بيئة

### بيئة Cursor IDE (تلقائي)
الملفات التالية تُقرأ تلقائياً:
- `.cursorrules` — قواعد المشروع (101 سطر — بيانات حقيقية)
- `.cursor/mcp.json` — MCP server متصل ببيانات السوق
- `.cursor/prompts/sheikha-developer.md` — قالب المطور
- `.cursor/prompts/sheikha-analyst.md` — قالب المحلل
- `.cursor/settings.json` — إعدادات المحرر
- `.cursor/snippets/sheikha.code-snippets` — قصاصات كود

**لا تحتاج أي إعداد إضافي** — كل شيء يعمل تلقائياً.

---

### بيئة Claude Code (CLI)
الملف التالي يُقرأ تلقائياً:
- `CLAUDE.md` — تعريف المشروع لـ Claude Code

```bash
# للعمل عبر Claude Code CLI:
claude   # من داخل مجلد المشروع — يقرأ CLAUDE.md تلقائياً
```

---

### بيئة Claude Projects (الويب)
1. ادخل على: https://claude.ai
2. أنشئ مشروع جديد: "منظومة شيخة"
3. **Custom Instructions:** انسخ محتوى `CLAUDE-PROJECT-INSTRUCTIONS.md`
4. **Knowledge:** ارفع ملف `SHEIKHA-AI-CONTEXT.md` (من مجلد Sheikha الرئيسي)
5. كل محادثة جديدة في المشروع ستعرف شيخة تلقائياً

---

### بيئة Claude محادثة عادية
- انسخ محتوى `SHEIKHA-AI-CONTEXT.md` في أول رسالة
- أو ارفق الملف كمرفق

---

### بيئة ChatGPT
1. ادخل على: https://chatgpt.com
2. Settings → Personalization → Custom Instructions
3. انسخ محتوى `CHATGPT-INSTRUCTIONS.md`
4. كل محادثة جديدة ستعرف أنك مالك شيخة

**أو** لمحادثة واحدة: انسخ محتوى `SHEIKHA-AI-CONTEXT.md` في أول رسالة

---

### بيئة VS Code
الملف `.vscode/settings.json` يُقرأ تلقائياً عند فتح المشروع.

---

### بيئة Windsurf / Codeium
الملف `.windsurfrules` يُقرأ تلقائياً عند فتح المشروع.

---

### بيئة GitHub Copilot
الملف `.github/copilot-instructions.json` يُقرأ تلقائياً.

---

### من أي بيئة أخرى عبر API
```bash
# استعلام هوية المشروع
curl https://sheikha.top/api/project/identity

# أو محلياً
curl http://localhost:8080/api/project/identity
```

يرجع JSON كامل بهوية المشروع وحالته وتقنياته.

---

## الخطوة 3: تجنب التعارضات

### القاعدة الذهبية
**ملف `.cursorrules` الموجود في Cursor هو المرجع الأصلي** — مبني من بيانات حقيقية من الكود الفعلي (200+ endpoint تم عدها فعلياً).

### عند استخدام حزمة Claude
إذا فككت `sheikha-integration-kit.tar.gz` من Claude:
- **لا تكتب فوق** `.cursorrules` — نسختنا أدق
- **لا تكتب فوق** `CLAUDE.md` — موجود ومتسق
- الملفات الأخرى (`.windsurfrules`, `.vscode/`, `.github/`) آمنة للإضافة

### عند العمل من بيئتين بالتزامن
1. **أي تعديل على الكود** → يتم فقط من بيئة واحدة في كل مرة
2. **بعد كل جلسة عمل** → `git add . && git commit && git push`
3. **قبل بدء جلسة جديدة** → `git pull`

---

## خريطة الملفات

| الملف | البيئة | تلقائي؟ |
|-------|--------|---------|
| `.cursorrules` | Cursor IDE | تلقائي |
| `.cursor/mcp.json` | Cursor MCP | تلقائي |
| `.cursor/prompts/*.md` | Cursor Prompts | تلقائي |
| `CLAUDE.md` | Claude Code CLI | تلقائي |
| `.claude/config.json` | Claude Config | تلقائي |
| `CLAUDE-PROJECT-INSTRUCTIONS.md` | Claude Projects | نسخ مرة |
| `CHATGPT-INSTRUCTIONS.md` | ChatGPT | نسخ مرة |
| `SHEIKHA-AI-CONTEXT.md` | أي محادثة AI | نسخ/إرفاق |
| `.sheikha-ai-instructions.md` | عام | مرجع |
| `.windsurfrules` | Windsurf | تلقائي |
| `.vscode/settings.json` | VS Code | تلقائي |
| `.github/copilot-instructions.json` | GitHub Copilot | تلقائي |
| `/api/project/identity` | أي أداة عبر API | HTTP GET |

---

## الأمان

1. **الـ Repository خاص (Private)** — لا أحد يراه إلا أنت
2. **`.env` في `.gitignore`** — المفاتيح لا تُرفع
3. **`data/` في `.gitignore`** — بيانات المستخدمين لا تُرفع
4. **JWT محمي** — كل endpoint حساس محمي بتوكن
5. **OAuth** — الدخول عبر مزودين موثوقين (Google, Apple, Nafath)
6. **HTTPS** — Vercel يوفر SSL تلقائي

---

**بسم الله توكلنا على الله — لا حول ولا قوة إلا بالله**
