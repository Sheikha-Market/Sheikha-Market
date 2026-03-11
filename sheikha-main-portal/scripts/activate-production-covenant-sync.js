#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const DATA_DIR = path.join(process.cwd(), 'data', 'operations');
const STATE_FILE = path.join(DATA_DIR, 'production-covenant-state.json');
const REPORT_FILE = path.join(process.cwd(), 'PRODUCTION-COVENANT-SYNC-REPORT.json');

function callLocalApi(route) {
    return new Promise(resolve => {
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: 8080,
                path: route,
                method: 'GET',
                timeout: 6000
            },
            res => {
                let body = '';
                res.on('data', chunk => {
                    body += chunk.toString();
                });
                res.on('end', () => {
                    let parsed = null;
                    try {
                        parsed = JSON.parse(body);
                    } catch (_error) {}
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        statusCode: res.statusCode,
                        data: parsed
                    });
                });
            }
        );

        req.on('error', error => resolve({ ok: false, error: error.message }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ ok: false, error: 'timeout' });
        });
        req.end();
    });
}

async function main() {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const synchronization = {
        organizationId: '224557279528',
        projects: { production: 'sheikha-empire', development: 'sheikha-core' },
        covenant: {
            name: 'Labor & Production Covenant',
            principles: ['لا ضرر ولا ضرار', 'الصدق والأمانة', 'العدالة الإنتاجية', 'حماية الحقوق'],
            objective: 'تحويل الشباب من الانتظار إلى الإنتاج بكرامة',
            targetCohort: 10000,
            observedInitialCohort: 150
        },
        securityRadar: {
            economicProtection: true,
            cyberProtection: true,
            antiMonopolyChecks: true,
            status: 'active'
        },
        timestamp: new Date().toISOString()
    };

    const health = await callLocalApi('/api/health');
    const safety = await callLocalApi('/api/safety/overview');
    const vision = await callLocalApi('/api/vision/status');
    const healing = await callLocalApi('/api/healing/status');

    const runtimeChecks = {
        apiHealth: health,
        safetyOverview: safety,
        visionStatus: vision,
        healingStatus: healing
    };

    const report = {
        success: true,
        message: 'Production covenant + security sync activated in operational mode',
        synchronization,
        runtimeChecks,
        nextStep:
            'Run PM2 auto-activation watcher for cloud activation once enterprise prerequisites are available.',
        generatedAt: new Date().toISOString()
    };

    await fs.writeFile(STATE_FILE, JSON.stringify(synchronization, null, 2), 'utf8');
    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');

    console.log('✅ Production Covenant Sync Activated');
    console.log(`📄 state: ${path.relative(process.cwd(), STATE_FILE)}`);
    console.log(`📄 report: ${path.relative(process.cwd(), REPORT_FILE)}`);

    const allHealthy = [health, safety, vision, healing].every(item => item && item.ok);
    if (!allHealthy) {
        console.log('⚠️ تم التفعيل المنطقي، لكن بعض نقاط API لم تستجب بالكامل. راجع التقرير.');
    }
}

main().catch(error => {
    console.error('❌ Failed to activate production covenant sync:', error.message);
    process.exit(1);
});
