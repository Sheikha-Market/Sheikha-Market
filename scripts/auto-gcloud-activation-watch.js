#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const intervalSeconds = Number(process.env.ACTIVATION_WATCH_INTERVAL || 60);
const maxAttempts = Number(process.env.ACTIVATION_WATCH_MAX_ATTEMPTS || 0);
const billingAccount = process.env.BILLING_ACCOUNT || '';
const operatorPrincipal = process.env.OPERATOR_PRINCIPAL || 'user:market@sheikha.top';
const organizationId = process.env.ORG_ID || '224557279528';
const reportPath = path.join(process.cwd(), 'AUTO-GCLOUD-ACTIVATION-STATUS.json');

function run(command) {
    try {
        const output = execSync(command, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
        return { ok: true, output: output.trim() };
    } catch (error) {
        return {
            ok: false,
            output: (error.stdout || '').toString().trim(),
            error: (error.stderr || error.message || '').toString().trim()
        };
    }
}

async function writeStatus(status) {
    await fs.writeFile(reportPath, JSON.stringify(status, null, 2), 'utf8');
}

function checkReadiness() {
    const checks = {
        gcloudInstalled: run('command -v gcloud'),
        activeAccount: run("gcloud auth list --filter=status:ACTIVE --format='value(account)'"),
        orgAccess: run(`gcloud organizations describe ${organizationId} --format='value(name)'`),
        billingProvided: {
            ok: Boolean(billingAccount),
            output: billingAccount ? 'set' : 'missing'
        },
        operatorProvided: { ok: Boolean(operatorPrincipal), output: operatorPrincipal || 'missing' }
    };

    const ready =
        checks.gcloudInstalled.ok &&
        checks.activeAccount.ok &&
        Boolean(checks.activeAccount.output) &&
        checks.orgAccess.ok &&
        checks.billingProvided.ok &&
        checks.operatorProvided.ok;

    return { ready, checks };
}

function activateNow() {
    const cmd = `BILLING_ACCOUNT=${billingAccount} OPERATOR_PRINCIPAL=${operatorPrincipal} npm run ops:gcloud:alliance:apply:enterprise`;
    return run(cmd);
}

async function main() {
    let attempt = 0;

    while (true) {
        attempt += 1;
        const now = new Date().toISOString();
        const readiness = checkReadiness();

        const status = {
            timestamp: now,
            attempt,
            intervalSeconds,
            maxAttempts,
            organizationId,
            billingAccount: billingAccount ? 'provided' : 'missing',
            operatorPrincipal,
            readiness
        };

        if (readiness.ready) {
            console.log(
                `✅ [Auto-Activation] الجاهزية مكتملة (المحاولة ${attempt}) — بدء التفعيل...`
            );
            const activation = activateNow();
            status.activation = {
                success: activation.ok,
                output: activation.output,
                error: activation.error || ''
            };
            await writeStatus(status);

            if (activation.ok) {
                console.log('✅ [Auto-Activation] تم التفعيل بنجاح.');
                process.exit(0);
            }

            console.log('❌ [Auto-Activation] محاولة التفعيل فشلت، سيستمر المراقب.');
        } else {
            console.log(`⏳ [Auto-Activation] غير جاهز بعد (المحاولة ${attempt}).`);
            await writeStatus(status);
        }

        if (maxAttempts > 0 && attempt >= maxAttempts) {
            console.log('⛔ [Auto-Activation] تم الوصول للحد الأقصى من المحاولات.');
            process.exit(1);
        }

        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    }
}

main().catch(async error => {
    await writeStatus({
        timestamp: new Date().toISOString(),
        fatal: true,
        error: error.message
    });
    console.error('❌ [Auto-Activation] خطأ قاتل:', error.message);
    process.exit(1);
});
