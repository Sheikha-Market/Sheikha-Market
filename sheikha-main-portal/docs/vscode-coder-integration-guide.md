# دليل تكامل شيخة مع أقوى بيئة IDE — Visual Studio Code

## الهدف

أقوى بيئة تطوير موحدة عالمياً داخل شيخة، تجمع:
- أحدث تقنيات المحرر (Semantic Highlighting, Sticky Scroll, Bracket Pairs, Minimap).
- تكامل AI (Copilot, Copilot Chat).
- أدوات جودة (ESLint, Prettier, Error Lens, SonarLint).
- إنتاجية عالية (GitLens, Path Intellisense, Todo Tree, Better Comments).
- DevContainer جاهز للتشغيل في حاوية معزولة.
- قوالب كود سريعة (Snippets) لمسارات API و Middleware.

## ما تم تفعيله

1. **إعدادات متقدمة** في `.vscode/settings.json`:
   - Bracket Pair Colorization, Sticky Scroll, Semantic Highlighting.
   - Format on Save, Minimap, Breadcrumbs, Code Lens.
   - Emmet, Smooth Scrolling, Cursor Animation.
2. **مهام تشغيل** في `.vscode/tasks.json`:
   - Start Dev Server, Start Production, VSCode Doctor.
   - Ops Readiness, Gov Readiness, Ollama Plan.
   - Scaffold Electronic App, Full Environment Check.
3. **تصحيح متقدم** في `.vscode/launch.json`:
   - Debug API Server, Debug with Inspector.
   - Attach to Running Node, Debug Current Script.
4. **إضافات موصى بها** في `.vscode/extensions.json`:
   - ESLint, Prettier, GitLens, Error Lens, Better Comments.
   - Path Intellisense, Code Spell Checker (Arabic).
   - GitHub Copilot, Copilot Chat.
   - Docker, Remote Containers.
5. **قوالب كود** في `.vscode/sheikha.code-snippets`:
   - `shk-api` — مسار API
   - `shk-json` — استجابة JSON
   - `shk-mw` — Middleware
   - `shk-bism` — رأس تعليق شرعي
6. **DevContainer** في `.devcontainer/`:
   - تشغيل داخل حاوية Node.js 24 مع كل الإضافات.
7. **Prettier** في `.prettierrc`:
   - تنسيق موحد (4 مسافات، single quotes، 100 حرف).

## طريقة التشغيل

### 1) تشغيل الخادم أثناء التطوير
```bash
npm run dev
```

### 2) فحص جاهزية البيئة
```bash
cd sheikha-main-portal   # أو cd إلى مجلد المشروع
npm run dev:vscode:doctor
```
> إذا ظهر خطأ `ENOENT package.json` فأنت في مجلد خاطئ — انتقل إلى مجلد المشروع أولاً.

### 3) توليد تطبيق إلكتروني جديد
```bash
npm run dev:scaffold:app -- --name "market-pro" --title "منصة السوق" --with-api
```

سينشئ مجلدًا في:
`generated-apps/market-pro`

## الفائدة المباشرة

- تسريع الانطلاق لأي فكرة تطبيق.
- تقليل الوقت بين الفكرة والتنفيذ.
- توحيد بيئة التطوير للفريق.
- تسهيل التكامل لاحقاً مع APIs الذكاء في شيخة.

## الخطوة التالية المقترحة

ربط التطبيقات المولدة تلقائياً بـ:
- `/api/ai-core/chat`
- `/api/ai-core/model-integrations`
- `/api/ai-core/model-router/status`

لتحويل البيئة إلى منصة تطوير ذكية كاملة من داخل VS Code.
