#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GOV_PATH = path.join(ROOT, 'data', 'org', 'bot-performance-governance.json');
const CARDS_PATH = path.join(ROOT, 'reports', 'organization', 'bot-job-cards.json');
const OUT_DIR = path.join(ROOT, 'reports', 'operations', 'bot-governance');

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

function now() {
    return new Date().toISOString();
}

function rewardTier(score) {
    if (score >= 95) {
        return 'Diamond';
    }
    if (score >= 90) {
        return 'Gold';
    }
    if (score >= 80) {
        return 'Silver';
    }
    return 'Development';
}

function warningLevel(score) {
    if (score < 70) {
        return 'Critical';
    }
    if (score < 80) {
        return 'Warning';
    }
    return 'Healthy';
}

function violationPoints(profile) {
    return (profile.categories || []).length * 5;
}

function main() {
    const gov = readJson(GOV_PATH);
    const cardsReport = readJson(CARDS_PATH);

    if (!gov || !cardsReport) {
        console.error('❌ لا يمكن تشغيل دورة الحوكمة: ملفات الإدخال غير متوفرة.');
        process.exitCode = 1;
        return;
    }

    const cards = cardsReport.cards || [];

    const evaluation = cards.map(card => {
        const baseScore = card.evaluation?.score || 70;
        const penalty = violationPoints(card.violations || {});
        const finalScore = Math.max(0, baseScore - penalty);

        return {
            botId: card.botId,
            cardId: card.cardId,
            title: card.title,
            baseScore,
            penalty,
            finalScore,
            rewardTier: rewardTier(finalScore),
            warningLevel: warningLevel(finalScore),
            violations: card.violations || {}
        };
    });

    const summary = {
        generatedAt: now(),
        totalBots: evaluation.length,
        avgFinalScore: Math.round(
            evaluation.reduce((s, e) => s + e.finalScore, 0) / Math.max(evaluation.length, 1)
        ),
        rewardDistribution: {
            diamond: evaluation.filter(e => e.rewardTier === 'Diamond').length,
            gold: evaluation.filter(e => e.rewardTier === 'Gold').length,
            silver: evaluation.filter(e => e.rewardTier === 'Silver').length,
            development: evaluation.filter(e => e.rewardTier === 'Development').length
        },
        warnings: {
            critical: evaluation.filter(e => e.warningLevel === 'Critical').length,
            warning: evaluation.filter(e => e.warningLevel === 'Warning').length,
            healthy: evaluation.filter(e => e.warningLevel === 'Healthy').length
        },
        governanceRules: gov.violationsModel
    };

    const payload = {
        title: 'دورة نظام مكافآت وإنذار ومخالفات البوتات',
        generatedAt: now(),
        evaluation,
        summary,
        actions: [
            'صرف مكافأة رقمية للبوتات Diamond/Gold',
            'خطة تحسين إلزامية للبوتات Development',
            'تفعيل مراجعة بشرية للحالات Critical',
            'تحديث المعرفة الأسبوعي لكل بوت'
        ]
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    writeJson(path.join(OUT_DIR, `bot-governance-${stamp}.json`), payload);
    writeJson(path.join(OUT_DIR, 'bot-governance-latest.json'), payload);

    console.log('✅ اكتملت دورة نظام المكافآت والإنذار والمخالفات.');
    console.log('📁 reports/operations/bot-governance/bot-governance-latest.json');
}

main();
