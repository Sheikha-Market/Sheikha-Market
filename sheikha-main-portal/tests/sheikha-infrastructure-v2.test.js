/**
 * اختبار تفعيل SHEIKHA Infrastructure v2.0 — الطبقات الجديدة
 * Kernel + Distributed + Intelligence + Security + Bootstrap v2
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 */

'use strict';

const path = require('path');
const fs   = require('fs');

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

(async () => {

// ─── 1. Runtime Kernel (kernel/) ──────────────────────────────────────────────
console.log('\n[1] Runtime Kernel (kernel/runtime-kernel.js)');
const kernelModule = require('../kernel/runtime-kernel');

assert(kernelModule.KERNEL_STATES.UNINITIALIZED === 'UNINITIALIZED', 'kernel has UNINITIALIZED state');
assert(kernelModule.getState() === 'UNINITIALIZED', 'initial state is UNINITIALIZED');

// boot
const bootResult = await kernelModule.boot();
assert(bootResult.success === true, 'kernel boots successfully');
assert(kernelModule.getState() === 'READY', 'kernel state is READY after boot');

// double boot guard
const boot2 = await kernelModule.boot();
assert(boot2.success === false, 'second boot is a no-op');

// boot steps
assert(bootResult.steps.length > 0, 'boot sequence has steps');
const completedSteps = bootResult.steps.filter(s => s.status === 'done');
assert(completedSteps.length >= 1, 'at least one boot step completed');

// engine dependency graph
kernelModule.registerEngine('base-engine', { name: 'base' }, []);
kernelModule.registerEngine('dep-engine',  { name: 'dep' },  ['base-engine']);
const order = kernelModule.resolveLoadOrder();
const baseIdx = order.indexOf('base-engine');
const depIdx  = order.indexOf('dep-engine');
assert(baseIdx < depIdx, 'dependency graph: base-engine loads before dep-engine');

kernelModule.loadAllEngines();
const eng = kernelModule.getEngine('base-engine');
assert(eng !== null, 'engine retrievable after loadAllEngines');

// health
const kHealth = kernelModule.health();
assert(kHealth.state === 'READY', 'health report state is READY');
assert(typeof kHealth.uptime === 'number', 'health report has uptime');
assert(Array.isArray(kHealth.engines), 'health report has engine list');

// runtime identity
const identity = kernelModule.runtimeIdentity();
assert(identity !== null, 'runtimeIdentity returns value');

// status
const kStatus = kernelModule.status();
assert(kStatus.name === 'SHEIKHA Runtime Kernel', 'kernel status has correct name');
assert(kStatus.enginesRegistered >= 2, 'kernel status shows registered engines');

// event bus
assert(typeof kernelModule.on === 'function', 'kernel exposes event bus');

// shutdown
await kernelModule.shutdown('test');
assert(kernelModule.getState() === 'HALTED', 'kernel halted after shutdown');

// ─── 2. Runtime Identity JSON ─────────────────────────────────────────────────
console.log('\n[2] Runtime Identity JSON');
const identityPath = path.join(__dirname, '..', 'runtime', 'runtime.identity.json');
assert(fs.existsSync(identityPath), 'runtime.identity.json exists');
const identityJson = JSON.parse(fs.readFileSync(identityPath, 'utf8'));
assert(identityJson.technical === 'SHEIKHA Sovereign Cognitive Infrastructure', 'identity has correct technical name');
assert(identityJson.architecture === 'distributed-modular-runtime', 'identity has correct architecture');
assert(identityJson.compliance.shariah === true, 'identity declares shariah compliance');
assert(Array.isArray(identityJson.layers), 'identity has layers array');
assert(identityJson.layers.length >= 8, 'identity has at least 8 layers');

// ─── 3. Distributed Fabric ────────────────────────────────────────────────────
console.log('\n[3] Distributed Runtime Fabric');
const dist = require('../distributed/sheikha-distributed-fabric');
dist.start();

const distStatus = dist.status();
assert(distStatus.nodes >= 1, 'local node auto-registered on start');

// register nodes
const id1 = dist.registerNode({ type: dist.NODE_TYPES.INDUSTRIAL, region: 'riyadh',  host: 'vps-1.sheikha.io' });
const id2 = dist.registerNode({ type: dist.NODE_TYPES.TRADE,      region: 'jeddah',  host: 'vps-2.sheikha.io' });
assert(dist.status().nodes >= 3, 'nodes registered');

// discover
const industrial = dist.discoverNodes({ type: dist.NODE_TYPES.INDUSTRIAL });
assert(industrial.length >= 1, 'discoverNodes filters by type');
const riyadh = dist.discoverNodes({ region: 'riyadh' });
assert(riyadh.length >= 1, 'discoverNodes filters by region');

// heartbeat
dist.updateNodeStatus(id1, 'degraded');
assert(dist.getNode(id1).status === 'degraded', 'node status updated to degraded');
dist.heartbeat(id1);
assert(dist.getNode(id1).status === 'active', 'heartbeat restores active status');

// state sync event
let syncFired = false;
dist.on('state:sync', () => { syncFired = true; });
dist.syncState(id2, { load: 0.4 });
assert(syncFired, 'state sync event fires');

// missing node
assert(dist.getNode('ghost-node') === null, 'missing node returns null');
assert(dist.updateNodeStatus('ghost', 'offline') === false, 'update missing node returns false');

// mesh health
const mesh = dist.meshHealth();
assert(typeof mesh.totalNodes === 'number', 'mesh health has totalNodes');
assert(typeof mesh.availability === 'number', 'mesh health has availability');
assert(mesh.availability >= 0 && mesh.availability <= 1, 'availability is in 0-1 range');

// ─── 4. Intelligence Fabric ───────────────────────────────────────────────────
console.log('\n[4] Operational Intelligence Fabric');
const intel = require('../intelligence/sheikha-intelligence-fabric');
intel.start();

// data points + analysis
intel.pushDataPoint('test.metric', 10);
intel.pushDataPoint('test.metric', 11);
intel.pushDataPoint('test.metric', 10);
intel.pushDataPoint('test.metric', 10);
const analysis = intel.analyzeMetric('test.metric');
assert(analysis !== null, 'metric analysis returns result');
assert(typeof analysis.mean === 'number', 'analysis has mean');
assert(typeof analysis.stdDev === 'number', 'analysis has stdDev');
assert(analysis.samples === 4, 'analysis has correct sample count');

// anomaly detection — normal
const noAnomaly = intel.detectAnomaly('test.metric');
assert(noAnomaly.anomaly === false, 'normal metric: no anomaly detected');

// anomaly detection — spike
for (let i = 0; i < 20; i++) intel.pushDataPoint('spike.metric', 10);
intel.pushDataPoint('spike.metric', 500);
const spikeAnomaly = intel.detectAnomaly('spike.metric');
assert(spikeAnomaly.anomaly === true, 'spike metric: anomaly detected');

// workload balancing
const worker = intel.selectWorker(['w1', 'w2', 'w3']);
assert(['w1', 'w2', 'w3'].includes(worker), 'selectWorker returns valid worker');

intel.setBalancingStrategy(intel.BALANCING_STRATEGIES.LEAST_LOADED);
const w1 = intel.selectWorker(['w1', 'w2']);
assert(w1 !== null, 'least-loaded strategy selects worker');

const noWorker = intel.selectWorker([]);
assert(noWorker === null, 'empty workers returns null');

// adaptive scaling
const scaleUp = intel.adaptiveScalingDecision({ cpuUtilization: 0.95, memoryUtilization: 0.9 });
assert(scaleUp.action === 'scale-up', 'high utilization triggers scale-up');

const scaleDown = intel.adaptiveScalingDecision({ cpuUtilization: 0.1, memoryUtilization: 0.1 });
assert(scaleDown.action === 'scale-down', 'low utilization triggers scale-down');

const maintain = intel.adaptiveScalingDecision({ cpuUtilization: 0.6, memoryUtilization: 0.65 });
assert(maintain.action === 'maintain', 'target utilization triggers maintain');

// infrastructure awareness
const awareness = intel.infrastructureAwareness();
assert(typeof awareness.runtime.uptime === 'number', 'infrastructure awareness has uptime');
assert(typeof awareness.runtime.heapUtilization === 'number', 'infrastructure awareness has heap utilization');
assert(awareness.runtime.heapUtilization >= 0 && awareness.runtime.heapUtilization <= 1, 'heap utilization is 0-1');

// predictive maintenance
const low = intel.predictMaintenanceRisk('node-healthy', { errorRate: 0, restartCount: 0 });
assert(low.riskLevel === 'low', 'healthy node has low risk');

const critical = intel.predictMaintenanceRisk('node-bad', { errorRate: 0.1, restartCount: 10, memLeakScore: 0.8 });
assert(critical.riskLevel === 'critical', 'degraded node has critical risk');

const medium = intel.predictMaintenanceRisk('node-medium', { errorRate: 0.02, restartCount: 2 });
assert(medium.riskLevel === 'medium', 'moderate node has medium risk');

// optimization report
const optReport = intel.orchestrationOptimizationReport();
assert(optReport.strategy === intel.BALANCING_STRATEGIES.LEAST_LOADED, 'optimization report has correct strategy');
assert(typeof optReport.metricsTracked === 'number', 'optimization report has metricsTracked');

const intStatus = intel.status();
assert(intStatus.metricsTracked >= 2, 'intelligence status tracks multiple metrics');

// ─── 5. Security Fabric ───────────────────────────────────────────────────────
console.log('\n[5] Security Fabric');
const sec = require('../security/sheikha-security-fabric');
sec.start();

assert(sec.getPosture() === 'standard', 'default posture is standard');

// allowlist / denylist
sec.allow('/api/products');
assert(sec.isAllowed('/api/products'), 'allowed resource passes in standard posture');
sec.deny('/api/internal/admin');
assert(!sec.isAllowed('/api/internal/admin'), 'denied resource blocked');

// Hardened posture
sec.setPosture(sec.POSTURE_LEVELS.HARDENED);
assert(!sec.isAllowed('/api/unknown-path'), 'hardened posture blocks unknown paths');
assert(sec.isAllowed('/api/health'), 'hardened posture allows health endpoint (allowlist)');
sec.setPosture(sec.POSTURE_LEVELS.STANDARD);

// Request validation
const validReq = sec.validateRequest({ method: 'GET', path: '/api/catalog', headers: {} });
assert(validReq.valid === true, 'valid request passes validation');

const traversal = sec.validateRequest({ method: 'GET', path: '/../../../etc/passwd', headers: {} });
assert(traversal.valid === false, 'path traversal blocked');
assert(traversal.violations.some(v => v.includes('traversal')), 'path traversal violation message present');

const noMethod = sec.validateRequest({ path: '/api/test', headers: {} });
assert(noMethod.valid === false, 'request without method is invalid');

const sqlInject = sec.validateRequest({
    method: 'POST', path: '/api/search', headers: {},
    body: { q: '1; DROP TABLE users; SELECT * FROM users' },
});
assert(sqlInject.valid === false, 'SQL injection payload blocked');

// Rate limiting
for (let i = 0; i < 5; i++) sec.checkRateLimit('user-rl-test', 5);
const rateResult = sec.checkRateLimit('user-rl-test', 5);
assert(!rateResult.allowed, 'rate limit exceeded after threshold');
assert(rateResult.remaining === 0, 'remaining is 0 when at limit');

const newUser = sec.checkRateLimit('user-brand-new', 60);
assert(newUser.allowed, 'new user is under rate limit');
assert(newUser.remaining === 59, 'remaining is 59 after first request');

// Threat detection
const threat = sec.recordThreat('brute-force', 'high', { source: '1.2.3.4' });
assert(threat.type === 'brute-force', 'threat type recorded');
assert(threat.severity === 'high', 'threat severity recorded');
assert(threat.id !== undefined, 'threat has auto-generated ID');
const threats = sec.getThreats();
assert(threats.length >= 1, 'threats list is populated');

// Credentials
sec.registerCredentialRef('STRIPE_KEY', 'vault');
assert(sec.hasCredential('STRIPE_KEY'), 'credential ref registered');
assert(!sec.hasCredential('UNKNOWN_SECRET'), 'unknown credential ref returns false');

// Security log
const secLog = sec.getSecurityLog();
assert(secLog.length > 0, 'security event log has entries');

const secStatus = sec.status();
assert(secStatus.posture === 'standard', 'security status shows posture');
assert(secStatus.threatsRecorded >= 1, 'security status shows threat count');
assert(typeof secStatus.allowlistSize === 'number', 'security status has allowlistSize');

// ─── 6. Full Civilization Bootstrap v2 ───────────────────────────────────────
console.log('\n[6] Full Civilization Bootstrap v2.0');
const bootstrap = require('../sheikha-civilization-bootstrap');
const civilization = bootstrap.activate();

// New layers exposed
assert(civilization.security !== undefined, 'civilization v2 exposes security');
assert(civilization.distributed !== undefined, 'civilization v2 exposes distributed');
assert(civilization.intelligence !== undefined, 'civilization v2 exposes intelligence');
assert(civilization.runtimeKernel !== undefined, 'civilization v2 exposes runtimeKernel');

// Updated identity
const civStatus = civilization.status();
assert(civStatus.identity.version === '2.0.0', 'civilization identity is v2.0.0');
assert(civStatus.identity.layers.length === 9, 'civilization v2 has 9 system layers');
assert(civStatus.identity.layers.includes('Security Layer'), 'Security Layer present');
assert(civStatus.identity.layers.includes('Intelligence Layer'), 'Intelligence Layer present');
assert(civStatus.identity.layers.includes('Distributed Fabric Layer'), 'Distributed Fabric Layer present');

// Security in status
assert(civStatus.security !== undefined, 'civilization status includes security');
assert(civStatus.security.posture !== undefined, 'security posture in status');

// Distributed in status
assert(civStatus.distributed !== undefined, 'civilization status includes distributed');
assert(typeof civStatus.distributed.nodes === 'number', 'distributed nodes count in status');

// Intelligence in status
assert(civStatus.intelligence !== undefined, 'civilization status includes intelligence');

// Evolution cycle
const cycle = civilization.runEvolutionCycle();
assert(cycle.iteration > 0, 'evolution cycle runs in v2');
assert(Object.keys(cycle.phases).length === 9, 'evolution cycle has 9 phases');

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       SHEIKHA Sovereign Cognitive Infrastructure v2.0        ║');
console.log('║             نتائج اختبار التفعيل الحضاري الكامل               ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  ✅ اجتاز:  ${String(passed).padEnd(3)}                                         ║`);
console.log(`║  ❌ فشل:   ${String(failed).padEnd(3)}                                         ║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

if (failed > 0) {
    process.exit(1);
}

})().catch(err => {
    console.error('[TEST-FATAL]', err.message);
    console.error(err.stack);
    process.exit(1);
});

