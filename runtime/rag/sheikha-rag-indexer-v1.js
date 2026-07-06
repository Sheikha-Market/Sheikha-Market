'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const INDEX_FILE = path.join(ROOT, 'runtime/rag/index/sheikha-rag-index-v1.json');

const SOURCES = [
  'docs',
  'architecture',
  'governance',
  'runtime',
  'tests'
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(md|txt|json|js|mjs|ts)$/i.test(item)) out.push(full);
  }
  return out;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function buildIndex() {
  const docs = [];

  for (const src of SOURCES) {
    const base = path.join(ROOT, src);
    for (const file of walk(base)) {
      const rel = path.relative(ROOT, file);
      let text = '';
      try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }

      const compact = text.slice(0, 6000);
      docs.push({
        path: rel,
        source: src,
        title: path.basename(file),
        text: compact,
        tokens: [...new Set(tokenize(compact))].slice(0, 500)
      });
    }
  }

  const index = {
    name: 'SHEIKHA_RAG_INDEX_V1',
    status: 'ACTIVE',
    builtAt: new Date().toISOString(),
    documentCount: docs.length,
    sources: SOURCES,
    docs
  };

  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  return index;
}

function searchIndex(query, limit = 5) {
  let index;
  try { index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')); }
  catch { index = buildIndex(); }

  const q = new Set(tokenize(query));
  const scored = index.docs.map(d => {
    let score = 0;
    for (const t of d.tokens || []) if (q.has(t)) score++;
    return { ...d, score };
  }).filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    index: {
      name: index.name,
      status: index.status,
      builtAt: index.builtAt,
      documentCount: index.documentCount
    },
    results: scored.map(x => ({
      path: x.path,
      source: x.source,
      title: x.title,
      score: x.score,
      excerpt: x.text.slice(0, 700)
    }))
  };
}

module.exports = { buildIndex, searchIndex };
