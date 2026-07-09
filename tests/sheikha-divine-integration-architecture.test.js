'use strict';

const {
  SheikhaDivineIntegrationArchitecture,
  FOUNDATION
} = require('../runtime/prophetic-vision/v1/sheikha-divine-integration-architecture.js');

describe('Sheikha Divine Integration Architecture', () => {
  let architecture;

  beforeEach(() => {
    architecture = new SheikhaDivineIntegrationArchitecture();
  });

  describe('Foundation Integrity', () => {
    test('uses immutable Quran-Sunnah foundation', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.foundation).toBe(FOUNDATION);
      expect(status.tier).toBe('OMEGA_SUPREME_INFINITE');
    });

    test('system identity is stable', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.system).toBe('SHEIKHA_DIVINE_INTEGRATION_ARCHITECTURE');
      expect(status.status).toContain('ACTIVE');
    });
  });

  describe('Root Layers Completeness', () => {
    test('contains all six requested lines as roots', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.roots).toBe(6);
      expect(status.root_lines).toContain('الله');
      expect(status.root_lines).toContain('الرسول محمد صلى الله عليه وسلم');
      expect(status.root_lines).toContain('الدين الاسلامي');
      expect(status.root_lines).toContain('كتاب الله القرآن');
      expect(status.root_lines).toContain('سنة الرسول محمد صلى الله عليه وسلم');
      expect(status.root_lines).toContain('أمة محمد صلى الله عليه وسلم خاتم الأنبياء والمرسلين');
    });

    test('each root includes references and function', () => {
      architecture.root_layers.forEach(root => {
        expect(root.references).toBeDefined();
        expect(root.references.length).toBeGreaterThan(0);
        expect(root.function).toBeDefined();
        expect(root.function.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Core Systems', () => {
    test('registers four core systems', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.cores).toBe(4);
    });

    test('aqidah core includes tawheed outputs', () => {
      const aqidah = architecture.core_systems.get('AQIDAH_CORE');
      expect(aqidah).toBeDefined();
      expect(aqidah.outputs).toContain('توحيد');
    });

    test('ibadah core includes prayer and zakat', () => {
      const ibadah = architecture.core_systems.get('IBADAH_CORE');
      expect(ibadah.outputs).toContain('صلاة');
      expect(ibadah.outputs).toContain('زكاة');
    });
  });

  describe('Governing Layer and Branches', () => {
    test('registers explicit governing layer', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.governing_layers).toBe(1);
      expect(status.governing_layer_name).toBe('الطبقة الحاكمة');
    });

    test('governing layer is highest authority and cannot be overridden by tools', () => {
      const layer = architecture.governing_layer.get('HAKIMA_LAYER');
      expect(layer).toBeDefined();
      expect(layer.authority).toBe('HIGHEST');
      expect(layer.no_tool_can_override_governance).toBe(true);
      expect(layer.governance_before_execution).toBe(true);
    });

    test('registers five architectural branches under governing layer', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.branches).toBe(5);
      architecture.architectural_branches.forEach(branch => {
        expect(branch.parent).toBe('HAKIMA_LAYER');
      });
    });

    test('registers sheikha supreme layer above all layers and architectures', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.sheikha_supreme_layers).toBe(1);
      expect(status.sheikha_supreme_layer_name).toBe('طبقة شيخة الحاكمة العليا');
      expect(status.supreme_layer_authority_enforced).toBe(true);
    });
  });

  describe('Integration Bridges', () => {
    test('registers four integration bridges', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.bridges).toBe(4);
    });

    test('wahy bridge connects Quran to Ummah mission', () => {
      const bridge = architecture.integration_bridges.get('WAHY_TO_ACTION');
      expect(bridge.from).toBe('QURAN_BOOK');
      expect(bridge.to).toBe('UMMAH_MISSION');
    });
  });

  describe('Goodness Activation', () => {
    test('registers four goodness engines', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.engines).toBe(4);
    });

    test('charity engine includes zakat and waqf', () => {
      const engine = architecture.goodness_engines.get('CHARITY_ENGINE');
      expect(engine.activation).toContain('زكاة');
      expect(engine.activation).toContain('وقف');
    });
  });

  describe('Ummah Outcomes', () => {
    test('registers five outcomes for community benefit', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.outcomes).toBe(5);
    });

    test('global goodness outcome exists', () => {
      const outcome = architecture.ummah_outcomes.get('GLOBAL_GOODNESS');
      expect(outcome).toBeDefined();
      expect(outcome.domain).toBe('حضاري');
    });
  });

  describe('Status Contract', () => {
    test('status response is complete and deterministic', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.roots).toBe(6);
      expect(status.governing_layers).toBe(1);
      expect(status.sheikha_supreme_layers).toBe(1);
      expect(status.branches).toBe(5);
      expect(status.cores).toBe(4);
      expect(status.bridges).toBe(4);
      expect(status.engines).toBe(4);
      expect(status.development_layers).toBe(5);
      expect(status.architecture_families).toBe(5);
      expect(status.shared_layers).toBe(3);
      expect(status.os_classifications).toBe(5);
      expect(status.scientific_methodologies).toBe(4);
      expect(status.cross_arch_contracts).toBe(25);
      expect(status.confidentiality_mesh_controls).toBe(3);
      expect(status.active_licenses).toBeGreaterThanOrEqual(1);
      expect(status.active_accreditations).toBeGreaterThanOrEqual(1);
      expect(status.saudi_accreditation_authorities).toBe(4);
      expect(status.international_accreditation_authorities).toBe(4);
      expect(status.global_accreditation_authorities).toBe(3);
      expect(status.official_records).toBeGreaterThanOrEqual(1);
      expect(status.external_submission_channels).toBe(3);
      expect(status.documentation_items).toBe(3);
      expect(status.vscode_lts_profiles).toBe(2);
      expect(status.layer_runtime_contracts).toBe(11);
      expect(status.conflict_prevention_rules).toBe(4);
      expect(status.all_layers_conflict_safe).toBe(true);
      expect(status.supreme_layer_authority_enforced).toBe(true);
      expect(status.quran_sunnah_governance_enforced).toBe(true);
      expect(status.development_stack_complete).toBe(true);
      expect(status.cross_arch_governance_safe).toBe(true);
      expect(status.os_coverage_complete).toBe(true);
      expect(status.goodness_integration_effective).toBe(true);
      expect(status.scientific_methodologies_active).toBe(true);
      expect(status.licensing_and_accreditation_ready).toBe(true);
      expect(status.global_authorities_coverage_active).toBe(true);
      expect(status.documentation_ready).toBe(true);
      expect(status.official_status_active).toBe(true);
      expect(status.external_submission_ready).toBe(true);
      expect(status.end_to_end_official_completion).toBe(true);
      expect(status.full_integration_activated).toBe(true);
      expect(status.outcomes).toBe(5);
      expect(status.timestamp).toBeDefined();
    });
  });

  describe('Operational Tools: Extension, Chat, Inspector', () => {
    test('registers extension/chat/inspector as tools (not governing layer)', () => {
      const status = architecture.getArchitectureStatus();
      expect(status.operational_tools).toBe(3);
      expect(status.active_operational_tools).toBe(3);
      expect(status.governance_boundary_enforced).toBe(true);
    });

    test('all tools are subordinate to governing layer', () => {
      const toolsStatus = architecture.getOperationalToolsStatus();
      toolsStatus.tools.forEach(tool => {
        expect(tool.governed_by).toBe('HAKIMA_LAYER');
        expect(tool.authority_level).toBe('SUBORDINATE');
        expect(tool.role).toBe('TOOL_NOT_GOVERNOR');
        expect(tool.execution_mode).toBe('TOOL_ONLY');
      });
    });

    test('extension tool is active and governed', () => {
      const tool = architecture.getOperationalToolsStatus().tools.find(t => t.id === 'EXTENSION_TOOL');
      expect(tool.state).toBe('ACTIVE');
      expect(tool.governed_by).toBe('HAKIMA_LAYER');
    });

    test('chat tool is active and governed', () => {
      const tool = architecture.getOperationalToolsStatus().tools.find(t => t.id === 'CHAT_TOOL');
      expect(tool.state).toBe('ACTIVE');
      expect(tool.governed_by).toBe('HAKIMA_LAYER');
    });

    test('inspector tool is active and governed', () => {
      const tool = architecture.getOperationalToolsStatus().tools.find(t => t.id === 'INSPECTOR_TOOL');
      expect(tool.state).toBe('ACTIVE');
      expect(tool.governed_by).toBe('HAKIMA_LAYER');
    });

    test('unsupported tool activation is blocked', () => {
      expect(() => architecture.activateOperationalTool('UNKNOWN_TOOL'))
        .toThrow('Unsupported operational tool');
    });

    test('extension/chat/inspector execution is allowed under no-harm policy', () => {
      const e = architecture.evaluateToolExecution('EXTENSION_TOOL', 'L10');
      const c = architecture.evaluateToolExecution('CHAT_TOOL', 'L9');
      const i = architecture.evaluateToolExecution('INSPECTOR_TOOL', 'L8');

      expect(e.allowed).toBe(true);
      expect(c.allowed).toBe(true);
      expect(i.allowed).toBe(true);
      expect(e.policy).toBe('NO_HARM_NO_CONFLICT');
    });

    test('unsupported layer contract is blocked', () => {
      expect(() => architecture.evaluateToolExecution('CHAT_TOOL', 'L99'))
        .toThrow('Unsupported layer runtime contract');
    });
  });

  describe('VS Code LTS Compatibility', () => {
    test('registers strict VS Code LTS runtime profile', () => {
      const profile = architecture.vscode_lts_profile.get('VSCODE_EXTENSION_RUNTIME');
      expect(profile).toBeDefined();
      expect(profile.runtime).toBe('NODE_JS_LTS');
      expect(profile.compatibility_mode).toBe('STRICT_LTS_ONLY');
    });

    test('tooling boundary confirms extension/chat/inspector are not governors', () => {
      const boundary = architecture.vscode_lts_profile.get('TOOLING_BOUNDARY');
      expect(boundary.extension).toBe('TOOL_ONLY');
      expect(boundary.chat).toBe('TOOL_ONLY');
      expect(boundary.inspector).toBe('TOOL_ONLY');
      expect(boundary.governing_layer_override_allowed).toBe(false);
    });

    test('all 11 layers enforce no-conflict and no-harm contracts', () => {
      expect(architecture.layer_runtime_contracts.size).toBe(11);
      architecture.layer_runtime_contracts.forEach(contract => {
        expect(contract.no_conflict_required).toBe(true);
        expect(contract.no_harm_required).toBe(true);
        expect(contract.governance_gate).toBe('HAKIMA_LAYER');
      });
    });
  });

  describe('Cross-Architecture Development Governance', () => {
    test('development stack has five complete layers', () => {
      expect(architecture.development_layers.size).toBe(5);
      expect(architecture.verifyDevelopmentLayerCompleteness()).toBe(true);
    });

    test('system architecture families are fully registered', () => {
      expect(architecture.system_architecture_families.size).toBe(5);
      expect(architecture.system_architecture_families.has('ARCH_WINDOWS_NT')).toBe(true);
      expect(architecture.system_architecture_families.has('ARCH_DARWIN_UNIX')).toBe(true);
      expect(architecture.system_architecture_families.has('ARCH_LINUX_FAMILY')).toBe(true);
      expect(architecture.system_architecture_families.has('ARCH_RTOS_EMBEDDED')).toBe(true);
      expect(architecture.system_architecture_families.has('ARCH_HYPERVISOR_SUPERCOMPUTE')).toBe(true);
    });

    test('cross-architecture contracts are active and governed safely', () => {
      expect(architecture.cross_arch_integration_contracts.size).toBe(25);
      expect(architecture.verifyCrossArchitectureGovernance()).toBe(true);
    });

    test('confidentiality mesh controls are strict and governed by sheikha supreme layer', () => {
      expect(architecture.confidentiality_mesh.size).toBe(3);
      architecture.confidentiality_mesh.forEach(control => {
        expect(control.requirement).toBe('STRICT');
        expect(control.governed_by).toBe('SHEIKHA_OVERLAY_GOVERNOR');
      });
    });

    test('integration evaluation allows safe execution across development and architecture layers', () => {
      const result = architecture.evaluateArchitectureIntegration('DEV_LAYER_APIS', 'ARCH_LINUX_FAMILY');
      expect(result.allowed).toBe(true);
      expect(result.policy).toBe('NO_HARM_NO_CONFLICT');
      expect(result.confidentiality_required).toBe(true);
      expect(result.governed_by).toBe('SHEIKHA_OVERLAY_GOVERNOR');
    });

    test('unsupported development layer is blocked in integration evaluation', () => {
      expect(() => architecture.evaluateArchitectureIntegration('DEV_LAYER_UNKNOWN', 'ARCH_LINUX_FAMILY'))
        .toThrow('Unsupported development layer');
    });

    test('unsupported architecture family is blocked in integration evaluation', () => {
      expect(() => architecture.evaluateArchitectureIntegration('DEV_LAYER_APIS', 'ARCH_UNKNOWN'))
        .toThrow('Unsupported architecture family');
    });

    test('shared layers and OS classifications are fully covered', () => {
      expect(architecture.shared_layer_models.size).toBe(3);
      expect(architecture.os_classification_registry.size).toBe(5);
      expect(architecture.verifyOSCoverageCompleteness()).toBe(true);
      expect(architecture.os_classification_registry.has('OS_CLASS_DESKTOP')).toBe(true);
      expect(architecture.os_classification_registry.has('OS_CLASS_MOBILE')).toBe(true);
      expect(architecture.os_classification_registry.has('OS_CLASS_SERVER_CLOUD')).toBe(true);
      expect(architecture.os_classification_registry.has('OS_CLASS_EMBEDDED_IOT')).toBe(true);
      expect(architecture.os_classification_registry.has('OS_CLASS_SUPERCOMPUTE')).toBe(true);
    });

    test('full integration stack activates with quran-sunnah governance', () => {
      const activation = architecture.activateFullIntegrationStack();
      expect(activation.supreme_layer_active).toBe(true);
      expect(activation.quran_sunnah_governance_active).toBe(true);
      expect(activation.development_stack_active).toBe(true);
      expect(activation.cross_arch_integration_active).toBe(true);
      expect(activation.os_coverage_active).toBe(true);
      expect(activation.goodness_integration_active).toBe(true);
      expect(activation.scientific_methodologies_active).toBe(true);
      expect(activation.licensing_and_accreditation_ready).toBe(true);
      expect(activation.global_authorities_coverage_active).toBe(true);
      expect(activation.documentation_ready).toBe(true);
      expect(activation.official_status_active).toBe(true);
      expect(activation.external_submission_ready).toBe(true);
      expect(activation.end_to_end_official_completion).toBe(true);
      expect(activation.no_harm_no_conflict_active).toBe(true);
      expect(activation.integration_state).toBe('FULLY_ACTIVE');
    });

    test('goodness integration is effective across engines and outcomes', () => {
      expect(architecture.verifyGoodnessEffectiveIntegration()).toBe(true);
    });

    test('scientific methodologies are active and integrated', () => {
      expect(architecture.verifyScientificMethodologiesActive()).toBe(true);
    });

    test('can issue additional system license and accreditation', () => {
      const license = architecture.issueSystemLicense('SHEIKHA_UNIFIED_RUNTIME', 'UNIFIED_RUNTIME_SCOPE');
      const accreditation = architecture.issueSystemAccreditation('SHEIKHA_UNIFIED_RUNTIME', 'INTEGRATION_EXCELLENCE_STANDARD');

      expect(license.status).toBe('ACTIVE');
      expect(accreditation.status).toBe('CERTIFIED');
      expect(architecture.verifyLicensingAndAccreditationReadiness()).toBe(true);
    });

    test('all saudi and global authorities are covered by active licenses and accreditations', () => {
      expect(architecture.saudi_accreditation_authorities.size).toBe(4);
      expect(architecture.international_accreditation_authorities.size).toBe(4);
      expect(architecture.global_accreditation_authorities.size).toBe(3);
      expect(architecture.verifyGlobalAuthoritiesCoverage()).toBe(true);
    });

    test('global authority activation is idempotent', () => {
      const beforeLicenses = architecture.license_registry.size;
      const beforeAccreditations = architecture.accreditation_registry.size;

      const activation = architecture.activateLicensingAcrossAllAuthorities();

      expect(activation.activated_authorities).toBe(11);
      expect(activation.status).toBe('GLOBAL_AUTHORITIES_ACTIVATED');
      expect(architecture.license_registry.size).toBe(beforeLicenses);
      expect(architecture.accreditation_registry.size).toBe(beforeAccreditations);
      expect(architecture.verifyGlobalAuthoritiesCoverage()).toBe(true);
    });

    test('accreditation dossier is generated with documented artifacts', () => {
      const dossier = architecture.generateAccreditationDossier();
      expect(dossier.licenses.length).toBeGreaterThanOrEqual(1);
      expect(dossier.accreditations.length).toBeGreaterThanOrEqual(1);
      expect(dossier.documentation.length).toBeGreaterThanOrEqual(3);
      expect(dossier.generated_at).toBeDefined();
      expect(architecture.verifyDocumentationReadiness()).toBe(true);
    });

    test('official ratification is active and ready', () => {
      expect(architecture.verifyOfficialStatusReadiness()).toBe(true);
      expect(architecture.officialization_registry.size).toBeGreaterThanOrEqual(1);
    });

    test('can issue additional official decree and generate official certificate', () => {
      const decree = architecture.activateOfficialStatus('SHEIKHA_OVERLAY_GOVERNOR', 'SHEIKHA-DECREE-002');
      const certificate = architecture.generateOfficialCertificate();

      expect(decree.status).toBe('RATIFIED');
      expect(certificate.certificate_title).toContain('Official');
      expect(certificate.global_coverage_active).toBe(true);
      expect(certificate.official_records.length).toBeGreaterThanOrEqual(2);
      expect(certificate.issued_at).toBeDefined();
    });

    test('external submission channels are ready and end-to-end completion is active', () => {
      expect(architecture.verifyExternalSubmissionReadiness()).toBe(true);
      expect(architecture.verifyEndToEndOfficialCompletion()).toBe(true);
      expect(architecture.external_submission_channels.size).toBe(3);
    });

    test('final officialization dossier is complete', () => {
      const dossier = architecture.generateFinalOfficializationDossier();
      expect(dossier.decree_records.length).toBeGreaterThanOrEqual(1);
      expect(dossier.authorities.saudi.length).toBe(4);
      expect(dossier.authorities.international.length).toBe(4);
      expect(dossier.authorities.global.length).toBe(3);
      expect(dossier.active_records.licenses).toBeGreaterThanOrEqual(12);
      expect(dossier.active_records.accreditations).toBeGreaterThanOrEqual(12);
      expect(dossier.submission_channels.length).toBe(3);
      expect(dossier.end_to_end_official_completion).toBe(true);
      expect(dossier.generated_at).toBeDefined();
    });
  });
});
