#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT_DIR, 'data', 'sheikha-state-investments-registry.json');

function slugify(value) {
    return String(value || '')
        .trim()
        .replaceAll(/[^a-zA-Z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '')
        .replaceAll(/-{2,}/g, '-');
}

function sharedGoals() {
    return [
        { id: 'SG-INV-001', title: 'الأثر المجتمعي', kpi: 'مؤشرات منفعة عامة قابلة للقياس' },
        { id: 'SG-INV-002', title: 'نقل العلم للتطبيق', kpi: 'مشاريع تطبيقية في التجارة والتقنية والهندسة' },
        { id: 'SG-INV-003', title: 'الابتكار والاختراع', kpi: 'براءات/نماذج/حلول إنتاجية' },
        { id: 'SG-INV-004', title: 'الاستدامة والتنمية', kpi: 'نمو اقتصادي وتنموي متوازن' },
        { id: 'SG-INV-005', title: 'التعاون المنهجي', kpi: 'تكامل الشركات والجامعات ومراكز البحث' }
    ];
}

function companyGoals(type) {
    const byType = {
        sovereign: [
            { id: 'PIF-001', title: 'قيادة الاستثمار السيادي', kpi: 'محافظ استثمارية عالية الأثر' },
            { id: 'PIF-002', title: 'تمكين القطاعات الاستراتيجية', kpi: 'مشاريع وطنية ذات قيمة مضافة' }
        ],
        energy: [
            { id: 'ARM-001', title: 'تقنيات الطاقة المتقدمة', kpi: 'كفاءة إنتاج وابتكارات الطاقة' },
            { id: 'ARM-002', title: 'تكامل سلاسل القيمة', kpi: 'تحويل المنتجات إلى قيمة صناعية' }
        ],
        petrochemicals: [
            { id: 'SAB-001', title: 'ابتكار المواد المتقدمة', kpi: 'حلول كيميائية وصناعية جديدة' },
            { id: 'SAB-002', title: 'تعميق التصنيع', kpi: 'زيادة المنتجات التحويلية' }
        ],
        ai: [
            { id: 'CNT-001', title: 'بنية ذكاء موثوقة', kpi: 'منصات ذكاء قابلة للتوسع' },
            { id: 'CNT-002', title: 'تطبيقات سيادية آمنة', kpi: 'منتجات ذكاء عالية الاعتمادية' }
        ],
        talent: [
            { id: 'HUM-001', title: 'تطوير رأس المال البشري', kpi: 'برامج مهارات متقدمة' },
            { id: 'HUM-002', title: 'تسريع الريادة العلمية', kpi: 'حاضنات ومبادرات ابتكار' }
        ]
    };

    return byType[type] || [];
}

function entity({ name, type, parent, subsidiaries }) {
    return {
        sheikhaName: name,
        slug: slugify(name),
        parent: parent || null,
        type,
        identity: {
            brand: 'Sheikha',
            integrationTitle: `${name} Integrated Identity`,
            mission: 'رقمنة الأهداف النافعة وتحويل المعرفة إلى أثر تنموي'
        },
        goals: {
            shared: sharedGoals(),
            specific: companyGoals(type),
            sharia: {
                basis: 'الكتاب والسنة',
                controls: ['الإحسان', 'الأمانة', 'العدل', 'لا ضرر ولا ضرار']
            }
        },
        subsidiaries
    };
}

function buildRegistry() {
    const entities = [
        entity({
            name: 'Sheikha-PIF',
            type: 'sovereign',
            subsidiaries: [
                'Sheikha-Aramco',
                'Sheikha-Sabic',
                'Sheikha-CNTXT',
                'Sheikha-Humain'
            ]
        }),
        entity({
            name: 'Sheikha-Aramco',
            type: 'energy',
            parent: 'Sheikha-PIF',
            subsidiaries: [
                'Sheikha-Aramco-Engineering',
                'Sheikha-Aramco-Trading',
                'Sheikha-Aramco-Digital'
            ]
        }),
        entity({
            name: 'Sheikha-Sabic',
            type: 'petrochemicals',
            parent: 'Sheikha-PIF',
            subsidiaries: [
                'Sheikha-Sabic-Innovation',
                'Sheikha-Sabic-Materials'
            ]
        }),
        entity({
            name: 'Sheikha-CNTXT',
            type: 'ai',
            parent: 'Sheikha-PIF',
            subsidiaries: [
                'Sheikha-CNTXT-Platforms',
                'Sheikha-CNTXT-Security'
            ]
        }),
        entity({
            name: 'Sheikha-Humain',
            type: 'talent',
            parent: 'Sheikha-PIF',
            subsidiaries: [
                'Sheikha-Humain-Academy',
                'Sheikha-Humain-Labs'
            ]
        })
    ];

    return {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'رقمنة الأهداف التنموية النافعة والتعاون البناء بمنهجية علمية وعملية.'
            },
            entities,
            counts: {
                entities: entities.length,
                subsidiariesTotal: entities.reduce((sum, e) => sum + e.subsidiaries.length, 0)
            }
        },
        message: 'تم بناء سجل استثمارات الدولة والشركات التابعة باسم شيخة',
        timestamp: new Date().toISOString()
    };
}

function main() {
    const payload = buildRegistry();
    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Registry written: ${OUT_PATH}`);
    console.log(`Entities       : ${payload.data.counts.entities}`);
    console.log(`Subsidiaries   : ${payload.data.counts.subsidiariesTotal}`);
}

main();
