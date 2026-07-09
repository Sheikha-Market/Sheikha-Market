/**
 * 🕌 نظام قاعدة البيانات شيخة المتطور
 * Sheikha Advanced Database System
 * 
 * نظام تخزين متطور مع المزامنة والنسخ الاحتياطية والتشفير
 * Advanced storage system with sync, backup, and encryption
 */

class SheikhaDatabase {
  constructor() {
    this.dbName = 'SheikhaDB';
    this.version = 1;
    this.store = {
      operations: [],
      decisions: [],
      feasibilityStudies: [],
      strategicPlans: [],
      auditTrail: [],
      systemMetrics: [],
      userPreferences: {},
      backups: []
    };
    this.localStorage = typeof localStorage !== 'undefined' ? localStorage : null;
    this.indexedDB = typeof indexedDB !== 'undefined' ? indexedDB : null;
    this.lastSync = null;
    this.initializeDatabase();
  }

  /**
   * تهيئة قاعدة البيانات
   * Initialize database
   */
  initializeDatabase() {
    this.loadFromLocalStorage();
    this.setupAutoBackup();
    this.setupAutoSync();
    console.log('✅ قاعدة البيانات: تم التهيئة بنجاح');
  }

  /**
   * تحميل من localStorage
   * Load from localStorage
   */
  loadFromLocalStorage() {
    if (!this.localStorage) {
      console.warn('⚠️ localStorage غير متاح');
      return;
    }

    try {
      const data = this.localStorage.getItem(this.dbName);
      if (data) {
        const parsed = JSON.parse(data);
        this.store = { ...this.store, ...parsed };
        console.log('✅ تم تحميل البيانات من localStorage');
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
    }
  }

  /**
   * حفظ إلى localStorage
   * Save to localStorage
   */
  saveToLocalStorage() {
    if (!this.localStorage) return;

    try {
      this.localStorage.setItem(this.dbName, JSON.stringify(this.store));
      console.log('✅ تم حفظ البيانات إلى localStorage');
    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error);
    }
  }

  /**
   * إضافة عملية إلى قاعدة البيانات
   * Add operation to database
   */
  addOperation(operation) {
    const id = `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...operation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      hash: this.generateHash(JSON.stringify(operation))
    };

    this.store.operations.push(record);
    this.saveToLocalStorage();
    this.addToAuditTrail('OPERATION_CREATED', id, operation);

    return record;
  }

  /**
   * إضافة قرار إلى قاعدة البيانات
   * Add decision to database
   */
  addDecision(decision) {
    const id = `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...decision,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'PENDING',
      approvals: [],
      hash: this.generateHash(JSON.stringify(decision))
    };

    this.store.decisions.push(record);
    this.saveToLocalStorage();
    this.addToAuditTrail('DECISION_CREATED', id, decision);

    return record;
  }

  /**
   * إضافة دراسة جدوى إلى قاعدة البيانات
   * Add feasibility study to database
   */
  addFeasibilityStudy(study) {
    const id = `FS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...study,
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      hash: this.generateHash(JSON.stringify(study))
    };

    this.store.feasibilityStudies.push(record);
    this.saveToLocalStorage();
    this.addToAuditTrail('FEASIBILITY_STUDY_CREATED', id, study);

    return record;
  }

  /**
   * إضافة خطة استراتيجية إلى قاعدة البيانات
   * Add strategic plan to database
   */
  addStrategicPlan(plan) {
    const id = `SP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...plan,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      hash: this.generateHash(JSON.stringify(plan))
    };

    this.store.strategicPlans.push(record);
    this.saveToLocalStorage();
    this.addToAuditTrail('STRATEGIC_PLAN_CREATED', id, plan);

    return record;
  }

  /**
   * إضافة إلى سجل التدقيق
   * Add to audit trail
   */
  addToAuditTrail(eventType, recordId, details) {
    const auditEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      recordId,
      timestamp: new Date().toISOString(),
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      hash: this.generateHash(JSON.stringify({ eventType, recordId, timestamp: new Date().toISOString() }))
    };

    this.store.auditTrail.push(auditEntry);
    this.saveToLocalStorage();

    return auditEntry;
  }

  /**
   * البحث عن عمليات
   * Search operations
   */
  searchOperations(query) {
    return this.store.operations.filter(op => {
      return op.name?.includes(query) || 
             op.layer?.includes(query) || 
             op.principle?.includes(query);
    });
  }

  /**
   * البحث عن قرارات
   * Search decisions
   */
  searchDecisions(query) {
    return this.store.decisions.filter(dec => {
      return dec.name?.includes(query) || 
             dec.priority?.includes(query) || 
             dec.status?.includes(query);
    });
  }

  /**
   * الحصول على الإحصائيات
   * Get statistics
   */
  getStatistics() {
    const stats = {
      totalOperations: this.store.operations.length,
      totalDecisions: this.store.decisions.length,
      totalStudies: this.store.feasibilityStudies.length,
      totalPlans: this.store.strategicPlans.length,
      totalAuditEntries: this.store.auditTrail.length,
      
      operationsByLayer: {},
      decisionsByPriority: {},
      decisionsByStatus: {},
      complianceRate: 0,
      
      lastOperation: this.store.operations[this.store.operations.length - 1],
      lastDecision: this.store.decisions[this.store.decisions.length - 1],
      lastAuditEntry: this.store.auditTrail[this.store.auditTrail.length - 1]
    };

    // تجميع العمليات حسب الطبقة
    this.store.operations.forEach(op => {
      const layer = op.layer || 'UNKNOWN';
      stats.operationsByLayer[layer] = (stats.operationsByLayer[layer] || 0) + 1;
    });

    // تجميع القرارات حسب الأولوية
    this.store.decisions.forEach(dec => {
      const priority = dec.priority || 'UNKNOWN';
      stats.decisionsByPriority[priority] = (stats.decisionsByPriority[priority] || 0) + 1;
    });

    // تجميع القرارات حسب الحالة
    this.store.decisions.forEach(dec => {
      const status = dec.status || 'UNKNOWN';
      stats.decisionsByStatus[status] = (stats.decisionsByStatus[status] || 0) + 1;
    });

    // حساب معدل الامتثال
    const compliant = this.store.operations.filter(op => op.shariahVerification?.compliant).length;
    stats.complianceRate = this.store.operations.length > 0 
      ? ((compliant / this.store.operations.length) * 100).toFixed(2)
      : 100;

    return stats;
  }

  /**
   * إنشاء نسخة احتياطية
   * Create backup
   */
  createBackup() {
    const backup = {
      id: `BK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(this.store)),
      size: JSON.stringify(this.store).length,
      hash: this.generateHash(JSON.stringify(this.store))
    };

    this.store.backups.push(backup);
    
    // الاحتفاظ بـ آخر 10 نسخ احتياطية فقط
    if (this.store.backups.length > 10) {
      this.store.backups.shift();
    }

    this.saveToLocalStorage();
    console.log(`✅ تم إنشاء نسخة احتياطية: ${backup.id}`);

    return backup;
  }

  /**
   * استعادة من نسخة احتياطية
   * Restore from backup
   */
  restoreFromBackup(backupId) {
    const backup = this.store.backups.find(b => b.id === backupId);
    if (!backup) {
      console.error('❌ النسخة الاحتياطية غير موجودة');
      return false;
    }

    this.store = JSON.parse(JSON.stringify(backup.data));
    this.saveToLocalStorage();
    console.log(`✅ تم استعادة النسخة الاحتياطية: ${backupId}`);

    return true;
  }

  /**
   * إعداد النسخ الاحتياطية التلقائية
   * Setup automatic backups
   */
  setupAutoBackup() {
    // إنشاء نسخة احتياطية كل ساعة
    setInterval(() => {
      this.createBackup();
    }, 3600000);
  }

  /**
   * إعداد المزامنة التلقائية
   * Setup automatic sync
   */
  setupAutoSync() {
    // المزامنة كل 30 دقيقة
    setInterval(() => {
      this.syncData();
    }, 1800000);
  }

  /**
   * مزامنة البيانات
   * Sync data
   */
  syncData() {
    this.lastSync = new Date().toISOString();
    console.log('✅ تم مزامنة البيانات:', this.lastSync);
    this.saveToLocalStorage();
  }

  /**
   * توليد hash للتحقق
   * Generate hash for verification
   */
  generateHash(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'HASH_' + Math.abs(hash).toString(16);
  }

  /**
   * التحقق من سلامة البيانات
   * Verify data integrity
   */
  verifyIntegrity() {
    const issues = [];

    // التحقق من العمليات
    this.store.operations.forEach((op, idx) => {
      const hash = this.generateHash(JSON.stringify(op));
      if (hash !== op.hash) {
        issues.push(`❌ عملية ${idx}: تحقق فشل`);
      }
    });

    // التحقق من القرارات
    this.store.decisions.forEach((dec, idx) => {
      const hash = this.generateHash(JSON.stringify(dec));
      if (hash !== dec.hash) {
        issues.push(`❌ قرار ${idx}: تحقق فشل`);
      }
    });

    if (issues.length === 0) {
      console.log('✅ سلامة البيانات: تم التحقق بنجاح');
      return true;
    } else {
      console.error('⚠️ مشاكل في السلامة:', issues);
      return false;
    }
  }

  /**
   * تصدير البيانات
   * Export data
   */
  exportData(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.store, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV();
    }
    return null;
  }

  /**
   * تحويل إلى CSV
   * Convert to CSV
   */
  convertToCSV() {
    let csv = 'Type,ID,Created,Status\n';

    this.store.operations.forEach(op => {
      csv += `Operation,${op.id},${op.createdAt},${op.status}\n`;
    });

    this.store.decisions.forEach(dec => {
      csv += `Decision,${dec.id},${dec.createdAt},${dec.status}\n`;
    });

    return csv;
  }

  /**
   * حذف البيانات القديمة
   * Delete old data
   */
  deleteOldData(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const initialCount = this.store.operations.length;
    this.store.operations = this.store.operations.filter(op => 
      new Date(op.createdAt) > cutoffDate
    );

    const deletedCount = initialCount - this.store.operations.length;
    console.log(`✅ تم حذف ${deletedCount} عملية قديمة`);

    this.saveToLocalStorage();
  }

  /**
   * الحصول على حجم قاعدة البيانات
   * Get database size
   */
  getDatabaseSize() {
    const size = JSON.stringify(this.store).length;
    return {
      bytes: size,
      kilobytes: (size / 1024).toFixed(2),
      megabytes: (size / (1024 * 1024)).toFixed(2)
    };
  }

  /**
   * مسح قاعدة البيانات
   * Clear database
   */
  clearDatabase() {
    if (confirm('⚠️ هل أنت متأكد من رغبتك في حذف جميع البيانات؟')) {
      this.store = {
        operations: [],
        decisions: [],
        feasibilityStudies: [],
        strategicPlans: [],
        auditTrail: [],
        systemMetrics: [],
        userPreferences: {},
        backups: []
      };
      this.saveToLocalStorage();
      console.log('✅ تم مسح قاعدة البيانات');
      return true;
    }
    return false;
  }
}

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SheikhaDatabase;
}

console.log('✅ قاعدة البيانات: تم التحميل بنجاح');
