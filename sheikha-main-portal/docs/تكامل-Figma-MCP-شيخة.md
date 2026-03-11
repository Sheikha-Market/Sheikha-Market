# تكامل Figma MCP مع شيخة — التكامل الأمثل

## بسم الله الرحمن الرحيم

## Figma MCP Server

**Figma MCP** يجلب سياق Figma مباشرة إلى سير عمل المطوّر لمساعدة LLMs على توليد كود مستنير بالتصميم (design-informed code generation).

### Dev Mode + Code Connect
يعمل Figma MCP بشكل أفضل عند ربطه بـ **Dev Mode** وربط الكودbase عبر **Code Connect** — مخرجات أصق وأدق.

---

## خيارات التكامل

| الخيار | الاستخدام | ملاحظة |
|--------|-----------|--------|
| **Cursor + Figma MCP** | التصميم → كود داخل IDE | مُوصى لشيخة |
| **ChatGPT + Figma** | تكامل مباشر بين الحسابين | مخططات FigJam، توليد أفكار |

**للمعلومية:** يوجد تكامل في الحساب بين **GPT** و **Figma** — إنشاء مخططات FigJam من ChatGPT وفتحها في FigJam. يُكمّل استخدام Cursor للكود.

---

## التكامل الأمثل لشيخة: Cursor

شيخة تُبنى في **Cursor** — Figma MCP يضيف سياق التصميم مباشرة لتحويل التصاميم إلى كود.

### المرجع الشرعي
> «يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ» — البقرة:282  
> التوثيق والكتابة — التصميم يُوثّق ويُحوّل إلى كود صحيح

---

## الإعداد

### 1. Figma MCP في Cursor
تم إضافة Figma MCP في `.cursor/mcp.json`:
```json
"figma": {
  "url": "https://mcp.figma.com/mcp",
  "type": "http"
}
```

### 2. FIGMA_ACCESS_TOKEN (لـ REST API / Plugins)
**أين يُستخرج:**
1. Figma → قائمة الحساب (أعلى يسار) → **Settings**
2. تبويب **Security**
3. قسم **Personal access tokens** → **Generate new token**
4. انسخ المفتاح فوراً — يُعرض مرة واحدة فقط

[دليل Figma](https://help.figma.com/hc/en-us/articles/8085703771159)

**Scopes (الصلاحيات):**

| ✓ | الاسم (عربي) | الاسم (English) | الوصف |
|---|--------------|-----------------|--------|
| ✓ | المستخدمون | **Users** | Read the current user's name, email, and profile image |
| | الملفات | **Files** | Read comments • Create/modify/delete comments • Read contents and render images • Read metadata • Read version history |
| ✓ | أنظمة التصميم | **Design systems** | Read components and styles • Read published from files • Read published in team libraries |
| ✓ | التطوير | **Development** | Read and list dev resources • Create and modify dev resources |
| ✓ | المشاريع | **Projects** | Read team project structure |
| ✓ | الويب هوكس | **Webhooks** | Read and list webhooks • Create, modify, delete webhooks |

**✓ = ما تم اختياره في الحساب**

### 3. المصادقة (لـ MCP)
عند أول استخدام، Cursor يطلب المصادقة مع Figma عبر OAuth — انقر **Connect** ثم **Allow Access**.

### 4. الاستخدام
1. انسخ رابط إطار أو طبقة من Figma
2. الصقه في محادثة Cursor
3. اطلب: «حوّل هذا التصميم إلى HTML/CSS لشيخة»

---

## MCP Clients المدعومة

| العميل | الدعم | الخادم | الرتبة لشيخة |
|--------|-------|--------|--------------|
| **Cursor** | Design, Make, FigJam | Remote + Local | 1 — مُوصى |
| **VS Code** | Design, Make, FigJam | Remote + Local | 1 |
| **Claude Code** | Design, Make, FigJam | Remote + Local | 2 |
| **Claude** | Design, Make, FigJam | Remote + Local | 2 |
| **Windsurf** | Design, Make, FigJam | Remote + Local | 2 |
| **Codex** | Design, FigJam | Remote + Local | 2 |
| **Gemini CLI** | Design, FigJam | Remote + Local | 2 |
| **Warp** | Design, FigJam | Remote + Local | 2 |
| **Replit** | Design, FigJam | Remote only | 3 |
| **Android Studio** | Design, FigJam | Remote + Local | 3 |
| **Zed** | Design, FigJam | Local only | 3 |
| **Amazon Q** | Design, FigJam | Local only | 3 |
| **OpenHands** | Design, FigJam | Local only | 3 |
| **Kiro** | Design, FigJam | Remote + Local | 3 |
| **Atlassian Studio** | Design, FigJam | قريباً | 3 |
| **ServiceNow Build** | Design | Remote only | 3 |

---

## مسارات API

| المسار | الوصف |
|-------|--------|
| `GET /api/figma/integrations-catalog` | كتالوج تكاملات Figma (Plugins) |
| `GET /api/figma/mcp-clients` | قائمة MCP clients مع الكتاب والسنة |
| `GET /api/figma/apis-catalog` | Plugin APIs, Widget APIs, REST, SCIM — مرقمنة بالكتاب والسنة |

---

## مراجع

- [Figma MCP Install Guide](https://help.figma.com/hc/en-us/articles/32132100833559) — دليل التثبيت الكامل
- [Figma MCP Remote Server](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
- [Figma MCP في Cursor](https://help.figma.com/hc/en-us/articles/35281350665623)
- [Dev Mode](https://www.figma.com/dev-mode/) — ربط التصميم بالكود
- [Code Connect](https://developers.figma.com/docs/code-connect/) — ربط المكونات بالكودbase
- [Plugin APIs](https://www.figma.com/plugin-docs/) — أتمتة، توثيق، تواصل
- [Widget APIs](https://www.figma.com/widget-docs/) — FigJam، ألعاب، استطلاعات
- [REST API](https://www.figma.com/developers/api) — Embed، تكامل خارجي
- [SCIM API](https://www.figma.com/developers/scim) — توفير الحسابات

---

*المالك: سلمان أحمد بن سلمان الراجح | market@sheikha.top*
