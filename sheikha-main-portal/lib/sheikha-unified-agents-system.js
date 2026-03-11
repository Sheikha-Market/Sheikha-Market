// بسم الله الرحمن الرحيم
// منظومة التكامل الموحد لوكلاء SHEIKHA

const ConstructionEngine = require('./sheikha-construction-development-agents-engine.js');
const DigitalInfrastructureEngine = require('./sheikha-digital-infrastructure-agents-engine.js');
const OperationsEngine = require('./sheikha-operations-management-agents-engine.js');
const AIManufacturingCenterEngine = require('./sheikha-ai-manufacturing-center-engine.js');
const TawheedFoundationEngine = require('./sheikha-tawheed-foundation-engine.js');

let AIManufacturingSupplyChainEngine = null;
try {
    AIManufacturingSupplyChainEngine = require('./sheikha-ai-manufacturing-supply-chain-engine.js');
} catch (_error) {
    AIManufacturingSupplyChainEngine = null;
}

function normalizeAgents(agents, engineSource) {
    if (!Array.isArray(agents)) {
        return [];
    }

    return agents.map(agent => ({
        ...agent,
        engineSource,
        tawheedReference: buildTawheedReference(engineSource)
    }));
}

function getCoreDivineNames() {
    const divineNames =
        TawheedFoundationEngine.TAWHEED &&
        TawheedFoundationEngine.TAWHEED.asma_wa_sifat &&
        Array.isArray(TawheedFoundationEngine.TAWHEED.asma_wa_sifat.divine_names)
            ? TawheedFoundationEngine.TAWHEED.asma_wa_sifat.divine_names
            : [];

    return divineNames.slice(0, 10).map(item => item.name);
}

function buildTawheedReference(engineSource) {
    return {
        declaration: 'لا إله إلا الله وحده لا شريك له',
        categories: {
            rububiyyah: 'توحيد الربوبية',
            uluhiyyah: 'توحيد الألوهية',
            asmaWaSifat: 'توحيد الأسماء والصفات'
        },
        internalExternalScope: {
            internalSystems: true,
            externalSystems: true,
            internalNetworks: true,
            externalNetworks: true,
            allAgents: true
        },
        sourceEngine: engineSource,
        divineNames: getCoreDivineNames()
    };
}

function getEngineAgents(engineKey, engineModule) {
    if (!engineModule) {
        return [];
    }

    if (
        engineKey === 'construction' &&
        typeof engineModule.getAllConstructionAgents === 'function'
    ) {
        return normalizeAgents(engineModule.getAllConstructionAgents(), 'CONSTRUCTION');
    }

    if (
        engineKey === 'digitalInfrastructure' &&
        typeof engineModule.getAllDigitalInfrastructureAgents === 'function'
    ) {
        return normalizeAgents(
            engineModule.getAllDigitalInfrastructureAgents(),
            'DIGITAL_INFRASTRUCTURE'
        );
    }

    if (engineKey === 'operations' && typeof engineModule.getAllOperationsAgents === 'function') {
        return normalizeAgents(engineModule.getAllOperationsAgents(), 'OPERATIONS_MANAGEMENT');
    }

    if (
        engineKey === 'aiManufacturingCenter' &&
        typeof engineModule.getAllManufacturingAgents === 'function'
    ) {
        return normalizeAgents(engineModule.getAllManufacturingAgents(), 'AI_MANUFACTURING_CENTER');
    }

    if (
        engineKey === 'aiManufacturingSupplyChain' &&
        typeof engineModule.getAllAgents === 'function'
    ) {
        return normalizeAgents(engineModule.getAllAgents(), 'AI_MANUFACTURING_SUPPLY_CHAIN');
    }

    if (typeof engineModule.getAllAgents === 'function') {
        return normalizeAgents(engineModule.getAllAgents(), engineKey.toUpperCase());
    }

    return [];
}

class SheikhaUnifiedAgentsSystem {
    constructor() {
        this.engines = {
            construction: ConstructionEngine,
            digitalInfrastructure: DigitalInfrastructureEngine,
            operations: OperationsEngine,
            aiManufacturingCenter: AIManufacturingCenterEngine,
            aiManufacturingSupplyChain: AIManufacturingSupplyChainEngine
        };
    }

    getAllAgents() {
        const allAgents = [];

        for (const [engineKey, engineModule] of Object.entries(this.engines)) {
            const agents = getEngineAgents(engineKey, engineModule);
            allAgents.push(...agents);
        }

        return allAgents;
    }

    findAgentById(agentId) {
        if (!agentId) {
            return null;
        }

        return this.getAllAgents().find(agent => agent.id === agentId) || null;
    }

    searchAgents(query) {
        if (!query) {
            return [];
        }

        const keyword = query.toLowerCase();

        return this.getAllAgents().filter(agent => {
            const id = String(agent.id || '').toLowerCase();
            const nameAr = String(agent.nameAr || '').toLowerCase();
            const nameEn = String(agent.nameEn || '').toLowerCase();
            const role = String(agent.role || '').toLowerCase();
            const department = String(agent.department || '').toLowerCase();

            return (
                id.includes(keyword) ||
                nameAr.includes(keyword) ||
                nameEn.includes(keyword) ||
                role.includes(keyword) ||
                department.includes(keyword)
            );
        });
    }

    getAgentsByRole(role) {
        return this.getAllAgents().filter(agent => agent.role === role);
    }

    getAgentsByDepartment(department) {
        return this.getAllAgents().filter(agent => agent.department === department);
    }

    getComprehensiveStats() {
        const allAgents = this.getAllAgents();

        const stats = {
            totalAgents: allAgents.length,
            engines: 0,
            byEngine: {},
            byRole: {},
            byDepartment: {},
            byLevel: {}
        };

        for (const [engineKey, engineModule] of Object.entries(this.engines)) {
            const agents = getEngineAgents(engineKey, engineModule);
            if (engineModule) {
                stats.engines += 1;
            }
            stats.byEngine[engineKey] = agents.length;
        }

        allAgents.forEach(agent => {
            const role = agent.role || 'UNSPECIFIED';
            const department = agent.department || 'UNSPECIFIED';
            const level = agent.level || 'UNSPECIFIED';

            stats.byRole[role] = (stats.byRole[role] || 0) + 1;
            stats.byDepartment[department] = (stats.byDepartment[department] || 0) + 1;
            stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
        });

        return stats;
    }

    activateAgent(agentId, config = {}) {
        const agent = this.findAgentById(agentId);

        if (!agent) {
            return {
                success: false,
                message: `الوكيل ${agentId} غير موجود`,
                timestamp: new Date().toISOString()
            };
        }

        return {
            success: true,
            message: `تم تفعيل الوكيل: ${agent.nameAr || agent.id}`,
            data: {
                ...agent,
                status: 'ACTIVE',
                activatedAt: new Date().toISOString(),
                config,
                tawheedReference: buildTawheedReference(agent.engineSource || 'UNIFIED_SYSTEM')
            },
            timestamp: new Date().toISOString()
        };
    }

    generateReport() {
        const stats = this.getComprehensiveStats();

        return {
            title: '🌟 تقرير منظومة وكلاء شيخة الموحدة',
            subtitle: 'تكامل البناء والعمليات والبنية الرقمية وصناعة الذكاء الاصطناعي',
            totalAgents: stats.totalAgents,
            engines: stats.byEngine,
            rolesCount: Object.keys(stats.byRole).length,
            departmentsCount: Object.keys(stats.byDepartment).length,
            islamicFoundation: 'مبني على الكتاب والسنة',
            tawheedFoundation: {
                declaration: 'لا إله إلا الله وحده لا شريك له',
                references: {
                    tawheed: TawheedFoundationEngine.TAWHEED,
                    systemsMap: TawheedFoundationEngine.SYSTEM_TAWHEED_MAP
                },
                scope: {
                    internalSystems: true,
                    externalSystems: true,
                    internalNetworks: true,
                    externalNetworks: true,
                    allAgents: true
                }
            },
            timestamp: new Date().toISOString()
        };
    }
}

const unifiedSystem = new SheikhaUnifiedAgentsSystem();

module.exports = {
    SheikhaUnifiedAgentsSystem,
    unifiedSystem,
    getAllAgents: () => unifiedSystem.getAllAgents(),
    getStats: () => unifiedSystem.getComprehensiveStats(),
    findAgent: agentId => unifiedSystem.findAgentById(agentId),
    searchAgents: query => unifiedSystem.searchAgents(query),
    activateAgent: (agentId, config) => unifiedSystem.activateAgent(agentId, config),
    generateReport: () => unifiedSystem.generateReport(),
    engines: unifiedSystem.engines
};
