'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { LocalChat } = require('../src/chat/sheikhaLocalChat');

async function main() {
  const chat = new LocalChat();
  const inventory = await chat.adapter.inspect();
  const model = inventory.models.find(item => item.name === 'Sheikha-Core:latest');
  if (!model) throw Error('EXISTING_SHEIKHA_CORE_REQUIRED_NO_DOWNLOAD');
  chat.selection = model;
  const prompt = 'احسب 6 ضرب 7. أجب بالعدد فقط دون مقدمة.';
  const chunks = []; const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 95000);
  try {
    const result = await chat.reply(prompt, { allow: () => true, signal: controller.signal, onToken: token => chunks.push(token) });
    const report = { system: 'SHEIKHA_LOCAL_CHAT_SMOKE_V1', checkedAt: new Date().toISOString(),
      syntheticPromptOnly: true, prompt, ...result, chunkCount: chunks.length,
      streamedTextMatchesFinal: chunks.join('') === result.answer,
      arithmeticCheckPassed: /^\s*(?:42|٤٢)[.!\s]*$/u.test(result.answer),
      answerSha256: crypto.createHash('sha256').update(result.answer).digest('hex'),
      benchmarkClaim: false, gpuTrainingExecuted: false, commercialReadinessProven: false };
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-local-chat-proof-'));
    fs.chmodSync(directory, 0o700);
    const file = path.join(directory, 'result.json');
    fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    console.log(JSON.stringify({ file, model: result.model, metrics: result.metrics, chunkCount: chunks.length,
      streamedTextMatchesFinal: report.streamedTextMatchesFinal, arithmeticCheckPassed: report.arithmeticCheckPassed,
      trainingExecuted: false, ownershipProven: false }, null, 2));
    if (!report.streamedTextMatchesFinal || !report.arithmeticCheckPassed || result.truncated) process.exitCode = 1;
  } finally { clearTimeout(timer); }
}
main().catch(error => { console.error(String(error.message)); process.exitCode = 1; });
