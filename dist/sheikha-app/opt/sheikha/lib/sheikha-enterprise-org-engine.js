#!/usr/bin/env node
'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║     شيخة — محرك الهيكلة المؤسسية والتشغيل الإداري          ║
 * ║     Sheikha Enterprise Organization Operating Engine        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * الهدف:
 * - قراءة الهيكل الإداري والأقسام والبوتات والمشاريع
 * - بناء دراسة تشغيلية وتنفيذية لكل قسم
 * - ربط المدير + الموظفين + المهام + وكيل الذكاء المتخصص
 * - توليد مخططات Mermaid وتقارير تشغيلية جاهزة
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ORG_DIR = path.join(ROOT_DIR, 'data', 'org');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'organization');

const FILES = {
    departments: path.join(ORG_DIR, 'departments.json'),
    bots: path.join(ORG_DIR, 'bots-workforce.json'),
    projects: path.join(ORG_DIR, 'projects-enhanced.json'),
    operating: path.join(ORG_DIR, 'department-operating-model.json'),
    domains: path.join(ORG_DIR, 'market-community-infrastructure.json'),
    autonomous: path.join(ORG_DIR, 'autonomous-self-healing-framework.json'),
    networkFlow: path.join(ORG_DIR, 'network-flow-archiving-system.json'),
    botGovernance: path.join(ORG_DIR, 'bot-performance-governance.json'),
    digitalStack: path.join(ORG_DIR, 'digital-enterprise-stack.json'),
    productQuality: path.join(ORG_DIR, 'product-quality-digital-division.json')
};

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function now() {
    return new Date().toISOString();
}

function buildMaps() {
    const departmentsData = readJson(FILES.departments);
    const botsData = readJson(FILES.bots);
    const projectsData = readJson(FILES.projects);
    const operatingData = readJson(FILES.operating);
    const domainsData = readJson(FILES.domains);
    const autonomousData = readJson(FILES.autonomous);
    const networkFlowData = readJson(FILES.networkFlow);
    const botGovernanceData = readJson(FILES.botGovernance);
    const digitalStackData = readJson(FILES.digitalStack);
    const productQualityData = readJson(FILES.productQuality);

    const departmentsMap = new Map(departmentsData.departments.map(dept => [dept.num, dept]));
    const botsMap = new Map(botsData.bots.map(bot => [bot.num, bot]));
    const projects = projectsData.projects;
    const operatingMap = new Map(operatingData.departments.map(item => [item.departmentId, item]));

    return {
        departmentsData,
        botsData,
        projectsData,
        operatingData,
        domainsData,
        autonomousData,
        networkFlowData,
        botGovernanceData,
        digitalStackData,
        productQualityData,
        departmentsMap,
        botsMap,
        projects,
        operatingMap
    };
}

function buildHighPerformanceModel(context) {
    const network = context.networkFlowData || {};
    const governance = context.botGovernanceData || {};
    const stack = context.digitalStackData || {};
    const quality = context.productQualityData || {};

    return {
        network,
        governance,
        stack,
        quality,
        stats: {
            internalZones: (network.networkArchitecture?.internalNetwork?.zones || []).length,
            externalChannels: (network.networkArchitecture?.externalNetwork?.channels || []).length,
            flowTypes: (network.informationFlows?.flowTypes || []).length,
            flowCatalog: (network.informationFlows?.flowCatalog || []).length,
            archiveTiers: (network.archivingSystem?.tiers || []).length,
            platformCount: (stack.corePlatforms || []).length,
            qualityUnits: (quality.structure?.units || []).length,
            governanceViolationLevels: (governance.violationsModel?.levels || []).length
        }
    };
}

function buildAutonomousModel(context) {
    const data = context.autonomousData || {};
    return {
        meta: data._meta || null,
        shariaAnchorsCount: (data.shariaAnchors || []).length,
        layersCount: (data.architecture?.layers || []).length,
        operationsSectionsCount: (data.operationsSections || []).length,
        agentsCount: (data.autonomousAgents || []).length,
        kpisCount: (data.kpis || []).length,
        incidentLifecycle: data.incidentLifecycle || [],
        readinessForNewMarkets: data.readinessForNewMarkets || null,
        full: data
    };
}

function buildDomainModel(context) {
    const botsMap = context.botsMap;
    return (context.domainsData.domains || []).map(domain => ({
        num: domain.num,
        nameAr: domain.nameAr,
        mission: domain.mission,
        scripture: domain.scripture,
        unitsCount: (domain.units || []).length,
        units: (domain.units || []).map(unit => ({
            ...unit,
            botProfile: unit.bot ? botsMap.get(unit.bot) || null : null
        }))
    }));
}

function buildDepartmentExecutionModel(context) {
    return context.departmentsData.departments.map(dept => {
        const op = context.operatingMap.get(dept.num) || {};
        const botAgent = op.botAgent ? context.botsMap.get(op.botAgent.botId) : null;
        const employees = op.employees || [];
        const totalEmployees = employees.reduce((sum, role) => sum + (role.count || 0), 0);
        const linkedProjects = context.projects.filter(project =>
            (project.assignedBots || []).includes(op.botAgent?.botId)
        );

        return {
            departmentId: dept.num,
            nameAr: dept.nameAr,
            division: dept.division,
            level: dept.level,
            rating: dept.rating,
            maturity: dept.maturity,
            manager: op.manager || null,
            employees,
            totalEmployees,
            operationalStudy: {
                purpose: dept.mission,
                executionTracks: ['التخطيط', 'التنفيذ', 'القياس', 'التحسين', 'التوثيق', 'الامتثال'],
                dailyCadence: [
                    'اجتماع صباحي موجز 15 دقيقة',
                    'تشغيل المهام الحرجة',
                    'مراجعة مؤشرات القسم',
                    'رفع الانحرافات والمعوقات',
                    'إغلاق اليوم وتوثيق التعلّم'
                ],
                improvementLoop: [
                    'جمع بيانات التنفيذ الفعلي',
                    'تحليل الفجوات',
                    'تغذية البوت المتخصص بالمخرجات',
                    'إعادة ضبط المهام والأوزان',
                    'تحديث SOP وPlaybooks'
                ]
            },
            botAgent: op.botAgent
                ? {
                      ...op.botAgent,
                      profile: botAgent || null
                  }
                : null,
            linkedProjects: linkedProjects.map(project => ({
                num: project.num,
                nameAr: project.nameAr,
                priority: project.priority,
                completion: project.completion,
                healthScore: project.healthScore
            })),
            subEngineeringTracks: op.subEngineeringTracks || []
        };
    });
}

function buildOperationsNetwork(executionModel) {
    const nodes = executionModel.map(dept => ({
        id: dept.departmentId,
        label: dept.nameAr,
        level: dept.level
    }));

    const edges = [];
    executionModel.forEach(dept => {
        const raw = dept.departmentId;
        const originalDept = executionModel.find(item => item.departmentId === raw);
        const sourceDept = originalDept;
        if (!sourceDept) {
            return;
        }
    });

    const context = buildMaps();
    context.departmentsData.departments.forEach(dept => {
        (dept.integrations || []).forEach(integration => {
            const targetId = integration.startsWith('SHK-DEPT-') ? integration : null;
            if (targetId) {
                edges.push({ from: dept.num, to: targetId, type: 'integration' });
            }
        });
    });

    return { nodes, edges };
}

function buildMermaidOrgChart(executionModel) {
    const lines = ['flowchart TD'];
    lines.push('    CEO["SHK-DEPT-001<br/>قسم إدارة المدير العام"]');

    executionModel.forEach(dept => {
        if (dept.departmentId === 'SHK-DEPT-001') {
            return;
        }
        const safeId = dept.departmentId.replace(/-/g, '_');
        lines.push(`    ${safeId}["${dept.departmentId}<br/>${dept.nameAr}"]`);
    });

    const context = buildMaps();
    context.departmentsData.departments.forEach(dept => {
        if (!dept.parent || dept.num === 'SHK-DEPT-001') {
            return;
        }
        const childId = dept.num.replace(/-/g, '_');
        const parentId = dept.parent === 'SHK-DEPT-001' ? 'CEO' : dept.parent.replace(/-/g, '_');
        lines.push(`    ${parentId} --> ${childId}`);
    });

    return lines.join('\n');
}

function buildMermaidOperationsNetwork(network) {
    const lines = ['flowchart LR'];

    network.nodes.forEach(node => {
        const safeId = node.id.replace(/-/g, '_');
        lines.push(`    ${safeId}["${node.id}<br/>${node.label}"]`);
    });

    network.edges.forEach(edge => {
        const from = edge.from.replace(/-/g, '_');
        const to = edge.to.replace(/-/g, '_');
        lines.push(`    ${from} -. تكامل .-> ${to}`);
    });

    return lines.join('\n');
}

function buildEngineeringMap(operatingData) {
    return {
        title: operatingData.engineeringStructure.title,
        principle: operatingData.engineeringStructure.principle,
        tracks: operatingData.engineeringStructure.tracks.map((track, index) => ({
            sequence: index + 1,
            ...track
        }))
    };
}

function buildMermaidDomainMap(domains) {
    const lines = ['flowchart TD'];
    lines.push('    CORE["SHK-CORE<br/>المركز القيادي والتشغيلي"]');

    domains.forEach(domain => {
        const domainId = domain.num.replace(/-/g, '_');
        lines.push(`    ${domainId}["${domain.num}<br/>${domain.nameAr}"]`);
        lines.push(`    CORE --> ${domainId}`);

        (domain.units || []).forEach(unit => {
            const unitId = unit.num.replace(/-/g, '_');
            lines.push(`    ${unitId}["${unit.num}<br/>${unit.nameAr}"]`);
            lines.push(`    ${domainId} --> ${unitId}`);
        });
    });

    return lines.join('\n');
}

function buildMermaidInfraNetwork(domains) {
    const lines = ['flowchart LR'];
    lines.push('    MKT["السوق"]');
    lines.push('    LEG["القانونية"]');
    lines.push('    COM["المجتمع"]');
    lines.push('    EDU["التعليم"]');
    lines.push('    NET["الشبكات/الاتصالات"]');
    lines.push('    ENG["الطاقة"]');
    lines.push('    WH["المستودعات"]');
    lines.push('    CLD["السحابة/السيرفرات"]');
    lines.push('    MKT --- LEG');
    lines.push('    MKT --- COM');
    lines.push('    MKT --- NET');
    lines.push('    MKT --- WH');
    lines.push('    LEG --- CLD');
    lines.push('    COM --- EDU');
    lines.push('    NET --- CLD');
    lines.push('    ENG --- CLD');
    lines.push('    ENG --- WH');

    if ((domains || []).length > 0) {
        lines.push('    CLD --- EDU');
    }

    return lines.join('\n');
}

function buildMermaidAutonomousFramework(autonomousModel) {
    const lines = ['flowchart TD'];
    lines.push('    A0["SHK-AUTO-000<br/>التشغيل الذاتي والتعافي الآلي"]');

    const layers = autonomousModel?.full?.architecture?.layers || [];
    layers.forEach(layer => {
        const layerId = layer.num.replace(/-/g, '_');
        lines.push(`    ${layerId}["${layer.num}<br/>${layer.nameAr}"]`);
        lines.push(`    A0 --> ${layerId}`);
    });

    const ops = autonomousModel?.full?.operationsSections || [];
    ops.forEach(section => {
        const sectionId = section.num.replace(/-/g, '_');
        lines.push(`    ${sectionId}["${section.num}<br/>${section.nameAr}"]`);
        lines.push(`    A0 -. تشغيل .-> ${sectionId}`);
    });

    return lines.join('\n');
}

function buildMermaidHighPerformance(highPerformance) {
    const lines = ['flowchart LR'];
    lines.push('    INT[Internal Network] --> DATA[Data & Flows]');
    lines.push('    EXT[External Network] --> DATA');
    lines.push('    DATA --> ERP[ERP/CRM/SCM/WMS]');
    lines.push('    ERP --> QA[Digital Product Quality]');
    lines.push('    QA --> GOV[Bot Governance]');
    lines.push('    GOV --> ARC[Archive & Compliance]');
    lines.push('    ARC --> CEO[Executive Dashboard]');

    if ((highPerformance?.stats?.platformCount || 0) >= 6) {
        lines.push('    ERP --> BOTS[Bot Orchestration Layer]');
        lines.push('    BOTS --> GOV');
    }

    return lines.join('\n');
}

function buildSummary(
    executionModel,
    engineeringMap,
    domainModel,
    autonomousModel,
    highPerformance
) {
    const totalDepartments = executionModel.length;
    const totalEmployees = executionModel.reduce((sum, dept) => sum + dept.totalEmployees, 0);
    const departmentsWithBots = executionModel.filter(dept => dept.botAgent).length;
    const avgRating = Math.round(
        executionModel.reduce((sum, dept) => sum + (dept.rating || 0), 0) /
            Math.max(totalDepartments, 1)
    );

    return {
        generatedAt: now(),
        totalDepartments,
        totalEmployees,
        departmentsWithBots,
        engineeringTracks: engineeringMap.tracks.length,
        domainsCount: domainModel.length,
        domainUnitsCount: domainModel.reduce((sum, item) => sum + (item.unitsCount || 0), 0),
        autonomousLayersCount: autonomousModel.layersCount,
        autonomousAgentsCount: autonomousModel.agentsCount,
        autonomousKpisCount: autonomousModel.kpisCount,
        internalNetworkZones: highPerformance.stats.internalZones,
        externalNetworkChannels: highPerformance.stats.externalChannels,
        informationFlowTypes: highPerformance.stats.flowTypes,
        enterprisePlatforms: highPerformance.stats.platformCount,
        qualityUnits: highPerformance.stats.qualityUnits,
        averageDepartmentRating: avgRating,
        executionPrinciple: 'التخطيط + التنفيذ + القياس + التحسين + الإتقان',
        recommendation:
            'تفعيل متابعة يومية للقسم + مراجعة أسبوعية للبوت + تحديث شهري للمهام والمسارات التدريبية.'
    };
}

async function generateEnterpriseOrganizationReport() {
    ensureDir(REPORTS_DIR);

    const context = buildMaps();
    const executionModel = buildDepartmentExecutionModel(context);
    const domainModel = buildDomainModel(context);
    const autonomousModel = buildAutonomousModel(context);
    const highPerformance = buildHighPerformanceModel(context);
    const operationsNetwork = buildOperationsNetwork(executionModel);
    const engineeringMap = buildEngineeringMap(context.operatingData);
    const mermaid = {
        orgChart: buildMermaidOrgChart(executionModel),
        operationsNetwork: buildMermaidOperationsNetwork(operationsNetwork),
        domainsMap: buildMermaidDomainMap(domainModel),
        infrastructureNetwork: buildMermaidInfraNetwork(domainModel),
        autonomousFramework: buildMermaidAutonomousFramework(autonomousModel),
        highPerformanceStack: buildMermaidHighPerformance(highPerformance)
    };
    const summary = buildSummary(
        executionModel,
        engineeringMap,
        domainModel,
        autonomousModel,
        highPerformance
    );

    const report = {
        title: 'تقرير الهيكلة الإدارية والتشغيلية المؤسسية — شيخة',
        generatedAt: now(),
        summary,
        engineeringMap,
        domains: domainModel,
        autonomous: autonomousModel,
        highPerformance,
        mermaid,
        departments: executionModel,
        operationsNetwork
    };

    writeJson(path.join(REPORTS_DIR, 'enterprise-organization-report.json'), report);
    writeJson(path.join(REPORTS_DIR, 'enterprise-organization-summary.json'), summary);
    writeJson(path.join(REPORTS_DIR, 'engineering-structure.json'), engineeringMap);
    writeJson(path.join(REPORTS_DIR, 'market-community-infrastructure.json'), domainModel);
    writeJson(
        path.join(REPORTS_DIR, 'autonomous-self-healing-framework.json'),
        autonomousModel.full
    );
    writeJson(
        path.join(REPORTS_DIR, 'network-flow-archiving-system.json'),
        highPerformance.network
    );
    writeJson(path.join(REPORTS_DIR, 'digital-enterprise-stack.json'), highPerformance.stack);
    writeJson(
        path.join(REPORTS_DIR, 'product-quality-digital-division.json'),
        highPerformance.quality
    );
    writeJson(
        path.join(REPORTS_DIR, 'bot-performance-governance.json'),
        highPerformance.governance
    );

    return report;
}

module.exports = {
    generateEnterpriseOrganizationReport
};
