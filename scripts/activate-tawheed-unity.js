#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const OUTPUT_JSON = path.join(process.cwd(), 'data', 'SHEIKHA-TAWHEED-UNITY.json');
const OUTPUT_MD = path.join(process.cwd(), 'SHEIKHA-TAWHEED-UNITY-REPORT.md');

function getCorePrinciples() {
    return {
        foundation: 'لا إله إلا الله',
        methodology: [
            'لا ضرر ولا ضرار',
            'الصدق والأمانة',
            'العدل والشفافية',
            'المصلحة العامة والتنمية النافعة'
        ],
        governance: [
            'مسؤولية واضحة لكل قرار تقني',
            'توثيق وتشغيل قابل للتدقيق',
            'أقل صلاحيات ممكنة في الوصول',
            'منع إساءة الاستخدام والتغرير'
        ],
        operationalGoals: [
            'تمكين رواد الأعمال ببيئات تطوير منظمة',
            'تكامل تقني آمن مع الشركاء',
            'حوكمة بيانات وأمن مستمر',
            'قياس أثر اقتصادي واجتماعي فعلي'
        ]
    };
}

async function collectCurrentStatus() {
    const checks = [
        ['Auto Activation Watch', 'AUTO-GCLOUD-ACTIVATION-STATUS.json'],
        ['Google Cloud Activation Report', 'SHEIKHA-GCLOUD-UNIFIED-ACTIVATION-REPORT.md'],
        ['CNTXT Enterprise Request', 'CNTXT-ENTERPRISE-ACTIVATION-REQUEST.json'],
        ['Production Covenant Sync', 'PRODUCTION-COVENANT-SYNC-REPORT.json'],
        ['LLM Dialogue Training Script', 'scripts/activate-llm-dialogue-training.js'],
        ['Summit Pack Script', 'scripts/generate-google-summit-pack.js'],
        ['Entrepreneurs Enablement Script', 'scripts/enable-entrepreneurs-organization.js']
    ];

    const result = [];
    for (const [name, relPath] of checks) {
        const fullPath = path.join(process.cwd(), relPath);
        try {
            const stat = await fs.stat(fullPath);
            result.push({ name, path: relPath, exists: true, size: stat.size });
        } catch (_error) {
            result.push({ name, path: relPath, exists: false, size: 0 });
        }
    }

    return result;
}

async function writeOutputs(payload) {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.writeFile(OUTPUT_JSON, JSON.stringify(payload, null, 2), 'utf8');

    const md = [
        '# تقرير توحيد منظومة شيخة',
        '',
        `- التاريخ: ${payload.timestamp}`,
        `- حالة التفعيل: ${payload.status}`,
        '',
        '## الأساس',
        `- ${payload.principles.foundation}`,
        '',
        '## المنهج',
        ...payload.principles.methodology.map(x => `- ${x}`),
        '',
        '## أهداف التشغيل',
        ...payload.principles.operationalGoals.map(x => `- ${x}`),
        '',
        '## التحقق من مكونات المنظومة',
        ...payload.components.map(c => `- ${c.name}: ${c.exists ? '✅' : '❌'} (${c.path})`),
        '',
        '## التالي',
        '- الاستمرار بتشغيل المراقب التلقائي 24/7 حتى اكتمال متطلبات الفوترة المؤسسية.',
        '- اعتماد بروتوكول الحوار البنّاء بين الشركاء عبر حزمة التدريب.'
    ].join('\n');

    await fs.writeFile(OUTPUT_MD, md, 'utf8');
}

async function main() {
    const principles = getCorePrinciples();
    const components = await collectCurrentStatus();

    const payload = {
        timestamp: new Date().toISOString(),
        status: 'active',
        principles,
        components,
        activation: {
            mode: 'governance-and-operations',
            note: 'تم توحيد المبادئ كمرجع تشغيلي وتقني للمنظومة.'
        }
    };

    await writeOutputs(payload);

    console.log('✅ تم تفعيل ميثاق توحيد المنظومة');
    console.log('📄 data/SHEIKHA-TAWHEED-UNITY.json');
    console.log('📄 SHEIKHA-TAWHEED-UNITY-REPORT.md');
}

main().catch(error => {
    console.error('❌ فشل التفعيل:', error.message);
    process.exit(1);
});
