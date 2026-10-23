'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const identity = require('../core/identity/sheikha-identity-v1');
const canonical = require('../core/identity/sheikha-identity-v1.json');
test('browser identity matches canonical identity without personal owner fields', () => {
  assert.deepEqual(identity, canonical); assert.equal(identity.nameAr, 'شيخة');
  assert.equal(identity.ownerDetailsIncluded, false);
  assert.equal(Object.hasOwn(identity, 'commercialRegistration'), false);
  assert.equal(Object.hasOwn(identity, 'legalOwner'), false);
});
test('robot activation carries the same identity and simulation boundary', () => {
  const robot = require('../core/robotics/sheikha-robot-language-v1.cjs').activateDigitalRobot();
  assert.equal(robot.identity.id, identity.id); assert.equal(robot.mode, 'SIMULATION_ONLY');
  assert.equal(robot.physicalDriverConfigured, false);
});

test('interactive dashboard starts, stops and resets the shared browser simulator', () => {
  const vm = require('node:vm'); const fs = require('node:fs'); const path = require('node:path');
  const file = path.resolve(__dirname, '../docs/robotics/sheikha-live-identity-v1.html');
  const html = fs.readFileSync(file, 'utf8'); const elements = new Map(); let tick;
  for (const id of ['brand', 'purpose', 'values', 'state', 'agent', 'log', 'mission', 'start', 'stop', 'reset', 'obstacle'])
    elements.set(id, { value: 'warehouse-inspection', checked: false, textContent: '', setAttribute(key, value) { this[key] = value; } });
  const context = vm.createContext({ document: { getElementById: id => elements.get(id) }, setInterval(fn) { tick = fn; } });
  const scripts = /<script(?:\s+src="([^"]+)")?>([\s\S]*?)<\/script>/g;
  for (const match of html.matchAll(scripts)) {
    const code = match[1] ? fs.readFileSync(path.resolve(path.dirname(file), match[1]), 'utf8') : match[2];
    new vm.Script(code).runInContext(context);
  }
  assert.equal(elements.get('brand').textContent, 'شيخة');
  elements.get('start').onclick(); for (let i = 0; i < 64; ++i) tick();
  assert.equal(elements.get('state').textContent, 'اكتملت المهمة');
  elements.get('stop').onclick(); const before = elements.get('agent').transform; tick();
  assert.equal(elements.get('state').textContent, 'الإيقاف الطارئ مثبت'); assert.equal(elements.get('agent').transform, before);
  elements.get('reset').onclick(); elements.get('obstacle').checked = true; elements.get('start').onclick(); tick();
  assert.equal(elements.get('state').textContent, 'توقفت المحاكاة بسبب عائق أو خلل');
});
