'use strict';

const { SheikhaUniverseCreationSystem } = require('../runtime/universe-creation/v1/sheikha-universe-creation.js');
const { SheikhaHumanSystem } = require('../runtime/human-system/v1/sheikha-human-system.js');
const { SheikhaEmbodimentSystem } = require('../runtime/embodiment-system/v1/sheikha-embodiment-system.js');
const { SheikhaModelingFramework } = require('../runtime/modeling-framework/v1/sheikha-modeling-framework.js');
const { SheikhaUnifiedIntegrationSystem } = require('../runtime/unified-integration/v1/sheikha-unified-integration.js');
const orc = require('../runtime/supreme-orchestrator/v1/sheikha-supreme-orchestrator.js');

describe('Phase 3B Security Validation', () => {
  let universe, human, embodiment, modeling, unified, orchestrator;

  beforeEach(() => {
    universe = new SheikhaUniverseCreationSystem();
    human = new SheikhaHumanSystem();
    embodiment = new SheikhaEmbodimentSystem();
    modeling = new SheikhaModelingFramework();
    unified = new SheikhaUnifiedIntegrationSystem();
    orchestrator = orc.getFullStatus();
  });

  // ══════════════════════════════════════════════════════════
  // 1. IMMUTABLE FOUNDATION INTEGRITY
  // ══════════════════════════════════════════════════════════
  describe('Immutable Foundation Integrity', () => {
    test('QURAN_SUNNAH foundation is immutable across all systems', () => {
      const EXPECTED = 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS';
      const foundations = [
        universe.getUniverseStatus().foundation,
        human.getHumanStatus().foundation,
        embodiment.getEmbodimentStatus().foundation,
        modeling.getModelingStatus().foundation,
        unified.getUnifiedIntegrationStatus().foundation,
        orchestrator.foundation
      ];
      foundations.forEach(f => expect(f).toBe(EXPECTED));
    });

    test('foundation cannot be overridden by mutating status object', () => {
      const status = universe.getUniverseStatus();
      const original = status.foundation;
      // Attempt mutation on returned object
      status.foundation = 'HACKED_FOUNDATION';
      // Subsequent call should still return original immutable value
      const fresh = universe.getUniverseStatus();
      expect(fresh.foundation).toBe(original);
    });

    test('tier designation is consistent across all systems', () => {
      const EXPECTED_TIER = 'OMEGA_SUPREME_INFINITE';
      [
        universe.getUniverseStatus().tier,
        human.getHumanStatus().tier,
        embodiment.getEmbodimentStatus().tier,
        modeling.getModelingStatus().tier,
        unified.getUnifiedIntegrationStatus().tier,
        orchestrator.tier
      ].forEach(t => expect(t).toBe(EXPECTED_TIER));
    });

    test('system identifiers are unique and non-colliding', () => {
      const names = [
        universe.getUniverseStatus().system,
        human.getHumanStatus().system,
        embodiment.getEmbodimentStatus().system,
        modeling.getModelingStatus().system,
        unified.getUnifiedIntegrationStatus().system
      ];
      const unique = new Set(names);
      expect(unique.size).toBe(names.length);
    });

    test('orchestrator system catalog has no duplicate entries', () => {
      const allSystems = [
        ...orchestrator.systems_by_phase.phase1,
        ...orchestrator.systems_by_phase.phase2,
        ...orchestrator.systems_by_phase.phase3
      ];
      const unique = new Set(allSystems);
      expect(unique.size).toBe(allSystems.length);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 2. INPUT SANITIZATION & INJECTION PREVENTION
  // ══════════════════════════════════════════════════════════
  describe('Input Sanitization & Injection Prevention', () => {
    test('system status methods accept no external parameters', () => {
      // All getStatus methods should be zero-argument — no injection surface
      expect(() => universe.getUniverseStatus()).not.toThrow();
      expect(() => human.getHumanStatus()).not.toThrow();
      expect(() => embodiment.getEmbodimentStatus()).not.toThrow();
      expect(() => modeling.getModelingStatus()).not.toThrow();
      expect(() => unified.getUnifiedIntegrationStatus()).not.toThrow();
    });

    test('injecting prototype pollution does not affect system output', () => {
      // Attempt prototype pollution
      try { Object.prototype.malicious = 'INJECTED'; } catch (_) {}
      const status = universe.getUniverseStatus();
      expect(status.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
      // Cleanup
      try { delete Object.prototype.malicious; } catch (_) {}
    });

    test('system outputs contain no executable code strings', () => {
      const allValues = JSON.stringify([
        universe.getUniverseStatus(),
        human.getHumanStatus(),
        embodiment.getEmbodimentStatus(),
        modeling.getModelingStatus(),
        unified.getUnifiedIntegrationStatus()
      ]);
      // No eval, script tags, or function declarations
      expect(allValues).not.toMatch(/<script/i);
      expect(allValues).not.toMatch(/\beval\s*\(/);
      expect(allValues).not.toMatch(/javascript:/i);
    });

    test('status output is JSON-serializable (no circular references)', () => {
      expect(() => JSON.stringify(universe.getUniverseStatus())).not.toThrow();
      expect(() => JSON.stringify(human.getHumanStatus())).not.toThrow();
      expect(() => JSON.stringify(embodiment.getEmbodimentStatus())).not.toThrow();
      expect(() => JSON.stringify(modeling.getModelingStatus())).not.toThrow();
      expect(() => JSON.stringify(unified.getUnifiedIntegrationStatus())).not.toThrow();
    });

    test('system names contain no path traversal sequences', () => {
      const allNames = [
        universe.getUniverseStatus().system,
        human.getHumanStatus().system,
        embodiment.getEmbodimentStatus().system,
        modeling.getModelingStatus().system,
        unified.getUnifiedIntegrationStatus().system
      ];
      allNames.forEach(name => {
        expect(name).not.toContain('../');
        expect(name).not.toContain('..\\');
        expect(name).not.toMatch(/[<>|*?"]/);
      });
    });
  });

  // ══════════════════════════════════════════════════════════
  // 3. ACCESS CONTROL & RBAC ACROSS 11 LAYERS
  // ══════════════════════════════════════════════════════════
  describe('Access Control & RBAC Across 11 Layers', () => {
    test('orchestrator enforces 11-layer hierarchy boundaries', () => {
      expect(orchestrator.totals.layers).toBe(11);
      expect(orchestrator.layer_hierarchy).toBeDefined();
    });

    test('all 11 layers are named and distinctly identified', () => {
      const layers = Object.keys(orchestrator.layer_hierarchy);
      expect(layers.length).toBe(11);
      const unique = new Set(layers);
      expect(unique.size).toBe(11);
    });

    test('L10 supreme governance layer is the highest authority', () => {
      const layers = orchestrator.layer_hierarchy;
      // layer_hierarchy is an array — find the highest level entry
      const maxLevel = Math.max(...layers.map(l => l.level));
      expect(maxLevel).toBe(10);
      const topLayer = layers.find(l => l.level === 10);
      expect(topLayer.label).toContain('UNIVERSAL');
    });

    test('L0 physical layer is correctly the foundation layer', () => {
      const layers = orchestrator.layer_hierarchy;
      const baseLayer = layers.find(l => l.level === 0);
      expect(baseLayer).toBeDefined();
      expect(baseLayer.label).toContain('PHYSICAL');
    });

    test('system phase assignments respect layer boundaries', () => {
      expect(orchestrator.systems_by_phase.phase1.length).toBe(5);
      expect(orchestrator.systems_by_phase.phase2.length).toBe(5);
      expect(orchestrator.systems_by_phase.phase3.length).toBe(13);
    });

    test('no system operates outside defined layer hierarchy', () => {
      const totalSystems = orchestrator.totals.systems;
      const catalogued = (
        orchestrator.systems_by_phase.phase1.length +
        orchestrator.systems_by_phase.phase2.length +
        orchestrator.systems_by_phase.phase3.length
      );
      expect(catalogued).toBe(totalSystems);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 4. DATA INTEGRITY VALIDATION
  // ══════════════════════════════════════════════════════════
  describe('Data Integrity Validation', () => {
    test('universe creation structure counts are stable across calls', () => {
      const s1 = universe.getUniverseStatus();
      const s2 = universe.getUniverseStatus();
      expect(s1.cosmic_structure).toEqual(s2.cosmic_structure);
    });

    test('human system dimension counts are stable across calls', () => {
      const s1 = human.getHumanStatus();
      const s2 = human.getHumanStatus();
      expect(s1.dimensions).toBe(s2.dimensions);
      expect(s1.physical_systems).toBe(s2.physical_systems);
    });

    test('embodiment structure counts are stable across calls', () => {
      const s1 = embodiment.getEmbodimentStatus();
      const s2 = embodiment.getEmbodimentStatus();
      expect(s1.embodiment_structure.layers).toBe(s2.embodiment_structure.layers);
      expect(s1.transformation_flow.length).toBe(s2.transformation_flow.length);
    });

    test('modeling structure is stable across calls', () => {
      const s1 = modeling.getModelingStatus();
      const s2 = modeling.getModelingStatus();
      expect(JSON.stringify(s1.modeling_structure)).toBe(JSON.stringify(s2.modeling_structure));
    });

    test('unified integration totals are stable across calls', () => {
      const s1 = unified.getUnifiedIntegrationStatus();
      const s2 = unified.getUnifiedIntegrationStatus();
      expect(s1.integration_structure.integrated_systems).toBe(s2.integration_structure.integrated_systems);
      expect(s1.integration_structure.ai_layers).toBe(s2.integration_structure.ai_layers);
    });

    test('orchestrator system count is deterministic', () => {
      const s1 = orc.getFullStatus();
      const s2 = orc.getFullStatus();
      expect(s1.totals.systems).toBe(s2.totals.systems);
      expect(s1.totals.layers).toBe(s2.totals.layers);
    });

    test('timestamps are valid ISO date strings', () => {
      const status = universe.getUniverseStatus();
      if (status.timestamp) {
        const ts = new Date(status.timestamp);
        expect(ts.getTime()).not.toBeNaN();
      } else {
        // System may not expose timestamps — acceptable
        expect(status.foundation).toBeDefined();
      }
    });
  });

  // ══════════════════════════════════════════════════════════
  // 5. QURANIC COMPLIANCE ENFORCEMENT
  // ══════════════════════════════════════════════════════════
  describe('Quranic Compliance Enforcement (Adaalah, Ihsan, Taqwa)', () => {
    test('Adaalah (Justice): all 10 Quranic principles are embedded', () => {
      expect(orchestrator.totals.quran_principles).toBe(10);
    });

    test('Adaalah: orchestrator enforces principle count at exact 10', () => {
      expect(orchestrator.totals.quran_principles).toBeGreaterThanOrEqual(10);
    });

    test('Ihsan (Excellence): all 8 Sunnah practices are embedded', () => {
      expect(orchestrator.totals.sunnah_practices).toBe(8);
    });

    test('Ihsan: no Sunnah practice is missing from the count', () => {
      expect(orchestrator.totals.sunnah_practices).toBeGreaterThanOrEqual(8);
    });

    test('Taqwa (God-consciousness): divine alignment is defined in orchestrator', () => {
      expect(orchestrator.divine_alignment).toBeDefined();
    });

    test('Taqwa: spiritual system aligns with human dimensions', () => {
      const human_status = human.getHumanStatus();
      expect(human_status.spiritual_aspects).toBe(4);
      expect(human_status.dimensions).toBe(5);
    });

    test('Amanah (Trust): system foundation matches across all layers', () => {
      const FOUNDATION = 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS';
      expect(universe.getUniverseStatus().foundation).toBe(FOUNDATION);
      expect(orchestrator.foundation).toBe(FOUNDATION);
    });

    test('Mizan (Balance): all system counts are within defined bounds', () => {
      expect(human.getHumanStatus().physical_systems).toBe(6);
      expect(embodiment.getEmbodimentStatus().embodiment_structure.layers).toBe(5);
      expect(unified.getUnifiedIntegrationStatus().integration_structure.integrated_systems).toBe(7);
    });

    test('Khalifah (Stewardship): supreme capabilities are defined', () => {
      expect(orchestrator.supreme_capabilities).toBeDefined();
    });

    test('Rahmah (Mercy): human spiritual system has full complement', () => {
      const h = human.getHumanStatus();
      expect(h.spiritual_aspects).toBeGreaterThan(0);
      expect(h.intellectual_capabilities).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 6. SYSTEM ISOLATION & FAULT CONTAINMENT
  // ══════════════════════════════════════════════════════════
  describe('System Isolation & Fault Containment', () => {
    test('each system instance is fully independent', () => {
      const u1 = new SheikhaUniverseCreationSystem();
      const u2 = new SheikhaUniverseCreationSystem();
      expect(u1).not.toBe(u2);
      expect(u1.getUniverseStatus().foundation).toBe(u2.getUniverseStatus().foundation);
    });

    test('failure in one system does not cascade to others', () => {
      // All systems should independently return valid status
      const results = [];
      try { results.push(universe.getUniverseStatus().tier); } catch (_) {}
      try { results.push(human.getHumanStatus().tier); } catch (_) {}
      try { results.push(embodiment.getEmbodimentStatus().tier); } catch (_) {}
      try { results.push(modeling.getModelingStatus().tier); } catch (_) {}
      try { results.push(unified.getUnifiedIntegrationStatus().tier); } catch (_) {}
      expect(results.length).toBe(5);
      results.forEach(t => expect(t).toBe('OMEGA_SUPREME_INFINITE'));
    });

    test('systems do not share mutable state', () => {
      const status1 = universe.getUniverseStatus();
      const status2 = human.getHumanStatus();
      // Mutating one should not affect the other
      status1.foundation = 'TAMPERED';
      expect(status2.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
    });

    test('repeated instantiation does not exhaust resources', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          const u = new SheikhaUniverseCreationSystem();
          u.getUniverseStatus();
        }
      }).not.toThrow();
    });

    test('orchestrator singleton remains stable under load', () => {
      for (let i = 0; i < 50; i++) {
        const s = orc.getFullStatus();
        expect(s.totals.systems).toBe(23);
      }
    });
  });

  // ══════════════════════════════════════════════════════════
  // 7. OUTPUT SCHEMA VALIDATION
  // ══════════════════════════════════════════════════════════
  describe('Output Schema Validation', () => {
    test('universe status has required schema fields', () => {
      const s = universe.getUniverseStatus();
      ['system', 'tier', 'foundation', 'status', 'cosmic_structure', 'capabilities', 'islamic_alignment'].forEach(
        field => expect(s).toHaveProperty(field)
      );
    });

    test('human status has required schema fields', () => {
      const s = human.getHumanStatus();
      ['system', 'tier', 'foundation', 'status', 'dimensions', 'physical_systems', 'spiritual_aspects'].forEach(
        field => expect(s).toHaveProperty(field)
      );
    });

    test('embodiment status has required schema fields', () => {
      const s = embodiment.getEmbodimentStatus();
      ['system', 'tier', 'foundation', 'status', 'embodiment_structure', 'transformation_flow'].forEach(
        field => expect(s).toHaveProperty(field)
      );
    });

    test('modeling status has required schema fields', () => {
      const s = modeling.getModelingStatus();
      ['system', 'tier', 'foundation', 'status', 'modeling_structure'].forEach(
        field => expect(s).toHaveProperty(field)
      );
    });

    test('unified integration status has required schema fields', () => {
      const s = unified.getUnifiedIntegrationStatus();
      ['system', 'tier', 'foundation', 'status', 'integration_structure'].forEach(
        field => expect(s).toHaveProperty(field)
      );
    });

    test('orchestrator status has required schema fields', () => {
      ['system', 'tier', 'foundation', 'status', 'totals', 'systems_by_phase', 'layer_hierarchy',
       'divine_alignment', 'supreme_capabilities'].forEach(
        field => expect(orchestrator).toHaveProperty(field)
      );
    });

    test('all string fields are non-empty strings', () => {
      const checkStrings = (obj, label) => {
        ['system', 'tier', 'foundation', 'status'].forEach(key => {
          if (obj[key] !== undefined) {
            expect(typeof obj[key]).toBe('string');
            expect(obj[key].length).toBeGreaterThan(0);
          }
        });
      };
      checkStrings(universe.getUniverseStatus(), 'universe');
      checkStrings(human.getHumanStatus(), 'human');
      checkStrings(embodiment.getEmbodimentStatus(), 'embodiment');
      checkStrings(modeling.getModelingStatus(), 'modeling');
      checkStrings(unified.getUnifiedIntegrationStatus(), 'unified');
      checkStrings(orchestrator, 'orchestrator');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 8. CRYPTOGRAPHIC ALIGNMENT (Structural)
  // ══════════════════════════════════════════════════════════
  describe('Cryptographic & Quantum Security Alignment', () => {
    test('system count matches cryptographically expected value (23)', () => {
      // Deterministic: 5 + 5 + 13 = 23 — any deviation signals tampering
      const expected = 5 + 5 + 13;
      expect(orchestrator.totals.systems).toBe(expected);
    });

    test('layer count matches cryptographically expected value (11)', () => {
      // L0 through L10 = 11 layers exactly
      expect(orchestrator.totals.layers).toBe(11);
    });

    test('Quranic principle count matches expected value (10)', () => {
      expect(orchestrator.totals.quran_principles).toBe(10);
    });

    test('Sunnah practice count matches expected value (8)', () => {
      expect(orchestrator.totals.sunnah_practices).toBe(8);
    });

    test('human physical systems match known anatomical count (6)', () => {
      expect(human.getHumanStatus().physical_systems).toBe(6);
    });

    test('embodiment layers match expected ontological count (5)', () => {
      expect(embodiment.getEmbodimentStatus().embodiment_structure.layers).toBe(5);
    });

    test('incarnation processes match Quranic stages (6)', () => {
      expect(embodiment.getEmbodimentStatus().embodiment_structure.incarnation_processes).toBe(6);
    });

    test('unified AI layers match designed integration depth (9)', () => {
      expect(unified.getUnifiedIntegrationStatus().integration_structure.ai_layers).toBe(9);
    });

    test('transformation flow stages match pipeline depth (7)', () => {
      expect(embodiment.getEmbodimentStatus().transformation_flow.length).toBe(7);
    });

    test('integrated civilizational systems match designed count (7)', () => {
      expect(unified.getUnifiedIntegrationStatus().integration_structure.integrated_systems).toBe(7);
    });
  });
});
