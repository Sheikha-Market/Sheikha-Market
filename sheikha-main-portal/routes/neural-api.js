// بسم الله الرحمن الرحيم
/**
 * NEURAL API — مسارات الشبكة العصبية الجذرية
 * SNRN + SCNE + Halal Validator + Maqasid + Shariah Inference
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 *
 * ENDPOINTS:
 *   GET  /api/neural/status         — حالة الشبكة العصبية
 *   POST /api/neural/infer          — استدلال عصبي شرعي
 *   POST /api/neural/fatwa          — استنباط فتوى آلية
 *   POST /api/neural/validate       — تحقق شرعي شامل
 *   GET  /api/neural/maqasid        — خلايا المقاصد الشرعية
 *   POST /api/neural/maqasid/assess — تقييم معاملة من منظور المقاصد
 *   POST /api/neural/scne/process   — معالجة ذكية شاملة (SCNE)
 *   GET  /api/neural/cells          — معلومات الخلايا العصبية
 */

'use strict';

const express = require('express');
const router  = express.Router();

let snrn     = null;
let scne     = null;
let halal    = null;
let maqasid  = null;
let shariah  = null;

try { snrn    = require('../core/neural-root-network/snrn-engine');       } catch (_) {}
try { scne    = require('../core/scne/scne-core');                        } catch (_) {}
try { halal   = require('../core/neural-root-network/halal-validator');   } catch (_) {}
try { maqasid = require('../core/neural-root-network/maqasid-cells/index'); } catch (_) {}
try { shariah = require('../core/scne/shariah-inference');                } catch (_) {}

function ok(res, data)          { res.json({ success: true, ...data }); }
function er(res, msg, s)        { res.status(s || 400).json({ success: false, error: msg }); }
function wrap(fn) {
    return async (req, res) => { try { await fn(req, res); } catch (e) { er(res, e.message, 500); } };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => ok(res, {
    name: 'SNRN + SCNE — شبكة الخلايا الجذرية العصبية',
    description: 'الذكاء الاصطناعي الإسلامي المتجذّر في الكتاب والسنة',
    endpoints: {
        'GET  /api/neural/status':          'حالة الشبكة',
        'POST /api/neural/infer':           'استدلال عصبي { context }',
        'POST /api/neural/fatwa':           'فتوى آلية { question }',
        'POST /api/neural/validate':        'تحقق شرعي { ...tx }',
        'GET  /api/neural/maqasid':         'خلايا المقاصد',
        'POST /api/neural/maqasid/assess':  'تقييم { ...tx }',
        'POST /api/neural/scne/process':    'معالجة SCNE { type, payload }',
        'GET  /api/neural/cells':           'معلومات الخلايا',
    },
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /status
// ─────────────────────────────────────────────────────────────────────────────

router.get('/status', wrap((req, res) => {
    const snrnStatus = snrn ? snrn.status() : { ready: false };
    const scneStatus = scne ? scne.getStatus() : { ready: false };
    ok(res, { snrn: snrnStatus, scne: scneStatus, timestamp: new Date().toISOString() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /infer — استدلال عصبي
// ─────────────────────────────────────────────────────────────────────────────

router.post('/infer', wrap((req, res) => {
    if (!snrn) return er(res, 'الشبكة العصبية غير متوفرة', 503);
    if (!snrn.status().ready) snrn.init();
    const result = snrn.infer(req.body || {});
    ok(res, { inference: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /fatwa — فتوى آلية
// ─────────────────────────────────────────────────────────────────────────────

router.post('/fatwa', wrap((req, res) => {
    const { question, context } = req.body || {};
    if (!question) return er(res, 'question مطلوب');
    if (!shariah) return er(res, 'محرك الاستدلال الشرعي غير متوفر', 503);
    const result = shariah.fatwa(question, context || {});
    ok(res, {
        fatwa: result,
        disclaimer: 'هذه فتوى تمهيدية مُولَّدة آلياً — يُلزم مراجعة عالم شرعي متخصص قبل العمل بها',
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /validate — تحقق شرعي شامل
// ─────────────────────────────────────────────────────────────────────────────

router.post('/validate', wrap((req, res) => {
    if (!halal) return er(res, 'محقق الحلال غير متوفر', 503);
    const result = halal.validate(req.body || {});
    ok(res, { validation: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /maqasid
// ─────────────────────────────────────────────────────────────────────────────

router.get('/maqasid', wrap((req, res) => {
    if (!maqasid) return er(res, 'خلايا المقاصد غير متوفرة', 503);
    ok(res, { maqasid: maqasid.MAQASID });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /maqasid/assess
// ─────────────────────────────────────────────────────────────────────────────

router.post('/maqasid/assess', wrap((req, res) => {
    if (!maqasid) return er(res, 'خلايا المقاصد غير متوفرة', 503);
    const result = maqasid.assessByMaqasid(req.body || {});
    ok(res, { assessment: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /scne/process — معالجة SCNE
// ─────────────────────────────────────────────────────────────────────────────

router.post('/scne/process', wrap(async (req, res) => {
    const { type, payload, lang } = req.body || {};
    if (!type) return er(res, 'type مطلوب — TRANSACTION | FATWA | CURRENCY | MARKET | ZAKAT | WAQF');
    if (!scne)  return er(res, 'SCNE غير متوفر', 503);
    if (!scne.getStatus().ready) scne.init();
    const result = await scne.process(type, payload || {}, lang || 'ar');
    ok(res, { result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /cells
// ─────────────────────────────────────────────────────────────────────────────

router.get('/cells', wrap((req, res) => {
    if (!snrn) return er(res, 'الشبكة العصبية غير متوفرة', 503);
    ok(res, {
        quranCells:   snrn.QURAN_CELLS,
        sunnahCells:  snrn.SUNNAH_CELLS,
        maqasidCells: snrn.MAQASID_CELLS,
        supremeCell:  snrn.SUPREME_CELL,
        total: snrn.QURAN_CELLS.length + snrn.SUNNAH_CELLS.length + snrn.MAQASID_CELLS.length + 1,
    });
}));

module.exports = router;
