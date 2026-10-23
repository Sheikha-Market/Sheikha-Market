'use strict';

const PRODUCTS = Object.freeze([
  {
    id: 'SHEIKHA_GARDENS_FARMS_PASTURES',
    ar: 'جنات ومزارع ومراعي شيخة',
    domain: 'agriculture-resource-engineering',
    state: 'REGISTERED_GOVERNED',
    boundary: 'WORLDLY_ENGINEERING_ONLY_NO_AFTERLIFE_SIMULATION'
  },
  {
    id: 'SHEIKHA_ARABIC_PROGRAMMING_LANGUAGE',
    ar: 'لغة شيخة البرمجية العربية',
    domain: 'programming-language',
    state: 'INTEGRATED'
  },
  {
    id: 'SHEIKHA_LMM',
    ar: 'Sheikha LMM',
    domain: 'model-orchestration-local-and-provider-models',
    state: 'INTEGRATED_NOT_CLAIMED_AS_NEW_FOUNDATION_MODEL_FROM_SCRATCH'
  },
  {
    id: 'SHEIKHA_EWAR_DEFENSIVE_RESILIENCE',
    ar: 'Sheikha ewar الدفاعية',
    domain: 'defensive-resilience-awareness',
    state: 'DEFENSE_ONLY',
    forbidden: ['targeting', 'jamming', 'offensive_intrusion', 'weaponization']
  },
  { id: 'SHEIKHA_BARE_METAL', ar: 'Sheikha Bare Metal', domain: 'bare-metal', state: 'INTEGRATED' },
  { id: 'SHEIKHA_CLOUD', ar: 'Sheikha Cloud', domain: 'cloud', state: 'INTEGRATED' },
  { id: 'SHEIKHA_SAAS', ar: 'Sheikha SaaS', domain: 'saas', state: 'INTEGRATED' },
  { id: 'SHEIKHA_SYSTEM_BUILDER', ar: 'منشئ أنظمة شيخة', domain: 'system-builder', state: 'INTEGRATED' },
  { id: 'SOOQ_SHEIKHA', ar: 'سوق شيخة', domain: 'industry-commerce-supply-chain', state: 'INTEGRATED' },
  { id: 'SHEIKHA_FIRMWARE', ar: 'Sheikha Firmware', domain: 'firmware-governance', state: 'READ_ONLY_ACTIVE_WRITES_LOCKED' },
  { id: 'SHEIKHA_TPM', ar: 'Sheikha TPM', domain: 'hardware-root-of-trust', state: 'INTEGRATED_REPAIR_PENDING' }
]);

const MODELS = Object.freeze([
  'Sheikha-Arabic-Governed:4b',
  'qwen3:4b',
  'qwen2.5-coder:7b',
  'deepseek-r1:8b',
  'Sheikha-Core:latest',
  'Sheikha-Core-Clean:latest',
  'llama3.1:8b',
  'tinyllama:latest'
]);

module.exports = { PRODUCTS, MODELS };
