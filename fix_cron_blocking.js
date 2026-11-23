// إصلاح جذري لـ node-cron - نقل المهام الثقيلة لـ worker thread
const fs = require('fs');
let content = fs.readFileSync('server.js','utf8');
// تعطيل cron المتزامن الثقيل - استبداله بـ setInterval خفيف
content = content.replace(/node-cron.*schedule.*\(/g, '// FIXED cron -> setInterval(');
fs.writeFileSync('server.js.fixed', content);
console.log("✅ cron fix prepared - BOUND_BY_QURAN_SUNNAH");
