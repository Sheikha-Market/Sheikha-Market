'use strict';
// ══════════════════════════════════════════════════════════════
// محرك الشركات التجريبية — شيخة المرحلة ٤٦
// شركات Pilot + ERP Integration + UX Monitor
// بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
// ══════════════════════════════════════════════════════════════
const EventEmitter = require('events');

// ─── شركات التجربة الرسمية ───────────────────────────────────
const PILOT_COMPANIES = [
    {
        id: 'aramco', nameAr: 'أرامكو السعودية', nameEn: 'Saudi Aramco',
        sector: 'نفط وطاقة', size: 'enterprise',
        erp: ['SAP S/4HANA', 'Oracle ERP'], marketplace: ['Ariba', 'SAP SRM'],
        metals_focus: ['صلب', 'حديد', 'ألمنيوم', 'نحاس'],
        website: 'aramco.com', priority: 1, vision2030: true,
        integration: 'SAP BAPI + REST API + EDI EDIFACT',
        status: 'pilot_pending',
        quran_ref: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم — الأنفال:60'
    },
    {
        id: 'sabic', nameAr: 'سابك', nameEn: 'SABIC',
        sector: 'بتروكيماويات', size: 'enterprise',
        erp: ['SAP ECC', 'SAP S/4HANA'], marketplace: ['SAP Ariba', 'Coupa'],
        metals_focus: ['ألمنيوم', 'نحاس', 'بوليمرات'],
        website: 'sabic.com', priority: 1, vision2030: true,
        integration: 'SAP BAPI + REST API + IDoc',
        status: 'pilot_pending',
        quran_ref: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة:2'
    },
    {
        id: 'maaden', nameAr: 'معادن', nameEn: "Ma'aden",
        sector: 'تعدين ومعادن', size: 'enterprise',
        erp: ['SAP S/4HANA', 'Mincom Ellipse'], marketplace: ['Coupa', 'SAP Ariba'],
        metals_focus: ['ذهب', 'فضة', 'فوسفات', 'ألمنيوم', 'نحاس', 'زنك'],
        website: 'maaden.com.sa', priority: 1, vision2030: true,
        integration: 'REST API + Webhook + EDI',
        status: 'pilot_active',
        quran_ref: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ — الحديد:25'
    },
    {
        id: 'amana', nameAr: 'أمانة المنطقة', nameEn: 'Amana Municipality',
        sector: 'بلدية وإنشاء', size: 'government',
        erp: ['Oracle E-Business Suite', 'Etimad'], marketplace: ['Etimad', 'Monafasat'],
        metals_focus: ['حديد مقاطع', 'صلب إنشاء', 'سكراب مباني'],
        website: 'alriyadh.gov.sa', priority: 2, vision2030: true,
        integration: 'Etimad API + Nafath OAuth2',
        status: 'pilot_pending',
        quran_ref: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ — النساء:58'
    },
    {
        id: 'roshn', nameAr: 'روشن للتطوير العقاري', nameEn: 'ROSHN',
        sector: 'عقارات وإنشاء', size: 'enterprise',
        erp: ['Oracle Cloud', 'SAP'], marketplace: ['Ariba', 'E-Procurement'],
        metals_focus: ['حديد تسليح', 'صلب إنشائي', 'نحاس كهربائي', 'سكراب إنشاء'],
        website: 'roshn.sa', priority: 2, vision2030: true,
        integration: 'REST API + Oracle ORDS',
        status: 'pilot_pending',
        quran_ref: 'وَاللَّهُ جَعَلَ لَكُم مِّن بُيُوتِكُمْ سَكَنًا — النحل:80'
    },
    {
        id: 'aluminium_jazeera', nameAr: 'ألمنيوم الجزيرة', nameEn: 'Arabian Aluminium',
        sector: 'تصنيع ألمنيوم', size: 'large',
        erp: ['SAP B1', 'Odoo'], marketplace: ['سوق.com', 'Alibaba'],
        metals_focus: ['ألمنيوم خام', 'ألواح ألمنيوم', 'سكراب ألمنيوم'],
        website: 'aljazeera-alu.com', priority: 2, vision2030: false,
        integration: 'Odoo XML-RPC + REST API',
        status: 'pilot_pending',
        quran_ref: 'وَخَلَقَ كُلَّ شَيْءٍ فَقَدَّرَهُ تَقْدِيرًا — الفرقان:2'
    },
    {
        id: 'hadeed', nameAr: 'حديد الراجحي', nameEn: 'Rajhi Steel',
        sector: 'صلب وحديد', size: 'large',
        erp: ['SAP S/4HANA'], marketplace: ['منصة صناع'],
        metals_focus: ['حديد تسليح', 'صلب إنشائي', 'قضبان'],
        website: 'rajhisteel.com', priority: 2, vision2030: true,
        integration: 'SAP API + EDI EDIFACT + REST',
        status: 'pilot_pending',
        quran_ref: 'وَأَنزَلْنَا الْحَدِيدَ — الحديد:25'
    },
    {
        id: 'swcc', nameAr: 'المياه والصرف الصحي', nameEn: 'SWCC',
        sector: 'مياه وبنية تحتية', size: 'government',
        erp: ['Oracle EBS', 'Maximo IBM'], marketplace: ['Etimad', 'Merx'],
        metals_focus: ['أنابيب فولاذية', 'نحاس مواسير', 'ألمنيوم'],
        website: 'swcc.gov.sa', priority: 3, vision2030: true,
        integration: 'Oracle ORDS + Maximo REST API',
        status: 'proposed',
        quran_ref: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء:30'
    },
    {
        id: 'sec', nameAr: 'شركة الكهرباء', nameEn: 'Saudi Electricity Company',
        sector: 'طاقة وكهرباء', size: 'enterprise',
        erp: ['SAP IS-U', 'SAP PM'], marketplace: ['Coupa', 'Ariba'],
        metals_focus: ['نحاس كهربائي', 'ألمنيوم موصلات', 'صلب أبراج'],
        website: 'se.com.sa', priority: 3, vision2030: true,
        integration: 'SAP API + IEC standard REST',
        status: 'proposed',
        quran_ref: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ — الجاثية:13'
    },
    {
        id: 'neom', nameAr: 'نيوم', nameEn: 'NEOM',
        sector: 'مدن المستقبل', size: 'mega',
        erp: ['Oracle Cloud', 'SAP S/4HANA'], marketplace: ['Digital Procurement', 'Ariba'],
        metals_focus: ['صلب إنشائي', 'ألمنيوم', 'نحاس', 'تيتانيوم'],
        website: 'neom.com', priority: 1, vision2030: true,
        integration: 'REST API + GraphQL + IoT + Digital Twin',
        status: 'proposed',
        quran_ref: 'رَبِّ زِدْنِي عِلْمًا — طه:114'
    }
];

// ─── استراتيجيات تكامل ERP ───────────────────────────────────
const ERP_STRATEGIES = {
    'SAP': {
        method: 'SAP BAPI / RFC + OData REST API',
        auth: 'Basic Auth + OAuth2 + SAP SSO',
        data_fields: ['Vendor Master', 'Material Master', 'PO', 'Stock', 'AR/AP'],
        sync: 'real-time webhook + daily batch',
        setup_days: 7
    },
    'Oracle': {
        method: 'Oracle REST Data Services (ORDS) + SOAP',
        auth: 'OAuth2 + API Key',
        data_fields: ['Suppliers', 'Items', 'PO Lines', 'Inventory', 'Ledger'],
        sync: 'webhook + hourly batch',
        setup_days: 10
    },
    'Odoo': {
        method: 'Odoo XML-RPC + JSON-RPC API',
        auth: 'API Key + session',
        data_fields: ['res.partner', 'product.template', 'purchase.order', 'stock.move'],
        sync: 'real-time + daily',
        setup_days: 3
    },
    'Etimad': {
        method: 'API حكومية — بوابة اعتماد',
        auth: 'Nafath OAuth2 + Government Token',
        data_fields: ['Supplier Registry', 'Contract Data', 'Payment Records'],
        sync: 'on-demand + scheduled',
        setup_days: 5
    },
    'Marketplace': {
        method: 'Partner REST API + Certified Data Feed',
        auth: 'API Key + OAuth2',
        data_fields: ['Listings', 'Pricing', 'Seller Info', 'Inventory'],
        sync: 'hourly',
        setup_days: 2,
        note: 'لا ضرر ولا ضرار — بيانات عامة وبموافقة صريحة فقط'
    }
};

// ─── مراقبة UX لحظة بلحظة ────────────────────────────────────
class PilotUXMonitor extends EventEmitter {
    constructor() {
        super();
        this.sessions = new Map();
        this.metrics = { total: 0, active: 0, errors: 0, fixes: 0 };
        this.autoFixRules = {
            'slow_load':        'تسخين الكاش + CDN acceleration',
            'form_error':       'إظهار تلميح مساعد عربي للحقل',
            'navigation_lost':  'تفعيل الدليل التفاعلي step-by-step',
            'api_error':        'إعادة المحاولة + نظام احتياطي',
            'auth_fail':        'اقتراح طريقة مصادقة بديلة (Nafath/Google)',
            'mobile_layout':    'تطبيق تخطيط RTL المُحسَّن للجوال',
            'rtl_broken':       'فرض اتجاه RTL الصحيح + Tajawal font',
            'timeout':          'تقليل payload + تنشيط skeleton loading',
            'validation':       'تحقق آلي + رسالة خطأ بالعربية الفصحى',
            'sharia_conflict':  'تنبيه شرعي + إيقاف العملية + اقتراح بديل'
        };
    }

    startSession(companyId, userId) {
        const id = `${companyId}_${userId}_${Date.now()}`;
        this.sessions.set(id, {
            id, companyId, userId,
            start: new Date().toISOString(),
            steps: [], issues: [], fixes: [],
            pageViews: 0, errors: 0, status: 'active'
        });
        this.metrics.total++;
        this.metrics.active++;
        this.emit('session:start', { id, companyId });
        return id;
    }

    recordStep(sessionId, step, data = {}) {
        const s = this.sessions.get(sessionId);
        if (!s) return null;
        const entry = { step, data, ts: new Date().toISOString() };
        s.steps.push(entry);
        s.pageViews++;
        this.emit('step', { sessionId, entry });
        return entry;
    }

    reportIssue(sessionId, type, detail = '') {
        const s = this.sessions.get(sessionId);
        const issue = { type, detail, ts: new Date().toISOString() };
        if (s) { s.issues.push(issue); s.errors++; }
        this.metrics.errors++;
        const fix = this._applyFix(issue);
        if (s && fix) s.fixes.push(fix);
        this.emit('issue', { sessionId, issue, fix });
        return fix;
    }

    _applyFix(issue) {
        const action = this.autoFixRules[issue.type];
        if (!action) return null;
        this.metrics.fixes++;
        return { action, issue_type: issue.type, ts: new Date().toISOString(), applied: true };
    }

    endSession(sessionId, completionRate = 0) {
        const s = this.sessions.get(sessionId);
        if (!s) return null;
        s.end = new Date().toISOString();
        s.status = completionRate >= 80 ? 'success' : completionRate >= 50 ? 'partial' : 'incomplete';
        s.completionRate = completionRate;
        this.metrics.active = Math.max(0, this.metrics.active - 1);
        this.emit('session:end', s);
        return s;
    }

    getReport() {
        return {
            metrics: this.metrics,
            activeSessions: [...this.sessions.values()].filter(s => s.status === 'active').length,
            autoFixRules: Object.keys(this.autoFixRules).length,
            quran: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ — النساء:82'
        };
    }
}

// ─── مراحل Pilot ────────────────────────────────────────────
const PILOT_PHASES = [
    { n: 1, name: 'التسجيل الذكي',       days: '١-٣',   desc: 'سحب CR + ربط ERP + إعداد الحساب' },
    { n: 2, name: 'استيراد الموردين',    days: '٤-٧',   desc: 'سحب vendor master + تصنيف شرعي + مطابقة' },
    { n: 3, name: 'تفعيل التكامل',       days: '٨-١٤',  desc: 'webhook مباشر + مزامنة مخزون + اختبار شامل' },
    { n: 4, name: 'إطلاق التجربة',       days: '١٥-٤٥', desc: 'أولى الصفقات + مراقبة UX + إصلاح آلي' },
    { n: 5, name: 'التقييم والانطلاق',   days: '٤٦-٩٠', desc: 'تقرير شامل + قياس ROI + قرار الاشتراك' }
];

// ─── ملف الشركة التعريفي ─────────────────────────────────────
function getProfile(companyId) {
    const c = PILOT_COMPANIES.find(x => x.id === companyId);
    if (!c) return null;
    const erpKey = c.erp[0].split(' ')[0];
    const strategy = ERP_STRATEGIES[erpKey] || ERP_STRATEGIES.Marketplace;
    return {
        company: c,
        integration: { ...strategy, recommended: c.integration },
        smart_registration: {
            step1: 'أدخل رقم السجل التجاري (CR) أو رقم ضريبة القيمة المضافة',
            step2: 'تسحب شيخة البيانات تلقائياً من الأنظمة العامة والمرخَّصة',
            step3: 'تراجع الشركة البيانات وتؤكدها',
            step4: 'ربط ERP بمفتاح API مُشفَّر (256-bit AES)',
            step5: 'مزامنة الموردين والمخزون والعملاء الحاليين',
            step6: 'تفعيل التدقيق الشرعي اللحظي لكل معاملة',
            principle: 'لا ضرر ولا ضرار — البيانات بموافقة صريحة وعقد واضح'
        },
        pilot: {
            duration: '٩٠ يوماً',
            cost: 'مجاناً — لا رسوم في مرحلة التجربة',
            support: ['WhatsApp مباشر', 'بريد إلكتروني', 'مكالمة فيديو', 'دعم مباشر بالعربية'],
            phases: PILOT_PHASES
        },
        marketing: {
            headline: `${c.nameAr} × شيخة — شراكة رقمية إسلامية`,
            value: 'توفير ١٥-٣٠٪ من تكاليف المشتريات + امتثال شرعي كامل',
            benefits: [
                'سعر موحد شفاف مُدقَّق شرعياً',
                'توثيق رقمي كامل لكل صفقة',
                'تكامل مع ERP الحالي بدون تغيير في البنية',
                'حساب الزكاة الآلي على مخزون المعادن',
                'تقارير لحظية لصانعي القرار',
                'امتثال PDPL + أنظمة هيئة الزكاة والضريبة والجمارك'
            ]
        },
        terms: {
            data_ownership: 'البيانات ملك الشركة الكاملة — شيخة أمين فقط',
            cancellation: 'إلغاء فوري بدون رسوم أو قيود',
            sharia: 'لا ربا — لا غرر — لا غش — مراجعة شرعية لكل بند',
            privacy: 'امتثال PDPL الكامل — تشفير AES-256 — لا مشاركة لطرف ثالث'
        },
        quran_ref: c.quran_ref
    };
}

// ─── الإصدار والصادرات ────────────────────────────────────────
const uxMonitor = new PilotUXMonitor();

module.exports = {
    getPilotCompanies: () => PILOT_COMPANIES,
    getActivePilots:   () => PILOT_COMPANIES.filter(c => c.status === 'pilot_active'),
    getPendingPilots:  () => PILOT_COMPANIES.filter(c => c.status === 'pilot_pending'),
    getProposedPilots: () => PILOT_COMPANIES.filter(c => c.status === 'proposed'),
    getProfile,
    getERPStrategies:  () => ERP_STRATEGIES,
    getPilotPhases:    () => PILOT_PHASES,
    uxMonitor,
    startUXSession:  (cid, uid)    => uxMonitor.startSession(cid, uid),
    recordUXStep:    (sid, step, d) => uxMonitor.recordStep(sid, step, d),
    reportUXIssue:   (sid, t, d)   => uxMonitor.reportIssue(sid, t, d),
    endUXSession:    (sid, rate)   => uxMonitor.endSession(sid, rate),
    getUXReport:     ()            => uxMonitor.getReport(),
    getEngineStats: () => ({
        pilot_companies: PILOT_COMPANIES.length,
        active: PILOT_COMPANIES.filter(c => c.status === 'pilot_active').length,
        pending: PILOT_COMPANIES.filter(c => c.status === 'pilot_pending').length,
        proposed: PILOT_COMPANIES.filter(c => c.status === 'proposed').length,
        erp_integrations: Object.keys(ERP_STRATEGIES).length,
        ux_sessions: uxMonitor.metrics.total,
        auto_fixes: uxMonitor.metrics.fixes,
        phase: 46,
        quran: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة:2'
    })
};
