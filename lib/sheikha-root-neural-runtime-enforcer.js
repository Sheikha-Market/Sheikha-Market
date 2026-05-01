/**
 * شبكة خلايا عصبية جذرية لحماية Git من بيانات Runtime
 * Sheikha Root Neural Runtime Enforcer
 * 
 * الأهداف:
 * ✅ فحص أن ملفات .port و *.ndjson غير متتبعة
 * ✅ رصد أي محاولة لإدخالها إلى Git
 * ✅ تنظيف staging area تلقائيًا
 * ✅ تسجيل كل عملية
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SheikhaRootNeuralRuntimeEnforcer {
  constructor() {
    this.name = 'Sheikha Root Neural Runtime Enforcer';
    this.version = '1.0.0';
    this.cwd = process.cwd();
    
    this.prohibitedPatterns = [
      /\.port$/,
      /\.ndjson$/,
      /^data\/decision-log\.json$/,
      /^data\/ports\//,
      /^data\/operations\/.*\.ndjson$/
    ];

    this.ignoreValidationSamples = [
      'data/ports/main.port',
      'data/operations/sample.ndjson',
      'data/reports/sample.ndjson',
      'data/decision-log.json'
    ];
    
    this.auditLog = {
      timestamp: new Date().toISOString(),
      checks: [],
      violations: [],
      fixed: []
    };
  }

  /**
   * فحص أن ملف معين غير متتبع في git
   */
  isFileTrackedByGit(filePath) {
    try {
      execSync(`git ls-files --error-unmatch "${filePath}"`, { 
        stdio: 'pipe',
        cwd: this.cwd 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * فحص أن نمط معين يُتَجاهل بواسطة .gitignore
   */
  isPatternIgnored(filePath) {
    try {
      execSync(`git check-ignore "${filePath}"`, { 
        stdio: 'pipe',
        cwd: this.cwd 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * فحص شامل لحالة Runtime Data
   */
  audit() {
    const result = {
      success: true,
      violations: [],
      fixes: []
    };

    // فحص .gitignore
    this.ignoreValidationSamples.forEach(sampleFile => {
      if (!this.isPatternIgnored(sampleFile)) {
        result.violations.push({
          type: 'MISSING_PATTERN',
          sampleFile,
          message: `Sample file not ignored by .gitignore: ${sampleFile}`
        });
      }
    });

    // فحص staging area
    try {
      const stagedOutput = execSync('git diff --cached --name-only', { 
        encoding: 'utf8',
        cwd: this.cwd 
      });
      
      stagedOutput.split('\n').forEach(file => {
        if (!file) return;
        if (this.prohibitedPatterns.some(p => p.test(file))) {
          result.violations.push({
            type: 'STAGED_RUNTIME_FILE',
            file,
            message: `Runtime file staged for commit: ${file}`
          });
          
          // إزالة تلقائية
          try {
            execSync(`git reset --quiet HEAD -- "${file}"`, { stdio: 'pipe', cwd: this.cwd });
            result.fixes.push({ file, action: 'removed_from_staging' });
          } catch (e) {
            result.violations.push({
              type: 'CLEANUP_FAILED',
              file,
              error: e.message
            });
          }
        }
      });
    } catch (e) {
      // git diff not available in certain contexts
    }

    this.auditLog.checks.push(result);
    this.auditLog.violations = result.violations;
    this.auditLog.fixed = result.fixes;

    return {
      success: result.violations.length === 0,
      enforcement: this.name,
      version: this.version,
      violations: result.violations,
      fixed: result.fixes,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * رسالة صوتية (logging)
   */
  report() {
    return {
      name: this.name,
      version: this.version,
      status: this.auditLog.violations.length === 0 ? 'CLEAN' : 'VIOLATIONS',
      violations_count: this.auditLog.violations.length,
      fixed_count: this.auditLog.fixed.length,
      audit_log: this.auditLog
    };
  }
}

module.exports = new SheikhaRootNeuralRuntimeEnforcer();
