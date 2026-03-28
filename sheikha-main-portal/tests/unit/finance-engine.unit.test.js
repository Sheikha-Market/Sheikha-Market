import { describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SheikhaFinanceEngine = require('../../lib/sheikha-finance-engine');

describe('SheikhaFinanceEngine', () => {
    function createEngine() {
        const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-finance-'));
        return new SheikhaFinanceEngine({
            ledgerPath: path.join(tempRoot, 'finance-ledger.json'),
            backupDir: path.join(tempRoot, 'backups')
        });
    }

    it('distributes a USD contract using the expected policy', () => {
        const engine = createEngine();
        const result = engine.executeSale({
            clientName: 'Alpha Contracting',
            contractValue: 1000,
            currency: 'USD'
        });

        expect(result.sale.allocations.netProfitUsd).toBe(750);
        expect(result.sale.allocations.charityUsd).toBe(150);
        expect(result.sale.allocations.victoryUsd).toBe(100);
        expect(result.summary.totals.grossVolumeUsd).toBe(1000);
    });

    it('converts supported currencies before applying allocations', () => {
        const engine = createEngine();
        const result = engine.executeSale({
            clientName: 'Beta Trade',
            contractValue: 1000,
            currency: 'SAR'
        });

        expect(result.sale.amountUsd).toBe(266.7);
        expect(result.summary.totals.tradeRevenueUsd).toBe(200.03);
    });

    it('creates and restores local backups', () => {
        const engine = createEngine();
        engine.executeSale({
            clientName: 'Gamma Systems',
            contractValue: 500,
            currency: 'USD'
        });

        const backup = engine.createBackup('unit');
        const backups = engine.listBackups();

        expect(backups[0].fileName).toBe(backup.fileName);

        const restore = engine.restoreBackup(backup.fileName);
        expect(restore.restoredFrom).toBe(backup.fileName);
        expect(restore.summary.totals.salesCount).toBe(1);
    });
});
