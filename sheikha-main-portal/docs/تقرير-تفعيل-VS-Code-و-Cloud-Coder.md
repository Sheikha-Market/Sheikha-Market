# بسم الله الرحمن الرحيم

# تقرير تكامل وتشغيل وتفعيل Visual Studio Code و Cloud Coder

**التاريخ:** ٢١ فبراير ٢٠٢٦  
**المشروع:** منظومة وسوق شيخة  
**الموضوع:** تفعيل بيئة التطوير الموحدة — VS Code و Cloud Coder

---

## ١. الملخص التنفيذي

| المكون | الحالة | الموقع |
|--------|--------|--------|
| **Visual Studio Code** | ✅ مفعّل | `.vscode/` + DevContainer |
| **Cloud Coder** | ✅ مفعّل | لوحة الأدمن → قسم التطوير |
| **Cursor IDE** | ✅ متكامل | API + MCP + قواعد |

---

## ٢. Visual Studio Code — التكامل والتفعيل

### ٢.١ ما تم تفعيله

| الملف | الوظيفة |
|-------|---------|
| `.vscode/settings.json` | إعدادات المحرر: تنسيق، تلوين، Minimap، Code Lens، RTL |
| `.vscode/tasks.json` | مهام: تشغيل الخادم، Dev Doctor، Ops Readiness، Gov Readiness |
| `.vscode/launch.json` | تصحيح: Debug API Server، Attach to Node |
| `.vscode/extensions.json` | إضافات موصى بها: ESLint، Prettier، GitLens، Copilot |
| `.vscode/sheikha.code-snippets` | قوالب: `shk-api`، `shk-mw`، `shk-json`، `shk-bism` |
| `.devcontainer/` | DevContainer — Node.js 24 مع كل الإضافات |

### ٢.٢ خطوات التفعيل

```bash
# ١) فتح المشروع في VS Code
code /home/sheikha/Projects/sheikha/sheikha-main-portal

# ٢) تثبيت الإضافات الموصى بها (عند الطلب)
# Ctrl+Shift+X → "Install Recommended Extensions"

# ٣) فحص جاهزية البيئة
cd sheikha-main-portal
npm run dev:vscode:doctor

# ٤) تشغيل الخادم
npm run dev
```

### ٢.٣ DevContainer (اختياري)

```bash
# فتح في حاوية معزولة
# VS Code: Command Palette → "Dev Containers: Reopen in Container"
```

### ٢.٤ API التطوير

| API | الوظيفة |
|-----|---------|
| `GET /api/cursor/bridge` | جسر شيخة–Cursor |
| `GET /api/cursor/tools` | أدوات Cursor |
| `GET /api/development/cursor-config` | إعدادات Cursor الموصى بها |
| `GET /api/development/cursor-rules` | قواعد Cursor للمشروع |

---

## ٣. Cloud Coder — التكامل والتفعيل

### ٣.١ المفهوم

**Cloud Coder** داخل شيخة = طبقة تحكم ذكية في لوحة الأدمن لتوجيه:
- أولوية الأقسام (المعمارية، الهيكل، لوحة التحكم، التطوير)
- نمط التقوية (متوازن، أمني، سرعة، جودة)
- ملف اللغة (لغة LLM + لغة التطوير)
- تغذية معرفية تطويرية ترسل إلى الشات الإداري

### ٣.٢ الموقع

**لوحة الأدمن** → قسم **التطوير الكامل** → بطاقة **«Cloud Coder + تغذية شيخة التطويرية»**

| العنصر | الوظيفة |
|--------|---------|
| `cloudCoderStatus` | متوقف / يعمل |
| `cloudCoderStrength` | متوازن / أمني / سرعة / جودة |
| `cloudCoderLlmLang` | العربية / الإنجليزية / مختلط |
| `cloudCoderDevLang` | JavaScript / TypeScript / Python / متعدد |
| `cloudCoderKnowledgeFeed` | تغذية معرفية: معايير الكود، سياسات الأمن، نمط APIs |

### ٣.٣ خطوات التفعيل

1. **الدخول** إلى لوحة الأدمن: `sheikha.top/لوحة-الادمن.html`
2. **الانتقال** إلى قسم **التطوير الكامل**
3. **الضغط** على **«تشغيل Cloud Coder»**
4. **ضبط** نمط التقوية (متوازن / أمني / سرعة / جودة)
5. **إدخال** تغذية معرفية (اختياري)
6. **حفظ** التغذية عبر **«حفظ التغذية التطويرية»**
7. **إرسال** خطة إلى الشات عبر **«إرسال خطة Cloud Coder للشات»**

### ٣.٤ التخزين

- الحالة تُحفظ في `localStorage` تحت المفتاح `sheikha_cloud_coder_v1`
- تبقى الإعدادات بعد إعادة فتح اللوحة

---

## ٤. Cursor IDE — التكامل

| المكون | الحالة |
|--------|--------|
| `.cursor/mcp.json` | خادم MCP لشيخة |
| `mcp-servers/sheikha-mcp-server.js` | ٢٣ أداة + ١٠ موارد |
| `CLAUDE.md` | قواعد المشروع |
| `lib/development-engine.js` | إعدادات Cursor الموصى بها |

---

## ٥. التحقق من التفعيل

### VS Code

```bash
npm run dev:vscode:doctor
```

النتيجة المتوقعة: ✅ لكل من `settings.json`، `tasks.json`، `launch.json`، `extensions.json`، `sheikha.code-snippets`، `.devcontainer/devcontainer.json`.

### Cloud Coder

- افتح لوحة الأدمن → التطوير الكامل
- تأكد أن `cloudCoderStatus` يعرض **«يعمل»** بعد الضغط على «تشغيل Cloud Coder»

### API

```bash
curl -s http://localhost:8080/api/cursor/bridge
curl -s http://localhost:8080/api/development/cursor-config
```

---

## ٦. المراجع

| الوثيقة | المسار |
|---------|--------|
| دليل تكامل VS Code | `docs/vscode-coder-integration-guide.md` |
| تقرير Cloud Coder | `docs/تقرير-تقوية-شيخة-والبيئة-التطويرية-Cloud-Coder.md` |
| تقييم Cloud Coder | `docs/cloud-coder-sheikha-evaluation-report.md` |
| تكامل Cursor | `docs/CURSOR-INTEGRATION.md` |

---

## ٧. التوصيات للمرحلة القادمة

1. **ربط Cloud Coder بـ API** — حفظ الإعدادات في backend بدل `localStorage` فقط
2. **إضافة KPI** — fallback rate، code quality score، security findings
3. **ربط التطبيقات المولدة** بـ `/api/ai-core/chat` و `/api/ai-core/model-integrations`

---

*«وَقُل رَّبِّ زِدْنِي عِلْمًا» — طه: ١١٤*
