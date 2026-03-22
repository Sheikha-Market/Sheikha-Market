#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_PATH = path.join(DATA_DIR, 'sheikha-unified-sector-goals.json');

function readJson(filePath, fallback = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.warn(`Unable to read ${filePath}: ${error.message}`);
        return fallback;
    }
}

function inferSectorType(name = '') {
    if (name.includes('وزارة') || name.includes('Mo')) return 'public';
    if (name.includes('جامعة') || name.includes('University')) return 'education';
    if (name.includes('Sheikha-PIF') || name.includes('Aramco') || name.includes('Sabic')) return 'commercial';
    if (name.includes('خيرية') || name.includes('Charitable')) return 'charitable';
    return 'mixed';
}

function buildGoalStatus(index) {
    const statuses = ['planned', 'applied', 'not-applied', 'under-improvement'];
    return statuses[index % statuses.length];
}

function buildConsultationTrack(goal) {
    return {
        diagnosis: `تقييم وضع الهدف ${goal.id} وربطه بالمنفعة العامة والجدوى التجارية والأثر الخيري.`,
        improvementPlan: [
            'تحليل الفجوات بين التطبيق الفعلي والمستهدف.',
            'إعادة هيكلة الجهات الشريكة ومسارات التنفيذ.',
            'إضافة مؤشرات أثر ربحي وخيري ومنفعة عامة بشكل متوازن.',
            'إقرار مراجعة فصلية واعتماد تحسينات تشغيلية مستمرة.'
        ],
        advisoryLenses: ['public-benefit', 'commercial-growth', 'charitable-impact'],
        shariaBasis: 'الكتاب والسنة',
        tawheedDeclaration: 'وتوحيد المقصد لله وحده في النفع والإصلاح'
    };
}

function buildRevenueModel(scope) {
    if (scope === 'charitable') {
        return {
            type: 'charitable-sustainability',
            plan: ['أوقاف تشغيلية', 'شراكات مانحين', 'صناديق استدامة أثر'],
            publicBenefit: 'إبقاء الخدمة متاحة ومنضبطة وعادلة'
        };
    }

    return {
        type: 'commercial-sustainability',
        plan: ['خدمات مدفوعة متقدمة', 'منصات تكامل B2B', 'اتفاقيات أثر مشترك'],
        publicBenefit: 'إعادة استثمار جزء من العوائد في المنفعة العامة والخيرية'
    };
}

function dedupeAnchors(items) {
    const seen = new Set();
    return items.filter((item) => {
        const key = `${item.name}-${item.scope}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function main() {
    const national = readJson(path.join(DATA_DIR, 'sheikha-national-goals.json'), {});
    const saudi = readJson(path.join(DATA_DIR, 'sheikha-saudi-internal-external-goals.json'), {});
    const publicRegistry = readJson(path.join(DATA_DIR, 'sheikha-public-sector-registry.json'), {});
    const education = readJson(path.join(DATA_DIR, 'sheikha-education-entities-registry.json'), {});
    const state = readJson(path.join(DATA_DIR, 'sheikha-state-investments-registry.json'), {});
    const cooperation = readJson(path.join(DATA_DIR, 'sheikha-commercial-charitable-cooperation.json'), {});

    const sectorAnchors = dedupeAnchors([
        ...(publicRegistry?.data?.entities || []).slice(0, 27).map((item) => ({ name: item.sheikhaName || item.sourceNameArabic, scope: 'internal' })),
        ...(education?.data?.entities || []).slice(0, 15).map((item) => ({ name: item.sheikhaName || item.displayName, scope: 'external' })),
        ...(state?.data?.entities || []).map((item) => ({ name: item.sheikhaName, scope: 'commercial' })),
        { name: 'منظمات خيرية وشركاء دوليون', scope: 'charitable' },
        { name: 'اتفاقيات تعاون دولية', scope: 'external' },
        { name: 'شراكات قطاع خاص محلية ودولية', scope: 'commercial' }
    ]);

    const referenceGoals = [
        ...((national?.royalDirectives?.goals || []).map((goal) => ({ id: goal.id, title: goal.title }))),
        ...((national?.crownPrinceStrategies?.goals || []).map((goal) => ({ id: goal.id, title: goal.title }))),
        ...((saudi?.data?.saudiInternalGoals || []).map((goal) => ({ id: goal.id, title: goal.title }))),
        ...((saudi?.data?.saudiExternalGoals || []).map((goal) => ({ id: goal.id, title: goal.title })))
    ];

    const unifiedEntities = sectorAnchors.map((anchor, index) => {
        const start = index % Math.max(referenceGoals.length - 3, 1);
        const selectedGoals = referenceGoals.slice(start, start + 4).map((goal, goalIndex) => ({
            ...goal,
            implementationStatus: buildGoalStatus(goalIndex + index),
            consultation: buildConsultationTrack(goal),
            developmentPlan: {
                structure: ['تحديد المسؤول', 'مؤشرات الأداء', 'مخاطر التنفيذ', 'خطة التحسين'],
                improvementWindow: 'quarterly',
                coordinationMode: 'cross-sector'
            }
        }));

        return {
            entityName: anchor.name,
            scope: anchor.scope,
            sectorType: inferSectorType(anchor.name),
            governance: {
                basis: 'الكتاب والسنة',
                declaration: 'تنظيم الأهداف وتطويرها وتحسينها عبادة أمانة ومصلحة عامة لله وحده.'
            },
            goals: selectedGoals,
            profitAndBenefitModel: buildRevenueModel(anchor.scope),
            coordination: {
                commercialFramework: cooperation?.data?.commercialCooperation?.models || [],
                charitableFramework: cooperation?.data?.charitableCooperation?.models || []
            }
        };
    });

    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'توحيد الأهداف والرؤى عبر كل قطاع وجهة واتفاقية داخلياً وخارجياً، وتطويرها وتحسينها وهيكلتها وتنظيمها لله وحده.'
            },
            statistics: {
                totalEntities: unifiedEntities.length,
                scopes: {
                    internal: unifiedEntities.filter((item) => item.scope === 'internal').length,
                    external: unifiedEntities.filter((item) => item.scope === 'external').length,
                    commercial: unifiedEntities.filter((item) => item.scope === 'commercial').length,
                    charitable: unifiedEntities.filter((item) => item.scope === 'charitable').length
                }
            },
            unifiedEntities
        },
        message: 'تم توحيد الأهداف والرؤى لكل القطاعات والجهات والاتفاقيات داخلياً وخارجياً مع خطط التحسين والاستشارات',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Unified sector goals written: ${OUT_PATH}`);
    console.log(`Unified entities     : ${payload.data.statistics.totalEntities}`);
    console.log(`Internal/External    : ${payload.data.statistics.scopes.internal}/${payload.data.statistics.scopes.external}`);
}

main();