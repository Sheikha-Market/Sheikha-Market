'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SOVEREIGN SEVEN LAYERS — الطبقات السيادية السبع                 ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  0) Sovereign Root        — القرآن الكريم + السنة النبوية                ║
 * ║  1) SNRN                  — شبكة الخلايا الجذرية العصبية                  ║
 * ║  2) SheikhaCoin           — منظومة العملة الذكية الإسلامية               ║
 * ║  3) Root Identity         — did:sheikha + HSM + Quantum-Safe             ║
 * ║  4) SCNE                  — محركات الذكاء والتشغيل                        ║
 * ║  5) Market System         — الأسواق والتجارة الحلال                       ║
 * ║  6) Global Sovereign Net  — Cloud + CDN + VPN Mesh                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const SOVEREIGN_LAYERS_VERSION = '1.0.0';

const LAYERS_BLUEPRINT = Object.freeze([
    {
        id: 0,
        code: 'SOVEREIGN_ROOT',
        icon: '🌙',
        titleAr: 'الطبقة 0 — الجذر السيادي',
        nameEn: 'Sovereign Root',
        reference: 'القرآن الكريم + السنة النبوية = المرجع الحاكم',
        status: 'active'
    },
    {
        id: 1,
        code: 'SNRN',
        icon: '🧠',
        titleAr: 'الطبقة 1 — شبكة الخلايا الجذرية العصبية',
        nameEn: 'Sheikha Neural Root Network',
        reference: 'Sheikha Neural Root Network (SNRN)',
        status: 'active'
    },
    {
        id: 2,
        code: 'SHEIKHACOIN',
        icon: '💎',
        titleAr: 'الطبقة 2 — منظومة العملة الذكية',
        nameEn: 'SheikhaCoin',
        reference: 'عملة إسلامية سيادية أعلى من البيتكوين والكريبتو',
        status: 'active'
    },
    {
        id: 3,
        code: 'ROOT_IDENTITY',
        icon: '🔐',
        titleAr: 'الطبقة 3 — بنية الهوية الجذرية الموزعة',
        nameEn: 'did:sheikha Identity Fabric',
        reference: 'did:sheikha + HSM + Quantum-Safe Cryptography',
        status: 'planned'
    },
    {
        id: 4,
        code: 'SCNE',
        icon: '⚙️',
        titleAr: 'الطبقة 4 — محركات الذكاء والتشغيل',
        nameEn: 'Sheikha Codex Neural Engine',
        reference: 'Sheikha Codex Neural Engine (SCNE)',
        status: 'active'
    },
    {
        id: 5,
        code: 'MARKET_SYSTEM',
        icon: '🌐',
        titleAr: 'الطبقة 5 — منظومة الأسواق والتجارة',
        nameEn: 'Halal Market & Logistics',
        reference: 'بورصة المعادن + التجارة الحلال + اللوجستيك',
        status: 'active'
    },
    {
        id: 6,
        code: 'GLOBAL_SOVEREIGN_NETWORK',
        icon: '📡',
        titleAr: 'الطبقة 6 — الشبكة السيادية العالمية',
        nameEn: 'Sovereign Global Network',
        reference: 'Sovereign Cloud + CDN + VPN Mesh',
        status: 'planned'
    }
]);

function resolveLayerStatus(layer, runtime) {
    const statusByCode = {
        SOVEREIGN_ROOT: runtime.sdgn ? 'active' : 'degraded',
        SNRN: runtime.rnn ? 'active' : 'degraded',
        SHEIKHACOIN: runtime.sidc ? 'active' : 'degraded',
        ROOT_IDENTITY: runtime.rootIdentity || layer.status,
        SCNE: runtime.scne || 'active',
        MARKET_SYSTEM: runtime.market || 'active',
        GLOBAL_SOVEREIGN_NETWORK: runtime.globalNetwork || layer.status
    };

    return statusByCode[layer.code] || layer.status;
}

function getSovereignLayers(runtime = {}) {
    const layers = LAYERS_BLUEPRINT.map((layer) => ({
        ...layer,
        runtimeStatus: resolveLayerStatus(layer, runtime)
    }));

    const activeCount = layers.filter((layer) => layer.runtimeStatus === 'active').length;
    const plannedCount = layers.filter((layer) => layer.runtimeStatus === 'planned').length;
    const degradedCount = layers.filter((layer) => layer.runtimeStatus === 'degraded').length;

    return {
        version: SOVEREIGN_LAYERS_VERSION,
        layers,
        summary: {
            total: layers.length,
            active: activeCount,
            planned: plannedCount,
            degraded: degradedCount,
            stack: layers.map((layer) => `${layer.icon} ${layer.nameEn}`).join(' → ')
        }
    };
}

module.exports = {
    SOVEREIGN_LAYERS_VERSION,
    LAYERS_BLUEPRINT,
    getSovereignLayers
};
