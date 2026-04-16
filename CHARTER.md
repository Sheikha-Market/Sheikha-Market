# ميثاق منظومة شيخة (Sheikha Charter)

## المرجعية
- كتاب الله
- سنة النبي ﷺ

## مواد إلزامية
- لا ربا
- لا غرر
- لا غش
- لا احتكار
- لا ضرر ولا ضرار

---

## 🏛️ منظمة شيخة للمنظمات — الهيكل الجامع

### الرؤية
**شيخة ليست سوقاً واحداً — بل هي "منظمة منظمات" و"سوق أسواق"**
كل منظمة متخصصة في مجالها، ومنظومة شيخة تجمعها وتوحّدها وفق الكتاب والسنة، وتوحّدها لله.

### الهيكل الهرمي

```
منظمة شيخة الأم (root)
 ├── منظمة أسواق شيخة (market-org)
 │    ├── سوق المعادن والسكراب       [physical | electronic | hybrid]
 │    ├── سوق الزراعة والأغذية الحلال [physical | electronic | hybrid]
 │    ├── سوق التقنية والبرمجيات      [electronic | digital]
 │    ├── سوق الخدمات واللوجستيك      [electronic | hybrid]
 │    └── سوق العلوم والبحث والتطوير  [digital]
 ├── منظمة علوم شيخة (specialized)
 └── منظمة تقنيات شيخة (specialized)
```

### أنواع الأسواق
| النوع | الوصف | مثال |
|-------|-------|------|
| `physical` | سوق حقيقي بموقع جغرافي | سوق المعادن بالرياض |
| `electronic` | سوق إلكتروني عبر الإنترنت | متجر الزراعة الحلال |
| `digital` | سوق رقمي للأصول الرقمية | سوق البرمجيات الإسلامية |
| `hybrid` | يجمع الأنواع السابقة | سوق شيخة الجامع |

### API الجديدة
| المسار | الوصف |
|--------|-------|
| `GET  /api/organizations` | قائمة المنظمات |
| `GET  /api/organizations/tree` | الشجرة الهرمية |
| `POST /api/organizations` | تسجيل منظمة |
| `POST /api/organizations/:id/accept-charter` | قبول الميثاق |
| `GET  /api/markets-of-markets` | السوق الجامع |
| `GET  /api/markets-of-markets/search` | بحث موحّد |
| `POST /api/markets-of-markets` | تسجيل سوق |
| `GET  /api/markets-of-markets/:id/sharia-audit` | التدقيق الشرعي |
| `GET  /api/markets-of-markets/stats/overview` | إحصائيات |
