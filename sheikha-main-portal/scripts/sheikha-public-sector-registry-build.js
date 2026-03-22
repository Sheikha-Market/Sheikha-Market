#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT_DIR, 'data', 'sheikha-public-sector-registry.json');

function slugify(value) {
    return String(value || '')
        .trim()
        .replaceAll(/[^a-zA-Z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '')
        .replaceAll(/-{2,}/g, '-');
}

function sharedGoals() {
    return [
        { id: 'PB-001', title: 'المنفعة العامة', kpi: 'تحسين جودة الخدمات للمواطن والمقيم' },
        { id: 'PB-002', title: 'الكفاءة التشغيلية', kpi: 'تقليل زمن الخدمة ورفع الاعتمادية' },
        { id: 'PB-003', title: 'حوكمة البيانات', kpi: 'توثيق وتتبع مؤشرات الأداء بشفافية' },
        { id: 'PB-004', title: 'تكامل الجهات', kpi: 'تشغيل مسارات مشتركة بين الجهات' },
        { id: 'PB-005', title: 'استدامة الأثر', kpi: 'خطط تطوير طويلة المدى قابلة للقياس' }
    ];
}

function makeEntity({ sheikhaName, sourceNameArabic, category, subtype, ownerClass, parent, delegationPath, specificGoals }) {
    return {
        sheikhaName,
        slug: slugify(sheikhaName),
        sourceNameArabic,
        category,
        subtype,
        ownerClass,
        parent: parent || null,
        delegationPath: delegationPath || 'official-authorized-chain-required',
        identity: {
            brand: 'Sheikha',
            integrationTitle: `${sheikhaName} Public Integration`,
            mission: 'تحويل التكامل المؤسسي إلى أثر عام قابل للقياس'
        },
        goals: {
            shared: sharedGoals(),
            specific: specificGoals || [],
            sharia: {
                basis: 'الكتاب والسنة',
                controls: ['العدل', 'الأمانة', 'الإحسان', 'لا ضرر ولا ضرار']
            }
        },
        governance: {
            requiresOfficialApproval: true,
            approvalNote: 'أي تفعيل تشغيلي واقعي يتطلب تفويضًا نظاميًا موثقًا من الجهة المختصة.'
        }
    };
}

function buildDelegatedAuthorities() {
    return [
        makeEntity({
            sheikhaName: 'Sheikha-Royal-Court',
            sourceNameArabic: 'الديوان الملكي',
            category: 'delegated-authority',
            subtype: 'sovereign-office',
            ownerClass: 'government',
            delegationPath: 'custodian-of-the-two-holy-mosques',
            specificGoals: [
                { id: 'DA-001', title: 'مواءمة الأولويات الوطنية', kpi: 'خريطة مبادرات موحدة' }
            ]
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Crown-Prince-Office',
            sourceNameArabic: 'مكتب سمو ولي العهد الأمير محمد بن سلمان آل سعود',
            category: 'delegated-authority',
            subtype: 'strategic-execution',
            ownerClass: 'government',
            parent: 'Sheikha-Royal-Court',
            delegationPath: 'delegated-by-custodian-according-to-regulations',
            specificGoals: [
                { id: 'DA-002', title: 'تسريع التنفيذ الاستراتيجي', kpi: 'نسبة إنجاز البرامج الوطنية' }
            ]
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Emirate-Eastern-Province',
            sourceNameArabic: 'إمارة المنطقة الشرقية',
            category: 'region-emirate',
            subtype: 'regional-governance',
            ownerClass: 'government',
            parent: 'Sheikha-Crown-Prince-Office',
            specificGoals: [
                { id: 'EM-001', title: 'تكامل الخدمات الإقليمية', kpi: 'زمن إغلاق المعاملات' }
            ]
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Emirate-Riyadh',
            sourceNameArabic: 'إمارة منطقة الرياض',
            category: 'region-emirate',
            subtype: 'regional-governance',
            ownerClass: 'government',
            parent: 'Sheikha-Crown-Prince-Office'
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Emirate-Makkah',
            sourceNameArabic: 'إمارة منطقة مكة المكرمة',
            category: 'region-emirate',
            subtype: 'regional-governance',
            ownerClass: 'government',
            parent: 'Sheikha-Crown-Prince-Office'
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Emirate-Madinah',
            sourceNameArabic: 'إمارة منطقة المدينة المنورة',
            category: 'region-emirate',
            subtype: 'regional-governance',
            ownerClass: 'government',
            parent: 'Sheikha-Crown-Prince-Office'
        })
    ];
}

function buildGovernmentBodies() {
    return [
        makeEntity({ sheikhaName: 'Sheikha-MoI', sourceNameArabic: 'وزارة الداخلية', category: 'ministry', subtype: 'public-security', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-MoF', sourceNameArabic: 'وزارة المالية', category: 'ministry', subtype: 'public-finance', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-MoE', sourceNameArabic: 'وزارة التعليم', category: 'ministry', subtype: 'education', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-MoT', sourceNameArabic: 'وزارة النقل والخدمات اللوجستية', category: 'ministry', subtype: 'transport', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-MoH', sourceNameArabic: 'وزارة الصحة', category: 'ministry', subtype: 'healthcare', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-MoC', sourceNameArabic: 'وزارة التجارة', category: 'ministry', subtype: 'commerce', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-SDAIA', sourceNameArabic: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', category: 'authority', subtype: 'data-ai', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-ZATCA', sourceNameArabic: 'هيئة الزكاة والضريبة والجمارك', category: 'authority', subtype: 'tax-customs', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-NDMO', sourceNameArabic: 'المركز الوطني لإدارة الدين', category: 'authority', subtype: 'debt-management', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-Mawani', sourceNameArabic: 'الهيئة العامة للموانئ', category: 'ports', subtype: 'maritime-logistics', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-SAR', sourceNameArabic: 'الخطوط الحديدية السعودية', category: 'railways', subtype: 'land-logistics', ownerClass: 'government' })
    ];
}

function buildStateOwnedAndSemiGov() {
    return [
        makeEntity({
            sheikhaName: 'Sheikha-Elm',
            sourceNameArabic: 'شركة علم',
            category: 'state-owned-company',
            subtype: 'digital-services',
            ownerClass: 'state-owned',
            specificGoals: [
                { id: 'SO-ELM-001', title: 'التحول الرقمي للخدمات', kpi: 'نسبة الخدمات المؤتمتة' }
            ]
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Maaden',
            sourceNameArabic: 'شركة معادن',
            category: 'state-owned-company',
            subtype: 'mining',
            ownerClass: 'state-owned',
            specificGoals: [
                { id: 'SO-MDN-001', title: 'تعظيم قيمة الثروات التعدينية', kpi: 'العائد التنموي من سلاسل التعدين' }
            ]
        }),
        makeEntity({
            sheikhaName: 'Sheikha-SEC',
            sourceNameArabic: 'الشركة السعودية للكهرباء',
            category: 'state-owned-company',
            subtype: 'energy-utility',
            ownerClass: 'state-owned'
        }),
        makeEntity({
            sheikhaName: 'Sheikha-STC',
            sourceNameArabic: 'شركة الاتصالات السعودية',
            category: 'semi-government-company',
            subtype: 'telecom',
            ownerClass: 'semi-government'
        }),
        makeEntity({
            sheikhaName: 'Sheikha-Saudi-Post-SPL',
            sourceNameArabic: 'سبل',
            category: 'state-owned-company',
            subtype: 'postal-logistics',
            ownerClass: 'state-owned'
        })
    ];
}

function buildUniversities() {
    return [
        makeEntity({ sheikhaName: 'Sheikha-KSU', sourceNameArabic: 'جامعة الملك سعود', category: 'public-university', subtype: 'university', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-KFUPM', sourceNameArabic: 'جامعة الملك فهد للبترول والمعادن', category: 'public-university', subtype: 'university', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-KAU', sourceNameArabic: 'جامعة الملك عبدالعزيز', category: 'public-university', subtype: 'university', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-IAU', sourceNameArabic: 'جامعة الإمام عبدالرحمن بن فيصل', category: 'public-university', subtype: 'university', ownerClass: 'government' }),
        makeEntity({ sheikhaName: 'Sheikha-PNU', sourceNameArabic: 'جامعة الأميرة نورة بنت عبدالرحمن', category: 'public-university', subtype: 'university', ownerClass: 'government' })
    ];
}

function countByCategory(entities) {
    const counts = {};
    entities.forEach((entity) => {
        counts[entity.category] = (counts[entity.category] || 0) + 1;
    });
    return counts;
}

function buildRegistry() {
    const entities = [
        ...buildDelegatedAuthorities(),
        ...buildGovernmentBodies(),
        ...buildStateOwnedAndSemiGov(),
        ...buildUniversities()
    ];

    return {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'التكامل المؤسسي موجّه للمنفعة العامة ويُنفّذ ضمن الأطر النظامية والتفويضات الرسمية المعتمدة.'
            },
            entities,
            counts: {
                total: entities.length,
                byCategory: countByCategory(entities)
            }
        },
        message: 'تم بناء سجل التكامل مع الجهات العامة والكيانات المملوكة للدولة باسم شيخة',
        timestamp: new Date().toISOString()
    };
}

function main() {
    const payload = buildRegistry();
    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Registry written: ${OUT_PATH}`);
    console.log(`Entities total : ${payload.data.counts.total}`);
}

main();
