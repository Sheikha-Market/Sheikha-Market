#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('./lexer');
const { parse } = require('./parser');
const { typeCheckAst } = require('./type-checker');
const {
    buildWorldlyEngineeringPlan,
} = require(
    '../../core/gardens-dialogue/' +
        'sheikha-pastures-orchards-cultivation-runtime-v1'
);

const FORBIDDEN_ENGINEERING_KEYS = new Set([
    'هندسة_الآخرة',
    'أبعاد_الجنة',
    'كميات_الغيب',
    'مواد_الجنة',
    'محاكاة_الجنة',
]);

function clean(value) {
    return String(value || '').trim().replace(/^"|"$/g, '');
}

function number(value, key) {
    const match = clean(value).match(/^[0-9]+(?:\.[0-9]+)?/);
    if (!match) throw new Error(`الحقل ${key} يحتاج رقمًا موجبًا.`);
    return Number(match[0]);
}

function truthy(value) {
    return ['نعم', 'صحيح', 'موثق', 'متحقق'].includes(clean(value));
}

function properties(node) {
    return Object.fromEntries(
        (node.properties || []).map((entry) => [entry.key, clean(entry.value)])
    );
}

function assertSacredIsolation(cultivation) {
    for (const property of cultivation.properties || []) {
        if (FORBIDDEN_ENGINEERING_KEYS.has(property.key)) {
            const error = new Error(
                `الحقل ${property.key} غيبي كلامي ولا يدخل الحساب الهندسي.`
            );
            error.code = 'SHK-CULT-UNSEEN-001';
            throw error;
        }
    }
}

function splitList(value) {
    return clean(value).split(/[،,]/).map((entry) => entry.trim()).filter(Boolean);
}

function buildCultivationGraph(declarations) {
    const nodes = declarations.map((declaration) => ({
        id: declaration.name,
        kind: declaration.declarationKind,
        keyword: declaration.sourceKeyword,
        properties: properties(declaration),
    }));
    const ids = new Set(nodes.map((entry) => entry.id));
    const edges = [];
    const unresolvedReferences = [];
    for (const entry of nodes) {
        for (const target of splitList(entry.properties.يرتبط)) {
            edges.push({ from: entry.id, to: target, type: 'يرتبط' });
            if (!ids.has(target)) unresolvedReferences.push(target);
        }
    }
    return {
        nodes,
        edges,
        unresolvedReferences: [...new Set(unresolvedReferences)],
        continuousCycle: [
            'soil', 'seed', 'sprout', 'cultivation', 'irrigation',
            'growth', 'fruit', 'controlled_propagation',
        ],
        pathways: {
            fromScratch: 'SOIL_TO_SEED_TO_NURSERY_TO_HARVEST',
            acceleratedTransplant:
                'LICENSED_ROOT_TO_TRANSPLANT_TO_ADAPTATION_TO_HARVEST',
        },
        continuityRule: 'CONTINUE_ELIGIBLE_PASTURES_HOLD_BLOCKED_PASTURES',
    };
}

function buildEngineeringAdmissionReview(plan, graph) {
    const blockers = [];
    const unresolvedInputs = plan.resourceBalance?.unresolvedEngineeringInputs || [];

    if (graph.unresolvedReferences.length > 0) {
        blockers.push('UNRESOLVED_LANGUAGE_REFERENCES');
    }
    if (unresolvedInputs.length > 0) {
        blockers.push('UNRESOLVED_ENGINEERING_INPUTS');
    }
    if (!plan.evidenceIndependentlyVerified) {
        blockers.push('INDEPENDENT_EVIDENCE_VERIFICATION_REQUIRED');
    }
    if (!plan.issuedForConstruction) {
        blockers.push('NOT_ISSUED_FOR_CONSTRUCTION');
    }
    if (!plan.physicalExecutionAuthorized) {
        blockers.push('PHYSICAL_EXECUTION_NOT_AUTHORIZED');
    }

    return {
        schemaVersion: '1.0.0',
        decision: blockers.length === 0 ? 'READY_FOR_CONTROLLED_EXECUTION' : 'BLOCKED',
        reviewable: graph.unresolvedReferences.length === 0,
        executable: false,
        blockers,
        evidence: {
            languageReferencesResolved: graph.unresolvedReferences.length === 0,
            independentVerification: plan.evidenceIndependentlyVerified,
            unresolvedEngineeringInputCount: unresolvedInputs.length,
            unresolvedEngineeringInputs: unresolvedInputs,
        },
        nextGate: unresolvedInputs.length > 0
            ? 'COMPLETE_SITE_SPECIFIC_ENGINEERING_STUDIES'
            : 'INDEPENDENT_DISCIPLINE_REVIEW',
        rule: 'COMPILATION_NEVER_AUTHORIZES_PHYSICAL_EXECUTION',
    };
}

function compileCultivationSource(source, options = {}) {
    const ast = parse(lex(source));
    const typeCheck = typeCheckAst(ast);
    if (!typeCheck.ok) {
        const error = new Error('فشل فحص أنواع برنامج لغة شيخة.');
        error.code = 'SHK-CULT-TYPECHECK-FAILED';
        error.diagnostics = typeCheck.diagnostics;
        throw error;
    }

    const declarations = (ast.body || []).filter(
        (entry) => entry.type === 'EntityDeclaration' &&
            entry.declarationKind
    );
    const gardens = declarations.filter(
        (entry) => entry.declarationKind === 'garden'
    );
    const primaryDeclarations = gardens.length > 0
        ? gardens
        : declarations.filter(
            (entry) => entry.declarationKind === 'cultivation'
        );
    if (primaryDeclarations.length !== 1) {
        const error = new Error(
            'يجب أن يحتوي الملف جنة دنيوية واحدة أو مغرسًا رئيسيًا واحدًا.'
        );
        error.code = 'SHK-CULT-DECLARATION-COUNT';
        throw error;
    }

    const cultivation = primaryDeclarations[0];
    for (const declaration of declarations) assertSacredIsolation(declaration);
    const values = properties(cultivation);
    if (cultivation.declarationKind === 'garden' && values.النطاق !== 'الدنيا') {
        const error = new Error(
            'الجنة الهندسية في لغة شيخة يجب أن تصرح النطاق: الدنيا.'
        );
        error.code = 'SHK-CULT-WORLDLY-SCOPE-REQUIRED';
        throw error;
    }
    const cultivationGraph = buildCultivationGraph(declarations);
    if (cultivationGraph.unresolvedReferences.length > 0) {
        const error = new Error(
            `مراجع غير معرفة: ${cultivationGraph.unresolvedReferences.join('، ')}`
        );
        error.code = 'SHK-CULT-UNRESOLVED-REFERENCE';
        throw error;
    }
    const input = {
        siteAreaM2: number(values.المساحة, 'المساحة'),
        populationTarget: number(values.السكان, 'السكان'),
        livestockHeads: number(values.الماشية || '0', 'الماشية'),
        location: values.الموقع || '',
        waterStudy: values.دراسة_الماء || '',
        soilStudy: values.دراسة_التربة || '',
        budgetEnvelope: values.الميزانية || '',
        landRightsVerified: truthy(values.حقوق_الأرض),
        topographicSurvey: values.المسح_الطبوغرافي || '',
        hazardStudy: values.دراسة_المخاطر_والسيول || '',
        authorityHavingJurisdiction: values.جهة_الاختصاص || '',
        evidenceIndependentlyVerified: truthy(values.التحقق_المستقل),
    };
    const plan = buildWorldlyEngineeringPlan(input);
    const admissionReview = buildEngineeringAdmissionReview(
        plan,
        cultivationGraph
    );

    return {
        schemaVersion: '1.0.0',
        system: 'SHEIKHA_LANGUAGE_CULTIVATION_COMPILER_V1',
        sourceLanguage: 'sheikha',
        sourceExtension: '.shk',
        declaration: cultivation.name,
        declarationKind: cultivation.declarationKind,
        cultivationGraph,
        ast,
        typeCheck,
        engineeringPlan: plan,
        admissionReview,
        execution: {
            requested: options.execute === true,
            authorized: false,
            performed: false,
        },
    };
}

function compileCultivationFile(inputPath) {
    return compileCultivationSource(fs.readFileSync(inputPath, 'utf8'));
}

if (require.main === module) {
    const inputPath = process.argv[2];
    const outFlag = process.argv.indexOf('--out');
    const outputPath = outFlag >= 0 ? process.argv[outFlag + 1] : '';
    if (!inputPath || !outputPath) {
        process.stderr.write(
            'Usage: node cultivation-compiler.js input.shk --out plan.json\n'
        );
        process.exit(1);
    }
    const result = compileCultivationFile(path.resolve(inputPath));
    const absoluteOutput = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
    fs.writeFileSync(
        absoluteOutput,
        `${JSON.stringify(result, null, 2)}\n`,
        'utf8'
    );
    process.stdout.write(`SHEIKHA_CULTIVATION_COMPILED=${absoluteOutput}\n`);
    process.stdout.write(
        `SHEIKHA_ENGINEERING_STATUS=${result.engineeringPlan.status}\n`
    );
}

module.exports = {
    FORBIDDEN_ENGINEERING_KEYS,
    buildCultivationGraph,
    buildEngineeringAdmissionReview,
    compileCultivationSource,
    compileCultivationFile,
};
