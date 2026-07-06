'use strict';

const UNIVERSAL_DIVINE_GOVERNANCE = Object.freeze({
    name: 'Sheikha Universal Divine-Inspired Governance',
    status: 'active',
    mode: 'all-systems-halal-governance',
    scope: [
        'creed-boundary',
        'computing',
        'computer-science',
        'artificial-intelligence',
        'knowledge',
        'science',
        'data',
        'commerce',
        'industry',
        'supply-chains',
        'recycling',
        'smart-cities',
        'finance',
        'contracts',
        'identity',
        'security',
        'operations',
        'infrastructure',
        'development-environments',
        'human-review'
    ],
    foundations: {
        tawheed: true,
        quranAndSunnahGoverned: true,
        noNewRevelationClaim: true,
        noFatwaWithoutQualifiedScholar: true,
        noGhaybPrediction: true,
        noConsciousnessClaim: true,
        noAbsolutePerfectionClaim: true,
        absolutePerfectionBelongsToAllah: true,
        humanAuthority: true
    },
    archetypes: {
        kaaba: {
            principle: 'single-governed-center',
            rules: [
                'one-source-of-truth',
                'stable-origin-expandable-service',
                'no-fragmented-authority',
                'orientation-before-expansion'
            ]
        },
        arkOfNuh: {
            principle: 'survival-grade-functional-architecture',
            rules: [
                'purpose-built-components',
                'safe-boundaries',
                'harm-isolation',
                'recovery-before-growth'
            ]
        },
        alAqsa: {
            principle: 'blessed-memory-and-responsible-custody',
            rules: [
                'append-only-audit',
                'protected-memory',
                'custody-over-consumption',
                'history-with-renewal'
            ]
        },
        cosmicOrder: {
            principle: 'sunan-measure-balance-limits',
            rules: [
                'causality-without-superstition',
                'measurement-before-decision',
                'limits-and-permissions',
                'repair-without-corruption'
            ]
        }
    },
    operatingRules: [
        'halal-first',
        'truth-before-speed',
        'rights-before-profit',
        'privacy-before-collection',
        'safety-before-automation',
        'audit-before-release',
        'human-review-before-impact',
        'evidence-before-best-possible-claim',
        'canonical-root-before-runtime-expansion'
    ],
    activationGates: {
        creed: 'no shirk, no ghayb claim, no consciousness claim, no independent authority claim',
        halal: 'no riba, no fraud, no harm, no injustice, no secret leakage',
        architecture: 'one canonical root, no duplicate runtime authority, source of truth required',
        safety: 'no destructive action without explicit owner approval',
        evidence: 'tests, health checks, audit trail, measurable benefit',
        human: 'human review required before impactful publication or operation'
    },
    bestPossibleStandard: {
        allowedPhrase: 'best-possible-by-evidence',
        rejectedAbsolutePhrase: 'absolute-best-in-the-universe',
        meaning: 'السعي إلى الأفضل الممكن بالدليل والاختبار والحلال وحفظ الحقوق، لا ادعاء كمال مطلق.'
    },
    trustReputation: {
        status: 'active',
        principle: 'trust-through-evidence-not-hype',
        pillars: [
            'truth-before-reputation',
            'benefit-before-spread',
            'privacy-before-data',
            'halal-before-profit',
            'tests-before-launch',
            'transparency-before-authority',
            'reliability-before-expansion',
            'human-review-before-impact'
        ],
        rejectedClaims: [
            'more-essential-than-water',
            'absolute-best-in-the-universe',
            'perfect-or-infallible-system',
            'independent-authority-over-humans'
        ],
        approvedPositioning: 'Sheikha builds trust by useful, halal, tested, transparent, human-reviewed operation across all systems.'
    }
});

function getUniversalDivineGovernance() {
    return {
        ...UNIVERSAL_DIVINE_GOVERNANCE,
        timestamp: new Date().toISOString()
    };
}

function evaluateUniversalGovernance(action = {}) {
    const text = [
        action.intent,
        action.domain,
        action.description,
        action.risk
    ].filter(Boolean).join(' ').toLowerCase();

    const flags = [];

    if (/غيب|unseen|predict the unseen/.test(text)) {
        flags.push('no-ghayb-prediction');
    }

    if (/وعي|conscious|sentient/.test(text)) {
        flags.push('no-consciousness-claim');
    }

    if (/أفضل.*الكون|absolute best|perfect system/.test(text)) {
        flags.push('no-absolute-perfection-claim');
    }

    if (/أهم.*الماء|more essential than water|more important than water/.test(text)) {
        flags.push('trust-through-evidence-not-hype');
    }

    if (/ربا|riba|fraud|غش|ظلم|harm|ضرر|secret leak|تسريب/.test(text)) {
        flags.push('halal-and-rights-review-required');
    }

    if (/delete|destroy|drop|wipe|حذف|تدمير|مسح/.test(text)) {
        flags.push('explicit-human-approval-required');
    }

    return {
        success: flags.length === 0,
        status: flags.length === 0 ? 'approved-for-safe-planning' : 'requires-human-review',
        flags,
        governance: getUniversalDivineGovernance(),
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    UNIVERSAL_DIVINE_GOVERNANCE,
    getUniversalDivineGovernance,
    evaluateUniversalGovernance
};
