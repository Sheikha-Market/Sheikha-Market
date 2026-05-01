#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0 Extract Requires - استخراج جميع المحركات المُحمّلة

const fs = require('fs');
const path = require('path');

const serverPath = path.join(process.cwd(), 'server.js');
const server = fs.readFileSync(serverPath, 'utf8');

const re = /require\(\s*['"]\.\/lib\/([^'"]+)['"]\s*\)/g;
const engines = new Set();
let m;
while ((m = re.exec(server)) !== null) engines.add(m[1]);

const list = [...engines].sort();
fs.writeFileSync('tmp/loaded_engines.txt', list.join('\n') + '\n', 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 إحصائيات المحركات المُحمّلة عند Startup');
console.log('═══════════════════════════════════════════════════════════════');
console.log('إجمالي المحركات:', list.length);
console.log('الهدف (L0):', 21);
console.log('الزائد:', list.length - 21);
console.log('');
console.log('✅ تم حفظ القائمة في: tmp/loaded_engines.txt');
console.log('═══════════════════════════════════════════════════════════════');
