#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BOTS_PATH = path.join(ROOT_DIR, 'data', 'org', 'bots-workforce.json');
const GOV_PATH = path.join(ROOT_DIR, 'data', 'org', 'bot-performance-governance.json');
const OUT_DIR = path.join(ROOT_DIR, 'reports', 'organization');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function now() {
    return new Date().toISOString();
}

function createDefaultProcedures(bot) {
    return [
        `استلام المهمة من ${bot.dept}`,
        'تحقق من السياسات والامتثال قبل التنفيذ',
        'تنفيذ المهمة عبر خطوات معيارية موثقة',
        'توثيق المخرجات وربطها برقم المعاملة',
        'رفع تقرير أداء يومي للإدارة المختصة'
    ];
}

function createDefaultDigitalQualifications(bot) {
    return {
        digital: [
            'إجادة التعامل مع واجهات API وبيئات الأنظمة الرقمية',
            'فهم نماذج البيانات والـ Metadata',
            'التعامل مع أحداث logs وقياسات الأداء',
            'الالتزام بمعايير الأمان والحوكمة'
        ],
        knowledge: bot.qualifications || [],
        learningPath: bot.training || []
    };
}

function createSkillsAndHobbies(bot) {
    return {
        skills: [
            'تحليل البيانات التشغيلية',
            'حل المشكلات',
            'العمل التعاوني بين الأنظمة',
            'التوثيق الآلي'
        ],
        hobbies: [
            'تحسين النماذج',
            'اكتشاف الأنماط',
            'تجريب playbooks جديدة',
            'المراجعة الذاتية للنتائج'
        ],
        achievements: [
            `إدارة مهام ${bot.role || bot.nameEn}`,
            `دعم قسم ${bot.dept} باستمرارية تشغيلية`,
            'المساهمة في رفع الأتمتة المؤسسية',
            'تحسين جودة القرارات المدعومة بالبيانات'
        ]
    };
}

function baseScore(bot) {
    const kpiCount = (bot.kpis || []).length;
    return Math.min(95, 72 + kpiCount * 3);
}

function buildViolationProfile() {
    return {
        totalViolations: 0,
        openViolations: 0,
        lastViolationAt: null,
        categories: [],
        actionsTaken: []
    };
}

function buildCard(bot, governance) {
    const score = baseScore(bot);

    return {
        cardId: `${bot.num}-CARD`,
        botId: bot.num,
        title: bot.role || bot.nameEn,
        nameAr: bot.nameAr,
        nameEn: bot.nameEn,
        department: bot.dept,
        jobDescription: bot.description,
        responsibilities: bot.responsibilities || [],
        missionTasks: bot.responsibilities || [],
        procedures: createDefaultProcedures(bot),
        qualifications: createDefaultDigitalQualifications(bot),
        developmentPlan: {
            shortTerm: ['تحسين الدقة التشغيلية', 'تقليل زمن التنفيذ', 'رفع جودة التوثيق'],
            midTerm: ['زيادة الاستقلالية', 'تحسين التكامل بين الأنظمة', 'رفع جودة التنبؤ'],
            longTerm: ['قيادة ذاتية شبه كاملة', 'تعلم مستمر متقدم', 'مرجعية تخصصية عليا']
        },
        skillsAndProfile: createSkillsAndHobbies(bot),
        evaluation: {
            score,
            ratingBand:
                (governance.evaluationModel.ratingBands || []).find(
                    band => score >= band.min && score <= band.max
                )?.band || 'B',
            kpis: bot.kpis || [],
            governanceWeights: governance.evaluationModel.weights
        },
        violations: buildViolationProfile(),
        compliance: {
            policy: 'BOT-GOVERNANCE-STRICT',
            shariaRef: bot.ref_quran || 'الالتزام بالقيم الإسلامية في الأداء'
        },
        status: bot.status || 'active',
        generatedAt: now()
    };
}

function main() {
    const botsData = readJson(BOTS_PATH);
    const governance = readJson(GOV_PATH);

    const cards = (botsData.bots || []).map(bot => buildCard(bot, governance));
    const report = {
        title: 'بطاقات الوصف الوظيفي الرقمية للبوتات',
        generatedAt: now(),
        totalBots: cards.length,
        cards
    };

    writeJson(path.join(OUT_DIR, 'bot-job-cards.json'), report);

    const summary = {
        generatedAt: now(),
        totalBots: cards.length,
        averageScore: Math.round(
            cards.reduce((sum, card) => sum + card.evaluation.score, 0) / Math.max(cards.length, 1)
        ),
        activeBots: cards.filter(card => card.status === 'active').length
    };

    writeJson(path.join(OUT_DIR, 'bot-job-cards-summary.json'), summary);

    console.log('✅ تم توليد بطاقات الوصف الوظيفي للبوتات.');
    console.log('📁 reports/organization/bot-job-cards.json');
    console.log('📁 reports/organization/bot-job-cards-summary.json');
}

main();
