/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA Agents Activation — اختبارات القبول والتشغيل الآمن               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ﴾ — التوبة: ١٠٥
 * «فَحَاسِبُوا أَنفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا» — ابن المبارك
 *
 * تغطي هذه الاختبارات:
 *   [1]  سجل الوكلاء الرسمي — Agent Registry
 *   [2]  طبقة الوكلاء التشغيلية — Operational Agents Layer
 *   [3]  منظومة الحاسب والعلوم — Universal Computing Foundation
 *   [4]  قوانين الشبكة العصبية — Neural Root Laws
 *   [5]  البيئات التشغيلية — Environments
 *   [6]  المنهجيات الأساسية — Methodologies
 *   [7]  وكيل المراقبة والاستمرارية — Continuity Watchdog
 *   [8]  التفعيل الأعلى الشامل — Supreme Activation
 *   [9]  التكامل الكامل — Full Integration
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

(async () => {

// ═══════════════════════════════════════════════════════════════════════════════
// [1] سجل الوكلاء الرسمي — Agent Registry
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[1] Agent Registry (lib/sheikha-agents-activation-registry.js)');

const reg = require('../lib/sheikha-agents-activation-registry');

assert(typeof reg.getAllAgents      === 'function', 'getAllAgents is a function');
assert(typeof reg.getAgent         === 'function', 'getAgent is a function');
assert(typeof reg.getAgentsByType  === 'function', 'getAgentsByType is a function');
assert(typeof reg.getAgentsByScope === 'function', 'getAgentsByScope is a function');
assert(typeof reg.registrySummary  === 'function', 'registrySummary is a function');
assert(typeof reg.canIntegrate     === 'function', 'canIntegrate is a function');

const allAgents = reg.getAllAgents();
assert(Array.isArray(allAgents),        'getAllAgents returns array');
assert(allAgents.length >= 5,           'at least 5 agents defined');

const summary = reg.registrySummary();
assert(typeof summary.totalAgents  === 'number',  'summary has totalAgents');
assert(typeof summary.byType       === 'object',  'summary has byType');
assert(typeof summary.byScope      === 'object',  'summary has byScope');
assert(typeof summary.byStatus     === 'object',  'summary has byStatus');
assert(typeof summary.governance   === 'object',  'summary has governance');
assert(summary.governance.sharia.noRiba === true, 'governance enforces no-riba');
assert(summary.governance.sharia.noGharar === true, 'governance enforces no-gharar');

// فحص وكيل الشبكة العصبية
const neuralAgent = reg.getAgent('neural-root');
assert(neuralAgent !== null,              'neural-root agent exists');
assert(neuralAgent.type === 'neural',     'neural-root has correct type');
assert(neuralAgent.governance.totalCells === 128, 'neural-root has 128 total cells');

// فحص حدود التكامل
const internalAgent = reg.getAgent('neural-root');
const intResult = reg.canIntegrate('neural-root', 'azure');
assert(intResult.allowed === false, 'internal agent cannot integrate externally');

const sdkAgent = reg.getAgent('sdk-server');
assert(sdkAgent !== null,               'sdk-server agent exists');
const sdkInt = reg.canIntegrate('sdk-server', 'azure');
assert(sdkInt.allowed === true,         'hybrid sdk agent can integrate with azure');

// ═══════════════════════════════════════════════════════════════════════════════
// [2] طبقة الوكلاء التشغيلية — Operational Agents Layer
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[2] Operational Agents Layer (lib/sheikha-operational-agents-layer.js)');

const layer = require('../lib/sheikha-operational-agents-layer');

assert(typeof layer.activate          === 'function', 'layer has activate()');
assert(typeof layer.readinessBoard    === 'function', 'layer has readinessBoard()');
assert(typeof layer.agentReadiness    === 'function', 'layer has agentReadiness()');
assert(typeof layer.updateAgentReadiness === 'function', 'layer has updateAgentReadiness()');
assert(typeof layer.status            === 'function', 'layer has status()');

const activateResult = layer.activate();
assert(activateResult.success === true,                  'activate() returns success:true');
assert(typeof activateResult.summary === 'object',       'activate() returns summary');
assert(typeof activateResult.summary.total === 'number', 'summary has total count');
assert(activateResult.summary.total >= 5,                'at least 5 agents activated');

const board = layer.readinessBoard();
assert(typeof board === 'object',               'readinessBoard returns object');
assert(Array.isArray(board.agents),             'board has agents array');
assert(board.agents.length >= 5,               'at least 5 agents on board');
assert(typeof board.counts === 'object',        'board has counts');
assert(typeof board.overallReadiness === 'string', 'board has overallReadiness');
assert(['Ready', 'Degraded'].includes(board.overallReadiness), 'overallReadiness is Ready or Degraded');

const layerStatus = layer.status();
assert(layerStatus.ready === true,              'layer is ready after activate()');
assert(typeof layerStatus.activatedAt === 'string', 'layer has activatedAt timestamp');

// ═══════════════════════════════════════════════════════════════════════════════
// [3] منظومة الحاسب والعلوم — Universal Computing Foundation
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[3] Universal Computing Foundation (lib/sheikha-universal-computing-foundation.js)');

const ucf = require('../lib/sheikha-universal-computing-foundation');

// أركان علوم الحاسب
assert(typeof ucf.CS_PILLARS === 'object',      'CS_PILLARS exported');
assert(Object.keys(ucf.CS_PILLARS).length >= 10, 'at least 10 CS pillars defined');
assert(ucf.CS_PILLARS.algorithms !== undefined,  'algorithms pillar exists');
assert(ucf.CS_PILLARS.artificialIntelligence !== undefined, 'AI pillar exists');
assert(ucf.CS_PILLARS.cybersecurity !== undefined, 'cybersecurity pillar exists');
assert(ucf.CS_PILLARS.distributedComputing !== undefined, 'distributed computing pillar exists');

// البيئات التشغيلية
assert(typeof ucf.ENVIRONMENTS === 'object',    'ENVIRONMENTS exported');
assert(Object.keys(ucf.ENVIRONMENTS).length >= 8, 'at least 8 environments');
assert(ucf.ENVIRONMENTS.development !== undefined, 'development env exists');
assert(ucf.ENVIRONMENTS.cosmic !== undefined,   'cosmic env exists');
assert(ucf.ENVIRONMENTS.saudi !== undefined,    'saudi env exists');
assert(ucf.ENVIRONMENTS.international !== undefined, 'international env exists');

// المنهجيات
assert(typeof ucf.METHODOLOGIES === 'object',   'METHODOLOGIES exported');
assert(Object.keys(ucf.METHODOLOGIES).length >= 5, 'at least 5 methodologies');
assert(ucf.METHODOLOGIES.agile !== undefined,   'agile methodology exists');
assert(ucf.METHODOLOGIES.tdd !== undefined,     'TDD methodology exists');
assert(ucf.METHODOLOGIES.islamicITGovernance !== undefined, 'Islamic IT governance exists');

// قوانين الشبكة العصبية
assert(Array.isArray(ucf.NEURAL_ROOT_LAWS),     'NEURAL_ROOT_LAWS is array');
assert(ucf.NEURAL_ROOT_LAWS.length >= 7,        'at least 7 neural laws');
const tawheedLaw = ucf.NEURAL_ROOT_LAWS.find(l => l.id === 'law-tawheed');
assert(tawheedLaw !== undefined,                'Tawheed law defined');
assert(tawheedLaw.enforced === true,            'Tawheed law is enforced');
const halalLaw = ucf.NEURAL_ROOT_LAWS.find(l => l.id === 'law-halal');
assert(halalLaw !== undefined,                  'Halal law defined');
assert(halalLaw.enforced === true,              'Halal law is enforced');
const noHarmLaw = ucf.NEURAL_ROOT_LAWS.find(l => l.id === 'law-no-harm');
assert(noHarmLaw !== undefined,                 'No-Harm law defined');

// مواصفات الشبكة
assert(typeof ucf.NEURAL_SPECIFICATIONS === 'object', 'NEURAL_SPECIFICATIONS exported');
assert(ucf.NEURAL_SPECIFICATIONS.architecture.totalActiveCells === 128, '128 total active cells in specs');
assert(ucf.NEURAL_SPECIFICATIONS.optimizer.type === 'Adam', 'Adam optimizer specified');

// أركان المنظومة
assert(Array.isArray(ucf.FOUNDATION_PILLARS),   'FOUNDATION_PILLARS is array');
assert(ucf.FOUNDATION_PILLARS.length >= 7,      'at least 7 foundation pillars');

// دوال الاستعلام
const aiPillar = ucf.getCSPillar('artificialIntelligence');
assert(aiPillar !== null,                       'getCSPillar() returns AI pillar');
assert(Array.isArray(aiPillar.subfields),       'AI pillar has subfields');

const cosmicEnv = ucf.getEnvironment('cosmic');
assert(cosmicEnv !== null,                      'getEnvironment() returns cosmic env');
assert(cosmicEnv.scope === 'cosmic',            'cosmic env has correct scope');

const saudiReport = ucf.environmentReport('saudi');
assert(typeof saudiReport === 'object',         'environmentReport() returns object');
assert(saudiReport.environment !== undefined,   'environment report has environment data');
assert(Array.isArray(saudiReport.neuralLaws),   'environment report has neural laws');
assert(saudiReport.allCompliant === true,       'saudi env complies with all neural laws');

const compliance = ucf.checkCompliance('cosmic', 'law-tawheed');
assert(compliance.compliant === true,           'cosmic env complies with tawheed law');

const fs = ucf.foundationSummary();
assert(typeof fs === 'object',                  'foundationSummary() returns object');
assert(fs.csPillarsCount >= 10,                 'csPillarsCount >= 10');
assert(fs.environmentsCount >= 8,              'environmentsCount >= 8');

// ═══════════════════════════════════════════════════════════════════════════════
// [4] قوانين الشبكة العصبية الجذرية — Neural Root Laws
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[4] Neural Root Laws — قوانين الشبكة العصبية');

const enforcedLaws = ucf.NEURAL_ROOT_LAWS.filter(l => l.enforced);
assert(enforcedLaws.length >= 7,                'all 7+ laws are enforced');

const lawIds = ucf.NEURAL_ROOT_LAWS.map(l => l.id);
assert(lawIds.includes('law-tawheed'),          'law-tawheed present');
assert(lawIds.includes('law-halal'),            'law-halal present');
assert(lawIds.includes('law-maqasid'),          'law-maqasid present');
assert(lawIds.includes('law-excellence'),       'law-excellence present');
assert(lawIds.includes('law-no-harm'),          'law-no-harm present');
assert(lawIds.includes('law-continuity'),       'law-continuity present');
assert(lawIds.includes('law-human-primacy'),    'law-human-primacy present');

// كل قانون له مرجع إسلامي
for (const law of ucf.NEURAL_ROOT_LAWS) {
    assert(typeof law.islamicRef === 'string' && law.islamicRef.length > 0,
        `law "${law.id}" has islamicRef`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [5] البيئات التشغيلية — Environments Validation
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[5] Environments — البيئات التشغيلية');

const requiredEnvs = ['development', 'testing', 'production', 'saudi', 'gulf', 'oic', 'international', 'global', 'cosmic'];
for (const envId of requiredEnvs) {
    assert(ucf.getEnvironment(envId) !== null, `environment "${envId}" exists`);
}

const saudiEnv = ucf.getEnvironment('saudi');
assert(saudiEnv.compliance.includes('pdpl-ksa'), 'saudi env has PDPL compliance');
assert(saudiEnv.governance.shariaFirst === true,  'saudi env sharia-first governance');

const cosmicEnvFull = ucf.getEnvironment('cosmic');
assert(cosmicEnvFull.scope === 'cosmic',          'cosmic env has cosmic scope');
assert(Array.isArray(cosmicEnvFull.principles),   'cosmic env has Islamic principles');

// ═══════════════════════════════════════════════════════════════════════════════
// [6] المنهجيات الأساسية — Methodologies
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[6] Methodologies — المنهجيات الأساسية');

const requiredMethods = ['agile', 'tdd', 'devops', 'microservices', 'zeroTrust', 'islamicITGovernance'];
for (const mId of requiredMethods) {
    assert(ucf.getMethodology(mId) !== null, `methodology "${mId}" exists`);
}

const islamicGov = ucf.getMethodology('islamicITGovernance');
assert(Array.isArray(islamicGov.pillars),         'islamic governance has pillars');
assert(islamicGov.pillars.length >= 5,            'at least 5 islamic governance pillars');
assert(Array.isArray(islamicGov.prohibitions),    'islamic governance has prohibitions');

const tdd = ucf.getMethodology('tdd');
assert(Array.isArray(tdd.cycle),                  'TDD has cycle array (Red→Green→Refactor)');
assert(tdd.cycle.length === 3,                    'TDD cycle has 3 steps');

// ═══════════════════════════════════════════════════════════════════════════════
// [7] وكيل المراقبة والاستمرارية — Continuity Watchdog
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[7] Continuity Watchdog (lib/sheikha-agent-continuity-watchdog.js)');

const watchdog = require('../lib/sheikha-agent-continuity-watchdog');

assert(typeof watchdog.start     === 'function', 'watchdog has start()');
assert(typeof watchdog.stop      === 'function', 'watchdog has stop()');
assert(typeof watchdog.runCycle  === 'function', 'watchdog has runCycle()');
assert(typeof watchdog.status    === 'function', 'watchdog has status()');
assert(typeof watchdog.getLogs   === 'function', 'watchdog has getLogs()');
assert(typeof watchdog.getAlerts === 'function', 'watchdog has getAlerts()');
assert(typeof watchdog.clearLogs === 'function', 'watchdog has clearLogs()');

const preCycleStatus = watchdog.status();
assert(preCycleStatus.running === false,        'watchdog not running before start()');
assert(typeof preCycleStatus.cycleCount === 'number', 'watchdog has cycleCount');

// تشغيل دورة واحدة يدوياً
const cycleResult = watchdog.runCycle();
assert(typeof cycleResult === 'object',         'runCycle() returns object');
assert(typeof cycleResult.cycleId === 'number', 'cycle has id');
assert(typeof cycleResult.healthy === 'boolean','cycle has healthy flag');
assert(typeof cycleResult.checks === 'object',  'cycle has checks');
assert(typeof cycleResult.alerts === 'object',  'cycle has alerts');
assert(Array.isArray(cycleResult.alerts),       'cycle.alerts is array');

// فحص أن الذاكرة تُفحص
assert(cycleResult.checks.memory !== undefined, 'memory check present');
assert(typeof cycleResult.checks.memory.ok === 'boolean', 'memory check has ok flag');
assert(cycleResult.checks.uptime !== undefined, 'uptime check present');

// سجل الأحداث
const logs = watchdog.getLogs(10);
assert(Array.isArray(logs),                     'getLogs returns array');

// بدء المراقبة لفترة قصيرة جداً (للاختبار)
const startResult = watchdog.start({ intervalMs: 5000 });
assert(startResult.success === true,            'start() returns success:true');
assert(startResult.intervalMs >= 5000,          'start() respects intervalMs');

const runningStatus = watchdog.status();
assert(runningStatus.running === true,          'watchdog is running after start()');

// إيقاف المراقبة
const stopResult = watchdog.stop();
assert(stopResult.success === true,             'stop() returns success:true');
assert(watchdog.status().running === false,     'watchdog stopped after stop()');

// ═══════════════════════════════════════════════════════════════════════════════
// [8] التفعيل الأعلى الشامل — Supreme Activation
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[8] Supreme Activation (lib/sheikha-supreme-activation.js)');

const supreme = require('../lib/sheikha-supreme-activation');

assert(typeof supreme.activateAll === 'function', 'supreme has activateAll()');
assert(typeof supreme.status      === 'function', 'supreme has status()');
assert(typeof supreme.getResult   === 'function', 'supreme has getResult()');

// الحالة قبل التفعيل
const preSupremeStatus = supreme.status();
assert(typeof preSupremeStatus === 'object',      'status() returns object before activation');

// التفعيل الأعلى (بدون watchdog في الاختبار)
const supremeResult = supreme.activateAll({ startWatchdog: false });

assert(typeof supremeResult === 'object',         'activateAll() returns object');
assert(typeof supremeResult.success === 'boolean','activateAll() has success flag');
assert(typeof supremeResult.activatedAt === 'string', 'result has activatedAt');
assert(typeof supremeResult.latencyMs === 'number', 'result has latencyMs');
assert(typeof supremeResult.steps === 'object',   'result has steps');
assert(typeof supremeResult.verification === 'object', 'result has verification');
assert(typeof supremeResult.summary === 'object', 'result has summary');

// التحقق من معايير النجاح
assert(supremeResult.verification.total >= 7,     'at least 7 verification checks');
assert(supremeResult.verification.passed >= 6,    'at least 6 verification checks pass');

// ملخص التفعيل
assert(supremeResult.summary.csPillars >= 10,     'summary: csPillars >= 10');
assert(supremeResult.summary.environments >= 8,   'summary: environments >= 8');
assert(supremeResult.summary.neuralLaws >= 7,     'summary: neuralLaws >= 7');
assert(supremeResult.summary.pillars >= 7,        'summary: pillars >= 7');
assert(supremeResult.summary.neuralCells >= 19,   'summary: neuralCells >= 19');

// الحالة بعد التفعيل
const postSupremeStatus = supreme.status();
assert(postSupremeStatus.activated === true,      'supreme is activated after activateAll()');

// نتيجة مُخزَّنة
const storedResult = supreme.getResult();
assert(storedResult !== null,                     'getResult() returns stored result');
assert(storedResult.tawheed !== undefined,        'stored result has tawheed');

// ═══════════════════════════════════════════════════════════════════════════════
// [9] التكامل الكامل — Full Integration
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n[9] Full Integration — التكامل الكامل');

// الشبكة العصبية الجذرية تعمل مع التفعيل الأعلى
assert(supremeResult.steps.neuralRoot.activated === true,  'neural root activated in supreme');
assert(supremeResult.steps.neuralRoot.totalCells >= 19,    'neural root has cells in supreme');

// طبقة الوكلاء تعمل
assert(supremeResult.steps.agentLayer.activated === true,  'agent layer activated in supreme');

// منظومة الحاسب والعلوم تعمل
assert(supremeResult.steps.foundation.activated === true,  'computing foundation activated in supreme');

// سجل الوكلاء متكامل
assert(supremeResult.steps.registry.activated === true,    'agent registry activated in supreme');

// التحقق من أن الشريعة أولاً مُطبَّق
const halalCheckLaw = supremeResult.verification.checks.find(c => c.id === 'sharia-first');
assert(halalCheckLaw !== undefined,                        'sharia-first check in verification');
assert(halalCheckLaw.pass === true,                        'sharia-first check passes');

// التحقق من وحدة النتيجة (tawheed في كل مكان)
assert(supremeResult.tawheed === 'لا إله إلا الله محمد رسول الله', 'tawheed present in result');
assert(supremeResult.bismillah === 'بسم الله الرحمن الرحيم',       'bismillah present in result');
assert(supremeResult.noHarm === 'لا ضرر ولا ضرار',               'noHarm present in result');

// ═══════════════════════════════════════════════════════════════════════════════
// الملخص النهائي
// ═══════════════════════════════════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║   SHEIKHA — اختبارات القبول والتشغيل الآمن — نتائج النهائية          ║');
console.log('║   ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١                   ║');
console.log('╠══════════════════════════════════════════════════════════════════════╣');
console.log(`║  ✅ اجتاز:         ${String(passed).padEnd(4)}                                      ║`);
console.log(`║  ❌ فشل:          ${String(failed).padEnd(4)}                                      ║`);
console.log(`║  🧠 الخلايا:      ${String(supremeResult.summary.neuralCells).padEnd(4)} خلية عصبية نشطة                ║`);
console.log(`║  🤖 الوكلاء:      ${String(supremeResult.summary.agentsReady + '/' + supremeResult.summary.agentsTotal).padEnd(4)} جاهز                                  ║`);
console.log(`║  🏛️  أركان CS:    ${String(supremeResult.summary.csPillars).padEnd(4)} ركن علوم الحاسب               ║`);
console.log(`║  🌍 بيئات:        ${String(supremeResult.summary.environments).padEnd(4)} بيئة تشغيلية                 ║`);
console.log(`║  ⚖️  قوانين:       ${String(supremeResult.summary.neuralLaws).padEnd(4)} قانون شبكة عصبية               ║`);
console.log('╠══════════════════════════════════════════════════════════════════════╣');
console.log('║  «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»       ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log('');

if (failed > 0) {
    process.exit(1);
}

})().catch(err => {
    console.error('[TEST-FATAL]', err.message);
    console.error(err.stack);
    process.exit(1);
});
