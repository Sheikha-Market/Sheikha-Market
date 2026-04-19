// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⛓️🧠 NEURAL BLOCKCHAIN API ROUTES
 * مسارات API — شبكة شيخة العصبية البلوكشين (الجيل الجديد)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  GET  /api/blockchain/status           — حالة السلسلة والشبكة
 *  GET  /api/blockchain/chain            — عرض السلسلة (مُبسَّط)
 *  GET  /api/blockchain/chain/:index     — كتلة محددة
 *  GET  /api/blockchain/latest           — آخر كتلة
 *  GET  /api/blockchain/validate         — التحقق من سلامة السلسلة
 *  GET  /api/blockchain/stats            — إحصاءات الشبكة
 *  GET  /api/blockchain/mempool          — المعاملات في الانتظار
 *  POST /api/blockchain/tx/submit        — إرسال معاملة
 *  POST /api/blockchain/mine             — تعدين كتلة
 *  GET  /api/blockchain/tx/:txId         — البحث عن معاملة
 *  GET  /api/blockchain/proof/:block/:tx — إثبات ميركل
 *  POST /api/blockchain/contract/deploy  — نشر عقد ذكي إسلامي
 *  GET  /api/blockchain/contract/types   — أنواع العقود الشرعية
 *  GET  /api/blockchain/contract/list    — قائمة العقود المنشورة
 *  POST /api/blockchain/zakat/calculate  — احتساب الزكاة
 *  POST /api/blockchain/shariah/check    — فحص شرعي لمعاملة
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

let blockchain      = null;
let ShariahFilter   = null;
let ZakatEngine     = null;
let IslamicSmartContract = null;

try {
    const mod = require('../lib/sheikha-neural-blockchain');
    blockchain           = mod.neuralBlockchain;
    ShariahFilter        = mod.ShariahFilter;
    ZakatEngine          = mod.ZakatEngine;
    IslamicSmartContract = mod.IslamicSmartContract;
} catch (e) {
    console.warn('[BLOCKCHAIN-ROUTES] ⚠️ Neural Blockchain غير متوفر:', e.message);
}

function notAvailable(res) {
    return res.status(503).json({ success: false, error: 'Neural Blockchain غير متوفر' });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل المسارات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    res.json({
        success: true,
        nameAr:  'شبكة شيخة العصبية البلوكشين — الجيل الجديد',
        nameEn:  'Sheikha Neural Blockchain — New Generation',
        version: '2.0.0',
        quranRef:'"إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ" — البقرة: 282',
        architecture: {
            layer0: 'Shariah Filter   — فلتر شرعي تلقائي لكل معاملة',
            layer1: 'Merkle Tree      — SHA-256 Merkle Tree',
            layer2: 'Neural Validator — Proof-of-Neural [8→24→16→8→1]',
            layer3: 'Block Chain      — سلسلة الكتل المتسلسلة',
            layer4: 'Smart Contracts  — 6 أنواع عقود إسلامية (مضاربة، مرابحة، إجارة، سلم، استصناع، وكالة)',
            layer5: 'Zakat Engine     — محرك الزكاة التلقائي'
        },
        endpoints: {
            'GET  /api/blockchain/status':              'حالة السلسلة والشبكة',
            'GET  /api/blockchain/chain':               'عرض السلسلة',
            'GET  /api/blockchain/chain/:index':        'كتلة محددة',
            'GET  /api/blockchain/latest':              'آخر كتلة',
            'GET  /api/blockchain/validate':            'التحقق من سلامة السلسلة',
            'GET  /api/blockchain/stats':               'إحصاءات الشبكة',
            'GET  /api/blockchain/mempool':             'المعاملات في الانتظار',
            'POST /api/blockchain/tx/submit':           'إرسال معاملة',
            'POST /api/blockchain/mine':                'تعدين كتلة',
            'GET  /api/blockchain/tx/:txId':            'البحث عن معاملة',
            'GET  /api/blockchain/proof/:block/:tx':    'إثبات ميركل (Merkle Proof)',
            'POST /api/blockchain/contract/deploy':     'نشر عقد ذكي إسلامي',
            'GET  /api/blockchain/contract/types':      'أنواع العقود الشرعية',
            'GET  /api/blockchain/contract/list':       'قائمة العقود المنشورة',
            'POST /api/blockchain/zakat/calculate':     'احتساب الزكاة',
            'POST /api/blockchain/shariah/check':       'فحص شرعي لمعاملة'
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /status — حالة السلسلة الكاملة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/status', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        res.json({ success: true, data: blockchain.getStatus() });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /stats — إحصاءات الشبكة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        res.json({ success: true, data: blockchain.getNetworkStats() });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /chain — عرض السلسلة (ملخص)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/chain', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const page    = Math.max(0, parseInt(req.query.page  || 0));
        const perPage = Math.min(50, parseInt(req.query.per  || 10));
        const start   = page * perPage;
        const blocks  = blockchain.chain.slice(start, start + perPage).map(b => b.toJSON());
        res.json({
            success:     true,
            chainLength: blockchain.getChainLength(),
            page,
            perPage,
            blocks
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /chain/:index — كتلة محددة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/chain/:index', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const idx   = parseInt(req.params.index);
        const block = blockchain.getBlock(idx);
        if (!block) return res.status(404).json({ success: false, error: `الكتلة ${idx} غير موجودة` });
        const full = req.query.full === 'true';
        res.json({
            success: true,
            data: full ? block : block.toJSON()
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /latest — آخر كتلة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/latest', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        res.json({ success: true, data: blockchain.getLatestBlock().toJSON() });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /validate — التحقق من سلامة السلسلة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/validate', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const result = blockchain.validateChain();
        res.json({ success: true, data: result });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /mempool — المعاملات في الانتظار
// ─────────────────────────────────────────────────────────────────────────────

router.get('/mempool', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const pool = blockchain.getMempool();
        res.json({ success: true, count: pool.length, data: pool.slice(0, 50) });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /tx/submit — إرسال معاملة
// Body: { id, type, category, description, from, to, amount, ... }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/tx/submit', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ success: false, error: 'body المعاملة مطلوب' });
        }
        const result = blockchain.submitTransaction(req.body);
        const status = result.success ? 200 : 422;
        res.status(status).json(result);
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /mine — تعدين كتلة جديدة
// Body: { maxTx: 100 }  (اختياري)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/mine', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const maxTx  = parseInt((req.body && req.body.maxTx) || 100);
        const result = blockchain.mineBlock(maxTx);
        res.json(result);
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /tx/:txId — البحث عن معاملة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/tx/:txId', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const result = blockchain.searchTransaction(req.params.txId);
        if (!result.found) return res.status(404).json({ success: false, ...result });
        res.json({ success: true, data: result });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /proof/:blockIndex/:txId — إثبات ميركل
// ─────────────────────────────────────────────────────────────────────────────

router.get('/proof/:blockIndex/:txId', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const blockIndex = parseInt(req.params.blockIndex);
        const result     = blockchain.getMerkleProof(blockIndex, req.params.txId);
        if (!result.success) return res.status(404).json(result);
        res.json({ success: true, data: result });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /contract/deploy — نشر عقد ذكي إسلامي
// Body: { type: 'mudaraba'|'murabaha'|'ijara'|'salam'|'istisna'|'wakala', ...params }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/contract/deploy', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const { type, ...params } = req.body || {};
        if (!type) return res.status(400).json({ success: false, error: 'نوع العقد (type) مطلوب' });
        const result = blockchain.deployContract(type, params);
        const status = result.success ? 200 : 422;
        res.status(status).json(result);
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /contract/types — أنواع العقود الشرعية
// ─────────────────────────────────────────────────────────────────────────────

router.get('/contract/types', (req, res) => {
    try {
        if (!IslamicSmartContract) return notAvailable(res);
        res.json({ success: true, data: IslamicSmartContract.getTypes() });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /contract/list — قائمة العقود المنشورة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/contract/list', (req, res) => {
    try {
        if (!blockchain) return notAvailable(res);
        const type      = req.query.type || null;
        const contracts = blockchain.getContracts(type);
        res.json({ success: true, count: contracts.length, data: contracts });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /zakat/calculate — احتساب الزكاة
// Body: { transactions: [...] } أو معاملة واحدة { amount, zakatType, ... }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/zakat/calculate', (req, res) => {
    try {
        if (!ZakatEngine) return notAvailable(res);
        const body = req.body || {};
        let result;
        if (Array.isArray(body.transactions)) {
            result = ZakatEngine.calculateBatch(body.transactions);
        } else {
            result = ZakatEngine.calculate(body);
        }
        res.json({ success: true, data: result });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /shariah/check — فحص شرعي لمعاملة أو مجموعة
// Body: معاملة واحدة أو { transactions: [...] }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/shariah/check', (req, res) => {
    try {
        if (!ShariahFilter) return notAvailable(res);
        const body = req.body || {};
        let result;
        if (Array.isArray(body.transactions)) {
            result = ShariahFilter.checkBatch(body.transactions);
        } else {
            result = ShariahFilter.check(body);
        }
        res.json({ success: true, data: result });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
