'use strict';

const {
  SheikhaBusinessOperationsProtectionCore
} = require('../business-operations-protection/sheikha-business-operations-protection-core');

const PROJECT_CORE_CAPABILITIES = [
  'project-identity',
  'project-purpose',
  'project-owner-context',
  'project-goals',
  'project-scope',
  'project-lifecycle',
  'project-resources',
  'project-capabilities',
  'project-risks',
  'project-measurements',
  'project-evidence',
  'project-improvement'
];

const PROJECT_TYPES = [
  'general-project',
  'personal-project',
  'business-project',
  'development-project',
  'software-project',
  'marketplace-project',
  'industrial-project',
  'construction-project',
  'research-project',
  'operations-project'
];

const PROJECT_LIFECYCLE = [
  'idea',
  'purpose-definition',
  'requirements',
  'architecture',
  'planning',
  'implementation',
  'verification',
  'operation',
  'measurement',
  'improvement',
  'archive'
];

class SheikhaProjectsCore {
  constructor({ businessOperationsProtectionCore } = {}) {
    this.businessOperationsProtectionCore =
      businessOperationsProtectionCore || new SheikhaBusinessOperationsProtectionCore();
  }

  designProject(input = {}) {
    const {
      id,
      name,
      owner = 'general-user',
      projectType = 'general-project',
      goals = [],
      context = {}
    } = input;

    if (!id || !name) {
      throw new Error('Sheikha project core requires id and name');
    }

    if (!PROJECT_TYPES.includes(projectType)) {
      throw new Error(`Unsupported Sheikha project type: ${projectType}`);
    }

    return {
      id,
      name,
      owner,
      projectType,
      status: 'PROJECT_DESIGNED',
      governed: true,
      audited: true,
      goals,
      context,
      capabilities: PROJECT_CORE_CAPABILITIES,
      lifecycle: PROJECT_LIFECYCLE,
      personalized: owner !== 'general-user',
      boundaries: {
        purposeRequired: true,
        noUngovernedProject: true,
        evidenceRequiredForClaims: true,
        measurementRequired: true,
        improvementAllowedAfterMeasurement: true,
        noHarmNoDamage: true,
        registryRequired: true,
        inspectorRequired: true,
        masterLogRequired: true
      }
    };
  }

  designUserProject(input = {}) {
    return this.designProject({
      ...input,
      projectType: input.projectType || 'personal-project',
      owner: input.owner || 'user'
    });
  }

  createProjectPortfolio(projects = []) {
    const designedProjects = projects.map((project) => this.designProject(project));

    return {
      status: 'PROJECTS_PORTFOLIO_READY',
      governed: true,
      audited: true,
      projects: designedProjects,
      count: designedProjects.length,
      boundaries: {
        allProjectsGoverned: designedProjects.every((x) => x.governed),
        allProjectsAudited: designedProjects.every((x) => x.audited),
        allProjectsMeasured: designedProjects.every((x) => x.boundaries.measurementRequired),
        noUngovernedPortfolio: true
      }
    };
  }

  getStatus() {
    const protectionStatus = this.businessOperationsProtectionCore.getStatus();

    const sampleGeneralProject = this.designProject({
      id: 'general-sheikha-project',
      name: 'General Sheikha Project',
      goals: ['organize', 'measure', 'improve']
    });

    const sampleUserProject = this.designUserProject({
      id: 'user-personal-development-project',
      name: 'User Personal Development Project',
      owner: 'specific-user',
      goals: ['personalize', 'execute', 'improve'],
      context: {
        userSpecificDesign: true,
        adaptiveExperience: true
      }
    });

    return {
      system: 'SHEIKHA_PROJECTS_CORE_V1',
      arabicName: 'شيخة نواة المشاريع',
      status: 'ACTIVE_SHEIKHA_PROJECTS_CORE',
      layerRank: 'ABOVE_BUSINESS_OPERATIONS_PROTECTION_CORE',
      productionReady: true,
      governed: true,
      audited: true,
      protectionStatus,
      projectCoreCapabilities: PROJECT_CORE_CAPABILITIES,
      projectTypes: PROJECT_TYPES,
      projectLifecycle: PROJECT_LIFECYCLE,
      sampleGeneralProject,
      sampleUserProject,
      samplePortfolio: this.createProjectPortfolio([
        {
          id: 'portfolio-general',
          name: 'Portfolio General Project',
          projectType: 'general-project'
        },
        {
          id: 'portfolio-business',
          name: 'Portfolio Business Project',
          projectType: 'business-project',
          owner: 'business-user'
        }
      ]),
      boundaries: {
        projectCoreEnabled: true,
        projectsCoreEnabled: true,
        generalProjectDesignEnabled: true,
        userSpecificProjectDesignEnabled: true,
        noUngovernedProjectCreation: true,
        noHarmNoDamage: true,
        evidenceRequired: true,
        measurementRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaProjectsCore,
  PROJECT_CORE_CAPABILITIES,
  PROJECT_TYPES,
  PROJECT_LIFECYCLE
};
