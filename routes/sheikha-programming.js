'use strict';

const express = require('express');
const http = require('http');

const router = express.Router();

router.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const CORE_MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core:latest';
const CODE_MODEL = process.env.SHEIKHA_CODE_REASONING_MODEL || 'qwen2.5-coder:14b';
const FALLBACK_CODE_MODEL = process.env.SHEIKHA_CODE_FALLBACK_MODEL || 'qwen3:8b';

function generate(prompt) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model: CODE_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.05, num_predict: 180 }
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

    req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
    req.on('error', e => resolve(`ERROR: ${e.message}`));
    req.write(body);
    req.end();
  });
}

router.get('/api/sheikha/programming/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ACTIVE',
      route: '/api/sheikha/programming/ask',
      officialModel: CORE_MODEL,
      codeModel: CODE_MODEL
    }
  });
});

router.post('/api/sheikha/programming/ask', async (req, res) => {
  try {
    const message = String(req.body?.message || req.body?.prompt || '').trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'missing_message'
      });
    }

    const prompt = `اكتب الإجابة المطلوبة مباشرة. إذا كان الطلب كودًا فاكتب الكود فقط أولًا.

طلب المستخدم:
${message}`;

    let answer = await generate(prompt);

    if (
      String(answer).includes('llama runner process has terminated') ||
      String(answer).includes('TIMEOUT') ||
      String(answer).startsWith('ERROR:')
    ) {
      const original = process.env.SHEIKHA_CODE_REASONING_MODEL;
      process.env.SHEIKHA_CODE_REASONING_MODEL = FALLBACK_CODE_MODEL;
      answer = await generate(prompt);
      if (original) process.env.SHEIKHA_CODE_REASONING_MODEL = original;
    }

    res.json({
      success: true,
      data: {
        provider: 'Sheikha Programming Fabric',
        officialModel: CORE_MODEL,
        executionModel: String(answer).includes('llama runner process') ? FALLBACK_CODE_MODEL : CODE_MODEL,
        input: message,
        answer
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
