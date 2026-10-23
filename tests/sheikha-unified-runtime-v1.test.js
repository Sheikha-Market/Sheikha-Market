'use strict';

const {
  buildUnifiedRuntimeStatus,
  buildSourceBoundContinuation,
} = require('../runtime/sheikha-studio/core/sheikha-unified-runtime-v1');

describe('Sheikha unified runtime', () => {
  test('discovers all 28 components and keeps independent production gates', () => {
    const status = buildUnifiedRuntimeStatus();
    expect(status.componentCount).toBe(28);
    expect(status.evidencePresentCount).toBe(28);
    expect(status.release.commercialPilotAllowed).toBe(true);
    expect(status.release.generalAvailabilityAllowed).toBe(false);
    expect(status.defensiveEwarBoundary.offensiveOperationsAllowed).toBe(false);
    expect(status.modelRuntime.model).toBe('Llama-Sheikha-Governed:8b');
    expect(status.modelRuntime.qualityGatePassed).toBe(true);
    expect(status.modelRuntime.commercialProductionApproved).toBe(false);
    expect(status.independentModelProgram.servingModel).toBe('Llama-Sheikha-Governed:8b');
    expect(status.independentModelProgram.governedHybridActive).toBe(true);
    expect(status.independentModelProgram.independentFromScratchAdmitted).toBe(false);
    expect(status.independentModelProgram.betterThanGptOrCopilotClaimed).toBe(false);
    expect(status.foundationBootstrap.servingModel).toBe('Llama-Sheikha-Governed:8b');
    expect(status.foundationBootstrap.capabilityCount).toBe(8);
    expect(status.foundationBootstrap.trainingAdmitted).toBe(false);
    expect(status.foundationBootstrap.onlineProductionWeightMutationAllowed).toBe(false);
  });

  test('replaces the missing download script with a source-bound sequence', () => {
    const result = buildSourceBoundContinuation({
      goal: 'إطلاق تجربة عميل موحدة قابلة للقياس',
      beneficiary: 'عميل تجريبي مدفوع',
      measurableOutcome: 'إكمال المهمة خلال عشر دقائق دون حادث أمني',
      constraints: 'تجربة محلية ومراجعة بشرية قبل النشر',
    });
    expect(result.status).toBe('SOURCE_BOUND_SEQUENCE_READY_FOR_HUMAN_REVIEW');
    expect(result.temporaryDownloadScriptRequired).toBe(false);
    expect(result.previousErrorResolvedByDesign).toBe('EXACT_POSSIBILITY_SCRIPT_NOT_FOUND');
    expect(result.execution.tpmAccessPerformed).toBe(false);
  });
});
