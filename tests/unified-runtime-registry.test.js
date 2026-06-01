const runtimeRegistry = require('../config/runtime-registry');
const config = require('../config/config');
const MarketUnit = require('../models/MarketUnit');

describe('Unified runtime registry', () => {
    test('exposes central human language defaults', () => {
        expect(runtimeRegistry.getDefaultHumanLanguage()).toBe('ar');
        expect(runtimeRegistry.getHumanLanguageCodes()).toContain('en');
        expect(runtimeRegistry.getHumanLanguageDirection('ar-SA')).toBe('rtl');
    });

    test('supports registered and extensible programming languages', () => {
        const customEnv = {
            SHEIKHA_EXTRA_PROGRAMMING_LANGUAGES: 'brainfuck, moonbit',
            SHEIKHA_ALLOW_UNKNOWN_PROGRAMMING_LANGUAGES: 'true'
        };

        expect(runtimeRegistry.getSupportedProgrammingLanguages(customEnv)).toEqual(
            expect.arrayContaining(['javascript', 'brainfuck', 'moonbit'])
        );
        expect(runtimeRegistry.isProgrammingLanguageSupported('c++', customEnv)).toBe(true);
        expect(runtimeRegistry.isProgrammingLanguageSupported('totally-new-lang', customEnv)).toBe(true);
    });

    test('config exposes unified runtime and language metadata', () => {
        expect(config.languages.supportedCodes).toContain('ar');
        expect(config.languages.programming).toContain('javascript');
        expect(config.runtime.currentProfile).toHaveProperty('id');
        expect(config.runtime.integrations).toHaveProperty('openai');
    });

    test('market unit defaults to central supported human languages', () => {
        const market = new MarketUnit();
        expect(market.operationalData.languagesSupported).toEqual(runtimeRegistry.getHumanLanguageCodes());
    });
});
