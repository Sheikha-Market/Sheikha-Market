'use strict';

const express = require('express');
const http = require('http');
const router = express.Router();

router.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const CORE_MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core:latest';

function generateCore(prompt) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model: CORE_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 350
      }
    });

    const req = http.request(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 180000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve(j.response || j.error || data);
        } catch {
          resolve(data);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve('TIMEOUT');
    });

    req.on('error', e => resolve(`ERROR: ${e.message}`));
    req.write(body);
    req.end();
  });
}

router.post('/api/sheikha/ai-gateway/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || req.body?.prompt || '').trim();
    const mode = req.body?.mode || 'agentic';

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'missing_message'
      });
    }

    const prompt = [
      'أنت Sheikha-Core داخل منظومة شيخة.',
      'أجب على طلب المستخدم مباشرة، ولا ترجع قالبًا ثابتًا.',
      'اذكر المسار أو runtimeUrl أو route فقط إذا طلبها المستخدم.',
      '',
      `mode: ${mode}`,
      'طلب المستخدم:',
      message
    ].join('\n');

    const reply = await generateCore(prompt);

    res.json({
      success: true,
      data: {
        reply,
        provider: 'Sheikha Runtime',
        model: CORE_MODEL,
        mode,
        localModelOnline: true,
        route: '/api/sheikha/ai-gateway/chat',
        runtimeTarget: 'server-https'
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/sheikha/debug/encryption', (req, res) => {
  const ipSecurityEngine = require('../lib/sheikha-ip-security-engine');
  res.json({
    success: true,
    env: {
      DATA_ENCRYPTION_KEY: Boolean(process.env.DATA_ENCRYPTION_KEY),
      DATA_ENCRYPTION_KEY_HEX: Boolean(process.env.DATA_ENCRYPTION_KEY_HEX),
      SHEIKHA_ENCRYPTION_KEY: Boolean(process.env.SHEIKHA_ENCRYPTION_KEY),
      JWT_SECRET: Boolean(process.env.JWT_SECRET)
    },
    ready: ipSecurityEngine.isEncryptionReady()
  });
});

module.exports = router;
