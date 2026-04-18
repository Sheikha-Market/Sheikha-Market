/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TELECOM ORGANIZATION ENGINE — محرك منظمة شبكات الاتصالات                   ║
 * ║                                                                              ║
 * ║  البنية الكاملة لتصنيف شبكات الاتصالات:                                     ║
 * ║  🗺️ أرضي   🛰️ فضائي   🌐 لوجستي   👥 مجتمعات   🔗 تكاملات                ║
 * ║  🧠 خلايا عصبية (Neural Cells) — كل شبكة = خلية بمدخلات وأثر وناتج         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   const { telecomOrg } = require('./core/comms/telecom-org');
 *
 *   app.get('/api/telecom', (req, res) => res.json(telecomOrg.getDashboard()));
 *   app.get('/api/telecom/terrestrial', (req, res) => res.json(telecomOrg.getTerrestrial()));
 *   app.get('/api/telecom/satellite',   (req, res) => res.json(telecomOrg.getSatellite()));
 *   app.get('/api/telecom/logistics',   (req, res) => res.json(telecomOrg.getLogistics()));
 *   app.get('/api/telecom/communities', (req, res) => res.json(telecomOrg.getCommunities()));
 *   app.get('/api/telecom/integration', (req, res) => res.json(telecomOrg.getIntegrations()));
 *   app.get('/api/telecom/neural',       (req, res) => res.json(telecomOrg.getNeuralTopology()));
 *   app.get('/api/telecom/neural/:cell', (req, res) => res.json(telecomOrg.getNeuralCell(req.params.cell)));
 *   app.post('/api/telecom/neural/signal',(req, res) => res.json(telecomOrg.fireSignal(req.body)));
 *
 * "وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات:١٣
 */

'use strict';

const {
    TERRESTRIAL_TECHNOLOGIES,
    TERRESTRIAL_CATEGORIES,
    getTerrestrialNetworks,
    getTerrestrialTech,
} = require('./terrestrial');

const {
    SATELLITE_ORBITS,
    SATELLITE_SECTORS,
    getSatelliteNetworks,
    getSatOrbit,
    getSatSector,
} = require('./satellite');

const {
    AVIATION_NETWORKS,
    MARITIME_NETWORKS,
    LAND_LOGISTICS_NETWORKS,
    HUBS_INTEGRATION,
    getLogisticsNetworks,
    getAviationSystems,
    getMaritimeSystems,
    getLandSystems,
} = require('./logistics');

const {
    TELECOM_COMMUNITIES,
    getCommunities,
    getCommunity,
    getCommunitiesByNetwork,
} = require('./communities');

const {
    INTEGRATION_BRIDGES,
    COMPATIBILITY_MATRIX,
    getIntegrations,
    getBridge,
    getCompatibleNetworks,
} = require('./integration');

const {
    ALL_CELLS,
    TERRESTRIAL_CELLS,
    SATELLITE_CELLS,
    LOGISTICS_CELLS,
    buildNeuralTopology,
    propagateSignal,
    getCell,
    getCellsByDomain,
} = require('./neural-cell-networks');

// ═══════════════════════════════════════════════════════════════
// محرك منظمة الاتصالات
// ═══════════════════════════════════════════════════════════════
class TelecomOrganizationEngine {

    constructor() {
        this.nameAr  = 'منظمة شبكات الاتصالات — شيخة';
        this.nameEn  = 'Sheikha Telecom Organization Engine';
        this.version = '2.0.0';   // v2 — الشبكة العصبية
        this.tawheed = 'لا إله إلا الله';
    }

    // ─── لوحة القيادة الكاملة ─────────────────────────────────
    getDashboard() {
        const terrestrial  = getTerrestrialNetworks();
        const satellite    = getSatelliteNetworks();
        const logistics    = getLogisticsNetworks();
        const communities  = getCommunities();
        const integrations = getIntegrations();

        return {
            nameAr:   this.nameAr,
            nameEn:   this.nameEn,
            tawheed:  this.tawheed,
            version:  this.version,
            summary: {
                terrestrial_techs:    terrestrial.count,
                satellite_orbits:     satellite.orbits.length,
                satellite_sectors:    satellite.sectors.length,
                aviation_systems:     Object.keys(AVIATION_NETWORKS).length,
                maritime_systems:     Object.keys(MARITIME_NETWORKS).length,
                land_systems:         Object.keys(LAND_LOGISTICS_NETWORKS).length,
                communities:          communities.count,
                integration_bridges:  integrations.summary.bridges_count,
                compatible_pairs:     integrations.summary.compatible_pairs,
                critical_links:       integrations.summary.critical_links,
            },
            domains: [
                { id: 'TERRESTRIAL', nameAr: 'الأرضي',         icon: '🗺️', count: terrestrial.count },
                { id: 'SATELLITE',   nameAr: 'الفضائي',        icon: '🛰️', count: satellite.orbits.length + satellite.sectors.length },
                { id: 'LOGISTICS',   nameAr: 'اللوجستي',       icon: '🌐', count: Object.keys(AVIATION_NETWORKS).length + Object.keys(MARITIME_NETWORKS).length + Object.keys(LAND_LOGISTICS_NETWORKS).length },
                { id: 'COMMUNITIES', nameAr: 'المجتمعات',      icon: '👥', count: communities.count },
                { id: 'INTEGRATION', nameAr: 'التكاملات',      icon: '🔗', count: integrations.summary.bridges_count },
                { id: 'NEURAL',      nameAr: 'الشبكة العصبية', icon: '🧠', count: Object.keys(ALL_CELLS).length },
            ],
            verse: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
        };
    }

    // ─── تبويب كل طبقة ────────────────────────────────────────
    getTerrestrial(techId)    { return techId ? getTerrestrialTech(techId) : getTerrestrialNetworks(); }
    getSatellite(key, type)   {
        if (!key) return getSatelliteNetworks();
        return type === 'orbit' ? getSatOrbit(key) : getSatSector(key);
    }
    getLogistics(section) {
        if (section === 'aviation') return { aviation: getAviationSystems() };
        if (section === 'maritime') return { maritime: getMaritimeSystems() };
        if (section === 'land')     return { land: getLandSystems() };
        return getLogisticsNetworks();
    }
    getCommunities(id)        { return id ? getCommunity(id) : getCommunities(); }
    getIntegrations(id)       { return id ? getBridge(id) : getIntegrations(); }

    // ─── الشبكة العصبية ───────────────────────────────────────
    getNeuralTopology()       { return buildNeuralTopology(); }
    getNeuralCell(id)         { return getCell(id.toUpperCase()); }
    getNeuralDomain(domain)   { return getCellsByDomain(domain); }
    fireSignal(from, signal, depth) {
        return propagateSignal(
            (from || '').toUpperCase(),
            signal || { type: 'ACTIVATION' },
            parseInt(depth || 3, 10)
        );
    }

    // ─── بحث عبر الكل ─────────────────────────────────────────
    search(query) {
        const q = query.toLowerCase();
        const results = [];

        // بحث في الشبكات الأرضية
        Object.values(TERRESTRIAL_TECHNOLOGIES).forEach((t) => {
            if (t.nameAr.includes(query) || t.nameEn.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) {
                results.push({ domain: 'TERRESTRIAL', icon: '🗺️', ...t });
            }
        });

        // بحث في الأقمار الصناعية
        Object.values(SATELLITE_ORBITS).forEach((o) => {
            if (o.nameAr.includes(query) || o.nameEn.toLowerCase().includes(q)) {
                results.push({ domain: 'SATELLITE_ORBIT', icon: '🛰️', ...o });
            }
        });
        Object.values(SATELLITE_SECTORS).forEach((s) => {
            if (s.nameAr.includes(query) || s.nameEn.toLowerCase().includes(q)) {
                results.push({ domain: 'SATELLITE_SECTOR', icon: '🛰️', ...s });
            }
        });

        // بحث في المجتمعات
        Object.values(TELECOM_COMMUNITIES).forEach((c) => {
            if (c.nameAr.includes(query) || c.nameEn.toLowerCase().includes(q)) {
                results.push({ domain: 'COMMUNITY', icon: '👥', ...c });
            }
        });

        return { query, count: results.length, results };
    }

    // ─── مسار الاتصال بين نقطتين ──────────────────────────────
    getPath(from, to) {
        const bridges = getCompatibleNetworks(from).filter(
            (m) => m.from.toUpperCase() === to.toUpperCase() || m.to.toUpperCase() === to.toUpperCase()
        );
        return {
            from, to,
            bridges,
            possible: bridges.length > 0,
            verse: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const telecomOrg = new TelecomOrganizationEngine();

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
    telecomOrg,
    TelecomOrganizationEngine,
    // re-exports للوصول المباشر
    TERRESTRIAL_TECHNOLOGIES,
    TERRESTRIAL_CATEGORIES,
    SATELLITE_ORBITS,
    SATELLITE_SECTORS,
    AVIATION_NETWORKS,
    MARITIME_NETWORKS,
    LAND_LOGISTICS_NETWORKS,
    HUBS_INTEGRATION,
    TELECOM_COMMUNITIES,
    INTEGRATION_BRIDGES,
    COMPATIBILITY_MATRIX,
    // الشبكة العصبية
    ALL_CELLS,
    TERRESTRIAL_CELLS,
    SATELLITE_CELLS,
    LOGISTICS_CELLS,
    getTerrestrialNetworks,
    getSatelliteNetworks,
    getLogisticsNetworks,
    getCommunities,
    getIntegrations,
    getCommunity,
    getBridge,
    getCompatibleNetworks,
    buildNeuralTopology,
    propagateSignal,
    getCell,
    getCellsByDomain,
};
