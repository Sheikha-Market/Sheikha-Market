const express = require('express');
const router = express.Router();

function parseNumbers(text) {
  const nums = String(text || '').match(/-?\d+(\.\d+)?/g);
  return nums ? nums.map(Number) : [];
}

function decide(command) {
  const text = String(command || '').trim();
  const numbers = parseNumbers(text);

  if (/رتب|فرز|sort/i.test(text)) {
    return { target: 'cs-language', operation: 'sort', payload: { operation: 'sort', values: numbers.length ? numbers : [5, 3, 1, 4, 2] } };
  }

  if (/ابحث|بحث|search/i.test(text)) {
    return { target: 'cs-language', operation: 'search', payload: { operation: 'search', values: numbers.length > 1 ? numbers.slice(0, -1) : [1, 2, 3, 4], target: numbers.length ? numbers[numbers.length - 1] : 3 } };
  }

  if (/زكاة|zakat/i.test(text)) {
    return { target: 'cs-language', operation: 'zakat', payload: { operation: 'zakat', amount: numbers[0] || 10000 } };
  }

  if (/hash|هاش|بصمة/i.test(text)) {
    return { target: 'cs-language', operation: 'hash', payload: { operation: 'hash', text } };
  }

  if (/تحويل|convert/i.test(text)) {
    return { target: 'cs-language', operation: 'convert', payload: { operation: 'convert', text: numbers[0] ? String(numbers[0]) : '1010', baseFrom: 2, baseTo: 10 } };
  }

  if (/حالة|النظام|status/i.test(text)) {
    return { target: 'orchestrator', operation: 'state', payload: {} };
  }

  return { target: 'none', operation: 'unknown', payload: { command: text } };
}

router.get('/health', (req, res) => {
  res.json({ success: true, service: 'sheikha-code-decision', status: 'healthy' });
});

router.post('/command', async (req, res) => {
  try {
    const command = req.body && req.body.command;
    const decision = decide(command);

    let execution = null;
    if (decision.target === 'cs-language') {
      const mod = require('./sheikha-cs-language.routes');
      execution = { routed: '/api/cs-language/execute', payload: decision.payload };
    }

    res.json({
      success: true,
      schema: 'sheikha/v2',
      command,
      decision,
      execution,
      message: 'تم تحويل أمر لغة شيخة إلى قرار تنفيذي',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
