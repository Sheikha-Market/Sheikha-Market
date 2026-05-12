const express = require('express');
const SheikhaFinanceEngine = require('../lib/sheikha-finance-engine');

const router = express.Router();
const financeEngine = new SheikhaFinanceEngine();

function sendSuccess(res, data, message) {
    return res.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });
}

function sendError(res, statusCode, message) {
    return res.status(statusCode).json({
        success: false,
        data: null,
        message,
        timestamp: new Date().toISOString()
    });
}

router.get('/status', (req, res) => {
    return sendSuccess(
        res,
        {
            service: 'sheikha-finance-core',
            summary: financeEngine.getSummary(),
            endpoints: [
                'GET /api/finance/status',
                'GET /api/finance/summary',
                'GET /api/finance/rates',
                'GET /api/finance/sales?limit=25',
                'POST /api/finance/sales',
                'GET /api/finance/analytics/trading',
                'POST /api/finance/backups',
                'GET /api/finance/backups',
                'POST /api/finance/restore'
            ]
        },
        'تم تحميل حالة منظومة التمويل'
    );
});

router.get('/summary', (req, res) => {
    return sendSuccess(res, financeEngine.getSummary(), 'تم تحميل الملخص المالي');
});

router.get('/rates', (req, res) => {
    return sendSuccess(res, financeEngine.getRates(), 'تم تحميل أسعار العملات');
});

router.get('/sales', (req, res) => {
    return sendSuccess(res, financeEngine.listSales(req.query.limit), 'تم تحميل سجل العقود');
});

router.post('/sales', (req, res) => {
    try {
        const result = financeEngine.executeSale(req.body || {});
        return res.status(201).json({
            success: true,
            data: result,
            message: 'تم تنفيذ العقد وتوزيع التدفقات بنجاح',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return sendError(res, 400, error.message || 'تعذر تنفيذ العقد');
    }
});

router.get('/analytics/trading', (req, res) => {
    return sendSuccess(res, financeEngine.getTradingAnalytics(), 'تم تحميل تحليلات التداول');
});

router.get('/backups', (req, res) => {
    return sendSuccess(res, { backups: financeEngine.listBackups() }, 'تم تحميل النسخ الاحتياطية');
});

router.post('/backups', (req, res) => {
    try {
        const label = req.body && req.body.label ? req.body.label : 'api';
        return res.status(201).json({
            success: true,
            data: financeEngine.createBackup(label),
            message: 'تم إنشاء نسخة احتياطية محلية',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return sendError(res, 500, error.message || 'تعذر إنشاء النسخة الاحتياطية');
    }
});

router.post('/restore', (req, res) => {
    try {
        const fileName = req.body && req.body.fileName;
        return sendSuccess(
            res,
            financeEngine.restoreBackup(fileName),
            'تمت استعادة النسخة الاحتياطية'
        );
    } catch (error) {
        return sendError(res, 400, error.message || 'تعذرت الاستعادة');
    }
});

module.exports = router;
