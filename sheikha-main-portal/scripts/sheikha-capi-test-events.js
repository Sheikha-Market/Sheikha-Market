#!/usr/bin/env node
'use strict';

require('dotenv').config();

const baseUrl = process.env.META_CAPI_GATEWAY_URL || `http://127.0.0.1:${process.env.META_CAPI_PORT || 3090}`;
const endpoint = `${baseUrl}/sheikha/track`;

const markets = ['/metals', '/scrap', '/precious', '/rare', '/now'];

function buildPayload(marketPath) {
    const now = Date.now();

    return {
        market_path: marketPath,
        event_name: 'Purchase',
        event_id: `dry_${marketPath.replace('/', '')}_${now}`,
        email: 'test@sheikha.top',
        phone: '+966500000000',
        value: 100,
        currency: 'SAR',
        dry_run: true,
        custom_data: {
            source: 'sheikha-capi-test-events',
            market_path: marketPath
        }
    };
}

async function postJson(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const payload = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, payload };
}

async function main() {
    const summary = [];

    for (const marketPath of markets) {
        try {
            const result = await postJson(endpoint, buildPayload(marketPath));
            summary.push({
                market: marketPath,
                ok: result.ok,
                status: result.status,
                message: result.payload.message || null,
                pixel: result.payload.pixel_used || null
            });
        } catch (error) {
            summary.push({
                market: marketPath,
                ok: false,
                status: 0,
                message: error.message,
                pixel: null
            });
        }
    }

    const passed = summary.filter((item) => item.ok).length;
    const failed = summary.length - passed;

    console.log('SHEIKHA_CAPI_TEST_SUMMARY');
    console.log(JSON.stringify({
        gateway: endpoint,
        total: summary.length,
        passed,
        failed,
        summary,
        timestamp: new Date().toISOString()
    }, null, 2));

    if (failed > 0) {
        process.exitCode = 1;
    }
}

main();
