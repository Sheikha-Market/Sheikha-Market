#!/usr/bin/env node
'use strict';

/**
 * نظام حوكمة المخاطر والعهود
 * لا يلدغ المؤمن من جحر مرتين
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

function buildGovernanceFramework() {
    return {
        id: 'GOVERNANCE-001',
        name: 'نظام حوكمة المخاطر والعهود الإسلامي',
        mission: 'لا يلدغ المؤمن من جحر مرتين',
        basis: 'صحيح مسلم — أبو هريرة رضي الله عنه',

        philosophy: {
            principle1: 'الحذر والتحضير من قبل وقوع المشكلة',
            principle2: 'المراقبة المستمرة والإنذار المبكر',
            principle3: 'فرص الإصلاح قبل الحل النهائي',
            principle4: 'العدل والشفافية في المحاسبة',
        },

        riskAssessmentLevels: [
            {
                level: 1,
                name: 'أخضر — ثقة عالية',
                criteria: ['سجل حسن', 'التزام سابق', 'القدرات المؤكدة'],
                action: 'متابعة روتينية',
            },
            {
                level: 2,
                name: 'أصفر — حذر معتدل',
                criteria: ['انحرافات بسيطة', 'قدرات متوسطة', 'التزام غير مستقر'],
                action: 'مراقبة مشددة وتحذيرات',
            },
            {
                level: 3,
                name: 'برتقالي — تحفز عالي',
                criteria: ['انتهاكات متكررة', 'نوايا مريبة', 'عدم الامتثال'],
                action: 'إنذار نهائي وفرص إصلاح محددة',
            },
            {
                level: 4,
                name: 'أحمر — قطع العلاقة',
                criteria: ['خيانة واضحة', 'رفض الإصلاح', 'ضرر مؤكد'],
                action: 'قطع العهد والدفاع المشروع',
            },
        ],

        earlyWarningSystem: [
            {
                indicator: 'التأخير المتكرر',
                severity: 'منخفضة',
                response: 'تنبيه ودود',
            },
            {
                indicator: 'عدم الالتزام بشروط',
                severity: 'متوسطة',
                response: 'اجتماع استشاري',
            },
            {
                indicator: 'انتهاك واضح للعهد',
                severity: 'مرتفعة',
                response: 'إنذار رسمي',
            },
            {
                indicator: 'تكرار الانتهاك',
                severity: 'حرجة',
                response: 'قطع نهائي',
            },
        ],

        verificationMechanisms: [
            {
                mechanism: 'الفحص الدوري',
                frequency: 'شهري',
                purpose: 'التأكد من الالتزام المستمر',
            },
            {
                mechanism: 'المراجعة المالية',
                frequency: 'ربع سنوي',
                purpose: 'التحقق من الشفافية والعدل',
            },
            {
                mechanism: 'التقارير الرسمية',
                frequency: 'سنوي',
                purpose: 'توثيق الأداء والنتائج',
            },
            {
                mechanism: 'الشكاوى والحل',
                frequency: 'مستمر',
                purpose: 'معالجة الخلافات عادلة',
            },
        ],

        reconciliationProcess: [
            {
                stage: 'كشف المشكلة',
                action: 'توثيق واضح للمخالفة',
            },
            {
                stage: 'الحوار الأول',
                action: 'فهم وجهات النظر من الطرفين',
            },
            {
                stage: 'الإنذار والفرصة',
                action: 'إعطاء مهلة زمنية محددة للإصلاح',
            },
            {
                stage: 'الرد الحازم',
                action: 'تطبيق العقوبة المحددة بعدالة',
            },
        ],

        noHarm: {
            forbidden: [
                'استخدام النظام للانتقام الشخصي',
                'العقوبة المغالاة فيها',
                'قطع العلاقات بدون بحث عادل',
            ],
            allowed: [
                'حماية المصالح المشروعة',
                'الدفاع عن النفس والمجتمع',
                'العدل والإنصاف في الحكم',
            ],
        },
    };
}

function generateGovernanceHTML(governance) {
    let html = '<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n';
    html += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width">\n';
    html += '<title>' + governance.name + '</title>\n';
    html += '<style>\n';
    html += 'body { font-family: Tajawal; background: #1a1a2e; color: #e0e0e0; padding: 20px; }\n';
    html += '.header { background: linear-gradient(135deg, #d4af37, #b87333); color: #1a; padding: 30px; text-align: center; border-radius: 8px; }\n';
    html += '.section { background: #0f3460; padding: 20px; margin: 20px 0; border-left: 3px solid #d4af37; border-radius: 4px; }\n';
    html += 'h2 { color: #d4af37; }\n';
    html += '.box { background: #1a2a40; padding: 15px; margin: 10px 0; border-right: 2px solid #d4af37; border-radius: 4px; }\n';
    html += '.level { padding: 10px; margin: 5px 0; border-right: 3px solid #d4af37; }\n';
    html += '.level1 { border-right-color: #51cf66; }\n';
    html += '.level2 { border-right-color: #ffd43b; }\n';
    html += '.level3 { border-right-color: #ff922b; }\n';
    html += '.level4 { border-right-color: #ff6b6b; }\n';
    html += '</style>\n</head>\n<body>\n';

    html += '<div class="header"><h1>' + governance.name + '</h1>\n';
    html += '<p><b>' + governance.mission + '</b></p>\n';
    html += '</div>\n';

    html += '<div class="section"><h2>الفلسفة الأساسية</h2>\n';
    for (const [k, p] of Object.entries(governance.philosophy)) {
        html += '<div class="box"><p>' + p + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section"><h2>مستويات المخاطر</h2>\n';
    for (const risk of governance.riskAssessmentLevels) {
        html += '<div class="level level' + risk.level + '"><h3>' + risk.name + '</h3>\n';
        html += '<p>' + risk.criteria.join(' • ') + '</p>\n';
        html += '<p><b>الإجراء:</b> ' + risk.action + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<div class="section"><h2>نظام الإنذار المبكر</h2>\n';
    for (const warning of governance.earlyWarningSystem) {
        html += '<div class="box"><p><b>' + warning.indicator + '</b> ← ' + warning.response + '</p></div>\n';
    }
    html += '</div>\n';

    html += '<footer style="text-align: center; margin-top: 40px; color: #888;">© 2026 SHEIKHA</footer>\n';
    html += '</body>\n</html>\n';
    return html;
}

async function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const governance = buildGovernanceFramework();
    const dataFile = path.join(DATA_DIR, 'sheikha-governance-framework.json');
    const reportFile = path.join(REPORTS_DIR, 'sheikha-governance-framework-report.html');

    fs.writeFileSync(dataFile, JSON.stringify(governance, null, 2));
    const fileHash = sha256File(dataFile);

    const html = generateGovernanceHTML(governance);
    fs.writeFileSync(reportFile, html);

    console.log('✓ نظام حوكمة المخاطر والعهود');
    console.log('  الملف: ' + dataFile);
    console.log('  SHA256: ' + fileHash);
    console.log('  التقرير: ' + reportFile);
}

main().catch(err => {
    console.error('خطأ:', err.message);
    process.exit(1);
});
