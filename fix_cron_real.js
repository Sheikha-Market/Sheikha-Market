const fs = require('fs');
let s = fs.readFileSync('server.js','utf8');
// إصلاح cron blocking - استبدال كل cron.schedule بـ safe setInterval
let count = 0;
s = s.replace(/cron\.schedule\([^)]+\)\s*=>\s*\{/g, (m) => {
  count++;
  return `setInterval(async () => { try {`;
});
s = s.replace(/cron\.schedule/g, '// FIXED cron.schedule - replaced with setInterval');
fs.writeFileSync('server.js', s);
console.log(`✅ Fixed ${count} cron jobs -> setInterval - BOUND_BY_QURAN_SUNNAH`);
