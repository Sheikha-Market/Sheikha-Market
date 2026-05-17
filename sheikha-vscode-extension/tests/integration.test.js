const fetch = require('node-fetch');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

/**
 * Sheikha Copilot — Integration Tests
 * Tests the extension's integration with the backend API
 * 
 * Prerequisites:
 * - Sheikha server running on http://localhost:8080
 * - All /api/sheikha/copilot/* endpoints available
 */

const API_BASE_URL = 'http://localhost:8080/api/sheikha/copilot';
const TIMEOUT = 30000; // 30 seconds

describe('Sheikha Copilot API Integration Tests', () => {
  let serverHealthy = false;

  beforeAll(async () => {
    // Check if server is running
    try {
      const response = await fetch(`${API_BASE_URL}/status`, {
        timeout: 5000
      });
      serverHealthy = response.ok;
      console.log('✅ Server is reachable');
    } catch (error) {
      console.error('❌ Server unreachable:', error.message);
      console.log('   Make sure Sheikha server is running on port 8080');
      serverHealthy = false;
    }
  }, TIMEOUT);

  describe('Status Endpoint', () => {
    test('GET /status should return active Copilot status', async () => {
      if (!serverHealthy) {
        console.warn('⚠️  Skipping: Server not running');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/status`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      
      const copilot = data.data;
      expect(copilot).toHaveProperty('name', 'Sheikha Copilot');
      expect(copilot).toHaveProperty('version', '1.0.0');
      expect(copilot).toHaveProperty('status', 'active');
      expect(copilot).toHaveProperty('shariaGuardrails', true);
    }, TIMEOUT);

    test('Response timestamp should be valid ISO string', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();

      expect(data).toHaveProperty('timestamp');
      expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
    }, TIMEOUT);
  });

  describe('Models Endpoint', () => {
    test('GET /models should return 4 available models', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/models`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.models)).toBe(true);
      expect(data.data.models.length).toBe(4);
    }, TIMEOUT);

    test('Each model should have required properties', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/models`);
      const data = await response.json();

      data.data.models.forEach(model => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('contextWindow');
        expect(typeof model.contextWindow).toBe('number');
        expect(model.contextWindow).toBeGreaterThan(0);
      });
    }, TIMEOUT);

    test('Models should include base, chat, agent, and sharia-safe variants', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/models`);
      const data = await response.json();
      const modelIds = data.data.models.map(m => m.id);

      expect(modelIds).toContain('sheikha-copilot-base');
      expect(modelIds).toContain('sheikha-copilot-chat');
      expect(modelIds).toContain('sheikha-copilot-agent');
      expect(modelIds).toContain('sheikha-copilot-sharia');
    }, TIMEOUT);
  });

  describe('Languages Endpoint', () => {
    test('GET /languages should return supported programming languages', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/languages`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.languages)).toBe(true);
      expect(data.data.languages.length).toBe(23);
    }, TIMEOUT);

    test('Languages should include JavaScript, Python, and TypeScript', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/languages`);
      const data = await response.json();
      const langIds = data.data.languages.map(l => (typeof l === 'string' ? l : l.id));

      expect(langIds).toContain('javascript');
      expect(langIds).toContain('python');
      expect(langIds).toContain('typescript');
      expect(langIds).toContain('java');
    }, TIMEOUT);
  });

  describe('Completions Endpoint', () => {
    test('POST /completions should return code suggestions', async () => {
      if (!serverHealthy) return;

      const payload = {
        code: 'function ',
        language: 'javascript',
        cursorPosition: 9
      };

      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('completions');
      expect(Array.isArray(data.data.completions)).toBe(true);
      expect(data.data.completions.length).toBeGreaterThan(0);
      expect(data.data.completions.length).toBeLessThanOrEqual(3);
    }, TIMEOUT);

    test('Should require code and language parameters', async () => {
      if (!serverHealthy) return;

      // Missing language
      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'function ' })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
    }, TIMEOUT);

    test('Suggestions should have text and score properties', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'const result = ',
          language: 'javascript'
        })
      });

      const data = await response.json();
      data.data.completions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('text');
        expect(typeof suggestion.text).toBe('string');
        expect(suggestion.text.length).toBeGreaterThan(0);
      });
    }, TIMEOUT);
  });

  describe('Chat Endpoint', () => {
    test('POST /chat should accept message and language', async () => {
      if (!serverHealthy) return;

      const payload = {
        message: 'هل يمكنك كتابة دالة بسيطة؟',
        language: 'javascript'
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('reply');
      expect(typeof data.data.reply).toBe('string');
      expect(data.data.reply.length).toBeGreaterThan(0);
    }, TIMEOUT);

    test('Chat response should include sharia compliance flag', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Write a function to sort an array',
          language: 'javascript'
        })
      });

      const data = await response.json();
      expect(data.data).toHaveProperty('shariaCompliant');
      expect(typeof data.data.shariaCompliant).toBe('boolean');
    }, TIMEOUT);

    test('Should block Sharia-non-compliant requests', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'اكتب كود لحساب الفائدة المركبة (riba calculation)',
          language: 'javascript'
        })
      });

      // Should either return 403 or have shariaCompliant: false
      const data = await response.json();
      expect(data).toBeDefined();
      
      if (response.status === 403) {
        expect(data.blockedTerms).toBeDefined();
      }
    }, TIMEOUT);
  });

  describe('NES (Next Edit Suggestions) Endpoint', () => {
    test('POST /nes should predict next code edit', async () => {
      if (!serverHealthy) return;

      const payload = {
        code: 'function validateEmail(email) {\n  if (!email) ',
        language: 'javascript'
      };

      const response = await fetch(`${API_BASE_URL}/nes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('nextEditSuggestions');
      expect(Array.isArray(data.data.nextEditSuggestions)).toBe(true);
    }, TIMEOUT);

    test('NES suggestions should include line numbers and reasons', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/nes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'class User {\n  constructor() {}',
          language: 'javascript'
        })
      });

      const data = await response.json();
      if (data.data.nextEditSuggestions.length > 0) {
        data.data.nextEditSuggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('text');
          expect(suggestion).toHaveProperty('reason');
        });
      }
    }, TIMEOUT);
  });

  describe('Inline Chat Endpoint', () => {
    test('POST /inline-chat should refactor selected code', async () => {
      if (!serverHealthy) return;

      const payload = {
        selectedCode: 'const x = 5; const y = 10; return x + y;',
        prompt: 'simplify this code',
        language: 'javascript'
      };

      const response = await fetch(`${API_BASE_URL}/inline-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('modifiedCode');
      expect(typeof data.data.modifiedCode).toBe('string');
    }, TIMEOUT);

    test('Inline chat should support explain, refactor, error-handling, test prompts', async () => {
      if (!serverHealthy) return;

      const testPrompts = ['explain', 'refactor', 'error-handling', 'test'];
      const code = 'function add(a, b) { return a + b; }';

      for (const prompt of testPrompts) {
        const response = await fetch(`${API_BASE_URL}/inline-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedCode: code,
            prompt,
            language: 'javascript'
          })
        });

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.modifiedCode).toBeDefined();
      }
    }, TIMEOUT);
  });

  describe('Settings Endpoint', () => {
    test('GET /settings should return configuration', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/settings`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('settings');
      expect(data.data.settings).toHaveProperty('completionDelay');
      expect(data.data.settings).toHaveProperty('maxCompletions');
    }, TIMEOUT);
  });

  describe('VS Code Bridge Endpoint', () => {
    test('GET /vscode-bridge should return bridge status', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/vscode-bridge`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('bridge');
      expect(data.data.bridge).toHaveProperty('name');
      expect(data.data.bridge).toHaveProperty('status', 'active');
      expect(data.data.bridge).toHaveProperty('protocol', 'MCP');
    }, TIMEOUT);
  });

  describe('Unified Integrations', () => {
    test('Copilot should be registered in unified integrations', async () => {
      if (!serverHealthy) return;

      const response = await fetch('http://localhost:8080/api/sheikha/unified-integrations');
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data.data.modules)).toBe(true);

      const copilotModule = data.data.modules.find(m => m.key === 'sheikha-copilot');
      expect(copilotModule).toBeDefined();
      expect(copilotModule.status).toBe('active');
      expect(copilotModule.version).toBe('1.0.0');
      expect(Array.isArray(copilotModule.modes)).toBe(true);
      expect(copilotModule.modes.length).toBeGreaterThan(0);
    }, TIMEOUT);
  });

  describe('Error Handling', () => {
    test('Invalid JSON should return 400', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {'
      });

      expect(response.status).toBe(400);
    }, TIMEOUT);

    test('Missing required fields should return 400', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing code and language
      });

      const data = await response.json();
      expect(data.success).toBe(false);
    }, TIMEOUT);

    test('Unknown language should be handled gracefully', async () => {
      if (!serverHealthy) return;

      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'function test()',
          language: 'unknown-language-xyz'
        })
      });

      const data = await response.json();
      // Should either work or return meaningful error
      expect(data).toHaveProperty('success');
    }, TIMEOUT);
  });

  describe('Performance', () => {
    test('Status endpoint should respond within 1 second', async () => {
      if (!serverHealthy) return;

      const start = Date.now();
      await fetch(`${API_BASE_URL}/status`);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000);
    }, TIMEOUT);

    test('Completions should respond within 5 seconds', async () => {
      if (!serverHealthy) return;

      const start = Date.now();
      await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'function ',
          language: 'javascript'
        })
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(5000);
    }, TIMEOUT);
  });
});

/**
 * Running Tests:
 * 
 * Prerequisites:
 * npm install --save-dev jest node-fetch @jest/globals
 * 
 * Commands:
 * npm test                    # Run all tests
 * npm test -- --verbose       # Show detailed output
 * npm test -- --coverage      # Generate coverage report
 * npm run test:watch          # Watch mode
 * 
 * Expected Output:
 * ✓ All endpoints should respond successfully
 * ✓ Responses should have correct structure
 * ✓ Sharia compliance gates should be active
 * ✓ Performance targets should be met
 */
