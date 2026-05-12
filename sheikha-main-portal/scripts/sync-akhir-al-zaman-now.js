#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const WORKSPACE = process.cwd();
const OUT_FILE = path.join(WORKSPACE, 'data', 'akhir-al-zaman-live-sync.json');
const REF_FILE = path.join(WORKSPACE, 'data', 'akhir-al-zaman-reference.json');

const SOURCES = [
    { id: 'bbc-world-rss', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { id: 'guardian-world-rss', url: 'https://www.theguardian.com/world/rss' },
    { id: 'nyt-world-rss', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' }
];

const KEYWORDS = {
    war: ['war', 'strike', 'missile', 'attack', 'drone', 'military', 'conflict', 'battle', 'invasion'],
    alliances: ['alliance', 'coalition', 'summit', 'agreement', 'deal', 'bloc', 'treaty', 'joint'],
    economicStress: ['oil', 'gas', 'inflation', 'prices', 'economy', 'energy', 'sanctions', 'market', 'debt'],
    displacement: ['refugee', 'evacuation', 'displaced', 'humanitarian', 'aid', 'camp'],
    governanceRisk: ['security', 'coup', 'election', 'intelligence', 'terror', 'emergency', 'crisis']
};

function fetchText(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout: 15000, headers: { 'User-Agent': 'SheikhaLiveSync/1.0' } }, (res) => {
            if (res.statusCode && res.statusCode >= 400) {
                reject(new Error('HTTP ' + res.statusCode + ' from ' + url));
                return;
            }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => resolve(data));
        });

        req.on('timeout', () => {
            req.destroy(new Error('Request timeout for ' + url));
        });
        req.on('error', (err) => reject(err));
    });
}

function readCachedPayload() {
    if (!fs.existsSync(OUT_FILE)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    } catch (err) {
        console.warn('! Failed to read cached live sync payload:', String(err.message || err));
        return null;
    }
}

async function collectSourceItems() {
    const errors = [];
    const collected = [];

    for (const src of SOURCES) {
        try {
            const xml = await fetchText(src.url);
            const items = extractItems(xml, src.id);
            collected.push(...items);
        } catch (err) {
            errors.push({ source: src.id, error: String(err.message || err) });
        }
    }

    return { errors, collected };
}

function buildUniqueHeadlines(collected) {
    const uniqueMap = new Map();

    for (const item of collected) {
        const key = item.link || item.title;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        }
    }

    return Array.from(uniqueMap.values()).slice(0, 60);
}

function buildReferenceMeta(errors) {
    if (!fs.existsSync(REF_FILE)) {
        return null;
    }

    try {
        const ref = JSON.parse(fs.readFileSync(REF_FILE, 'utf8'));
        return {
            title: ref.title,
            authority: ref.authority,
            policy: ref.policy
        };
    } catch (err) {
        errors.push({ source: 'reference', error: 'Failed to parse reference file: ' + String(err.message || err) });
        return null;
    }
}

function buildConnectivity(headlines, fallbackHeadlines) {
    const usedCachedFallback = headlines.length === 0 && fallbackHeadlines.length > 0;

    return {
        usedCachedFallback,
        details: {
            mode: usedCachedFallback ? 'cached-fallback' : 'live-or-partial-live',
            cachedFallbackUsed: usedCachedFallback,
            note: usedCachedFallback
                ? 'تم استخدام آخر مزامنة محفوظة بسبب تعذر جلب المصادر المباشرة.'
                : 'تمت محاولة الجلب المباشر مع السماح بفشل بعض المصادر دون تعطيل النظام.'
        }
    };
}

function writePayload(payload) {
    fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function decodeHtml(text) {
    return text
    .replaceAll('<![CDATA[', '')
    .replaceAll(']]>', '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function extractItems(xml, sourceId) {
    const items = [];
    const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
    const titleRegex = /<title>([\s\S]*?)<\/title>/i;
    const linkRegex = /<link>([\s\S]*?)<\/link>/i;
    const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;

    const blocks = xml.match(itemRegex) || [];
    for (const block of blocks.slice(0, 25)) {
        const titleMatch = block.match(titleRegex);
        const linkMatch = block.match(linkRegex);
        const dateMatch = block.match(pubDateRegex);

        if (!titleMatch || !linkMatch) {
            continue;
        }

        const title = decodeHtml(titleMatch[1].trim());
        const link = decodeHtml(linkMatch[1].trim());
        const publishedAt = dateMatch ? decodeHtml(dateMatch[1].trim()) : null;

        items.push({ source: sourceId, title, link, publishedAt });
    }

    return items;
}

function classifyHeadline(title) {
    const normalized = title.toLowerCase();
    const tags = [];

    for (const [tag, words] of Object.entries(KEYWORDS)) {
        if (words.some((word) => normalized.includes(word))) {
            tags.push(tag);
        }
    }

    return tags;
}

function summarize(headlines) {
    const counters = {
        war: 0,
        alliances: 0,
        economicStress: 0,
        displacement: 0,
        governanceRisk: 0
    };

    const tagged = headlines.map((h) => {
        const tags = classifyHeadline(h.title);
        tags.forEach((tag) => {
            counters[tag] += 1;
        });
        return { ...h, tags };
    });

    const topThemes = Object.entries(counters)
        .sort((a, b) => b[1] - a[1])
        .map(([theme, count]) => ({ theme, count }))
        .filter((x) => x.count > 0);

    return { tagged, counters, topThemes };
}

function mapThemesToReference(topThemes) {
    const mapping = [];

    for (const item of topThemes) {
        if (item.theme === 'war' || item.theme === 'alliances') {
            mapping.push({
                theme: item.theme,
                suggestReferenceSection: 'muslims-romans',
                guardrail: 'مقارنة معرفية غير جازمة، وليست إسقاطا نبويا مباشرا على حدث بعينه.'
            });
        } else if (item.theme === 'governanceRisk' || item.theme === 'economicStress') {
            mapping.push({
                theme: item.theme,
                suggestReferenceSection: 'minor-signs',
                guardrail: 'يستخدم كمؤشر اضطراب عام، لا كدليل توقيت لعلامة بعينها.'
            });
        } else {
            mapping.push({
                theme: item.theme,
                suggestReferenceSection: 'protection-system',
                guardrail: 'المطلوب عمليًا: الثبات والإصلاح والدعاء، لا التكهّن.'
            });
        }
    }

    return mapping;
}

function buildRumNowLens(counters) {
    const war = counters.war || 0;
    const alliances = counters.alliances || 0;
    const economicStress = counters.economicStress || 0;

    const hasPowerShiftSignal = war + alliances >= 8;

    return {
        quranReference: ['الروم:2-5'],
        reading: 'سنّة التداول بين القوى مع بقاء النصر الحقيقي بيد الله تعالى.',
        indicatorsNow: {
            war,
            alliances,
            economicStress,
            hasPowerShiftSignal
        },
        believersPrinciple: 'يفرح المؤمنون بنصر الله، مع التزام العدل والصدق وترك الظلم.',
        guardrail: 'هذه عدسة إيمانية تربوية، وليست حكمًا جازمًا أن حدثًا حاليًا هو نفس الواقعة القرآنية بعينها.'
    };
}

function buildFitanNowActions(counters) {
    const riskLevel = (counters.war || 0) + (counters.governanceRisk || 0) + (counters.economicStress || 0);
    let level = 'low';
    if (riskLevel >= 20) {
        level = 'high';
    } else if (riskLevel >= 10) {
        level = 'medium';
    }

    return {
        level,
        rule: 'الحذر والوقاية من الفتن تكون بالعلم والعبادة والثبات والبعد عن الاستفزاز والصدام غير المنضبط.',
        focus: [
            'فتنة النساء: غض البصر والعفة وصيانة البيوت',
            'فتنة الأئمة المضلين: وزن الأقوال بالوحي وترك التبعية العمياء',
            'فتنة الخوارج والغلو: لزوم الجماعة وترك التكفير بغير حق',
            'فتنة المال والسلطة: ترك الربا والظلم وإقامة العدل'
        ],
        dua: 'اللهم إنا نعوذ بك من الفتن ما ظهر منها وما بطن.'
    };
}

async function main() {
    try {
        const cachedPayload = readCachedPayload();
        const { errors, collected } = await collectSourceItems();
        const headlines = buildUniqueHeadlines(collected);
        const analysis = summarize(headlines);
        const fallbackHeadlines = cachedPayload && Array.isArray(cachedPayload.sampleHeadlines)
            ? cachedPayload.sampleHeadlines.slice(0, 25)
            : [];
        const connectivity = buildConnectivity(headlines, fallbackHeadlines);
        const referenceMeta = buildReferenceMeta(errors);

        const payload = {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            mode: 'live-sync-now',
            policy: {
                noPropheticAssertionOnCurrentEvents: true,
                noDatePrediction: true,
                sourceRequired: true,
                note: 'هذه المزامنة مؤشرات معرفية للحاضر، وليست جزمًا أن حدثًا معاصرًا هو تحقيق حتمي لعلامة بعينها.'
            },
            connectivity: connectivity.details,
            sources: SOURCES,
            sourcesErrors: errors,
            counts: {
                headlinesCollected: headlines.length,
                sourcesOk: SOURCES.length - errors.length,
                sourcesFailed: errors.length
            },
            themes: analysis.topThemes,
            themeCounters: analysis.counters,
            rumNowLens: buildRumNowLens(analysis.counters),
            fitanNowActions: buildFitanNowActions(analysis.counters),
            mappingToReference: mapThemesToReference(analysis.topThemes),
            sampleHeadlines: headlines.length > 0 ? analysis.tagged.slice(0, 25) : fallbackHeadlines,
            referenceMeta
        };

        writePayload(payload);

        console.log('✓ Live sync completed');
        console.log('  output:', OUT_FILE);
        console.log('  headlines:', payload.counts.headlinesCollected);
        console.log('  sources ok:', payload.counts.sourcesOk, '| failed:', payload.counts.sourcesFailed);
        if (connectivity.usedCachedFallback) {
            console.log('  mode: cached fallback');
        }
        if (analysis.topThemes.length > 0) {
            console.log('  top themes:', analysis.topThemes.map((x) => `${x.theme}:${x.count}`).join(', '));
            return;
        }

        console.log('  top themes: none (check sources)');
    } catch (err) {
        const fallback = readCachedPayload();
        if (fallback) {
            console.warn('! Live sync failed, cached payload preserved:', String(err.message || err));
            process.exitCode = 0;
            return;
        }

        console.error('Live sync failed without cached fallback:', err);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}
