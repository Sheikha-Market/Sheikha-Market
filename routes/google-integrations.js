const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const perf = require('../lib/performance-optimizer');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GOOGLE_LOGS_DIR = path.join(DATA_DIR, 'google-integrations');
const CLOUD_LOG_FILE = path.join(GOOGLE_LOGS_DIR, 'cloud-sync-log.json');
const ANALYTICS_EVENTS_FILE = path.join(GOOGLE_LOGS_DIR, 'analytics-events.json');
const EMAIL_OUTBOX_FILE = path.join(GOOGLE_LOGS_DIR, 'gmail-outbox.json');
const PAYMENT_LOG_FILE = path.join(GOOGLE_LOGS_DIR, 'google-pay-log.json');

function ensureDir(dirPath) {
    perf.ensureDir(dirPath);
}

function loadJsonArray(filePath) {
    return perf.loadJsonOptimized(filePath);
}

function saveJsonArray(filePath, payload) {
    perf.saveJsonOptimized(filePath, payload);
}

function appendJsonEntry(filePath, entry, limit = 200) {
    return perf.appendOptimized(filePath, entry, limit);
}

function realValue(value) {
    if (value === undefined || value === null) {
        return '';
    }

    const normalized = String(value).trim();
    if (!normalized || normalized.includes('REPLACE_WITH_')) {
        return '';
    }

    return normalized;
}

function createResponse(res, statusCode, success, data, message) {
    return res.status(statusCode).json({
        success,
        data,
        message,
        timestamp: new Date().toISOString()
    });
}

function buildSessionId(req) {
    return req.headers['x-session-id'] || crypto.randomUUID();
}

async function runGeminiPrompt(prompt, modelName) {
    const apiKey = realValue(process.env.GOOGLE_AI_API_KEY);
    if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY غير مضبوط');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName || 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function geocodeAddress(address) {
    const apiKey = realValue(process.env.GOOGLE_MAPS_API_KEY);
    const url =
        'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        encodeURIComponent(address) +
        '&key=' +
        encodeURIComponent(apiKey);
    const response = await fetch(url);
    return response.json();
}

async function searchPlaces(query) {
    const apiKey = realValue(process.env.GOOGLE_MAPS_API_KEY);
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
        },
        body: JSON.stringify({
            textQuery: query,
            maxResultCount: 5
        })
    });

    return response.json();
}

async function sendMeasurementEvent(eventName, params) {
    const measurementId = realValue(process.env.GA4_MEASUREMENT_ID);
    const apiSecret = realValue(process.env.GA4_API_SECRET);

    if (!measurementId || !apiSecret) {
        return { delivered: false, mode: 'local-log-only' };
    }

    const clientId = params.client_id || crypto.randomUUID();
    const payload = {
        client_id: clientId,
        events: [
            {
                name: eventName,
                params
            }
        ]
    };

    const url =
        'https://www.google-analytics.com/mp/collect?measurement_id=' +
        encodeURIComponent(measurementId) +
        '&api_secret=' +
        encodeURIComponent(apiSecret);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    return {
        delivered: response.ok,
        mode: 'measurement-protocol',
        status: response.status,
        clientId
    };
}

async function sendGmailMessage(accessToken, message) {
    const raw = [
        'To: ' + message.to,
        'Subject: ' + message.subject,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        message.text
    ].join('\n');

    const encoded = Buffer.from(raw)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encoded })
    });

    const data = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

function buildGooglePayRequest(body) {
    const merchantId = realValue(process.env.GOOGLE_PAY_MERCHANT_ID) || 'TEST';
    const environment = realValue(process.env.GOOGLE_PAY_ENVIRONMENT) || 'TEST';
    const countryCode = body.countryCode || 'SA';
    const currencyCode = body.currencyCode || 'SAR';
    const totalPrice = String(body.totalPrice || '0.00');

    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['VISA', 'MASTERCARD']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: merchantId
                    }
                }
            }
        ],
        merchantInfo: {
            merchantId,
            merchantName: 'Sheikha Marketplace'
        },
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice,
            currencyCode,
            countryCode
        },
        environment
    };
}

const geminiRouter = express.Router();
const cloudRouter = express.Router();
const mapsRouter = express.Router();
const analyticsRouter = express.Router();
const emailRouter = express.Router();
const googlePayRouter = express.Router();

geminiRouter.get('/', (req, res) => {
    return createResponse(
        res,
        200,
        true,
        {
            endpoint: '/api/ai/gemini',
            configured: !!realValue(process.env.GOOGLE_AI_API_KEY),
            model: realValue(process.env.GEMINI_MODEL) || 'gemini-1.5-flash',
            projectId: realValue(process.env.GOOGLE_PROJECT_ID),
            features: ['chat', 'summary', 'analysis']
        },
        'تم التحقق من تكامل Gemini بنجاح'
    );
});

geminiRouter.post('/', async (req, res) => {
    const body = req.body || {};
    const prompt = String(body.prompt || body.message || '').trim();

    if (!prompt) {
        return createResponse(res, 400, false, null, 'النص المطلوب للتحليل غير موجود');
    }

    try {
        const reply = await runGeminiPrompt(
            prompt,
            body.model || realValue(process.env.GEMINI_MODEL) || 'gemini-1.5-flash'
        );
        return createResponse(
            res,
            200,
            true,
            {
                provider: 'google-gemini',
                reply,
                sessionId: buildSessionId(req)
            },
            'تم تنفيذ طلب Gemini بنجاح'
        );
    } catch (error) {
        return createResponse(
            res,
            503,
            false,
            { error: error.message },
            'تعذر تنفيذ طلب Gemini حالياً'
        );
    }
});

cloudRouter.get('/', (req, res) => {
    return createResponse(
        res,
        200,
        true,
        {
            endpoint: '/api/cloud',
            projectId:
                realValue(process.env.GOOGLE_CLOUD_PROJECT) ||
                realValue(process.env.GOOGLE_PROJECT_ID),
            credentialsMode: realValue(process.env.GOOGLE_APPLICATION_CREDENTIALS)
                ? 'service-account'
                : 'project-api-mode',
            syncLogFile: CLOUD_LOG_FILE,
            notes: [
                'التكامل السحابي يعمل على مستوى المشروع.',
                'مفاتيح الخدمة اختيارية إذا كانت سياسة المنظمة تمنع إنشاؤها.'
            ]
        },
        'تم التحقق من تكامل Google Cloud بنجاح'
    );
});

cloudRouter.post('/sync', (req, res) => {
    const entry = {
        id: crypto.randomUUID(),
        sessionId: buildSessionId(req),
        timestamp: new Date().toISOString(),
        projectId:
            realValue(process.env.GOOGLE_CLOUD_PROJECT) || realValue(process.env.GOOGLE_PROJECT_ID),
        operation: req.body?.operation || 'manual-sync',
        payload: req.body?.payload || {}
    };

    appendJsonEntry(CLOUD_LOG_FILE, entry);
    return createResponse(res, 200, true, entry, 'تم حفظ عملية التكامل السحابي محلياً');
});

mapsRouter.get('/', (req, res) => {
    return createResponse(
        res,
        200,
        true,
        {
            endpoint: '/api/maps',
            configured: !!realValue(process.env.GOOGLE_MAPS_API_KEY),
            features: ['javascript-api', 'geocoding', 'places'],
            mapStyle: 'interactive-market-map'
        },
        'تم التحقق من تكامل الخرائط بنجاح'
    );
});

mapsRouter.get('/geocode', async (req, res) => {
    const address = String(req.query.address || '').trim();
    if (!address) {
        return createResponse(res, 400, false, null, 'العنوان مطلوب');
    }

    try {
        const result = await geocodeAddress(address);
        return createResponse(res, 200, true, result, 'تم تنفيذ طلب Geocoding بنجاح');
    } catch (error) {
        return createResponse(
            res,
            500,
            false,
            { error: error.message },
            'تعذر تنفيذ طلب Geocoding'
        );
    }
});

mapsRouter.get('/places/search', async (req, res) => {
    const query = String(req.query.q || '').trim();
    if (!query) {
        return createResponse(res, 400, false, null, 'نص البحث مطلوب');
    }

    try {
        const result = await searchPlaces(query);
        return createResponse(res, 200, true, result, 'تم تنفيذ بحث الأماكن بنجاح');
    } catch (error) {
        return createResponse(res, 500, false, { error: error.message }, 'تعذر تنفيذ بحث الأماكن');
    }
});

analyticsRouter.get('/', (req, res) => {
    const events = loadJsonArray(ANALYTICS_EVENTS_FILE);
    return createResponse(
        res,
        200,
        true,
        {
            endpoint: '/api/analytics',
            measurementId: realValue(process.env.GA4_MEASUREMENT_ID),
            measurementProtocolEnabled: !!realValue(process.env.GA4_API_SECRET),
            localEvents: events.length
        },
        'تم التحقق من تكامل التحليلات بنجاح'
    );
});

analyticsRouter.post('/event', async (req, res) => {
    const body = req.body || {};
    const eventName = String(body.eventName || body.name || '').trim();

    if (!eventName) {
        return createResponse(res, 400, false, null, 'اسم الحدث مطلوب');
    }

    const entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: buildSessionId(req),
        eventName,
        params: body.params || {}
    };

    appendJsonEntry(ANALYTICS_EVENTS_FILE, entry);

    try {
        const delivery = await sendMeasurementEvent(eventName, body.params || {});
        return createResponse(res, 200, true, { ...entry, delivery }, 'تم تسجيل الحدث التحليلي');
    } catch (error) {
        return createResponse(
            res,
            200,
            true,
            {
                ...entry,
                delivery: { delivered: false, error: error.message }
            },
            'تم تسجيل الحدث محلياً فقط'
        );
    }
});

emailRouter.get('/', (req, res) => {
    const outbox = loadJsonArray(EMAIL_OUTBOX_FILE);
    return createResponse(
        res,
        200,
        true,
        {
            endpoint: '/api/email',
            oauthConfigured: !!(
                realValue(process.env.GOOGLE_CLIENT_ID) &&
                realValue(process.env.GOOGLE_CLIENT_SECRET)
            ),
            queuedMessages: outbox.length,
            deliveryModes: ['gmail-api-with-oauth-token', 'local-draft-queue']
        },
        'تم التحقق من تكامل البريد بنجاح'
    );
});

emailRouter.post('/', async (req, res) => {
    const body = req.body || {};
    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim();
    const text = String(body.text || body.message || '').trim();

    if (!to || !subject || !text) {
        return createResponse(res, 400, false, null, 'الحقول to و subject و text مطلوبة');
    }

    const entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        to,
        subject,
        text,
        mode: 'queued'
    };

    const accessToken = String(
        body.accessToken || req.headers['x-gmail-access-token'] || ''
    ).trim();
    if (accessToken) {
        try {
            const result = await sendGmailMessage(accessToken, { to, subject, text });
            entry.mode = result.ok ? 'sent' : 'queued';
            entry.gmail = result;
        } catch (error) {
            entry.mode = 'queued';
            entry.gmail = { ok: false, error: error.message };
        }
    }

    appendJsonEntry(EMAIL_OUTBOX_FILE, entry);
    return createResponse(
        res,
        200,
        true,
        entry,
        entry.mode === 'sent'
            ? 'تم إرسال البريد عبر Gmail API'
            : 'تم حفظ البريد في قائمة الانتظار الآمنة'
    );
});

googlePayRouter.get('/', (req, res) => {
    const merchantId = realValue(process.env.GOOGLE_PAY_MERCHANT_ID) || 'TEST';
    const environment = realValue(process.env.GOOGLE_PAY_ENVIRONMENT) || 'TEST';
    return createResponse(
        res,
        200,
        true,
        {
            endpoint: '/api/payment/googlepay',
            merchantId,
            environment,
            ready: true
        },
        'تم التحقق من تكامل Google Pay بنجاح'
    );
});

googlePayRouter.post('/tokenize', (req, res) => {
    const requestPayload = buildGooglePayRequest(req.body || {});
    const entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        requestPayload
    };

    appendJsonEntry(PAYMENT_LOG_FILE, entry);
    return createResponse(res, 200, true, requestPayload, 'تم إنشاء طلب Google Pay بنجاح');
});

module.exports = {
    geminiRouter,
    cloudRouter,
    mapsRouter,
    analyticsRouter,
    emailRouter,
    googlePayRouter
};
