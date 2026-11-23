#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ADVANCED_CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-advanced-computing-core.json');
const ISLAMIC_CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-islamic-digital-library-core.json');
const HUMAN_CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-human-bio-medical-computing-core.json');

function nowIso() {
    return new Date().toISOString();
}

function slugify(input) {
    return String(input || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs() {
    const args = process.argv.slice(2);
    const result = {};

    args.forEach((arg) => {
        if (!arg.startsWith('--')) {
            return;
        }

        const idx = arg.indexOf('=');
        if (idx === -1) {
            result[arg.slice(2)] = true;
            return;
        }

        const key = arg.slice(2, idx);
        const val = arg.slice(idx + 1);
        result[key] = val;
    });

    return result;
}

function readJson(filePath, fallback = {}) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallback;
    }
}

function inferFusionDomains(science) {
    const normalized = String(science || '').toLowerCase();
    const domains = [];

    if (/space|فضاء|astronomy|orbital|planet/.test(normalized)) {
        domains.push('space-sciences');
    }
    if (/sea|marine|ocean|بحر|بحار/.test(normalized)) {
        domains.push('marine-sciences');
    }
    if (/geo|geology|earth|ارض|جيولوج/.test(normalized)) {
        domains.push('earth-sciences');
    }
    if (/logistics|supply|توريد|امداد|لوجست/.test(normalized)) {
        domains.push('logistics-and-supply');
    }
    if (/medical|medicine|health|human|طب|صحة|بشر|دم|خلايا/.test(normalized)) {
        domains.push('human-and-medical-sciences');
    }
    if (/ai|artificial|machine|ذكاء/.test(normalized)) {
        domains.push('ai-and-computing');
    }
    if (/industry|oil|petro|طيران|طائرات|بترول|صناع/.test(normalized)) {
        domains.push('industrial-sciences');
    }

    if (domains.length === 0) {
        domains.push('general-cross-science-domain');
    }

    return domains;
}

function buildProposal(params, advanced, islamic, human) {
    const science = params.science || params.domain || 'general-science';
    const goal = params.goal || 'beneficial-knowledge-integration';
    const mode = params.mode || 'cross-domain-fusion';
    const parent = params.parent || 'knowledge-graph-and-reasoning-fabric';

    const fusionDomains = inferFusionDomains(science);
    const baseSlug = slugify(science);
    const fallbackSlug = slugify(fusionDomains[0]);
    const slug = baseSlug || fallbackSlug || 'general-science';
    const proposedBranch = 'computing-for-' + slug;
    const advancedAnchors = (advanced.quranSunnahDigitizationFramework || {}).anchors || [];

    const evidence = {
        quranAndSunnahAnchors: advancedAnchors,
        islamicControls: (islamic.foundation || {}).controls || [],
        humanDignityControls: (human.foundation || {}).controls || []
    };

    return {
        generatedAt: nowIso(),
        request: {
            science,
            goal,
            mode,
            parent
        },
        proposal: {
            branchName: proposedBranch,
            parentBranch: parent,
            branchType: mode === 'branch-from-branch' ? 'derived' : 'fusion',
            objective: goal,
            fusionDomains,
            computationTracks: [
                'knowledge-modeling',
                'decision-support',
                'risk-governance',
                'continuous-improvement-loop'
            ],
            methodization: {
                hujjah: 'quran-sunnah-evidence-mapped',
                burhan: 'logical-and-empirical-validation',
                istidlal: 'structured-rule-derivation',
                bayan: 'explainable-and-auditable-output'
            },
            governance: {
                confidentiality: 'by-default',
                intellectualProperty: 'protected-and-attributed',
                reviewLayers: ['technical', 'sharia', 'domain-expert', 'privacy']
            }
        },
        improvementLoop: {
            cycle: ['measure-value', 'detect-gaps', 'refine-models', 'approve-update', 'redeploy'],
            kpis: ['benefit-score', 'clarity-score', 'evidence-coverage', 'safety-score']
        },
        evidence
    };
}

function main() {
    const params = parseArgs();
    const advanced = readJson(ADVANCED_CONFIG_PATH, {});
    const islamic = readJson(ISLAMIC_CONFIG_PATH, {});
    const human = readJson(HUMAN_CONFIG_PATH, {});

    const proposal = buildProposal(params, advanced, islamic, human);

    console.log(JSON.stringify({
        success: true,
        data: proposal,
        message: 'تم توليد فرع مقترح جديد وتحسينه منهجياً',
        timestamp: nowIso()
    }, null, 4));
}

main();
