#!/usr/bin/env node
'use strict';

/**
 * 🔐 نظام المراقبة المستمرة - الحارس الدائم
 * 
 * Continuous Protection Watch - Guardian System
 * 
 * الوظيفة:
 * - مراقبة الملفات الحساسة باستمرار
 * - اكتشاف أي فساد JSON فوري
 * - تشغيل Restore تلقائي عند الاكتشاف
 * - إرسال تنبيهات
 * 
 * استخدام:
 *   node scripts/protection-watch.js
 *   ← يعمل في الخلفية indefinitely
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const WORKSPACE = process.cwd();
const WATCH_INTERVAL = 10 * 1000; // كل 10 ثواني

const SENTINEL_FILES = [
  'data/ai-learning.json',
  'data/alml-fabric.json',
  'data/pilot-state.json',
  'data/analytics/page-views.json',
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// ════════════════════════════════════════════════════════════════════
// التحقق من الفساد (Corruption Detection)
// ════════════════════════════════════════════════════════════════════

class ProtectionWatcher {
  constructor() {
    this.lastState = new Map();
    this.alarmTriggered = false;
  }

  /**
   * فحص ملف واحد للفساد
   */
  checkFileIntegrity(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { ok: true, reason: 'not-exist' };
      }

      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        return { ok: false, reason: 'empty-file', message: 'الملف فارغ تماما' };
      }

      const content = fs.readFileSync(filePath, 'utf8');

      // فحص JSON
      if (filePath.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (e) {
          return { ok: false, reason: 'invalid-json', message: 'JSON غير صالح: ' + e.message };
        }
      }

      // فحص علامات الفساد الواضحة
      if (content.includes('undefined') || content.includes('NaN') || content.includes('[object Object]')) {
        return { ok: false, reason: 'corruption-markers', message: 'علامات فساد مكتشفة' };
      }

      return { ok: true, size: stat.size };
    } catch (e) {
      return { ok: false, reason: 'read-error', message: 'خطأ قراءة: ' + e.message };
    }
  }

  /**
   * فحص جميع الملفات الحساسة
   */
  checkAllFiles() {
    const results = {};
    for (const file of SENTINEL_FILES) {
      const fullPath = path.join(WORKSPACE, file);
      results[file] = this.checkFileIntegrity(fullPath);
    }
    return results;
  }

  /**
   * اكتشاف التغيير من الحالة السابقة
   */
  detectChangeFromLastState(current) {
    const changes = [];

    for (const [file, status] of Object.entries(current)) {
      const lastStatus = this.lastState.get(file);

      if (!lastStatus) {
        // أول مرة نفحص هذا الملف
        if (!status.ok) {
          changes.push({ file, type: 'new-corruption', status });
        }
      } else if (lastStatus.ok && !status.ok) {
        // تغيير من حالة سليمة إلى فاسدة
        changes.push({ file, type: 'newly-corrupted', status, wasOk: true });
      } else if (!lastStatus.ok && status.ok) {
        // تعافي من فساد (قد يكون restore)
        changes.push({ file, type: 'recovered', status });
      }
    }

    // تحديث الحالة الأخيرة
    for (const [file, status] of Object.entries(current)) {
      this.lastState.set(file, status);
    }

    return changes;
  }

  /**
   * تشغيل النظام
   */
  start() {
    const timestamp = new Date().toISOString();
    console.log(`\n${colors.cyan}${colors.bright}[${timestamp}] 🔐 بدء نظام المراقبة المستمرة${colors.reset}`);
    console.log(`${colors.cyan}Watch interval: ${WATCH_INTERVAL / 1000} seconds${colors.reset}\n`);

    // الفحص الأول
    this.performCheck();

    // الفحص الدوري
    setInterval(() => this.performCheck(), WATCH_INTERVAL);

    // معالج الخروج الآمن
    process.on('SIGTERM', () => {
      console.log(`\n${colors.yellow}[${new Date().toISOString()}] ⚠ استقبال إشارة SIGTERM - إيقاف مراقبة آمن${colors.reset}\n`);
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log(`\n${colors.yellow}[${new Date().toISOString()}] ⚠ استقبال إشارة SIGINT - إيقاف مراقبة${colors.reset}\n`);
      process.exit(0);
    });
  }

  /**
   * تنفيذ فحص واحد
   */
  performCheck() {
    const ts = new Date().toISOString().split('T')[1].slice(0, 8);
    const results = this.checkAllFiles();
    const changes = this.detectChangeFromLastState(results);

    // إذا لم تكن هناك تغييرات، اطبع حالة سريعة فقط
    if (changes.length === 0) {
      const allOk = Object.values(results).every((r) => r.ok);
      const status = allOk ? `${colors.green}✓${colors.reset}` : `${colors.red}✕${colors.reset}`;
      console.log(`[${ts}] ${status} جميع الملفات سليمة (${SENTINEL_FILES.length})`);
      return;
    }

    // إذا كانت هناك تغييرات، اطبع التفاصيل
    for (const change of changes) {
      let emoji, msg;

      switch (change.type) {
        case 'newly-corrupted':
          emoji = `${colors.red}⚠${colors.reset}`;
          msg = `تحذير حرج: ${change.file} أصبح فاسدًا! (${change.status.reason})`;
          this.triggerEmergencyRestore();
          break;
        case 'new-corruption':
          emoji = `${colors.red}⚠${colors.reset}`;
          msg = `فساد في: ${change.file} (${change.status.reason})`;
          if (!this.alarmTriggered) {
            this.triggerEmergencyRestore();
          }
          break;
        case 'recovered':
          emoji = `${colors.green}✓${colors.reset}`;
          msg = `تعافي: ${change.file} - عاد للحالة السليمة`;
          break;
        default:
          emoji = `${colors.yellow}◇${colors.reset}`;
          msg = `تغيير: ${change.file}`;
      }

      console.log(`[${ts}] ${emoji} ${msg}`);
    }
  }

  /**
   * تشغيل Restore في حالة الطوارئ
   */
  triggerEmergencyRestore() {
    if (this.alarmTriggered) return; // تجنب التشغيل المتكرر

    this.alarmTriggered = true;
    const ts = new Date().toISOString();

    console.log(`\n${colors.red}${colors.bright}`);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  🚨 تنبيه الطوارئ - تم اكتشاف فساد حرج!                  ║');
    console.log('║     Launching Emergency Restore...                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);

    const logFile = path.join(WORKSPACE, '.protection-emergency.log');
    const logEntry = `[${ts}] Emergency restore triggered - corruption detected\n`;

    try {
      fs.appendFileSync(logFile, logEntry, 'utf8');
      console.log(`${colors.yellow}تم تسجيل الحادثة في: ${logFile}${colors.reset}\n`);

      // تشغيل restore-protection-mode بشكل async
      const { spawn } = require('node:child_process');
      const restore = spawn('node', ['scripts/restore-protection-mode.js'], {
        cwd: WORKSPACE,
        stdio: 'inherit',
      });

      restore.on('exit', (code) => {
        if (code === 0) {
          console.log(`${colors.green}[${new Date().toISOString()}] ✓ Restore اكتمل بنجاح${colors.reset}\n`);
          this.alarmTriggered = false; // إعادة تفعيل التنبيهات
        } else {
          console.log(`${colors.red}[${new Date().toISOString()}] ✕ Restore فشل مع الكود ${code}${colors.reset}\n`);
        }
      });
    } catch (e) {
      console.log(`${colors.red}خطأ في تشغيل Restore: ${e.message}${colors.reset}\n`);
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// تشغيل النظام
// ════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const watcher = new ProtectionWatcher();
  watcher.start();
}

module.exports = { ProtectionWatcher };
