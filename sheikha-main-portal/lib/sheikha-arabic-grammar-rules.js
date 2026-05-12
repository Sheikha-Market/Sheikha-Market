'use strict';

const grammarRules = {
    version: '1.0.0',
    name: 'منظومة قواعد اللغة العربية الرقمية',
    description: 'قواعد نحوية وصرفية ممثلة بخلايا معرفية قابلة للتحليل البرمجي.',
    cells: {
        grammar: {
            total: 75,
            groups: {
                sentenceStructure: 15,
                nominalSentence: 12,
                verbalSentence: 12,
                caseSystem: 10,
                modifiers: 8,
                particles: 10,
                advancedPatterns: 8
            }
        },
        engine: {
            total: 60,
            groups: {
                tokenize: 10,
                classify: 10,
                dependency: 10,
                syntaxScore: 10,
                semanticHints: 10,
                decisionBridge: 10
            }
        }
    },
    particles: {
        prepositions: ['من', 'إلى', 'عن', 'على', 'في', 'الباء', 'اللام', 'الكاف'],
        conjunctions: ['و', 'ف', 'ثم', 'أو', 'بل', 'لكن'],
        nasb: ['أن', 'لن', 'كي', 'إذن'],
        jazm: ['لم', 'لما', 'لا', 'لام الأمر']
    },
    templates: {
        nominal: {
            pattern: 'مبتدأ + خبر',
            examples: ['العلم نافع', 'التاجر صادق']
        },
        verbal: {
            pattern: 'فعل + فاعل + مفعول به',
            examples: ['كتب التاجر العقد', 'باع البائع المعدن']
        }
    }
};

module.exports = {
    grammarRules
};
