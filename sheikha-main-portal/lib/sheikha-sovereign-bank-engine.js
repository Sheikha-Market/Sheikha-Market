'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SheikhaSovereignBankEngine {
    constructor() {
        this.owner = {
            name: 'Salman Ahmed bin Salman AlRajih',
            registry: '2051263653',
            credential: 'ciscc2250603061'
        };
        this.dataDir = path.join(process.cwd(), 'data');
        this.guaranteeLedgerPath = path.join(this.dataDir, 'sovereign-bank-guarantees.ndjson');
        this.lcLedgerPath = path.join(this.dataDir, 'sovereign-lc-ledger.ndjson');
        this.opsReportPath = path.join(this.dataDir, 'sovereign-bank-ops-report.json');
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    loadBankEngines() {
        let central = null;
        let fund = null;

        try {
            const SheikhaBankingEngine = require('./sheikha-banking-engine.js');
            central = new SheikhaBankingEngine();
        } catch (_error) {
            central = null;
        }

        try {
            const SheikhaBankFundEngine = require('./sheikha-bank-fund-engine.js');
            fund = new SheikhaBankFundEngine();
        } catch (_error) {
            fund = null;
        }

        return {
            central,
            fund,
            readiness: {
                centralReady: !!central,
                fundReady: !!fund
            }
        };
    }

    validateGuaranteePayload(payload) {
        const violations = [];
        const warnings = [];

        if (!payload.projectId || payload.projectId.length < 6) {
            violations.push('projectId غير صالح');
        }

        if (!payload.beneficiary || payload.beneficiary.length < 3) {
            violations.push('beneficiary غير صالح');
        }

        if (!payload.amount || Number(payload.amount) <= 0) {
            violations.push('amount يجب أن يكون أكبر من صفر');
        }

        if (payload.interestRate && Number(payload.interestRate) > 0) {
            violations.push('المعاملة تحتوي على فائدة ربوية وهذا غير مسموح');
        }

        if (!payload.purpose || payload.purpose.length < 8) {
            warnings.push('purpose قصير — يفضّل وصف الغرض بشكل أوضح لتقليل الغرر');
        }

        return {
            valid: violations.length === 0,
            violations,
            warnings
        };
    }

    getLastHash() {
        if (!fs.existsSync(this.guaranteeLedgerPath)) {
            return 'GENESIS';
        }

        const rows = fs.readFileSync(this.guaranteeLedgerPath, 'utf8').split('\n').filter(Boolean);
        if (rows.length === 0) {
            return 'GENESIS';
        }

        try {
            const last = JSON.parse(rows[rows.length - 1]);
            return last.hash || 'GENESIS';
        } catch (_error) {
            return 'GENESIS';
        }
    }

    getLastHashFrom(filePath) {
        if (!fs.existsSync(filePath)) {
            return 'GENESIS';
        }

        const rows = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
        if (rows.length === 0) {
            return 'GENESIS';
        }

        try {
            const last = JSON.parse(rows[rows.length - 1]);
            return last.hash || 'GENESIS';
        } catch (_error) {
            return 'GENESIS';
        }
    }

    getLedgerCountFrom(filePath) {
        if (!fs.existsSync(filePath)) {
            return 0;
        }

        return fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean).length;
    }

    getLedgerCount() {
        if (!fs.existsSync(this.guaranteeLedgerPath)) {
            return 0;
        }

        return fs.readFileSync(this.guaranteeLedgerPath, 'utf8').split('\n').filter(Boolean).length;
    }

    issueSovereignGuarantee(input) {
        const payload = {
            projectId: input.projectId,
            type: input.type || 'initial',
            beneficiary: input.beneficiary,
            amount: Number(input.amount || 0),
            currency: input.currency || 'SAR',
            purpose: input.purpose || 'Government tender participation',
            issuer: 'Sheikha Central Bank',
            interestRate: Number(input.interestRate || 0)
        };

        const validation = this.validateGuaranteePayload(payload);
        if (!validation.valid) {
            return {
                success: false,
                validation,
                message: 'فشل إصدار الضمان البنكي بسبب متطلبات غير مستوفاة'
            };
        }

        const issuedAt = new Date().toISOString();
        const previousHash = this.getLastHash();
        const index = this.getLedgerCount() + 1;
        const guaranteeId = `SBG-${new Date().getFullYear()}-${String(index).padStart(6, '0')}`;

        const blockBody = {
            index,
            guaranteeId,
            issuedAt,
            owner: this.owner,
            payload,
            sharia: {
                ribaFree: true,
                ghararReduced: validation.warnings.length === 0,
                warnings: validation.warnings
            },
            previousHash
        };

        const hash = crypto.createHash('sha256').update(JSON.stringify(blockBody)).digest('hex');

        const block = {
            ...blockBody,
            hash
        };

        fs.appendFileSync(this.guaranteeLedgerPath, JSON.stringify(block) + '\n');

        return {
            success: true,
            guaranteeId,
            block
        };
    }

    validateLCPayload(payload) {
        const violations = [];
        const warnings = [];

        if (!payload.tradeType || payload.tradeType.length < 4) {
            violations.push('tradeType غير صالح');
        }

        if (!payload.applicant || payload.applicant.length < 3) {
            violations.push('applicant غير صالح');
        }

        if (!payload.beneficiary || payload.beneficiary.length < 3) {
            violations.push('beneficiary غير صالح');
        }

        if (!payload.amount || Number(payload.amount) <= 0) {
            violations.push('amount يجب أن يكون أكبر من صفر');
        }

        if (!payload.collateralAsset || payload.collateralAsset.length < 4) {
            warnings.push('يفضّل توثيق collateralAsset بشكل أدق');
        }

        if (payload.interestRate && Number(payload.interestRate) > 0) {
            violations.push('الاعتماد يحتوي فائدة ربوية — غير مسموح');
        }

        return {
            valid: violations.length === 0,
            violations,
            warnings
        };
    }

    openSovereignLC(input) {
        const payload = {
            tradeType: input.tradeType || 'Strategic_Mineral_Reserve',
            applicant: input.applicant || 'Sheikha Central Bank',
            beneficiary: input.beneficiary || 'Global Metals Supplier',
            amount: Number(input.amount || 0),
            currency: input.currency || 'USD',
            collateralAsset: input.collateralAsset || 'Gold_Reserve_AlKhobar',
            purpose: input.purpose || 'Import of strategic metals',
            interestRate: Number(input.interestRate || 0)
        };

        const validation = this.validateLCPayload(payload);
        if (!validation.valid) {
            return {
                success: false,
                validation,
                message: 'فشل فتح الاعتماد المستندي بسبب متطلبات غير مستوفاة'
            };
        }

        const issuedAt = new Date().toISOString();
        const index = this.getLedgerCountFrom(this.lcLedgerPath) + 1;
        const lcId = `SLC-${new Date().getFullYear()}-${String(index).padStart(6, '0')}`;
        const previousHash = this.getLastHashFrom(this.lcLedgerPath);

        const body = {
            index,
            lcId,
            issuedAt,
            owner: this.owner,
            payload,
            sharia: {
                ribaFree: true,
                warnings: validation.warnings
            },
            previousHash
        };

        const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');

        const block = {
            ...body,
            hash
        };

        fs.appendFileSync(this.lcLedgerPath, JSON.stringify(block) + '\n');

        return {
            success: true,
            lcId,
            block
        };
    }

    syncAppSovereignty() {
        return {
            googlePlay: {
                configured: !!process.env.GOOGLE_PLAY_DEVELOPER_ID,
                value: process.env.GOOGLE_PLAY_DEVELOPER_ID || null
            },
            appleStore: {
                configured: !!process.env.APPLE_TEAM_ID,
                value: process.env.APPLE_TEAM_ID || null
            },
            mobileBanking: {
                androidPackage: process.env.FLUTTER_ANDROID_PACKAGE || 'top.sheikha.app',
                iosBundleId: process.env.FLUTTER_IOS_BUNDLE_ID || 'top.sheikha.app'
            }
        };
    }

    buildReadiness() {
        const etimadReady = !!process.env.ETIMAD_API_BASE_URL && !!process.env.ETIMAD_CLIENT_ID;
        const appStoresReady =
            !!process.env.GOOGLE_PLAY_DEVELOPER_ID || !!process.env.APPLE_TEAM_ID;

        return {
            etimad: {
                ready: etimadReady,
                baseUrlSet: !!process.env.ETIMAD_API_BASE_URL,
                clientIdSet: !!process.env.ETIMAD_CLIENT_ID
            },
            appLicenses: {
                ready: appStoresReady,
                googlePlayIdSet: !!process.env.GOOGLE_PLAY_DEVELOPER_ID,
                appleTeamIdSet: !!process.env.APPLE_TEAM_ID
            }
        };
    }

    activateOperations(config = {}) {
        this.ensureDataDir();

        const engines = this.loadBankEngines();
        const readiness = this.buildReadiness();
        const appSovereignty = this.syncAppSovereignty();
        const issueResult = this.issueSovereignGuarantee({
            projectId: config.projectId || 'NATIONAL_MINING_PROJECT_2030',
            type: config.type || 'initial',
            beneficiary: config.beneficiary || 'Saudi Government Procurement',
            amount: config.amount || 1000000,
            currency: config.currency || 'SAR',
            purpose: config.purpose || 'Tender guarantee for strategic metals project'
        });

        const lcResult = this.openSovereignLC({
            tradeType: config.tradeType || 'Strategic_Mineral_Reserve',
            applicant: config.applicant || 'Sheikha Central Bank',
            beneficiary: config.lcBeneficiary || 'Global Metals Supplier',
            amount: config.lcAmount || config.amount || 1000000,
            currency: config.lcCurrency || 'USD',
            collateralAsset: config.collateralAsset || 'Gold_Reserve_AlKhobar',
            purpose: config.lcPurpose || 'Strategic metal trade coverage'
        });

        const report = {
            timestamp: new Date().toISOString(),
            owner: this.owner,
            operationsStatus: issueResult.success && lcResult.success ? 'operational' : 'partial',
            centralBankReadiness: engines.readiness,
            integrationReadiness: readiness,
            appSovereignty,
            issuedGuarantee: issueResult,
            issuedLC: lcResult,
            summary: {
                guaranteesInLedger: this.getLedgerCount(),
                lcsInLedger: this.getLedgerCountFrom(this.lcLedgerPath),
                lastGuaranteeId: issueResult.success ? issueResult.guaranteeId : null,
                lastLCId: lcResult.success ? lcResult.lcId : null,
                shariaCompliant: !!issueResult.success && !!lcResult.success
            },
            nextActions: [
                'ضبط ETIMAD_API_BASE_URL و ETIMAD_CLIENT_ID للربط الحكومي الفعلي',
                'إضافة GOOGLE_PLAY_DEVELOPER_ID و APPLE_TEAM_ID لاعتماد الرخص الرسمية',
                'مراجعة سجل الضمانات في data/sovereign-bank-guarantees.ndjson',
                'مراجعة سجل الاعتمادات في data/sovereign-lc-ledger.ndjson'
            ]
        };

        fs.writeFileSync(this.opsReportPath, JSON.stringify(report, null, 2));
        return report;
    }
}

module.exports = SheikhaSovereignBankEngine;
