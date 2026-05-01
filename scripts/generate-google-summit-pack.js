#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function readJsonIfExists(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (_error) {
        return null;
    }
}

async function readTextIfExists(filePath) {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (_error) {
        return '';
    }
}

function buildArabicWelcome() {
    return [
        'الموضوع: ترحيب رسمي بشراكة تقنية بنّاءة بين شيخة وGoogle',
        '',
        'السادة فريق Google المحترمين،',
        'نرحب بكم رسميًا باسم منظومة شيخة للتعاون التقني البنّاء.',
        'هدفنا المشترك: تمكين اقتصادي منتج، رفع الكفاءة، وتعزيز الأمان، وفق مبدأ: لا ضرر ولا ضرار.',
        'نقترح بدء تعاون عملي على ثلاث مسارات:',
        '1) الحوكمة والأمان (IAM, Audit, Least Privilege).',
        '2) البيانات والذكاء الاصطناعي المسؤول (Data/AI with measurable impact).',
        '3) التمكين الإنتاجي للشباب عبر أدوات سحابية قابلة للتوسع.',
        'نؤكد التزامنا بالشفافية، الامتثال، واحترام الأنظمة المحلية والدولية.',
        'وتفضلوا بقبول فائق الاحترام.',
        'منظومة شيخة | market@sheikha.top'
    ].join('\n');
}

function buildEnglishWelcome() {
    return [
        'Subject: Official Welcome for a Constructive Technology Partnership between Sheikha and Google',
        '',
        'Dear Google Team,',
        'We officially welcome a constructive technical partnership with Sheikha.',
        'Our shared objective is measurable impact: productive enablement, operational efficiency, and secure growth under a strict no-harm principle.',
        'We propose starting with three practical tracks:',
        '1) Governance & Security (IAM, Audit, Least Privilege).',
        '2) Responsible Data & AI (clear KPIs and safeguards).',
        '3) Scalable enablement for youth-led productive initiatives.',
        'We are committed to transparency, compliance, and lawful operations.',
        'Respectfully,',
        'Sheikha Platform | market@sheikha.top'
    ].join('\n');
}

function buildDialogueModel() {
    return {
        meetingName: 'Sheikha-Google Constructive Summit',
        durationMinutes: 45,
        language: 'Arabic + English summary',
        structure: [
            {
                phase: 'Opening (5 min)',
                objective: 'Establish shared principles and trust',
                script: [
                    'نرحب بكم ونؤكد مبدأ التعاون النافع بلا ضرر.',
                    'Today we focus on concrete outcomes, timelines, and accountability.'
                ]
            },
            {
                phase: 'Shared Goals (10 min)',
                objective: 'Align on impact KPIs',
                script: [
                    'الهدف 1: رفع الجاهزية السحابية المؤسسية.',
                    'الهدف 2: تمكين مشاريع إنتاجية قابلة للقياس.',
                    'الهدف 3: تشغيل أمني مستدام مع تدقيق مستمر.'
                ]
            },
            {
                phase: 'Technical Plan (15 min)',
                objective: 'Agree on implementation milestones',
                script: [
                    'M1: Billing + API enablement + IAM baseline.',
                    'M2: Data/AI pilot with governance controls.',
                    'M3: Scale-out with monitoring and cost guardrails.'
                ]
            },
            {
                phase: 'Risks & Safeguards (10 min)',
                objective: 'Prevent harm and reduce uncertainty',
                script: [
                    'تحديد المخاطر: تكلفة، أمان، جودة بيانات.',
                    'تحديد الضوابط: Budget alerts, access boundaries, incident playbooks.'
                ]
            },
            {
                phase: 'Close (5 min)',
                objective: 'Assign owners and due dates',
                script: [
                    'تأكيد المخرجات المكتوبة ومسؤول كل مهمة.',
                    'تحديد اجتماع المتابعة خلال 7 أيام.'
                ]
            }
        ],
        successCriteria: [
            'Institutional billing linked to production project',
            'Required APIs enabled with audit evidence',
            'Operator principal granted least-privilege roles',
            'First impact pilot started with measurable KPI dashboard'
        ]
    };
}

async function main() {
    const root = process.cwd();
    const activationStatus = await readJsonIfExists(
        path.join(root, 'AUTO-GCLOUD-ACTIVATION-STATUS.json')
    );
    const covenantReport = await readJsonIfExists(
        path.join(root, 'PRODUCTION-COVENANT-SYNC-REPORT.json')
    );
    const gcReportText = await readTextIfExists(
        path.join(root, 'SHEIKHA-GCLOUD-UNIFIED-ACTIVATION-REPORT.md')
    );

    const results = {
        timestamp: new Date().toISOString(),
        cloudReadiness: activationStatus?.readiness?.ready === true ? 'ready' : 'pending',
        cloudBlockers: {
            gcloudInstalled: activationStatus?.readiness?.checks?.gcloudInstalled?.ok ?? false,
            activeAccount: activationStatus?.readiness?.checks?.activeAccount?.ok ?? false,
            billingProvided: activationStatus?.readiness?.checks?.billingProvided?.ok ?? false
        },
        covenantSync: {
            executed: Boolean(covenantReport),
            success: covenantReport?.success ?? false,
            note: covenantReport?.message || 'not executed'
        },
        reportSnapshots: {
            gcloudReportFound: gcReportText.includes('تقرير تفعيل الهيكلية السيادية'),
            autoActivationReportFound: Boolean(activationStatus)
        }
    };

    const summitPack = {
        title: 'Sheikha-Google Constructive Summit Pack',
        welcomeArabic: buildArabicWelcome(),
        welcomeEnglish: buildEnglishWelcome(),
        dialogueModel: buildDialogueModel(),
        currentResults: results
    };

    const jsonPath = path.join(root, 'SHEIKHA-GOOGLE-SUMMIT-PACK.json');
    const mdPath = path.join(root, 'SHEIKHA-GOOGLE-SUMMIT-PACK.md');

    await fs.writeFile(jsonPath, JSON.stringify(summitPack, null, 2), 'utf8');

    const md = [
        '# Sheikha - Google Summit Pack',
        '',
        '## رسالة الترحيب الرسمية (عربي)',
        summitPack.welcomeArabic,
        '',
        '## Official Welcome (English)',
        summitPack.welcomeEnglish,
        '',
        '## نموذج الحوار البنّاء',
        `- اسم الاجتماع: ${summitPack.dialogueModel.meetingName}`,
        `- المدة: ${summitPack.dialogueModel.durationMinutes} دقيقة`,
        ...summitPack.dialogueModel.structure.map(item => `- ${item.phase}: ${item.objective}`),
        '',
        '## النتائج الحالية',
        `- جاهزية السحابة: ${results.cloudReadiness}`,
        `- gcloud متوفر: ${results.cloudBlockers.gcloudInstalled}`,
        `- حساب نشط: ${results.cloudBlockers.activeAccount}`,
        `- Billing متوفر: ${results.cloudBlockers.billingProvided}`,
        `- مزامنة الميثاق منفذة: ${results.covenantSync.executed}`,
        `- نتيجة مزامنة الميثاق: ${results.covenantSync.success}`,
        `- ملاحظة: ${results.covenantSync.note}`,
        '',
        '## خطوة التنفيذ التالية',
        '- استكمال شروط السحابة (gcloud + billing + auth) ليقوم المراقب التلقائي بالتفعيل المؤسسي مباشرة.'
    ].join('\n');

    await fs.writeFile(mdPath, md, 'utf8');

    console.log('✅ Google Summit Pack generated');
    console.log(`📄 ${path.basename(jsonPath)}`);
    console.log(`📄 ${path.basename(mdPath)}`);
}

main().catch(error => {
    console.error('❌ Failed to generate summit pack:', error.message);
    process.exit(1);
});
