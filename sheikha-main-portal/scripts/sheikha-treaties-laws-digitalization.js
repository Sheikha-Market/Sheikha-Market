#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_PATH = path.join(DATA_DIR, 'sheikha-legal-and-treaty-registry.json');

function lawRecord({ id, title, scope, domain, status, authority, type }) {
    return {
        id,
        title,
        scope,
        domain,
        type,
        status,
        authority,
        sharia: {
            basis: 'الكتاب والسنة',
            controls: ['العدل', 'الوفاء بالعقود', 'منع الضرر', 'الشفافية']
        },
        digitization: {
            workflow: ['التصنيف', 'التحليل', 'الربط بالأهداف', 'الاعتماد', 'المراجعة الدورية'],
            reviewFrequency: 'quarterly'
        }
    };
}

function main() {
    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'رقمنة الاتفاقيات والمعاهدات والأطر القانونية الداخلية والخارجية بمنهج شرعي منضبط.'
            },
            saudiInternalLaw: [
                lawRecord({
                    id: 'SA-LAW-001',
                    title: 'نظام المعاملات المدنية',
                    scope: 'internal',
                    domain: 'civil',
                    type: 'law',
                    status: 'applied',
                    authority: 'الجهات العدلية والتنظيمية'
                }),
                lawRecord({
                    id: 'SA-LAW-002',
                    title: 'نظام الشركات',
                    scope: 'internal',
                    domain: 'commercial',
                    type: 'law',
                    status: 'under-improvement',
                    authority: 'وزارة التجارة'
                }),
                lawRecord({
                    id: 'SA-LAW-003',
                    title: 'نظام حماية البيانات الشخصية',
                    scope: 'internal',
                    domain: 'data-protection',
                    type: 'law',
                    status: 'applied',
                    authority: 'الجهات التنظيمية المختصة'
                })
            ],
            internalAgreements: [
                lawRecord({
                    id: 'SA-AGR-INT-001',
                    title: 'اتفاقية تكامل بيانات حكومية',
                    scope: 'internal',
                    domain: 'government-integration',
                    type: 'agreement',
                    status: 'applied',
                    authority: 'الهيئات الحكومية'
                }),
                lawRecord({
                    id: 'SA-AGR-INT-002',
                    title: 'اتفاقية تبادل الخدمات الرقمية بين القطاعات',
                    scope: 'internal',
                    domain: 'digital-services',
                    type: 'agreement',
                    status: 'planned',
                    authority: 'الوزارات والهيئات'
                })
            ],
            internationalLawFrameworks: [
                lawRecord({
                    id: 'INT-LAW-001',
                    title: 'إطار القانون الدولي العام',
                    scope: 'external',
                    domain: 'international-public-law',
                    type: 'framework',
                    status: 'applied',
                    authority: 'الجهات الدبلوماسية والقانونية'
                }),
                lawRecord({
                    id: 'INT-LAW-002',
                    title: 'إطار القانون التجاري الدولي',
                    scope: 'external',
                    domain: 'international-commercial-law',
                    type: 'framework',
                    status: 'under-improvement',
                    authority: 'الجهات التجارية والقانونية'
                })
            ],
            internationalTreatiesCommercial: [
                lawRecord({
                    id: 'INT-TRD-001',
                    title: 'معاهدة تسهيل التجارة العادلة',
                    scope: 'external',
                    domain: 'trade',
                    type: 'treaty-commercial',
                    status: 'applied',
                    authority: 'الجهات التجارية المختصة'
                }),
                lawRecord({
                    id: 'INT-TRD-002',
                    title: 'اتفاقية حماية الاستثمار المنضبط',
                    scope: 'external',
                    domain: 'investment',
                    type: 'treaty-commercial',
                    status: 'not-applied',
                    authority: 'الجهات الاقتصادية المختصة'
                })
            ],
            internationalTreatiesNonCommercial: [
                lawRecord({
                    id: 'INT-NON-001',
                    title: 'معاهدة التعاون الإنساني والإغاثي',
                    scope: 'external',
                    domain: 'humanitarian',
                    type: 'treaty-non-commercial',
                    status: 'applied',
                    authority: 'الجهات الإغاثية والخيرية'
                }),
                lawRecord({
                    id: 'INT-NON-002',
                    title: 'اتفاقية التعاون العلمي والتعليمي',
                    scope: 'external',
                    domain: 'education-science',
                    type: 'treaty-non-commercial',
                    status: 'under-improvement',
                    authority: 'الجهات التعليمية والعلمية'
                })
            ],
            governanceModel: {
                owner: 'Sheikha-Legal-Treaty-Office',
                integrationMode: 'automatic-linking-with-entities-and-goals',
                statuses: ['applied', 'not-applied', 'under-improvement', 'planned']
            }
        },
        message: 'تمت رقمنة القوانين والاتفاقيات والمعاهدات الداخلية والخارجية',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Legal and treaty registry written: ${OUT_PATH}`);
    console.log(`Internal law items               : ${payload.data.saudiInternalLaw.length}`);
    console.log(`Treaty items                     : ${payload.data.internationalTreatiesCommercial.length + payload.data.internationalTreatiesNonCommercial.length}`);
}

main();