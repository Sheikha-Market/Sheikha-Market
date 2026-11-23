#!/usr/bin/env node
/**
 * إيقاف العملية التي تستخدم المنفذ (8080 افتراضياً)
 * استخدم: node scripts/kill-port.js [port]
 */
'use strict';
const port = parseInt(process.argv[2] || process.env.PORT || '8080', 10);
const { execSync } = require('child_process');
try {
    const out = execSync(`lsof -ti:${port} 2>/dev/null`, { encoding: 'utf8' }).trim();
    const pids = out ? out.split(/\s+/).filter(Boolean) : [];
    if (pids.length) {
        execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'inherit' });
        console.log(`✅ تم إيقاف ${pids.length} عملية على المنفذ ${port}`);
    } else {
        console.log(`ℹ️ لا توجد عملية على المنفذ ${port}`);
    }
} catch (e) {
    if (e.status === 1) console.log(`ℹ️ لا توجد عملية على المنفذ ${port}`);
    else console.error('خطأ:', e.message);
}
