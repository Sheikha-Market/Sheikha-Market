'use strict';

const express = require('express');
const router = express.Router();

const Organization = require('../models/Organization');
const { authenticate, authorize } = require('../middleware/auth');
const neuralCells = require('../core/neural/neural-cells');

let enterpriseEngine = null;
const activationRuns = new Map();

function getEnterpriseEngine() {
    if (!enterpriseEngine) {
        const Engine = require('../lib/sheikha-enterprise-integration');
        enterpriseEngine = new Engine();
    }
    return enterpriseEngine;
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
        { key: 'enterprise_enabled', passed: model.enterpriseAccount.enabled },
        { key: 'organization_active', passed: model.organizationAccount.ready },
        { key: 'domain_linked', passed: model.domainProfile.linked },
        { key: 'neural_ready_12_cells', passed: model.neuralStatus.ready }
    ];

    return {
        model,
        readinessChecks,
        ready: readinessChecks.every(item => item.passed)
    };
}

function runActivationWorkflow(payload = {}, initiatedBy = null) {
    const workflowId = `tei_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
    return report;
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
    const report = runActivationWorkflow(req.body || {}, req.user?.email || req.user?.id || 'authorized-user');
    const httpCode = report.status === 'activated' ? 200 : 409;
    res.status(httpCode).json({ success: report.status === 'activated', report });
});

router.post('/activation/retry', authenticate, authorize('admin', 'enterprise', 'organization'), (req, res) => {
    const report = runActivationWorkflow({ ...(req.body || {}), activationMode: 'retry' }, req.user?.email || req.user?.id || 'authorized-user');
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
