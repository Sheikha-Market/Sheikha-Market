#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WELLBEING_SYSTEM_PATH = path.join(ROOT_DIR, 'data', 'org', 'bot-digital-wellbeing-system.json');
const CARDS_PATH = path.join(ROOT_DIR, 'reports', 'organization', 'bot-job-cards.json');
const GOVERNANCE_PATH = path.join(ROOT_DIR, 'reports', 'operations', 'bot-governance', 'bot-governance-latest.json');
const OUT_DIR = path.join(ROOT_DIR, 'reports', 'operations', 'bot-wellbeing');

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function now() {
    return new Date().toISOString();
}

function pickBand(score, bands) {
    return bands.find(band => score >= band.min && score <= band.max) || bands[bands.length - 1];
}

function scoreBot(card, governanceEntry, dimensions) {
    const base = governanceEntry?.finalScore || card?.evaluation?.score || 70;
    const violations = governanceEntry?.violations?.totalViolations || 0;

    const workloadBalance = clamp(100 - (violations * 8), 40, 100);
    const qualityStability = clamp(base, 0, 100);
    const learningFreshness = clamp((card?.qualifications?.learningPath?.length || 1) * 20, 50, 100);
    const complianceSafety = clamp(100 - ((governanceEntry?.penalty || 0) * 4), 30, 100);
    const recoveryHealth = clamp(base - (violations * 5), 35, 100);

    const weighted = Math.round(
        workloadBalance * (dimensions[0]?.weight || 0.25) +
        qualityStability * (dimensions[1]?.weight || 0.25) +
        learningFreshness * (dimensions[2]?.weight || 0.20) +
        complianceSafety * (dimensions[3]?.weight || 0.15) +
        recoveryHealth * (dimensions[4]?.weight || 0.15)
    );

    return {
        baseScore: base,
        workloadBalance,
        qualityStability,
        learningFreshness,
        complianceSafety,
        recoveryHealth,
        wellbeingScore: clamp(weighted, 0, 100)
    };
}

function main() {
    const wellbeingSystem = readJson(WELLBEING_SYSTEM_PATH);
    const cardsReport = readJson(CARDS_PATH);
    const governanceReport = readJson(GOVERNANCE_PATH);

    if (!wellbeingSystem || !cardsReport || !governanceReport) {
        console.error('❌ مدخلات دورة جودة الحياة للبوتات غير مكتملة.');
        process.exitCode = 1;
        return;
    }

    const cards = cardsReport.cards || [];
    const evaluationRows = governanceReport.evaluation || [];
    const evalByBot = new Map(evaluationRows.map(item => [item.botId, item]));

    const records = cards.map(card => {
        const gov = evalByBot.get(card.botId) || null;
        const metrics = scoreBot(card, gov, wellbeingSystem.dimensions || []);
        const band = pickBand(metrics.wellbeingScore, wellbeingSystem.statusBands || []);

        return {
            botId: card.botId,
            cardId: card.cardId,
            nameAr: card.nameAr,
            department: card.department,
            metrics,
            status: band.name,
            color: band.color,
            interventions: wellbeingSystem.interventions?.[band.name] || [],
            updatedAt: now()
        };
    });

    const avgScore = Math.round(records.reduce((sum, record) => sum + record.metrics.wellbeingScore, 0) / Math.max(records.length, 1));
    const riskCount = records.filter(record => record.status === 'risk').length;
    const watchCount = records.filter(record => record.status === 'watch').length;

    const summary = {
        generatedAt: now(),
        totalBots: records.length,
        averageWellbeingScore: avgScore,
        flourishing: records.filter(record => record.status === 'flourishing').length,
        stable: records.filter(record => record.status === 'stable').length,
        watch: watchCount,
        risk: riskCount,
        globalStatus: riskCount > 2 ? 'critical' : watchCount > 5 ? 'warning' : 'healthy'
    };

    const report = {
        title: 'دورة نظام جودة الحياة الرقمية للبوتات',
        generatedAt: now(),
        system: wellbeingSystem._meta,
        summary,
        records,
        actions: [
            'تخفيف الأحمال للبوتات في حالة watch/risk',
            'جدولة تدريب معرفي أسبوعي إلزامي',
            'رفع تقرير جودة الحياة للإدارة التنفيذية',
            'إعادة معايرة الأوزان شهرياً'
        ]
    };

    const stamp = now().replace(/[:.]/g, '-').slice(0, 19);
    writeJson(path.join(OUT_DIR, `bot-wellbeing-${stamp}.json`), report);
    writeJson(path.join(OUT_DIR, 'bot-wellbeing-latest.json'), report);

    console.log('✅ اكتملت دورة جودة الحياة الرقمية للبوتات.');
    console.log(`✅ المتوسط: ${summary.averageWellbeingScore}/100 | الحالة: ${summary.globalStatus}`);
    console.log('📁 reports/operations/bot-wellbeing/bot-wellbeing-latest.json');
}

main();
