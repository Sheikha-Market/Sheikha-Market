const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, 'labs-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

function evaluateLab(labId, score = 100) {
  const lab = registry.labs.find(l => l.id === labId);
  if (!lab) throw new Error(`Unknown lab: ${labId}`);

  return {
    lab: lab.name,
    score,
    status:
      score >= 90 ? 'HARVEST_READY' :
      score >= 70 ? 'GROWING' :
      score >= 50 ? 'NEEDS_WATERING' :
      'REPLANT_OR_ROLLBACK',
    rules: registry.foundation,
    metrics: lab.metrics,
    computerMapping: lab.computer_mapping,
    timestamp: new Date().toISOString()
  };
}

function activateAllLabs() {
  return registry.labs.map(lab => evaluateLab(lab.id, 100));
}

if (require.main === module) {
  console.log(JSON.stringify({
    system: registry.system,
    activation: activateAllLabs()
  }, null, 2));
}

module.exports = { registry, evaluateLab, activateAllLabs };
