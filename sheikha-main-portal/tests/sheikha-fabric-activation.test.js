/**
 * اختبار تفعيل SHEIKHA Infrastructure Fabric الكامل
 * SHEIKHA Sovereign Cognitive Infrastructure — Activation Test
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 */

'use strict';

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${label}`);
        failed++;
    }
}

// ─── 1. Runtime Kernel ────────────────────────────────────────────────────────
console.log('\n[1] Runtime Kernel');
const kernel = require('../runtime/sheikha-runtime-kernel');
kernel.boot();
const ks = kernel.status();
assert(ks.name === 'SHEIKHA Runtime Kernel', 'kernel identity correct');
assert(typeof ks.bootTime === 'string', 'kernel has bootTime');

kernel.registerService('test-service');
const started = kernel.startService('test-service');
assert(started === true, 'service start succeeds');

const notStarted = kernel.startService('ghost-service');
assert(notStarted === false, 'unregistered service returns false');

kernel.loadEngine('test-engine', { name: 'test' });
const eng = kernel.getEngine('test-engine');
assert(eng !== null, 'engine retrieved after load');

const health = kernel.healthCheck();
assert(health.status === 'operational', 'healthCheck returns operational');
assert(typeof health.uptime === 'number', 'healthCheck has uptime');

// ─── 2. Infrastructure Fabric ─────────────────────────────────────────────────
console.log('\n[2] Infrastructure Fabric');
const fabric = require('../fabric/sheikha-infrastructure-fabric');
fabric.initialize();
const fabReport = fabric.healthReport();
assert(fabReport.layers.total === 13, 'fabric has 13 layers');
assert(fabReport.layers.infrastructure > 0, 'fabric has infrastructure layers');
assert(fabReport.layers.domain > 0, 'fabric has domain layers');

fabric.registerNode('node-sa-01', 'Regional Runtime Node', 'saudi-arabia');
const fabStatus2 = fabric.healthReport();
assert(fabStatus2.nodes === 1, 'node registered in fabric');

// ─── 3. Observability Layer ───────────────────────────────────────────────────
console.log('\n[3] Observability Layer');
const obs = require('../observability/sheikha-observability-layer');
obs.start();
obs.record('test.metric', 42);
assert(obs.get('test.metric') === 42, 'metric recorded and retrieved');

obs.record('test.metric', 43);
const hist = obs.history('test.metric');
assert(hist.length === 2, 'metric history tracked');

const snap = obs.snapshot();
assert(typeof snap.uptime === 'number', 'snapshot has uptime');
assert(typeof snap.memory.heapUsed === 'number', 'snapshot has memory');

obs.registerAlert('high-heap', () => false, 'critical');
const triggered = obs.evaluateAlerts();
assert(triggered.length === 0, 'no alerts triggered when condition false');

const report = obs.generateReport();
assert(report.summary === 'Operational', 'report summary is Operational');

// ─── 4. Governance Fabric ─────────────────────────────────────────────────────
console.log('\n[4] Governance Fabric');
const gov = require('../governance/sheikha-governance-fabric');
gov.start();
const govStatus = gov.status();
assert(govStatus.policies >= 5, 'governance has charter policies loaded');

gov.grantPermission('supplier-1', 'create:product');
assert(gov.hasPermission('supplier-1', 'create:product'), 'permission grant works');
assert(!gov.hasPermission('supplier-1', 'delete:all'), 'ungranted permission denied');

gov.revokePermission('supplier-1', 'create:product');
assert(!gov.hasPermission('supplier-1', 'create:product'), 'permission revoke works');

const shariahOk = gov.checkShariah('noRiba', { interestRate: 0 });
assert(shariahOk.compliant === true, 'shariah: no-riba passes');

const shariahFail = gov.checkShariah('noHaramProducts', { category: 'alcohol' });
assert(shariahFail.compliant === false, 'shariah: haram product fails');

gov.registerDeploymentGate('release-v1');
assert(!gov.isDeploymentApproved('release-v1'), 'gate not approved by default');
gov.approveDeploymentGate('release-v1', 'architecture-council');
assert(gov.isDeploymentApproved('release-v1'), 'gate approved after approval');

const trail = gov.getAuditTrail();
assert(trail.length > 0, 'audit trail has entries');

// ─── 5. Integration Gateway ───────────────────────────────────────────────────
console.log('\n[5] Integration Gateway');
const intg = require('../integration/sheikha-integration-gateway');
intg.start();
const intgStatus = intg.status();
assert(intgStatus.connectors.total > 0, 'integration connectors registered on start');

intg.registerConnector('mock-erp', 'erp', { send: (msg) => msg });
intg.connect('mock-erp');
const adapter = intg.getAdapter('mock-erp');
assert(adapter !== null, 'connected adapter retrievable');

const disconnected = intg.getAdapter('github'); // not connected
assert(disconnected === null, 'disconnected adapter returns null');

const result = intg.send('mock-erp', { event: 'test' });
assert(result.success === true, 'message sent via connected connector');

// ─── 6. Orchestrator ──────────────────────────────────────────────────────────
console.log('\n[6] Orchestrator');
const orch = require('../orchestration/sheikha-orchestrator');
orch.start();

orch.registerPipeline('test-pipeline', ['step-a', 'step-b', 'step-c']);
const pipeResult = orch.executePipeline('test-pipeline');
assert(pipeResult.success === true, 'pipeline executed successfully');
assert(pipeResult.steps.length === 3, 'pipeline has 3 steps');

const missingPipe = orch.executePipeline('nonexistent');
assert(missingPipe.success === false, 'missing pipeline returns failure');

const cycleResult = orch.runEvolutionCycle({ context: 'test' });
assert(cycleResult.iteration === 1, 'evolution cycle iteration tracked');
assert(Object.keys(cycleResult.phases).length === 9, 'evolution cycle has 9 phases');

const dist = orch.distributeLoad(['w1', 'w2'], [{ id: 1 }, { id: 2 }, { id: 3 }]);
assert(dist.size === 2, 'load distributed across 2 workers');

// ─── 7. Modules Registry ──────────────────────────────────────────────────────
console.log('\n[7] Modules Registry');
const mods = require('../modules/index');
mods.start();

mods.register('analytics-module', {
    scope: 'analytics',
    owner: 'analytics-team',
    valueHypothesis: 'Provides real-time analytics',
    successMetrics: ['latency < 200ms', 'uptime > 99.9%'],
    architecturalFit: 'Observability Layer',
    type: 'Module',
}, { analyze: () => ({}) });

mods.activate('analytics-module');
const mod = mods.get('analytics-module');
assert(mod !== null, 'registered and activated module retrievable');

let threw = false;
try {
    mods.register('invalid-module', { scope: 'test' });
} catch (_) {
    threw = true;
}
assert(threw, 'incomplete manifest throws error');

// ─── 8. Domain: Supply Chain ──────────────────────────────────────────────────
console.log('\n[8] Domain: Supply Chain');
const sc = require('../supply-chain/index');
sc.start();
sc.registerSupplier('sup-001', { name: 'ACME Metals', country: 'SA' });
sc.updateInventory('IRON-001', 500, 'warehouse-a');
const shipment = sc.createShipment('ship-001', { from: 'riyadh', to: 'jeddah' });
assert(shipment.status === 'created', 'shipment created');
const scStatus = sc.status();
assert(scStatus.suppliers === 1, 'supply chain has 1 supplier');

// ─── 9. Domain: Industry ──────────────────────────────────────────────────────
console.log('\n[9] Domain: Industry');
const ind = require('../industry/index');
ind.start();
ind.registerFacility('fac-001', { name: 'Steel Plant Riyadh' });
ind.registerProductionLine('line-001', 'fac-001', { capacity: 1000 });
const alert = ind.raiseMaintenanceAlert('fac-001', 'vibration', 'high');
assert(alert.severity === 'high', 'maintenance alert raised');
const qc = ind.recordQualityCheck('line-001', true, { purity: '99.9%' });
assert(qc.passed === true, 'quality check recorded');

// ─── 10. Domain: Trade ───────────────────────────────────────────────────────
console.log('\n[10] Domain: Trade');
const tr = require('../trade/index');
tr.start();
tr.addProduct('STEEL-001', { name: 'Steel Sheet', price: 500, category: 'metals' });
const catalog = tr.listCatalog();
assert(catalog.length === 1, 'product added to catalog');

const order = tr.createOrder('buyer-001', [{ sku: 'STEEL-001', quantity: 2 }]);
assert(order.total === 1000, 'order total calculated correctly');

const contract = tr.createContract('con-001', ['buyer-001', 'seller-001'], ['delivery in 7 days']);
assert(contract.status === 'active', 'contract created and active');

let tradeThrew = false;
try { tr.addProduct('BAD-001', { price: -1 }); } catch (_) { tradeThrew = true; }
assert(tradeThrew, 'invalid product price throws');

let contractThrew = false;
try { tr.createContract('c2', [], []); } catch (_) { contractThrew = true; }
assert(contractThrew, 'contract without terms throws (anti-gharar)');

// positive case: valid contract
const validContract = tr.createContract('con-002', ['buyer-002', 'seller-002'], ['delivery in 14 days', 'quality grade A']);
assert(validContract.status === 'active', 'valid contract with terms is created');

// ─── 11. Domain: Financial ────────────────────────────────────────────────────
console.log('\n[11] Domain: Financial');
const fin = require('../financial/index');
fin.start();

fin.createWallet('w-001', 'user-001');
fin.credit('w-001', 1000, 'initial deposit');
assert(fin.getBalance('w-001') === 1000, 'credit adds to balance');

fin.debit('w-001', 250, 'purchase');
assert(fin.getBalance('w-001') === 750, 'debit subtracts from balance');

fin.createWallet('w-002', 'user-002');
const settlement = fin.settle('w-001', 'w-002', 100, 'settlement');
assert(settlement.debit.type === 'debit', 'settlement debit recorded');
assert(settlement.credit.type === 'credit', 'settlement credit recorded');
assert(fin.getBalance('w-001') === 650, 'balance after settlement correct');

let finThrew = false;
try { fin.debit('w-001', 99999); } catch (_) { finThrew = true; }
assert(finThrew, 'insufficient balance throws');

// ─── 12. Domain: Smart Cities ─────────────────────────────────────────────────
console.log('\n[12] Domain: Smart Cities');
const sc2 = require('../smart-cities/index');
sc2.start();
sc2.registerZone('zone-riyadh-01', { name: 'Riyadh Central', type: 'commercial' });
sc2.registerSensor('sensor-001', 'zone-riyadh-01', 'air-quality');
const reading = sc2.recordReading('sensor-001', 42, 'AQI');
assert(reading.value === 42, 'sensor reading recorded');
sc2.registerCityService('electricity-001', { name: 'Power Grid North' });
const cityReport = sc2.cityHealthReport();
assert(cityReport.zones === 1, 'city has 1 zone');
assert(cityReport.sensors.total === 1, 'city has 1 sensor');

// ─── 13. Full Civilization Bootstrap ─────────────────────────────────────────
console.log('\n[13] Full Civilization Bootstrap');
const bootstrap = require('../sheikha-civilization-bootstrap');
const civilization = bootstrap.activate();
assert(civilization.kernel !== undefined, 'civilization exposes kernel');
assert(civilization.fabric !== undefined, 'civilization exposes fabric');
assert(civilization.domains.supplyChain !== undefined, 'civilization exposes supply chain');
assert(civilization.domains.financial !== undefined, 'civilization exposes financial');
assert(civilization.domains.smartCities !== undefined, 'civilization exposes smart cities');

const civStatus = civilization.status();
assert(civStatus.identity.technical === 'SHEIKHA Sovereign Cognitive Infrastructure', 'correct civilization identity');
assert(Array.isArray(civStatus.identity.layers), 'civilization has layer list');
assert(civStatus.identity.layers.length >= 7, 'civilization has at least 7 system layers');
assert(civStatus.identity.domains.length === 5, 'civilization has 5 domain layers');

const cycleResult2 = civilization.runEvolutionCycle();
assert(cycleResult2.iteration > 0, 'civilization evolution cycle runs');

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║            SHEIKHA Infrastructure Fabric                 ║');
console.log('║             نتائج اختبار التفعيل الحضاري                  ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║  ✅ اجتاز:  ${String(passed).padEnd(3)}                                         ║`);
console.log(`║  ❌ فشل:   ${String(failed).padEnd(3)}                                         ║`);
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

if (failed > 0) {
    process.exit(1);
}
