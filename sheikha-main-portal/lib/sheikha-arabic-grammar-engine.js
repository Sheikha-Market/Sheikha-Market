'use strict';

const { grammarRules } = require('./sheikha-arabic-grammar-rules');

function normalizeText(text) {
    return String(text || '')
    .replaceAll(/\s+/g, ' ')
        .trim();
}

function detectSentenceType(tokens) {
    if (!tokens.length) {
        return 'unknown';
    }

    const verbalStarters = [
        'كتب', 'باع', 'اشترى', 'قرأ', 'ذهب', 'جاء', 'أكل', 'شرب',
        'رتب', 'فرز', 'احسب', 'زكاة', 'نفذ', 'شغل', 'فعّل', 'فعل',
        'ابحث', 'فتش', 'اعثر', 'هاش', 'شفر', 'بصم', 'حوّل', 'حول', 'بدل'
    ];
    if (verbalStarters.includes(tokens[0])) {
        return 'verbal';
    }

    return 'nominal';
}

function classifyTokens(tokens) {
    return tokens.map((token, index) => {
        let role = 'unknown';

        if (index === 0) {
            role = detectSentenceType(tokens) === 'verbal' ? 'verb' : 'subject';
        } else if (index === 1 && detectSentenceType(tokens) === 'verbal') {
            role = 'actor';
        } else if (index >= 2 && detectSentenceType(tokens) === 'verbal') {
            role = 'object';
        } else if (index > 0 && detectSentenceType(tokens) === 'nominal') {
            role = 'predicate';
        }

        if (grammarRules.particles.prepositions.includes(token)) {
            role = 'preposition';
        }

        if (grammarRules.particles.conjunctions.includes(token)) {
            role = 'conjunction';
        }

        return {
            token,
            role
        };
    });
}

function analyze(text) {
    const normalized = normalizeText(text);
    const tokens = normalized ? normalized.split(' ') : [];
    const sentenceType = detectSentenceType(tokens);
    const classes = classifyTokens(tokens);

    return {
        engine: 'sheikha-arabic-grammar-engine',
        version: grammarRules.version,
        text: normalized,
        sentenceType,
        tokenCount: tokens.length,
        tokens: classes,
        cells: grammarRules.cells,
        confidence: tokens.length ? Math.min(0.99, 0.6 + tokens.length * 0.05) : 0
    };
}

module.exports = {
    analyze,
    grammarRules
};
