#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(process.cwd(), 'data', 'fitan-catalog.json');
const args = process.argv.slice(2);

function normalizeKeyword(input) {
    const key = (input || '').trim().toLowerCase();
    const aliases = {
        'نساء': 'النساء',
        'النساء': 'النساء',
        'ائمة': 'الأئمة',
        'الأئمة': 'الأئمة',
        'الائمه': 'الأئمة',
        'الخوارج': 'الخوارج',
        'الدجال': 'الدجال',
        'الروم': 'الروم',
        'عيسى': 'عيسى',
        'عيسى عليه السلام': 'عيسى',
        'isa': 'عيسى',
        'dajjal': 'الدجال',
        'rum': 'الروم'
    };
    return aliases[key] || input;
}

function parseQuery() {
    const quickArg = args.find((x) => x.startsWith('--keyword='));
    if (quickArg) {
        return { mode: 'keyword', value: normalizeKeyword(quickArg.split('=')[1] || '') };
    }

    const keyIndex = args.indexOf('--keyword');
    if (keyIndex >= 0 && args[keyIndex + 1]) {
        return { mode: 'keyword', value: normalizeKeyword(args[keyIndex + 1]) };
    }

    const query = (args.join(' ') || '').trim();
    return { mode: 'text', value: query };
}

function main() {
    if (!fs.existsSync(filePath)) {
        console.error('ملف الفتن غير موجود:', filePath);
        process.exit(1);
    }

    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const all = payload.fitan || [];
    const queryInfo = parseQuery();
    const keywordIndex = payload.index?.keywords || {};

    let results = all;
    let resolvedQuery = 'الكل';

    if (queryInfo.mode === 'keyword' && queryInfo.value) {
        const ids = keywordIndex[queryInfo.value] || [];
        if (ids.length > 0) {
            const idSet = new Set(ids);
            results = all.filter((item) => idSet.has(item.id));
            resolvedQuery = `keyword:${queryInfo.value}`;
        } else {
            results = [];
            resolvedQuery = `keyword:${queryInfo.value}`;
        }
    } else if (queryInfo.value) {
        const query = queryInfo.value.toLowerCase();
        results = all.filter((item) => {
            const text = [
                item.id,
                item.title,
                item.summary,
                ...(item.prevention || []),
                ...(item.references || []),
                ...(item.quranRefs || []),
                ...(item.hadithRefs || [])
            ].join(' ').toLowerCase();
            return text.includes(query);
        });
        resolvedQuery = queryInfo.value;
    }

    console.log(payload.title);
    console.log('المرجعية:', payload.authority);
    console.log('الاستعلام:', resolvedQuery);
    console.log('عدد النتائج:', results.length);
    console.log('');

    console.log('المرشحات السريعة المتاحة:');
    console.log('- النساء | الأئمة | الخوارج | الدجال | الروم | عيسى');
    console.log('');

    results.forEach((item, idx) => {
        console.log(`${idx + 1}) ${item.title}`);
        console.log(`   - id: ${item.id}`);
        console.log(`   - type: ${item.type}`);
        console.log(`   - authenticity: ${item.authenticity}`);
        console.log(`   - summary: ${item.summary}`);
        if (item.prevention && item.prevention.length > 0) {
            console.log('   - prevention:');
            item.prevention.forEach((p) => console.log('     * ' + p));
        }
        if (item.references && item.references.length > 0) {
            console.log('   - references:', item.references.join(' | '));
        }
        if (item.quranRefs && item.quranRefs.length > 0) {
            console.log('   - quranRefs:', item.quranRefs.join(' | '));
        }
        if (item.hadithRefs && item.hadithRefs.length > 0) {
            console.log('   - hadithRefs:', item.hadithRefs.join(' | '));
        }
        console.log('');
    });
}

main();
