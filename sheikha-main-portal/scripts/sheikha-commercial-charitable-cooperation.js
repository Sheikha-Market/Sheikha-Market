#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_PATH = path.join(DATA_DIR, 'sheikha-commercial-charitable-cooperation.json');

function main() {
    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'التعاون التجاري والخيري يُبنى على الصدق والعدل ووضوح الحقوق وحماية المستفيدين.'
            },
            commercialCooperation: {
                models: [
                    {
                        id: 'CC-001',
                        title: 'شراكات تشغيلية وتجارية',
                        rules: ['عقد واضح', 'تسعير عادل', 'تحديد المسؤوليات', 'منع الاحتكار']
                    },
                    {
                        id: 'CC-002',
                        title: 'تبادل خدمات ومنصات رقمية',
                        rules: ['مشاركة محدودة للبيانات', 'التوافق الأمني', 'مؤشرات أداء متفق عليها']
                    },
                    {
                        id: 'CC-003',
                        title: 'استثمارات مشتركة ذات أثر عام',
                        rules: ['قياس أثر مجتمعي', 'شفافية العوائد', 'مراجعة امتثال شرعي']
                    }
                ],
                onboarding: ['فحص أهلية الشريك', 'تقييم المخاطر', 'اعتماد الصلاحيات', 'توثيق مؤشرات الأداء']
            },
            charitableCooperation: {
                models: [
                    {
                        id: 'CH-001',
                        title: 'برامج تنموية مشتركة',
                        rules: ['تحديد الفئات المستهدفة', 'منع الازدواجية', 'توثيق الأثر']
                    },
                    {
                        id: 'CH-002',
                        title: 'صناديق دعم ومساندة',
                        rules: ['حوكمة صرف', 'شفافية مالية', 'قياس أثر المستفيد النهائي']
                    },
                    {
                        id: 'CH-003',
                        title: 'مبادرات إغاثية وخارجية',
                        rules: ['سلامة المستفيد', 'تتبع التوزيع', 'مراجعة الشركاء الميدانيين']
                    }
                ],
                onboarding: ['اعتماد الجهة الخيرية', 'تقييم النزاهة', 'تحديد نطاق البيانات', 'إقرار منع الاستغلال']
            },
            jointDevelopment: {
                improvementCycle: ['رصد الاحتياج', 'تصميم المبادرة', 'حماية المعلومات', 'قياس الأثر', 'تحسين الشراكة'],
                optimizationPrinciples: ['المنفعة العامة أولاً', 'استدامة مالية عادلة', 'أثر خيري موثق', 'حماية معلومات كاملة']
            }
        },
        message: 'تم بناء إطار التعاون التجاري والخيري وتطويره وتحسينه رقمياً',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Commercial/charitable cooperation written: ${OUT_PATH}`);
    console.log(`Commercial models : ${payload.data.commercialCooperation.models.length}`);
    console.log(`Charitable models : ${payload.data.charitableCooperation.models.length}`);
}

main();