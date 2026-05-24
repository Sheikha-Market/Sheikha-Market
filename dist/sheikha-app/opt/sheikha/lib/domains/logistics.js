/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     lib/domains/logistics.js                                ║
 * ║  سلاسل الإمداد والتوريد الكاملة — سفن | طائرات | نفاثات | فضاء | شاحنات   ║
 * ║              قاطرات | موانئ | مطارات | لوجستيات متكاملة                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَلَهُ الْجَوَارِ الْمُنشَآتُ فِي الْبَحْرِ كَالْأَعْلَامِ" — الرحمن ٢٤
 * "وَهُوَ الَّذِي سَخَّرَ الْبَحْرَ لِتَأْكُلُوا مِنْهُ لَحْمًا طَرِيًّا" — النحل ١٤
 * "وَالْخَيْلَ وَالْبِغَالَ وَالْحَمِيرَ لِتَرْكَبُوهَا وَزِينَةً" — النحل ٨
 * "أَوَلَمْ يَرَوْا أَنَّا خَلَقْنَا لَهُم مِّمَّا عَمِلَتْ أَيْدِينَا أَنْعَامًا" — يس ٧١
 *
 * المنظومة اللوجستية الشاملة:
 *  ① سلسلة الإمداد والتوريد الذكية (SCM)
 *  ② أسطول السفن التجارية والبحرية
 *  ③ أسطول الطائرات والنفاثات
 *  ④ سفن الفضاء ومركبات الإطلاق
 *  ⑤ شبكة الشاحنات والمركبات الثقيلة
 *  ⑥ القاطرات والسكك الحديدية
 *  ⑦ الموانئ ومراكز الشحن
 *  ⑧ المطارات وبنية الطيران
 *  ⑨ مراكز التوزيع والمستودعات
 *  ⑩ النظام اللوجستي للفضاء
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── Quranic Foundation ───────────────────────────────────────────────────────

const LOGISTICS_QURAN_FOUNDATION = {
    sea:   'وَلَهُ الْجَوَارِ الْمُنشَآتُ فِي الْبَحْرِ كَالْأَعْلَامِ — الرحمن:٢٤',
    land:  'وَالْخَيْلَ وَالْبِغَالَ وَالْحَمِيرَ لِتَرْكَبُوهَا — النحل:٨',
    trade: 'لِتَبْتَغُوا مِن فَضْلِهِ — النحل:١٤',
    sky:   'وَلَوْ شَاءَ اللَّهُ لَجَعَلَكُمْ أُمَّةً وَاحِدَةً — النحل:٩٣',
};

// ─── Vehicle Status ───────────────────────────────────────────────────────────

const VEHICLE_STATUS = {
    GROUNDED:      'grounded',
    OPERATIONAL:   'operational',
    IN_TRANSIT:    'in-transit',
    MAINTENANCE:   'maintenance',
    DECOMMISSIONED:'decommissioned',
};

// ─── Base Fleet Manager ───────────────────────────────────────────────────────

class FleetManager extends EventEmitter {
    constructor(fleetType) {
        super();
        this.fleetType  = fleetType;
        this._vehicles  = new Map();
        this._missions  = new Map();
        this._telemetry = [];
    }

    register(id, spec = {}) {
        const vehicle = {
            id,
            name:         spec.name         || id,
            type:         spec.type         || this.fleetType,
            model:        spec.model        || 'Generic',
            status:       spec.status       || VEHICLE_STATUS.GROUNDED,
            position:     spec.position     || { lat: 0, lon: 0, alt: 0 },
            speed:        0,
            heading:      0,
            fuelPct:      100,
            payloadKg:    spec.payloadKg    || 0,
            maxPayloadKg: spec.maxPayloadKg || 1000,
            maxSpeedKmh:  spec.maxSpeedKmh  || spec.maxSpeedKt || 0,
            operator:     spec.operator     || null,
            mission:      null,
            registeredAt: new Date().toISOString(),
            meta:         spec.meta         || {},
        };
        this._vehicles.set(id, vehicle);
        console.log(`[${this.fleetType}] ✅ مُسجَّل: ${vehicle.name}`);
        return vehicle;
    }

    get(id)     { return this._vehicles.get(id) || null; }
    all()       { return Array.from(this._vehicles.values()); }
    count()     { return this._vehicles.size; }
    operational(){ return this.all().filter(v => v.status === VEHICLE_STATUS.OPERATIONAL); }

    updatePosition(id, position) {
        const v = this._vehicles.get(id);
        if (!v) return;
        v.position = { ...v.position, ...position };
        v.status   = VEHICLE_STATUS.IN_TRANSIT;
        const t    = { vehicleId: id, position: v.position, timestamp: new Date().toISOString() };
        this._telemetry.push(t);
        if (this._telemetry.length > 10000) this._telemetry.shift();
        this.emit('position:updated', t);
        return v;
    }

    createMission(vehicleId, spec = {}) {
        const v = this._vehicles.get(vehicleId);
        if (!v) return null;
        const mission = {
            id:          crypto.randomBytes(4).toString('hex'),
            vehicleId,
            type:        spec.type        || 'transport',
            origin:      spec.origin      || null,
            destination: spec.destination || null,
            cargo:       spec.cargo       || null,
            priority:    spec.priority    || 'normal',
            status:      'assigned',
            eta:         spec.eta         || null,
            createdAt:   new Date().toISOString(),
        };
        v.mission = mission.id;
        v.status  = VEHICLE_STATUS.OPERATIONAL;
        this._missions.set(mission.id, mission);
        this.emit('mission:created', mission);
        console.log(`[${this.fleetType}] 📋 مهمة: ${mission.id} → ${spec.destination || 'Unknown'}`);
        return mission;
    }

    summary() {
        const all = this.all();
        return {
            fleet:        this.fleetType,
            total:        all.length,
            operational:  all.filter(v => v.status === VEHICLE_STATUS.OPERATIONAL).length,
            inTransit:    all.filter(v => v.status === VEHICLE_STATUS.IN_TRANSIT).length,
            maintenance:  all.filter(v => v.status === VEHICLE_STATUS.MAINTENANCE).length,
            missions:     this._missions.size,
        };
    }
}

// ─── ① Maritime Fleet ─────────────────────────────────────────────────────────

class MaritimeFleet extends FleetManager {
    constructor() {
        super('maritime-fleet');
        this._ports   = new Map();
        this._routes  = new Map();
        this._aisData = new Map();
    }

    registerVessel(id, spec = {}) {
        return this.register(id, {
            ...spec,
            type:         spec.type         || 'container',
            // types: container | bulk-carrier | tanker | ro-ro | lng-carrier | cruise | research | icebreaker
            imo:          spec.imo          || null,
            mmsi:         spec.mmsi         || null,
            dwt:          spec.dwt          || 50000,    // Dead Weight Tonnage
            loa:          spec.loa          || 200,      // Length Overall (m)
            draft:        spec.draft        || 12,       // متر
            flag:         spec.flag         || 'SA',
            aisMandatory: true,
            maxSpeed:     spec.maxSpeed     || 22,       // عقدة
            maxPayloadKg: (spec.dwt || 50000) * 1000,
        });
    }

    addPort(id, spec = {}) {
        const port = {
            id,
            name:       spec.name     || id,
            country:    spec.country  || 'SA',
            unlocode:   spec.unlocode || null,
            position:   spec.position || { lat: 0, lon: 0 },
            type:       spec.type     || 'commercial',
            maxDraft:   spec.maxDraft || 15,
            berths:     spec.berths   || 10,
            TEUcapacity: spec.TEU    || 1000000,
            smartPort:  spec.smartPort || true,
            aiEnabled:  spec.aiEnabled || true,
        };
        this._ports.set(id, port);
        console.log(`[maritime-fleet] ⚓ ميناء: ${port.name} (${port.country})`);
        return port;
    }

    planRoute(origin, destination, cargoType = 'general') {
        const routeId = `${origin}-${destination}`;
        const route   = {
            id:         routeId,
            origin,
            destination,
            cargoType,
            distanceNM: Math.floor(Math.random() * 5000 + 500),
            waypoints:  [],
            aiOptimized: true,
            fuelSavingPct: Math.floor(Math.random() * 8 + 3),
        };
        this._routes.set(routeId, route);
        return route;
    }

    async init() {
        // أسطول السفن الأساسي
        this.registerVessel('SHEIKHA-001', { name: 'شيخة-١ للحاويات',    type: 'container',    dwt: 200000, loa: 400 });
        this.registerVessel('SHEIKHA-002', { name: 'شيخة-٢ للنفط الخام', type: 'tanker',       dwt: 300000, loa: 350 });
        this.registerVessel('SHEIKHA-003', { name: 'شيخة-٣ للغاز LNG',   type: 'lng-carrier',  dwt: 80000,  loa: 295 });
        this.registerVessel('SHEIKHA-R01', { name: 'شيخة-R1 للبحث',      type: 'research',     dwt: 5000,   loa: 120 });
        this.registerVessel('SHEIKHA-BK1', { name: 'شيخة-B1 للبضائع',    type: 'bulk-carrier', dwt: 180000, loa: 300 });

        // الموانئ السعودية والعالمية الرئيسية
        this.addPort('JEDDAH',    { name: 'جدة الإسلامي',      country: 'SA', unlocode: 'SAJED', position: { lat: 21.49, lon: 39.17 }, TEU: 5600000 });
        this.addPort('JUBAIL',    { name: 'الجبيل الصناعي',    country: 'SA', unlocode: 'SAJUB', position: { lat: 27.01, lon: 49.66 }, TEU: 1200000 });
        this.addPort('DAMMAM',    { name: 'الدمام الملك فهد',  country: 'SA', unlocode: 'SADMM', position: { lat: 26.43, lon: 50.10 }, TEU: 2000000 });
        this.addPort('YANBU',     { name: 'ينبع الصناعي',      country: 'SA', unlocode: 'SAYNB', position: { lat: 24.09, lon: 38.06 }, TEU: 800000  });
        this.addPort('ROTTERDAM', { name: 'روتردام',            country: 'NL', unlocode: 'NLRTM', position: { lat: 51.92, lon: 4.47  }, TEU: 14800000 });
        this.addPort('SINGAPORE', { name: 'سنغافورة',           country: 'SG', unlocode: 'SGSIN', position: { lat: 1.26,  lon: 103.82}, TEU: 36200000 });
        this.addPort('SHANGHAI',  { name: 'شنغهاي',             country: 'CN', unlocode: 'CNSHA', position: { lat: 31.23, lon: 121.47}, TEU: 47300000 });

        console.log(`[maritime-fleet] ✅ الأسطول البحري جاهز — ${this.count()} سفينة | ${this._ports.size} ميناء`);
    }
}

// ─── ② Aviation & Jets Fleet ─────────────────────────────────────────────────

class AviationFleet extends FleetManager {
    constructor() {
        super('aviation-fleet');
        this._airports  = new Map();
        this._flightPlans = new Map();
    }

    registerAircraft(id, spec = {}) {
        return this.register(id, {
            ...spec,
            type:           spec.type          || 'commercial-jet',
            // commercial-jet | cargo-jet | supersonic | private-jet | fighter-transport | tanker-aircraft | uav | vtol | helicopter
            registration:   spec.registration  || id,
            icaoType:       spec.icaoType       || 'B738',
            maxRangeKm:     spec.maxRangeKm     || 5000,
            maxAltitudeFt:  spec.maxAltitudeFt  || 41000,
            cruiseSpeedKt:  spec.cruiseSpeedKt  || 450,
            maxPayloadKg:   spec.maxPayloadKg   || 20000,
            engines:        spec.engines        || { count: 2, type: 'turbofan' },
            iataCode:       spec.iataCode       || null,
            smartCockpit:   spec.smartCockpit   || true,
            aiCopilot:      spec.aiCopilot      || false,
        });
    }

    addAirport(id, spec = {}) {
        const airport = {
            id,
            name:       spec.name       || id,
            icao:       spec.icao       || null,
            iata:       spec.iata       || null,
            country:    spec.country    || 'SA',
            position:   spec.position   || { lat: 0, lon: 0, elevFt: 0 },
            runways:    spec.runways    || 2,
            terminals:  spec.terminals  || 1,
            smartATC:   spec.smartATC   || true,
            capacity:   spec.capacity   || 20000000, // passengers/year
        };
        this._airports.set(id, airport);
        console.log(`[aviation-fleet] ✈️  مطار: ${airport.name} (${airport.icao || id})`);
        return airport;
    }

    planFlight(aircraftId, spec = {}) {
        const fp = {
            id:           `FP-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            aircraftId,
            callsign:     spec.callsign    || `SVH${Math.floor(Math.random() * 999)}`,
            origin:       spec.origin      || null,
            destination:  spec.destination || null,
            altitudeFt:   spec.altitudeFt  || 37000,
            speedKt:      spec.speedKt     || 450,
            route:        spec.route       || 'DIRECT',
            etaMin:       spec.etaMin      || null,
            status:       'filed',
            aiOptimized:  true,
        };
        this._flightPlans.set(fp.id, fp);
        return fp;
    }

    async init() {
        // أسطول الطائرات
        this.registerAircraft('A380-001', { name: 'شيخة A380',          type: 'commercial-jet', icaoType: 'A388', maxRangeKm: 15200, cruiseSpeedKt: 560, maxPayloadKg: 90000, engines: { count: 4, type: 'turbofan' } });
        this.registerAircraft('B777-001', { name: 'شيخة B777F شحن',     type: 'cargo-jet',      icaoType: 'B77F', maxRangeKm: 9200,  cruiseSpeedKt: 520, maxPayloadKg: 103000 });
        this.registerAircraft('B737-001', { name: 'شيخة B737 داخلي',    type: 'commercial-jet', icaoType: 'B738', maxRangeKm: 5600,  cruiseSpeedKt: 453, maxPayloadKg: 20000 });
        this.registerAircraft('JET-001',  { name: 'شيخة Gulfstream VIP', type: 'private-jet',   icaoType: 'GLEX', maxRangeKm: 11100, cruiseSpeedKt: 487, maxPayloadKg: 2000, aiCopilot: true });
        this.registerAircraft('UAV-001',  { name: 'شيخة UAV-S1 مسح',    type: 'uav',            icaoType: 'UNK',  maxRangeKm: 500,   cruiseSpeedKt: 120, maxPayloadKg: 200, aiCopilot: true });
        this.registerAircraft('VTOL-001', { name: 'شيخة eVTOL حضري',    type: 'vtol',           icaoType: 'UNK',  maxRangeKm: 250,   cruiseSpeedKt: 150, maxPayloadKg: 400, aiCopilot: true });

        // المطارات
        this.addAirport('OERK', { name: 'الرياض — مطار الملك خالد',        icao: 'OERK', iata: 'RUH', country: 'SA', position: { lat: 24.96, lon: 46.70, elevFt: 2049 }, runways: 4, capacity: 35000000 });
        this.addAirport('OEJN', { name: 'جدة — مطار الملك عبدالعزيز الدولي', icao: 'OEJN', iata: 'JED', country: 'SA', position: { lat: 21.68, lon: 39.15, elevFt: 48   }, runways: 3, capacity: 80000000 });
        this.addAirport('OEDF', { name: 'الدمام — مطار الملك فهد',          icao: 'OEDF', iata: 'DMM', country: 'SA', position: { lat: 26.47, lon: 49.80, elevFt: 72   }, runways: 2, capacity: 12000000 });
        this.addAirport('OMDB', { name: 'دبي الدولي',                        icao: 'OMDB', iata: 'DXB', country: 'AE', position: { lat: 25.25, lon: 55.36, elevFt: 62   }, runways: 2, capacity: 90000000 });
        this.addAirport('EGLL', { name: 'لندن هيثرو',                        icao: 'EGLL', iata: 'LHR', country: 'GB', position: { lat: 51.48, lon: -0.45,  elevFt: 83   }, runways: 2, capacity: 80000000 });

        console.log(`[aviation-fleet] ✅ الأسطول الجوي جاهز — ${this.count()} طائرة | ${this._airports.size} مطار`);
    }
}

// ─── ③ Space Launch & Operations Fleet ───────────────────────────────────────

class SpaceFleet extends FleetManager {
    constructor() {
        super('space-fleet');
        this._launchSites   = new Map();
        this._activeMissions = new Map();
        this._constellations = new Map();
    }

    registerLaunchVehicle(id, spec = {}) {
        return this.register(id, {
            ...spec,
            type:               spec.type              || 'orbital-launcher',
            // orbital-launcher | heavy-lift | super-heavy | crew-capsule | cargo-capsule | space-plane | ion-drive
            payloadToLEO_kg:    spec.payloadToLEO_kg   || 10000,
            payloadToGTO_kg:    spec.payloadToGTO_kg   || 5000,
            payloadToTMI_kg:    spec.payloadToTMI_kg   || 2000,
            reusable:           spec.reusable          || false,
            stages:             spec.stages            || 2,
            propellant:         spec.propellant        || 'RP-1/LOX',
            islandingCapable:   spec.landingCapable    || false,
            crewCapacity:       spec.crewCapacity      || 0,
            maxPayloadKg:       spec.payloadToLEO_kg   || 10000,
        });
    }

    registerSpacecraft(id, spec = {}) {
        return this.register(id, {
            ...spec,
            type:           spec.type          || 'cargo-capsule',
            // cargo-capsule | crew-capsule | space-station | lunar-lander | mars-rover | solar-probe | deep-space
            missionType:    spec.missionType   || 'LEO',
            dockingCapable: spec.dockingCapable || false,
            solarPanels:    spec.solarPanels   || true,
            aiAutonomous:   spec.aiAutonomous  || false,
            radiationHard:  spec.radiationHard || true,
        });
    }

    addLaunchSite(id, spec = {}) {
        const site = {
            id,
            name:       spec.name       || id,
            country:    spec.country    || 'SA',
            position:   spec.position   || { lat: 0, lon: 0 },
            pads:       spec.pads       || 1,
            maxDiamM:   spec.maxDiamM  || 5,      // أقصى قطر للصاروخ
            operational: spec.operational || true,
        };
        this._launchSites.set(id, site);
        console.log(`[space-fleet] 🚀 موقع إطلاق: ${site.name}`);
        return site;
    }

    planMission(id, spec = {}) {
        const mission = {
            id,
            name:          spec.name          || `Mission-${id}`,
            type:          spec.type          || 'satellite-deployment',
            launcher:      spec.launcher      || null,
            spacecraft:    spec.spacecraft    || null,
            target:        spec.target        || 'LEO',
            launchWindow:  spec.launchWindow  || null,
            duration:      spec.duration      || '7 days',
            objectives:    spec.objectives    || [],
            status:        'planning',
            aiAssisted:    true,
            islamicRef:    'وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ — الذاريات:٢٢',
        };
        this._activeMissions.set(id, mission);
        console.log(`[space-fleet] 🌌 مهمة فضائية: ${mission.name} → ${mission.target}`);
        return mission;
    }

    buildConstellation(id, spec = {}) {
        const constellation = {
            id,
            name:          spec.name          || id,
            totalSats:     spec.totalSats     || 100,
            deployedSats:  0,
            orbits:        spec.orbits        || ['LEO'],
            purpose:       spec.purpose       || 'broadband',
            coverage:      spec.coverage      || 'global',
        };
        this._constellations.set(id, constellation);
        console.log(`[space-fleet] 🛰  كوكبة: ${constellation.name} (${constellation.totalSats} قمر)`);
        return constellation;
    }

    async init() {
        // صواريخ الإطلاق
        this.registerLaunchVehicle('SHEIKHA-H1', { name: 'شيخة H1 — ثقيل',      type: 'heavy-lift',   payloadToLEO_kg: 63800, reusable: true,  stages: 2, propellant: 'CH4/LOX', landingCapable: true  });
        this.registerLaunchVehicle('SHEIKHA-M1', { name: 'شيخة M1 — متوسط',     type: 'orbital-launcher', payloadToLEO_kg: 22800, reusable: true,  stages: 2, propellant: 'RP-1/LOX', landingCapable: true });
        this.registerLaunchVehicle('SHEIKHA-S1', { name: 'شيخة S1 — صغير',      type: 'orbital-launcher', payloadToLEO_kg: 1700,  reusable: false, stages: 3, propellant: 'RP-1/LOX' });
        this.registerLaunchVehicle('SHEIKHA-SH', { name: 'شيخة SH — خارق الثقل', type: 'super-heavy',  payloadToLEO_kg: 150000, reusable: true, stages: 2, propellant: 'CH4/LOX',  crewCapacity: 100 });

        // المركبات الفضائية
        this.registerSpacecraft('CAPSULE-01',  { name: 'كبسولة شيخة-١ أطقم',      type: 'crew-capsule',     crewCapacity: 7, dockingCapable: true,  aiAutonomous: true });
        this.registerSpacecraft('CAPSULE-C1',  { name: 'كبسولة شيخة-C1 شحن',     type: 'cargo-capsule',    payloadToLEO_kg: 6000, dockingCapable: true  });
        this.registerSpacecraft('PROBE-M1',    { name: 'مسبار شيخة المريخ-١',     type: 'mars-rover',       missionType: 'Mars', aiAutonomous: true, radiationHard: true });
        this.registerSpacecraft('PROBE-L1',    { name: 'مسبار شيخة القمر-١',      type: 'lunar-lander',     missionType: 'Lunar', aiAutonomous: true });
        this.registerSpacecraft('STATION-1',   { name: 'محطة شيخة الفضائية-١',    type: 'space-station',    crewCapacity: 12, dockingCapable: true, solarPanels: true });
        this.registerSpacecraft('DEEP-S1',     { name: 'مسبار الفضاء العميق-١',   type: 'deep-space',       missionType: 'asteroid-belt', aiAutonomous: true });

        // مواقع الإطلاق
        this.addLaunchSite('TURAIF-SP',  { name: 'مركز شيخة للإطلاق — طريف',    country: 'SA', position: { lat: 31.5, lon: 38.7 }, pads: 3 });
        this.addLaunchSite('CAPE-LINK',  { name: 'رابط كيب كانافيرال',           country: 'US', position: { lat: 28.5, lon: -80.6 }, pads: 0 });
        this.addLaunchSite('BAIKONUR-L', { name: 'رابط بايكونور',                country: 'KZ', position: { lat: 45.9, lon: 63.3  }, pads: 0 });

        // المهام الفضائية
        this.planMission('MISSION-SAT-001', { name: 'نشر كوكبة شيخة-١',   type: 'constellation',       launcher: 'SHEIKHA-H1', target: 'LEO', duration: '6h' });
        this.planMission('MISSION-MOON-01', { name: 'استكشاف القمر-١',     type: 'lunar-exploration',   launcher: 'SHEIKHA-SH', spacecraft: 'PROBE-L1', target: 'Moon', duration: '30d' });
        this.planMission('MISSION-MARS-01', { name: 'مهمة المريخ الأولى', type: 'planetary-exploration', launcher: 'SHEIKHA-SH', spacecraft: 'PROBE-M1', target: 'Mars', duration: '2y' });

        // كوكبة الأقمار
        this.buildConstellation('SHEIKHA-NET', { name: 'شيخة نت — إنترنت فضائي', totalSats: 3600, purpose: 'broadband', coverage: 'global' });
        this.buildConstellation('SHEIKHA-EO',  { name: 'شيخة EO — مراقبة أرضية', totalSats: 120,  purpose: 'earth-observation', coverage: 'global' });

        console.log(`[space-fleet] ✅ الأسطول الفضائي جاهز — ${this.count()} مركبة | ${this._launchSites.size} موقع | ${this._activeMissions.size} مهمة`);
    }
}

// ─── ④ Land Transport Fleet ───────────────────────────────────────────────────

class LandTransportFleet extends FleetManager {
    constructor() {
        super('land-transport');
        this._routes     = new Map();
        this._depots     = new Map();
        this._railLines  = new Map();
    }

    registerTruck(id, spec = {}) {
        return this.register(id, {
            ...spec,
            type:           spec.type         || 'semi-truck',
            // semi-truck | tanker-truck | refrigerated | flatbed | car-carrier | hazmat | autonomous
            axles:          spec.axles        || 5,
            maxPayloadKg:   spec.maxPayloadKg || 25000,
            maxRangeKm:     spec.maxRangeKm   || 900,
            fuelType:       spec.fuelType     || 'diesel',
            autonomous:     spec.autonomous   || false,
            telematics:     true,
        });
    }

    registerTrain(id, spec = {}) {
        return this.register(id, {
            ...spec,
            type:           spec.type         || 'freight-train',
            // freight-train | passenger-train | high-speed | metro | bullet | mixed
            wagons:         spec.wagons       || 50,
            maxSpeedKmh:    spec.maxSpeedKmh  || 120,
            maxPayloadTons: spec.maxPayloadTons|| 5000,
            electric:       spec.electric     || false,
            maglev:         spec.maglev       || false,
            maxPayloadKg:   (spec.maxPayloadTons || 5000) * 1000,
        });
    }

    addRailLine(id, spec = {}) {
        const line = {
            id,
            name:          spec.name         || id,
            country:       spec.country      || 'SA',
            from:          spec.from         || null,
            to:            spec.to           || null,
            lengthKm:      spec.lengthKm     || 0,
            stations:      spec.stations     || [],
            gauge:         spec.gauge        || 'standard', // standard | broad | narrow
            electric:      spec.electric     || false,
            maxSpeedKmh:   spec.maxSpeedKmh  || 200,
            smartRail:     spec.smartRail    || true,
        };
        this._railLines.set(id, line);
        console.log(`[land-transport] 🚂 خط سكك: ${line.name} (${line.lengthKm} كم)`);
        return line;
    }

    addDepot(id, spec = {}) {
        this._depots.set(id, {
            id,
            name:      spec.name     || id,
            type:      spec.type     || 'truck-depot',
            capacity:  spec.capacity || 100,
            position:  spec.position || { lat: 0, lon: 0 },
            smartWMS:  spec.smartWMS || true,
        });
        console.log(`[land-transport] 🏗  مستودع: ${spec.name || id}`);
    }

    async init() {
        // أسطول الشاحنات
        for (let i = 1; i <= 10; i++) {
            this.registerTruck(`TRUCK-${String(i).padStart(3, '0')}`, {
                name:         `شيخة شاحنة ${i}`,
                type:         'semi-truck',
                maxPayloadKg: 25000,
                maxRangeKm:   900,
                fuelType:     i > 7 ? 'hydrogen' : 'diesel',
                autonomous:   i > 8,
            });
        }
        // شاحنات متخصصة
        this.registerTruck('TANKER-001',  { name: 'ناقلة وقود-١',   type: 'tanker-truck',  maxPayloadKg: 30000, fuelType: 'diesel' });
        this.registerTruck('REFRIG-001',  { name: 'مبردة أغذية-١',  type: 'refrigerated',  maxPayloadKg: 18000 });
        this.registerTruck('HAZMAT-001',  { name: 'مواد خطرة-١',    type: 'hazmat',        maxPayloadKg: 20000 });
        this.registerTruck('AUTO-001',    { name: 'شاحنة ذاتية-١',  type: 'autonomous',    maxPayloadKg: 25000, autonomous: true, fuelType: 'electric' });

        // القطارات
        this.registerTrain('SAR-FREIGHT-1',{ name: 'قطار السعودية للشحن-١', type: 'freight-train', wagons: 100, maxPayloadTons: 10000, maxSpeedKmh: 120 });
        this.registerTrain('SAR-PASS-1',  { name: 'قطار المسافرين-١',       type: 'passenger-train', wagons: 12,  maxSpeedKmh: 200, electric: true });
        this.registerTrain('HARAMAIN-1',  { name: 'قطار الحرمين-١',         type: 'high-speed',      wagons: 13,  maxSpeedKmh: 320, electric: true });
        this.registerTrain('MAGLEV-1',    { name: 'مغناطيسي مستقبلي-١',    type: 'bullet',          wagons: 10,  maxSpeedKmh: 600, electric: true, maglev: true });

        // خطوط السكك الحديدية
        this.addRailLine('SAR-LANDBRIDGE', { name: 'جسر الأرض SAR',    from: 'الرياض', to: 'الدمام',         lengthKm: 449,  maxSpeedKmh: 120, smartRail: true });
        this.addRailLine('HARAMAIN',       { name: 'قطار الحرمين',      from: 'مكة',    to: 'المدينة المنورة', lengthKm: 453,  maxSpeedKmh: 320, electric: true });
        this.addRailLine('RIYADH-METRO',   { name: 'مترو الرياض',       from: 'الرياض', to: 'الرياض',         lengthKm: 176,  maxSpeedKmh: 120, electric: true });
        this.addRailLine('NORTH-LINE',     { name: 'خط الشمال',         from: 'الرياض', to: 'الجوف',          lengthKm: 1392, maxSpeedKmh: 200 });

        // المستودعات
        this.addDepot('RIYADH-HUB',  { name: 'مركز الرياض اللوجستي',   type: 'distribution-center', capacity: 5000, position: { lat: 24.68, lon: 46.72 } });
        this.addDepot('JEDDAH-HUB',  { name: 'مركز جدة اللوجستي',      type: 'distribution-center', capacity: 4000, position: { lat: 21.49, lon: 39.18 } });
        this.addDepot('DAMMAM-HUB',  { name: 'مركز الدمام اللوجستي',   type: 'port-depot',          capacity: 3000, position: { lat: 26.43, lon: 50.10 } });

        console.log(`[land-transport] ✅ النقل البري جاهز — ${this.count()} مركبة | ${this._railLines.size} خط | ${this._depots.size} مستودع`);
    }
}

// ─── ⑤ Supply Chain Management ────────────────────────────────────────────────

class SupplyChainSystem extends EventEmitter {
    constructor() {
        super();
        this.name        = 'Sheikha SCM — سلسلة الإمداد الذكية';
        this._suppliers  = new Map();
        this._orders     = new Map();
        this._inventory  = new Map();
        this._warehouses = new Map();
        this._contracts  = new Map();
        this._disruptions = [];
    }

    // ─── Supplier Registry ────────────────────────────────────────────────

    registerSupplier(id, spec = {}) {
        const supplier = {
            id,
            name:          spec.name         || id,
            country:       spec.country      || 'SA',
            tier:          spec.tier         || 1, // 1=مباشر 2=ثانوي 3=ثالثي
            categories:    spec.categories   || [],
            rating:        spec.rating       || 5.0,
            halalCertified: spec.halalCertified || true,
            iso9001:       spec.iso9001      || false,
            leadTimeDays:  spec.leadTimeDays || 7,
            onTimeDelivery: spec.onTimeDelivery || 95, // %
            aiMonitored:   true,
        };
        this._suppliers.set(id, supplier);
        console.log(`[SCM] 🏭 مورّد: ${supplier.name} (Tier ${supplier.tier})`);
        return supplier;
    }

    // ─── Purchase Order ───────────────────────────────────────────────────

    createOrder(spec = {}) {
        const order = {
            id:          `PO-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            supplierId:  spec.supplierId   || null,
            items:       spec.items        || [], // [{ sku, qty, unitPrice, unit }]
            totalValue:  spec.items?.reduce((s, i) => s + (i.qty * i.unitPrice), 0) || 0,
            currency:    spec.currency     || 'SAR',
            status:      'draft',
            priority:    spec.priority     || 'normal',
            requiredBy:  spec.requiredBy   || null,
            shippingMode: spec.shippingMode || 'sea',
            islamicCompliant: true,
            noRiba:      true,
            createdAt:   new Date().toISOString(),
        };
        this._orders.set(order.id, order);
        this.emit('order:created', order);
        return order;
    }

    approveOrder(orderId) {
        const o = this._orders.get(orderId);
        if (!o) return { ok: false, error: 'الطلب غير موجود' };
        o.status     = 'approved';
        o.approvedAt = new Date().toISOString();
        this.emit('order:approved', o);
        return { ok: true, order: o };
    }

    // ─── Inventory ────────────────────────────────────────────────────────

    updateInventory(sku, delta, warehouse = 'main') {
        const key = `${warehouse}:${sku}`;
        const inv  = this._inventory.get(key) || { sku, warehouse, qty: 0, reserved: 0 };
        inv.qty   += delta;
        inv.updatedAt = new Date().toISOString();
        this._inventory.set(key, inv);

        if (inv.qty < 10) {
            this.emit('inventory:low', { sku, warehouse, qty: inv.qty });
            console.warn(`[SCM] ⚠️  مخزون منخفض: ${sku} @ ${warehouse} = ${inv.qty}`);
        }
        return inv;
    }

    getInventory(sku, warehouse = 'main') {
        return this._inventory.get(`${warehouse}:${sku}`) || null;
    }

    // ─── AI Demand Forecast ───────────────────────────────────────────────

    forecastDemand(sku, horizonDays = 30) {
        const inv = this._inventory.get(`main:${sku}`);
        const currentQty = inv?.qty || 0;

        // In production: ML model (ARIMA, LSTM, Prophet)
        const dailyDemand = Math.floor(Math.random() * 50 + 10);
        const projected   = currentQty - (dailyDemand * horizonDays);

        return {
            sku,
            currentQty,
            horizonDays,
            dailyDemandEst:  dailyDemand,
            projectedQtyEnd: Math.max(0, projected),
            reorderPoint:    dailyDemand * 7,
            suggestOrder:    projected < 0,
            confidence:      0.82,
            generatedAt:     new Date().toISOString(),
        };
    }

    // ─── Disruption Management ────────────────────────────────────────────

    reportDisruption(spec = {}) {
        const d = {
            id:          crypto.randomBytes(4).toString('hex'),
            type:        spec.type        || 'supplier-delay',
            severity:    spec.severity    || 'medium',
            affectedIds: spec.affectedIds || [],
            description: spec.description || '',
            resolution:  null,
            reportedAt:  new Date().toISOString(),
        };
        this._disruptions.push(d);
        this.emit('disruption:reported', d);
        console.warn(`[SCM] 🚨 اضطراب: ${d.type} (${d.severity})`);
        return d;
    }

    // ─── Status ───────────────────────────────────────────────────────────

    status() {
        const orders = Array.from(this._orders.values());
        return {
            name:          this.name,
            suppliers:     this._suppliers.size,
            orders: {
                total:    orders.length,
                draft:    orders.filter(o => o.status === 'draft').length,
                approved: orders.filter(o => o.status === 'approved').length,
            },
            inventoryLines: this._inventory.size,
            disruptions:    this._disruptions.filter(d => !d.resolution).length,
        };
    }

    async init() {
        console.log('[SCM] 📦 تشغيل سلسلة الإمداد الذكية...');
        // موردون رئيسيون
        this.registerSupplier('SABIC-001',  { name: 'سابك',           country: 'SA', tier: 1, categories: ['petrochemicals', 'plastics'],   iso9001: true, halalCertified: true });
        this.registerSupplier('ARAMCO-001', { name: 'أرامكو',         country: 'SA', tier: 1, categories: ['energy', 'chemicals'],           iso9001: true });
        this.registerSupplier('STC-001',    { name: 'الاتصالات السعودية', country: 'SA', tier: 1, categories: ['telecom', 'tech'],          iso9001: true });
        this.registerSupplier('LOCAL-001',  { name: 'مورّد محلي-١',   country: 'SA', tier: 2, categories: ['raw-materials'],                 halalCertified: true });
        console.log(`[SCM] ✅ سلسلة الإمداد جاهزة — الموردون: ${this._suppliers.size}`);
    }
}

// ─── Logistics Master ─────────────────────────────────────────────────────────

class LogisticsMaster {
    constructor() {
        this.maritime  = new MaritimeFleet();
        this.aviation  = new AviationFleet();
        this.space     = new SpaceFleet();
        this.land      = new LandTransportFleet();
        this.scm       = new SupplyChainSystem();
        this.verse     = LOGISTICS_QURAN_FOUNDATION.sea;
    }

    totalVehicles() {
        return this.maritime.count() + this.aviation.count() + this.space.count() + this.land.count();
    }

    snapshot() {
        return {
            maritime:  this.maritime.summary(),
            aviation:  this.aviation.summary(),
            space:     this.space.summary(),
            land:      this.land.summary(),
            scm:       this.scm.status(),
            total:     this.totalVehicles(),
            verse:     this.verse,
        };
    }

    async initAll() {
        console.log('[LOGISTICS] 🌐 تهيئة منظومة اللوجستيات الكاملة...');
        console.log(`[LOGISTICS] 📖 ${this.verse}`);
        await this.maritime.init();
        await this.aviation.init();
        await this.space.init();
        await this.land.init();
        await this.scm.init();
        console.log(`[LOGISTICS] ✅ المنظومة اللوجستية جاهزة — إجمالي المركبات: ${this.totalVehicles()}`);
        return this.snapshot();
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

const logisticsMaster = new LogisticsMaster();

module.exports = {
    LOGISTICS_QURAN_FOUNDATION,
    VEHICLE_STATUS,
    FleetManager,
    MaritimeFleet,
    AviationFleet,
    SpaceFleet,
    LandTransportFleet,
    SupplyChainSystem,
    LogisticsMaster,
    logistics: logisticsMaster,
    initAll:   () => logisticsMaster.initAll(),
};
