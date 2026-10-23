'use strict';

const providers = require('../runtime/provider-registry/v1/registries/providers.json');
const proposal = require(
  '../runtime/sheikha-ai-governor/v1/llm-training/sheikha-gpu-provider-proposal-v1.json'
);

describe('Sheikha GPU provider proposal V1', () => {
  test('shortlists only providers present in the governed registry', () => {
    const registeredIds = new Set(providers.providers.map((provider) => provider.id));
    expect(proposal.eligibleRegisteredProviderIds.length).toBeGreaterThan(0);
    expect(proposal.eligibleRegisteredProviderIds.every((id) => registeredIds.has(id))).toBe(true);
  });

  test('does not convert registered candidates into active or signed providers', () => {
    const shortlisted = providers.providers.filter((provider) =>
      proposal.eligibleRegisteredProviderIds.includes(provider.id)
    );
    expect(shortlisted.filter((provider) => provider.id !== 'PROV-LOCAL').every(
      (provider) => provider.contractStatus === 'NOT_SIGNED' && provider.usageStatus === 'NOT_ACTIVE'
    )).toBe(true);
    expect(proposal.providerContactExecuted).toBe(false);
    expect(proposal.contractSigned).toBe(false);
    expect(proposal.resourceProvisioned).toBe(false);
  });

  test('grants no authority or access in the non-binding stage', () => {
    const controls = proposal.nonBindingControls;
    expect(controls.delegatesAuthority).toBe(false);
    expect(controls.grantsDataAccess).toBe(false);
    expect(controls.grantsSystemAccess).toBe(false);
    expect(controls.grantsIntellectualPropertyLicense).toBe(false);
    expect(controls.authorizesSpend).toBe(false);
    expect(controls.authorizesTraining).toBe(false);
  });
});
