#!/usr/bin/env node
'use strict';

/**
 * رقمنة معاهدات النبي ﷺ والخلفاء الراشدين
 * نظام تعليمي تاريخي لدراسة العهود
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function sha256File(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function buildPropheticCovenants() {
    return {
        id: 'COVENANTS-001',
        name: 'معاهدات النبي ﷺ والخلفاء الراشدين',
        arabicName: 'منظومة المعاهدات والعهود الإسلامية',
        purpose: 'تعليمي تاريخي لدراسة حوكمة العهود والمخاطر',

        shariahBasis: {
            texts: [
                {
                    type: 'Quranic',
                    source: 'سورة التوبة 4',
                    text: 'فما استقاموا لكم فاستقيموا لهم',
                    significance: 'وجوب الوفاء بالعهد',
                },
                {
                    type: 'Hadith',
                    source: 'صحيح مسلم',
                    text: 'لا يلدغ المؤمن من جحر مرتين',
                    significance: 'التحذير من تكرار الخطأ',
                },
            ],
        },

        historicalCovenants: [
            {
                name: 'صحيفة المدينة',
                period: '1 AH / 622 CE',
                parties: ['المسلمون', 'قبائل المدينة', 'يهود المدينة'],
                keyPoints: [
                    'دفاع مشترك',
                    'قواعد السلوك والعدالة',
                    'حل النزاعات بالتحكيم',
                ],
                lessons: [
                    'الوفاء بالعهد مبدأ أساسي',
                    'الرحمة والإجراءات التدريجية',
                    'العدل لا الانتقام',
                ],
            },
            {
                name: 'صلح الحديبية',
                period: '6 AH / 628 CE',
                parties: ['المسلمون', 'قريش'],
                keyPoints: [
                    'هدنة 10 سنوات',
                    'العودة للعمرة',
                    'معاملة متبادلة عادلة',
                ],
                lessons: [
                    'العهد من القوة ليس ضعفاً',
                    'التخطيط طويل الأمد',
                    'السلام يحقق الأهداف',
                ],
            },
            {
                name: 'معاهدة نجران',
                period: '10 AH / 631 CE',
                parties: ['الدولة الإسلامية', 'نجران'],
                keyPoints: [
                    'حماية كاملة',
                    'حرية الدين والعبادة',
                    'عدل وإنصاف',
                ],
                lessons: [
                    'الحماية والعدل أساس السلام',
                    'احترام الدين والثقافة',
                    'التعايش السلمي ممكن',
                ],
            },
        ],

        riskManagement: {
            name: 'لا يلدغ المؤمن من جحر مرتين',
            stages: [
                { stage: 'تقييم الأطراف', tools: ['التحري', 'دراسة السوابق'] },
                { stage: 'المراقبة المستمرة', tools: ['وفود تفتيش', 'تقارير دورية'] },
                { stage: 'الإنذار المبكر', tools: ['اجتماعات استشارية', 'محاولات ودية'] },
                { stage: 'رد حازم عادل', tools: ['إعلان عام', 'دفاع مشروع'] },
            ],
        },

        noHarm: {
            forbidden: [
                'استخدام كذريعة للتحريض',
                'توتير العلاقات',
            ],
            allowed: [
                'التعليم والدراسة التاريخية',
                'دروس إدارة المخاطر',
                'بناء أطر للسلام',
            ],
        },
    };
}

function generateHTML(covenants) {
    let html = '<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n';
    html += '<meta charset="UTF-8">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '<title>' + covenants.name + '</title>\n';
    html += '<style>\n';
    html += 'body { font-family: Tajawal, Arial; background: #1a1a2e; color: #e0e0e0; padding: 20px; }\n';
    html += '.container { max-width: 1200px; margin: 0 auto; }\n';
    html += '.header { background: linear-gradient(135deg, #d4af37 0%, #b87333 100%); color: #1a1a2e; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }\n';
    html += '.section { background: #0f3460; padding: 20px; margin-bottom: 20px; border-left: 3px solid #d4af37; border-radius: 4px; }\n';
    html += 'h2 { color: #d4af37; margin-bottom: 15px; }\n';
    html += 'h3 { color: #b87333; margin: 10px 0; }\n';
    html += '.box { background: #1a2a40; padding: 15px; margin: 10px 0; border-right: 2px solid #d4af37; border-radius: 4px; }\n';
    html += '.lesson { background: #1a3a50; padding: 8px; margin: 5px 0; border-right: 2px solid #b87333; }\n';
    html += 'footer { text-align: center; padding: 20px; color: #888; margin-top: 40px; }\n';
    html += '</style>\n</head>\n<body>\n';

    html += '<div class="container">\n';
    html += '<div class="header">\n';
    html += '<h1>' + covenants.name + '</h1>\n';
    html += '<p>' + covenants.purpose + '</p>\n';
    html += '</div>\n';

    html += '<div class="section">\n<h2>الأساس الشرعي</h2>\n';
    for (const text of covenants.shariahBasis.texts) {
        html += '<div class="box"><h3>' + text.type + ' — ' + text.source + '</h3>\n';
        html += '<p><b>النص:</b> ' + text.text + '</p>\n';
        html += '<p><b>الدلالة:</b> ' + text.significance + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section">\n<h2>المعاهدات التاريخية</h2>\n';
    for (const cov of covenants.historicalCovenants) {
        html += '<div class="box"><h3>' + cov.name + '</h3>\n';
        html += '<p><b>الفترة:</b> ' + cov.period + '</p>\n';
        html += '<p><b>الأطراف:</b> ' + cov.parties.join(' • ') + '</p>\n';
        html += '<p><b>النقاط الأساسية:</b></p><ul>\n';
        for (const point of cov.keyPoints) {
            html += '<li>' + point + '</li>\n';
        }
        html += '</ul>\n<p><b>الدروس:</b></p>\n';
        for (const lesson of cov.lessons) {
            html += '<div class="lesson">• ' + lesson + '</div>\n';
        }
        html += '</div>\n';
    }
    html += '</div>\n';

    html += '<div class="section">\n<h2>إدارة المخاطر</h2>\n';
    html += '<p><b>المبدأ:</b> ' + covenants.riskManagement.name + '</p>\n';
    for (const stage of covenants.riskManagement.stages) {
        html += '<div class="box"><h3>' + stage.stage + '</h3>\n';
        html += '<p><b>الأدوات:</b> ' + stage.tools.join(' • ') + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section">\n<h2>حماية من الأذى</h2>\n';
    html += '<p><b>محظور:</b></p><ul>\n';
    for (const item of covenants.noHarm.forbidden) {
        html += '<li>✗ ' + item + '</li>\n';
    }
    html += '</ul>\n<p><b>مسموح:</b></p><ul>\n';
    for (const item of covenants.noHarm.allowed) {
        html += '<li>✓ ' + item + '</li>\n';
    }
    html += '</ul>\n</div>\n';

    html += '</div>\n<footer><p>© 2026 SHEIKHA</p></footer>\n</body>\n</html>\n';
    return html;
}

async function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const covenants = buildPropheticCovenants();
    const dataFile = path.join(DATA_DIR, 'sheikha-prophet-covenants.json');
    const reportFile = path.join(REPORTS_DIR, 'sheikha-prophet-covenants-report.html');

    fs.writeFileSync(dataFile, JSON.stringify(covenants, null, 2));
    const fileHash = sha256File(dataFile);

    const html = generateHTML(covenants);
    fs.writeFileSync(reportFile, html);

    console.log('✓ معاهدات النبي والخلفاء الراشدين');
    console.log('  الملف: ' + dataFile);
    console.log('  SHA256: ' + fileHash);
    console.log('  التقرير: ' + reportFile);
    console.log('  الحالة: جاهز');
}

main().catch(err => {
    console.error('خطأ:', err.message);
    process.exit(1);
});
