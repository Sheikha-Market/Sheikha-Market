/**
 * 🕌 نظام دعم اللغات المتعددة لشيخة
 * Sheikha Multi-Language Support System
 * 
 * دعم لغات متعددة مع ترجمات شاملة ومرنة
 * Comprehensive multi-language support with flexible translations
 */

class SheikhaI18n {
  constructor() {
    this.currentLanguage = 'ar'; // العربية افتراضياً
    this.supportedLanguages = {
      'ar': 'العربية',
      'en': 'English',
      'fr': 'Français',
      'es': 'Español',
      'de': 'Deutsch',
      'zh': '中文'
    };
    
    this.translations = {
      'ar': {
        // الواجهة العامة
        'app.title': 'لغة شيخة البرمجية',
        'app.subtitle': 'منصة تجارية إسلامية متكاملة',
        'app.welcome': 'مرحباً بك في شيخة',
        
        // الطبقات المعمارية
        'layer.a1': 'الأساس الإسلامي الموثق',
        'layer.a2': 'الإقلاع والتهيئة',
        'layer.a3': 'التشغيل بالعدل والإحسان',
        'layer.a4_a6': 'التوسع والنمو',
        'layer.qa': 'ضمان الجودة',
        'layer.opt': 'التحسين المستمر',
        
        // المبادئ الإسلامية
        'principle.justice': 'العدل',
        'principle.trustworthiness': 'الأمانة',
        'principle.transparency': 'الشفافية',
        'principle.excellence': 'الإحسان',
        'principle.trust': 'التوكل',
        'principle.consultation': 'الشورى',
        
        // العمليات
        'operation.create': 'إنشاء عملية',
        'operation.update': 'تحديث عملية',
        'operation.delete': 'حذف عملية',
        'operation.execute': 'تنفيذ عملية',
        'operation.verify': 'التحقق من العملية',
        
        // القرارات
        'decision.create': 'اتخاذ قرار',
        'decision.approve': 'موافقة',
        'decision.reject': 'رفض',
        'decision.pending': 'قيد الانتظار',
        'decision.approved': 'موافق عليه',
        
        // الإحصائيات
        'stats.total_operations': 'إجمالي العمليات',
        'stats.total_decisions': 'إجمالي القرارات',
        'stats.compliance_rate': 'معدل الامتثال الشرعي',
        'stats.system_health': 'صحة النظام',
        
        // الأخطاء والرسائل
        'error.not_found': 'لم يتم العثور على البيان المطلوب',
        'error.invalid_data': 'البيانات المدخلة غير صحيحة',
        'error.unauthorized': 'غير مصرح بالوصول',
        'error.server_error': 'خطأ في الخادم',
        'success.operation_created': 'تم إنشاء العملية بنجاح',
        'success.decision_made': 'تم اتخاذ القرار بنجاح',
        
        // الأزرار والتحكم
        'button.save': 'حفظ',
        'button.cancel': 'إلغاء',
        'button.delete': 'حذف',
        'button.edit': 'تعديل',
        'button.search': 'بحث',
        'button.export': 'تصدير',
        'button.import': 'استيراد',
        'button.backup': 'نسخة احتياطية',
        'button.restore': 'استعادة',
        
        // المحتوى
        'content.about': 'عن التطبيق',
        'content.help': 'المساعدة',
        'content.settings': 'الإعدادات',
        'content.language': 'اللغة',
        'content.dashboard': 'لوحة المعلومات',
        'content.reports': 'التقارير',
      },
      
      'en': {
        // General Interface
        'app.title': 'Sheikha Programming Language',
        'app.subtitle': 'Integrated Islamic Trading Platform',
        'app.welcome': 'Welcome to Sheikha',
        
        // Architecture Layers
        'layer.a1': 'Islamic Foundation Documented',
        'layer.a2': 'Launch and Initialization',
        'layer.a3': 'Operation with Justice and Excellence',
        'layer.a4_a6': 'Expansion and Growth',
        'layer.qa': 'Quality Assurance',
        'layer.opt': 'Continuous Improvement',
        
        // Islamic Principles
        'principle.justice': 'Justice',
        'principle.trustworthiness': 'Trustworthiness',
        'principle.transparency': 'Transparency',
        'principle.excellence': 'Excellence',
        'principle.trust': 'Trust in Allah',
        'principle.consultation': 'Consultation',
        
        // Operations
        'operation.create': 'Create Operation',
        'operation.update': 'Update Operation',
        'operation.delete': 'Delete Operation',
        'operation.execute': 'Execute Operation',
        'operation.verify': 'Verify Operation',
        
        // Decisions
        'decision.create': 'Make Decision',
        'decision.approve': 'Approve',
        'decision.reject': 'Reject',
        'decision.pending': 'Pending',
        'decision.approved': 'Approved',
        
        // Statistics
        'stats.total_operations': 'Total Operations',
        'stats.total_decisions': 'Total Decisions',
        'stats.compliance_rate': 'Compliance Rate',
        'stats.system_health': 'System Health',
        
        // Errors and Messages
        'error.not_found': 'Resource not found',
        'error.invalid_data': 'Invalid data provided',
        'error.unauthorized': 'Unauthorized access',
        'error.server_error': 'Server error occurred',
        'success.operation_created': 'Operation created successfully',
        'success.decision_made': 'Decision made successfully',
        
        // Buttons and Controls
        'button.save': 'Save',
        'button.cancel': 'Cancel',
        'button.delete': 'Delete',
        'button.edit': 'Edit',
        'button.search': 'Search',
        'button.export': 'Export',
        'button.import': 'Import',
        'button.backup': 'Backup',
        'button.restore': 'Restore',
        
        // Content
        'content.about': 'About',
        'content.help': 'Help',
        'content.settings': 'Settings',
        'content.language': 'Language',
        'content.dashboard': 'Dashboard',
        'content.reports': 'Reports',
      },
      
      'fr': {
        'app.title': 'Langage de programmation Sheikha',
        'app.subtitle': 'Plateforme commerciale islamique intégrée',
        'app.welcome': 'Bienvenue dans Sheikha',
        'layer.a1': 'Fondation islamique documentée',
        'layer.a2': 'Lancement et initialisation',
        'layer.a3': 'Fonctionnement avec justice et excellence',
        'button.save': 'Enregistrer',
        'button.cancel': 'Annuler',
      },
      
      'es': {
        'app.title': 'Lenguaje de programación Sheikha',
        'app.subtitle': 'Plataforma comercial islámica integrada',
        'app.welcome': 'Bienvenido a Sheikha',
        'layer.a1': 'Fundación islámica documentada',
        'layer.a2': 'Lanzamiento e inicialización',
        'layer.a3': 'Operación con justicia y excelencia',
        'button.save': 'Guardar',
        'button.cancel': 'Cancelar',
      },
      
      'de': {
        'app.title': 'Sheikha-Programmiersprache',
        'app.subtitle': 'Integrierte islamische Handelsplattform',
        'app.welcome': 'Willkommen bei Sheikha',
        'layer.a1': 'Dokumentierte islamische Grundlage',
        'layer.a2': 'Start und Initialisierung',
        'layer.a3': 'Betrieb mit Gerechtigkeit und Exzellenz',
        'button.save': 'Speichern',
        'button.cancel': 'Abbrechen',
      },
      
      'zh': {
        'app.title': '谢赫编程语言',
        'app.subtitle': '综合伊斯兰贸易平台',
        'app.welcome': '欢迎来到谢赫',
        'layer.a1': '记录完整的伊斯兰基础',
        'layer.a2': '启动和初始化',
        'layer.a3': '以正义和卓越运营',
        'button.save': '保存',
        'button.cancel': '取消',
      }
    };
    
    this.loadLanguage();
  }

  /**
   * تحميل اللغة المحفوظة
   * Load saved language
   */
  loadLanguage() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sheikha_language');
      if (saved && this.supportedLanguages[saved]) {
        this.currentLanguage = saved;
      }
    }
  }

  /**
   * تعيين اللغة الحالية
   * Set current language
   */
  setLanguage(lang) {
    if (this.supportedLanguages[lang]) {
      this.currentLanguage = lang;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sheikha_language', lang);
      }
      console.log(`✅ تم تعيين اللغة إلى: ${this.supportedLanguages[lang]}`);
      return true;
    } else {
      console.error(`❌ لغة غير مدعومة: ${lang}`);
      return false;
    }
  }

  /**
   * ترجمة مفتاح
   * Translate key
   */
  t(key, params = {}) {
    let text = this.translations[this.currentLanguage]?.[key] || 
               this.translations['ar']?.[key] || 
               key;

    // استبدال المعاملات
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });

    return text;
  }

  /**
   * الحصول على اللغة الحالية
   * Get current language
   */
  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      name: this.supportedLanguages[this.currentLanguage],
      direction: this.currentLanguage === 'ar' ? 'rtl' : 'ltr'
    };
  }

  /**
   * قائمة اللغات المدعومة
   * List supported languages
   */
  getSupportedLanguages() {
    return Object.entries(this.supportedLanguages).map(([code, name]) => ({
      code,
      name,
      direction: code === 'ar' ? 'rtl' : 'ltr',
      active: code === this.currentLanguage
    }));
  }

  /**
   * إضافة ترجمات جديدة
   * Add new translations
   */
  addTranslations(lang, translations) {
    if (!this.translations[lang]) {
      this.translations[lang] = {};
    }
    
    this.translations[lang] = {
      ...this.translations[lang],
      ...translations
    };
  }

  /**
   * ترجمة كائن بالكامل
   * Translate entire object
   */
  translateObject(obj) {
    const translated = {};
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string' && obj[key].startsWith('i18n.')) {
        translated[key] = this.t(obj[key].replace('i18n.', ''));
      } else {
        translated[key] = obj[key];
      }
    });
    return translated;
  }

  /**
   * إعداد الاتجاه (RTL/LTR)
   * Setup direction (RTL/LTR)
   */
  setupDirection() {
    const direction = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = this.currentLanguage;
    }
    return direction;
  }

  /**
   * الحصول على جميع الترجمات للغة الحالية
   * Get all translations for current language
   */
  getAllTranslations() {
    return this.translations[this.currentLanguage] || {};
  }

  /**
   * تصدير الترجمات كـ JSON
   * Export translations as JSON
   */
  exportTranslations(lang = null) {
    const targetLang = lang || this.currentLanguage;
    return JSON.stringify(this.translations[targetLang], null, 2);
  }
}

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SheikhaI18n;
}

// إنشاء نموذج عام للاستخدام
window.i18n = window.i18n || new SheikhaI18n();

console.log('✅ نظام دعم اللغات: تم التحميل بنجاح');
