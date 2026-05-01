#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-consent-communication-governance-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-consent-communication-governance-core');
const force = process.argv.includes('--force');

function nowIso() {
    return new Date().toISOString();
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJson(filePath, payload) {
    if (fs.existsSync(filePath) && !force) {
        return { filePath, written: false, reason: 'exists' };
    }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    return { filePath, written: true };
}

function ensureDataSeed(filePath, payload) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    }
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'communication'));
    ensureDir(path.join(OUT_DIR, 'consent'));
    ensureDir(path.join(OUT_DIR, 'governance'));
    ensureDir(path.join(OUT_DIR, 'defensive-monitoring'));
    ensureDir(path.join(OUT_DIR, 'partnerships'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        deliverables: config.deliverables,
        targets: config.targets
    };

    const communicationCatalog = {
        generatedAt: nowIso(),
        publicNewsletters: config.communication.publicNewsletters,
        channels: config.communication.channels,
        officialContactForms: config.communication.officialContactForms,
        policy: 'opt-in-only'
    };

    const consentPolicy = {
        generatedAt: nowIso(),
        requiredFor: config.consent.requiredFor,
        retentionPolicy: config.consent.retentionPolicy,
        controls: [
            'explicit-consent-required',
            'consent-versioning',
            'withdrawal-supported',
            'auditable-records'
        ]
    };

    const consentSchema = {
        generatedAt: nowIso(),
        fields: config.consent.consentRecordFields,
        constraints: {
            consentGrantedRequired: true,
            consentTextVersionRequired: true,
            recordedAtRequired: true
        }
    };

    const privacyPolicy = {
        generatedAt: nowIso(),
        principles: config.governance.privacyPolicyPrinciples,
        statement: 'No nonconsensual surveillance. Processing is limited to lawful, declared, consent-based purposes.'
    };

    const complianceFramework = {
        generatedAt: nowIso(),
        domains: config.governance.complianceDomains,
        cadence: config.governance.auditCadence,
        requiredEvidence: [
            'policy-documents',
            'consent-samples',
            'security-controls',
            'audit-reports'
        ]
    };

    const legalSecurityChecklist = {
        generatedAt: nowIso(),
        checklist: [
            'privacy-policy-published',
            'consent-capture-enabled',
            'consent-withdrawal-endpoint-enabled',
            'defensive-monitoring-policy-published',
            'incident-response-procedure-documented',
            'quarterly-security-audit-scheduled',
            'quarterly-legal-audit-scheduled'
        ]
    };

    const defensiveMonitoringPolicy = {
        generatedAt: nowIso(),
        scope: config.defensiveMonitoring.scope,
        excludedScope: config.defensiveMonitoring.excludedScope,
        policy: 'defensive-observability-only'
    };

    const defensiveAlertPlaybook = {
        generatedAt: nowIso(),
        severities: ['low', 'medium', 'high', 'critical'],
        eventTypes: ['health-degradation', 'service-outage', 'security-alert', 'latency-spike'],
        responseFlow: [
            'detect',
            'validate',
            'contain',
            'recover',
            'post-incident-review'
        ]
    };

    const dashboardKpis = {
        generatedAt: nowIso(),
        kpis: config.defensiveMonitoring.dashboardKpis,
        dashboardPolicy: 'infrastructure-and-service-health-only'
    };

    const publicPartnershipPages = {
        generatedAt: nowIso(),
        pages: config.partnerships.publicPages,
        publicationMode: 'public'
    };

    const officialContactForms = {
        generatedAt: nowIso(),
        forms: config.communication.officialContactForms,
        routing: 'compliance-first-triage'
    };

    const partnerTransparencyModel = {
        generatedAt: nowIso(),
        fields: config.partnerships.transparencyFields,
        policy: 'transparent-and-reviewable-partnership-management'
    };

    const publicEntityCatalog = {
        generatedAt: nowIso(),
        entities: config.partnerships.initialEntityCatalog || [],
        note: 'Initial public-interest partner catalog for transparent onboarding and review.'
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'consent-communication-governance-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'communication', 'communication-catalog.json'), communicationCatalog));
    artifacts.push(writeJson(path.join(OUT_DIR, 'consent', 'consent-policy.json'), consentPolicy));
    artifacts.push(writeJson(path.join(OUT_DIR, 'consent', 'consent-log-schema.json'), consentSchema));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'privacy-policy.json'), privacyPolicy));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'compliance-framework.json'), complianceFramework));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'legal-security-audit-checklist.json'), legalSecurityChecklist));
    artifacts.push(writeJson(path.join(OUT_DIR, 'defensive-monitoring', 'system-health-monitoring-policy.json'), defensiveMonitoringPolicy));
    artifacts.push(writeJson(path.join(OUT_DIR, 'defensive-monitoring', 'defensive-alert-playbook.json'), defensiveAlertPlaybook));
    artifacts.push(writeJson(path.join(OUT_DIR, 'defensive-monitoring', 'dashboard-kpis.json'), dashboardKpis));
    artifacts.push(writeJson(path.join(OUT_DIR, 'partnerships', 'public-partnership-pages.json'), publicPartnershipPages));
    artifacts.push(writeJson(path.join(OUT_DIR, 'partnerships', 'official-contact-forms.json'), officialContactForms));
    artifacts.push(writeJson(path.join(OUT_DIR, 'partnerships', 'partner-transparency-model.json'), partnerTransparencyModel));
    artifacts.push(writeJson(path.join(OUT_DIR, 'partnerships', 'public-entity-catalog.json'), publicEntityCatalog));

    ensureDir(path.join(ROOT, 'data'));
    ensureDataSeed(path.join(ROOT, 'data', 'consent-registry.json'), {
        updatedAt: nowIso(),
        records: []
    });
    ensureDataSeed(path.join(ROOT, 'data', 'public-engagement-signups.json'), {
        updatedAt: nowIso(),
        newsletterSubscribers: [],
        channelSubscriptions: []
    });
    ensureDataSeed(path.join(ROOT, 'data', 'defensive-monitoring-events.json'), {
        updatedAt: nowIso(),
        events: []
    });

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة التواصل الطوعي والحوكمة والامتثال والمتابعة الدفاعية',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
