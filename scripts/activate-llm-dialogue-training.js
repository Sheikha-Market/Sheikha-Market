#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const OUTPUT_ROOT = path.join(process.cwd(), 'data', 'llm-dialogue-training');

async function writeJson(fileName, data) {
    const filePath = path.join(OUTPUT_ROOT, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
}

async function writeText(fileName, content) {
    const filePath = path.join(OUTPUT_ROOT, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
}

function buildProtocol() {
    return {
        name: 'Sheikha LLM Constructive Dialogue Protocol',
        version: '1.0.0',
        languageProfile: ['Arabic-Fusha', 'English-Professional'],
        objective:
            'Enable safe, constructive, and goal-oriented dialogue across AI systems and partner companies',
        principles: [
            'لا ضرر ولا ضرار',
            'الوضوح والشفافية',
            'الاحترام المتبادل',
            'التركيز على النتائج القابلة للقياس',
            'حوكمة المسؤولية وتوثيق القرارات'
        ],
        conversationLifecycle: [
            {
                phase: 'Welcome & Alignment',
                goals: ['ترحيب رسمي محترم', 'تحديد الأهداف المشتركة', 'تأكيد قيود الأمان والامتثال']
            },
            {
                phase: 'Problem Framing',
                goals: ['تعريف المشكلة بدقة', 'تحديد النطاق', 'تحديد المخرجات المتوقعة']
            },
            {
                phase: 'Option Exploration',
                goals: ['طرح بدائل تقنية', 'تحليل المخاطر والفوائد', 'مقارنة الكلفة والزمن']
            },
            {
                phase: 'Decision & Commitments',
                goals: [
                    'اختيار البديل الأمثل',
                    'تحديد المالك والجدول الزمني',
                    'اعتماد مؤشرات نجاح واضحة'
                ]
            },
            {
                phase: 'Follow-up & Learning',
                goals: ['متابعة التنفيذ', 'قياس النتائج', 'تحسين الحوار للجولات القادمة']
            }
        ],
        roleCards: {
            moderator: {
                mission: 'Keep discussion constructive and on-scope',
                checklist: ['timeboxing', 'neutral tone', 'decision recap']
            },
            technicalLead: {
                mission: 'Translate goals into technical options',
                checklist: ['architecture fit', 'security impact', 'integration readiness']
            },
            complianceLead: {
                mission: 'Ensure no-harm and policy alignment',
                checklist: ['data boundaries', 'risk gating', 'audit trace']
            },
            partnerRep: {
                mission: 'Represent partner capabilities and constraints',
                checklist: ['SLA clarity', 'support model', 'ownership split']
            }
        }
    };
}

function buildWelcomeTemplates() {
    return {
        arabic: {
            subject: 'ترحيب رسمي بالتعاون التقني البنّاء',
            body: [
                'السادة الشركاء الكرام،',
                'نرحب بكم رسميًا في مسار تعاون تقني بنّاء يهدف لتحقيق أثر اقتصادي ومعرفي نافع.',
                'نقترح إدارة الحوار وفق مبادئ: لا ضرر ولا ضرار، الشفافية، والمسؤولية المشتركة.',
                'الهدف من هذه الجلسة: تحديد خطة تنفيذ واقعية بمؤشرات نجاح قابلة للقياس.',
                'وتفضلوا بقبول فائق الاحترام.'
            ].join('\n')
        },
        english: {
            subject: 'Official Welcome to a Constructive Technical Collaboration',
            body: [
                'Dear Partners,',
                'We officially welcome you to a constructive technical collaboration focused on measurable impact.',
                'We propose a dialogue model grounded in no-harm, transparency, and shared accountability.',
                "Today's objective is to align on an executable roadmap with clear success metrics.",
                'Respectfully.'
            ].join('\n')
        }
    };
}

function buildTrainingScenarios() {
    return {
        scenarios: [
            {
                id: 'S1',
                title: 'AI-to-AI Integration Alignment',
                prompt: 'Two AI agents must agree on API contract, privacy boundaries, and fallback strategy.',
                successCriteria: [
                    'Defines contract fields',
                    'Defines security constraints',
                    'Produces rollback plan'
                ]
            },
            {
                id: 'S2',
                title: 'Company Welcome + Joint Goal Setting',
                prompt: 'Host welcomes partner company and co-defines 90-day delivery plan.',
                successCriteria: [
                    'Shared goals documented',
                    'Owners assigned',
                    'KPI dashboard agreed'
                ]
            },
            {
                id: 'S3',
                title: 'Conflict De-escalation in Technical Review',
                prompt: 'Two teams disagree on architecture; moderator must converge to decision.',
                successCriteria: [
                    'Respectful language maintained',
                    'Decision criteria explicit',
                    'Final decision recorded'
                ]
            }
        ]
    };
}

function buildEvaluationRubric() {
    return {
        rubric: [
            {
                metric: 'Clarity',
                weight: 20,
                description: 'Message precision and unambiguous commitments'
            },
            {
                metric: 'Constructiveness',
                weight: 20,
                description: 'Solution-oriented and non-adversarial discourse'
            },
            {
                metric: 'Safety & No-Harm',
                weight: 20,
                description: 'Avoid harmful suggestions and respect constraints'
            },
            {
                metric: 'Technical Depth',
                weight: 20,
                description: 'Concrete and feasible technical direction'
            },
            {
                metric: 'Execution Readiness',
                weight: 20,
                description: 'Actionable next steps with owners/timelines'
            }
        ],
        passThreshold: 80
    };
}

async function main() {
    await fs.mkdir(OUTPUT_ROOT, { recursive: true });

    const protocol = buildProtocol();
    const welcomes = buildWelcomeTemplates();
    const scenarios = buildTrainingScenarios();
    const rubric = buildEvaluationRubric();

    const files = [];
    files.push(await writeJson('llm-dialogue-protocol.json', protocol));
    files.push(await writeJson('welcome-templates.json', welcomes));
    files.push(await writeJson('training-scenarios.json', scenarios));
    files.push(await writeJson('evaluation-rubric.json', rubric));

    const quickStart = [
        '# LLM Dialogue Training Quick Start',
        '',
        '1) Load protocol: llm-dialogue-protocol.json',
        '2) Start with welcome template (Arabic/English).',
        '3) Run scenario S1 -> S3.',
        '4) Score using evaluation-rubric.json.',
        '5) Accept only dialogues >= 80 score.',
        '',
        'Outputs generated in data/llm-dialogue-training/'
    ].join('\n');

    files.push(await writeText('README.md', quickStart));

    const report = {
        success: true,
        generatedAt: new Date().toISOString(),
        outputDir: 'data/llm-dialogue-training',
        files: files.map(f => path.relative(process.cwd(), f))
    };

    const reportPath = path.join(process.cwd(), 'LLM-DIALOGUE-TRAINING-REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

    console.log('✅ LLM dialogue training activated');
    console.log(`📁 ${report.outputDir}`);
    console.log(`📄 ${path.basename(reportPath)}`);
}

main().catch(error => {
    console.error('❌ Failed to activate LLM dialogue training:', error.message);
    process.exit(1);
});
