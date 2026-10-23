#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const SOURCE = path.join(ROOT, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2.jsonl');
const SOURCE_MANIFEST = path.join(ROOT, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2.manifest.json');
const OUTPUT_DIR = path.join(ROOT, 'data/sheikha-ai-training/foundry-v1');

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function main() {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const sourceManifest = JSON.parse(fs.readFileSync(SOURCE_MANIFEST, 'utf8'));
  if (digest(source) !== sourceManifest.sha256) {
    throw new Error('SOURCE_DATASET_SHA256_MISMATCH');
  }
  const records = source.split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line));
  const splits = { training: [], validation: [], test: [] };
  records.forEach((record, index) => {
    const bucket = index % 10;
    const split = bucket === 8 ? 'validation' : bucket === 9 ? 'test' : 'training';
    splits[split].push({
      messages: [
        { role: 'system', content: 'أنت مساعد شيخة العربي المحكوم. قدّم جوابًا دقيقًا ونافعًا، وميّز الدليل عن الادعاء.' },
        { role: 'user', content: String(record.prompt || '').trim() },
        { role: 'assistant', content: String(record.completion || '').trim() },
      ],
    });
  });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const files = {};
  for (const [name, items] of Object.entries(splits)) {
    const content = `${items.map((item) => JSON.stringify(item)).join('\n')}\n`;
    const file = path.join(OUTPUT_DIR, `${name}.jsonl`);
    fs.writeFileSync(file, content);
    files[name] = { records: items.length, sha256: digest(content), path: path.relative(ROOT, file) };
  }
  const base = {
    system: 'SHEIKHA_FOUNDRY_SFT_DATASET_V1',
    status: 'FORMATTED_AND_SPLIT_NOT_UPLOADED',
    source: { records: records.length, sha256: digest(source) },
    splitPolicy: 'DETERMINISTIC_80_10_10_BY_SOURCE_ORDER_MODULO_10',
    files,
    externalUploadApproved: false,
    qualityQuarantineRetained: true,
  };
  const report = { ...base, sha256: digest(JSON.stringify(base)) };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
