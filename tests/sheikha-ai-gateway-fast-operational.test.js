'use strict';

const {
    buildFastOperationalAnswer,
    isCanonicalIdentityPrompt,
    isVsCodeOperationalPrompt
} = require('../core/ai-gateway/sheikha-ai-gateway');

describe('Sheikha AI Gateway Fast Operational Path', () => {
    test('does not route a plain Sheikha chat prompt to operational mode only because it came from VS Code', () => {
        expect(
            isVsCodeOperationalPrompt('شيخة', { source: 'vscode-chat' })
        ).toBe(false);
    });

    test('treats a plain Sheikha wake prompt as canonical identity chat', () => {
        expect(isCanonicalIdentityPrompt('شيخة')).toBe(true);
        expect(isCanonicalIdentityPrompt('Sheikha')).toBe(true);
    });

    test('routes explicit Arabic and English operational prompts to the fast path', () => {
        expect(
            isVsCodeOperationalPrompt('نفذ lint', { source: 'vscode-chat' })
        ).toBe(true);

        expect(
            isVsCodeOperationalPrompt('run tests', { source: 'web-chat' })
        ).toBe(true);
    });

    test('fast operational guidance uses the corrected Arabic gateway wording', () => {
        const answer = buildFastOperationalAnswer('أحتاج مساعدة تشغيلية');

        expect(answer).toContain('المسار التشغيلي السريع');
        expect(answer).toContain('اعرض حالة البوابة');
        expect(answer).not.toContain('حالة الرواية');
    });
});
