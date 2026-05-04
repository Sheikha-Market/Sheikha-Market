// بسم الله الرحمن الرحيم
/**
 * DID API — مسارات الهوية الجذرية الموزعة
 * did:sheikha — هوية إسلامية سيادية
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 *
 * ENDPOINTS:
 *   GET  /api/did                     — دليل
 *   POST /api/did/create              — إنشاء DID جديد
 *   GET  /api/did/resolve/:did        — استعلام DID
 *   POST /api/did/upgrade             — ترقية مستوى التحقق
 *   POST /api/did/sign                — توقيع بيانات
 *   POST /api/did/verify              — التحقق من توقيع
 *   GET  /api/did/stats               — إحصائيات السجل
 *   POST /api/did/deactivate          — إلغاء هوية
 *   GET  /api/did/search              — بحث
 */

'use strict';

const express = require('express');
const router  = express.Router();

let didGen  = null;
let keyMgr  = null;
let idReg   = null;
let sovRoot = null;

try { didGen  = require('../core/sheikha-did/did-generator');      } catch (_) {}
try { keyMgr  = require('../core/sheikha-did/key-manager');        } catch (_) {}
try { idReg   = require('../core/sheikha-did/identity-registry');  } catch (_) {}
try { sovRoot = require('../core/sovereign-root/sheikha-sovereign-root'); } catch (_) {}

function ok(res, data)     { res.json({ success: true, ...data }); }
function er(res, msg, s)   { res.status(s || 400).json({ success: false, error: msg }); }
function wrap(fn) {
    return async (req, res) => { try { await fn(req, res); } catch (e) { er(res, e.message, 500); } };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => ok(res, {
    name: 'Sheikha DID — الهوية الجذرية الموزعة',
    method: 'did:sheikha',
    levels: { L0: 'أساسية', L1: 'موثقة KYC', L2: 'مؤسسية', L3: 'شرعية' },
    endpoints: {
        'POST /api/did/create':           'إنشاء DID { type, name, meta? }',
        'GET  /api/did/resolve/:did':     'استعلام DID',
        'POST /api/did/upgrade':          'ترقية { did, newLevel, evidence }',
        'POST /api/did/sign':             'توقيع { privateKey, data }',
        'POST /api/did/verify':           'تحقق { publicKey, data, signature }',
        'GET  /api/did/stats':            'إحصائيات',
        'POST /api/did/deactivate':       'إلغاء { did, reason }',
        'GET  /api/did/search?q=':        'بحث',
    },
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /create
// ─────────────────────────────────────────────────────────────────────────────

router.post('/create', wrap((req, res) => {
    const { type, name, meta } = req.body || {};
    if (!type || !name) return er(res, 'type + name مطلوبان');
    if (!['individual', 'company', 'market', 'agent'].includes(type)) {
        return er(res, 'type يجب أن يكون: individual | company | market | agent');
    }
    if (!didGen) return er(res, 'مولّد DID غير متوفر', 503);

    const result = didGen.createDID(type, name, meta || {});

    // تسجيل في السجل
    if (idReg) {
        try { idReg.register(result.document); } catch (_) {}
    }

    // ختم سيادي
    let sovereignSeal = null;
    if (sovRoot) {
        try {
            if (!sovRoot.getPublicKey()) sovRoot.init();
            sovereignSeal = sovRoot.sealTransaction({ id: result.did, type: 'DID_CREATE' });
        } catch (_) {}
    }

    ok(res, {
        did:          result.did,
        document:     result.document,
        fingerprint:  result.fingerprint,
        privateKey:   result.keys.privateKey,  // يُسلَّم للمستخدم مرة واحدة فقط
        warning:      'احتفظ بمفتاحك الخاص بأمان — لن يُعاد إرساله',
        sovereignSeal,
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /resolve/:did
// ─────────────────────────────────────────────────────────────────────────────

router.get('/resolve/:did', wrap((req, res) => {
    const did = decodeURIComponent(req.params.did);
    if (!didGen || !didGen.isValidDID(did)) return er(res, 'DID غير صالح', 400);
    if (!idReg) return er(res, 'سجل الهويات غير متوفر', 503);
    const record = idReg.resolve(did);
    if (!record) return er(res, 'DID غير مسجل', 404);
    ok(res, { did, record });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /upgrade
// ─────────────────────────────────────────────────────────────────────────────

router.post('/upgrade', wrap((req, res) => {
    const { did, newLevel, evidence } = req.body || {};
    if (!did || !newLevel) return er(res, 'did + newLevel مطلوبان');
    if (!idReg) return er(res, 'سجل الهويات غير متوفر', 503);
    const record = idReg.upgradeLevel(did, newLevel, evidence || {});
    ok(res, { record, message: `تم ترقية الهوية إلى مستوى ${newLevel}` });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /sign
// ─────────────────────────────────────────────────────────────────────────────

router.post('/sign', wrap((req, res) => {
    const { privateKey, data } = req.body || {};
    if (!privateKey || !data) return er(res, 'privateKey + data مطلوبان');
    if (!didGen) return er(res, 'مولّد DID غير متوفر', 503);
    const signature = didGen.signWithDID(privateKey, data);
    ok(res, { signature, algorithm: 'ECDSA-SHA256', signedAt: new Date().toISOString() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /verify
// ─────────────────────────────────────────────────────────────────────────────

router.post('/verify', wrap((req, res) => {
    const { publicKey, data, signature } = req.body || {};
    if (!publicKey || !data || !signature) return er(res, 'publicKey + data + signature مطلوبة');
    if (!didGen) return er(res, 'مولّد DID غير متوفر', 503);
    const valid = didGen.verifyDIDSignature(publicKey, data, signature);
    ok(res, { valid, message: valid ? 'التوقيع صحيح ✅' : 'التوقيع غير صحيح ❌' });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /stats
// ─────────────────────────────────────────────────────────────────────────────

router.get('/stats', wrap((req, res) => {
    if (!idReg) return er(res, 'سجل الهويات غير متوفر', 503);
    ok(res, { stats: idReg.getStats() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /deactivate
// ─────────────────────────────────────────────────────────────────────────────

router.post('/deactivate', wrap((req, res) => {
    const { did, reason } = req.body || {};
    if (!did) return er(res, 'did مطلوب');
    if (!idReg) return er(res, 'سجل الهويات غير متوفر', 503);
    const record = idReg.deactivate(did, reason);
    ok(res, { record, message: 'تم إلغاء تفعيل الهوية' });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /search
// ─────────────────────────────────────────────────────────────────────────────

router.get('/search', wrap((req, res) => {
    const q = req.query.q || '';
    if (!idReg) return er(res, 'سجل الهويات غير متوفر', 503);
    const results = idReg.search(q);
    ok(res, { results, total: results.length, query: q });
}));

module.exports = router;
