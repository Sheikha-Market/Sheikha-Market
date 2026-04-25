'use strict';

const express = require('express');
const router = express.Router();
const neural = require('../lib/sheikha-unified-neural');

const ok = (res, data, message = 'نجح', code = 200) =>
    res.status(code).json({ success: true, data, message, timestamp: new Date().toISOString() });

const err = (res, message, code = 400) =>
    res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });

router.get('/', (_req, res) => {
    return ok(res, neural.getTopology(), 'طوبولوجيا الشبكة العصبية الموحدة');
});

router.post('/activate', (_req, res) => {
    return ok(res, neural.activate(), 'تم تفعيل الشبكة العصبية الموحدة');
});

router.get('/divine-refs', (_req, res) => {
    return ok(res, neural.getDivineRefs(), 'المراجع الشرعية للخلايا');
});

router.get('/cell/:id', (req, res) => {
    const cell = neural.getCell(req.params.id);
    if (!cell) {
        return err(res, 'الخلية غير موجودة', 404);
    }

    return ok(res, cell, 'تفاصيل الخلية');
});

router.get('/section/:name', (req, res) => {
    const section = neural.getSection(req.params.name);
    if (!section) {
        return err(res, 'القسم غير موجود', 404);
    }

    return ok(res, section, 'تفاصيل القسم');
});

router.post('/signal', (req, res) => {
    const { cellId } = req.body || {};
    if (!cellId) {
        return err(res, 'cellId مطلوب');
    }

    const result = neural.signal(cellId);
    if (!result) {
        return err(res, 'الخلية غير موجودة', 404);
    }

    return ok(res, result, 'تم إرسال الإشارة');
});

module.exports = router;