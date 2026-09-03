'use strict';

const integrationGraph = Object.freeze({
  "decisionEvidencePlaceholderAllowed": false,
  "documentedPolicyMappingReviewRequired": true,
  "edges": [
    [
      "SHEIKHA_TRUST_FOUNDATION",
      "SHEIKHA_TPM_HARDWARE_TRUST"
    ],
    [
      "SHEIKHA_FOUNDATION_FIRMWARE",
      "SHEIKHA_BOOT_FOUNDATION"
    ],
    [
      "SHEIKHA_BOOT_FOUNDATION",
      "SHEIKHA_BARE_METAL"
    ],
    [
      "SHEIKHA_BARE_METAL",
      "SHEIKHA_OPERATING_SYSTEM"
    ],
    [
      "SHEIKHA_OPERATING_SYSTEM",
      "SHEIKHA_RUNTIME_APEX"
    ],
    [
      "SHEIKHA_RUNTIME_APEX",
      "SHEIKHA_ENTERPRISE_CONTROL_PLANE"
    ],
    [
      "SOOQ_SHEIKHA_COMMERCE",
      "SHEIKHA_METAL_MATERIALS"
    ],
    [
      "SOOQ_SHEIKHA_COMMERCE",
      "SHEIKHA_RESOURCE_RARITY_GOVERNANCE"
    ],
    [
      "SHEIKHA_FARMS",
      "SHEIKHA_RIVERS_WATER"
    ],
    [
      "SHEIKHA_PASTURES",
      "SHEIKHA_RIVERS_WATER"
    ],
    [
      "SHEIKHA_JANNAT_GARDENS",
      "SHEIKHA_MEADOWS"
    ],
    [
      "SHEIKHA_OBSERVABILITY",
      "SHEIKHA_ENTERPRISE_CONTROL_PLANE"
    ],
    [
      "quran-sunnah-source-catalog-v1",
      "sharia-source-validator-v1"
    ],
    [
      "sharia-source-validator-v1",
      "quran-sunnah-governance-v1"
    ],
    [
      "quran-sunnah-governance-v1",
      "living-governance-kernel-v1"
    ],
    [
      "asset-ownership-rights-v1",
      "living-governance-kernel-v1"
    ],
    [
      "law-regulation-standards-registry-v1",
      "living-governance-kernel-v1"
    ],
    [
      "policy-decision-point-v1",
      "living-governance-kernel-v1"
    ],
    [
      "authorization-engine-v1",
      "living-governance-kernel-v1"
    ],
    [
      "governance-event-fabric-v1",
      "living-governance-kernel-v1"
    ],
    [
      "evidence-observability-v1",
      "living-governance-kernel-v1"
    ],
    [
      "living-governance-kernel-v1",
      "policy-enforcement-point-v1"
    ],
    [
      "sharia-policy-mapping-review-v1",
      "sharia-source-validator-v1"
    ],
    [
      "sharia-policy-mapping-review-v1",
      "living-governance-kernel-v1"
    ]
  ],
  "hardCouplingAllowed": false,
  "semanticKernelIntegrationRequired": true,
  "versionedContractsRequired": true
});

module.exports = { integrationGraph };
