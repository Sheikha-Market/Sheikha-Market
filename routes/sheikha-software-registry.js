'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '10mb' }));

const ROOT = '/opt/sheikha/current';
const REGISTRY = path.join(ROOT, 'registry/software/software-registry.json');

function hash(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function load() {
  if (!fs.existsSync(REGISTRY)) return { version: 1, items: [] };
  return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}

function save(db) {
  fs.mkdirSync(path.dirname(REGISTRY), { recursive: true });
  fs.writeFileSync(REGISTRY, JSON.stringify(db, null, 2));
}

router.get('/api/sheikha/software-registry/status', (req, res) => {
  const db = load();
  res.json({
    success: true,
    data: {
      status: 'ACTIVE',
      count: db.items.length,
      registry: REGISTRY,
      mode: 'indexed-learning-not-uncontrolled-self-training'
    }
  });
});

router.post('/api/sheikha/software-registry/index', (req, res) => {
  const dirs = ['routes', 'lib', 'core', 'runtime', 'scripts', 'sheikha-vscode-extension/src'];
  const exts = /\.(js|cjs|mjs|ts|tsx|json|md|sh|py)$/;
  const db = { version: 1, updatedAt: new Date().toISOString(), items: [] };

  function walk(abs) {
    if (!fs.existsSync(abs)) return;
    for (const item of fs.readdirSync(abs)) {
      const full = path.join(abs, item);
      if (full.includes('node_modules') || full.includes('.git') || full.includes('.venv') || full.includes('archive')) continue;
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (exts.test(full)) {
        const text = fs.readFileSync(full, 'utf8');
        db.items.push({
          file: full.replace(ROOT + '/', ''),
          size: st.size,
          sha256: hash(text),
          language: path.extname(full).replace('.', ''),
          summary: text.slice(0, 500)
        });
      }
    }
  }

  dirs.forEach(d => walk(path.join(ROOT, d)));
  save(db);

  res.json({ success: true, data: { indexed: db.items.length, registry: REGISTRY } });
});

router.post('/api/sheikha/software-registry/search', (req, res) => {
  const q = String(req.body?.query || '').toLowerCase().trim();
  const db = load();

  const results = db.items
    .filter(x =>
      x.file.toLowerCase().includes(q) ||
      x.summary.toLowerCase().includes(q) ||
      x.language.toLowerCase().includes(q)
    )
    .slice(0, 25);

  res.json({ success: true, data: { query: q, results } });
});

router.post('/api/sheikha/software-registry/propose', (req, res) => {
  const objective = String(req.body?.objective || '').trim();
  if (!objective) return res.status(400).json({ success: false, error: 'missing_objective' });

  const db = load();
  const proposal = {
    id: 'proposal-' + Date.now(),
    createdAt: new Date().toISOString(),
    objective,
    evidenceCount: db.items.length,
    rule: 'اقتراح فقط؛ لا تعديل تلقائي قبل الاختبار والمراجعة',
    recommendedFlow: [
      'search registry',
      'select relevant files',
      'generate patch proposal',
      'run node --check / npm test',
      'human approval',
      'git commit'
    ]
  };

  const out = path.join(ROOT, 'proposals/improvements', proposal.id + '.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(proposal, null, 2));

  res.json({ success: true, data: proposal });
});

module.exports = router;
