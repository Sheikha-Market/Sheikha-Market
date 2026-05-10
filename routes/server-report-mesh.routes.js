'use strict';

const express = require('express');
const router = express.Router();
const reportMesh = require('../lib/sheikha-server-report-mesh');

router.get('/status', (_req, res) => {
    return res.status(200).json({
        success: true,
        data: reportMesh.getStatus(),
        message: 'شبكة تقارير السيرفرات الذكية — كتابة وقراءة وترحيل',
        timestamp: new Date().toISOString()
    });
});

router.get('/reports', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 20;
    return res.status(200).json({
        success: true,
        data: reportMesh.listReports(limit),
        timestamp: new Date().toISOString()
    });
});

router.get('/reports/:name', (req, res) => {
    const result = reportMesh.readReport(req.params.name);
    return res.status(result.success ? 200 : 404).json({
        success: result.success,
        data: result.data || null,
        message: result.message || 'تمت قراءة التقرير',
        timestamp: new Date().toISOString()
    });
});

router.post('/reports', (req, res) => {
    const result = reportMesh.writeReport(req.body || {});
    return res.status(result.success ? 201 : 400).json({
        success: result.success,
        data: result.data || null,
        message: result.success ? 'تم حفظ التقرير داخل شبكة السيرفرات الذكية' : 'فشل حفظ التقرير',
        timestamp: new Date().toISOString()
    });
});

router.post('/relay', async (req, res) => {
    try {
        const result = await reportMesh.relayReport(req.body || {});
        return res.status(result.success ? 200 : (result.status || 400)).json({
            success: result.success,
            data: result.data || null,
            message: result.success ? 'تم ترحيل التقرير إلى السيرفر الهدف' : 'فشل ترحيل التقرير',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
