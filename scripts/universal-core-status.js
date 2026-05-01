#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const modules = [
    {
        name: 'root-seed-core',
        checks: [
            'infrastructure/sheikha-root-seed-core/root-seed-core-spec.json',
            'infrastructure/sheikha-root-seed-core/seed/seed-layers.json',
            'infrastructure/sheikha-root-seed-core/root/root-layers.json',
            'infrastructure/sheikha-root-seed-core/governance/book-and-sunnah-governance.json'
        ]
    },
    {
        name: 'foundation-governance',
        checks: [
            'infrastructure/sheikha-foundation-governance/governance/charter.json',
            'infrastructure/sheikha-foundation-governance/governance/axes.json',
            'infrastructure/sheikha-foundation-governance/rules/foundational-rules.json',
            'infrastructure/sheikha-foundation-governance/architecture/layers.json'
        ]
    },
    {
        name: 'hyperscale',
        checks: [
            'infrastructure/hyperscale/targets.json',
            'infrastructure/hyperscale/arabic-governance.json'
        ]
    },
    {
        name: 'main-artery',
        checks: [
            'infrastructure/sheikha-main-artery/main-artery-spec.json',
            'infrastructure/sheikha-main-artery/governance/islamic-governance.json',
            'infrastructure/sheikha-main-artery/cloud-saas/hyperscale-cloud-saas-spec.json'
        ]
    },
    {
        name: 'cosmic-heart',
        checks: [
            'infrastructure/sheikha-cosmic-heart/cosmic-heart-spec.json',
            'infrastructure/sheikha-cosmic-heart/pulse-grid/global-pulse-spec.json'
        ]
    },
    {
        name: 'global-brain',
        checks: [
            'infrastructure/sheikha-global-brain-core/global-brain-core-spec.json',
            'infrastructure/sheikha-global-brain-core/governance/brain-governance.json',
            'infrastructure/sheikha-global-brain-core/intelligence-grid/intelligence-grid-spec.json'
        ]
    },
    {
        name: 'muslima-forelock-core',
        checks: [
            'infrastructure/sheikha-muslima-forelock-core/muslima-forelock-core-spec.json',
            'infrastructure/sheikha-muslima-forelock-core/governance/sharia-governance.json',
            'infrastructure/sheikha-muslima-forelock-core/architecture/layered-architecture.json'
        ]
    },
    {
        name: 'mudgha-core',
        checks: [
            'infrastructure/sheikha-mudgha-core/mudgha-core-spec.json',
            'infrastructure/sheikha-mudgha-core/heart/heart-layers.json',
            'infrastructure/sheikha-mudgha-core/governance/governance-controls.json'
        ]
    },
    {
        name: 'vein-core',
        checks: [
            'infrastructure/sheikha-vein-core/vein-core-spec.json',
            'infrastructure/sheikha-vein-core/flows/vein-flows.json',
            'infrastructure/sheikha-vein-core/governance/vein-governance.json'
        ]
    },
    {
        name: 'habl-alwarid-core',
        checks: [
            'infrastructure/sheikha-habl-alwarid-core/habl-alwarid-core-spec.json',
            'infrastructure/sheikha-habl-alwarid-core/layers/near-layers.json',
            'infrastructure/sheikha-habl-alwarid-core/governance/habl-governance.json'
        ]
    },
    {
        name: 'deen-completion-core',
        checks: [
            'infrastructure/sheikha-deen-completion-core/deen-completion-core-spec.json',
            'infrastructure/sheikha-deen-completion-core/layers/completion-layers.json',
            'infrastructure/sheikha-deen-completion-core/governance/completion-governance.json'
        ]
    },
    {
        name: 'data-fabric-core',
        checks: [
            'infrastructure/sheikha-data-fabric-core/data-fabric-core-spec.json',
            'infrastructure/sheikha-data-fabric-core/domains/data-domains.json',
            'infrastructure/sheikha-data-fabric-core/pipeline/improvement-pipeline.json',
            'infrastructure/sheikha-data-fabric-core/governance/data-governance.json'
        ]
    },
    {
        name: 'strategic-partnerships-core',
        checks: [
            'infrastructure/sheikha-strategic-partnerships-core/strategic-partnerships-core-spec.json',
            'infrastructure/sheikha-strategic-partnerships-core/bands/partner-bands.json',
            'infrastructure/sheikha-strategic-partnerships-core/ecosystem/ecosystem-domains.json',
            'infrastructure/sheikha-strategic-partnerships-core/metrics/evaluation-metrics.json',
            'infrastructure/sheikha-strategic-partnerships-core/governance/partnership-governance.json'
        ]
    },
    {
        name: 'ecosystem-segmentation-core',
        checks: [
            'infrastructure/sheikha-ecosystem-segmentation-core/ecosystem-segmentation-core-spec.json',
            'infrastructure/sheikha-ecosystem-segmentation-core/taxonomy/sector-taxonomy.json',
            'infrastructure/sheikha-ecosystem-segmentation-core/clusters/specialist-communities.json',
            'infrastructure/sheikha-ecosystem-segmentation-core/contracts/electronic-contracting-framework.json',
            'infrastructure/sheikha-ecosystem-segmentation-core/automation/digital-integration-workflow.json',
            'infrastructure/sheikha-ecosystem-segmentation-core/governance/ecosystem-governance.json'
        ]
    },
    {
        name: 'global-compute-halal-core',
        checks: [
            'infrastructure/sheikha-global-compute-halal-core/global-compute-halal-core-spec.json',
            'infrastructure/sheikha-global-compute-halal-core/catalog/global-compute-catalog.json',
            'infrastructure/sheikha-global-compute-halal-core/integration/integration-blueprint.json',
            'infrastructure/sheikha-global-compute-halal-core/contracts/digital-contracting-pack.json',
            'infrastructure/sheikha-global-compute-halal-core/governance/halal-governance-controls.json'
        ]
    },
    {
        name: 'advanced-computing-core',
        checks: [
            'infrastructure/sheikha-advanced-computing-core/advanced-computing-core-spec.json',
            'infrastructure/sheikha-advanced-computing-core/computing/computing-fabric.json',
            'infrastructure/sheikha-advanced-computing-core/quantum/quantum-computing-stack.json',
            'infrastructure/sheikha-advanced-computing-core/physical/physical-computing-stack.json',
            'infrastructure/sheikha-advanced-computing-core/neural/neural-network-stack.json',
            'infrastructure/sheikha-advanced-computing-core/branches/computing-branches-catalog.json',
            'infrastructure/sheikha-advanced-computing-core/branches/precision-vertical-horizontal-branches.json',
            'infrastructure/sheikha-advanced-computing-core/integration/cross-computing-integration-links.json',
            'infrastructure/sheikha-advanced-computing-core/fusion/science-fusion-matrix.json',
            'infrastructure/sheikha-advanced-computing-core/sharia/quran-sunnah-digitization-framework.json',
            'infrastructure/sheikha-advanced-computing-core/autogenesis/branch-autogenesis-system.json',
            'infrastructure/sheikha-advanced-computing-core/governance/advanced-computing-governance.json'
        ]
    },
    {
        name: 'generative-rag-core',
        checks: [
            'infrastructure/sheikha-generative-rag-core/generative-rag-core-spec.json',
            'infrastructure/sheikha-generative-rag-core/models/model-router.json',
            'infrastructure/sheikha-generative-rag-core/rag/rag-retrieval-pipeline.json',
            'infrastructure/sheikha-generative-rag-core/knowledge/knowledge-sources-map.json',
            'infrastructure/sheikha-generative-rag-core/integration/computing-rag-integration.json',
            'infrastructure/sheikha-generative-rag-core/innovation/smart-model-blueprint.json',
            'infrastructure/sheikha-generative-rag-core/governance/generative-rag-governance.json'
        ]
    },
    {
        name: 'human-bio-medical-computing-core',
        checks: [
            'infrastructure/sheikha-human-bio-medical-computing-core/human-bio-medical-core-spec.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/lifecycle/human-lifecycle-framework.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/medical/medical-sciences-map.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/blood/blood-computing-framework.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/cells/cellular-computing-framework.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/behavior/behavior-education-framework.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/fusion/cross-science-human-fusion.json',
            'infrastructure/sheikha-human-bio-medical-computing-core/governance/human-dignity-governance.json'
        ]
    },
    {
        name: 'islamic-digital-library-core',
        checks: [
            'infrastructure/sheikha-islamic-digital-library-core/islamic-digital-library-core-spec.json',
            'infrastructure/sheikha-islamic-digital-library-core/taxonomy/sharia-sciences-taxonomy.json',
            'infrastructure/sheikha-islamic-digital-library-core/quran/quran-corpus-manifest.json',
            'infrastructure/sheikha-islamic-digital-library-core/tafsir/tafsir-catalog-manifest.json',
            'infrastructure/sheikha-islamic-digital-library-core/digitization/digitization-framework.json',
            'infrastructure/sheikha-islamic-digital-library-core/computing/computational-islamic-sciences.json',
            'infrastructure/sheikha-islamic-digital-library-core/fusion/methodization-fusion-matrix.json',
            'infrastructure/sheikha-islamic-digital-library-core/rights/privacy-and-rights-governance.json',
            'infrastructure/sheikha-islamic-digital-library-core/governance/scholarly-governance.json'
        ]
    },
    {
        name: 'quranic-science-integration-core',
        checks: [
            'infrastructure/sheikha-quranic-science-integration-core/quranic-science-integration-core-spec.json',
            'infrastructure/sheikha-quranic-science-integration-core/contemplation/quran-contemplation-cases.json',
            'infrastructure/sheikha-quranic-science-integration-core/methodology/hujjah-burhan-istidlal-bayan-framework.json',
            'infrastructure/sheikha-quranic-science-integration-core/fusion/science-fusion-domains.json',
            'infrastructure/sheikha-quranic-science-integration-core/sustainability/sustainable-barakah-framework.json',
            'infrastructure/sheikha-quranic-science-integration-core/governance/quranic-science-governance.json'
        ]
    },
    {
        name: 'islamic-ecosystem-alignment-core',
        checks: [
            'infrastructure/sheikha-islamic-ecosystem-alignment-core/islamic-ecosystem-alignment-core-spec.json',
            'infrastructure/sheikha-islamic-ecosystem-alignment-core/entities/entity-catalog.json',
            'infrastructure/sheikha-islamic-ecosystem-alignment-core/analysis/goal-analysis-framework.json',
            'infrastructure/sheikha-islamic-ecosystem-alignment-core/shared-goals/shared-goals-matrix.json',
            'infrastructure/sheikha-islamic-ecosystem-alignment-core/improvement/improvement-framework.json',
            'infrastructure/sheikha-islamic-ecosystem-alignment-core/governance/ecosystem-alignment-governance.json'
        ]
    },
    {
        name: 'consent-communication-governance-core',
        checks: [
            'infrastructure/sheikha-consent-communication-governance-core/consent-communication-governance-core-spec.json',
            'infrastructure/sheikha-consent-communication-governance-core/communication/communication-catalog.json',
            'infrastructure/sheikha-consent-communication-governance-core/consent/consent-policy.json',
            'infrastructure/sheikha-consent-communication-governance-core/governance/privacy-policy.json',
            'infrastructure/sheikha-consent-communication-governance-core/defensive-monitoring/system-health-monitoring-policy.json',
            'infrastructure/sheikha-consent-communication-governance-core/partnerships/partner-transparency-model.json'
        ]
    },
    {
        name: 'training-core',
        checks: [
            'infrastructure/sheikha-training-core/training-core-spec.json',
            'infrastructure/sheikha-training-core/sessions/training-sessions-catalog.json',
            'infrastructure/sheikha-training-core/datasets/training-datasets-manifest.json',
            'infrastructure/sheikha-training-core/pipelines/training-pipeline.json',
            'infrastructure/sheikha-training-core/evaluation/training-evaluation-framework.json',
            'infrastructure/sheikha-training-core/governance/training-governance.json'
        ]
    },
    {
        name: 'simulation-testing-core',
        checks: [
            'infrastructure/sheikha-simulation-testing-core/simulation-testing-core-spec.json',
            'infrastructure/sheikha-simulation-testing-core/scenarios/test-scenarios-catalog.json',
            'infrastructure/sheikha-simulation-testing-core/queries/rag-query-simulation-bank.json',
            'infrastructure/sheikha-simulation-testing-core/benchmarks/performance-benchmarks.json',
            'infrastructure/sheikha-simulation-testing-core/results/simulation-results-log.json',
            'infrastructure/sheikha-simulation-testing-core/governance/simulation-governance.json'
        ]
    },
    {
        name: 'production-core',
        checks: [
            'infrastructure/sheikha-production-core/production-core-spec.json',
            'infrastructure/sheikha-production-core/deployment/deployment-blueprint.json',
            'infrastructure/sheikha-production-core/monitoring/health-monitoring-policy.json',
            'infrastructure/sheikha-production-core/load-balancing/load-balancing-spec.json',
            'infrastructure/sheikha-production-core/scaling/auto-scaling-framework.json',
            'infrastructure/sheikha-production-core/governance/production-governance.json'
        ]
    },
    {
        name: 'generative-production-core',
        checks: [
            'infrastructure/sheikha-generative-production-core/generative-production-core-spec.json',
            'infrastructure/sheikha-generative-production-core/pipeline/integrated-production-pipeline.json',
            'infrastructure/sheikha-generative-production-core/modes/generative-production-modes.json',
            'infrastructure/sheikha-generative-production-core/innovation/production-innovation-engine.json',
            'infrastructure/sheikha-generative-production-core/integration/training-simulation-production-integration.json',
            'infrastructure/sheikha-generative-production-core/governance/generative-production-governance.json'
        ]
    },
    {
        name: 'network-fabric-core',
        checks: [
            'infrastructure/sheikha-network-fabric-core/network-fabric-core-spec.json',
            'infrastructure/sheikha-network-fabric-core/physical/physical-network-layer.json',
            'infrastructure/sheikha-network-fabric-core/quantum/quantum-network-layer.json',
            'infrastructure/sheikha-network-fabric-core/neural/neural-network-layer.json',
            'infrastructure/sheikha-network-fabric-core/logical/logical-network-layer.json',
            'infrastructure/sheikha-network-fabric-core/subsecond/sub-second-engine.json',
            'infrastructure/sheikha-network-fabric-core/governance/network-fabric-governance.json'
        ]
    },
    {
        name: 'neural-production-engine',
        checks: [
            'infrastructure/sheikha-neural-production-engine/neural-production-engine-spec.json',
            'infrastructure/sheikha-neural-production-engine/layers/neural-architecture.json',
            'infrastructure/sheikha-neural-production-engine/training-loop/infinite-training-loop.json',
            'infrastructure/sheikha-neural-production-engine/quantum-bridge/quantum-neural-bridge.json',
            'infrastructure/sheikha-neural-production-engine/physical-integration/physical-computing-integration.json',
            'infrastructure/sheikha-neural-production-engine/performance/sub-second-engine-status.json',
            'infrastructure/sheikha-neural-production-engine/governance/neural-engine-governance.json'
        ]
    },
    {
        name: 'open-markets-core',
        checks: [
            'infrastructure/sheikha-open-markets-core/open-markets-core-spec.json',
            'infrastructure/sheikha-open-markets-core/markets/specialization-framework.json',
            'infrastructure/sheikha-open-markets-core/innovation/innovation-without-artificial-limits.json',
            'infrastructure/sheikha-open-markets-core/projects/new-projects-blueprint.json',
            'infrastructure/sheikha-open-markets-core/sharia/open-markets-sharia-filter.json',
            'infrastructure/sheikha-open-markets-core/governance/open-markets-governance.json',
            'data/sheikha-open-markets.json'
        ]
    },
    {
        name: 'universal-core-map',
        checks: [
            'infrastructure/universal-core-map/dependency-map.json'
        ]
    }
];

function exists(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function main() {
    const moduleStatus = modules.map((mod) => {
        const results = mod.checks.map((check) => ({ path: check, exists: exists(check) }));
        const score = Math.round((results.filter((r) => r.exists).length / results.length) * 100);

        return {
            module: mod.name,
            readinessScore: score,
            checks: results
        };
    });

    const total = moduleStatus.reduce((sum, m) => sum + m.readinessScore, 0);
    const overall = Math.round(total / moduleStatus.length);

    console.log(JSON.stringify({
        success: true,
        message: overall === 100
            ? 'النواة الشاملة لشيخة مفعلة بالكامل'
            : 'النواة الشاملة تحتاج استكمال بعض العناصر',
        data: {
            overallReadiness: overall,
            modules: moduleStatus
        },
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
