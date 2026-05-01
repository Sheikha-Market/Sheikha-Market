/**
 * بسم الله الرحمن الرحيم
 * =============================================================================
 * مسارات API — التكامل المؤسسي والأمن العملياتي
 * /api/enterprise/*   و   /api/ops-security/*
 * =============================================================================
 */
'use strict';

const express = require('express');
const router  = express.Router();

let _enterprise = null;
let _security   = null;

function ent() {
    if (!_enterprise) { _enterprise = new (require('../lib/sheikha-enterprise-integration.js'))(); }
    return _enterprise;
}
function sec() {
    if (!_security) { _security = require('../lib/sheikha-ops-security-engine.js'); }
    return _security;
}

/* ══ Enterprise routes ══════════════════════════════════════════ */
router.get('/dashboard',       (req, res) => res.json({ success:true, ...ent().getDashboard() }));
router.get('/status',          (req, res) => res.json({ success:true, ...ent().getStatus() }));
router.get('/full-report',     (req, res) => res.json({ success:true, ...ent().getFullReport() }));
router.get('/fortune500',      (req, res) => res.json({ success:true, ...ent().getFortune500() }));
router.get('/intl-orgs',       (req, res) => res.json({ success:true, ...ent().getIntlOrgs() }));
router.get('/government',      (req, res) => res.json({ success:true, ...ent().getGovernmentPortal() }));
router.get('/supply-chain',    (req, res) => res.json({ success:true, ...ent().getSupplyChain() }));
router.get('/financial',       (req, res) => res.json({ success:true, ...ent().getFinancial() }));
router.get('/sme-network',     (req, res) => res.json({ success:true, ...ent().getSMENetwork() }));
router.get('/api-integrations',(req, res) => res.json({ success:true, ...ent().getAPIIntegrations() }));
router.get('/onboarding',      (req, res) => res.json({ success:true, ...ent().getOnboarding() }));

/* ══ Security routes ════════════════════════════════════════════ */
router.get('/security/dashboard',        (req, res) => res.json({ success:true, ...sec().getDashboard() }));
router.get('/security/status',           (req, res) => res.json({ success:true, ...sec().getStatus() }));
router.get('/security/full-report',      (req, res) => res.json({ success:true, ...sec().getFullReport() }));
router.get('/security/threats',          (req, res) => res.json({ success:true, ...sec().getThreatModel() }));
router.get('/security/cyber-defense',    (req, res) => res.json({ success:true, ...sec().getCyberDefense() }));
router.get('/security/data-privacy',     (req, res) => res.json({ success:true, ...sec().getDataPrivacy() }));
router.get('/security/fraud-detection',  (req, res) => res.json({ success:true, ...sec().getFraudDetection() }));
router.get('/security/aml-kyc',          (req, res) => res.json({ success:true, ...sec().getAmlKyc() }));
router.get('/security/incident-response',(req, res) => res.json({ success:true, ...sec().getIncidentResponse() }));
router.get('/security/policies',         (req, res) => res.json({ success:true, ...sec().getSecurityPolicies() }));
router.get('/security/compliance',       (req, res) => res.json({ success:true, ...sec().getComplianceMatrix() }));
router.get('/security/live-threats',     (req, res) => res.json({ success:true, ...sec().getLiveThreatLog() }));

/* ── إبلاغ عن تهديد ─────────────────────────────────────────── */
router.post('/security/report-threat', express.json(), (req, res) => {
    const { type, severity, detail } = req.body || {};
    if (!type) return res.status(400).json({ success:false, message:'type مطلوب' });
    const threat = sec().logThreat({
        type:     String(type).slice(0, 100),
        severity: ['low','medium','high','critical'].includes(severity) ? severity : 'medium',
        detail:   String(detail || '').slice(0, 500),
        source:   req.ip || 'api'
    });
    res.json({ success:true, threat });
});

module.exports = router;
