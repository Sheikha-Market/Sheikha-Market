const express = require('express');
const router = express.Router();

let Net = null;
try {
  Net = require('../lib/sheikha-language-neural-cell-network');
} catch (err) {
  Net = null;
}

function ok(data, message = 'ok') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

router.get('/health', (req, res) => {
  res.json(ok({
    service: 'shl-neural-cell-network',
    engineLoaded: !!Net,
    status: Net ? 'operational' : 'fallback',
    endpoints: [
      'POST /api/shl-neural/infer',
      'POST /api/shl-neural/process',
      'POST /api/shl-neural/compare',
      'GET /api/shl-neural/topology',
      'GET /api/shl-neural/search?q='
    ]
  }, 'شبكة خلايا لغة شيخة تعمل'));
});

router.post('/infer', (req, res) => {
  const text = req.body?.text || req.body?.command || '';
  if (Net && typeof Net.infer === 'function') return res.json(ok(Net.infer(text), 'تم الاستدلال'));
  res.json(ok({ fallback: true, text, domain: 'unknown', confidence: 0 }, 'fallback infer'));
});

router.post('/process', (req, res) => {
  const text = req.body?.text || req.body?.command || '';
  if (Net && typeof Net.process === 'function') return res.json(ok(Net.process(text), 'تمت المعالجة الكاملة'));
  res.json(ok({ fallback: true, text, tokens: String(text).split(/\s+/).filter(Boolean) }, 'fallback process'));
});

router.post('/compare', (req, res) => {
  const a = req.body?.a || req.body?.textA || '';
  const b = req.body?.b || req.body?.textB || '';
  if (Net && typeof Net.compare === 'function') return res.json(ok(Net.compare(a, b), 'تمت المقارنة'));
  res.json(ok({ fallback: true, similarity: 0, a, b }, 'fallback compare'));
});

router.get('/topology', (req, res) => {
  if (Net && typeof Net.topology === 'function') return res.json(ok(Net.topology(), 'تم عرض هيكل الشبكة'));
  res.json(ok({ fallback: true, layers: 5, cells: 63 }, 'fallback topology'));
});

router.get('/search', (req, res) => {
  const q = req.query.q || '';
  if (Net && typeof Net.searchCells === 'function') return res.json(ok(Net.searchCells(q), 'تم البحث في الخلايا'));
  res.json(ok({ fallback: true, query: q, results: [] }, 'fallback search'));
});

module.exports = router;
