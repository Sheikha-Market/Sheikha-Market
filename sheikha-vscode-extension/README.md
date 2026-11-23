# Sheikha Extension for VS Code

**نظام مساعد البرمجة الذكي — Sheikha AI-powered Coding Assistant**

[![VS Code](https://img.shields.io/badge/VS%20Code-Latest-blue.svg)](https://code.visualstudio.com/)
[![Arabic](https://img.shields.io/badge/Language-Arabic%20%2F%20English-green.svg)](https://sheikha.top)
[![Sharia Compliant](https://img.shields.io/badge/Sharia-Compliant-gold.svg)](./LICENSE-SHEIKHA.md)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](./LICENSE-SHEIKHA.md)

## Overview

**Sheikha** is an intelligent AI-powered coding assistant for Visual Studio Code, tailored for The Quran, Sunnah, and Halal principles.

- 🤖 **Inline Code Completions** — Real-time suggestions as you type
- 💬 **Sheikha Chat** — Conversational AI for coding questions
- **Agent Mode**: bounded local inspection with optional, explicitly approved local model drafts
- 🔮 **NES (Next Edit Suggestions)** — Predicts your next code change
- 📝 **Inline Chat** — Edit mode with natural language instructions
- ✅ **Sharia Guardrails** — Blocks forbidden practices (riba, fraud, hacking)
- 🌍 **RTL Arabic Support** — Full Arabic UI and Arabic comments

## Installation

### From VS Code Marketplace

```
sheikha.sheikha
```

Or install directly:

```bash
code --install-extension sheikha.sheikha
```

### Manual Installation

1. Download the `.vsix` file from [sheikha.top/extensions](https://sheikha.top/extensions)
2. Run `code --install-extension sheikha.sheikha-1.0.6.vsix`

## Quick Start

### 1. Open Chat

Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)

```
> أكتب: "كيف أنشئ دالة في JavaScript؟"
Sheikha: لإنشاء دالة في JavaScript: استخدم `function name(params) { }` أو الصيغة السهمية...
```

### 2. Inline Completions

Start typing and Sheikha will suggest completions:

```javascript
function |  ← Press Ctrl+Space or wait for suggestion
// Sheikha suggests: functionName(params) { ... }
```

### 3. Inline Chat (Refactor)

Select code and press `Ctrl+I`:

```javascript
// Select this:
const user = userData.find(u => u.age > 18);

// Type in inline chat: "refactor this"
// Sheikha refactors to:
const adults = userData.filter(({ age }) => age > 18);
```

### 4. Agent Mode

اختر «ابدأ مهمة منظمة» من مركز عمل الشات، أو «وكيل محكوم» أو «مهمة وكيل» من الأدوات.
حدد وصف المهمة ومساحة العمل الموثوقة، ثم اختر الفحص المحلي وحده أو إضافة مسودتي التصميم والمراجعة.
الخيار الثاني يتطلب اختيار نموذج مثبت في Ollama وموافقة مستقلة على تشغيله محليًا.
تُرسل صيغة المهمة التي أدخلتها فقط، لا ملفات المشروع أو سجل المحادثة.

تعرض اللوحة حالات Inspecting وWorking وUpdated ثم النتيجة الفعلية، مع تفاصيل كل مهمة وأوقاتها وبصمة نتيجتها.
يمكن إيقاف دورة المهام أثناء العمل وفتح التفاصيل. خطة JSON وتقرير الإغلاق متاحان للفتح والنسخ والتصدير اليدوي الخاص.
الإلغاء يمنع اعتماد الردود المتأخرة؛ لا يثبت توقف الحساب فورًا داخل خدمة النموذج.

## Features

### Code Completions

- **Pattern-based completions** for common code structures
- **Context-aware** suggestions based on your file
- **Multi-language support**: JavaScript, Python, TypeScript, Java, PHP, Go, Rust, C++, etc.

```javascript
app.post(|
// Suggests: '/api/route', express.json(), (req, res) => { ... }
```

### Sheikha Chat

Ask questions about:

- 🔧 How to write idiomatic JavaScript/Python/etc.
- 🐛 Debug errors and understand stack traces
- 📚 Learn programming concepts
- 🎯 Get code best practices

```
Q: "How do I handle errors in async functions?"
A: "Use try/catch with async/await..."
   [Provides code snippet]
```

### Agent Mode

دورة محددة من أربع أدوات فحص: المحرر، الموصلات المحلية، مصادر التكامل، وأدلة التوزيع.
يمكن إضافة وكيل تصميم متطلبات ووكيل مراجعة متطلبات عبر نموذج محلي. لا يقرأ الوكيلان الكود ولا يراجع الثاني مخرجات الأول.
الحدود: ست مهام كحد أقصى، عاملان متزامنان للأدوات، واستدلال نموذج واحد في كل لحظة.
لكل استدلال حد 512 رمز إخراج وسياق 4096 ومهلة 75 ثانية؛ مهلة المهمة الكلية 90 ثانية.
المسودات تحتاج مراجعة. يُطلب جواب JSON محدود ويُرفض الرد المقطوع بالميزانية أو غير المطابق؛ صحة البنية لا تثبت صحة محتواه. لا تنفيذ كود مولد أو أوامر نظام أو تدريب أو نشر.

الموصل ثابت على `127.0.0.1:11434` ويستخدم فقط `/api/tags` و`/api/show` و`/api/chat`.
يرفض النماذج السحابية، وتغير بصمة النموذج المختار، وطلبات الأدوات في الجواب. لا تنزيل أو تحويل سحابي احتياطي.
فحص الخدمة 8142 مستقل عن استدلال النموذج. اتصال الخدمة لا يثبت جودة النموذج أو ملكية أوزانه أو جاهزية تجارية.
بعض قوالب النماذج المخصصة لا تحترم `think: false`؛ إن نفدت الميزانية دون جواب نهائي تظهر حالة فشل صريحة، ولا يُعرض التفكير الداخلي بديلًا.
مرجع بروتوكول الموصل: [Ollama Chat API](https://docs.ollama.com/api/chat).

### Sharia Guardrails

Sheikha blocks code related to:

- ❌ **Riba** (interest-bearing, usury)
- ❌ **Gharar** (excessive uncertainty, gambling)
- ❌ **Fraud & Deception**
- ❌ **Hacking, Malware, Exploits**

Example:

```javascript
// Attempting to generate card present fraud code:
const fraudCode = "...";
// Sheikha blocks: "المحتوى يتعارض مع الشريعة الإسلامية"
```

## Settings

Open VS Code Settings (`Ctrl+,`) and search for `sheikha`:

| Setting | Default | Description |
|---------|---------|-------------|
| `sheikha.enable` | `true` | Master enable/disable |
| `sheikha.serverUrl` | `http://localhost:8080` | Sheikha backend server |
| `sheikha.enableInlineCompletions` | `true` | Real-time code suggestions |
| `sheikha.enableChat` | `true` | Chat panel |
| `sheikha.enableAgentMode` | `true` | Agent mode (multi-step tasks) |
| `sheikha.enableNES` | `true` | Next Edit Suggestions |
| `sheikha.shariaGuardrails` | `true` | Enable Islamic compliance checks |
| `sheikha.defaultModel` | `sheikha-base` | Default AI model |
| `sheikha.completionDelay` | `150` | Delay for completions (ms) |
| `sheikha.maxCompletions` | `3` | Max suggestions to show |
| `sheikha.arabicComments` | `true` | Prefer Arabic in suggestions |

## Keyboard Shortcuts

| Shortcut | Command | Platform |
|----------|---------|----------|
| `Ctrl+Shift+I` | Open Chat | Windows/Linux/Mac |
| `Ctrl+I` | Inline Chat | Windows/Linux |
| `Cmd+I` | Inline Chat | Mac |
| `Tab` | Accept NES suggestion | Windows/Linux/Mac |

## Supported Languages

Sheikha works with:

- **Web**: JavaScript, TypeScript, HTML, CSS
- **Server**: Node.js, Python, Java, PHP, Go, Rust, C#
- **Scripts**: Bash, PowerShell, Python
- **Data**: JSON, YAML, XML, SQL

## Privacy & Security

✅ **Your code is yours**
- Code snippets are NOT shared with other users
- Local-first processing when possible
- All data encrypted in transit
- *Read our [Privacy Policy](https://sheikha.top/privacy)*

```
Sheikha: كودك ملكك.
لا نشارك مقتطفاتك مع أي مستخدم آخر.
نلتزم بمبادئ الخصوصية وحماية البيانات.
```

## System Requirements

- **VS Code**: v1.85.0 or later
- **Node.js**: v18.0 or later (for Sheikha backend server)
- **Sheikha Backend**: Running on `http://localhost:8080`

## Architecture

```
┌─────────────────────────────────────────┐
│  VS Code + Sheikha Extension   │
│  ├─ Completions                        │
│  ├─ Chat Panel                         │
│  ├─ Agent Mode                         │
│  └─ Inline Chat                        │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
               ▼
┌─────────────────────────────────────────┐
│  Sheikha Backend Server (port 8080)    │
│  ├─ /api/sheikha/completions  │
│  ├─ /api/sheikha/chat         │
│  ├─ /api/sheikha/agent        │
│  ├─ /api/sheikha/nes          │
│  ├─ /api/sheikha/inline-chat  │
│  └─ /api/sheikha/settings     │
└─────────────────────────────────────────┘
```

## API Endpoints

All endpoints are available on the Sheikha backend:

### Status & Config

```
GET /api/sheikha/extension/status            ← System status
GET /api/sheikha/models            ← Available AI models
GET /api/sheikha/languages         ← Supported programming languages
GET /api/sheikha/settings          ← User settings
GET /api/sheikha/vscode-bridge     ← VS Code bridge status
```

### Coding Assistance

```
POST /api/sheikha/completions      ← Inline completions
POST /api/sheikha/chat             ← Chat interface
POST /api/sheikha/agent            ← Agent mode (multi-step)
POST /api/sheikha/nes              ← Next Edit Suggestions
POST /api/sheikha/inline-chat      ← Inline chat/refactoring
```

## Example Workflows

### Workflow 1: Build a REST API

```javascript
// 1. Type and let Sheikha complete:
app.post('/api/users', (req, res) => {
    // Sheikha suggests parameter validation & error handling

// 2. Ask in Chat: "Add JWT authentication"
// Sheikha provides middleware code

// 3. Select code + Inline Chat "add logging"
// Sheikha injects logging statements
```

### Workflow 2: Debug an Error

```javascript
const data = JSON.parse(input);  // ← Error: input might be invalid

// Press Ctrl+Shift+I and ask: "How do I safely parse JSON?"
// Sheikha: "Use try/catch with JSON.parse..."
// [Provides corrected code]
```

### Workflow 3: Large Refactor with Agent

```
// Press Ctrl+Shift+A
// Task: "Refactor these 10 functions to use async/await instead of promises"
// Sheikha Agent:
//   ✓ Analyzes each function
//   ✓ Converts to async/await
//   ✓ Adds error handling
//   ✓ Tests for regressions
//   ✓ Applies changes
```

## Troubleshooting

### "Could not connect to server"

- Ensure Sheikha backend is running: `npm start`
- Check `sheikha.serverUrl` setting (default: `http://localhost:8080`)
- Verify firewall allows localhost:8080

### "Sharia guardrails blocked my request"

Sheikha blocks code related to:

- Riba, gambling, fraud
- Hacking, exploits, malware
- Harmful or unethical practices

This is by design. Choose an alternative approach that aligns with Islamic principles.

### "No completions appearing"

1. Check if `enableInlineCompletions` is `true`
2. Verify `completionDelay` is not too high
3. Ensure code context is sufficient (Sheikha learns from the file)

## Development

### Build from Source

```bash
git clone https://github.com/sheikha/sheikha-vscode-extension.git
cd sheikha-vscode-extension
npm install
code --install-extension ./dist/sheikha.sheikha-1.0.6.vsix
```

### Debugging

```bash
# Open extension in debug mode
code --extensionDevelopmentPath=$(pwd) .
```

Press `F5` to attach debugger.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This extension is proprietary software developed by **Sheikha**.

- **Commercial Use**: Requires explicit license
- **Distribution**: Restricted — only via official VS Code Marketplace
- **Modifications**: Prohibited without written consent
- **Islamic Compliance**: Governed by Quranic principles and Sunnah

See [LICENSE-SHEIKHA.md](./LICENSE-SHEIKHA.md)

## Support

- 📧 **Email**: market@sheikha.top
- 🌐 **Website**: https://sheikha.top
- 💬 **Community**: https://sheikha.top/community
- 🐛 **Report Issues**: issues@sheikha.top

## Author

**Sheikha** — أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب

Owner: **Salman Ahmad Bin Salman Al-Rajhi**

---

**الحمد لله رب العالمين**

«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — سورة المائدة، الآية ٢

*AI should serve humanity with integrity, transparency, and Islamic ethics.*
