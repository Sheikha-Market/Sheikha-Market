#!/usr/bin/env node
'use strict';

/**
 * 🔐 وضع الحماية التلقائي - الردم العالمي ضد الفساد
 * 
 * Automatic Protection Mode - Global Wall against Corruption
 * 
 * آلية العمل:
 * 1. إيقاف مهمة [Sheikha: Start Dev (No Cursor)] تلقائيًا
 * 2. تطبيق Restore من آخر checkpoint
 * 3. التحقق mismatch مرة واحدة
 * 4. إعادة تشغيل الخدمة فقط عند النجاح
 * 
 * التسلسل الهرمي للحماية (Layers):
 * L0: من-الضرر | No-Harm Principle
 * L1: من-الفساد | Anti-Corruption
 * L2: من-الاختراق | Anti-Intrusion (Yajuj wa Majuj)
 * L3: من-التلف | Anti-Degradation
 */

const fs = require('node:fs');
const path = require('node:path');
const { exec, execSync } = require('node:child_process');

// ════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════

const WORKSPACE = process.cwd();
const CHECKPOINTS_DIR = path.join(WORKSPACE, '.checkpoints');
const PORT = 8080;

// الملفات الحساسة التي تشير إلى التلف
const SENTINEL_FILES = [
  'data/ai-learning.json',
  'data/alml-fabric.json',
  'data/pilot-state.json',
  'data/analytics/page-views.json',
];

const CONFIG = {
  // وضع الحماية الصارم
  STRICT_MODE: true,
  // توقف المهمة قبل restore
  AUTO_STOP_TASK: true,
  // إعادة تشغيل فقط عند النجاح
  RESTART_ON_SUCCESS_ONLY: true,
  // فترة انتظار بعد الإيقاف (ميلي)
  STOP_WAIT_MS: 2000,
  // التحقق mismatch مرة واحدة فقط
  MAX_VERIFY_ATTEMPTS: 1,
};

// ════════════════════════════════════════════════════════════════════
// LOGGING & REPORTING
// ════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(level, msg, data = '') {
  const ts = new Date().toISOString().split('T')[1].slice(0, 8);
  const badges = {
    info: `${colors.cyan}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✕${colors.reset}`,
    lock: `${colors.bright}🔐${colors.reset}`,
  };
  const badge = badges[level] || badges.info;
  console.log(`[${ts}] ${badge} ${msg} ${data ? colors.dim + data + colors.reset : ''}`);
}

function print(text) {
  console.log(text);
}

// ════════════════════════════════════════════════════════════════════
// PROTECTION LAYER: مكافحة الفساد
// ════════════════════════════════════════════════════════════════════

class CorruptionDetector {
  constructor() {
    this.baseline = this.readBaseline();
  }

  readBaseline() {
    const baselineFile = path.join(WORKSPACE, '.protection-baseline.json');
    if (fs.existsSync(baselineFile)) {
      try {
        return JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
      } catch (e) {
        log('warn', 'Failed to read baseline', e.message);
        return {};
      }
    }
    return {};
  }

  /**
   * فحص ملفات الحساسة للتلف
   * Check sentinel files for corruption markers
   */
  checkSentinels() {
    const corrupted = [];
    for (const file of SENTINEL_FILES) {
      const filePath = path.join(WORKSPACE, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          // فحص للأخطاء الفاسدة
          if (content.includes('undefined') || content.includes('NaN') || content === '') {
            corrupted.push(file);
          }
        } catch (e) {
          // إذا حدث خطأ أثناء القراءة ندرجه في الملفات الفاسدة
          corrupted.push(file);
        }
      }
    }
    return corrupted;
  }

  /**
   * حساب بصمة التحقق (Checksum)
   * Calculate verification fingerprint
   */
  calculateFingerprint(dir) {
    try {
      const cmd = `find "${dir}" -type f -name "*.json" | xargs md5sum | md5sum | awk '{print $1}'`;
      return execSync(cmd, { encoding: 'utf8' }).trim();
    } catch (e) {
      // التعطل في الحساب = لا نعرف البصمة، أرجع null كإشارة فشل
      return null;
    }
  }

  /**
   * اكتشاف التعديلات المريبة
   * Detect suspicious modifications
   */
  detectSuspiciousChanges() {
    const suspicious = [];
    const dataDir = path.join(WORKSPACE, 'data');
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    if (fs.existsSync(dataDir)) {
      const walk = (dir) => {
        try {
          fs.readdirSync(dir).forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              walk(filePath);
            } else if (stat.mtimeMs > oneMinuteAgo) {
              suspicious.push(filePath);
            }
          });
        } catch (e) {
          // تجاهل الأخطاء في المسح العميق (مثل الملفات غير متاحة)
        }
      };
      walk(dataDir);
    }

    return suspicious;
  }
}

// ════════════════════════════════════════════════════════════════════
// TASK MANAGEMENT: إيقاف/إعادة الخدمة تلقائيًا
// ════════════════════════════════════════════════════════════════════

class TaskManager {
  /**
   * إيقاف مهمة [Sheikha: Start Dev (No Cursor)]
   * Stop development task gracefully
   */
  static async stopDevTask() {
    log('lock', 'إيقاف مهمة الخادم التنموي...', '(Stopping dev task)');
    
    try {
      // البحث عن العملية التي تشغل 8080
      const cmd = `lsof -ti :${PORT} | xargs -r kill -9 2>/dev/null || true`;
      await this.execAsync(cmd);
      log('success', 'تم إيقاف جميع العمليات على البورت', PORT);
    } catch (e) {
      log('warn', 'تحذير أثناء الإيقاف', e.message);
    }

    // انتظار آمن
    await new Promise((resolve) => setTimeout(resolve, CONFIG.STOP_WAIT_MS));
    
    // تحقق من أن البورت فارغ
    const isPortFree = await this.isPortFree(PORT);
    if (isPortFree) {
      log('success', `البورت ${PORT} الآن فارغ وآمن`);
    } else {
      throw new Error(`البورت ${PORT} لا يزال مشغولًا!`);
    }
  }

  /**
   * التحقق من توفر البورت
   */
  static async isPortFree(port) {
    return new Promise((resolve) => {
      exec(`lsof -ti :${port}`, (err) => {
        resolve(!!err); // إذا فشل الأمر = البورت فارغ
      });
    });
  }

  /**
   * إعادة تشغيل الخدمة
   */
  static async restartService() {
    log('lock', 'إعادة تشغيل الخدمة...', '(Restarting service)');
    const cmd = `bash -lc 'cd "${WORKSPACE}"; source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true; if command -v nvm >/dev/null 2>&1; then nvm exec 25.6.1 npm start || npm start; else npm start; fi'`;
    
    try {
      exec(cmd, { cwd: WORKSPACE }, (err, out, stderr) => {
        if (err) {
          log('warn', 'تحذير عند إعادة التشغيل', err.message);
        } else {
          log('success', 'تم إعادة تشغيل الخادم');
        }
      });
    } catch (e) {
      log('error', 'خطأ أثناء إعادة التشغيل', e.message);
    }

    // إعطاء الخادم وقت للبدء
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  /**
   * تنفيذ أمر async
   */
  static execAsync(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (err, out, stderr) => {
        if (err) reject(err);
        else resolve(out);
      });
    });
  }
}

// ════════════════════════════════════════════════════════════════════
// CHECKPOINT RESTORE: الاستعادة الآمنة
// ════════════════════════════════════════════════════════════════════

class CheckpointManager {
  static normalizeCheckpointPath(filePath) {
    const workspaceName = path.basename(WORKSPACE);
    return String(filePath || '')
      .replaceAll('"', '')
      .replace(/^\.\//, '')
      .replace(new RegExp(`^${workspaceName}/`), '')
      .replace(/^sheikha-main-portal\//, '')
      .trim();
  }

  static loadChangedFiles(checkpointName) {
    const checkpointPath = path.join(CHECKPOINTS_DIR, checkpointName);
    const changedFilesPath = path.join(checkpointPath, 'changed-files.txt');

    if (!fs.existsSync(changedFilesPath)) {
      throw new Error('لا يوجد ملف قائمة التغييرات');
    }

    return fs
      .readFileSync(changedFilesPath, 'utf8')
      .split('\n')
      .map((f) => this.normalizeCheckpointPath(f))
      .filter((f) => f && !f.startsWith('#') && !f.startsWith('.checkpoints/'));
  }

  static async loadArchiveFiles(checkpointName) {
    const checkpointPath = path.join(CHECKPOINTS_DIR, checkpointName);
    const tarPath = path.join(checkpointPath, 'changed-files.tar.gz');

    if (!fs.existsSync(tarPath)) {
      throw new Error('ملف الأرشيف غير موجود');
    }

    const listRaw = await TaskManager.execAsync(`tar -tzf "${tarPath}"`);
    return listRaw
      .split('\n')
      .map((f) => this.normalizeCheckpointPath(f))
      .filter(Boolean)
      .filter((f) => !f.endsWith('/'))
      .filter((f) => !f.startsWith('.checkpoints/'))
      .filter((f) => !f.startsWith('backups/'));
  }

  /**
   * البحث عن آخر checkpoint
   * Find the latest checkpoint
   */
  static findLatestCheckpoint() {
    if (!fs.existsSync(CHECKPOINTS_DIR)) {
      throw new Error('لا يوجد مجلد checkpoints');
    }

    const checkpoints = fs
      .readdirSync(CHECKPOINTS_DIR)
      .filter((d) => /^\d{8}-\d+$/.test(d))
      .sort()
      .reverse();

    if (checkpoints.length === 0) {
      throw new Error('لا يوجد checkpoint متاح');
    }

    return checkpoints[0];
  }

  /**
   * استعادة checkpoint
   * Restore checkpoint files
   */
  static async restoreCheckpoint(checkpointName) {
    log('lock', `استعادة checkpoint: ${checkpointName}`);

    const checkpointPath = path.join(CHECKPOINTS_DIR, checkpointName);
    const tarPath = path.join(checkpointPath, 'changed-files.tar.gz');

    if (!fs.existsSync(tarPath)) {
      throw new Error(`لا يوجد ملف tar في ${checkpointName}`);
    }

    try {
      // نستبعد ملفات checkpoints/backups من عملية الاستعادة حتى لا نعيد كتابة بيئة الحماية نفسها.
      const cmd = `cd "${WORKSPACE}" && tar -xzf "${tarPath}" --exclude='.checkpoints/*' --exclude='backups/*'`;
      await TaskManager.execAsync(cmd);
      log('success', `تم استعادة checkpoint: ${checkpointName}`);
      return true;
    } catch (e) {
      log('error', 'خطأ أثناء الاستعادة', e.message);
      throw e;
    }
  }

  /**
   * التحقق من نجاح الاستعادة (mismatch check)
   * Verify restoration integrity
   */
  static async verifyCheckpoint(checkpointName, changedFiles) {
    log('lock', `التحقق من أتمامية الاستعادة...`, '(Verifying integrity)');

    const checkpointPath = path.join(CHECKPOINTS_DIR, checkpointName);
    const tarPath = path.join(checkpointPath, 'changed-files.tar.gz');
    const verifyDir = path.join(CHECKPOINTS_DIR, checkpointName, '.verify-extracted');

    const archiveFiles = await this.loadArchiveFiles(checkpointName);
    const verificationFiles = archiveFiles.length > 0 ? archiveFiles : changedFiles;

    if (!Array.isArray(verificationFiles) || verificationFiles.length === 0) {
      throw new Error('قائمة ملفات التحقق فارغة أو غير صالحة');
    }

    if (!fs.existsSync(tarPath)) {
      throw new Error('ملف الأرشيف غير موجود للتحقق');
    }

    if (fs.existsSync(verifyDir)) {
      fs.rmSync(verifyDir, { recursive: true, force: true });
    }
    fs.mkdirSync(verifyDir, { recursive: true });
    await TaskManager.execAsync(`tar -xzf "${tarPath}" -C "${verifyDir}"`);

    let mismatchCount = 0;

    for (const file of verificationFiles) {
      const normalized = this.normalizeCheckpointPath(file);
      const absPath = path.join(WORKSPACE, normalized);
      const expectedCandidates = [
        path.join(verifyDir, normalized),
        path.join(verifyDir, path.basename(WORKSPACE), normalized),
        path.join(verifyDir, 'sheikha-main-portal', normalized),
      ];
      const expectedPath = expectedCandidates.find((p) => fs.existsSync(p));

      if (!fs.existsSync(absPath)) {
        mismatchCount++;
        log('warn', `ملف مفقود: ${normalized}`);
      } else if (expectedPath === null || expectedPath === undefined) {
        mismatchCount++;
        log('warn', `مرجع مفقود في الأرشيف: ${normalized}`);
      } else {
        try {
          const doesMatch = await this.compareFiles(absPath, expectedPath);
          if (!doesMatch) {
            mismatchCount++;
            log('warn', `عدم تطابق في: ${normalized}`);
          }
        } catch (e) {
          // خطأ في مقارنة الملفات = نعتبرها عدم تطابق
          mismatchCount++;
          log('warn', `خطأ في المقارنة: ${normalized}`);
        }
      }
    }

    fs.rmSync(verifyDir, { recursive: true, force: true });

    log('success', `نتيجة التحقق: ${mismatchCount} عدم تطابق`);
    return mismatchCount === 0;
  }

  /**
   * مقارنة ملفين بطريقة آمنة
   */
  static async compareFiles(file1, file2) {
    return new Promise((resolve) => {
      exec(`cmp -s "${file1}" "${file2}"`, (err) => {
        resolve(!err);
      });
    });
  }
}

// ════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATION
// ════════════════════════════════════════════════════════════════════

async function main() {
  print('\n' + colors.bright + colors.blue);
  print('╔════════════════════════════════════════════════════════════╗');
  print('║  🔐 وضع الحماية التلقائي - الردم العالمي                 ║');
  print('║  Automatic Protection Mode - Global Wall                  ║');
  print('╚════════════════════════════════════════════════════════════╝');
  print(colors.reset + '\n');

  try {
    // ────────────────────────────────────────────────────────────────
    // L0: فحص الفساد قبل الاستعادة
    // ────────────────────────────────────────────────────────────────
    log('lock', 'L0: فحص الفساد والتلف', '(Corruption detection)');
    const detector = new CorruptionDetector();
    const corrupted = detector.checkSentinels();
    const suspicious = detector.detectSuspiciousChanges();

    if (corrupted.length > 0) {
      log('warn', `${corrupted.length} ملف من الملفات الحساسة قد يحتوي على فساد:`);
      corrupted.forEach((f) => log('warn', `  • ${f}`));
    }

    if (suspicious.length > 0) {
      log('warn', `${suspicious.length} ملف تم تعديله مؤخرًا (قد يكون فسادًا):`);
      suspicious.slice(0, 5).forEach((f) => log('warn', `  • ${f}`));
      if (suspicious.length > 5) {
        log('warn', `  و${suspicious.length - 5} ملف آخر...`);
      }
    }

    // ────────────────────────────────────────────────────────────────
    // L1: إيقاف المهمة التنموية
    // ────────────────────────────────────────────────────────────────
    log('lock', 'L1: إيقاف الخدمة المشغلة', '(Stopping active services)');
    if (CONFIG.AUTO_STOP_TASK) {
      await TaskManager.stopDevTask();
    } else {
      log('warn', 'تخطي إيقاف المهمة (للاختبار فقط)');
    }

    // ────────────────────────────────────────────────────────────────
    // L2: البحث عن آخر checkpoint واستعادته
    // ────────────────────────────────────────────────────────────────
    log('lock', 'L2: البحث عن checkpoint وتطبيقه', '(Finding & restoring)');
    const checkpointName = CheckpointManager.findLatestCheckpoint();
    const changedFiles = CheckpointManager.loadChangedFiles(checkpointName);
    log('success', `تم العثور على: ${colors.bright}${checkpointName}${colors.reset}`);

    await CheckpointManager.restoreCheckpoint(checkpointName);

    // ────────────────────────────────────────────────────────────────
    // L3: التحقق mismatch مرة واحدة
    // ────────────────────────────────────────────────────────────────
    log('lock', 'L3: التحقق من أتمامية الاستعادة', '(Verification pass)');
    let verified = false;
    try {
      verified = await CheckpointManager.verifyCheckpoint(checkpointName, changedFiles);
      if (!verified) {
        log('warn', 'محاولة واحدة: لم يكتمل التحقق');
      }
    } catch (e) {
      log('error', `خطأ في التحقق: ${e.message}`);
    }

    if (!verified && CONFIG.STRICT_MODE) {
      throw new Error('فشل التحقق من أتمامية الاستعادة - لن يتم إعادة التشغيل');
    }

    log('success', 'التحقق من الأتمامية: ✓ PASSED');

    // ────────────────────────────────────────────────────────────────
    // L4: إعادة التشغيل فقط عند النجاح
    // ────────────────────────────────────────────────────────────────
    if (verified && CONFIG.RESTART_ON_SUCCESS_ONLY) {
      log('lock', 'L4: إعادة تشغيل الخدمة (نجح التحقق)', '(Safe restart)');
      await TaskManager.restartService();
      log('success', 'اكتملت دورة الحماية بنجاح');
    }

    // ────────────────────────────────────────────────────────────────
    // النتيجة النهائية
    // ────────────────────────────────────────────────────────────────
    print('\n' + colors.green + colors.bright);
    print('╔════════════════════════════════════════════════════════════╗');
    print('║  ✓ اكتملت حماية النظام بنجاح                             ║');
    print('║    نجاح الاستعادة: L0✓ L1✓ L2✓ L3✓ L4✓                  ║');
    print('║  Protected Against: Yajuj-Corruption | Auto-Healing ✓    ║');
    print('╚════════════════════════════════════════════════════════════╝');
    print(colors.reset + '\n');

    process.exit(0);
  } catch (err) {
    print('\n' + colors.red + colors.bright);
    print('╔════════════════════════════════════════════════════════════╗');
    print('║  ✕ فشلت دورة الحماية                                    ║');
    print('╚════════════════════════════════════════════════════════════╝');
    print(colors.reset + '\n');
    log('error', 'الخطأ:', err.message);
    print('\n');
    process.exit(1);
  }
}

// ════════════════════════════════════════════════════════════════════
// تشغيل البرنامج
// ════════════════════════════════════════════════════════════════════

if (require.main === module) {
  main().catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { TaskManager, CheckpointManager, CorruptionDetector };
