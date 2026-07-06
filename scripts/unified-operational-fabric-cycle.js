#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const runtimeDir = path.join(rootDir, 'runtime');
const historyDir = path.join(runtimeDir, 'history');
const auditsDir = path.join(runtimeDir, 'audits');
const timelineDir = path.join(runtimeDir, 'timeline');
const recoveryDir = path.join(runtimeDir, 'recovery');

function safeReadJson(filePath, fallbackValue = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallbackValue;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallbackValue;
    }
}

function safeWriteJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function toBoolean(value) {
    const s = String(value || '').trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function runCommand(command) {
    try {
        return {
            ok: true,
            output: execSync(command, {
                cwd: rootDir,
                stdio: ['ignore', 'pipe', 'pipe'],
                encoding: 'utf8'
            }).trim()
        };
    } catch (error) {
        return {
            ok: false,
            output: String((error && error.stdout) || '').trim(),
            error: String((error && error.stderr) || error.message || 'command failed').trim()
        };
    }
}

function collectPm2() {
    const result = runCommand('pm2 jlist');
    if (!result.ok || !result.output) {
        return { available: false, processes: [] };
    }

    let parsed = [];
    try {
        parsed = JSON.parse(result.output);
    } catch (_) {
        parsed = [];
    }

    return {
        available: true,
        processes: parsed.map((proc) => ({
            name: proc.name,
            pid: proc.pid,
            status: proc.pm2_env && proc.pm2_env.status,
            restarts: proc.pm2_env && proc.pm2_env.restart_time,
            memory: proc.monit && proc.monit.memory,
            cpu: proc.monit && proc.monit.cpu
        }))
    };
}

function collectGovernance() {
    const autonomyLatest = safeReadJson(
        path.join(rootDir, 'reports', 'operations', 'autonomy-governance', 'latest.json'),
        {}
    );

    const guardResult = runCommand('node scripts/production-safety-guard.js');

    return {
        autonomy: {
            maturity: autonomyLatest && autonomyLatest.maturity ? autonomyLatest.maturity : null,
            gate: autonomyLatest && autonomyLatest.gate ? autonomyLatest.gate : null,
            timestamp: autonomyLatest && autonomyLatest.timestamp ? autonomyLatest.timestamp : null
        },
        safetyGuard: {
            passed: guardResult.ok,
            message: guardResult.ok ? (guardResult.output || 'passed') : (guardResult.error || 'blocked')
        }
    };
}

function collectNetworkLayer() {
    const rootNeuralStatus = runCommand('npm run -s ops:root-neural:tawheed:status');
    return {
        rootNeural: {
            ok: rootNeuralStatus.ok,
            summary: rootNeuralStatus.ok
                ? (rootNeuralStatus.output.split('\n').slice(-3).join(' | ') || 'active')
                : (rootNeuralStatus.error || 'unavailable')
        },
        dnsDbusMesh: {
            available: true,
            endpoints: [
                '/api/network/dns/status',
                '/api/network/dbus/status',
                '/api/network/dashboard'
            ]
        }
    };
}

function collectRuntimeMemory() {
    const historyFiles = fs.existsSync(historyDir)
        ? fs.readdirSync(historyDir).filter((file) => file.endsWith('.json')).length
        : 0;
    const auditFiles = fs.existsSync(auditsDir)
        ? fs.readdirSync(auditsDir).filter((file) => file.endsWith('.json')).length
        : 0;

    return {
        directories: {
            history: historyDir,
            audits: auditsDir,
            timeline: timelineDir,
            recovery: recoveryDir
        },
        counters: {
            historyFiles,
            auditFiles
        }
    };
}

function collectShariaContractGate() {
    const requiredArtifacts = [
        { key: 'charter', path: path.join(rootDir, 'CHARTER.md') },
        { key: 'methodology', path: path.join(rootDir, 'METHODOLOGIES-QURAN-SUNNAH.md') },
        { key: 'decisionLog', path: path.join(rootDir, 'data', 'decision-log.json') },
        { key: 'governancePolicy', path: path.join(rootDir, 'data', 'org', 'autonomous-governance-policy.json') }
    ];

    const checks = requiredArtifacts.map((artifact) => ({
        key: artifact.key,
        path: artifact.path,
        exists: fs.existsSync(artifact.path)
    }));

    const missing = checks.filter((item) => !item.exists).map((item) => item.key);
    const strict = toBoolean(process.env.SHEIKHA_SHARIA_GATE_STRICT);
    const passed = missing.length === 0;

    return {
        strict,
        passed,
        missing,
        checks
    };
}

function getArgs() {
    return {
        printJson: process.argv.includes('--json'),
        mode: process.argv.includes('--status') ? 'status' : 'cycle',
        writeSnapshot: !process.argv.includes('--status')
    };
}

function main() {
    const args = getArgs();
    const now = new Date().toISOString();
    const stamp = now.replace(/[:]/g, '-');

    const policyPath = path.join(rootDir, 'data', 'org', 'autonomous-governance-policy.json');
    const policy = safeReadJson(policyPath, {});
    const pm2 = collectPm2();
    const governance = collectGovernance();
    const network = collectNetworkLayer();
    const runtimeMemory = collectRuntimeMemory();
    const shariaGate = collectShariaContractGate();
    const blockedByShariaGate = shariaGate.strict && !shariaGate.passed;

    const fabricStatus = {
        success: !blockedByShariaGate,
        timestamp: now,
        fabric: {
            name: 'Sheikha Unified Operational Fabric',
            mode: args.mode,
            policyConstrained: true,
            humanGoverned: true,
            safeByDefault: true
        },
        rootCoordinationLayer: {
            runtimeGovernor: true,
            policyEngine: Boolean(policy && policy.version),
            safetyGuard: governance.safetyGuard.passed,
            deploymentGate: Boolean(governance.autonomy && governance.autonomy.gate),
            shariaContractGate: shariaGate.passed,
            rollbackEngine: fs.existsSync(path.join(rootDir, 'scripts', 'rollback-deployment.sh')),
            auditEngine: true
        },
        temporalMemoryLayer: runtimeMemory,
        neuralOperationsFabric: {
            pm2,
            network,
            governance
        },
        sovereignty: {
            principles: ['لا ضرر ولا ضرار', 'الكتاب والسنة', 'الشفافية والمساءلة'],
            shariaContractGate: shariaGate,
            constraints: {
                noAutoProductionDeploy: !toBoolean(process.env.SHEIKHA_ALLOW_UNREVIEWED_PROD_DEPLOY),
                noSecretsMutation: true,
                destructiveOpsBlocked: true
            }
        }
    };

    if (args.writeSnapshot) {
        safeWriteJson(path.join(historyDir, `fabric-${stamp}.json`), fabricStatus);
        safeWriteJson(path.join(auditsDir, `fabric-audit-${stamp}.json`), {
            success: !blockedByShariaGate,
            timestamp: now,
            checks: {
                safetyGuard: governance.safetyGuard,
                autonomyMaturity: governance.autonomy && governance.autonomy.maturity,
                pm2Available: pm2.available,
                shariaContractGate: {
                    strict: shariaGate.strict,
                    passed: shariaGate.passed,
                    missing: shariaGate.missing
                }
            }
        });
        safeWriteJson(path.join(timelineDir, 'latest.json'), {
            success: !blockedByShariaGate,
            timestamp: now,
            event: 'fabric-cycle-completed',
            summary: {
                pm2Processes: pm2.processes.length,
                safetyGuardPassed: governance.safetyGuard.passed,
                maturity: governance.autonomy && governance.autonomy.maturity ? governance.autonomy.maturity.level : null,
                shariaGatePassed: shariaGate.passed
            }
        });
        safeWriteJson(path.join(recoveryDir, 'latest.json'), {
            success: !blockedByShariaGate,
            timestamp: now,
            rollbackAvailable: fabricStatus.rootCoordinationLayer.rollbackEngine,
            lastKnownGood: {
                safetyGuardPassed: governance.safetyGuard.passed,
                deploymentGate: fabricStatus.rootCoordinationLayer.deploymentGate,
                shariaGatePassed: shariaGate.passed
            }
        });
    }

    if (args.printJson) {
        console.log(JSON.stringify(fabricStatus, null, 2));
    } else {
        console.log(`FABRIC_MODE=${args.mode}`);
        console.log(`FABRIC_TIMESTAMP=${now}`);
        console.log(`FABRIC_SAFETY_GUARD=${governance.safetyGuard.passed}`);
        console.log(`FABRIC_PM2_PROCESSES=${pm2.processes.length}`);
        console.log(`FABRIC_MATURITY=${governance.autonomy && governance.autonomy.maturity ? governance.autonomy.maturity.level : 'unknown'}`);
        console.log(`FABRIC_SHARIA_GATE=${shariaGate.passed}`);
        if (shariaGate.missing.length > 0) {
            console.log(`FABRIC_SHARIA_MISSING=${shariaGate.missing.join(',')}`);
        }
    }

    if (blockedByShariaGate) {
        console.error('FABRIC_BLOCKED_BY_SHARIA_GATE=true');
        process.exitCode = 1;
    }
}

main();
