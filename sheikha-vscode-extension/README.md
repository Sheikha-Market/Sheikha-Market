# Sheikha Copilot Extension for VS Code

**نظام مساعد البرمجة الذكي — Sheikha AI-powered Coding Assistant**

[![VS Code](https://img.shields.io/badge/VS%20Code-Latest-blue.svg)](https://code.visualstudio.com/)
[![Arabic](https://img.shields.io/badge/Language-Arabic%20%2F%20English-green.svg)](https://sheikha.top)
[![Sharia Compliant](https://img.shields.io/badge/Sharia-Compliant-gold.svg)](./LICENSE-SHEIKHA.md)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](./LICENSE-SHEIKHA.md)

## Overview

**Sheikha Copilot** is an intelligent AI-powered coding assistant for Visual Studio Code, inspired by GitHub Copilot but uniquely tailored for The Quran, Sunnah, and Halal principles.

- 🤖 **Inline Code Completions** — Real-time suggestions as you type
- 💬 **Sheikha Chat** — Conversational AI for coding questions
- 🦾 **Agent Mode** — Autonomous multi-step task execution
- 🔮 **NES (Next Edit Suggestions)** — Predicts your next code change
- 📝 **Inline Chat** — Edit mode with natural language instructions
- ✅ **Sharia Guardrails** — Blocks forbidden practices (riba, fraud, hacking)
- 🌍 **RTL Arabic Support** — Full Arabic UI and Arabic comments

## Installation

### From VS Code Marketplace

```
sheikha.sheikha-copilot
```

Or install directly:

```bash
code --install-extension sheikha.sheikha-copilot
```

### Manual Installation

1. Download the `.vsix` file from [sheikha.top/extensions](https://sheikha.top/extensions)
2. Run `code --install-extension sheikha-copilot-1.0.0.vsix`

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

Press `Ctrl+Shift+A` and describe what you want:

```
Task: "Create a REST API endpoint POST /api/users that validates email and saves to database"

Sheikha Agent will:
✓ Analyze requirements
✓ Create route structure
✓ Add input validation
✓ Add error handling
✓ Apply sharia checks
```

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

Autonomous task execution:

- 🔨 Create entire API endpoints
- 🧪 Generate test cases
- 🐛 Fix bugs and compile errors
- ✨ Refactor large code blocks
- 📋 Monitor terminal output and iterate

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

Open VS Code Settings (`Ctrl+,`) and search for `sheikha.copilot`:

| Setting | Default | Description |
|---------|---------|-------------|
| `sheikha.copilot.enable` | `true` | Master enable/disable |
| `sheikha.copilot.serverUrl` | `http://localhost:8080` | Sheikha backend server |
| `sheikha.copilot.enableInlineCompletions` | `true` | Real-time code suggestions |
| `sheikha.copilot.enableChat` | `true` | Chat panel |
| `sheikha.copilot.enableAgentMode` | `true` | Agent mode (multi-step tasks) |
| `sheikha.copilot.enableNES` | `true` | Next Edit Suggestions |
| `sheikha.copilot.shariaGuardrails` | `true` | Enable Islamic compliance checks |
| `sheikha.copilot.defaultModel` | `sheikha-copilot-base` | Default AI model |
| `sheikha.copilot.completionDelay` | `150` | Delay for completions (ms) |
| `sheikha.copilot.maxCompletions` | `3` | Max suggestions to show |
| `sheikha.copilot.arabicComments` | `true` | Prefer Arabic in suggestions |

## Keyboard Shortcuts

| Shortcut | Command | Platform |
|----------|---------|----------|
| `Ctrl+Shift+I` | Open Chat | Windows/Linux/Mac |
| `Ctrl+I` | Inline Chat | Windows/Linux |
| `Cmd+I` | Inline Chat | Mac |
| `Tab` | Accept NES suggestion | Windows/Linux/Mac |

## Supported Languages

Sheikha Copilot works with:

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
شيخة كوبايلوت: كودك ملكك.
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
│  VS Code + Sheikha Copilot Extension   │
│  ├─ Completions                        │
│  ├─ Chat Panel                         │
│  ├─ Agent Mode                         │
│  └─ Inline Chat                        │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
               ▼
┌─────────────────────────────────────────┐
│  Sheikha Backend Server (port 8080)    │
│  ├─ /api/sheikha/copilot/completions  │
│  ├─ /api/sheikha/copilot/chat         │
│  ├─ /api/sheikha/copilot/agent        │
│  ├─ /api/sheikha/copilot/nes          │
│  ├─ /api/sheikha/copilot/inline-chat  │
│  └─ /api/sheikha/copilot/settings     │
└─────────────────────────────────────────┘
```

## API Endpoints

All endpoints are available on the Sheikha backend:

### Status & Config

```
GET /api/sheikha/copilot/status            ← System status
GET /api/sheikha/copilot/models            ← Available AI models
GET /api/sheikha/copilot/languages         ← Supported programming languages
GET /api/sheikha/copilot/settings          ← User settings
GET /api/sheikha/copilot/vscode-bridge     ← VS Code bridge status
```

### Coding Assistance

```
POST /api/sheikha/copilot/completions      ← Inline completions
POST /api/sheikha/copilot/chat             ← Chat interface
POST /api/sheikha/copilot/agent            ← Agent mode (multi-step)
POST /api/sheikha/copilot/nes              ← Next Edit Suggestions
POST /api/sheikha/copilot/inline-chat      ← Inline chat/refactoring
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
- Check `sheikha.copilot.serverUrl` setting (default: `http://localhost:8080`)
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
code --install-extension ./sheikha-copilot-1.0.0.vsix
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
