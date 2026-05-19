# Development Guide — Sheikha Copilot Extension

This guide helps developers extend and customize Sheikha Copilot for local development and contribution.

## Prerequisites

- **VS Code Insider's Edition** (recommended for development)
- **Node.js** v18+
- **npm** or **yarn**
- **Git** for version control
- **vsce** (VS Code Extension CLI) — `npm install -g vsce`
- **eslint** for code linting
- **jest** for unit testing

## Project Structure

```
sheikha-vscode-extension/
├── package.json                    # Extension manifest
├── extension.js                    # Main extension code
├── README.md                       # User documentation
├── INSTALLATION.md                 # Installation guide
├── USAGE.md                        # Usage examples
├── DEVELOPMENT.md                  # This file
├── build-vsix.sh                   # Build script
├── tests/
│   ├── integration.test.js         # API integration tests
│   ├── extension.test.js           # Extension unit tests
│   └── fixtures/                   # Test data
├── src/                            # Source code (optional)
│   ├── providers/
│   │   ├── SheikhaCopilotProvider.js
│   │   └── SheikhaChatProvider.js
│   ├── commands/
│   │   └── commands.js
│   └── utils/
│       └── constants.js
├── dist/                           # Build output
│   └── *.vsix                      # Packaged extensions
└── .vscode/
    ├── launch.json                 # Debug config
    └── tasks.json                  # Build tasks
```

## Setup Development Environment

### 1. Clone & Install

```bash
cd sheikha-vscode-extension
npm install
```

### 2. Install Development Dependencies

```bash
npm install --save-dev \
  eslint \
  jest \
  @jest/globals \
  prettier \
  vsce
```

### 3. Update package.json

```json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "@jest/globals": "^29.0.0",
    "prettier": "^3.0.0",
    "vsce": "^2.15.0"
  },
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint extension.js src/",
    "format": "prettier --write extension.js src/ tests/",
    "build": "npm run lint && npm run test",
    "package": "bash build-vsix.sh",
    "dev": "code --extensionDevelopmentPath=$PWD",
    "debug": "code --extensionDevelopmentPath=$PWD --inspect-brk=5005"
  }
}
```

### 4. Create Common Config Files

#### `.eslintrc.json`

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

#### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "useTabs": false,
  "tabWidth": 2
}
```

#### `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "npm: build"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Development Workflow

### 1. Making Code Changes

Changes go in `extension.js` or `src/` directory:

```javascript
// extension.js
const vscode = require('vscode');

class SheikhaCopilotProvider {
  constructor() {
    this.config = {};
    this.apiUrl = 'http://localhost:8080';
  }

  // Add your methods here
  async getCompletions(code, language) {
    // Your implementation
  }
}

module.exports = { SheikhaCopilotProvider };
```

### 2. Running in Development Mode

```bash
# Option 1: Run extension in VS Code
npm run dev

# Opens new VS Code instance with extension loaded
# Set breakpoints in extension.js and debug!

# Option 2: Debug mode with inspector
npm run debug
# Attach debugger at port 5005
```

### 3. Testing

```bash
# Run all tests
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm test -- --coverage
```

### 4. Code Quality

```bash
# Lint code
npm run lint

# Fix formatting
npm run format

# Run everything
npm run build
```

## Testing Strategy

### Unit Tests (extension.test.js)

Test individual functions in isolation:

```javascript
describe('SheikhaCopilotProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new SheikhaCopilotProvider();
  });

  test('should initialize with default config', () => {
    expect(provider.config).toBeDefined();
  });

  test('should validate API URL', async () => {
    const isValid = await provider.validateConnection();
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests (integration.test.js)

Test API endpoints with the server:

```javascript
describe('Sheikha Copilot API Integration', () => {
  const API_BASE = 'http://localhost:8080/api/sheikha/copilot';

  test('GET /status should return active status', async () => {
    const response = await fetch(`${API_BASE}/status`);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('active');
    expect(data.data.version).toBe('1.0.0');
  });

  test('POST /completions should return suggestions', async () => {
    const response = await fetch(`${API_BASE}/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'function',
        language: 'javascript'
      })
    });
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.suggestions)).toBe(true);
  });
});
```

## Debugging

### Using VS Code Debugger

1. Open extension directory in VS Code
2. Press `F5` or go to Run & Debug (Ctrl+Shift+D)
3. Select "Run Extension"
4. Set breakpoints in code
5. Extension launches in new window with debugger attached

### Console Logs

```javascript
// In extension.js
console.log('Debug: Copilot initialized');  // Shows in Extension Host output
console.error('Error:', error);              // Shows in Extension Host output
```

View logs in VS Code:
- Output Panel → Select "Sheikha Copilot" from dropdown

### Inspect API Calls

```javascript
// In extension.js - wrap API call
async function debugApiCall(endpoint, options) {
  console.log('[DEBUG] API Call:', endpoint);
  console.log('[DEBUG] Payload:', JSON.stringify(options.body, null, 2));
  
  const response = await fetch(endpoint, options);
  const data = await response.json();
  
  console.log('[DEBUG] Response:', JSON.stringify(data, null, 2));
  return data;
}
```

## Building & Packaging

### Local Build

```bash
npm run package

# Creates: dist/sheikha.sheikha-copilot-1.0.0.vsix
```

### For Production

```bash
# Update version in package.json
# Commit and tag release
git tag v1.0.1

# Build
npm run package

# Upload to marketplace (requires publisher account)
vsce publish --pat <Azure_DevOps_PAT>
```

## Common Development Tasks

### Add a New Command

1. Add to `package.json`:
```json
"commands": [
  {
    "command": "sheikha.myNewCommand",
    "title": "Sheikha Copilot: My New Command"
  }
]
```

2. Register in `extension.js`:
```javascript
const disposable = vscode.commands.registerCommand(
  'sheikha.myNewCommand',
  async () => {
    vscode.window.showInformationMessage('Command executed');
  }
);
context.subscriptions.push(disposable);
```

### Add a New Setting

1. Add to `package.json`:
```json
"configuration": {
  "properties": {
    "sheikha-copilot.newSetting": {
      "type": "boolean",
      "default": true,
      "description": "Description of new setting"
    }
  }
}
```

2. Access in extension:
```javascript
const config = vscode.workspace.getConfiguration('sheikha-copilot');
const value = config.get('newSetting');
```

### Add a New Webview

```javascript
const panel = vscode.window.createWebviewPanel(
  'sheikhaCopilot',
  'Sheikha Copilot',
  vscode.ViewColumn.One,
  { enableScripts: true }
);

panel.webview.html = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Hello from Sheikha Copilot!</h1>
      <script>
        const vscode = acquireVsCodeApi();
        // Your code here
      </script>
    </body>
  </html>
`;
```

## Troubleshooting Development

| Issue | Solution |
|-------|----------|
| Extension doesn't load | Check `package.json` → `main` path is correct |
| API errors in dev mode | Ensure Sheikha server is running on port 8080 |
| Breakpoints not working | Reload VS Code (Ctrl+R) |
| Tests failing | Run `npm install` to update dependencies |
| VSIX build fails | Check `vsce` is installed: `npm install -g vsce` |

## Contributing Guide

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Make** your changes following code style
4. **Test** thoroughly: `npm test`
5. **Commit** with descriptive messages
6. **Push** to your fork
7. **Create** a Pull Request with description
8. **Wait** for review and CI checks to pass

## Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes
- **Semicolons:** Always
- **Comments:** English only
- **Variables:** camelCase
- **Files:** kebab-case
- **Classes:** PascalCase

## Performance Tips

- Cache API responses with `Map`
- Debounce frequent API calls
- Use `async/await` instead of `Promise.then()`
- Minimize bundle size (check `npm list` for duplicates)
- Lazy-load heavy modules

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [WebView API](https://code.visualstudio.com/api/extension-guides/webview)
- [vscode-test Framework](https://github.com/microsoft/vscode-test)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)

## Support

For development questions or issues:
- Check existing GitHub issues
- Create a new issue with reproduction steps
- Reach out to core maintainers

---

**Version:** 1.0.0  
**Last Updated:** March 16, 2026  
**License:** Proprietary (Sheikha Platform)
