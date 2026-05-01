#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const PATHS = {
    network: path.join(ROOT_DIR, 'data', 'org', 'network-flow-archiving-system.json'),
    quality: path.join(ROOT_DIR, 'data', 'org', 'product-quality-digital-division.json'),
    governance: path.join(ROOT_DIR, 'reports', 'operations', 'bot-governance', 'bot-governance-latest.json'),
    orgSummary: path.join(ROOT_DIR, 'reports', 'organization', 'enterprise-organization-summary.json'),
    outDir: path.join(ROOT_DIR, 'reports', 'organization')
};

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return null;
    }
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function now() {
    return new Date().toISOString();
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function parseTargetToScore(target) {
    if (!target || typeof target !== 'string') {
        return 70;
    }

    const percentMatch = target.match(/(\d+(?:\.\d+)?)%/);
    if (percentMatch) {
        return clamp(Number(percentMatch[1]), 0, 100);
    }

    if (target.includes('<=') || target.includes('<=')) {
        return 82;
    }

    if (target.includes('>=') || target.includes('>=')) {
        return 88;
    }

    return 75;
}

function computeFlowMetrics(networkData) {
    const internalZones = (networkData?.networkArchitecture?.internalNetwork?.zones || []).length;
    const externalChannels = (networkData?.networkArchitecture?.externalNetwork?.channels || []).length;
    const flowTypes = (networkData?.informationFlows?.flowTypes || []).length;
    const flowCatalog = (networkData?.informationFlows?.flowCatalog || []).length;
    const archiveTiers = (networkData?.archivingSystem?.tiers || []).length;

    const flowReadinessScore = clamp(Math.round(
        (internalZones * 10) +
        (externalChannels * 8) +
        (flowTypes * 12) +
        (flowCatalog * 4) +
        (archiveTiers * 8)
    ), 0, 100);

    return {
        internalZones,
        externalChannels,
        flowTypes,
        flowCatalog,
        archiveTiers,
        flowReadinessScore
    };
}

function computeQualityMetrics(qualityData, governanceData) {
    const qualityUnits = (qualityData?.structure?.units || []).length;
    const qualityKpis = qualityData?.kpis || [];
    const kpiTargetScore = qualityKpis.length > 0
        ? Math.round(qualityKpis.reduce((sum, kpi) => sum + parseTargetToScore(kpi.target), 0) / qualityKpis.length)
        : 70;

    const botAvg = governanceData?.summary?.avgFinalScore || 70;
    const healthyBots = governanceData?.summary?.warnings?.healthy || 0;
    const totalBots = governanceData?.summary?.totalBots || 1;
    const healthyRatioScore = clamp(Math.round((healthyBots / Math.max(totalBots, 1)) * 100), 0, 100);

    const qualityReadinessScore = clamp(Math.round(
        (qualityUnits * 12) +
        (kpiTargetScore * 0.45) +
        (botAvg * 0.30) +
        (healthyRatioScore * 0.13)
    ), 0, 100);

    return {
        qualityUnits,
        qualityKpisCount: qualityKpis.length,
        kpiTargetScore,
        botAvg,
        healthyBots,
        totalBots,
        healthyRatioScore,
        qualityReadinessScore
    };
}

function compareFlowVsQuality(flow, quality) {
    const delta = quality.qualityReadinessScore - flow.flowReadinessScore;
    const balanceIndex = clamp(100 - Math.abs(delta), 0, 100);

    let winner = 'balanced';
    if (delta > 4) {
        winner = 'quality';
    } else if (delta < -4) {
        winner = 'flow';
    }

    return {
        flowScore: flow.flowReadinessScore,
        qualityScore: quality.qualityReadinessScore,
        delta,
        winner,
        balanceIndex,
        recommendation: winner === 'balanced'
            ? 'التوازن جيد: استمر في التحسين المتوازي للتدفقات والجودة.'
            : winner === 'quality'
                ? 'الجودة متقدمة: عزّز هندسة التدفقات والتصنيف والأرشفة.'
                : 'التدفقات متقدمة: ارفع اختبارات الجودة الآلية وبوابات القبول.'
    };
}

function buildNeuralMermaid(flow, quality, comparison) {
    const lines = ['flowchart LR'];
    lines.push('    R["الجذر التشغيلي"]');
    lines.push('    I1["طبقة إدخال التدفقات"]');
    lines.push('    I2["طبقة إدخال الجودة"]');
    lines.push('    H1["عقدة تحليل الشبكات"]');
    lines.push('    H2["عقدة تصنيف البيانات"]');
    lines.push('    H3["عقدة قياس الجودة"]');
    lines.push('    H4["عقدة تقييم البوتات"]');
    lines.push('    O1["مخرجات تدفقات: ' + flow.flowReadinessScore + '/100"]');
    lines.push('    O2["مخرجات جودة: ' + quality.qualityReadinessScore + '/100"]');
    lines.push('    O3["مؤشر التوازن: ' + comparison.balanceIndex + '/100"]');
    lines.push('    R --> I1');
    lines.push('    R --> I2');
    lines.push('    I1 --> H1');
    lines.push('    I1 --> H2');
    lines.push('    I2 --> H3');
    lines.push('    I2 --> H4');
    lines.push('    H1 --> O1');
    lines.push('    H2 --> O1');
    lines.push('    H3 --> O2');
    lines.push('    H4 --> O2');
    lines.push('    O1 --> O3');
    lines.push('    O2 --> O3');

    return lines.join('\n');
}

function generateNeuralComparisonReport() {
    const network = readJson(PATHS.network);
    const quality = readJson(PATHS.quality);
    const governance = readJson(PATHS.governance);
    const orgSummary = readJson(PATHS.orgSummary) || {};

    if (!network || !quality) {
        return {
            ok: false,
            error: 'ملفات التدفقات أو الجودة غير متوفرة.'
        };
    }

    const flowMetrics = computeFlowMetrics(network);
    const qualityMetrics = computeQualityMetrics(quality, governance || {});
    const comparison = compareFlowVsQuality(flowMetrics, qualityMetrics);

    const report = {
        title: 'تقرير تجربة الشبكة العصبية: التدفقات مقابل الجودة',
        generatedAt: now(),
        rootArchitecture: {
            model: 'Neural Governance Graph',
            principle: 'القياس ثم المقارنة ثم التحسين المستمر',
            orgScale: {
                departments: orgSummary.totalDepartments || null,
                bots: orgSummary.departmentsWithBots || null
            }
        },
        flowMetrics,
        qualityMetrics,
        comparison,
        mermaid: {
            neuralTopology: buildNeuralMermaid(flowMetrics, qualityMetrics, comparison)
        },
        nextActions: [
            'رفع flowCatalog وربط جميع التدفقات ببيانات ميتاداتا إلزامية.',
            'تحويل جميع KPIs الجودة إلى قياس لحظي مع تنبيهات SLA.',
            'إضافة بوابة قبول جودة تلقائية قبل أي إصدار إنتاجي.',
            'ربط نتائج تقييم البوتات بخطط تدريب أسبوعية إلزامية.'
        ]
    };

    const outLatest = path.join(PATHS.outDir, 'neural-flow-quality-comparison-latest.json');
    const stamp = now().replace(/[:.]/g, '-').slice(0, 19);
    const outSnapshot = path.join(PATHS.outDir, `neural-flow-quality-comparison-${stamp}.json`);

    writeJson(outLatest, report);
    writeJson(outSnapshot, report);

    return {
        ok: true,
        report,
        outLatest,
        outSnapshot,
        flowScore: flowMetrics.flowReadinessScore,
        qualityScore: qualityMetrics.qualityReadinessScore,
        balanceIndex: comparison.balanceIndex,
        winner: comparison.winner
    };
}

function main() {
    const result = generateNeuralComparisonReport();
    if (!result.ok) {
        console.error(`❌ ${result.error}`);
        process.exitCode = 1;
        return;
    }

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   شيخة — تجربة الشبكة العصبية للتدفقات والجودة     ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`✅ تدفقات: ${result.flowScore}/100`);
    console.log(`✅ جودة:   ${result.qualityScore}/100`);
    console.log(`✅ توازن:  ${result.balanceIndex}/100 | الفائز: ${result.winner}`);
    console.log('📁 التقارير:');
    console.log('   → reports/organization/neural-flow-quality-comparison-latest.json');
    console.log(`   → ${result.outSnapshot.replace(ROOT_DIR + path.sep, '')}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    generateNeuralComparisonReport
};
