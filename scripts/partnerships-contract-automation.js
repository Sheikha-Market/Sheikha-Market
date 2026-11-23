#!/usr/bin/env node

/**
 * مولد حزم الشراكات الرقمية
 * ينشئ ملف اتفاقية شراكة رقمية + NDA + الامتثال + خطة التدفقات
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'partnerships');
const REPORT_DIR = path.join(ROOT, 'reports', 'partnerships', 'contracts');

const visionPath = path.join(DATA_DIR, 'SHEIKHA-VISION-GOALS.json');
const frameworkPath = path.join(DATA_DIR, 'STRATEGIC-PARTNERSHIP-FRAMEWORK.json');
const ndaPath = path.join(DATA_DIR, 'DIGITAL-NDA-CONFIDENTIALITY-FRAMEWORK.json');
const policiesPath = path.join(DATA_DIR, 'PARTNERSHIP-POLICIES-TERMS.json');

function parseArgs(argv) {
    const args = {
        partnerName: 'Partner-Example',
        partnerTier: 'tier_2',
        partnerType: 'technology',
        partnerCountry: 'Saudi Arabia',
        contactEmail: 'legal@example.com'
    };

    argv.forEach((entry) => {
        if (!entry.startsWith('--')) {
            return;
        }

        const [key, value] = entry.replace('--', '').split('=');
        if (!value) {
            return;
        }

        if (key === 'name') args.partnerName = value;
        if (key === 'tier') args.partnerTier = value;
        if (key === 'type') args.partnerType = value;
        if (key === 'country') args.partnerCountry = value;
        if (key === 'email') args.contactEmail = value;
    });

    return args;
}

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function selectTierTerms(policies, tierKey) {
    if (tierKey === 'tier_1') return policies.special_terms_by_partner_tier.tier_1_terms;
    if (tierKey === 'tier_3') return policies.special_terms_by_partner_tier.tier_3_terms;
    return policies.special_terms_by_partner_tier.tier_2_terms;
}

function nowIso() {
    return new Date().toISOString();
}

function buildContractPackage(context) {
    const { inputs, vision, framework, nda, policies } = context;
    const createdAt = nowIso();
    const partnerSlug = slugify(inputs.partnerName || 'partner');
    const contractId = `SHK-SPA-${createdAt.slice(0, 10)}-${partnerSlug}`;

    const packagePayload = {
        metadata: {
            contractId,
            createdAt,
            owner: 'Salman Ahmed bin Salman Al-Rajhi',
            organization: 'Sheikha Technology Imperium',
            documentType: 'Digital Strategic Partnership Package',
            status: 'draft-ready-for-signature',
            classification: 'confidential'
        },
        partnerProfile: {
            name: inputs.partnerName,
            tier: inputs.partnerTier,
            type: inputs.partnerType,
            country: inputs.partnerCountry,
            legalContact: inputs.contactEmail
        },
        strategicAlignment: {
            visionStatement: vision.vision.statement,
            corePillars: vision.vision.pillars.map((pillar) => ({
                name: pillar.name,
                meaning: pillar.meaning
            })),
            selectedGoal: vision.strategic_goals.primary_objectives[0]
        },
        legalFramework: {
            governingLaw: framework.regulatory_framework.jurisdiction_primary,
            supportingJurisdictions: framework.regulatory_framework.jurisdiction_secondary,
            disputeModel: policies.core_policies.policy_007_conflict_resolution.escalation_model,
            ndaStandard: nda.nda_digital_standard,
            confidentialitySummary: {
                obligations: nda.nda_template_master.obligations,
                termDuration: nda.nda_template_master.term_duration,
                returnAndDestruction: nda.nda_template_master.return_destruction
            }
        },
        technicalAndDataFlows: {
            integrationPatterns: framework.technical_integration_framework.integration_patterns,
            informationFlows: framework.information_flows,
            apiGovernance: framework.technical_integration_framework.api_governance,
            dataGovernance: framework.data_governance
        },
        commercialModel: {
            tierTerms: selectTierTerms(policies, inputs.partnerTier),
            coreFinancialPolicy: policies.core_policies.policy_002_financial_terms,
            serviceLevels: policies.core_policies.policy_006_performance_slas
        },
        islamicCompliance: {
            certification: policies.islamic_compliance_certification,
            guidingPrinciples: vision.guiding_principles,
            ndaIslamicBasis: nda.metadata.islamic_basis
        },
        digitalExecution: {
            signingMethod: 'qualified-electronic-signature',
            dualFactorApproval: true,
            signingSequence: [
                'partner-legal-signature',
                'sheikha-legal-signature',
                'sheikha-sharia-review-signature',
                'final-owner-approval'
            ],
            automationFeatures: {
                ndaEnforcement: nda.automated_nda_enforcement,
                policyAutomation: policies.digital_automation
            }
        }
    };

    const checksum = crypto
        .createHash('sha256')
        .update(JSON.stringify(packagePayload))
        .digest('hex');

    packagePayload.metadata.integrityHash = checksum;
    return packagePayload;
}

function saveContractPackage(packagePayload, partnerName) {
    ensureDirectory(REPORT_DIR);
    const safeName = slugify(partnerName || 'partner');
    const timestamp = nowIso().replace(/[:.]/g, '-');
    const outputPath = path.join(REPORT_DIR, `spa-${safeName}-${timestamp}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(packagePayload, null, 2));
    return outputPath;
}

function main() {
    const inputs = parseArgs(process.argv.slice(2));

    const vision = loadJson(visionPath);
    const framework = loadJson(frameworkPath);
    const nda = loadJson(ndaPath);
    const policies = loadJson(policiesPath);

    const packagePayload = buildContractPackage({
        inputs,
        vision,
        framework,
        nda,
        policies
    });

    const outputPath = saveContractPackage(packagePayload, inputs.partnerName);

    console.log('============================================================');
    console.log('SHEIKHA DIGITAL PARTNERSHIP PACKAGE GENERATED');
    console.log('============================================================');
    console.log(`Partner Name: ${inputs.partnerName}`);
    console.log(`Partner Tier: ${inputs.partnerTier}`);
    console.log(`Contract ID : ${packagePayload.metadata.contractId}`);
    console.log(`Integrity   : ${packagePayload.metadata.integrityHash}`);
    console.log(`Output File : ${outputPath}`);
    console.log('Status      : draft-ready-for-signature');
    console.log('============================================================');
}

main();
