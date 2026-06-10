'use strict';

const express = require('express');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(express.json());

const ROOT = '/opt/sheikha/current';
const VERSION = 'sheikha-tools-v2-current-root';

router.get('/api/sheikha/tools/status', (req, res) => {
  res.json({ success: true, data: { version: VERSION, cli: true, rag: true, mcp: true, sdk: true, graphics: true, root: ROOT } });
});

router.post('/api/sheikha/cli/run', (req, res) => {
  const cmd = String(req.body?.command || '').trim();

  if (cmd === 'pwd') {
    return res.json({ success: true, data: { command: 'pwd', stdout: ROOT + '\n', stderr: '', error: null } });
  }

  const allowed = {
    ls: ['ls', ['-lah']],
    git_status: ['git', ['status', '--short']],
    pm2_status: ['pm2', ['status']],
    health: ['curl', ['-s', 'http://127.0.0.1:8080/api/health']]
  };

  if (!allowed[cmd]) return res.status(400).json({ success: false, error: 'command_not_allowed', allowed: ['pwd', ...Object.keys(allowed)] });

  const [bin, args] = allowed[cmd];
  execFile(bin, args, { cwd: ROOT, timeout: 15000 }, (error, stdout, stderr) => {
    res.json({ success: !error, data: { command: cmd, stdout, stderr, error: error?.message || null } });
  });
});

router.post('/api/sheikha/rag/search', (req, res) => {
  const q = String(req.body?.query || '').trim();
  if (!q) return res.status(400).json({ success:false, error:'missing_query' });

  const results = [];
  const dirs = ['routes', 'src', 'lib', 'core', 'docs', 'runtime', 'sheikha-vscode-extension', 'public'];

  function walk(p) {
    if (!fs.existsSync(p)) return;
    for (const item of fs.readdirSync(p)) {
      const full = path.join(p, item);
      if (full.includes('node_modules') || full.includes('.git') || full.includes('.venv') || full.includes('archive')) continue;
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(js|json|md|txt|sh|cjs|mjs)$/.test(full)) {
        const rel = full.replace(ROOT + '/', '');
        const text = fs.readFileSync(full, 'utf8');
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        const nameHit = rel.toLowerCase().includes(q.toLowerCase());
        if ((idx >= 0 || nameHit) && results.length < 20) {
          results.push({
            file: rel,
            match: nameHit ? 'filename' : 'content',
            snippet: idx >= 0 ? text.slice(Math.max(0, idx - 120), idx + 240) : rel
          });
        }
      }
    }
  }

  for (const dir of dirs) walk(path.join(ROOT, dir));
  res.json({ success:true, data:{ query:q, results } });
});

router.get('/api/sheikha/mcp/tools', (req, res) => {
  res.json({ success:true, data:{ tools:[
    { name:'cli.run', route:'/api/sheikha/cli/run' },
    { name:'rag.search', route:'/api/sheikha/rag/search' },
    { name:'graphics.render', route:'/api/sheikha/graphics/render' },
    { name:'programming.ask', route:'/api/sheikha/programming/ask' },
    { name:'runtime.chat', route:'/api/sheikha/ai-gateway/chat' }
  ]}});
});

router.get('/api/sheikha/sdk/registry', (req, res) => {
  res.json({ success:true, data:{ sdks:[
    { name:'vscode-extension', path:'sheikha-vscode-extension' },
    { name:'runtime-api', baseUrl:'https://api.sheikha.top' },
    { name:'programming-fabric', model:process.env.SHEIKHA_CODE_REASONING_MODEL || 'qwen2.5-coder:14b' }
  ]}});
});

router.post('/api/sheikha/graphics/render', (req, res) => {
  res.json({ success:true, data:{
    kind: String(req.body?.kind || 'route-map'),
    title: 'Sheikha Runtime Map',
    diagram: [
      'VS Code Extension',
      '↓',
      'https://api.sheikha.top',
      '↓',
      '/api/sheikha/ai-gateway/chat',
      '/api/sheikha/programming/ask',
      '/api/sheikha/cli/run',
      '/api/sheikha/rag/search',
      '/api/sheikha/graphics/render',
      '↓',
      'Sheikha-Core / qwen2.5-coder'
    ].join('\n')
  }});
});

module.exports = router;
