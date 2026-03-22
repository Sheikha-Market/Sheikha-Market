#!/usr/bin/env node
'use strict';

const baseUrl = process.env.SHEIKHA_UI_BASE_URL || 'http://127.0.0.1:8080';

async function main() {
    const rootResponse = await fetch(`${baseUrl}/`);
    if (!rootResponse.ok) {
        throw new Error(`Root page failed with status ${rootResponse.status}`);
    }

    const rootHtml = await rootResponse.text();
    if (!rootHtml || rootHtml.length < 200) {
        throw new Error('Root page content is unexpectedly small');
    }

    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (!healthResponse.ok) {
        throw new Error(`Health API failed with status ${healthResponse.status}`);
    }

    const health = await healthResponse.json();
    if (health.status !== 'ok') {
        throw new Error('Health API did not return status=ok');
    }

    console.log(JSON.stringify({
        success: true,
        baseUrl,
        message: 'UI smoke test passed',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main().catch((error) => {
    console.error(JSON.stringify({
        success: false,
        baseUrl,
        message: error.message,
        timestamp: new Date().toISOString()
    }, null, 4));
    process.exit(1);
});
