import { describe, expect, it } from 'vitest';

const SheikhaHadithStandardsEngine = require('../../lib/sheikha-hadith-standards-engine');
const SheikhaHistoricalEngine = require('../../lib/sheikha-historical-engine');
const SheikhaJawamilKalimSystem = require('../../lib/sheikha-jawami-kalim-system');

describe('Sharia Neural Golden Tests', () => {
    it('golden: hadith dashboard summary remains stable', () => {
        const engine = new SheikhaHadithStandardsEngine();
        const summary = engine.getDashboard().summary;

        const expected = {
            measureUnits: 8,
            antiManipulationRules: 6,
            tradeFoundationHadiths: 8,
            prohibitionHadiths: 11,
            exchangeHadiths: 5,
            marketRegulationHadiths: 6,
            tradeEthicsHadiths: 8,
            zakatHadiths: 5,
            hisbahHadiths: 4,
            totalHadiths: 48,
            structureLayers: 8,
            designPrinciples: 8,
            totalActiveRules: 62
        };

        expect(summary).toEqual(expected);
    });

    it('golden: hadith corpus canonical codes are preserved', () => {
        const engine = new SheikhaHadithStandardsEngine();
        const all = engine.getAllHadiths();

        expect(all.length).toBe(48);
        expect(all.some(item => item.code === 'ABSOLUTE_NO_RIBA')).toBe(true);
        expect(all.some(item => item.code === 'SIX_RIBA_ITEMS')).toBe(true);
        expect(all.some(item => item.code === 'PROPHET_INSPECTOR')).toBe(true);
    });

    it('golden: compliant transaction check stays fully valid', () => {
        const engine = new SheikhaHadithStandardsEngine();
        const result = engine.validateTransaction({
            standardUsed: true,
            consent: true,
            sessionOption: true,
            ownershipVerified: true,
            instantSettlement: true,
            transparent: true,
            documented: true
        });

        expect(result).toMatchObject({
            totalChecks: 16,
            passed: 16,
            failed: 0,
            valid: true,
            failedLayers: []
        });
    });

    it('golden: prohibited transaction remains blocked in specific layers', () => {
        const engine = new SheikhaHadithStandardsEngine();
        const result = engine.validateTransaction({
            consent: true,
            fraud: true,
            riba: true,
            harmful: true,
            ownershipVerified: false
        });

        expect(result.valid).toBe(false);
        expect(result.failedLayers).toEqual(expect.arrayContaining(['محرمات', 'التنظيم']));
        expect(result.failed).toBeGreaterThanOrEqual(3);
    });

    it('golden: conversion matrix keeps prophetic equivalence', () => {
        const engine = new SheikhaHadithStandardsEngine();

        const saaToMudd = engine.convertToStandard(1, 'صاع', 'مد');
        const dinarToMithqal = engine.convertToStandard(1, 'دينار', 'مثقال');
        const wasqToSaa = engine.convertToStandard(1, 'وسق', 'صاع');

        expect(saaToMudd.value).toBeCloseTo(4, 3);
        expect(dinarToMithqal.value).toBeCloseTo(1, 3);
        expect(wasqToSaa.value).toBeCloseTo(60, 3);
    });

    it('golden: historical dashboard and timeline totals remain stable', () => {
        const engine = new SheikhaHistoricalEngine();
        const dashboard = engine.getDashboard();
        const timeline = engine.getTimeline();

        expect(dashboard.summary).toMatchObject({
            totalEras: 6,
            totalEvents: 60,
            quranicLaws: 12,
            sunnahLaws: 12,
            totalLaws: 36,
            specifications: 8
        });

        expect(timeline.length).toBe(60);
    });

    it('golden: historical canonical events remain discoverable', () => {
        const engine = new SheikhaHistoricalEngine();
        const all = engine.getAllEvents();

        expect(all.some(item => item.code === 'SOUQ_FOUNDED')).toBe(true);
        expect(all.some(item => item.code === 'ISLAMIC_CURRENCY')).toBe(true);
        expect(all.some(item => item.code === 'SHEIKHA_FOUNDED')).toBe(true);
        expect(all.some(item => item.code === 'HISTORICAL_ENGINE')).toBe(true);
    });

    it('golden: jawami report structure remains fixed', () => {
        const system = new SheikhaJawamilKalimSystem();
        const report = system.getComprehensiveReport();

        expect(report).toMatchObject({
            jawami_principles: 5,
            divine_boundaries: 7,
            conciseness_engines: 5,
            enforcement_levels: 3
        });
    });

    it('golden: jawami text transformation metrics stay deterministic', () => {
        const system = new SheikhaJawamilKalimSystem();
        const result = system.applyJawamiKalim('العدل والصدق والأمانة أساس التعامل.');

        expect(result.concise_form).toEqual({
            shortened: 'نسخة مختصرة من النص (اختصار ≈ 70%)',
            preserved_meaning: 'الجوهر والمعنى محفوظ بالكامل',
            technique: 'حذف الزوائد + اختيار كلمات قوية'
        });

        expect(result.benefits).toEqual({
            time_saved: '30-50%',
            comprehension_improved: '++40%',
            memorability: 'أعلى بـ 3x',
            application_ease: 'جداً بسيط',
            spread_speed: '5x أسرع'
        });

        expect(result.clarity_score).toBe(95);
        expect(result.impact_score).toBe(98);
    });
});
