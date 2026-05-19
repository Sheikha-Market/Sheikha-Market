'use strict';

const express = require('express');
const rootNeuralNetwork = require('../lib/sheikha-root-neural-network');

const router = express.Router();

function sendSuccess(res, data, message) {
    return res.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });
}

function sendError(res, status, message, details) {
    return res.status(status).json({
        success: false,
        data: details || null,
        message,
        timestamp: new Date().toISOString()
    });
}

function toNumericArray(input, fallback) {
    if (!Array.isArray(input)) {
        return fallback;
    }

    return input.map((value, index) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback[index] || 0;
    });
}

async function ensureNetworkReady() {
    return rootNeuralNetwork.ensureBooted();
}

router.get('/status', async (req, res) => {
    try {
        const network = await ensureNetworkReady();
        return sendSuccess(res, network.getStatus(), 'تم تفعيل حالة الشبكة العصبية الجذرية');
    } catch (error) {
        return sendError(res, 503, 'تعذر تحميل حالة الشبكة العصبية الجذرية', { error: error.message });
    }
});

router.get('/health', async (req, res) => {
    try {
        const network = await ensureNetworkReady();
        const status = network.getStatus();
        return sendSuccess(res, {
            status: status.status,
            bootTimeMs: status.bootTimeMs,
            totalCells: status.architecture.totalCells,
            uptime: status.uptime,
            iflLinked: network.iflLinked === true
        }, 'الشبكة العصبية الجذرية سليمة');
    } catch (error) {
        return sendError(res, 503, 'الشبكة العصبية الجذرية غير جاهزة', { error: error.message });
    }
});

router.post('/activate', async (req, res) => {
    try {
        const network = await ensureNetworkReady();
        return sendSuccess(res, {
            ready: network.status === 'active',
            status: network.status,
            totalCells: network.getStatus().architecture.totalCells
        }, 'تم تفعيل الشبكة العصبية الجذرية بنجاح');
    } catch (error) {
        return sendError(res, 503, 'تعذر تفعيل الشبكة العصبية الجذرية', { error: error.message });
    }
});

router.post('/infer', async (req, res) => {
    try {
        const network = await ensureNetworkReady();
        const result = network.orchestrate(req.body || {});
        return sendSuccess(res, result, 'تم تنفيذ الاستدلال العصبي الجذري');
    } catch (error) {
        return sendError(res, 400, 'فشل الاستدلال العصبي الجذري', { error: error.message });
    }
});

router.post('/halal', async (req, res) => {
    try {
        const network = await ensureNetworkReady();
        const context = req.body && typeof req.body.context === 'object' ? req.body.context : req.body || {};
        const features = toNumericArray(
            req.body?.features,
            [0, 0, 0, 0, 0, 1, 1, 1]
        );

        const sharia = network.shariaCheck(features);
        const governance = network.iflGovernanceCheck(context);

        return sendSuccess(res, {
            sharia,
            governance,
            isHalal: sharia.allowed && governance.approved
        }, 'تم تنفيذ الفحص الشرعي والسيادي');
    } catch (error) {
        return sendError(res, 400, 'فشل الفحص الشرعي والسيادي', { error: error.message });
    }
});

module.exports = router;
