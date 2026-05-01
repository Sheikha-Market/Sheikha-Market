/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                   lib/domains/healthcare.js                                 ║
 * ║     قطاع الصحة الكامل — مستشفيات | أدوية | بحث طبي | رقمنة بالكتاب والسنة  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ" — الشعراء ٨٠
 * "مَا أَنزَلَ اللَّهُ دَاءً إِلَّا أَنزَلَ لَهُ شِفَاءً" — البخاري
 * "تَدَاوَوْا عِبَادَ اللَّهِ، فَإِنَّ اللَّهَ لَمْ يَضَعْ دَاءً إِلَّا وَضَعَ لَهُ شِفَاءً" — أبو داود
 *
 * المنظومة الصحية الشاملة:
 *  ① المستشفيات والعيادات
 *  ② الصيدلة والأدوية
 *  ③ البحث الطبي المتقدم
 *  ④ الذكاء الصناعي الطبي
 *  ⑤ الأجهزة الطبية المتصلة
 *  ⑥ السجلات الطبية الإلكترونية
 *  ⑦ طب الطوارئ والإسعاف
 *  ⑧ الصحة العامة والوبائيات
 *  ⑨ الطب النبوي — أساس لا يُقدَّر
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── الأساس الشرعي للطب ──────────────────────────────────────────────────────

const PROPHETIC_MEDICINE_PRINCIPLES = {
    foundation: 'بسم الله الرحمن الرحيم',
    verses: [
        { ref: 'الشعراء:٨٠',   text: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',                             note: 'الشفاء من الله وحده' },
        { ref: 'يونس:٥٧',      text: 'وَشِفَاءٌ لِّمَا فِي الصُّدُورِ',                                note: 'القرآن شفاء' },
        { ref: 'النحل:٦٩',     text: 'فِيهِ شِفَاءٌ لِّلنَّاسِ',                                       note: 'العسل شفاء' },
        { ref: 'المائدة:٣٢',   text: 'مَن أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا',           note: 'حفظ النفس فرض' },
    ],
    hadiths: [
        { text: 'مَا أَنزَلَ اللَّهُ دَاءً إِلَّا أَنزَلَ لَهُ شِفَاءً',          source: 'البخاري' },
        { text: 'تَدَاوَوْا عِبَادَ اللَّهِ',                                      source: 'أبو داود' },
        { text: 'عَلَيْكُمْ بِالسَّنَا وَالسَّنُّوت',                              source: 'ابن ماجه' },
        { text: 'الْحَبَّةُ السَّوْدَاءُ شِفَاءٌ مِنْ كُلِّ دَاءٍ إِلَّا السَّام', source: 'البخاري' },
        { text: 'شِفَاءُ أُمَّتِي فِي ثَلَاثَةٍ: شَرْطَةِ مِحْجَمٍ أَوْ شَرْبَةِ عَسَلٍ أَوْ كَيَّةٍ', source: 'البخاري' },
    ],
    propheticRemedies: [
        'العسل',       // Honey
        'الحبة السوداء', // Black seed
        'الحجامة',      // Cupping
        'الزيت',        // Olive oil
        'التمر',        // Dates
        'الزنجبيل',     // Ginger
        'السواك',       // Miswak
        'الماء الزمزم', // Zamzam water
        'السنا',        // Senna
    ],
    ethics: [
        'لا ضرر ولا ضرار',
        'الضرورات تبيح المحظورات',
        'درء الضرر مقدم على جلب النفع',
        'حفظ النفس أحد الضروريات الخمس',
        'الطبيب يداوي والله يشفي',
    ],
};

// ─── Base Healthcare Adapter ──────────────────────────────────────────────────

class HealthcareAdapter extends EventEmitter {
    constructor(facilityType, displayName) {
        super();
        this.facilityType = facilityType;
        this.displayName  = displayName;
        this._units       = new Map();
        this._staff       = new Map();
        this._systems     = new Map();
        this._alerts      = [];
        this._telemetry   = [];
        this.activatedAt  = null;
        this.status_      = 'dormant';
        this.principles   = PROPHETIC_MEDICINE_PRINCIPLES;
    }

    registerUnit(id, spec = {}) {
        const unit = {
            id,
            name:        spec.name       || id,
            type:        spec.type       || 'general',
            beds:        spec.beds       || 0,
            occupied:    0,
            status:      'operational',
            aiAssisted:  spec.aiAssisted || false,
        };
        this._units.set(id, unit);
        return unit;
    }

    registerStaff(id, spec = {}) {
        const staff = {
            id,
            name:        spec.name        || id,
            specialty:   spec.specialty   || 'general',
            license:     spec.license     || null,
            on_duty:     false,
        };
        this._staff.set(id, staff);
        return staff;
    }

    registerSystem(id, spec = {}) {
        this._systems.set(id, {
            id,
            name:     spec.name     || id,
            type:     spec.type     || 'generic',
            protocol: spec.protocol || 'hl7',
            status:   'connected',
        });
        return this._systems.get(id);
    }

    raiseAlert(unitId, level, message) {
        const alert = {
            id:       crypto.randomBytes(4).toString('hex'),
            unitId,
            level,
            message,
            raisedAt: new Date().toISOString(),
            resolved: false,
        };
        this._alerts.push(alert);
        this.emit('medical:alert', alert);
        console.log(`[${this.facilityType}] ${level === 'critical' ? '🚨' : '⚠️'} ${message}`);
        return alert;
    }

    snapshot() {
        const totalBeds    = Array.from(this._units.values()).reduce((s, u) => s + u.beds, 0);
        const occupiedBeds = Array.from(this._units.values()).reduce((s, u) => s + u.occupied, 0);
        return {
            facility:      this.facilityType,
            name:          this.displayName,
            status:        this.status_,
            units:         this._units.size,
            totalBeds,
            occupiedBeds,
            occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) + '%' : '0%',
            staff:         this._staff.size,
            activeAlerts:  this._alerts.filter(a => !a.resolved).length,
            systems:       this._systems.size,
        };
    }

    async init() {
        this.activatedAt = new Date().toISOString();
        this.status_     = 'active';
        console.log(`[healthcare] ✅ ${this.displayName} جاهز`);
    }
}

// ─── Hospital System ──────────────────────────────────────────────────────────

class HospitalSystem extends HealthcareAdapter {
    constructor(name) {
        super('hospital', name || 'مستشفى شيخة العام');
        this._patients  = new Map();
        this._surgeries = [];
        this._emrStore  = new Map(); // Electronic Medical Records
    }

    // ─── Patient Management ───────────────────────────────────────────────

    admitPatient(id, data = {}) {
        const patient = {
            id:          id || crypto.randomBytes(6).toString('hex'),
            name:        data.name        || 'مريض',
            age:         data.age         || 0,
            gender:      data.gender      || 'unknown',
            bloodType:   data.bloodType   || 'unknown',
            admittedAt:  new Date().toISOString(),
            ward:        data.ward        || 'general',
            diagnosis:   data.diagnosis   || [],
            allergies:   data.allergies   || [],
            medications: [],
            status:      'admitted',
            aiRisk:      null,
        };
        this._patients.set(patient.id, patient);
        this.emit('patient:admitted', { id: patient.id, ward: patient.ward });
        console.log(`[hospital] 🏥 مريض دخيل: ${patient.id} → ${patient.ward}`);
        return patient;
    }

    dischargePatient(id, summary = '') {
        const p = this._patients.get(id);
        if (!p) return { ok: false, error: 'المريض غير موجود' };
        p.status       = 'discharged';
        p.dischargedAt = new Date().toISOString();
        p.summary      = summary;
        this.emit('patient:discharged', { id });
        return { ok: true, patient: p };
    }

    getPatient(id) { return this._patients.get(id) || null; }

    // ─── EMR ──────────────────────────────────────────────────────────────

    updateEMR(patientId, entry) {
        if (!this._emrStore.has(patientId)) this._emrStore.set(patientId, []);
        const record = {
            entryId:   crypto.randomBytes(4).toString('hex'),
            patientId,
            ...entry,
            timestamp: new Date().toISOString(),
        };
        this._emrStore.get(patientId).push(record);
        return record;
    }

    getEMR(patientId, limit = 20) {
        return (this._emrStore.get(patientId) || []).slice(-limit);
    }

    // ─── AI Diagnostics ───────────────────────────────────────────────────

    async aiDiagnosis(patientId, symptoms = []) {
        const patient = this._patients.get(patientId);
        if (!patient) return { ok: false, error: 'المريض غير موجود' };

        // In production: connect to medical AI model (CheXNet, Med-PaLM, etc.)
        const diagnosis = {
            patientId,
            symptoms,
            aiSuggestions: [
                { condition: 'يتطلب تحليلًا أعمق', confidence: 0.85 },
            ],
            note:        'النتيجة للاسترشاد — تحقق الطبيب المختص ضروري',
            disclaimer:  'الطبيب يداوي والله يشفي — لا يُعتمد على الذكاء الصناعي وحده',
            generatedAt: new Date().toISOString(),
        };

        this.updateEMR(patientId, { type: 'ai-diagnosis', data: diagnosis });
        return { ok: true, diagnosis };
    }

    async init() {
        await super.init();
        // أقسام المستشفى
        this.registerUnit('ICU',       { name: 'العناية المركزة',    type: 'icu',       beds: 20, aiAssisted: true });
        this.registerUnit('ER',        { name: 'الطوارئ',            type: 'emergency', beds: 30, aiAssisted: true });
        this.registerUnit('surgery',   { name: 'الجراحة',            type: 'surgery',   beds: 15, aiAssisted: true });
        this.registerUnit('cardio',    { name: 'القلب والأوعية',     type: 'cardiology',beds: 25 });
        this.registerUnit('neuro',     { name: 'الأعصاب',            type: 'neurology', beds: 20 });
        this.registerUnit('oncology',  { name: 'الأورام',            type: 'oncology',  beds: 30, aiAssisted: true });
        this.registerUnit('pediatric', { name: 'طب الأطفال',         type: 'pediatrics',beds: 40 });
        this.registerUnit('maternity', { name: 'الولادة والنساء',    type: 'maternity', beds: 35 });
        this.registerUnit('lab',       { name: 'المختبر',            type: 'lab',       beds: 0 });
        this.registerUnit('radiology', { name: 'الأشعة',             type: 'radiology', beds: 0 });
        this.registerUnit('pharmacy',  { name: 'الصيدلية',           type: 'pharmacy',  beds: 0 });
        this.registerUnit('rehab',     { name: 'إعادة التأهيل',      type: 'rehab',     beds: 20 });

        // أنظمة المستشفى
        this.registerSystem('his',     { name: 'HIS - نظام المستشفى',    type: 'his',    protocol: 'hl7-fhir' });
        this.registerSystem('lis',     { name: 'LIS - نظام المختبر',     type: 'lis',    protocol: 'hl7' });
        this.registerSystem('ris',     { name: 'RIS - نظام الأشعة',      type: 'ris',    protocol: 'dicom' });
        this.registerSystem('pacs',    { name: 'PACS - أرشيف الأشعة',   type: 'pacs',   protocol: 'dicom' });
        this.registerSystem('cpoe',    { name: 'CPOE - الطلبيات الإلكترونية', type: 'cpoe', protocol: 'hl7' });
        this.registerSystem('emr',     { name: 'EMR - السجل الطبي',      type: 'emr',    protocol: 'hl7-fhir' });
        this.registerSystem('ai-diag', { name: 'تشخيص الذكاء الصناعي',  type: 'ai',     protocol: 'internal' });
        this.registerSystem('vital-mon', { name: 'مراقبة العلامات',      type: 'iot',    protocol: 'mqtt' });
    }
}

// ─── Pharmacy & Drug System ───────────────────────────────────────────────────

class PharmacySystem extends HealthcareAdapter {
    constructor() {
        super('pharmacy', 'منظومة الصيدلة والأدوية');
        this._drugs     = new Map();
        this._inventory = new Map();
        this._prescriptions = new Map();
    }

    registerDrug(id, spec = {}) {
        const drug = {
            id,
            genericName:    spec.genericName    || id,
            tradeName:      spec.tradeName      || id,
            category:       spec.category       || 'general',
            // category: antibiotic | analgesic | antiviral | cardiac | neurological | oncology | ...
            form:           spec.form           || 'tablet',
            dosageStrength: spec.dosageStrength || '500mg',
            halalStatus:    spec.halalStatus    || 'verified', // verified | pending | haram-substitute
            propheticBase:  spec.propheticBase  || false, // مستخلص من الطب النبوي
            contraindications: spec.contraindications || [],
            interactions:   spec.interactions   || [],
            registeredAt:   new Date().toISOString(),
        };
        this._drugs.set(id, drug);
        return drug;
    }

    addStock(drugId, quantity, expiryDate) {
        if (!this._inventory.has(drugId)) {
            this._inventory.set(drugId, { quantity: 0, batches: [] });
        }
        const inv = this._inventory.get(drugId);
        inv.quantity += quantity;
        inv.batches.push({ quantity, expiryDate, addedAt: new Date().toISOString() });
        return inv;
    }

    checkStock(drugId) {
        return this._inventory.get(drugId) || { quantity: 0, batches: [] };
    }

    createPrescription(patientId, prescriptions = []) {
        const rx = {
            id:          `RX-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            patientId,
            prescriptions, // [{ drugId, dose, frequency, duration, notes }]
            issuedAt:    new Date().toISOString(),
            status:      'active',
            warnings:    this._checkInteractions(prescriptions),
        };
        this._prescriptions.set(rx.id, rx);
        return rx;
    }

    _checkInteractions(prescriptions) {
        const warnings = [];
        const drugIds  = prescriptions.map(p => p.drugId);
        drugIds.forEach(id => {
            const drug = this._drugs.get(id);
            if (drug) {
                drug.interactions.forEach(interaction => {
                    if (drugIds.includes(interaction)) {
                        warnings.push(`تفاعل دوائي محتمل: ${id} ↔ ${interaction}`);
                    }
                });
            }
        });
        return warnings;
    }

    async init() {
        await super.init();
        this.registerSystem('pis',        { name: 'PIS - نظام الصيدلة',     type: 'pis',   protocol: 'hl7' });
        this.registerSystem('drug-db',    { name: 'قاعدة بيانات الأدوية',   type: 'db',    protocol: 'rest' });
        this.registerSystem('cold-chain', { name: 'سلسلة التبريد',          type: 'iot',   protocol: 'mqtt' });
        this.registerSystem('dispenser',  { name: 'موزع الأدوية الآلي',     type: 'robot', protocol: 'internal' });

        // تسجيل أدوية طبيعية/نبوية أساسية
        this.registerDrug('black-seed-oil',   { genericName: 'زيت الحبة السوداء', category: 'prophetic', form: 'oil',     halalStatus: 'verified', propheticBase: true });
        this.registerDrug('honey-natural',    { genericName: 'العسل الطبيعي',     category: 'prophetic', form: 'liquid',  halalStatus: 'verified', propheticBase: true });
        this.registerDrug('olive-oil',        { genericName: 'زيت الزيتون',       category: 'prophetic', form: 'oil',     halalStatus: 'verified', propheticBase: true });
        this.registerDrug('dates-ajwa',       { genericName: 'تمر العجوة',        category: 'prophetic', form: 'food',    halalStatus: 'verified', propheticBase: true });
        this.registerDrug('zamzam-water',     { genericName: 'ماء زمزم',          category: 'prophetic', form: 'water',   halalStatus: 'verified', propheticBase: true });
        this.registerDrug('senna-leaf',       { genericName: 'ورق السنا',         category: 'prophetic', form: 'herb',    halalStatus: 'verified', propheticBase: true });
        this.registerDrug('cupping-therapy',  { genericName: 'الحجامة',           category: 'prophetic', form: 'therapy', halalStatus: 'verified', propheticBase: true });
        this.registerDrug('miswak',           { genericName: 'السواك',            category: 'prophetic', form: 'stick',   halalStatus: 'verified', propheticBase: true });
        this.registerDrug('ginger',           { genericName: 'الزنجبيل',          category: 'prophetic', form: 'herb',    halalStatus: 'verified', propheticBase: true });
        this.registerDrug('thyme-thymoquinone',{ genericName: 'الزعتر - ثيموكينون', category: 'prophetic', form: 'herb',  halalStatus: 'verified', propheticBase: true });
    }
}

// ─── Medical Research Center ──────────────────────────────────────────────────

class MedicalResearchCenter extends HealthcareAdapter {
    constructor() {
        super('medical-research', 'مركز البحث الطبي المتقدم');
        this._studies     = new Map();
        this._trials      = new Map();
        this._discoveries = [];
        this._genomics    = new Map();
    }

    // ─── Clinical Trials ──────────────────────────────────────────────────

    createTrial(id, spec = {}) {
        const trial = {
            id,
            title:      spec.title      || `تجربة سريرية ${id}`,
            phase:      spec.phase      || 'I',  // I | II | III | IV
            type:       spec.type       || 'interventional',
            drug:       spec.drug       || null,
            disease:    spec.disease    || null,
            participants: 0,
            maxParticipants: spec.maxParticipants || 100,
            status:     'recruiting',
            irbApproved: spec.irbApproved || false,
            ethicsNote: 'يلتزم بمبادئ الكتاب والسنة وأخلاقيات البحث الطبي الإسلامي',
            startedAt:  new Date().toISOString(),
        };
        this._trials.set(id, trial);
        console.log(`[medical-research] 🧪 تجربة سريرية: ${trial.title} (المرحلة ${trial.phase})`);
        return trial;
    }

    // ─── Research Studies ─────────────────────────────────────────────────

    createStudy(id, spec = {}) {
        const study = {
            id,
            title:      spec.title      || `دراسة ${id}`,
            type:       spec.type       || 'observational', // observational | experimental | meta-analysis
            domain:     spec.domain     || 'general',
            // domains: oncology | cardiology | genomics | virology | prophetic-medicine | ai-diagnostics
            aiAssisted: spec.aiAssisted || false,
            hpcRequired: spec.hpcRequired || false,
            status:     'active',
            findings:   [],
            propheticCorrelation: spec.propheticCorrelation || false,
        };
        this._studies.set(id, study);
        return study;
    }

    recordDiscovery(studyId, discovery) {
        const entry = {
            id:       crypto.randomBytes(4).toString('hex'),
            studyId,
            ...discovery,
            recordedAt: new Date().toISOString(),
        };
        this._discoveries.push(entry);
        this.emit('discovery:recorded', entry);
        console.log(`[medical-research] 💡 اكتشاف: ${discovery.title || studyId}`);
        return entry;
    }

    // ─── Genomics / Precision Medicine ────────────────────────────────────

    storeGenomicProfile(patientId, profile) {
        this._genomics.set(patientId, {
            patientId,
            ...profile,
            storedAt: new Date().toISOString(),
            encrypted: true,
        });
    }

    getGenomicProfile(patientId) {
        return this._genomics.get(patientId) || null;
    }

    async init() {
        await super.init();
        this.registerSystem('lims',        { name: 'LIMS - نظام المختبر',    type: 'lims',    protocol: 'rest' });
        this.registerSystem('sequencer',   { name: 'محلل الجينوم',           type: 'genomics',protocol: 'internal' });
        this.registerSystem('hpc-link',    { name: 'رابط HPC',               type: 'compute', protocol: 'ssh' });
        this.registerSystem('ai-pathology',{ name: 'ذكاء اصطناعي - أمراض',  type: 'ai',      protocol: 'internal' });
        this.registerSystem('drug-design', { name: 'تصميم الأدوية AI',       type: 'ai',      protocol: 'internal' });
        this.registerSystem('imaging-ai',  { name: 'تحليل الأشعة AI',        type: 'ai',      protocol: 'dicom' });

        // دراسات بحثية أساسية
        this.createStudy('prophetic-efficacy', {
            title:   'دراسة الفاعلية العلمية للطب النبوي',
            type:    'experimental',
            domain:  'prophetic-medicine',
            aiAssisted: true,
            propheticCorrelation: true,
        });
        this.createStudy('ai-diagnostics-accuracy', {
            title:   'دقة الذكاء الصناعي في التشخيص المبكر',
            type:    'observational',
            domain:  'ai-diagnostics',
            aiAssisted: true,
        });
        this.createStudy('genomics-saudi', {
            title:   'الجينوم السعودي الخليجي — قاعدة بيانات وراثية',
            type:    'observational',
            domain:  'genomics',
            hpcRequired: true,
        });

        // تجارب سريرية
        this.createTrial('black-seed-cancer', {
            title:   'ثيموكينون الحبة السوداء في علاج الأورام',
            phase:   'II',
            drug:    'thymoquinone',
            disease: 'cancer',
            irbApproved: true,
        });
    }
}

// ─── Emergency & Telemedicine ─────────────────────────────────────────────────

class EmergencySystem extends HealthcareAdapter {
    constructor() {
        super('emergency', 'الإسعاف والطوارئ الطبية');
        this._ambulances = new Map();
        this._incidents  = new Map();
        this._teleVisits = new Map();
    }

    dispatchAmbulance(incidentId, location) {
        const incident = {
            id:         incidentId,
            location,
            dispatchedAt: new Date().toISOString(),
            status:     'en-route',
            etaMin:     Math.floor(Math.random() * 8 + 5),
        };
        this._incidents.set(incidentId, incident);
        this.emit('ambulance:dispatched', incident);
        console.log(`[emergency] 🚑 إسعاف مُرسَل: ${incidentId} → ETA ${incident.etaMin} دقيقة`);
        return incident;
    }

    createTeleVisit(patientId, doctorId, reason) {
        const visit = {
            id:        crypto.randomBytes(4).toString('hex'),
            patientId,
            doctorId,
            reason,
            status:    'waiting',
            startedAt: null,
            createdAt: new Date().toISOString(),
        };
        this._teleVisits.set(visit.id, visit);
        return visit;
    }

    async init() {
        await super.init();
        this.registerSystem('cad',        { name: 'CAD - الإرسال المعزز',  type: 'cad',   protocol: 'rest' });
        this.registerSystem('gps-fleet',  { name: 'تتبع الأسطول',          type: 'gps',   protocol: 'mqtt' });
        this.registerSystem('tele-med',   { name: 'الطب عن بُعد',          type: 'video', protocol: 'webrtc' });
        this.registerSystem('vitals-iot', { name: 'قياسات حيوية IoT',      type: 'iot',   protocol: 'mqtt' });
    }
}

// ─── Public Health & Epidemiology ─────────────────────────────────────────────

class PublicHealthSystem extends HealthcareAdapter {
    constructor() {
        super('public-health', 'الصحة العامة والوبائيات');
        this._diseases   = new Map();
        this._outbreaks  = new Map();
        this._vaccinations = new Map();
    }

    trackDisease(id, data = {}) {
        const disease = {
            id,
            name:           data.name          || id,
            type:           data.type          || 'infectious',
            riskLevel:      data.riskLevel     || 'low',  // low | moderate | high | critical
            cases:          data.cases         || 0,
            deaths:         data.deaths        || 0,
            recovered:      data.recovered     || 0,
            regions:        data.regions       || [],
            aiPrediction:   null,
            quarantineRule: data.quarantineRule || null,
            updatedAt:      new Date().toISOString(),
        };
        this._diseases.set(id, disease);
        return disease;
    }

    aiEpidemicForecast(diseaseId) {
        const disease = this._diseases.get(diseaseId);
        if (!disease) return null;
        // In production: SIR/SEIR model with ML
        return {
            diseaseId,
            forecastDays:   14,
            projectedCases: disease.cases * 1.15,
            confidence:     0.78,
            interventions:  ['تطعيم فوري', 'عزل صحي', 'رفع الوعي'],
            note:           'التوكل على الله والأخذ بالأسباب الطبية الصحيحة',
            generatedAt:    new Date().toISOString(),
        };
    }

    async init() {
        await super.init();
        this.registerSystem('epi-tracker', { name: 'نظام تتبع الأوبئة',    type: 'surveillance', protocol: 'rest' });
        this.registerSystem('who-link',    { name: 'رابط منظمة الصحة',     type: 'integration',  protocol: 'rest' });
        this.registerSystem('vacc-mgmt',   { name: 'إدارة التطعيمات',       type: 'registry',     protocol: 'hl7' });
        this.registerSystem('ai-forecast', { name: 'توقعات الأوبئة AI',    type: 'ai',           protocol: 'internal' });
    }
}

// ─── Healthcare Manager ───────────────────────────────────────────────────────

class HealthcareManager {
    constructor() {
        this.hospital       = new HospitalSystem('مستشفى شيخة المركزي');
        this.pharmacy       = new PharmacySystem();
        this.research       = new MedicalResearchCenter();
        this.emergency      = new EmergencySystem();
        this.publicHealth   = new PublicHealthSystem();
        this.principles     = PROPHETIC_MEDICINE_PRINCIPLES;
    }

    snapshot() {
        return {
            hospital:     this.hospital.snapshot(),
            pharmacy:     this.pharmacy.snapshot(),
            research:     this.research.snapshot(),
            emergency:    this.emergency.snapshot(),
            publicHealth: this.publicHealth.snapshot(),
        };
    }

    async initAll() {
        console.log('[HEALTHCARE] 🏥 تهيئة المنظومة الصحية الكاملة...');
        console.log('[HEALTHCARE] 📖 "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ" — الشعراء ٨٠');
        await this.hospital.init();
        await this.pharmacy.init();
        await this.research.init();
        await this.emergency.init();
        await this.publicHealth.init();
        console.log('[HEALTHCARE] ✅ المنظومة الصحية جاهزة بالكامل');
        return this.snapshot();
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

const healthcareManager = new HealthcareManager();

module.exports = {
    PROPHETIC_MEDICINE_PRINCIPLES,
    HealthcareAdapter,
    HospitalSystem,
    PharmacySystem,
    MedicalResearchCenter,
    EmergencySystem,
    PublicHealthSystem,
    HealthcareManager,
    healthcare: healthcareManager,
    initAll:    () => healthcareManager.initAll(),
};
