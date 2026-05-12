import { describe, expect, it } from 'vitest';

const SheikhaHadithStandardsEngine = require('../../lib/sheikha-hadith-standards-engine');
const SheikhaHistoricalEngine = require('../../lib/sheikha-historical-engine');
const SheikhaJawamilKalimSystem = require('../../lib/sheikha-jawami-kalim-system');

describe('Sheikha Sharia Neural Core Activation', () => {
    describe('Hadith Standards Engine', () => {
        it('1) builds dashboard with expected structural totals', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const dashboard = engine.getDashboard();

            expect(dashboard.summary.tradeFoundationHadiths).toBe(8);
            expect(dashboard.summary.prohibitionHadiths).toBe(11);
            expect(dashboard.summary.structureLayers).toBe(8);
            expect(dashboard.summary.designPrinciples).toBe(8);
        });

        it('2) aggregates all hadith entries into one searchable list', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const allHadiths = engine.getAllHadiths();

            expect(allHadiths.length).toBe(48);
            expect(allHadiths[0].bab).toBe('المكاييل والموازين');
        });

        it('3) searches hadith corpus using Arabic keyword', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const results = engine.searchHadiths('الربا');

            expect(results.length).toBeGreaterThan(0);
            expect(results.some(item => item.code === 'ABSOLUTE_NO_RIBA')).toBe(true);
        });

        it('4) converts standards between prophetic units accurately', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const converted = engine.convertToStandard(1, 'صاع', 'مد');

            expect(converted).not.toBeNull();
            expect(converted.value).toBeCloseTo(4, 3);
        });

        it('5) returns null for unsupported conversion units', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const converted = engine.convertToStandard(10, 'كيلو', 'صاع');

            expect(converted).toBeNull();
        });

        it('6) validates a compliant transaction through all layers', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const result = engine.validateTransaction({
                consent: true,
                sessionOption: true,
                ownershipVerified: true,
                instantSettlement: true,
                transparent: true,
                documented: true
            });

            expect(result.valid).toBe(true);
            expect(result.totalChecks).toBe(16);
            expect(result.failed).toBe(0);
        });

        it('7) rejects transaction when riba and fraud flags are true', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const result = engine.validateTransaction({
                consent: true,
                riba: true,
                fraud: true,
                ownershipVerified: true
            });

            expect(result.valid).toBe(false);
            expect(result.failed).toBeGreaterThanOrEqual(2);
            expect(result.failedLayers.includes('محرمات')).toBe(true);
        });

        it('8) rejects transaction with harmful behavior', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const result = engine.validateTransaction({
                harmful: true,
                consent: true,
                ownershipVerified: true
            });

            expect(result.valid).toBe(false);
            expect(result.failedLayers.includes('التنظيم')).toBe(true);
        });

        it('9) exposes structure metadata for 8-layer compliance', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const structure = engine.getStructure();

            expect(structure.layers.length).toBe(8);
            expect(structure.complianceMatrix.code).toBe('EIGHT_LAYER_COMPLIANCE');
        });

        it('10) keeps canonical measurement units and anti-manipulation rules active', () => {
            const engine = new SheikhaHadithStandardsEngine();
            const weights = engine.getWeightsAndMeasures();

            expect(weights.units.length).toBe(8);
            expect(weights.units.some(unit => unit.code === 'MITHQAL')).toBe(true);
            expect(weights.antiManipulationRules.every(rule => rule.active)).toBe(true);
        });
    });

    describe('Historical Engine', () => {
        it('11) builds dashboard with six eras and expected law counts', () => {
            const engine = new SheikhaHistoricalEngine();
            const dashboard = engine.getDashboard();

            expect(dashboard.summary.totalEras).toBe(6);
            expect(dashboard.summary.quranicLaws).toBe(12);
            expect(dashboard.summary.sunnahLaws).toBe(12);
        });

        it('12) returns era details by known id and null for unknown id', () => {
            const engine = new SheikhaHistoricalEngine();

            expect(engine.getEra('ERA-01')).not.toBeNull();
            expect(engine.getEra('ERA-99')).toBeNull();
        });

        it('13) aggregates legal references from prophet era, quran and sunnah', () => {
            const engine = new SheikhaHistoricalEngine();
            const laws = engine.getLaws();

            expect(laws.prophetEraLaws.length).toBe(12);
            expect(laws.quranicLaws.length).toBe(12);
            expect(laws.sunnahLaws.length).toBe(12);
            expect(laws.totalCount).toBe(36);
        });

        it('14) merges events across all eras into one timeline-ready stream', () => {
            const engine = new SheikhaHistoricalEngine();
            const events = engine.getAllEvents();

            expect(events.length).toBe(60);
            expect(events.some(event => event.code === 'SHEIKHA_FOUNDED')).toBe(true);
        });

        it('15) searches events by fiqh and economics keywords', () => {
            const engine = new SheikhaHistoricalEngine();
            const results = engine.searchEvents('الزكاة');

            expect(results.length).toBeGreaterThan(0);
            expect(results.some(item => item.code === 'ZAKAT_LEGISLATED')).toBe(true);
        });

        it('16) provides normalized timeline entries', () => {
            const engine = new SheikhaHistoricalEngine();
            const timeline = engine.getTimeline();
            const allEvents = engine.getAllEvents();

            expect(timeline.length).toBe(allEvents.length);
            expect(timeline[0]).toHaveProperty('year');
            expect(timeline[0]).toHaveProperty('code');
        });

        it('17) exposes eight historical engine specifications', () => {
            const engine = new SheikhaHistoricalEngine();
            const specs = engine.getSpecifications();

            expect(specs.length).toBe(8);
            expect(specs.some(spec => spec.code === 'SIX_ERAS')).toBe(true);
        });

        it('18) keeps contemporary era linked to digital activation events', () => {
            const engine = new SheikhaHistoricalEngine();
            const contemporary = engine.getEra('ERA-06');

            expect(contemporary.events.length).toBe(8);
            expect(contemporary.events.some(item => item.code === 'HISTORICAL_ENGINE')).toBe(true);
        });
    });

    describe('Jawami Al-Kalim System', () => {
        it('19) returns comprehensive report with expected counts', () => {
            const system = new SheikhaJawamilKalimSystem();
            const report = system.getComprehensiveReport();

            expect(report.jawami_principles).toBe(5);
            expect(report.divine_boundaries).toBe(7);
            expect(report.conciseness_engines).toBe(5);
            expect(report.enforcement_levels).toBe(3);
        });

        it('20) applies concise transformation with high clarity and impact scores', () => {
            const system = new SheikhaJawamilKalimSystem();
            const result = system.applyJawamiKalim('العدل أساس البيع والشراء ومنع الربا والغش.');

            expect(result.concise_form.shortened).toContain('نسخة مختصرة');
            expect(result.key_points.length).toBe(5);
            expect(result.clarity_score).toBeGreaterThanOrEqual(90);
            expect(result.impact_score).toBeGreaterThanOrEqual(90);
        });
    });
});
