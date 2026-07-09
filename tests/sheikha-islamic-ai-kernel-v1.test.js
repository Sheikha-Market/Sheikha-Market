'use strict';

const { buildIslamicAIKernel } = require('../core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1');

describe('Sheikha Islamic AI Kernel V1', () => {
  test('activates governed AI kernel', () => {
    const kernel = buildIslamicAIKernel();
    expect(kernel.status).toBe('ACTIVE');
    expect(kernel.mode).toBe('GOVERNED_AI_KERNEL');
  });

  test('keeps AI under governance and review', () => {
    const kernel = buildIslamicAIKernel();
    expect(kernel.governance.noHarm).toBe(true);
    expect(kernel.governance.evidenceRequired).toBe(true);
    expect(kernel.governance.humanReviewForHighImpact).toBe(true);
    expect(kernel.governance.scholarsReviewForReligiousRulings).toBe(true);
  });

  test('blocks invalid AI religious claims', () => {
    const kernel = buildIslamicAIKernel();
    expect(kernel.aiRuntime.restrictions).toContain('no_revelation_claim');
    expect(kernel.aiRuntime.restrictions).toContain('no_infallibility_claim');
    expect(kernel.aiRuntime.restrictions).toContain('no_independent_fatwa');
  });

  test('integrates with language os cloud hpc and truth gate', () => {
    const kernel = buildIslamicAIKernel();
    expect(kernel.integration.sheikhaLanguage).toBe(true);
    expect(kernel.integration.os).toBe(true);
    expect(kernel.integration.cloud).toBe(true);
    expect(kernel.integration.hpc).toBe(true);
    expect(kernel.integration.truthGate).toBe(true);
  });
});
