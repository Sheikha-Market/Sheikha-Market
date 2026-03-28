const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

class SheikhaFinanceEngine {
    constructor(options = {}) {
        this.ledgerPath =
            options.ledgerPath || path.join(__dirname, '..', 'data', 'finance-ledger.json');
        this.backupDir =
            options.backupDir || path.join(__dirname, '..', 'data', 'backups', 'finance');
        this.baseCurrency = 'USD';
        this.exchangeRates = {
            USD: 1,
            SAR: 0.2667,
            EUR: 1.09,
            GBP: 1.27
        };
        this.allocations = {
            tradeRevenue: 0.75,
            charityFund: 0.15,
            victorySupply: 0.1
        };

        this.ensureStorage();
    }

    ensureStorage() {
        fs.mkdirSync(path.dirname(this.ledgerPath), { recursive: true });
        fs.mkdirSync(this.backupDir, { recursive: true });

        if (!fs.existsSync(this.ledgerPath)) {
            this.writeLedger(this.createDefaultLedger());
        }
    }

    createDefaultLedger() {
        return {
            owner: 'Salman Ahmed Alrajeh',
            baseCurrency: this.baseCurrency,
            exchangeRates: this.exchangeRates,
            allocationPolicy: this.allocations,
            totals: {
                grossVolumeUsd: 0,
                tradeRevenueUsd: 0,
                charityFundUsd: 0,
                victorySupplyUsd: 0,
                salesCount: 0
            },
            sales: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    readLedger() {
        try {
            const raw = fs.readFileSync(this.ledgerPath, 'utf8');
            const ledger = JSON.parse(raw);

            ledger.exchangeRates = {
                ...this.exchangeRates,
                ...(ledger.exchangeRates || {})
            };
            ledger.allocationPolicy = {
                ...this.allocations,
                ...(ledger.allocationPolicy || {})
            };
            ledger.totals = ledger.totals || this.createDefaultLedger().totals;
            ledger.sales = Array.isArray(ledger.sales) ? ledger.sales : [];

            return ledger;
        } catch (_) {
            const ledger = this.createDefaultLedger();
            this.writeLedger(ledger);
            return ledger;
        }
    }

    writeLedger(ledger) {
        const payload = {
            ...ledger,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(this.ledgerPath, JSON.stringify(payload, null, 4), 'utf8');
        return payload;
    }

    normalizeCurrency(currency) {
        const normalized = String(currency || this.baseCurrency)
            .trim()
            .toUpperCase();

        if (!this.exchangeRates[normalized]) {
            throw new Error(`العملة غير مدعومة: ${normalized}`);
        }

        return normalized;
    }

    convertToUsd(amount, currency) {
        const normalizedCurrency = this.normalizeCurrency(currency);
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            throw new Error('قيمة العقد يجب أن تكون رقماً موجباً');
        }

        return Number((numericAmount * this.exchangeRates[normalizedCurrency]).toFixed(2));
    }

    executeSale({
        clientName,
        contractValue,
        currency = 'USD',
        category = 'SaaS',
        channel = 'direct'
    }) {
        if (!clientName || typeof clientName !== 'string') {
            throw new Error('اسم العميل مطلوب');
        }

        const normalizedCurrency = this.normalizeCurrency(currency);
        const amountOriginal = Number(contractValue);
        const amountUsd = this.convertToUsd(amountOriginal, normalizedCurrency);
        const ledger = this.readLedger();

        const charityUsd = Number((amountUsd * ledger.allocationPolicy.charityFund).toFixed(2));
        const victoryUsd = Number((amountUsd * ledger.allocationPolicy.victorySupply).toFixed(2));
        const netProfitUsd = Number((amountUsd - charityUsd - victoryUsd).toFixed(2));

        const sale = {
            id: randomUUID(),
            clientName: clientName.trim(),
            contractValue: amountOriginal,
            currency: normalizedCurrency,
            amountUsd,
            category,
            channel,
            allocations: {
                charityUsd,
                victoryUsd,
                netProfitUsd
            },
            createdAt: new Date().toISOString()
        };

        ledger.sales.unshift(sale);
        ledger.totals.grossVolumeUsd = Number(
            (ledger.totals.grossVolumeUsd + amountUsd).toFixed(2)
        );
        ledger.totals.tradeRevenueUsd = Number(
            (ledger.totals.tradeRevenueUsd + netProfitUsd).toFixed(2)
        );
        ledger.totals.charityFundUsd = Number(
            (ledger.totals.charityFundUsd + charityUsd).toFixed(2)
        );
        ledger.totals.victorySupplyUsd = Number(
            (ledger.totals.victorySupplyUsd + victoryUsd).toFixed(2)
        );
        ledger.totals.salesCount += 1;

        this.writeLedger(ledger);

        return {
            sale,
            summary: this.getSummary()
        };
    }

    getSummary() {
        const ledger = this.readLedger();
        const recentSales = ledger.sales.slice(0, 5);
        const analytics = this.buildTradingAnalytics(ledger.sales);

        return {
            owner: ledger.owner,
            baseCurrency: ledger.baseCurrency,
            totals: ledger.totals,
            exchangeRates: ledger.exchangeRates,
            recentSales,
            analytics,
            updatedAt: ledger.updatedAt
        };
    }

    getRates() {
        const ledger = this.readLedger();
        const rates = Object.entries(ledger.exchangeRates).map(([currency, usdRate]) => ({
            currency,
            usdRate,
            inverseRate: Number((1 / usdRate).toFixed(4))
        }));

        return {
            baseCurrency: ledger.baseCurrency,
            rates,
            updatedAt: ledger.updatedAt
        };
    }

    listSales(limit = 25) {
        const ledger = this.readLedger();
        const safeLimit = Math.max(1, Math.min(Number(limit) || 25, 100));

        return {
            total: ledger.sales.length,
            sales: ledger.sales.slice(0, safeLimit)
        };
    }

    buildTradingAnalytics(sales = []) {
        const categoryTotals = {};
        const currencyTotals = {};
        const recent = sales.slice(0, 3);
        const previous = sales.slice(3, 6);

        for (const sale of sales) {
            categoryTotals[sale.category] = Number(
                ((categoryTotals[sale.category] || 0) + sale.amountUsd).toFixed(2)
            );
            currencyTotals[sale.currency] = Number(
                ((currencyTotals[sale.currency] || 0) + sale.amountUsd).toFixed(2)
            );
        }

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || [
            'SaaS',
            0
        ];
        const topCurrency = Object.entries(currencyTotals).sort((a, b) => b[1] - a[1])[0] || [
            'USD',
            0
        ];
        const recentVolume = recent.reduce((sum, sale) => sum + sale.amountUsd, 0);
        const previousVolume = previous.reduce((sum, sale) => sum + sale.amountUsd, 0);
        const momentum =
            recentVolume > previousVolume
                ? 'متسارع'
                : recentVolume < previousVolume
                  ? 'متباطئ'
                  : 'مستقر';

        return {
            momentum,
            topCategory: {
                name: topCategory[0],
                volumeUsd: Number(topCategory[1].toFixed(2))
            },
            topCurrency: {
                code: topCurrency[0],
                volumeUsd: Number(topCurrency[1].toFixed(2))
            },
            algorithms: [
                {
                    key: 'capital-preservation',
                    title: 'حفظ رأس المال',
                    description:
                        'رفع أولوية العقود ذات العائد الدولاري الثابت وتخفيف التذبذب عند تباطؤ الزخم.',
                    signal: momentum === 'متباطئ' ? 'نشط' : 'مراقبة'
                },
                {
                    key: 'currency-diversification',
                    title: 'تنويع العملات',
                    description:
                        'تنويع التدفقات بين الدولار والريال واليورو والجنيه لتقليل التركّز وتحسين السيولة.',
                    signal: Object.keys(currencyTotals).length >= 3 ? 'جيد' : 'يحتاج تنويع'
                },
                {
                    key: 'growth-focus',
                    title: 'تركيز النمو',
                    description: `أعلى فئة حالياً هي ${topCategory[0]}، ويمكن توسيع التسعير والعروض حولها لتحسين المردود.`,
                    signal: topCategory[1] > 0 ? 'فرصة' : 'بانتظار صفقات'
                }
            ],
            lastEvaluatedAt: new Date().toISOString()
        };
    }

    getTradingAnalytics() {
        const ledger = this.readLedger();
        return this.buildTradingAnalytics(ledger.sales);
    }

    createBackup(label = 'manual') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeLabel = String(label || 'manual').replace(/[^a-zA-Z0-9-_]+/g, '-');
        const fileName = `finance-ledger-${timestamp}-${safeLabel}.json`;
        const backupPath = path.join(this.backupDir, fileName);

        fs.copyFileSync(this.ledgerPath, backupPath);

        return {
            fileName,
            backupPath,
            createdAt: new Date().toISOString()
        };
    }

    listBackups() {
        const files = fs
            .readdirSync(this.backupDir, 'utf8')
            .filter(fileName => fileName.endsWith('.json'))
            .sort()
            .reverse()
            .map(fileName => {
                const fullPath = path.join(this.backupDir, fileName);
                const stats = fs.statSync(fullPath);
                return {
                    fileName,
                    size: stats.size,
                    modifiedAt: stats.mtime.toISOString()
                };
            });

        return files;
    }

    restoreBackup(fileName) {
        if (!fileName) {
            throw new Error('اسم ملف النسخة الاحتياطية مطلوب');
        }

        const safeName = path.basename(fileName);
        const backupPath = path.join(this.backupDir, safeName);

        if (!fs.existsSync(backupPath)) {
            throw new Error('ملف النسخة الاحتياطية غير موجود');
        }

        fs.copyFileSync(backupPath, this.ledgerPath);

        return {
            restoredFrom: safeName,
            restoredAt: new Date().toISOString(),
            summary: this.getSummary()
        };
    }
}

module.exports = SheikhaFinanceEngine;
