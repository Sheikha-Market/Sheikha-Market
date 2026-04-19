// بسم الله الرحمن الرحيم
/**
 * routes/sheikha-vitality.js
 * شيخة الحيوية — نبض المنظومة (تشبيه حي)
 */

'use strict';

const express = require('express');
const router = express.Router();
const SheikhaIntelligentDigitalCore = require('../lib/sheikha-intelligent-digital-core');

let vitalityCore = null;

function getCore() {
    if (!vitalityCore) {
        vitalityCore = new SheikhaIntelligentDigitalCore({
            offlineFirst: true,
            privacyFirst: true,
            islamicGovernanceStrict: true,
            vitalityEnabled: true
        });
        // تفعيل الحيوية تلقائياً عند أول تهيئة — لا يحتاج POST يدوي
        vitalityCore.activateVitalityMode({
            khairGoals: [
                { id: 'khair-1', title: 'زيادة أثر الخير على الناس', target: 100 },
                { id: 'khair-2', title: 'تمكين التجارة العادلة والشفافة', target: 100 }
            ],
            tijariGoals: [
                { id: 'tijari-1', title: 'تحقيق نمو ربحي مستدام', target: 100 },
                { id: 'tijari-2', title: 'رفع الكفاءة وتقليل الهدر', target: 100 }
            ]
        });
    }
    return vitalityCore;
}

router.get('/health', (req, res) => {
    const core = getCore();
    res.json({
        success: true,
        message: 'شيخة الحيوية مفعلة',
        timestamp: new Date().toISOString(),
        data: {
            initialized: true,
            vitalityEnabled: core.vitality?.enabled === true
        }
    });
});

router.post('/activate', (req, res) => {
    const core = getCore();
    const { khairGoals = [], tijariGoals = [], externalNetworks = {} } = req.body || {};

    const report = core.activateVitalityMode({ khairGoals, tijariGoals });

    if (externalNetworks && typeof externalNetworks === 'object') {
        core.vitality.liveNetworks.external = {
            ...core.vitality.liveNetworks.external,
            partners: Number(
                externalNetworks.partners || core.vitality.liveNetworks.external.partners || 0
            ),
            clients: Number(
                externalNetworks.clients || core.vitality.liveNetworks.external.clients || 0
            ),
            markets: Number(
                externalNetworks.markets || core.vitality.liveNetworks.external.markets || 0
            ),
            citiesConnected: Number(
                externalNetworks.citiesConnected ||
                    core.vitality.liveNetworks.external.citiesConnected ||
                    0
            )
        };
        core.recordVitalPulse({ channel: 'network', score: 5, type: 'external_network_update' });
    }

    return res.json({
        success: true,
        message: 'تم تفعيل شيخة الحيوية بنجاح',
        timestamp: new Date().toISOString(),
        data: report
    });
});

router.get('/status', (req, res) => {
    const core = getCore();
    const report = core.getVitalityReport();

    res.json({
        success: true,
        message: 'تقرير نبض شيخة الحيوية',
        timestamp: new Date().toISOString(),
        data: report
    });
});

router.post('/pulse', (req, res) => {
    const core = getCore();
    const {
        channel = 'internal',
        score = 0,
        type = 'manual',
        peopleHelped = 0,
        tradeValueEnabled = 0,
        jobsEnabled = 0,
        charitableActions = 0,
        educationalTransfers = 0
    } = req.body || {};

    const report = core.recordVitalPulse({
        channel,
        score,
        type,
        impact: {
            peopleHelped,
            tradeValueEnabled,
            jobsEnabled,
            charitableActions,
            educationalTransfers
        }
    });

    res.json({
        success: true,
        message: 'تم تحديث النبض الحيوي',
        timestamp: new Date().toISOString(),
        data: report
    });
});

router.post('/goals/:goalId/progress', (req, res) => {
    const core = getCore();
    const { goalId } = req.params;
    const { progressDelta = 0 } = req.body || {};

    const result = core.updateVitalGoal(goalId, progressDelta);

    if (!result.updated) {
        return res.status(404).json({
            success: false,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    }

    return res.json({
        success: true,
        message: 'تم تحديث الهدف الحيوي',
        timestamp: new Date().toISOString(),
        data: result
    });
});

router.get('/networks/live', (req, res) => {
    const core = getCore();
    const report = core.getVitalityReport();

    res.json({
        success: true,
        message: 'الشبكات الحية داخل وخارج المنظومة',
        timestamp: new Date().toISOString(),
        data: {
            internal: report.liveNetworks.internal,
            external: report.liveNetworks.external,
            pulseNetworks: report.pulse.networks,
            overall: report.pulse.overall,
            label: report.pulse.label
        }
    });
});

router.get('/impact', (req, res) => {
    const core = getCore();
    const report = core.getVitalityReport();

    res.json({
        success: true,
        message: 'الأثر الحيوي للمنظومة',
        timestamp: new Date().toISOString(),
        data: {
            impact: report.impact,
            goals: report.goals,
            selfReliance: report.pulse.selfReliance,
            confidence: report.pulse.confidence,
            tawakkul: report.tawakkul,
            recommendation:
                report.pulse.overall >= 75
                    ? 'المنظومة حيوية وقوية — استمر في تعظيم الأثر'
                    : 'ارفع نبض الشبكات الحية وتقدم الأهداف لتعزيز الحيوية'
        }
    });
});

module.exports = router;
