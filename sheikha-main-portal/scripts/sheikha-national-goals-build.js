#!/usr/bin/env node
'use strict';

/**
 * Sheikha National Goals Builder
 * يبني الأهداف الوطنية من توجيهات الملك والولي العهد
 * 
 * المستوى الأول من هيكل الأهداف الهرمي
 * - أهداف الملك (Custodian of Two Holy Mosques)
 * - أهداف الولي العهد (Crown Prince)
 * - الأهداف المشتركة (تُقسم على الوزارات والإمارات)
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function buildNationalGoals() {
    const timestamp = new Date().toISOString();

    const nationalGoals = {
        covenant: {
            title: 'الميثاق الوطني للأهداف',
            basis: 'الكتاب والسنة',
            principles: ['العدل', 'الأمانة', 'الشفافية', 'تحقيق المصلحة العامة'],
            generatedAt: timestamp,
            version: '1.0.0'
        },
        royalDirectives: {
            custodyLevel: 'Custodian of the Two Holy Mosques',
            goals: [
                {
                    id: 'KG-2026-001',
                    category: 'قيادة شاملة',
                    title: 'رؤية السعودية 2030 - التحقيق الشامل',
                    description: 'تحويل رؤية المملكة 2030 من استراتيجية إلى واقع ملموس عبر التكامل المؤسسي والرقمنة الشاملة',
                    owner: 'Royal-Court',
                    impact: 'strategic',
                    timelineMonths: 36,
                    metrics: [
                        {
                            id: 'M-KG-001-1',
                            name: 'نسبة تحقيق الأهداف الفرعية',
                            unit: '%',
                            target: 100,
                            current: 0,
                            deadline: '2026-12-31'
                        },
                        {
                            id: 'M-KG-001-2',
                            name: 'جودة التكامل المؤسسي',
                            unit: 'نقاط',
                            target: 95,
                            current: 0,
                            deadline: '2026-12-31'
                        }
                    ],
                    sharia: {
                        basis: 'قال تعالى: ﴿إن الله يأمر بالعدل والإحسان﴾',
                        controls: ['عدم الإضرار', 'الشفافية الكاملة', 'المصلحة العامة الأولى']
                    },
                    linkedToSDGs: ['SDG-16-Peace', 'SDG-17-Partnership']
                },
                {
                    id: 'KG-2026-002',
                    category: 'التطور التكنولوجي',
                    title: 'تحويل رقمي شامل للحكومة',
                    description: 'تطوير منصات رقمية متكاملة لخدمة المواطنين والمستثمرين برفاهية وشفافية',
                    owner: 'Royal-Court',
                    impact: 'transformative',
                    timelineMonths: 24,
                    metrics: [
                        {
                            id: 'M-KG-002-1',
                            name: 'عدد الخدمات الرقمية المتكاملة',
                            unit: 'خدمة',
                            target: 150,
                            current: 0,
                            deadline: '2026-12-31'
                        },
                        {
                            id: 'M-KG-002-2',
                            name: 'رضا المستفيدين',
                            unit: '%',
                            target: 90,
                            current: 0,
                            deadline: '2026-12-31'
                        }
                    ],
                    sharia: {
                        basis: 'استخدام التكنولوجيا لتحقيق العدل والشفافية',
                        controls: ['حماية البيانات الشخصية', 'عدم الاحتكار التكنولوجي']
                    }
                },
                {
                    id: 'KG-2026-003',
                    category: 'التنمية الاقتصادية',
                    title: 'سوق متكامل وشفاف وعادل',
                    description: 'بناء نظام اقتصادي متكامل يجمع بين المؤسسات العامة والخاصة والمجتمعية في سوق واحدة عادلة',
                    owner: 'Royal-Court',
                    impact: 'economic',
                    timelineMonths: 30,
                    metrics: [
                        {
                            id: 'M-KG-003-1',
                            name: 'حجم التكامل الاقتصادي',
                            unit: 'مليار ريال',
                            target: 500,
                            current: 0,
                            deadline: '2026-12-31'
                        },
                        {
                            id: 'M-KG-003-2',
                            name: 'عدد الصفقات الموثقة',
                            unit: 'صفقة',
                            target: 10000,
                            current: 0,
                            deadline: '2026-12-31'
                        }
                    ],
                    sharia: {
                        basis: 'من نهج سوق المدينة المنورة',
                        controls: ['لا ربا', 'لا غرر', 'لا احتكار', 'البيع عن تراضٍ']
                    }
                }
            ]
        },
        crownPrinceStrategies: {
            level: 'Crown Prince - Strategic Execution',
            goals: [
                {
                    id: 'CPG-2026-001',
                    category: 'التنفيذ الاستراتيجي',
                    title: 'إطار عمل التكامل المؤسسي الموحد',
                    description: 'بناء إطار عمل موحد لجميع المؤسسات العامة يضمن تكاملاً سلساً وشفافاً وقابلاً للقياس',
                    owner: 'Crown-Prince-Office',
                    parentGoal: 'KG-2026-001',
                    impact: 'strategic',
                    timelineMonths: 12,
                    metrics: [
                        {
                            id: 'M-CPG-001-1',
                            name: 'عدد المؤسسات الملتزمة بالإطار',
                            unit: 'مؤسسة',
                            target: 27,
                            current: 0,
                            deadline: '2026-06-30'
                        },
                        {
                            id: 'M-CPG-001-2',
                            name: 'جودة التنفيذ',
                            unit: 'نسبة',
                            target: 100,
                            current: 0,
                            deadline: '2026-06-30'
                        }
                    ],
                    dependencies: ['KG-2026-001'],
                    sharia: {
                        basis: 'التعايش والتعاون الموثق',
                        controls: ['العدل بين الأطراف', 'الشفافية التامة']
                    }
                },
                {
                    id: 'CPG-2026-002',
                    category: 'الابتكار والتطوير',
                    title: 'منصة استشارات تنموية مستمرة',
                    description: 'بناء نظام استشارات ذكي يقدم توصيات لتحسين الأهداف من 3 مدخلات: النفع العام والجدوى التجارية والفائدة الخيرية',
                    owner: 'Crown-Prince-Office',
                    parentGoal: 'KG-2026-002',
                    impact: 'innovative',
                    timelineMonths: 18,
                    metrics: [
                        {
                            id: 'M-CPG-002-1',
                            name: 'عدد التوصيات المقدمة',
                            unit: 'توصية',
                            target: 1000,
                            current: 0,
                            deadline: '2026-12-31'
                        },
                        {
                            id: 'M-CPG-002-2',
                            name: 'نسبة قبول التوصيات',
                            unit: '%',
                            target: 70,
                            current: 0,
                            deadline: '2026-12-31'
                        }
                    ],
                    sharia: {
                        basis: 'الاستشارة (الشورى)',
                        controls: ['حرية الرأي', 'الأمانة في النقل']
                    }
                },
                {
                    id: 'CPG-2026-003',
                    category: 'المراقبة والتقييم',
                    title: 'نظام مراقبة حقيقي لتحقيق الأهداف',
                    description: 'بناء لوحة تحكم مركزية لمراقبة تقدم جميع المؤسسات نحو أهدافها الوطنية والمؤسسية',
                    owner: 'Crown-Prince-Office',
                    parentGoal: 'KG-2026-001',
                    impact: 'oversight',
                    timelineMonths: 6,
                    metrics: [
                        {
                            id: 'M-CPG-003-1',
                            name: 'عدد التقارير الشهرية',
                            unit: 'تقرير',
                            target: 12,
                            current: 0,
                            deadline: '2026-12-31'
                        },
                        {
                            id: 'M-CPG-003-2',
                            name: 'اكتمالية البيانات',
                            unit: '%',
                            target: 100,
                            current: 0,
                            deadline: '2026-12-31'
                        }
                    ],
                    sharia: {
                        basis: 'الحساب والشفافية',
                        controls: ['عدم إخفاء البيانات', 'الدقة في النقل']
                    }
                }
            ]
        },
        sharedGoalsForMinistries: {
            title: 'الأهداف المشتركة لجميع الوزارات والإمارات',
            description: 'أهداف موحدة تُترجم على مستوى كل وزارة وإمارة حسب طبيعة عملها',
            goals: [
                {
                    id: 'SG-2026-001',
                    title: 'تحسين جودة الخدمات الحكومية',
                    description: 'رفع معايير تقديم الخدمات للمواطنين والمستثمرين بشفافية وكفاءة',
                    owner: 'Multiple-Ministries',
                    impact: 'public-service',
                    defaultMetrics: [
                        { name: 'متوسط وقت الخدمة', unit: 'يوم', target: 3 },
                        { name: 'رضا المستفيدين', unit: '%', target: 90 },
                        { name: 'الخدمات المرقمنة', unit: '%', target: 100 }
                    ],
                    allocateTo: ['All Ministers', 'All Emirates']
                },
                {
                    id: 'SG-2026-002',
                    title: 'تحقيق الاستدامة الاقتصادية',
                    description: 'بناء اقتصاد مستدام عادل يعود بالنفع على جميع الفئات',
                    owner: 'Multiple-Ministries',
                    impact: 'economic-sustainability',
                    defaultMetrics: [
                        { name: 'صافي التأثير الاقتصادي', unit: 'مليار ريال', target: 50 },
                        { name: 'عدد فرص العمل', unit: 'فرصة', target: 5000 },
                        { name: 'الاستثمارات المحفزة', unit: 'مليار ريال', target: 100 }
                    ],
                    allocateTo: ['All Ministers', 'All Emirates']
                },
                {
                    id: 'SG-2026-003',
                    title: 'الشمول والعدالة الاجتماعية',
                    description: 'ضمان استفادة جميع شرائح المجتمع من نفع التكامل المؤسسي',
                    owner: 'Social-Sectors',
                    impact: 'social-inclusion',
                    defaultMetrics: [
                        { name: 'الفئات المستفيدة', unit: 'نوع', target: 10 },
                        { name: 'مؤشر الرضا الاجتماعي', unit: '%', target: 85 },
                        { name: 'البرامج الخيرية المنفذة', unit: 'برنامج', target: 50 }
                    ],
                    allocateTo: ['Social Ministers', 'Regional Emirates']
                }
            ]
        },
        goalHierarchy: {
            level1: 'National Goals (الملك والولي العهد) - مستوى الملكية والاستراتيجيا',
            level2: 'Ministry/Emirate Goals (الوزارات والإمارات) - مستوى القطاعات',
            level3: 'Entity-Specific Goals (الأهداف المؤسسية) - مستوى المؤسسة الفردية',
            refreshSchedule: {
                quarterly: 'Q1, Q2, Q3, Q4',
                annualReview: '2026-12-31',
                updateMechanism: 'consultation-driven'
            }
        },
        metadata: {
            generatedAt: timestamp,
            version: '1.0.0',
            buildScript: 'sheikha-national-goals-build.js',
            totalGoals: 6 + 100, // 6 national + hundreds for shared implementation
            basis: 'الكتاب والسنة والشورى والعدل'
        }
    };

    // Write national goals file
    const outputPath = path.join(dataDir, 'sheikha-national-goals.json');
    fs.writeFileSync(outputPath, JSON.stringify(nationalGoals, null, 2));
    console.log(`National goals written: ${outputPath}`);
    console.log(`Total national directives: ${nationalGoals.royalDirectives.goals.length + nationalGoals.crownPrinceStrategies.goals.length}`);
    console.log(`Shared goals for implementation: ${nationalGoals.sharedGoalsForMinistries.goals.length}`);
    console.log(`Goal hierarchy levels: 3`);

    return nationalGoals;
}

buildNationalGoals();
