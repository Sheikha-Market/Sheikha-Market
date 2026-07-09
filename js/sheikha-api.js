/**
 * 🕌 نظام الواجهات البرمجية شيخة
 * Sheikha API System
 * 
 * واجهات برمجية RESTful متطورة للتكامل مع أنظمة أخرى
 * Advanced RESTful APIs for integration with other systems
 */

class SheikhaAPIServer {
  constructor(database, runtime) {
    this.database = database;
    this.runtime = runtime;
    this.baseURL = '/api/v1';
    this.apiKey = 'sheikha-' + Math.random().toString(36).substr(2, 32);
    this.endpoints = {};
    this.rateLimiters = {};
    this.initializeAPI();
  }

  /**
   * تهيئة نظام الواجهات
   * Initialize API system
   */
  initializeAPI() {
    this.registerEndpoints();
    this.setupRateLimiting();
    console.log('✅ نظام الواجهات البرمجية: تم التهيئة بنجاح');
    console.log(`📝 مفتاح API: ${this.apiKey}`);
  }

  /**
   * تسجيل نقاط النهاية
   * Register endpoints
   */
  registerEndpoints() {
    // عمليات
    this.endpoints['GET /operations'] = (params) => this.getAllOperations(params);
    this.endpoints['GET /operations/:id'] = (id) => this.getOperation(id);
    this.endpoints['POST /operations'] = (data) => this.createOperation(data);
    this.endpoints['PUT /operations/:id'] = (id, data) => this.updateOperation(id, data);
    this.endpoints['DELETE /operations/:id'] = (id) => this.deleteOperation(id);

    // قرارات
    this.endpoints['GET /decisions'] = (params) => this.getAllDecisions(params);
    this.endpoints['GET /decisions/:id'] = (id) => this.getDecision(id);
    this.endpoints['POST /decisions'] = (data) => this.createDecision(data);
    this.endpoints['PUT /decisions/:id'] = (id, data) => this.updateDecision(id, data);

    // دراسات الجدوى
    this.endpoints['GET /feasibility-studies'] = (params) => this.getAllStudies(params);
    this.endpoints['POST /feasibility-studies'] = (data) => this.createStudy(data);

    // خطط استراتيجية
    this.endpoints['GET /strategic-plans'] = (params) => this.getAllPlans(params);
    this.endpoints['POST /strategic-plans'] = (data) => this.createPlan(data);

    // إحصائيات وتقارير
    this.endpoints['GET /statistics'] = () => this.getStatistics();
    this.endpoints['GET /dashboard'] = () => this.getDashboard();
    this.endpoints['GET /compliance-report'] = () => this.getComplianceReport();
    this.endpoints['GET /audit-trail'] = (params) => this.getAuditTrail(params);

    // النسخ الاحتياطية
    this.endpoints['POST /backup'] = () => this.createBackup();
    this.endpoints['GET /backups'] = () => this.listBackups();
    this.endpoints['POST /restore/:backupId'] = (id) => this.restoreBackup(id);

    // الصحة
    this.endpoints['GET /health'] = () => this.getHealth();
  }

  /**
   * الحصول على جميع العمليات
   * Get all operations
   */
  getAllOperations(params = {}) {
    const { page = 1, limit = 20, layer, principle } = params;
    let operations = this.database.store.operations;

    if (layer) {
      operations = operations.filter(op => op.layer === layer);
    }
    if (principle) {
      operations = operations.filter(op => op.principle === principle);
    }

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      status: 'success',
      data: operations.slice(start, end),
      pagination: {
        page,
        limit,
        total: operations.length,
        pages: Math.ceil(operations.length / limit)
      }
    };
  }

  /**
   * الحصول على عملية محددة
   * Get specific operation
   */
  getOperation(id) {
    const operation = this.database.store.operations.find(op => op.id === id);
    
    if (!operation) {
      return {
        status: 'error',
        message: 'العملية غير موجودة',
        code: 404
      };
    }

    return {
      status: 'success',
      data: operation
    };
  }

  /**
   * إنشاء عملية جديدة
   * Create new operation
   */
  createOperation(data) {
    try {
      const operation = this.database.addOperation({
        name: data.name,
        layer: data.layer || 'A3',
        principle: data.principle || 'العدل',
        inputs: data.inputs || {},
        shariahVerification: data.shariahVerification || {}
      });

      this.runtime.executeOperation(data.name, data.inputs || {}, {
        layer: data.layer || 'A3',
        principle: data.principle || 'العدل'
      });

      return {
        status: 'success',
        message: 'تم إنشاء العملية بنجاح',
        data: operation
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: 400
      };
    }
  }

  /**
   * تحديث عملية
   * Update operation
   */
  updateOperation(id, data) {
    const index = this.database.store.operations.findIndex(op => op.id === id);
    
    if (index === -1) {
      return {
        status: 'error',
        message: 'العملية غير موجودة',
        code: 404
      };
    }

    this.database.store.operations[index] = {
      ...this.database.store.operations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.database.saveToLocalStorage();

    return {
      status: 'success',
      message: 'تم تحديث العملية بنجاح',
      data: this.database.store.operations[index]
    };
  }

  /**
   * حذف عملية
   * Delete operation
   */
  deleteOperation(id) {
    const index = this.database.store.operations.findIndex(op => op.id === id);
    
    if (index === -1) {
      return {
        status: 'error',
        message: 'العملية غير موجودة',
        code: 404
      };
    }

    const deleted = this.database.store.operations.splice(index, 1);
    this.database.saveToLocalStorage();
    this.database.addToAuditTrail('OPERATION_DELETED', id, {});

    return {
      status: 'success',
      message: 'تم حذف العملية بنجاح',
      data: deleted[0]
    };
  }

  /**
   * الحصول على جميع القرارات
   * Get all decisions
   */
  getAllDecisions(params = {}) {
    const { page = 1, limit = 20, priority, status } = params;
    let decisions = this.database.store.decisions;

    if (priority) {
      decisions = decisions.filter(dec => dec.priority === priority);
    }
    if (status) {
      decisions = decisions.filter(dec => dec.status === status);
    }

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      status: 'success',
      data: decisions.slice(start, end),
      pagination: {
        page,
        limit,
        total: decisions.length,
        pages: Math.ceil(decisions.length / limit)
      }
    };
  }

  /**
   * الحصول على قرار محدد
   * Get specific decision
   */
  getDecision(id) {
    const decision = this.database.store.decisions.find(dec => dec.id === id);
    
    if (!decision) {
      return {
        status: 'error',
        message: 'القرار غير موجود',
        code: 404
      };
    }

    return {
      status: 'success',
      data: decision
    };
  }

  /**
   * إنشاء قرار جديد
   * Create new decision
   */
  createDecision(data) {
    try {
      const decision = this.database.addDecision({
        name: data.name,
        priority: data.priority || 'متوسطة',
        description: data.description || ''
      });

      return {
        status: 'success',
        message: 'تم إنشاء القرار بنجاح',
        data: decision
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: 400
      };
    }
  }

  /**
   * تحديث قرار
   * Update decision
   */
  updateDecision(id, data) {
    const index = this.database.store.decisions.findIndex(dec => dec.id === id);
    
    if (index === -1) {
      return {
        status: 'error',
        message: 'القرار غير موجود',
        code: 404
      };
    }

    this.database.store.decisions[index] = {
      ...this.database.store.decisions[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.database.saveToLocalStorage();

    return {
      status: 'success',
      message: 'تم تحديث القرار بنجاح',
      data: this.database.store.decisions[index]
    };
  }

  /**
   * الحصول على جميع دراسات الجدوى
   * Get all feasibility studies
   */
  getAllStudies(params = {}) {
    const { page = 1, limit = 20 } = params;
    const studies = this.database.store.feasibilityStudies;

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      status: 'success',
      data: studies.slice(start, end),
      pagination: {
        page,
        limit,
        total: studies.length,
        pages: Math.ceil(studies.length / limit)
      }
    };
  }

  /**
   * إنشاء دراسة جدوى
   * Create feasibility study
   */
  createStudy(data) {
    try {
      const study = this.database.addFeasibilityStudy({
        projectName: data.projectName,
        investment: data.investment,
        revenue: data.revenue,
        findings: data.findings || {}
      });

      return {
        status: 'success',
        message: 'تم إنشاء دراسة الجدوى بنجاح',
        data: study
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: 400
      };
    }
  }

  /**
   * الحصول على جميع الخطط الاستراتيجية
   * Get all strategic plans
   */
  getAllPlans(params = {}) {
    const { page = 1, limit = 20 } = params;
    const plans = this.database.store.strategicPlans;

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      status: 'success',
      data: plans.slice(start, end),
      pagination: {
        page,
        limit,
        total: plans.length,
        pages: Math.ceil(plans.length / limit)
      }
    };
  }

  /**
   * إنشاء خطة استراتيجية
   * Create strategic plan
   */
  createPlan(data) {
    try {
      const plan = this.database.addStrategicPlan({
        organization: data.organization,
        vision: data.vision,
        objectives: data.objectives || []
      });

      return {
        status: 'success',
        message: 'تم إنشاء الخطة الاستراتيجية بنجاح',
        data: plan
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: 400
      };
    }
  }

  /**
   * الحصول على الإحصائيات
   * Get statistics
   */
  getStatistics() {
    return {
      status: 'success',
      data: this.database.getStatistics()
    };
  }

  /**
   * الحصول على لوحة المعلومات
   * Get dashboard
   */
  getDashboard() {
    const stats = this.database.getStatistics();
    return {
      status: 'success',
      data: {
        summary: stats,
        lastSync: new Date().toISOString(),
        systemHealth: 99.9
      }
    };
  }

  /**
   * الحصول على تقرير الامتثال
   * Get compliance report
   */
  getComplianceReport() {
    const compliant = this.database.store.operations.filter(op => op.shariahVerification?.compliant).length;
    const total = this.database.store.operations.length;

    return {
      status: 'success',
      data: {
        totalOperations: total,
        compliantOperations: compliant,
        complianceRate: total > 0 ? ((compliant / total) * 100).toFixed(2) : 100,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * الحصول على سجل التدقيق
   * Get audit trail
   */
  getAuditTrail(params = {}) {
    const { limit = 100 } = params;
    const trail = this.database.store.auditTrail.slice(-limit);

    return {
      status: 'success',
      data: trail,
      total: this.database.store.auditTrail.length
    };
  }

  /**
   * إنشاء نسخة احتياطية
   * Create backup
   */
  createBackup() {
    const backup = this.database.createBackup();
    return {
      status: 'success',
      message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      data: backup
    };
  }

  /**
   * قائمة النسخ الاحتياطية
   * List backups
   */
  listBackups() {
    return {
      status: 'success',
      data: this.database.store.backups,
      total: this.database.store.backups.length
    };
  }

  /**
   * استعادة من نسخة احتياطية
   * Restore from backup
   */
  restoreBackup(backupId) {
    const success = this.database.restoreFromBackup(backupId);
    
    if (success) {
      return {
        status: 'success',
        message: 'تم استعادة النسخة الاحتياطية بنجاح'
      };
    } else {
      return {
        status: 'error',
        message: 'فشل استعادة النسخة الاحتياطية',
        code: 404
      };
    }
  }

  /**
   * فحص صحة النظام
   * Health check
   */
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() : 'unknown',
      database: {
        status: 'connected',
        size: this.database.getDatabaseSize()
      },
      operations: this.database.store.operations.length,
      decisions: this.database.store.decisions.length
    };
  }

  /**
   * إعداد تحديد المعدل
   * Setup rate limiting
   */
  setupRateLimiting() {
    this.rateLimiters['default'] = {
      requests: 100,
      window: 60000, // دقيقة واحدة
      current: 0,
      resetTime: Date.now() + 60000
    };
  }

  /**
   * التحقق من تحديد المعدل
   * Check rate limit
   */
  checkRateLimit(key = 'default') {
    const limiter = this.rateLimiters[key];
    
    if (!limiter) {
      return true;
    }

    if (Date.now() > limiter.resetTime) {
      limiter.current = 0;
      limiter.resetTime = Date.now() + limiter.window;
    }

    limiter.current++;
    return limiter.current <= limiter.requests;
  }

  /**
   * استدعاء endpoint
   * Call endpoint
   */
  callEndpoint(method, path, params = {}, data = null) {
    const key = `${method} ${path}`;
    
    if (!this.checkRateLimit()) {
      return {
        status: 'error',
        message: 'تم تجاوز حد المعدل',
        code: 429
      };
    }

    const handler = this.endpoints[key];
    
    if (!handler) {
      return {
        status: 'error',
        message: 'endpoint غير موجود',
        code: 404
      };
    }

    try {
      if (method === 'GET') {
        return handler(params);
      } else {
        const id = path.split(':')[1];
        return data ? handler(id, data) : handler(data);
      }
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: 500
      };
    }
  }

  /**
   * الحصول على معلومات API
   * Get API info
   */
  getAPIInfo() {
    return {
      version: '1.0',
      baseURL: this.baseURL,
      endpoints: Object.keys(this.endpoints).length,
      apiKey: this.apiKey,
      documentation: 'https://sheikha.example.com/api/docs',
      status: 'operational'
    };
  }
}

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SheikhaAPIServer;
}

console.log('✅ نظام الواجهات البرمجية: تم التحميل بنجاح');
