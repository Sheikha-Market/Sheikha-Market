'use strict';

const {compileCultivationFile} = require('../sheikha-language/compiler/cultivation-compiler');
const {evaluate} = require('../bare-metal/build/sheikha-firmware-platform-oem-odm-v1');
const {
  TRUST_CULTIVATION_MAP,
  buildGardensLanguageTrustBridge
} = require('../core/governance/sheikha-gardens-language-platform-trust-bridge-v1');

describe('Sheikha gardens, language, and platform trust bridge V1', () => {
  test('binds the worldly language plan to content-addressed platform evidence', () => {
    const compiledProgram = compileCultivationFile(
      'sheikha-language/examples/worldly-gardens.shk'
    );
    const platformReport = evaluate();
    const bridge = buildGardensLanguageTrustBridge({compiledProgram, platformReport});

    expect(bridge.status).toBe('LANGUAGE_PLAN_READY_TRUST_AND_EXECUTION_GATES_BLOCKED');
    expect(bridge.readiness.languageReady).toBe(true);
    expect(bridge.readiness.trustReady).toBe(false);
    expect(bridge.readiness.releaseReady).toBe(false);
    expect(bridge.bindings.languagePlanSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(bridge.bindings.platformReportSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(bridge.bindings.physicalArtifactSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(bridge.bindings.boardBinding).toContain('Pulse 16 AI C1VFKG');
  });

  test('maps cultivation terms to technical controls without unseen claims', () => {
    expect(TRUST_CULTIVATION_MAP.soil).toContain('PLATFORM_IDENTITY');
    expect(TRUST_CULTIVATION_MAP.fruit).toContain('SIGNED_VERIFIED_RELEASE');
    const bridge = buildGardensLanguageTrustBridge({
      compiledProgram: compileCultivationFile('sheikha-language/examples/worldly-gardens.shk'),
      platformReport: evaluate()
    });
    expect(bridge.actualJannahOrUnseenSimulationClaimed).toBe(false);
    expect(bridge.invariants).toContain('SACRED_UNSEEN_IS_NOT_AN_ENGINEERING_INPUT');
  });

  test('fails closed on missing TPM and execution evidence', () => {
    const bridge = buildGardensLanguageTrustBridge({
      compiledProgram: compileCultivationFile('sheikha-language/examples/worldly-gardens.shk'),
      platformReport: evaluate()
    });
    expect(bridge.blockers).toEqual(expect.arrayContaining([
      'secureBootVerified', 'measuredBootVerified', 'nativeQuoteVerified', 'akPublicAreaAndNameVerified',
      'akEnrollmentVerified', 'firmwareReleaseAllowed', 'engineeringExecutionAuthorized'
    ]));
    expect(bridge.execution).toEqual(expect.objectContaining({
      authorized: false, performed: false, directTpmAccessPerformed: false,
      firmwareMutationPerformed: false, networkUsed: false
    }));
  });

  test('rejects inputs that are not produced by the governed compiler and platform evaluator', () => {
    expect(() => buildGardensLanguageTrustBridge({compiledProgram: {}, platformReport: evaluate()}))
      .toThrow('SHEIKHA_COMPILED_CULTIVATION_PROGRAM_REQUIRED');
    expect(() => buildGardensLanguageTrustBridge({
      compiledProgram: compileCultivationFile('sheikha-language/examples/worldly-gardens.shk'),
      platformReport: {}
    })).toThrow('SHEIKHA_FIRMWARE_PLATFORM_REPORT_REQUIRED');
  });
});
