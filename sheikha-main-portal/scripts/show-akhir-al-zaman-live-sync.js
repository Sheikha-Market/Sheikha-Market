#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(process.cwd(), 'data', 'akhir-al-zaman-live-sync.json');

function main() {
    if (!fs.existsSync(filePath)) {
        console.error('ملف المزامنة غير موجود. شغّل: node scripts/sync-akhir-al-zaman-now.js');
        process.exit(1);
    }

    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log('مرصد مزامنة آخر الزمان - الحاضر');
    console.log('تاريخ التوليد:', payload.generatedAt);
    console.log('');
    console.log('السياسة:');
    console.log('- noPropheticAssertionOnCurrentEvents:', payload.policy.noPropheticAssertionOnCurrentEvents ? 'true' : 'false');
    console.log('- noDatePrediction:', payload.policy.noDatePrediction ? 'true' : 'false');
    console.log('- note:', payload.policy.note);
    console.log('');
    console.log('الإحصاءات:');
    console.log('- headlinesCollected:', payload.counts.headlinesCollected);
    console.log('- sourcesOk:', payload.counts.sourcesOk);
    console.log('- sourcesFailed:', payload.counts.sourcesFailed);
    console.log('');

    console.log('الموضوعات الأعلى:');
    (payload.themes || []).forEach((t) => {
        console.log(`- ${t.theme}: ${t.count}`);
    });

    console.log('');
    console.log('مزامنة معرفية مع المرجع:');
    (payload.mappingToReference || []).forEach((m) => {
        console.log(`- ${m.theme} -> ${m.suggestReferenceSection}`);
        console.log(`  guardrail: ${m.guardrail}`);
    });

    if (payload.rumNowLens) {
        console.log('');
        console.log('عدسة سورة الروم (الواقع الحالي):');
        console.log('- reference:', (payload.rumNowLens.quranReference || []).join(' | '));
        console.log('- reading:', payload.rumNowLens.reading);
        console.log('- believersPrinciple:', payload.rumNowLens.believersPrinciple);
        console.log('- hasPowerShiftSignal:', String(payload.rumNowLens.indicatorsNow?.hasPowerShiftSignal));
        console.log('- guardrail:', payload.rumNowLens.guardrail);
    }

    if (payload.fitanNowActions) {
        console.log('');
        console.log('إجراءات الوقاية من الفتن (الآن):');
        console.log('- level:', payload.fitanNowActions.level);
        console.log('- rule:', payload.fitanNowActions.rule);
        (payload.fitanNowActions.focus || []).forEach((f) => {
            console.log('  * ' + f);
        });
        console.log('- dua:', payload.fitanNowActions.dua);
    }

    console.log('');
    console.log('أمثلة عناوين حالية:');
    (payload.sampleHeadlines || []).slice(0, 12).forEach((h) => {
        console.log(`- [${h.source}] ${h.title}`);
        if (h.tags && h.tags.length > 0) {
            console.log(`  tags: ${h.tags.join(', ')}`);
        }
    });
}

main();
