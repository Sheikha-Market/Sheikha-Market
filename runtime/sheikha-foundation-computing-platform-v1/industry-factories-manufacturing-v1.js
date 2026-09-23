    'use strict';

    const industryFabric = Object.freeze({
  "circularEconomyReuseRecycling": true,
  "factoryModel": [
    "INPUTS",
    "PROCESS",
    "MACHINES",
    "PEOPLE",
    "SAFETY",
    "QUALITY",
    "OUTPUTS",
    "WASTE",
    "RECOVERY"
  ],
  "industryModel": [
    "RAW_MATERIAL",
    "TRANSFORMATION",
    "QA",
    "PACKAGING",
    "DISTRIBUTION"
  ],
  "maintenanceAndRecoveryRequired": true,
  "materialProvenanceRequired": true,
  "oeeMeasurementSupported": true,
  "qualityGatesRequired": true,
  "safetyInterlocksRequired": true
});



    module.exports = { industryFabric };
