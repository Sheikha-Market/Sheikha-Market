#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_PATH = path.join(DATA_DIR, 'sheikha-saudi-internal-external-goals.json');

function goal({ id, scope, title, description, target, deadline, basis, controls }) {
    return {
        id,
        scope,
        title,
        description,
        metrics: [
            {
                id: `${id}-M1`,
                name: target.name,
                unit: target.unit,
                target: target.value,
                current: 0,
                deadline
            }
        ],
        sharia: {
            basis,
            controls
        },
        status: 'planned'
    };
}

function main() {
    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'رقمنة أهداف السعودية الداخلية والخارجية تُوجَّه لتحقيق العدل والأمن والتنمية والمصلحة العامة داخلياً وخارجياً.'
            },
            saudiInternalGoals: [
                goal(
                    {
                        id: 'SA-IN-001',
                        scope: 'internal',
                        title: 'تعزيز التماسك المؤسسي الداخلي',
                        description: 'ربط الوزارات والإمارات والهيئات بمنظومة أهداف موحدة قابلة للقياس والمراجعة.',
                        target: { name: 'نسبة الجهات المرتبطة', unit: '%', value: 100 },
                        deadline: '2026-12-31',
                        basis: 'قال تعالى: إن الله يأمر بالعدل والإحسان',
                        controls: ['العدل', 'الشفافية', 'الأمانة']
                    }
                ),
                goal(
                    {
                        id: 'SA-IN-002',
                        scope: 'internal',
                        title: 'حماية المعلومات الوطنية والسيادية',
                        description: 'حماية البيانات الحكومية والتجارية والخيرية ضمن تصنيف واضح وضوابط وصول دقيقة.',
                        target: { name: 'نسبة الأصول المصنفة والمحكومة', unit: '%', value: 100 },
                        deadline: '2026-09-30',
                        basis: 'قال تعالى: ولا تؤتوا السفهاء أموالكم',
                        controls: ['السرية', 'حفظ الأمانة', 'منع الضرر']
                    }
                ),
                goal(
                    {
                        id: 'SA-IN-003',
                        scope: 'internal',
                        title: 'رفع جودة الخدمات العامة رقمياً',
                        description: 'تحسين الوصول للخدمات الحكومية وتقليل زمن الإنجاز ورفع الرضا العام.',
                        target: { name: 'متوسط رضا المستفيدين', unit: '%', value: 92 },
                        deadline: '2026-12-31',
                        basis: 'الإحسان والإتقان في قضاء مصالح الناس',
                        controls: ['الإحسان', 'سرعة الإنجاز', 'رفع الحرج']
                    }
                )
            ],
            saudiExternalGoals: [
                goal(
                    {
                        id: 'SA-EX-001',
                        scope: 'external',
                        title: 'تعظيم الشراكات الاقتصادية الدولية النافعة',
                        description: 'بناء شراكات خارجية تجارية واستثمارية منضبطة تحقق المنفعة المشتركة وتحفظ السيادة.',
                        target: { name: 'عدد الشراكات الدولية المنضبطة', unit: 'شراكة', value: 150 },
                        deadline: '2027-03-31',
                        basis: 'قال تعالى: وتعاونوا على البر والتقوى',
                        controls: ['المنفعة المتبادلة', 'حفظ السيادة', 'وضوح التعاقد']
                    }
                ),
                goal(
                    {
                        id: 'SA-EX-002',
                        scope: 'external',
                        title: 'توسيع الأثر الخيري والإنساني خارجياً',
                        description: 'رقمنة المسارات الخيرية والإنسانية السعودية خارجياً مع شفافية الأثر والتوزيع.',
                        target: { name: 'عدد المبادرات الخيرية العابرة للحدود', unit: 'مبادرة', value: 80 },
                        deadline: '2027-03-31',
                        basis: 'قال تعالى: وما تقدموا لأنفسكم من خير تجدوه عند الله',
                        controls: ['الشفافية', 'عدالة التوزيع', 'سلامة المستفيد']
                    }
                ),
                goal(
                    {
                        id: 'SA-EX-003',
                        scope: 'external',
                        title: 'تصدير النماذج السعودية الرقمية الموثوقة',
                        description: 'تحويل المنصات والمعايير السعودية الناجحة إلى نماذج قابلة للتعاون الدولي المنضبط.',
                        target: { name: 'عدد الأطر الرقمية المصدّرة', unit: 'إطار', value: 25 },
                        deadline: '2027-06-30',
                        basis: 'الأمانة في العلم ونقل النافع',
                        controls: ['حفظ الملكية', 'منع الإضرار', 'التعاقد العادل']
                    }
                )
            ],
            goalDevelopmentModel: {
                cycle: ['رقمنة', 'قياس', 'تحسين', 'استشارة', 'اعتماد', 'إعادة قياس'],
                reviewFrequency: 'quarterly',
                owner: 'Crown-Prince-Office',
                supportedBy: ['الوزارات', 'الإمارات', 'الهيئات', 'شركات الدولة', 'القطاع الخيري']
            }
        },
        message: 'تم بناء سجل الأهداف السعودية الداخلية والخارجية ورقمنتها',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Saudi internal/external goals written: ${OUT_PATH}`);
    console.log(`Internal goals : ${payload.data.saudiInternalGoals.length}`);
    console.log(`External goals : ${payload.data.saudiExternalGoals.length}`);
}

main();