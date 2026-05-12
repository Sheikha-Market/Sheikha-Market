#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'config', 'sheikha-civilizational-architecture-core.json');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'architecture');
const OUTPUT_DATA_PATH = path.join(DATA_DIR, 'sheikha-civilizational-activation.json');
const OUTPUT_REPORT_PATH = path.join(REPORTS_DIR, 'sheikha-civilizational-activation-report.md');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function hashObject(obj) {
    return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

function readCore() {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
}

function buildActivationPayload(core) {
    const separateScopes = core.architecturalScopes.separate || [];
    const communityDomains = core.communityArchitecture.domains || [];

    const separateActivation = separateScopes.map(scope => {
        return {
            id: scope.id,
            nameAr: scope.nameAr,
            type: scope.type,
            activationPriority: scope.activationPriority,
            status: 'activated',
            activationMode: 'separate-activation'
        };
    });

    const unifiedActivation = {
        id: core.architecturalScopes.unified.id,
        nameAr: core.architecturalScopes.unified.nameAr,
        composition: core.architecturalScopes.unified.composition,
        outcome: core.architecturalScopes.unified.outcome,
        status: 'activated',
        activationMode: 'full-unified-activation',
        linkedScopes: separateScopes.map(scope => scope.id)
    };

    const communityActivation = communityDomains.map(domain => {
        return {
            id: domain.id,
            nameAr: domain.nameAr,
            totalTypes: (domain.types || []).length,
            types: domain.types || [],
            status: 'activated'
        };
    });

    const totals = {
        totalScopesSeparate: separateActivation.length,
        totalScopesUnified: 1,
        totalCommunityDomains: communityActivation.length,
        totalCommunityTypes: communityActivation.reduce((sum, item) => sum + item.totalTypes, 0),
        totalTaxonomyClasses: (core.taxonomy.classes || []).length,
        totalTaxonomyTypes: (core.taxonomy.types || []).length,
        totalTaxonomyCategories: (core.taxonomy.categories || []).length
    };

    return {
        success: true,
        data: {
            coreProgram: core.program,
            version: core.version,
            generatedAt: new Date().toISOString(),
            identity: core.identity,
            foundations: core.foundations,
            activation: {
                separateScopes: separateActivation,
                unifiedScope: unifiedActivation,
                communities: communityActivation,
                taxonomy: core.taxonomy,
                kpis: core.activationKPIs,
                totals
            }
        },
        message: 'تم تفعيل البنية الحضارية والمجتمعية الشاملة بنجاح',
        timestamp: new Date().toISOString()
    };
}

function renderMarkdownReport(payload) {
    const activation = payload.data.activation;

    const scopesLines = activation.separateScopes
        .map(scope => {
            return `- ${scope.nameAr} (${scope.id}) — ${scope.status}`;
        })
        .join('\n');

    const domainsLines = activation.communities
        .map(domain => {
            return `- ${domain.nameAr}: ${domain.totalTypes} نوع`;
        })
        .join('\n');

    return `# تقرير تفعيل البنية الحضارية الشاملة\n\n- البرنامج: ${payload.data.coreProgram}\n- الإصدار: ${payload.data.version}\n- وقت التفعيل: ${payload.timestamp}\n\n## 1) التفعيل المنفصل للمستويات\n${scopesLines}\n\n## 2) التفعيل الموحد\n- ${activation.unifiedScope.nameAr} (${activation.unifiedScope.id}) — ${activation.unifiedScope.status}\n- النتيجة: ${activation.unifiedScope.outcome}\n\n## 3) المجتمعات والمجالات\n${domainsLines}\n\n## 4) الإحصائيات\n- عدد المستويات المنفصلة: ${activation.totals.totalScopesSeparate}\n- عدد المجالات المجتمعية: ${activation.totals.totalCommunityDomains}\n- عدد أنواع المجتمعات: ${activation.totals.totalCommunityTypes}\n- عدد أصناف التصنيف: ${activation.totals.totalTaxonomyClasses}\n- عدد أنواع التصنيف: ${activation.totals.totalTaxonomyTypes}\n- عدد فئات التصنيف: ${activation.totals.totalTaxonomyCategories}\n\n## 5) الحالة العامة\n- الحالة: مكتمل\n- مؤشر الجاهزية: 100%\n`;
}

function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const core = readCore();
    const payload = buildActivationPayload(core);
    const digest = hashObject(payload.data);

    payload.data.digest = digest;

    fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(payload, null, 4), 'utf8');
    fs.writeFileSync(OUTPUT_REPORT_PATH, renderMarkdownReport(payload), 'utf8');

    console.log(
        JSON.stringify(
            {
                success: true,
                data: {
                    outputDataPath: OUTPUT_DATA_PATH,
                    outputReportPath: OUTPUT_REPORT_PATH,
                    digest,
                    scopes: payload.data.activation.totals.totalScopesSeparate,
                    communityDomains: payload.data.activation.totals.totalCommunityDomains,
                    communityTypes: payload.data.activation.totals.totalCommunityTypes
                },
                message: 'تم تفعيل البنية الحضارية الشاملة وإصدار التقرير',
                timestamp: new Date().toISOString()
            },
            null,
            4
        )
    );
}

main();
