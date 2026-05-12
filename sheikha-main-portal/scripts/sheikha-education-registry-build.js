#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT_DIR, 'data', 'sheikha-education-entities-registry.json');

function slugify(value) {
    return String(value || '')
        .trim()
        .replaceAll(/[^a-zA-Z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '')
        .replaceAll(/-{2,}/g, '-');
}

function sheikhaName(base) {
    const clean = slugify(base);
    return `Sheikha-${clean}`;
}

function top10Universities() {
    return [
        'Massachusetts Institute of Technology',
        'University of Oxford',
        'Stanford University',
        'Harvard University',
        'University of Cambridge',
        'Imperial College London',
        'ETH Zurich',
        'National University of Singapore',
        'UCL',
        'California Institute of Technology'
    ];
}

function buildGoalProfile(type) {
    const commonGoals = [
        { id: 'SG-001', title: 'التعليم المتقن', kpi: 'تحسن جودة المخرجات التعليمية' },
        { id: 'SG-002', title: 'الإنتاج العلمي', kpi: 'عدد الأبحاث/المشاريع العلمية المؤثرة' },
        { id: 'SG-003', title: 'الأثر المجتمعي', kpi: 'مشاريع نافعة مرتبطة باحتياج المجتمع' },
        { id: 'SG-004', title: 'الابتكار والاختراع', kpi: 'نماذج/براءات/حلول تقنية جديدة' },
        { id: 'SG-005', title: 'التعاون العلمي المنهجي', kpi: 'اتفاقيات ومشاريع مشتركة متعددة الجهات' },
        { id: 'SG-006', title: 'الريادة العلمية', kpi: 'مبادرات قيادية في المعرفة والتطبيق' }
    ];

    const byType = {
        university: [
            { id: 'UG-001', title: 'تكامل البحث مع الصناعة', kpi: 'مخرجات بحثية مطبقة تجاريا وتقنيا' },
            { id: 'UG-002', title: 'تحويل المعرفة إلى منتجات', kpi: 'عدد الشركات الناشئة/النماذج الأولية' }
        ],
        'research-center': [
            { id: 'RG-001', title: 'استكشاف علمي عميق', kpi: 'نتائج بحثية جديدة قابلة للتحقق' },
            { id: 'RG-002', title: 'حل تحديات المجتمع', kpi: 'مشاريع بحثية مرتبطة بقضايا تنموية' }
        ],
        school: [
            { id: 'SC-001', title: 'بناء القاعدة العلمية المبكرة', kpi: 'تحسن المهارات العلمية الأساسية' },
            { id: 'SC-002', title: 'مسار موهبة وابتكار', kpi: 'برامج ومسابقات علمية مدرسية فعالة' }
        ],
        institute: [
            { id: 'IN-001', title: 'تأهيل تقني تطبيقي', kpi: 'مخرجات مهارية مرتبطة بسوق العمل' },
            { id: 'IN-002', title: 'إنتاج حلول هندسية', kpi: 'مشاريع تطبيقية قابلة للتشغيل' }
        ],
        encyclopedia: [
            { id: 'EN-001', title: 'توثيق المعرفة الموثوقة', kpi: 'محتوى علمي محكّم ومحدث' },
            { id: 'EN-002', title: 'إتاحة المعرفة للجميع', kpi: 'نسبة الوصول المفتوح للمحتوى' }
        ],
        'publishing-house': [
            { id: 'PB-001', title: 'نشر علم نافع عالي الجودة', kpi: 'كتب/دوريات علمية ذات أثر' },
            { id: 'PB-002', title: 'تعظيم الوصول المعرفي', kpi: 'توزيع ونشر رقمي واسع' }
        ],
        'education-place': [
            { id: 'EP-001', title: 'تمكين التعلم المستمر', kpi: 'برامج تعلم مرنة ومستمرة' },
            { id: 'EP-002', title: 'تعلم موجه بالأثر', kpi: 'نتائج تطبيقية واضحة للمتعلمين' }
        ]
    };

    return {
        strategic: commonGoals,
        specialized: byType[type] || byType['education-place'],
        shariaAlignment: {
            basis: 'الكتاب والسنة',
            intent: 'النفع العام والإحسان والإتقان',
            controls: ['لا ضرر', 'العدل', 'الأمانة', 'الصدق العلمي']
        }
    };
}

function buildCollaborationModel(type) {
    return {
        lanes: [
            'تعليم',
            'بحث علمي',
            'تقنية وهندسة',
            'ابتكار واختراع',
            'تطبيق تجاري نافع',
            'خدمة مجتمعية'
        ],
        preferredPartners: type === 'university'
            ? ['research-center', 'institute', 'publishing-house', 'school']
            : ['university', 'research-center', 'institute', 'school', 'encyclopedia', 'publishing-house'],
        governance: {
            mode: 'beneficial-cooperation',
            methodology: 'evidence-based + sharia-aligned',
            publicBenefitPriority: 'high'
        }
    };
}

function buildEntities() {
    const entities = [];

    top10Universities().forEach((name, i) => {
        entities.push({
            rank: i + 1,
            category: 'university-top10',
            type: 'university',
            displayName: name,
            sheikhaName: sheikhaName(name),
            goals: buildGoalProfile('university'),
            collaboration: buildCollaborationModel('university')
        });
    });

    for (let i = 1; i <= 100; i += 1) {
        entities.push({
            rank: i,
            category: 'university-top100',
            type: 'university',
            displayName: `Global University Top100 #${String(i).padStart(3, '0')}`,
            sheikhaName: sheikhaName(`Global University Top100 #${String(i).padStart(3, '0')}`),
            goals: buildGoalProfile('university'),
            collaboration: buildCollaborationModel('university')
        });
    }

    for (let i = 1; i <= 1000; i += 1) {
        entities.push({
            rank: i,
            category: 'university-top1000',
            type: 'university',
            displayName: `Global University Top1000 #${String(i).padStart(4, '0')}`,
            sheikhaName: sheikhaName(`Global University Top1000 #${String(i).padStart(4, '0')}`),
            goals: buildGoalProfile('university'),
            collaboration: buildCollaborationModel('university')
        });
    }

    const extra = [
        { type: 'institute', names: ['Technical Institute #001', 'Technical Institute #002', 'Technical Institute #003'] },
        { type: 'research-center', names: ['Research Center #001', 'Research Center #002', 'Research Center #003'] },
        { type: 'school', names: ['School #001', 'School #002', 'School #003'] },
        { type: 'education-place', names: ['Learning Hub #001', 'Learning Hub #002', 'Learning Hub #003'] },
        { type: 'encyclopedia', names: ['Knowledge Encyclopedia #001', 'Knowledge Encyclopedia #002'] },
        { type: 'publishing-house', names: ['Academic Publishing House #001', 'Academic Publishing House #002'] }
    ];

    extra.forEach((group) => {
        group.names.forEach((name, index) => {
            entities.push({
                rank: index + 1,
                category: group.type,
                type: group.type,
                displayName: name,
                sheikhaName: sheikhaName(name),
                goals: buildGoalProfile(group.type),
                collaboration: buildCollaborationModel(group.type)
            });
        });
    });

    return entities;
}

function main() {
    const entities = buildEntities();
    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                principles: ['النية', 'الإحسان', 'لا ضرر ولا ضرار']
            },
            developmentFramework: {
                mission: 'تحويل العلم إلى أثر مجتمعي نافع في التجارة والتقنية والهندسة والاختراع والاستكشاف العلمي',
                targetDomains: ['التعليم', 'البحث العلمي', 'التقنية', 'الهندسة', 'الاختراعات', 'الريادة العلمية'],
                outcomes: ['منفعة عامة', 'تنمية علمية', 'ابتكار مستدام', 'تعاون منهجي نافع']
            },
            counts: {
                total: entities.length,
                top10: entities.filter((e) => e.category === 'university-top10').length,
                top100: entities.filter((e) => e.category === 'university-top100').length,
                top1000: entities.filter((e) => e.category === 'university-top1000').length
            },
            entities
        },
        message: 'تم بناء السجل الموحد للكيانات التعليمية باسم شيخة',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Registry written: ${OUT_PATH}`);
    console.log(`Entities total : ${payload.data.counts.total}`);
}

main();
