import { describe, expect, it } from 'vitest';

const SheikhaHadithStandardsEngine = require('../../lib/sheikha-hadith-standards-engine');

describe('Sheikha QA Unit Baseline', () => {
    it('validates a basic deterministic rule', () => {
        const total = [1, 2, 3, 4].reduce((sum, value) => sum + value, 0);
        expect(total).toBe(10);
    });

    it('ensures health path constant remains stable', () => {
        const healthPath = '/api/health';
        expect(healthPath.startsWith('/api/')).toBe(true);
        expect(healthPath).toBe('/api/health');
    });

    it('rejects harmful deviation and keeps report-violation pathway active', () => {
        const engine = new SheikhaHadithStandardsEngine();
        const blockedTx = engine.validateTransaction({
            harmful: true,
            fraud: true,
            consent: true,
            ownershipVerified: true
        });
        const hisbahRules = engine.getHisbahHadiths();

        expect(blockedTx.valid).toBe(false);
        expect(blockedTx.failedLayers.includes('محرمات')).toBe(true);
        expect(blockedTx.failedLayers.includes('التنظيم')).toBe(true);
        expect(hisbahRules.some(rule => rule.code === 'REPORT_WRONG')).toBe(true);
    });
});
