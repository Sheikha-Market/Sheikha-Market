'use strict';

const express = require('express');
const router = express.Router();

const TODOS = [];
const TAGS = new Set(['runtime','vscode','debug','registry','rag','cli','sdk','mcp','graphics']);

router.get('/api/sheikha/todo/status', (req, res) => {
  res.json({ success:true, data:{ count:TODOS.length, todos:TODOS } });
});

router.post('/api/sheikha/todo/add', (req, res) => {
  const item = {
    id: Date.now(),
    text: String(req.body?.text || req.body?.message || '').trim(),
    status: 'open',
    createdAt: new Date().toISOString()
  };
  if (!item.text) return res.status(400).json({ success:false, error:'missing_todo_text' });
  TODOS.push(item);
  res.json({ success:true, data:item });
});

router.get('/api/sheikha/tags/status', (req, res) => {
  res.json({ success:true, data:{ tags:[...TAGS] } });
});

router.post('/api/sheikha/tags/add', (req, res) => {
  const tag = String(req.body?.tag || '').trim();
  if (!tag) return res.status(400).json({ success:false, error:'missing_tag' });
  TAGS.add(tag);
  res.json({ success:true, data:{ tag, tags:[...TAGS] } });
});

router.get('/api/sheikha/global-registry/status', (req, res) => {
  res.json({
    success:true,
    data:{
      status:'ACTIVE',
      fabric:'SHEIKHA_GLOBAL_REGISTRY_FABRIC',
      registries:['github','gitlab','npm','pypi','dockerhub','openvsx','vscode-marketplace','google','apple','microsoft','windows'],
      mode:'read-first',
      externalWrite:'blocked_until_authorized'
    }
  });
});

module.exports = router;
