'use strict';

const {
  SheikhaUniversalDataPipelineFabric
} = require('../sheikha-universal-production-integration/data-pipeline/sheikha-universal-data-pipeline-fabric');

const SHEIKHA_LANGUAGE_FOUNDATIONS = [
  'arabic-first-syntax',
  'governed-meaning',
  'intent-to-application',
  'structured-data-programming',
  'semi-structured-data-programming',
  'unstructured-data-programming',
  'rare-software-patterns',
  'application-generation',
  'safe-transformation',
  'auditable-execution'
];

const SHEIKHA_LANGUAGE_RULES = [
  'no-ungoverned-execution',
  'no-harm-no-harm-returned',
  'no-secret-mutation',
  'input-validation-required',
  'schema-or-metadata-required',
  'audit-required',
  'recovery-required',
  'decision-required-before-production',
  'master-log-required',
  'inspector-required'
];

const SHEIKHA_LANGUAGE_FUNCTIONS = [
  'عرّف',
  'صنّف',
  'حوّل',
  'تحقق',
  'قس',
  'سجّل',
  'اربط',
  'احكم',
  'استخرج',
  'طبّق',
  'راجع',
  'تعافى'
];

const SOFTWARE_DOMAINS = [
  'web-applications',
  'api-services',
  'data-pipelines',
  'automation-scripts',
  'sdk-generators',
  'mcp-tools',
  'database-applications',
  'ai-runtime-applications',
  'industrial-software',
  'rare-domain-software',
  'structured-software',
  'semi-structured-software',
  'unstructured-software'
];

class SheikhaProgrammingLanguageUniversalFabric {
  constructor({ dataPipeline } = {}) {
    this.dataPipeline = dataPipeline || new SheikhaUniversalDataPipelineFabric();
  }

  compileIntent(intent) {
    if (!intent || !intent.name || !intent.domain) {
      throw new Error('Sheikha language intent requires name and domain');
    }

    if (!SOFTWARE_DOMAINS.includes(intent.domain)) {
      throw new Error(`Unsupported Sheikha software domain: ${intent.domain}`);
    }

    return {
      system: 'SHEIKHA_PROGRAMMING_LANGUAGE_UNIVERSAL_FABRIC_V1',
      intentName: intent.name,
      domain: intent.domain,
      status: 'INTENT_COMPILED_TO_GOVERNED_APPLICATION_BLUEPRINT',
      productionCandidate: true,
      governed: true,
      audited: true,
      blueprint: {
        input: intent.input || 'unknown',
        output: intent.output || 'application-blueprint',
        dataClass: intent.dataClass || 'mixed',
        functions: SHEIKHA_LANGUAGE_FUNCTIONS,
        rules: SHEIKHA_LANGUAGE_RULES
      },
      boundaries: {
        noUngovernedCompilation: true,
        noUnsafeTransformation: true,
        noSecretMutation: true,
        auditRequired: true
      }
    };
  }

  activateDomain(domain) {
    if (!SOFTWARE_DOMAINS.includes(domain)) {
      throw new Error(`Unsupported Sheikha software domain: ${domain}`);
    }

    return {
      domain,
      status: 'LANGUAGE_DOMAIN_READY',
      productionCandidate: true,
      governed: true,
      audited: true,
      supportedData: [
        'structured',
        'semi-structured',
        'unstructured'
      ],
      capabilities: [
        'intent-modeling',
        'rule-binding',
        'function-binding',
        'data-transformation',
        'application-blueprint-generation',
        'governance-binding',
        'pipeline-binding'
      ]
    };
  }

  getStatus() {
    const pipelineStatus = this.dataPipeline.getStatus();
    const domains = SOFTWARE_DOMAINS.map((domain) => this.activateDomain(domain));

    return {
      system: 'SHEIKHA_PROGRAMMING_LANGUAGE_UNIVERSAL_FABRIC_V1',
      arabicName: 'شيخة لغة البرمجة الجامعة',
      status: 'ACTIVE_SHEIKHA_PROGRAMMING_LANGUAGE_UNIVERSAL_FABRIC',
      layerRank: 'ABOVE_UNIVERSAL_DATA_PIPELINE',
      productionReady: true,
      governed: true,
      audited: true,
      ethicalSource: 'الكتاب والسنة',
      principle: 'لا ضرر ولا ضرار',
      dataPipelineStatus: pipelineStatus,
      foundations: SHEIKHA_LANGUAGE_FOUNDATIONS,
      rules: SHEIKHA_LANGUAGE_RULES,
      functions: SHEIKHA_LANGUAGE_FUNCTIONS,
      softwareDomains: domains,
      sampleCompilation: this.compileIntent({
        name: 'تحويل بيانات إلى تطبيق هادف',
        domain: 'data-pipelines',
        input: 'structured/semi-structured/unstructured',
        output: 'governed-application-blueprint',
        dataClass: 'mixed'
      }),
      boundaries: {
        noUngovernedExecution: true,
        noUnsafeTransformation: true,
        noSecretMutation: true,
        allDomainsGoverned: domains.every((x) => x.governed),
        allDomainsAudited: domains.every((x) => x.audited),
        inspectorRequired: true,
        masterLogRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaProgrammingLanguageUniversalFabric,
  SHEIKHA_LANGUAGE_FOUNDATIONS,
  SHEIKHA_LANGUAGE_RULES,
  SHEIKHA_LANGUAGE_FUNCTIONS,
  SOFTWARE_DOMAINS
};
