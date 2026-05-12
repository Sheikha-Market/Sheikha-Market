'use strict';

const express = require('express');
const router = express.Router();
const { cloudAgentClone, MAX_AGENTS, PRIMARY_AGENT_ID } = require('../core/sheikha-cloud-agent/cloud-agent-clone');

const ok = (res, data, message = 'نجح', code = 200) =>
    res.status(code).json({ success: true, data, message, timestamp: new Date().toISOString() });

const err = (res, message, code = 400) =>
    res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });

// POST /api/agent/clone
router.post('/clone', (req, res) => {
    const { targetCount = MAX_AGENTS } = req.body || {};
    const result = cloudAgentClone.clone(targetCount);
    return ok(res, result, 'تم استنساخ الوكلاء بنجاح');
});

// GET /api/agent/health
router.get('/health', (_req, res) => {
    return ok(res, {
        primaryAgent: PRIMARY_AGENT_ID,
        ...cloudAgentClone.getStats()
    }, 'حالة Sheikha Cloud Agent');
});

// GET /api/agent/stats
router.get('/stats', (_req, res) => {
    return ok(res, cloudAgentClone.getStats(), 'إحصائيات الوكلاء');
});

// GET /api/agent/registry
router.get('/registry', (_req, res) => {
    return ok(res, cloudAgentClone.listAgents(), 'سجل الوكلاء');
});

// GET /api/agent/list
router.get('/list', (_req, res) => {
    return ok(res, cloudAgentClone.listAgents(), 'قائمة الوكلاء');
});

// GET /api/agent/:id
router.get('/:id', (req, res) => {
    const agent = cloudAgentClone.getAgent(req.params.id);
    if (!agent) {
        return err(res, 'الوكيل غير موجود', 404);
    }
    return ok(res, agent, 'تفاصيل الوكيل');
});

// POST /api/agent/:id/activate
router.post('/:id/activate', (req, res) => {
    const agent = cloudAgentClone.setAgentStatus(req.params.id, 'active');
    if (!agent) {
        return err(res, 'الوكيل غير موجود', 404);
    }
    return ok(res, agent, 'تم تفعيل الوكيل');
});

// POST /api/agent/:id/deactivate
router.post('/:id/deactivate', (req, res) => {
    const agent = cloudAgentClone.setAgentStatus(req.params.id, 'inactive');
    if (!agent) {
        return err(res, 'الوكيل غير موجود', 404);
    }
    return ok(res, agent, 'تم إيقاف الوكيل');
});

// POST /api/agent/broadcast
router.post('/broadcast', (req, res) => {
    const { payload = {} } = req.body || {};
    const result = cloudAgentClone.broadcast(payload);
    return ok(res, result, 'تم بث الرسالة للوكلاء النشطين');
});

// POST /api/agent/reset
router.post('/reset', (_req, res) => {
    const result = cloudAgentClone.reset();
    return ok(res, result, 'تم إعادة الضبط إلى الوكيل الأساسي');
});

module.exports = router;
