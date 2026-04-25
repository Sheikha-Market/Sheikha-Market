'use strict';

function extractNumbers(text) {
    const matches = String(text || '').match(/-?\d+(?:\.\d+)?/g);
    return (matches || []).map(Number).filter((value) => Number.isFinite(value));
}

function toLower(text) {
    return String(text || '').toLowerCase().trim();
}

function bridgeToCsLanguage(input = {}) {
    const text = toLower(input.text || input.command || '');
    if (!text) {
        return null;
    }

    const numbers = extractNumbers(text);

    const candidates = [
        {
            match: /رتب|فرز|sort/,
            payload: {
                operation: 'sort',
                values: numbers
            }
        },
        {
            match: /ابحث|search/,
            payload: {
                operation: 'search',
                values: numbers,
                target: numbers.length ? numbers[0] : 0
            }
        },
        {
            match: /هاش|بصمة|hash/,
            payload: {
                operation: 'hash',
                text: input.text || '',
                mode: /sha512/.test(text) ? 'sha512' : 'sha256'
            }
        },
        {
            match: /حول|تحويل|base|اساس/,
            payload: {
                operation: 'convert',
                value: numbers.length ? String(numbers[0]) : '0',
                baseFrom: 10,
                baseTo: /ثنائي|binary|base\s*2/.test(text) ? 2 : 16
            }
        },
        {
            match: /زكاة|zakat/,
            payload: {
                operation: 'zakat',
                amount: numbers.length ? numbers[0] : 0
            }
        }
    ];

    const detected = candidates.find((item) => item.match.test(text));
    if (detected) {
        return {
            target: '/api/cs-language/execute',
            payload: detected.payload
        };
    }

    return null;
}

module.exports = bridgeToCsLanguage;
