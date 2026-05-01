# بسم الله الرحمن الرحيم

# تفعيل Browse MCP — التصفح وجلب المحتوى

**التاريخ:** ٢١ فبراير ٢٠٢٦  
**المشروع:** منظومة وسوق شيخة

---

## ١. ما تم تفعيله

تم إضافة **Fetch MCP** في `.cursor/mcp.json` — خادم رسمي من Model Context Protocol لجلب محتوى الويب وتحويله إلى Markdown.

| الخادم | الوظيفة |
|--------|---------|
| **sheikha** | ٢٣ أداة — حالة المنظومة، فحص شرعي، أسعار، زكاة، RFQ، إلخ |
| **fetch** | جلب محتوى URL وتحويل HTML إلى Markdown |

---

## ٢. المتطلبات

**Fetch MCP** مُفعّل عبر **Docker** (الصورة `mcp/fetch` مُحمّلة):

```json
"fetch": {
  "command": "docker",
  "args": ["run", "-i", "--rm", "mcp/fetch"]
}
```

---

## ٣. بدائل

### خيار أ: uvx (Python)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# ثم عدّل mcp.json: "command": "uvx", "args": ["mcp-server-fetch"]
```

### خيار ب: استخدام أداة شيخة المدمجة

خادم **sheikha** يتضمن أداة `sheikha_web_fetch` — جلب محتوى من URL. يمكن استخدامها مباشرة دون تثبيت إضافي.

---

## ٤. إعادة تشغيل Cursor

بعد تعديل `mcp.json`:
1. أعد تشغيل Cursor بالكامل
2. أو: Cursor Settings → Features → MCP → Refresh

---

## ٥. أدوات Fetch المتاحة

| الأداة | الوظيفة |
|--------|---------|
| `fetch` | جلب URL واستخراج المحتوى كـ Markdown |

**المعاملات:** `url` (مطلوب)، `max_length`، `start_index`، `raw`

---

*«وَقُل رَّبِّ زِدْنِي عِلْمًا» — طه ١١٤*
