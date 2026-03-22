#!/usr/bin/env node
'use strict';

const baseUrl = process.env.SHEIKHA_LOAD_BASE_URL || 'http://127.0.0.1:8080';
const totalRequests = Number(process.env.SHEIKHA_LOAD_TOTAL_REQUESTS || 120);
const concurrency = Number(process.env.SHEIKHA_LOAD_CONCURRENCY || 4);

let ok = 0;
let failed = 0;
let totalLatency = 0;

async function hitOnce() {
    const start = Date.now();
    try {
        const response = await fetch(`${baseUrl}/api/health`);
        if (response.ok) {
            ok += 1;
        } else {
            failed += 1;
        }
    } catch (_error) {
        failed += 1;
    } finally {
        totalLatency += (Date.now() - start);
    }
}

async function worker(share) {
    for (let i = 0; i < share; i += 1) {
        await hitOnce();
    }
}

async function main() {
    const each = Math.ceil(totalRequests / concurrency);
    await Promise.all(Array.from({ length: concurrency }, () => worker(each)));

    const total = ok + failed;
    const avgLatencyMs = total > 0 ? Number((totalLatency / total).toFixed(2)) : 0;
    const successRate = total > 0 ? Number(((ok / total) * 100).toFixed(2)) : 0;

    const result = {
        success: successRate >= 95,
        baseUrl,
        totalRequests,
        concurrency,
        requests: total,
        ok,
        failed,
        successRate,
        avgLatencyMs,
        timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(result, null, 4));
    process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
    console.error(JSON.stringify({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
    }, null, 4));
    process.exit(1);
});
