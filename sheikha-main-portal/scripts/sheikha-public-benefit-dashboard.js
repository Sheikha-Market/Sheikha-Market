#!/usr/bin/env node
// لوحة تحكم المنفعة العامة — منظومة شيخة
// بسم الله الرحمن الرحيم

'use strict';

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, createHmac } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ألوان الطرفية
const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    gold:   '\x1b[33m',
    green:  '\x1b[32m',
    red:    '\x1b[31m',
    cyan:   '\x1b[36m',
    white:  '\x1b[37m',
    blue:   '\x1b[34m',
    yellow: '\x1b[93m',
};

const G = C.gold + C.bold;
const R = C.reset;

// ─── أدوات العرض ────────────────────────────────────────────────────────────

function line(char = '─', count = 70) {
    return C.dim + char.repeat(count) + R;
}

function header(text) {
    const w = 70;
    const pad = Math.max(0, Math.floor((w - text.length) / 2));
    return [
        line('═'),
        C.gold + C.bold + ' '.repeat(pad) + text + R,
        line('═'),
    ].join('\n');
}

function section(title) {
    return `\n${C.cyan}${C.bold}● ${title}${R}\n${line('─', 50)}`;
}

function statusIcon(val) {
    if (val === 'pass' || val === 'active' || val === 'excellent') return C.green + '✔' + R;
    if (val === 'fail' || val === 'inactive') return C.red + '✘' + R;
    return C.yellow + '◌' + R;
}

function scoreBar(score, max = 100) {
    const filled = Math.round((score / max) * 20);
    const bar = C.green + '█'.repeat(filled) + C.dim + '░'.repeat(20 - filled) + R;
    return `[${bar}] ${C.bold}${score}/${max}${R}`;
}

function qualityLabel(level) {
    if (level === 'excellent') return C.green + C.bold + 'ممتاز' + R;
    if (level === 'good') return C.yellow + 'جيد' + R;
    return C.red + 'يحتاج تحسين' + R;
}

// ─── تحميل التقرير ───────────────────────────────────────────────────────────

function loadReport() {
    const reportPath = join(ROOT, 'reports', 'servers', 'unified-server-covenant-latest.json');
    try {
        const raw = readFileSync(reportPath, 'utf8');
        const reportJson = JSON.parse(raw);
        return reportJson.data || reportJson;
    } catch (err) {
        console.error(C.red + 'خطأ: تعذر تحميل التقرير — ' + err.message + R);
        process.exit(1);
    }
}

function verifySeal() {
    const reportPath = join(ROOT, 'reports', 'servers', 'unified-server-covenant-latest.json');
    const sealPath   = join(ROOT, 'reports', 'servers', 'signed-seals', 'unified-server-covenant-seal-latest.json');
    try {
        const reportRaw   = readFileSync(reportPath);
        const reportSha   = createHash('sha256').update(reportRaw).digest('hex');
        const sealDoc     = JSON.parse(readFileSync(sealPath, 'utf8'));
        const seal        = sealDoc?.data?.seal;
        if (!seal) return null;

        const relPath  = 'reports/servers/unified-server-covenant-latest.json';
        const message  = `${relPath}|${seal.reportSha256}|${seal.signedAt}|${seal.signer}`;
        const sigKey   = process.env.SERVERS_COVENANT_SIGNING_KEY || '';

        const hashMatch = reportSha === seal.reportSha256;

        let expectedSeal = '';
        let keyMissing   = false;
        if (seal.sealType === 'hmac-sha256') {
            if (!sigKey) { keyMissing = true; }
            else { expectedSeal = createHmac('sha256', sigKey).update(message).digest('hex'); }
        } else {
            expectedSeal = createHash('sha256').update(Buffer.from(message, 'utf8')).digest('hex');
        }

        const sealMatch = keyMissing ? false : expectedSeal === seal.digitalSeal;
        const status    = hashMatch && sealMatch ? 'PASS' : 'FAIL';

        return {
            status,
            sealType:  seal.sealType,
            signedAt:  seal.signedAt,
            hashMatch,
            sealMatch,
            keyMissing,
        };
    } catch {
        return null;
    }
}

// ─── أقسام اللوحة ────────────────────────────────────────────────────────────

function renderNiyyah(niyyah) {
    console.log(section('النية — إنما الأعمال بالنيات'));
    console.log(`  ${C.yellow}الحديث  :${R} ${niyyah.hadith}`);
    console.log(`  ${C.yellow}المصدر  :${R} ${niyyah.source}`);
    console.log(`  ${C.yellow}التوجيه :${R} ${niyyah.declaration}`);
    console.log();
    niyyah.operationalIntents.forEach((intent) => {
        console.log(`  ${statusIcon('pass')} ${C.bold}${intent.title}${R} — ${C.dim}${intent.measure}${R}`);
    });
}

function renderSummary(summary, qualityAssessment) {
    console.log(section('ملخص الحالة'));
    const ratio = summary.ratio;
    const active = summary.active;
    const total = summary.total;
    console.log(`  ${C.yellow}الخوادم النشطة :${R} ${C.green}${C.bold}${active}/${total}${R}  ${scoreBar(ratio)}`);
    console.log(`  ${C.yellow}الجودة الكلية  :${R} ${scoreBar(qualityAssessment.averageScore)}`);
    console.log(`  ${C.yellow}مؤشر المنفعة   :${R} ${scoreBar(qualityAssessment.publicBenefitIndex)}`);
}

function renderQualityGate(gate) {
    console.log(section('بوابة الجودة'));
    const labels = { reliability: 'الموثوقية', transparency: 'الشفافية', safety: 'السلامة' };
    Object.entries(gate).forEach(([key, val]) => {
        console.log(`  ${statusIcon(val)} ${C.bold}${labels[key] || key}${R} — ${val === 'pass' ? C.green + 'ناجح' + R : C.red + 'فشل' + R}`);
    });
}

function renderMaqasid(maqasid) {
    console.log(section('مقاصد الشريعة'));
    const labels = { noHarm: 'لا ضرر ولا ضرار', trust: 'الأمانة والشفافية', continuity: 'الاستمرارية' };
    Object.entries(maqasid).forEach(([key, val]) => {
        console.log(`  ${statusIcon(val)} ${C.bold}${labels[key] || key}${R} — ${val === 'pass' ? C.green + 'محقق' + R : C.red + 'يحتاج مراجعة' + R}`);
    });
}

function renderServers(perServer) {
    console.log(section('تقييم الخوادم'));
    const colW = [8, 28, 12, 10];
    const hdr = [
        C.dim + 'الرمز'.padEnd(colW[0]),
        'الاسم'.padEnd(colW[1]),
        'الدرجة'.padEnd(colW[2]),
        'المستوى' + R,
    ].join('  ');
    console.log('  ' + hdr);
    console.log('  ' + line('─', 60));

    perServer.forEach((s) => {
        const code   = C.cyan + s.serverCode.padEnd(colW[0]) + R;
        const name   = s.serverName.padEnd(colW[1]);
        const score  = scoreBar(s.score);
        const level  = qualityLabel(s.qualityLevel);
        console.log(`  ${code}${name}${score}    ${level}`);
        if (s.notes && s.notes.length > 0) {
            s.notes.forEach((n) => console.log(`    ${C.dim}↳ ${n}${R}`));
        }
    });
}

function renderSharedGoals(goals) {
    console.log(section('الأهداف المشتركة'));
    goals.forEach((g) => {
        console.log(`  ${statusIcon('pass')} ${C.bold}${g.id}${R} ${g.title}`);
        console.log(`     ${C.dim}يُقاس بـ: ${g.measurableBy}${R}`);
    });
}

function renderImprovements(actions) {
    console.log(section('إجراءات التحسين'));
    if (!actions || actions.length === 0) {
        console.log(`  ${C.green}لا توجد إجراءات معلقة — الأداء ممتاز${R}`);
        return;
    }
    actions.forEach((a) => {
        const priority = a.priority === 'high' ? C.red + 'عالية' + R
            : a.priority === 'medium' ? C.yellow + 'متوسطة' + R
            : C.dim + 'منخفضة' + R;
        console.log(`  ${C.bold}[${a.serverCode}]${R} الأولوية: ${priority}`);
        console.log(`     الإجراء: ${a.action}`);
        console.log(`     ${C.dim}المنفعة المتوقعة: ${a.expectedBenefit}${R}`);
    });
}

function renderSeal(seal) {
    console.log(section('الختم الرقمي'));
    if (!seal) {
        console.log(`  ${C.dim}لا يوجد ختم متاح${R}`);
        return;
    }
    const pass = seal.status === 'PASS';
    console.log(`  ${statusIcon(pass ? 'pass' : 'fail')} الحالة      : ${C.bold}${pass ? C.green + 'PASS' : C.red + 'FAIL'}${R}`);
    console.log(`  ${statusIcon(seal.hashMatch ? 'pass' : 'fail')} تطابق الهاش: ${seal.hashMatch ? C.green + 'نعم' : C.red + 'لا'}${R}`);
    if (seal.keyMissing) {
        console.log(`  ${C.yellow}◌${R} تطابق الختم: ${C.dim}يتطلب SERVERS_COVENANT_SIGNING_KEY${R}`);
    } else {
        console.log(`  ${statusIcon(seal.sealMatch ? 'pass' : 'fail')} تطابق الختم: ${seal.sealMatch ? C.green + 'نعم' : C.red + 'لا'}${R}`);
    }
    console.log(`  ${C.yellow}نوع الختم   :${R} ${seal.sealType || '—'}`);
    console.log(`  ${C.yellow}وقت التوقيع :${R} ${seal.signedAt || '—'}`);
}

function renderFooter(ts) {
    console.log('\n' + line('═'));
    console.log(G + '  منظومة شيخة الاقتصادية الإسلامية' + R + C.dim + '  |  sheikha.top  |  market@sheikha.top' + R);
    if (ts) console.log(C.dim + '  المنفعة العامة — ' + ts + R);
    console.log(line('═') + '\n');
}

// ─── الرئيسية ────────────────────────────────────────────────────────────────

function main() {
    const report = loadReport();
    const seal   = verifySeal();

    console.log('\n' + header('لوحة تحكم المنفعة العامة — شيخة'));

    // النية
    if (report.niyyahCovenant) renderNiyyah(report.niyyahCovenant);

    // ملخص الحالة
    if (report.summary && report.qualityAssessment) {
        renderSummary(report.summary, report.qualityAssessment);
    }

    // بوابة الجودة
    if (report.qualityAssessment?.qualityGate) {
        renderQualityGate(report.qualityAssessment.qualityGate);
    }

    // مقاصد الشريعة
    if (report.qualityAssessment?.maqasidAlignment) {
        renderMaqasid(report.qualityAssessment.maqasidAlignment);
    }

    // تقييم الخوادم
    if (report.qualityAssessment?.perServer) {
        renderServers(report.qualityAssessment.perServer);
    }

    // الأهداف المشتركة
    if (report.sharedGoals) renderSharedGoals(report.sharedGoals);

    // إجراءات التحسين
    if (report.qualityAssessment?.improvementActions) {
        renderImprovements(report.qualityAssessment.improvementActions);
    }

    // الختم الرقمي
    renderSeal(seal);

    renderFooter(report.generatedAt || report.timestamp);
}

main();
