/**
 * بسم الله الرحمن الرحيم
 * التكيف الجغرافي الآلي + تفعيل الشبكة العصبية الجذرية
 */

'use strict';

const express = require('express');
const rootNeuralNetwork = require('../lib/sheikha-root-neural-network');

const router = express.Router();

const REGION_MAP = {
    SA: { countryAr: 'المملكة العربية السعودية', scope: 'country', continent: 'asia', profile: 'saudi' },
    AE: { countryAr: 'الإمارات العربية المتحدة', scope: 'country', continent: 'asia', profile: 'gcc' },
    KW: { countryAr: 'الكويت', scope: 'country', continent: 'asia', profile: 'gcc' },
    QA: { countryAr: 'قطر', scope: 'country', continent: 'asia', profile: 'gcc' },
    BH: { countryAr: 'البحرين', scope: 'country', continent: 'asia', profile: 'gcc' },
    OM: { countryAr: 'عُمان', scope: 'country', continent: 'asia', profile: 'gcc' },
    EG: { countryAr: 'مصر', scope: 'country', continent: 'africa', profile: 'mena' },
    MA: { countryAr: 'المغرب', scope: 'country', continent: 'africa', profile: 'mena' },
    DZ: { countryAr: 'الجزائر', scope: 'country', continent: 'africa', profile: 'mena' },
    TR: { countryAr: 'تركيا', scope: 'country', continent: 'asia', profile: 'regional' },
    GB: { countryAr: 'المملكة المتحدة', scope: 'country', continent: 'europe', profile: 'global' },
    FR: { countryAr: 'فرنسا', scope: 'country', continent: 'europe', profile: 'global' },
    DE: { countryAr: 'ألمانيا', scope: 'country', continent: 'europe', profile: 'global' },
    US: { countryAr: 'الولايات المتحدة', scope: 'country', continent: 'north-america', profile: 'global' },
    CA: { countryAr: 'كندا', scope: 'country', continent: 'north-america', profile: 'global' }
};

function normalizeCountryCode(value) {
    if (!value || typeof value !== 'string') {
        return 'SA';
    }

    const code = value.trim().toUpperCase();
    if (code.length === 2) {
        return code;
    }

    if (code === 'SAUDI' || code === 'KSA') {
        return 'SA';
    }

    return 'SA';
}

function resolveGeoContext(req) {
    const headerCountry = req.headers['cf-ipcountry'] || req.headers['x-country-code'];
    const bodyCountry = req.body?.countryCode;
    const queryCountry = req.query?.countryCode;
    const countryCode = normalizeCountryCode(bodyCountry || queryCountry || headerCountry);

    const mapped = REGION_MAP[countryCode] || {
        countryAr: 'غير محدد',
        scope: 'global',
        continent: 'global',
        profile: 'global'
    };

    const language = req.headers['accept-language'] || 'ar-SA';
    const timezone = req.body?.timezone || 'Asia/Riyadh';

    return {
        countryCode,
        countryAr: mapped.countryAr,
        scope: mapped.scope,
        continent: mapped.continent,
        profile: mapped.profile,
        language,
        timezone,
        mode: countryCode === 'SA' ? 'saudi-priority' : 'global-adaptive'
    };
}

function buildFeatureSet(profile) {
    if (profile === 'saudi') {
        return {
            shariaFeatures: [0, 0, 0, 0, 0, 1, 1, 1],
            riskFeatures: [0.4, 0.35, 0.2, 0.9, 0.9, 0.8, 0.85, 0.9],
            marketFeatures: [1, 0.85, 0.8, 0.7, 0.6, 0.5],
            govFeatures: [1, 0.2, 0.95, 0.9, 0.9, 1, 0.95, 0.95]
        };
    }

    if (profile === 'gcc' || profile === 'mena') {
        return {
            shariaFeatures: [0, 0, 0, 0, 0, 1, 1, 1],
            riskFeatures: [0.5, 0.4, 0.25, 0.85, 0.85, 0.75, 0.8, 0.8],
            marketFeatures: [0.95, 0.8, 0.75, 0.65, 0.55, 0.5],
            govFeatures: [1, 0.25, 0.9, 0.88, 0.88, 0.95, 0.9, 0.9]
        };
    }

    return {
        shariaFeatures: [0, 0, 0, 0, 0, 1, 1, 1],
        riskFeatures: [0.55, 0.5, 0.3, 0.8, 0.8, 0.7, 0.75, 0.75],
        marketFeatures: [0.9, 0.75, 0.7, 0.6, 0.5, 0.45],
        govFeatures: [1, 0.3, 0.88, 0.85, 0.85, 0.92, 0.88, 0.88]
    };
}

async function ensureRootNetwork() {
    await rootNeuralNetwork.ensureBooted();
    return rootNeuralNetwork.getStatus();
}

router.get('/status', async (req, res) => {
    try {
        const geo = resolveGeoContext(req);
        const rootStatus = await ensureRootNetwork();

        return res.status(200).json({
            success: true,
            data: {
                geography: geo,
                rootNeural: {
                    status: rootStatus.status,
                    bootTimeMs: rootStatus.bootTimeMs,
                    totalCells: rootStatus.architecture.totalCells
                }
            },
            message: 'تم تفعيل التكيف الجغرافي والشبكة العصبية الجذرية بنجاح.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: 'تعذر فحص حالة التكيف الجغرافي.',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

router.post('/resolve', async (req, res) => {
    try {
        const geo = resolveGeoContext(req);
        const featureSet = buildFeatureSet(geo.profile);
        const rootStatus = await ensureRootNetwork();

        return res.status(200).json({
            success: true,
            data: {
                geography: geo,
                adaptation: {
                    level: geo.scope,
                    mode: geo.mode,
                    profile: geo.profile,
                    featureSet
                },
                rootNeural: {
                    status: rootStatus.status,
                    totalInferences: rootStatus.stats.totalInferences
                }
            },
            message: 'تم تحديد إعدادات التكيف الآلي حسب المنطقة الجغرافية.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: 'تعذر تنفيذ التكيف الجغرافي الآلي.',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

router.post('/root-neural/activate', async (req, res) => {
    try {
        const geo = resolveGeoContext(req);
        await ensureRootNetwork();

        const context = {
            targetCountry: geo.countryCode,
            ...buildFeatureSet(geo.profile)
        };

        const decision = rootNeuralNetwork.orchestrate(context);

        return res.status(200).json({
            success: true,
            data: {
                geography: geo,
                decision,
                rootNeuralStatus: rootNeuralNetwork.getStatus()
            },
            message: 'تم تفعيل شبكة الخلايا العصبية الجذرية وفق المنطقة الجغرافية.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: 'تعذر تفعيل الشبكة العصبية الجذرية.',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

module.exports = router;
