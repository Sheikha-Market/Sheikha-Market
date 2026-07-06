'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const GRAPH = {
  name: 'SHEIKHA_ROOT_KNOWLEDGE_AND_CIVILIZATION_GRAPH',
  status: 'ACTIVE',
  governance: {
    bookOfAllah: true,
    sunnahOfProphetMuhammad: true,
    sunnahOfRightlyGuidedCaliphs: true,
    tawheed: true,
    noHarm: true,
    halalOnly: true,
    humanAuthority: true
  },
  domains: {
    shariaSciences: true,
    arabicSciences: true,
    medicine: true,
    physics: true,
    energy: true,
    industry: true,
    computing: true,
    economics: true,
    education: true,
    logistics: true,
    infrastructure: true,
    commerce: true
  },
  relations: {
    knowledgeToScience: true,
    scienceToIndustry: true,
    calculationToComputing: true,
    computingToInfrastructure: true,
    infrastructureToLogistics: true,
    logisticsToCommerce: true,
    governanceToAll: true,
    improvementToAll: true
  },
  methodology: {
    verification: true,
    measurement: true,
    documentation: true,
    classification: true,
    integration: true,
    continuousImprovement: true
  }
};

function ensure() {
  [
    'runtime/root/civilization/knowledge',
    'runtime/root/civilization/sciences',
    'runtime/root/civilization/methodology',
    'runtime/root/civilization/infrastructure',
    'runtime/root/civilization/integration',
    'runtime/root/civilization/improvement',
    'runtime/root/civilization/reports'
  ].forEach((dir) => fs.mkdirSync(path.join(ROOT, dir), { recursive: true }));
}

function status() {
  ensure();
  return { success: true, graph: GRAPH, timestamp: new Date().toISOString() };
}

function activate() {
  ensure();
  const record = {
    success: true,
    activated: true,
    graph: GRAPH,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/root/civilization/reports',
    `${Date.now()}-root-civilization-graph.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');
  return { success: true, file, record };
}

module.exports = { status, activate };
