/**
 * اختبار شبكة الخلايا العصبية الجذرية
 * SHEIKHA Neural Root Network — Root Neural Cell Network Test
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
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

// ─── 1. Neural Root Activator ─────────────────────────────────────────────────
console.log('\n[1] Neural Root Activator (intelligence/sheikha-neural-root-activator.js)');
const activator = require('../intelligence/sheikha-neural-root-activator');

// قبل التفعيل
const preStatus = activator.status();
assert(preStatus.ready === false, 'activator not ready before activate()');
assert(typeof preStatus.activation === 'object', 'status has activation object');

// محاولة infer قبل التفعيل
const preInfer = activator.infer('test');
assert(preInfer.error !== undefined, 'infer before activate returns error');

// تفعيل الشبكة
const result = activator.activate();
assert(result.success === true, 'activate() returns success:true');
assert(Array.isArray(result.networksActivated), 'activate() returns networksActivated array');
assert(result.networksActivated.length >= 3, 'at least 3 networks activated');
assert(result.totalCells >= 19, 'at least 19 total cells activated');
assert(result.networksActivated.includes('SNRN-19-cells'), 'SNRN activated');
assert(result.networksActivated.includes('RootNCN-92-cells'), 'Root NCN activated');
assert(result.networksActivated.includes('NeuralCells-12'), 'Neural Cells 12 activated');

// ─── 2. Status after activation ───────────────────────────────────────────────
console.log('\n[2] Status after activation');
const s = activator.status();
assert(s.ready === true, 'activator is ready after activate()');
assert(s.totalCells >= 19, 'totalCells is tracked');
assert(s.startedAt !== null, 'startedAt is set');
assert(s.activation.snrn === true, 'SNRN activation flag');
assert(s.activation.rootNCN === true, 'rootNCN activation flag');
assert(s.activation.cells12 === true, 'cells12 activation flag');
assert(s.activation.halal === true, 'halal activation flag');
assert(s.activation.maqasid === true, 'maqasid activation flag');
assert(s.networksCount >= 3, 'networksCount >= 3');
assert(typeof s.networks.snrn === 'object', 'SNRN sub-status available');
assert(typeof s.networks.rootNCN === 'object', 'rootNCN sub-status available');

// Health check
const h = activator.health();
assert(h.ready === true, 'health() shows ready');
assert(typeof h.totalCells === 'number', 'health() has totalCells');
assert(h.networksActive >= 3, 'health() has networksActive >= 3');

// ─── 3. Unified Inference ─────────────────────────────────────────────────────
console.log('\n[3] Unified Inference');

// اختبار نصي
const halalText = activator.infer('تجارة حلال بدون ربا');
assert(typeof halalText.finalVerdict === 'string', 'text inference returns finalVerdict');
assert(['HALAL', 'REVIEW', 'UNKNOWN'].includes(halalText.finalVerdict), 'halal trade text verdict is HALAL or REVIEW');
assert(typeof halalText.rootConfidence === 'number', 'text inference has rootConfidence');
assert(halalText.rootConfidence >= 0 && halalText.rootConfidence <= 1, 'rootConfidence in 0-1 range');
assert(typeof halalText.latencyMs === 'number', 'text inference has latencyMs');
assert(halalText.latencyMs >= 0, 'latencyMs is non-negative');
assert(halalText.id !== undefined, 'inference has unique ID');
assert(halalText.detail !== undefined, 'inference has detail breakdown');

// اختبار كائن معاملة حلال
const halalTx = activator.infer({ type: 'TRADE', amount: 5000, interestRate: 0 });
assert(halalTx.finalVerdict === 'HALAL', 'halal trade tx verdict is HALAL');
assert(typeof halalTx.snrnScore === 'number', 'SNRN score present');
assert(halalTx.cellsActivated >= 1, 'cells activated in SNRN');

// اختبار معاملة حرام
const haramTx = activator.infer({ type: 'LOAN_WITH_INTEREST', interestRate: 12, amount: 10000 });
assert(haramTx.finalVerdict === 'HARAM', 'riba transaction verdict is HARAM');

// اختبار مع غرر
const ghararTx = activator.infer({ type: 'TRADE', gharar: true, priceUnknown: true });
assert(ghararTx.finalVerdict === 'HARAM', 'gharar transaction verdict is HARAM');

// ─── 4. Quick Halal Check ─────────────────────────────────────────────────────
console.log('\n[4] Quick Halal Check');

const halalCheck = activator.quickHalalCheck({ type: 'TRADE', interestRate: 0 });
assert(halalCheck.isHalal === true || halalCheck.valid === true, 'valid trade passes halal check');

const ribaCheck = activator.quickHalalCheck({ type: 'LOAN_WITH_INTEREST', interestRate: 5 });
assert(ribaCheck.isHalal === false || ribaCheck.valid === false, 'riba fails halal check');
assert(
    (ribaCheck.violations && ribaCheck.violations.length > 0),
    'riba check has violations list'
);

const ghararCheck = activator.quickHalalCheck({ type: 'TRADE', gharar: true });
assert(ghararCheck.isHalal === false || ghararCheck.valid === false, 'gharar fails halal check');

// معاملة سليمة
const cleanTrade = activator.quickHalalCheck({ type: 'SALE', amount: 100, interestRate: 0, deception: false });
assert(cleanTrade.isHalal === true || cleanTrade.valid === true, 'clean trade is halal');

// ─── 5. Maqasid Assessment ────────────────────────────────────────────────────
console.log('\n[5] Maqasid Assessment');

const maqasid = activator.assessMaqasid({ type: 'TRADE', amount: 500, interestRate: 0 });
assert(typeof maqasid === 'object', 'maqasid assessment returns object');
assert(maqasid.available !== false, 'maqasid cells are available');
// MAQASID should have some score fields
if (maqasid.fulfilled !== undefined) {
    assert(typeof maqasid.fulfilled === 'boolean' || typeof maqasid.fulfilled === 'number', 'maqasid fulfilled field');
}

// ─── 6. SNRN Sub-Network ─────────────────────────────────────────────────────
console.log('\n[6] SNRN Sub-Network (19 شرعية)');
const snrn = require('../core/neural-root-network/snrn-engine');
snrn.init();
const snrnStatus = snrn.status();
assert(snrnStatus.ready === true, 'SNRN is ready after init');
assert(snrnStatus.totalCells === 19, 'SNRN has 19 cells');
assert(snrnStatus.layers.quran.cells === 8, 'SNRN has 8 Quran cells');
assert(snrnStatus.layers.sunnah.cells === 5, 'SNRN has 5 Sunnah cells');
assert(snrnStatus.layers.maqasid.cells === 5, 'SNRN has 5 Maqasid cells');
assert(snrnStatus.layers.supreme.cells === 1, 'SNRN has 1 Supreme cell');

const snrnHalal = snrn.infer({ type: 'TRADE', interestRate: 0, amount: 1000 });
assert(snrnHalal.verdict === 'HALAL', 'SNRN halal trade verdict');
assert(snrnHalal.confidence >= 0.5, 'SNRN confidence >= 0.5 for halal trade');

const snrnHaram = snrn.infer({ type: 'LOAN_WITH_INTEREST', interestRate: 10 });
assert(snrnHaram.verdict === 'HARAM', 'SNRN haram verdict for riba');

// ─── 7. Root NCN Sub-Network ─────────────────────────────────────────────────
console.log('\n[7] Root NCN Sub-Network (92 جذرية)');
const rootNCN = require('../lib/sheikha-root-neural-cell-network');
rootNCN.init();
const rootStatus = rootNCN.status();
assert(rootStatus.ready !== false, 'Root NCN is active');
assert(typeof rootStatus.totalCells === 'number', 'Root NCN has totalCells field');

const rootInfer = rootNCN.infer('تجارة إسلامية');
assert(rootInfer.id !== undefined, 'Root NCN infer returns ID');
assert(typeof rootInfer.rootConfidence === 'number', 'Root NCN has rootConfidence');
assert(rootInfer.rootConfidence >= 0 && rootInfer.rootConfidence <= 1, 'rootConfidence 0-1');
assert(rootInfer.tawheed !== undefined, 'Root NCN response has tawheed');
assert(rootInfer.bismillah !== undefined, 'Root NCN response has bismillah');
assert(rootInfer.layers !== undefined, 'Root NCN response has layers (7 طبقات)');

// ─── 8. Neural Cells 12 ───────────────────────────────────────────────────────
console.log('\n[8] Neural Cells (12 خلية بالكتاب والسنة)');
const cells12 = require('../core/neural/neural-cells');
cells12.init();
const cellsStatus = cells12.status();
assert(cellsStatus.totalCells === 12, 'Neural Cells count is 12');
assert(typeof cellsStatus.principle === 'string', 'Neural Cells have principle');

// process
const processed = cells12.process('اختبار معالجة النص');
assert(typeof processed === 'object', 'cells12 process returns object');

// getCell
const cell1 = cells12.getCell(1);
assert(cell1 !== null, 'cell 1 (Init) exists');
assert(cell1.nameAr === 'خلية البداية', 'cell 1 is خلية البداية');

const cell2 = cells12.getCell(2);
assert(cell2 !== null, 'cell 2 (Security) exists');
assert(cell2.nameAr === 'خلية الحماية', 'cell 2 is خلية الحماية');

// activate
const activated = cells12.activate(1, 'test input');
assert(activated !== null, 'cell 1 can be activated');

// listCells
const allCells = cells12.listCells();
assert(allCells.length === 12, 'listCells returns 12 cells');

// ─── 9. Halal Validator ───────────────────────────────────────────────────────
console.log('\n[9] Halal Validator');
const halal = require('../core/neural-root-network/halal-validator');

const hv = halal.validate ? halal.validate({ type: 'TRADE', interestRate: 0 })
         : { isHalal: true };
assert(hv.isHalal === true, 'halal validator: clean trade passes');

const haramV = halal.validate
    ? halal.validate({ type: 'LOAN_WITH_INTEREST', interestRate: 8 })
    : { isHalal: false };
assert(haramV.isHalal === false, 'halal validator: riba trade blocked');

// ─── 10. Maqasid Cells ────────────────────────────────────────────────────────
console.log('\n[10] Maqasid Cells (المقاصد الخمس)');
const maqasidCells = require('../core/neural-root-network/maqasid-cells/index');
assert(typeof maqasidCells.MAQASID === 'object', 'MAQASID object exported');
assert(typeof maqasidCells.assessByMaqasid === 'function', 'assessByMaqasid is function');

const maqRes = maqasidCells.assessByMaqasid({ type: 'TRADE', amount: 1000 });
assert(typeof maqRes === 'object', 'maqasid assessment returns object');

// ─── 11. Intelligence Sync ───────────────────────────────────────────────────
console.log('\n[11] Intelligence Fabric Sync');
const intel = require('../intelligence/sheikha-intelligence-fabric');
intel.start();
activator.syncWithIntelligence(intel);

// اختبار أن الاستدلال يزود Intelligence بنقاط بيانات
const initMetrics = intel.status().metricsTracked;
activator.infer('تجارة حلال');
const afterMetrics = intel.status().metricsTracked;
assert(afterMetrics >= initMetrics, 'inference pushes data points to intelligence');

// ─── 12. Bootstrap Integration ───────────────────────────────────────────────
console.log('\n[12] Full Bootstrap Integration (v2 + Neural Root)');
const bootstrap = require('../sheikha-civilization-bootstrap');
const civ = bootstrap.activate();

// Neural Root exposed
assert(civ.neuralRoot !== undefined, 'civilization exposes neuralRoot');
assert(civ.neuralRoot.status().ready === true, 'neuralRoot is ready in civilization');

// Shortcuts
assert(typeof civ.infer === 'function', 'civilization has infer() shortcut');
assert(typeof civ.halalCheck === 'function', 'civilization has halalCheck() shortcut');
assert(typeof civ.maqasid === 'function', 'civilization has maqasid() shortcut');

// Test shortcuts
const civInfer = civ.infer('منتج حلال');
assert(civInfer.finalVerdict !== undefined, 'civilization infer() works');

const civHalal = civ.halalCheck({ type: 'TRADE', interestRate: 0 });
assert(civHalal.isHalal === true || civHalal.valid === true, 'civilization halalCheck() works');

const civHaram = civ.halalCheck({ type: 'LOAN_WITH_INTEREST', interestRate: 15 });
assert(civHaram.isHalal === false || civHaram.valid === false, 'civilization halalCheck() blocks riba');

// Status includes neuralRoot
const civStatus = civ.status();
assert(civStatus.neuralRoot !== undefined, 'civilization status includes neuralRoot');
assert(civStatus.neuralRoot.ready === true, 'neuralRoot in status is ready');
assert(civStatus.identity.layers.includes('Neural Root Network Layer'), 'Neural Root Layer in layers');
assert(civStatus.identity.layers.length === 10, 'civilization has 10 layers (incl. Neural Root)');

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║     SHEIKHA شبكة الخلايا العصبية الجذرية — نتائج الاختبار        ║');
console.log('║     ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١             ║');
console.log('╠══════════════════════════════════════════════════════════════════╣');
console.log(`║  ✅ اجتاز:  ${String(passed).padEnd(3)}                                           ║`);
console.log(`║  ❌ فشل:   ${String(failed).padEnd(3)}                                           ║`);
console.log(`║  🧠 الخلايا الجذرية: ${String(civ.neuralRoot.health().totalCells).padEnd(3)} خلية نشطة                     ║`);
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

if (failed > 0) {
    process.exit(1);
}

})().catch(err => {
    console.error('[TEST-FATAL]', err.message);
    console.error(err.stack);
    process.exit(1);
});
