#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const referencePath = path.join(process.cwd(), 'data', 'akhir-al-zaman-reference.json');

function printSection(section) {
    console.log('');
    console.log('='.repeat(72));
    console.log(section.title);
    console.log('='.repeat(72));

    if (section.authenticity) {
        console.log('الدرجة:', section.authenticity);
    }

    if (section.summary) {
        if (Array.isArray(section.summary)) {
            section.summary.forEach((item) => console.log('- ' + item));
        } else {
            console.log(section.summary);
        }
    }

    if (section.facts) {
        section.facts.forEach((item) => console.log('- ' + item));
    }

    if (section.details) {
        section.details.forEach((item) => console.log('- ' + item));
    }

    if (section.keyDetails) {
        section.keyDetails.forEach((item) => console.log('- ' + item));
    }

    if (section.items) {
        section.items.forEach((item) => console.log('- ' + item));
    }

    if (section.verses) {
        section.verses.forEach((item) => {
            console.log('- ' + item.reference + ': ' + item.topic);
        });
    }

    if (section.locations) {
        console.log('المواضع: ' + section.locations.join(' | '));
    }

    if (section.sources) {
        console.log('المصادر: ' + section.sources.join(' | '));
    }

    if (section.scholarlyNote) {
        console.log('تنبيه علمي: ' + section.scholarlyNote);
    }

    if (section.guardrail) {
        console.log('ضابط: ' + section.guardrail);
    }

    if (section.note) {
        console.log('ملاحظة: ' + section.note);
    }
}

function main() {
    if (!fs.existsSync(referencePath)) {
        console.error('المرجع غير موجود:', referencePath);
        process.exit(1);
    }

    const payload = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
    console.log(payload.title);
    console.log('المرجعية:', payload.authority);
    console.log('محدث في:', payload.updatedAt);
    console.log('');
    console.log('سياسة الملف:');
    console.log('- لا تكهّن غيبي:', payload.policy.noSpeculation ? 'نعم' : 'لا');
    console.log('- مصدر مطلوب:', payload.policy.sourceRequired ? 'نعم' : 'لا');
    console.log('- تنبيه:', payload.policy.note);

    payload.sections.forEach(printSection);
}

main();
