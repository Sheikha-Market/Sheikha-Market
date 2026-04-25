const express = require('express');
const crypto = require('crypto');

const router = express.Router();

function safeRequire(path, fallbackFactory) {
  try {
    const mod = require(path);
    return typeof mod === 'function' ? new mod() : mod;
  } catch (err) {
    return fallbackFactory(err);
  }
}

const languageLayer = safeRequire('../lib/sheikha-language-layer', (err) => ({
  status: 'fallback',
  reason: err.message,
  activate: () => ({
    schema: 'sheikha/v2',
    ok: true,
    engine: 'Sheikha Language Layer',
    mode: 'fallback',
    layers: [
      'human-languages', 'mechanical-computing', 'programming-languages',
      'markup-languages', 'query-languages', 'unicode-utf8'
    ],
    bismillah: 'بسم الله الرحمن الرحيم',
    seal: 'والله أعلم وبالله التوفيق'
  })
}));

const supremeCs = safeRequire('../lib/sheikha-supreme-cs-engine', (err) => ({
  status: 'fallback',
  reason: err.message,
  info: () => ({
    schema: 'sheikha/v2',
    ok: true,
    engine: 'Sheikha Supreme CS Engine',
    mode: 'fallback',
    layers: ['programming', 'markup', 'fundamentals', 'algorithms', 'functional', 'security', 'computing', 'math'],
    bismillah: 'بسم الله الرحمن الرحيم',
    seal: 'والله أعلم وبالله التوفيق'
  })
}));

function response(data = {}) {
  return {
    schema: 'sheikha/v2',
    tawheed: 'لا إله إلا الله محمد رسول الله',
    bismillah: 'بسم الله الرحمن الرحيم',
    ok: true,
    timestamp: new Date().toISOString(),
    ...data,
    seal: 'والله أعلم وبالله التوفيق'
  };
}

function toArray(input) {
  return Array.isArray(input) ? input : [];
}

function sortValues(values = [], method = 'merge') {
  const arr = toArray(values).slice();
  if (method === 'bubble') {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    return arr;
  }
  return arr.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
}

function searchValues(values = [], target, method = 'linear') {
  const arr = toArray(values);
  if (method === 'binary') {
    const sorted = sortValues(arr);
    let lo = 0, hi = sorted.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sorted[mid] === target) return { found: true, index: mid, sorted };
      if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return { found: false, index: -1, sorted };
  }
  const index = arr.indexOf(target);
  return { found: index >= 0, index };
}

router.get('/health', (req, res) => {
  res.json(response({
    engine: 'Sheikha CS + Language Unified Runtime',
    status: 'healthy',
    integrations: ['language-layer', 'supreme-cs', 'sheikha-code', 'dashboard', 'runtime']
  }));
});

router.get('/language/activate', (req, res) => {
  const data = typeof languageLayer.activate === 'function' ? languageLayer.activate() : languageLayer;
  res.json(response({ engine: 'language-layer', data }));
});

router.get('/supreme/info', (req, res) => {
  const data = typeof supremeCs.info === 'function' ? supremeCs.info() : supremeCs;
  res.json(response({ engine: 'supreme-cs', data }));
});

router.post('/execute', (req, res) => {
  const { operation, values, target, method, amount, text, baseFrom, baseTo } = req.body || {};
  let result;

  switch (operation) {
    case 'sort':
      result = { operation, method: method || 'merge', values: sortValues(values, method) };
      break;
    case 'search':
      result = { operation, method: method || 'linear', ...searchValues(values, target, method) };
      break;
    case 'hash':
      result = { operation, algorithm: method || 'sha256', hash: crypto.createHash(method || 'sha256').update(String(text || '')).digest('hex') };
      break;
    case 'convert': {
      const decimal = parseInt(String(text || '0'), Number(baseFrom || 10));
      result = { operation, input: text, baseFrom: Number(baseFrom || 10), baseTo: Number(baseTo || 10), output: decimal.toString(Number(baseTo || 10)) };
      break;
    }
    case 'zakat': {
      const value = Number(amount || 0);
      result = { operation, amount: value, rate: 0.025, zakat: +(value * 0.025).toFixed(2) };
      break;
    }
    default:
      result = { operation: operation || 'info', message: 'Supported: sort, search, hash, convert, zakat, info' };
  }

  res.json(response({ engine: 'supreme-cs-runtime', result }));
});

router.get('/unified', (req, res) => {
  res.json(response({
    engine: 'Sheikha Unified Language + CS Runtime',
    layers: {
      languageLayer: ['Sumerian', 'Hieroglyphics', 'Ada', 'Plankalkul', 'FORTRAN', 'GML/SGML/HTML', 'SQL', 'Unicode/UTF-8'],
      supremeCs: ['programming', 'markup', 'fundamentals', 'algorithms', 'functional', 'security', 'computing', 'mathematics']
    },
    endpoints: [
      'GET /api/cs-language/health',
      'GET /api/cs-language/language/activate',
      'GET /api/cs-language/supreme/info',
      'GET /api/cs-language/unified',
      'POST /api/cs-language/execute'
    ]
  }));
});

module.exports = router;
