#!/usr/bin/env node
'use strict';

require('dotenv').config();

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '256kb' }));

const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v20.0';
const DEFAULT_PIXEL_ID = process.env.META_PIXEL_ID || '4383900581880844';
const META_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const PORT = Number(process.env.META_CAPI_PORT || process.env.PORT || 3090);

const marketSegments = {
    '/metals': {
        pixel: process.env.META_PIXEL_ID_METALS || DEFAULT_PIXEL_ID,
        name: 'metals'
    },
    '/scrap': {
        pixel: process.env.META_PIXEL_ID_SCRAP || DEFAULT_PIXEL_ID,
        name: 'scrap'
    },
    '/precious': {
        pixel: process.env.META_PIXEL_ID_PRECIOUS || DEFAULT_PIXEL_ID,
        name: 'precious'
    },
    '/rare': {
        pixel: process.env.META_PIXEL_ID_RARE || DEFAULT_PIXEL_ID,
        name: 'rare'
    },
    '/now': {
        pixel: process.env.META_PIXEL_ID_NOW || DEFAULT_PIXEL_ID,
        name: 'now'
    }
};

function hashSha256(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
        return null;
    }

    return crypto.createHash('sha256').update(normalized).digest('hex');
}

function readCookieValue(req, key) {
    if (!req || !req.headers) {
        return null;
    }

    const cookieHeader = req.headers.cookie || '';
    if (!cookieHeader) {
        return null;
    }

    const parts = cookieHeader.split(';');
    for (const part of parts) {
        const [k, ...rest] = part.trim().split('=');
        if (k === key) {
            return decodeURIComponent(rest.join('='));
        }
    }

    return null;
}

function parseClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim();
    }

    return req.ip || null;
}

function normalizeEventName(eventName) {
    if (!eventName || typeof eventName !== 'string') {
        return null;
    }

    return eventName.trim();
}

function validateRequest(body) {
    const issues = [];

    if (!body || typeof body !== 'object') {
        issues.push('invalid_body');
        return issues;
    }

    if (!body.market_path || !marketSegments[body.market_path]) {
        issues.push('invalid_market_path');
    }

    const normalizedName = normalizeEventName(body.event_name);
    if (!normalizedName) {
        issues.push('invalid_event_name');
    }

    if (!body.event_id || typeof body.event_id !== 'string') {
        issues.push('invalid_event_id');
    }

    if (body.action_source && typeof body.action_source === 'string') {
        const allowed = ['website', 'system', 'phone_call', 'chat', 'email', 'physical_store', 'other'];
        if (!allowed.includes(body.action_source.trim())) {
            issues.push('invalid_action_source');
        }
    }

    if (body.event_time && !Number.isFinite(Number(body.event_time))) {
        issues.push('invalid_event_time');
    }

    return issues;
}

app.get('/', (req, res) => {
    res.json({
        success: true,
        service: 'sheikha-capi-gateway',
        message: 'Gateway is running',
        health: '/sheikha/track/health',
        track: '/sheikha/track',
        timestamp: new Date().toISOString()
    });
});

app.get('/sheikha/track/health', (req, res) => {
    const segmentStatus = Object.fromEntries(
        Object.entries(marketSegments).map(([path, segment]) => [
            path,
            {
                name: segment.name,
                pixel: segment.pixel
            }
        ])
    );

    res.json({
        success: true,
        service: 'sheikha-capi-gateway',
        apiVersion: API_VERSION,
        tokenConfigured: Boolean(META_ACCESS_TOKEN),
        defaultPixelId: DEFAULT_PIXEL_ID,
        markets: segmentStatus,
        timestamp: new Date().toISOString()
    });
});

app.post('/sheikha/track', async (req, res) => {
    const issues = validateRequest(req.body);
    if (issues.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'مدخلات غير صالحة',
            issues,
            timestamp: new Date().toISOString()
        });
    }

    const {
        market_path: marketPath,
        event_name: eventName,
        event_id: eventId,
        email,
        phone,
        value,
        currency = 'SAR',
        action_source: actionSource = 'website',
        event_time: eventTime,
        attribution_data: attributionData,
        dry_run: dryRun = false,
        custom_data: customData = {},
        user_data_extra: userDataExtra = {}
    } = req.body;

    const market = marketSegments[marketPath];
    const requestBody = {
        data: [
            {
                event_name: normalizeEventName(eventName),
                event_time: Number.isFinite(Number(eventTime)) ? Number(eventTime) : Math.floor(Date.now() / 1000),
                event_id: eventId,
                action_source: actionSource,
                user_data: {
                    em: hashSha256(email),
                    ph: hashSha256(phone),
                    client_ip_address: parseClientIp(req),
                    client_user_agent: req.headers['user-agent'] || null,
                    fbp: readCookieValue(req, '_fbp'),
                    fbc: readCookieValue(req, '_fbc'),
                    ...userDataExtra
                },
                custom_data: {
                    currency,
                    value: Number.isFinite(Number(value)) ? Number(value) : 0,
                    market_segment: market.name,
                    ...customData
                },
                attribution_data: attributionData && typeof attributionData === 'object' ? attributionData : undefined
            }
        ]
    };

    if (dryRun) {
        return res.json({
            success: true,
            message: 'DRY_RUN_OK',
            market: market.name,
            pixel_used: market.pixel,
            request_preview: requestBody,
            timestamp: new Date().toISOString()
        });
    }

    if (!META_ACCESS_TOKEN) {
        return res.status(503).json({
            success: false,
            message: 'META_CAPI_ACCESS_TOKEN غير مضبوط في البيئة',
            code: 'TOKEN_MISSING',
            timestamp: new Date().toISOString()
        });
    }

    const endpoint = `https://graph.facebook.com/${API_VERSION}/${market.pixel}/events?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`;

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timer);

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            return res.status(502).json({
                success: false,
                message: 'فشل إرسال الحدث إلى Meta CAPI',
                market: market.name,
                pixel_used: market.pixel,
                meta_status: response.status,
                meta_response: payload,
                timestamp: new Date().toISOString()
            });
        }

        return res.json({
            success: true,
            message: 'تم إرسال الحدث إلى Meta بنجاح',
            market: market.name,
            pixel_used: market.pixel,
            events_received: payload.events_received || 0,
            fbtrace_id: payload.fbtrace_id || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'CAPI_SEND_FAILED',
            details: error && error.message ? error.message : 'unknown_error',
            timestamp: new Date().toISOString()
        });
    }
});

async function probeExistingGateway(port) {
    const healthUrl = `http://127.0.0.1:${port}/sheikha/track/health`;

    try {
        const response = await fetch(healthUrl);
        if (!response.ok) {
            return false;
        }

        const payload = await response.json().catch(() => ({}));
        return payload && payload.service === 'sheikha-capi-gateway';
    } catch {
        return false;
    }
}

const server = app.listen(PORT, () => {
    const tokenState = META_ACCESS_TOKEN ? 'configured' : 'missing';
    console.log(`[SHEIKHA-CAPI] running on :${PORT} | token=${tokenState} | defaultPixel=${DEFAULT_PIXEL_ID}`);
});

server.on('error', async (error) => {
    if (error && error.code === 'EADDRINUSE') {
        const sameGateway = await probeExistingGateway(PORT);
        if (sameGateway) {
            console.log(`[SHEIKHA-CAPI] port ${PORT} already in use by an existing sheikha-capi-gateway instance; reusing running service.`);
            process.exit(0);
            return;
        }

        console.error(`[SHEIKHA-CAPI] port ${PORT} is in use by another process.`);
        process.exit(1);
        return;
    }

    console.error('[SHEIKHA-CAPI] startup error:', error && error.message ? error.message : error);
    process.exit(1);
});
