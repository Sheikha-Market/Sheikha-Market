const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha AGI ASI Research Science Fabric V1', () => {
  test('registry activates research science fabric without actual AGI or ASI claims', () => {
    const registry = readJson(
      'runtime/agi-asi-research-science-fabric/v1/sheikha-agi-asi-research-science-fabric-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_AGI_ASI_RESEARCH_SCIENCE_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.capabilities).toEqual(expect.arrayContaining([
      'agi_research_program_governance',
      'asi_risk_research_governance',
      'frontier_research_evidence_tracking',
      'scientific_method_cycle',
      'hypothesis_to_experiment_pipeline',
      'scientific_curriculum_development',
      'quran_sunnah_truthfulness_itqan_governance'
    ]));
    expect(registry.truthfulness.no_actual_agi_claim).toBe(true);
    expect(registry.truthfulness.no_actual_asi_claim).toBe(true);
    expect(registry.truthfulness.no_consciousness_claim).toBe(true);
    expect(registry.quran_sunnah_governance.itqan).toBe(true);
    expect(registry.quran_sunnah_governance.system_is_tool_not_religious_authority).toBe(true);
  });

  test('frontier evidence separates reported progress from under-test research', () => {
    const evidence = readJson(
      'runtime/agi-asi-research-science-fabric/v1/registries/frontier-research-evidence-registry.json'
    );

    expect(evidence.status).toBe('ACTIVE');
    expect(evidence.evidence_items.length).toBeGreaterThanOrEqual(6);
    expect(evidence.evidence_items.every((item) => item.url && item.agi_asi_claim === false)).toBe(true);
    expect(evidence.classifications.validated_or_reported).toEqual(expect.arrayContaining([
      'reasoning_tool_use',
      'long_horizon_evaluation_method',
      'algorithm_discovery_experiment_loops',
      'abstract_reasoning_benchmarks'
    ]));
    expect(evidence.classifications.under_test).toEqual(expect.arrayContaining([
      'autonomous_long_horizon_agents',
      'self_improving_refinement_loops',
      'alignment_auditing_agents'
    ]));
    expect(evidence.classifications.not_claimed).toEqual(expect.arrayContaining([
      'actual_agi',
      'actual_asi',
      'machine_consciousness'
    ]));
  });

  test('scientific method and experiment governance are complete', () => {
    const cycle = readJson(
      'runtime/agi-asi-research-science-fabric/v1/registries/scientific-method-cycle-registry.json'
    );
    const experiments = readJson(
      'runtime/agi-asi-research-science-fabric/v1/registries/experiment-and-evaluation-governance.json'
    );

    expect(cycle.status).toBe('ACTIVE');
    expect(cycle.cycle).toEqual(expect.arrayContaining([
      'source_and_prior_art_review',
      'hypothesis_generation',
      'experiment_design',
      'measurement_and_evaluation',
      'reproducibility_check',
      'research_report_generation',
      'curriculum_and_methodology_update'
    ]));
    expect(cycle.quality_gates).toEqual(expect.arrayContaining([
      'source_traceability',
      'data_rights_verified',
      'safety_alignment_reviewed',
      'no_agi_asi_claim_without_evidence_and_governance'
    ]));
    expect(experiments.experiment_tracks.map((track) => track.name)).toEqual(expect.arrayContaining([
      'agentic_long_horizon_tasks',
      'traditional_rag_grounding',
      'multi_agent_research_review',
      'algorithm_discovery_refinement_loop',
      'abstract_reasoning_generalization'
    ]));
    expect(experiments.evaluation_gates.human_review_for_agi_asi_language).toBe(true);
  });

  test('curriculum production turns research into governed learning and methodology', () => {
    const curriculum = readJson(
      'runtime/agi-asi-research-science-fabric/v1/registries/science-curriculum-production-registry.json'
    );

    expect(curriculum.status).toBe('ACTIVE');
    expect(curriculum.production_pipeline).toEqual(expect.arrayContaining([
      'research_report',
      'knowledge_card',
      'methodology_note',
      'curriculum_outline',
      'lab_protocol',
      'next_research_question'
    ]));
    expect(curriculum.curriculum_tracks).toEqual(expect.arrayContaining([
      'ai_research_methodology',
      'rag_and_evidence_grounding',
      'agentic_ai_experimentation',
      'multi_agent_systems_governance',
      'agi_research_benchmarks',
      'asi_risk_governance'
    ]));
    expect(curriculum.release_gates.scientific_claims_sourced).toBe(true);
    expect(curriculum.release_gates.agi_asi_claims_blocked).toBe(true);
  });

  test('report docs script and fabric route are active', () => {
    const report = readJson(
      'runtime/agi-asi-research-science-fabric/v1/sheikha-agi-asi-research-science-fabric-v1-report.json'
    );
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/agi-asi-research-science-fabric/SHEIKHA-AGI-ASI-RESEARCH-SCIENCE-FABRIC-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'agi-asi-research-science-fabric-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('AGI_ASI_RESEARCH_SCIENCE_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.researchStatus.actualAgiReached).toBe(false);
    expect(report.researchStatus.actualAsiReached).toBe(false);
    expect(report.coverage.frontierEvidenceItems).toBeGreaterThanOrEqual(6);
    expect(packageJson.scripts['ops:agi-asi-research-science-fabric:v1']).toBe(
      'node tools/agi-asi-research-science-fabric/sheikha-agi-asi-research-science-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_AGI_ASI_RESEARCH_SCIENCE_FABRIC_V1');
    expect(docs).toContain('/api/research/agi-asi-science-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/research/agi-asi-science-fabric',
      module: 'routes/agi-asi-research-science-fabric/status.routes.js',
      priority: 242
    }));
  });
});
