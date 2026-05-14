'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const Organization = require('../models/Organization');
const { authenticate, authorize } = require('../middleware/auth');
const neuralCells = require('../core/neural/neural-cells');

let enterpriseIntegrationEngine = null;
const activationRuns = new Map();
const MAX_ACTIVATION_RUNS = 200;

function getEnterpriseEngine() {
    if (!enterpriseIntegrationEngine) {
        const Engine = require('../lib/sheikha-enterprise-integration');
        enterpriseIntegrationEngine = new Engine();
    }
    return enterpriseIntegrationEngine;
}

function getUnifiedStatus() {
    const enterpriseStatusRaw = getEnterpriseEngine().getStatus();
    const organizations = Organization.find();
    const activeOrganizations = organizations.filter(org => org.status === 'active');
    const neuralStatus = neuralCells.status();

    const vpsKeyConfigured = Boolean(
        process.env.SHEIKHA_ENTERPRISE_VPS_KEY ||
        process.env.SHEIKHA_VPS_KEY ||
        process.env.VPS_KEY
    );

    const enterpriseEnabled = process.env.SHEIKHA_ENTERPRISE_ENABLED !== 'false';
    const sheikhaTopDomain = process.env.SHEIKHA_TOP_DOMAIN || 'sheikha.top';

    const model = {
        enterpriseAccount: {
            enabled: enterpriseEnabled,
            status: enterpriseStatusRaw?.status || 'unknown',
            source: '/api/enterprise/status'
        },
        organizationAccount: {
            total: organizations.length,
            active: activeOrganizations.length,
            ready: activeOrganizations.length > 0,
            source: '/api/organizations'
        },
        domainProfile: {
            domain: sheikhaTopDomain,
            linked: vpsKeyConfigured,
            vpsKeyConfigured,
            source: '/api/sheikha/status'
        },
        neuralStatus: {
            ready: neuralStatus.ready === true && neuralStatus.totalCells === 12,
            totalCells: neuralStatus.totalCells || 0,
            activeCells: neuralStatus.activeCells || 0,
            source: '/api/neural/status'
        }
    };

    const readinessChecks = [
        { key: 'enterpriseEnabled', passed: model.enterpriseAccount.enabled },
        { key: 'organizationActive', passed: model.organizationAccount.ready },
        { key: 'domainLinked', passed: model.domainProfile.linked },
        { key: 'neuralReady12Cells', passed: model.neuralStatus.ready }
    ];

    return {
        model,
        readinessChecks,
        ready: readinessChecks.every(item => item.passed)
    };
}

function runActivationWorkflow(payload = {}, initiatedBy = null) {
    const workflowId = `tei_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const unified = getUnifiedStatus();

    const steps = [
        {
            step: 'enterprise-account',
            passed: unified.model.enterpriseAccount.enabled,
            reason: unified.model.enterpriseAccount.enabled ? 'ok' : 'enterprise account disabled'
        },
        {
            step: 'organization-account',
            passed: unified.model.organizationAccount.ready,
            reason: unified.model.organizationAccount.ready ? 'ok' : 'no active organization'
        },
        {
            step: 'sheikha-top-domain',
            passed: unified.model.domainProfile.linked,
            reason: unified.model.domainProfile.linked ? 'ok' : 'vps key missing'
        },
        {
            step: 'neural-readiness-gate',
            passed: unified.model.neuralStatus.ready,
            reason: unified.model.neuralStatus.ready ? 'ok' : 'neural network not ready'
        }
    ];

    const status = steps.every(item => item.passed) ? 'activated' : 'partial-failure';
    const failedSteps = steps.filter(item => !item.passed).map(item => item.step);

    const report = {
        workflowId,
        status,
        retryable: status !== 'activated',
        initiatedBy: initiatedBy || 'system',
        initiatedAt: now,
        activationMode: payload.activationMode || 'enterprise-top',
        checks: unified.readinessChecks,
        steps,
        failedSteps,
        unifiedModel: unified.model
    };

    activationRuns.set(workflowId, report);
    while (activationRuns.size > MAX_ACTIVATION_RUNS) {
        const oldestKey = activationRuns.keys().next().value;
        activationRuns.delete(oldestKey);
    }
    return report;
}

function sanitizeActivationPayload(rawBody) {
    const body = rawBody && typeof rawBody === 'object' ? rawBody : {};
    const allowedModes = new Set(['enterprise-top', 'retry']);
    const requestedMode = typeof body.activationMode === 'string' ? body.activationMode.trim() : '';
    return {
        activationMode: allowedModes.has(requestedMode) ? requestedMode : 'enterprise-top'
    };
}

router.get('/status', (req, res) => {
    const unified = getUnifiedStatus();
    const latestRun = Array.from(activationRuns.values()).pop() || null;

    res.json({
        success: true,
        integration: 'Top Enterprise Integration',
        ready: unified.ready,
        model: unified.model,
        checks: unified.readinessChecks,
        latestActivationRun: latestRun,
        timestamp: new Date().toISOString()
    });
});

router.post('/activation/workflow', authenticate, authorize('admin', 'enterprise', 'organization'), (req, res) => {
    const payload = sanitizeActivationPayload(req.body);
    const report = runActivationWorkflow(payload, req.user?.email || req.user?.id || 'authorized-user');
    const httpCode = report.status === 'activated' ? 200 : 409;
    res.status(httpCode).json({ success: report.status === 'activated', report });
});

router.post('/activation/retry', authenticate, authorize('admin', 'enterprise', 'organization'), (req, res) => {
    const payload = sanitizeActivationPayload(req.body);
    payload.activationMode = 'retry';
    const report = runActivationWorkflow(payload, req.user?.email || req.user?.id || 'authorized-user');
    const httpCode = report.status === 'activated' ? 200 : 409;
    res.status(httpCode).json({ success: report.status === 'activated', report });
});

router.get('/activation/:workflowId', authenticate, authorize('admin', 'enterprise', 'organization'), (req, res) => {
    const report = activationRuns.get(req.params.workflowId);
    if (!report) {
        return res.status(404).json({
            success: false,
            message: 'Activation workflow not found'
        });
    }
    return res.json({ success: true, report });
});

module.exports = router;
