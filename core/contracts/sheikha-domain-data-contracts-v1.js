'use strict';

const domainDashboardDefaults = Object.freeze({
  salvageYards: [],
  historicalEras: [],
  leadershipPrinciples: [],
  preciousMetals: [],
  commercialActivities: [],
  officialDocTemplates: [],
  archiveCategories: [],
  govPlatforms: [],
  metalCategories: [],
  saudiPlatforms: [],
  AI: {},
  metalsTracked: [],
  propheticMeasures: [],
  quranicLogicPrinciples: [],
  cosmicMeasures: [],
  fusionDomains: [],
  divineBlessing: {},
  learningDomains: [],
  walaaFoundations: [],
  historicalNetworks: []
});

function withDomainDashboardDefaults(dashboard = {}) {
  return {
    ...domainDashboardDefaults,
    ...(dashboard || {})
  };
}

module.exports = {
  domainDashboardDefaults,
  withDomainDashboardDefaults
};
