/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      lib/domains/index.js                                   ║
 * ║     محوّلات القطاعات الصناعية والفضائية والبحثية والتعليمية                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم" — الأنبياء ٨٠
 * "وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ" — الذاريات ٢٢
 *
 * القطاعات المدعومة:
 *
 * ① صناعي   — مصانع | مصاهر | تعدين | تصنيع
 * ② فضائي   — أقمار صناعية | مركبات فضائية | رادار | ملاحة
 * ③ طيران   — طائرات مدنية/مسيّرة | برج مراقبة | رحلات
 * ④ بحري    — سفن | موانئ | ملاحة بحرية | صيد
 * ⑤ بتروكيماويات — نفط | غاز | تكرير | مشتقات
 * ⑥ نووي مدني — مفاعلات طاقة | بحث نووي (سلمي)
 * ⑦ دفاع مدني — حماية مدنية | طوارئ | استجابة كوارث
 * ⑧ بحث وتطوير — مراكز R&D | جامعات | معامل
 * ⑨ تعليم   — مدارس | كليات | تدريب مهني
 * ⑩ رعاية صحية — مستشفيات | صيدلة | تشخيص AI
 * ⑪ بنية تحتية ذكية — مدن | شبكات | نقل
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── Domain IDs ───────────────────────────────────────────────────────────────

const DOMAINS = {
    INDUSTRIAL:    'industrial',
    SPACE:         'space',
    AVIATION:      'aviation',
    MARITIME:      'maritime',
    PETROCHEMICAL: 'petrochemical',
    NUCLEAR_CIVIL: 'nuclear-civil',
    CIVIL_DEFENSE: 'civil-defense',
    RESEARCH:      'research',
    EDUCATION:     'education',
    HEALTHCARE:    'healthcare',
    SMART_CITY:    'smart-city',
};

// ─── Base Domain Adapter ──────────────────────────────────────────────────────

class DomainAdapter extends EventEmitter {
    constructor(domainId, displayName) {
        super();
        this.domainId    = domainId;
        this.displayName = displayName;
        this._systems    = new Map();
        this._telemetry  = [];
        this._alerts     = [];
        this.activatedAt = null;
        this.status_     = 'dormant';
    }

    // ─── System Registry ──────────────────────────────────────────────────

    registerSystem(id, spec = {}) {
        this._systems.set(id, {
            id,
            name:        spec.name       || id,
            type:        spec.type       || 'generic',
            status:      spec.status     || 'offline',
            protocol:    spec.protocol   || 'internal',
            endpoint:    spec.endpoint   || null,
            meta:        spec.meta       || {},
            registeredAt: new Date().toISOString(),
        });
        console.log(`[${this.domainId}] 🔧 نظام مسجّل: ${id}`);
        return this._systems.get(id);
    }

    getSystem(id) { return this._systems.get(id) || null; }
    systemList()  { return Array.from(this._systems.values()); }

    // ─── Telemetry ────────────────────────────────────────────────────────

    pushTelemetry(systemId, data) {
        const entry = { systemId, data, timestamp: new Date().toISOString() };
        this._telemetry.push(entry);
        if (this._telemetry.length > 5000) this._telemetry.shift();
        this.emit('telemetry', entry);
        return entry;
    }

    latestTelemetry(systemId, limit = 10) {
        return this._telemetry
            .filter(t => t.systemId === systemId)
            .slice(-limit);
    }

    // ─── Alerts ───────────────────────────────────────────────────────────

    raiseAlert(systemId, level, message) {
        const alert = {
            id:        crypto.randomBytes(4).toString('hex'),
            systemId,
            level,     // info | warning | critical
            message,
            raisedAt:  new Date().toISOString(),
            resolved:  false,
        };
        this._alerts.push(alert);
        this.emit('alert', alert);
        console.log(`[${this.domainId}] ${level === 'critical' ? '🚨' : '⚠️'} ${message}`);
        return alert;
    }

    resolveAlert(alertId) {
        const alert = this._alerts.find(a => a.id === alertId);
        if (alert) { alert.resolved = true; alert.resolvedAt = new Date().toISOString(); }
    }

    activeAlerts() { return this._alerts.filter(a => !a.resolved); }

    // ─── Command ──────────────────────────────────────────────────────────

    async sendCommand(systemId, command, payload = {}) {
        const system = this.getSystem(systemId);
        if (!system) return { ok: false, error: `النظام "${systemId}" غير موجود` };
        // In production: dispatch to actual system via protocol
        const result = {
            ok:       true,
            systemId,
            command,
            response: `[محاكاة] نظام ${system.name} استقبل: ${command}`,
            sentAt:   new Date().toISOString(),
        };
        this.emit('command:sent', result);
        return result;
    }

    // ─── Domain Status ────────────────────────────────────────────────────

    snapshot() {
        return {
            domain:       this.domainId,
            name:         this.displayName,
            status:       this.status_,
            systems:      this._systems.size,
            activeSystems: Array.from(this._systems.values()).filter(s => s.status === 'online').length,
            alerts:       this.activeAlerts().length,
            telemetry:    this._telemetry.length,
        };
    }

    async init() {
        this.activatedAt = new Date().toISOString();
        this.status_     = 'active';
        console.log(`[${this.domainId}] ✅ ${this.displayName} جاهز`);
    }
}

// ─── ① Industrial Domain ─────────────────────────────────────────────────────

class IndustrialDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.INDUSTRIAL, 'القطاع الصناعي');
        this._productionLines = new Map();
    }

    addProductionLine(id, spec = {}) {
        const line = {
            id,
            name:        spec.name     || `خط إنتاج ${id}`,
            type:        spec.type     || 'assembly', // assembly | smelting | casting | machining
            capacity:    spec.capacity || 100,        // units/hour
            status:      'offline',
            oee:         0,  // Overall Equipment Effectiveness %
            startedAt:   null,
        };
        this._productionLines.set(id, line);
        return line;
    }

    startLine(id) {
        const line = this._productionLines.get(id);
        if (!line) return { ok: false, error: 'الخط غير موجود' };
        line.status    = 'running';
        line.startedAt = new Date().toISOString();
        line.oee       = Math.floor(Math.random() * 20 + 78); // 78-98%
        this.pushTelemetry(id, { oee: line.oee, capacity: line.capacity, status: 'running' });
        console.log(`[industrial] 🏭 خط إنتاج: ${line.name} — بدأ (OEE: ${line.oee}%)`);
        return { ok: true, line };
    }

    async init() {
        await super.init();
        this.registerSystem('plc-main',   { name: 'PLC الرئيسي', type: 'plc',      protocol: 'modbus' });
        this.registerSystem('scada',      { name: 'SCADA',       type: 'scada',    protocol: 'opc-ua' });
        this.registerSystem('mes',        { name: 'MES',         type: 'mes',      protocol: 'rest' });
        this.registerSystem('erp-link',   { name: 'ERP رابط',    type: 'erp',      protocol: 'rest' });
        this.registerSystem('quality-ai', { name: 'جودة AI',     type: 'ai-vision',protocol: 'internal' });
    }
}

// ─── ② Space Domain ──────────────────────────────────────────────────────────

class SpaceDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.SPACE, 'قطاع الفضاء والأقمار الصناعية');
        this._satellites     = new Map();
        this._spacecraft     = new Map();
        this._groundStations = new Map();
        this._missions       = new Map();
    }

    // ─── Satellites ───────────────────────────────────────────────────────

    registerSatellite(id, spec = {}) {
        const sat = {
            id,
            name:        spec.name         || `SAT-${id}`,
            type:        spec.type         || 'earth-observation',
            // types: earth-observation | comm | nav | weather | scientific | spy(blocked)
            orbit:       spec.orbit        || 'LEO', // LEO | MEO | GEO | HEO
            altitudeKm:  spec.altitudeKm   || 550,
            inclination: spec.inclination  || 97.6,
            period:      spec.period       || 95.5,  // minutes
            status:      'operational',
            health:      100,
            downlink:    spec.downlink     || 'X-band',
            payload:     spec.payload      || [],
            launchedAt:  spec.launchedAt   || null,
        };
        this._satellites.set(id, sat);
        console.log(`[space] 🛰  قمر صناعي مسجّل: ${sat.name} (${sat.orbit} @ ${sat.altitudeKm}km)`);
        return sat;
    }

    getSatellite(id) { return this._satellites.get(id) || null; }

    telemetrySatellite(id) {
        const sat = this._satellites.get(id);
        if (!sat) return null;
        const telemetry = {
            id,
            timestamp:      new Date().toISOString(),
            altitude:       sat.altitudeKm + (Math.random() - 0.5) * 0.5,
            velocity:       7.66 + (Math.random() - 0.5) * 0.01, // km/s (LEO typical)
            batteryPct:     Math.floor(Math.random() * 15 + 85),
            temperature:    Math.floor(Math.random() * 40 - 20),  // °C
            signalStrength: Math.floor(Math.random() * 10 + 90),  // dBm
            health:         sat.health,
        };
        this.pushTelemetry(id, telemetry);
        return telemetry;
    }

    // ─── Spacecraft ───────────────────────────────────────────────────────

    registerSpacecraft(id, spec = {}) {
        const sc = {
            id,
            name:       spec.name       || `SC-${id}`,
            type:       spec.type       || 'probe', // probe | lander | rover | crew | cargo
            mission:    spec.mission    || null,
            status:     'on-ground',    // on-ground | launched | transit | orbital | landed
            position:   spec.position   || { x: 0, y: 0, z: 0 }, // AU
            velocity:   spec.velocity   || { vx: 0, vy: 0, vz: 0 }, // km/s
            propellant: spec.propellant || 100, // %
        };
        this._spacecraft.set(id, sc);
        console.log(`[space] 🚀 مركبة فضائية: ${sc.name} (${sc.type})`);
        return sc;
    }

    // ─── Ground Stations ──────────────────────────────────────────────────

    addGroundStation(id, spec = {}) {
        const gs = {
            id,
            name:      spec.name      || `GS-${id}`,
            location:  spec.location  || { lat: 24.68, lon: 46.72, name: 'الرياض' },
            antennas:  spec.antennas  || 1,
            bands:     spec.bands     || ['S-band', 'X-band'],
            status:    'operational',
        };
        this._groundStations.set(id, gs);
        console.log(`[space] 📡 محطة أرضية: ${gs.name} (${gs.location.name})`);
        return gs;
    }

    // ─── Mission Planning ─────────────────────────────────────────────────

    createMission(id, spec = {}) {
        const mission = {
            id,
            name:        spec.name       || `Mission-${id}`,
            type:        spec.type       || 'earth-observation',
            objective:   spec.objective  || '',
            spacecraft:  spec.spacecraft || [],
            startDate:   spec.startDate  || null,
            endDate:     spec.endDate    || null,
            status:      'planning',
            milestones:  [],
        };
        this._missions.set(id, mission);
        console.log(`[space] 🌌 مهمة فضائية: ${mission.name}`);
        return mission;
    }

    async init() {
        await super.init();

        // أنظمة أساسية
        this.registerSystem('mission-control', { name: 'مركز التحكم', type: 'mcc', protocol: 'internal' });
        this.registerSystem('nav-system',      { name: 'نظام الملاحة', type: 'nav', protocol: 'gnss' });
        this.registerSystem('telemetry-hub',   { name: 'مركز القياس', type: 'telemetry', protocol: 'rf' });
        this.registerSystem('trajectory',      { name: 'حساب المسار', type: 'computation', protocol: 'internal' });

        // قمر صناعي اختباري
        this.registerSatellite('SAT-001', {
            name:       'شيخة-١',
            type:       'earth-observation',
            orbit:      'LEO',
            altitudeKm: 550,
            payload:    ['multispectral-camera', 'sar-radar'],
        });

        // محطة أرضية
        this.addGroundStation('GS-RIYADH', {
            name:     'الرياض',
            location: { lat: 24.68, lon: 46.72, name: 'الرياض' },
        });
    }
}

// ─── ③ Aviation Domain ────────────────────────────────────────────────────────

class AviationDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.AVIATION, 'قطاع الطيران والملاحة الجوية');
        this._flights  = new Map();
        this._aircraft = new Map();
        this._drones   = new Map();
    }

    registerAircraft(id, spec = {}) {
        const ac = {
            id,
            registration: spec.registration || id,
            type:         spec.type         || 'commercial', // commercial | cargo | military | private | uav
            model:        spec.model        || 'Boeing 737',
            status:       'grounded',
            position:     { lat: 0, lon: 0, altFt: 0 },
            speed:        0,
            heading:      0,
            flightPlan:   null,
        };
        this._aircraft.set(id, ac);
        return ac;
    }

    registerDrone(id, spec = {}) {
        const drone = {
            id,
            name:     spec.name    || `UAV-${id}`,
            type:     spec.type    || 'fixed-wing',  // fixed-wing | quadrotor | vtol
            payload:  spec.payload || [],
            range:    spec.range   || 100,           // km
            endurance: spec.endurance || 60,          // minutes
            status:   'grounded',
            autonomy: spec.autonomy || 'semi-auto',
        };
        this._drones.set(id, drone);
        console.log(`[aviation] ✈️  UAV مسجّل: ${drone.name}`);
        return drone;
    }

    async init() {
        await super.init();
        this.registerSystem('atc',        { name: 'برج المراقبة', type: 'atc',  protocol: 'asterix' });
        this.registerSystem('fms',        { name: 'FMS', type: 'fms', protocol: 'arinc' });
        this.registerSystem('ads-b',      { name: 'ADS-B', type: 'surveillance', protocol: 'ads-b' });
        this.registerSystem('metar',      { name: 'طقس جوي', type: 'weather',  protocol: 'rest' });
        this.registerSystem('uav-ctrl',   { name: 'تحكم UAV', type: 'gcs',    protocol: 'mavlink' });
    }
}

// ─── ④ Maritime Domain ────────────────────────────────────────────────────────

class MaritimeDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.MARITIME, 'قطاع الملاحة البحرية والسفن');
        this._vessels = new Map();
        this._ports   = new Map();
        this._routes  = new Map();
    }

    registerVessel(id, spec = {}) {
        const vessel = {
            id,
            name:     spec.name    || `VESSEL-${id}`,
            type:     spec.type    || 'cargo', // cargo | tanker | container | passenger | naval | research
            imo:      spec.imo     || null,
            mmsi:     spec.mmsi    || null,
            flagState: spec.flag   || 'SA',
            length:   spec.length  || 200, // meters
            dwt:      spec.dwt     || 50000,
            status:   'at-anchor',
            position: { lat: 0, lon: 0 },
            speed:    0,
            heading:  0,
            ais:      true,
        };
        this._vessels.set(id, vessel);
        console.log(`[maritime] ⛴  سفينة مسجّلة: ${vessel.name} (${vessel.type})`);
        return vessel;
    }

    addPort(id, spec = {}) {
        const port = {
            id,
            name:     spec.name    || `PORT-${id}`,
            country:  spec.country || 'SA',
            position: spec.position || { lat: 24.4, lon: 56.6 },
            type:     spec.type    || 'commercial',
            berths:   spec.berths  || 10,
            capacity: spec.capacity || 1000000, // TEU
        };
        this._ports.set(id, port);
        console.log(`[maritime] 🚢 ميناء: ${port.name}`);
        return port;
    }

    async init() {
        await super.init();
        this.registerSystem('vts',         { name: 'VTS - خدمات حركة السفن', type: 'vts', protocol: 'vhf' });
        this.registerSystem('ais-receiver',{ name: 'AIS', type: 'ais', protocol: 'nmea' });
        this.registerSystem('ecdis',       { name: 'ECDIS', type: 'nav-chart', protocol: 'nmea' });
        this.registerSystem('weather-marine', { name: 'طقس بحري', type: 'weather', protocol: 'rest' });

        // ميناء
        this.addPort('JEDDAH', { name: 'ميناء جدة الإسلامي', country: 'SA', position: { lat: 21.49, lon: 39.17 } });
        this.addPort('JUBAIL',  { name: 'ميناء الجبيل الصناعي', country: 'SA', position: { lat: 27.01, lon: 49.66 } });
    }
}

// ─── ⑤ Petrochemical Domain ───────────────────────────────────────────────────

class PetrochemicalDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.PETROCHEMICAL, 'قطاع البتروكيماويات والطاقة');
        this._plants = new Map();
    }

    addPlant(id, spec = {}) {
        const plant = {
            id,
            name:     spec.name    || `Plant-${id}`,
            type:     spec.type    || 'refinery', // refinery | cracker | polymer | gas | lng
            capacity: spec.capacity || 100000,     // bbl/day or tons/year
            status:   'operational',
            safetyLevel: 100,
        };
        this._plants.set(id, plant);
        console.log(`[petrochemical] 🏭 منشأة: ${plant.name} (${plant.type})`);
        return plant;
    }

    async init() {
        await super.init();
        this.registerSystem('dcs',        { name: 'DCS - نظام التحكم الموزع', type: 'dcs', protocol: 'hart' });
        this.registerSystem('safety-sis', { name: 'SIS - نظام السلامة', type: 'sis', protocol: 'foundation-fieldbus' });
        this.registerSystem('lims',       { name: 'LIMS - معمل', type: 'lims', protocol: 'rest' });
        this.registerSystem('flare',      { name: 'نظام الشعلة', type: 'safety', protocol: 'modbus' });
        this.registerSystem('pipeline',   { name: 'خطوط الأنابيب', type: 'scada', protocol: 'opc-ua' });
    }
}

// ─── ⑥ Nuclear Civil Domain ───────────────────────────────────────────────────

class NuclearCivilDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.NUCLEAR_CIVIL, 'الطاقة النووية المدنية');
        // Policy: مدني فقط — لا ضرر ولا ضرار
        this.policy = {
            civilianOnly:      true,
            prohibitedUses:    ['weapons', 'military-grade', 'weapons-grade-enrichment'],
            allowedUses:       ['power-generation', 'research', 'medical-isotopes', 'desalination'],
            iaeaCompliant:     true,
            nonproliferationAgreement: true,
        };
    }

    async init() {
        await super.init();
        console.log(`[nuclear-civil] ⚠️  السياسة: مدني فقط — ملتزم بـ IAEA`);
        this.registerSystem('reactor-core',   { name: 'نواة المفاعل', type: 'reactor', protocol: 'internal' });
        this.registerSystem('safety-system',  { name: 'نظام السلامة SCRAM', type: 'safety', protocol: 'hardwired' });
        this.registerSystem('coolant-loop',   { name: 'نظام التبريد', type: 'cooling', protocol: 'modbus' });
        this.registerSystem('radiation-mon',  { name: 'مراقبة الإشعاع', type: 'safety', protocol: 'can' });
        this.registerSystem('turbine',        { name: 'التوربين', type: 'generation', protocol: 'opc-ua' });
    }
}

// ─── ⑦ Research Domain ───────────────────────────────────────────────────────

class ResearchDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.RESEARCH, 'مراكز البحث والتطوير');
        this._labs       = new Map();
        this._projects   = new Map();
        this._papers     = [];
    }

    addLab(id, spec = {}) {
        const lab = {
            id,
            name:        spec.name        || `Lab-${id}`,
            focus:       spec.focus       || 'general',
            researchers: spec.researchers || 0,
            budget:      spec.budget      || 0,
            hpcAccess:   spec.hpcAccess   || false,
            aiTools:     spec.aiTools     || false,
        };
        this._labs.set(id, lab);
        console.log(`[research] 🔬 مختبر: ${lab.name} — ${lab.focus}`);
        return lab;
    }

    addProject(id, spec = {}) {
        const project = {
            id,
            title:      spec.title      || `مشروع ${id}`,
            domain:     spec.domain     || 'general',
            status:     'active',
            startDate:  spec.startDate  || new Date().toISOString().slice(0, 10),
            endDate:    spec.endDate    || null,
            milestones: [],
            publications: [],
        };
        this._projects.set(id, project);
        return project;
    }

    async init() {
        await super.init();
        this.registerSystem('lims',       { name: 'نظام المعمل', type: 'lims', protocol: 'rest' });
        this.registerSystem('hpc-access', { name: 'الحاسوب الفائق', type: 'compute', protocol: 'ssh' });
        this.registerSystem('collab',     { name: 'تعاون بحثي', type: 'collab', protocol: 'rest' });
        this.registerSystem('data-repo',  { name: 'مستودع البيانات', type: 'storage', protocol: 's3' });

        // مختبرات أساسية
        this.addLab('AI-LAB',    { name: 'مختبر الذكاء الصناعي', focus: 'ai', aiTools: true, hpcAccess: true });
        this.addLab('SPACE-LAB', { name: 'مختبر الفضاء',         focus: 'space', hpcAccess: true });
        this.addLab('ENERGY-LAB',{ name: 'مختبر الطاقة',         focus: 'energy', hpcAccess: true });
        this.addLab('BIO-LAB',   { name: 'مختبر البيولوجيا',     focus: 'biotech' });
    }
}

// ─── ⑧ Education Domain ──────────────────────────────────────────────────────

class EducationDomain extends DomainAdapter {
    constructor() {
        super(DOMAINS.EDUCATION, 'منظومة التعليم والتدريب');
        this._institutions = new Map();
        this._courses      = new Map();
        this._learners     = new Map();
    }

    addInstitution(id, spec = {}) {
        const inst = {
            id,
            name:     spec.name     || `Institution-${id}`,
            type:     spec.type     || 'university', // university | college | school | vocational | online
            level:    spec.level    || 'higher',
            capacity: spec.capacity || 5000,
            online:   spec.online   || true,
            aiTutor:  spec.aiTutor  || false,
        };
        this._institutions.set(id, inst);
        console.log(`[education] 🎓 مؤسسة: ${inst.name} (${inst.type})`);
        return inst;
    }

    async init() {
        await super.init();
        this.registerSystem('lms',        { name: 'نظام LMS', type: 'lms', protocol: 'rest' });
        this.registerSystem('ai-tutor',   { name: 'المعلم الذكي', type: 'ai', protocol: 'internal' });
        this.registerSystem('assessment', { name: 'التقييم', type: 'assessment', protocol: 'rest' });
        this.registerSystem('content-gen',{ name: 'توليد المحتوى', type: 'ai', protocol: 'internal' });
    }
}

// ─── Domain Manager ───────────────────────────────────────────────────────────

class DomainManager {
    constructor() {
        this._domains = new Map();
        this._registerBuiltins();
    }

    _registerBuiltins() {
        const builtins = [
            new IndustrialDomain(),
            new SpaceDomain(),
            new AviationDomain(),
            new MaritimeDomain(),
            new PetrochemicalDomain(),
            new NuclearCivilDomain(),
            new ResearchDomain(),
            new EducationDomain(),
        ];
        builtins.forEach(d => this._domains.set(d.domainId, d));
    }

    getDomain(id) { return this._domains.get(id) || null; }
    allDomains()  { return Array.from(this._domains.values()); }

    snapshot() {
        const snaps = {};
        this._domains.forEach((d, id) => { snaps[id] = d.snapshot(); });
        return snaps;
    }

    async initAll() {
        console.log('[DOMAINS] 🌐 تهيئة جميع القطاعات...');
        for (const domain of this._domains.values()) {
            await domain.init();
        }
        console.log(`[DOMAINS] ✅ جميع القطاعات جاهزة (${this._domains.size})`);
        return this.snapshot();
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

const domainManager = new DomainManager();

module.exports = {
    DOMAINS,
    DomainAdapter,
    IndustrialDomain,
    SpaceDomain,
    AviationDomain,
    MaritimeDomain,
    PetrochemicalDomain,
    NuclearCivilDomain,
    ResearchDomain,
    EducationDomain,
    DomainManager,
    domains: domainManager,
    initAll: () => domainManager.initAll(),
};
