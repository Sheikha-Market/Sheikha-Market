# Sheikha Copilot Instructions

Apply these rules when generating code in this repository.

## Project Context
- Project: SHEIKHA main portal (Arabic RTL platform).
- Stack: Node.js + Express backend, Vanilla HTML/CSS/JS frontend.
- Data: JSON files under `data/`.
- Auth: JWT + OAuth providers.

## Neural Architecture (SIRN / IFL / IDA)
When working on AI or routing logic, follow this pipeline:
```
ROOT-NCN (92 cells × 7 layers × 128-dim)
  → Control Plane
    → SIRN Engine (63 cells × 5 layers × 256-dim semantic)   lib/sheikha-sirn-engine.js
      → SIRN-IFL Layer (semantic bridge)                      core/sheikha-sirn-ifl-layer.js
        → IFL Engine (12 functions × 4 domains)               lib/sheikha-ifl-engine.js
          → IDA Engine (5 layers)                             lib/sheikha-ida-engine.js
            → Applications (ENV:3 | SOFT:4 | MED:5 | CHEM:6)
```

### IFL Domains (numbered with Quran & Sunnah):
- **[3] ENVIRONMENTAL** — Intact Forest Landscapes → `IFL-F-003/004`
  - ﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾
- **[4] SOFTWARE** — Interactive Feature Location → `IFL-F-005/006`
  - ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾
- **[5] MEDICAL** — IFL Online vital monitoring → `IFL-F-007/008`
  - ﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾
- **[6] CHEMICAL** — IFL Regimen (Ifosfamide + Fluorouracil + Leucovorin) → `IFL-F-009/010`
  - «ما أنزل الله داءً إلا أنزل له شفاءً»

### SIRN API:
```javascript
// استدلال دلالي
POST /api/sirn/infer        { text: '...' }
// معالجة كاملة SIRN→IFL→IDA
POST /api/sirn/process      { query: '...', domain?: '...', data?: {} }
// حالة SIRN
GET  /api/sirn/status
// نطاقات IFL
GET  /api/sirn/domains
// تحليل PR بـ SIRN
POST /api/sirn/github/analyze-pr   { title, body, files }
// تصنيف Issue
POST /api/sirn/github/classify-issue { title, body }
```

### Usage in code:
```javascript
const sirnIfl = require('./core/sheikha-sirn-ifl-layer');
// استدلال فقط
const semantic = sirnIfl.infer('تحليل كود Python');
// معالجة كاملة
const result = await sirnIfl.process({ query: 'علاج كيميائي', data: {} });
```

## Coding Conventions
- Use 4 spaces indentation.
- Use `camelCase` for variables and function names.
- Use single quotes and semicolons.
- Keep comments concise and in Arabic when helpful.
- Keep API responses consistent:
  - `{ success, data, message, timestamp }`

## Backend Rules
- Validate all inputs.
- Return user-facing error messages in Arabic.
- Do not break existing endpoint behavior unless explicitly requested.
- Prefer small, targeted changes over large refactors.
- Use SIRN for semantic routing when building query-handling logic.

## Frontend Rules
- Preserve RTL and existing design language.
- Avoid introducing frameworks unless explicitly requested.
- Keep accessibility and responsive behavior intact.

## Security And Privacy
- Never expose secrets, tokens, API keys, or private credentials.
- Use placeholders in examples (for example: `YOUR_API_KEY`).
- Avoid logging sensitive data.

## Islamic & Sharia Rules
- No riba (ربا), gharar (غرر), gambling, or fraud in any function.
- All IFL functions must include `quranRef` and `hadithRef`.
- SIRN routing respects sharia compliance — blocked content is rejected.
- Reference Quran/Sunnah in comments for Islamic-domain logic.

## Delivery Behavior
- When editing code, include exact file references in explanations.
- If tests or runtime checks are available, run relevant checks and report outcomes.
- If a requested change could cause regressions, mention risks briefly.
