#!/usr/bin/env node
'use strict';

/**
 * نظام الأسواق والتجارة النبوية
 * رقمنة نظام التجارة وفق سيرة النبي ﷺ والخلفاء الراشدين
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

function buildIslamicMarkets() {
    return {
        id: 'MARKETS-001',
        name: 'نظام الأسواق والتجارة الإسلامية النبوية',
        purpose: 'رقمنة مبادئ التجارة والأسواق وفق السيرة والسنة',

        propheticPrinciples: {
            honesty: 'الصدق والأمانة — "التاجر الصادق مع الملائكة"',
            fairness: 'العدل والمساواة — المستقيم في الوزن والكيل',
            compassion: 'الرحمة والعدالة الاجتماعية',
            transparency: 'الشفافية والفصح عن العيوب',
            hardwork: 'العمل والكسب الحلال — "خير الكسب عمل اليد"',
        },

        marketStructures: [
            {
                name: 'سوق المدينة',
                era: 'العهد النبوي',
                features: [
                    'إشراف شرعي من الدولة',
                    'منع الاحتكار والغش',
                    'حماية المستهلك',
                    'عدالة في الأسعار',
                ],
                governance: 'الحسبة الشرعية والقضاء الإسلامي',
            },
            {
                name: 'طرق التجارة القريشية',
                era: 'ما قبل وبعد الإسلام',
                features: [
                    'رحلة الشتاء والصيف',
                    'أمان المسافرين والتجار',
                    'تسهيل المبادلات',
                    'توحيد المعايير',
                ],
                significance: 'النبي ﷺ كان تاجراً أميناً قبل البعثة',
            },
        ],

        tradingContracts: [
            {
                name: 'البيع بشروط عادلة',
                condition: 'الإيجاب والقبول والرضا التام',
                prohibition: 'لا غرر — لا خفاء ولا غموض',
            },
            {
                name: 'الشركة الحلال',
                description: 'شراكة عادلة برأس مال متساوي',
                requirement: 'شفافية كاملة في الأرباح والخسائر',
            },
            {
                name: 'القرض بدون ربا',
                definition: 'إقراض المحتاجين بدون فائدة',
                reward: 'ثواب عظيم في الآخرة',
            },
            {
                name: 'الضمان (الكفالة)',
                meaning: 'ضمان جودة السلعة والالتزام',
                enforcement: 'قضائياً وشرعياً',
            },
        ],

        prohibitions: [
            { name: 'الربا', type: 'الفائدة غير المبررة', penalty: 'حرام منعاً قاطعاً' },
            { name: 'الاحتكار', type: 'تخزين السلع لرفع الأسعار', penalty: 'حرام والعقوبة تأديبية' },
            { name: 'الغش', type: 'إخفاء العيوب أو تزييف', penalty: 'حرام والدية والتعويض' },
            { name: 'الغبن الفاحش', type: 'عدم تكافؤ المقابل', penalty: 'خيار الفسخ' },
            { name: 'النجش', type: 'زيادة السعر بنية مضرة', penalty: 'حرام والبيع باطل' },
        ],

        humanDignity: {
            workerRights: [
                'أجر عادل مقابل العمل',
                'حماية من الاستغلال',
                'راحة وأوقات عمل معقولة',
                'معاملة كريمة',
            ],
            consumerRights: [
                'حق معرفة جودة السلعة',
                'حماية من الغش',
                'القدرة على الفسخ والتبديل',
                'ضمان السلامة',
            ],
            merchantRights: [
                'الحرية في التجارة الحلال',
                'حماية الملكية',
                'عدم الاستغلال',
                'ضمانات تعاقدية',
            ],
        },

        rashdunMarketPolicies: [
            {
                caliph: 'عمر بن الخطاب',
                policy: 'تنظيم الأسواق والحسبة الشديدة',
                action: 'طرد الغشاشين والمحتكرين',
            },
            {
                caliph: 'علي بن أبي طالب',
                policy: 'العناية بالفقراء والعمال',
                action: 'زيادة الرواتب ومراقبة الأسعار',
            },
        ],

        noHarm: {
            forbidden: [
                'استخدام التجارة لاستغلال أو سلب',
                'تحويل النظام لأغراض ربوية',
            ],
            allowed: [
                'دراسة مبادئ التجارة العادلة',
                'تطبيق العدل الاقتصادي',
            ],
        },
    };
}

function generateMarketHTML(markets) {
    let html = '<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n';
    html += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width">\n';
    html += '<title>' + markets.name + '</title>\n';
    html += '<style>\n';
    html += 'body { font-family: Tajawal; background: #1a1a2e; color: #e0e0e0; padding: 20px; }\n';
    html += '.header { background: linear-gradient(135deg, #d4af37, #b87333); color: #1a; padding: 30px; text-align: center; border-radius: 8px; }\n';
    html += '.section { background: #0f3460; padding: 20px; margin: 20px 0; border-left: 3px solid #d4af37; border-radius: 4px; }\n';
    html += 'h2 { color: #d4af37; }\n';
    html += '.box { background: #1a2a40; padding: 15px; margin: 10px 0; border-right: 2px solid #d4af37; border-radius: 4px; }\n';
    html += '</style>\n</head>\n<body>\n';

    html += '<div class="header"><h1>' + markets.name + '</h1></div>\n';
    
    html += '<div class="section"><h2>مبادئ التجارة النبوية</h2>\n';
    for (const [key, value] of Object.entries(markets.propheticPrinciples)) {
        html += '<div class="box"><p>' + value + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section"><h2>أسواق الإسلام</h2>\n';
    for (const market of markets.marketStructures) {
        html += '<div class="box"><h3>' + market.name + '</h3>\n';
        html += '<p>' + market.features.join(' • ') + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section"><h2>العقود المحللة</h2>\n';
    for (const contract of markets.tradingContracts) {
        html += '<div class="box"><h3>' + contract.name + '</h3>\n';
        html += '<p>' + (contract.description || contract.condition) + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section"><h2>الممنوعات الشرعية</h2>\n';
    for (const proscription of markets.prohibitions) {
        html += '<div class="box"><p><b>' + proscription.name + ':</b> ' + proscription.type + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<footer style="text-align: center; margin-top: 40px; color: #888;">© 2026 SHEIKHA</footer>\n';
    html += '</body>\n</html>\n';
    return html;
}

async function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const markets = buildIslamicMarkets();
    const dataFile = path.join(DATA_DIR, 'sheikha-islamic-markets-system.json');
    const reportFile = path.join(REPORTS_DIR, 'sheikha-islamic-markets-report.html');

    fs.writeFileSync(dataFile, JSON.stringify(markets, null, 2));
    const fileHash = sha256File(dataFile);

    const html = generateMarketHTML(markets);
    fs.writeFileSync(reportFile, html);

    console.log('✓ نظام الأسواق والتجارة الإسلامية');
    console.log('  الملف: ' + dataFile);
    console.log('  SHA256: ' + fileHash);
    console.log('  التقرير: ' + reportFile);
}

main().catch(err => {
    console.error('خطأ:', err.message);
    process.exit(1);
});
