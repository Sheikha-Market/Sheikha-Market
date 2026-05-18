'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTRACT_DIR = path.join(ROOT_DIR, 'data', 'runtime', 'contracts');
const CONTRACT_FILE = path.join(CONTRACT_DIR, 'service-contracts.json');

const DEFAULT_CONTRACTS = [
    {
        service: 'sheikha-dns',
        version: '1.0.0',
        owner: 'network-team',
        slo: { availabilityPct: 99.9, p95LatencyMs: 150 },
        permissions: { outbound: ['sheikha-dbus', 'sheikha-orchestrator'], actions: ['resolve', 'status'] },
        status: 'active',
    },
    {
        service: 'sheikha-dbus',
        version: '1.0.0',
        owner: 'platform-team',
        slo: { availabilityPct: 99.9, p95LatencyMs: 100 },
        permissions: { outbound: ['sheikha-orchestrator'], actions: ['publish', 'subscribe', 'request'] },
        status: 'active',
    },
    {
        service: 'sheikha-orchestrator',
        version: '1.0.0',
        owner: 'ops-team',
        slo: { availabilityPct: 99.5, p95LatencyMs: 250 },
        permissions: { outbound: ['*'], actions: ['*'] },
        status: 'active',
    },
];

function ensureStore() {
    fs.mkdirSync(CONTRACT_DIR, { recursive: true });
    if (!fs.existsSync(CONTRACT_FILE)) {
        fs.writeFileSync(CONTRACT_FILE, JSON.stringify({ contracts: DEFAULT_CONTRACTS }, null, 2), 'utf8');
    }
}

function readContracts() {
    ensureStore();
    try {
        return JSON.parse(fs.readFileSync(CONTRACT_FILE, 'utf8')).contracts || [];
    } catch (_) {
        return [];
    }
}

function writeContracts(contracts) {
    ensureStore();
    fs.writeFileSync(CONTRACT_FILE, JSON.stringify({ contracts }, null, 2), 'utf8');
}

function registerContract(contract = {}) {
    if (!contract.service || !contract.version || !contract.owner) {
        throw new Error('service, version and owner are required');
    }
    const contracts = readContracts();
    const idx = contracts.findIndex(item => item.service === contract.service);
    const next = {
        service: contract.service,
        version: contract.version,
        owner: contract.owner,
        slo: contract.slo || { availabilityPct: 99, p95LatencyMs: 500 },
        permissions: contract.permissions || { outbound: [], actions: [] },
        status: contract.status || 'active',
        updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) contracts[idx] = { ...contracts[idx], ...next };
    else contracts.push({ ...next, createdAt: next.updatedAt });
    writeContracts(contracts);
    return next;
}

function getContract(service) {
    return readContracts().find(item => item.service === service) || null;
}

function listContracts() {
    return readContracts();
}

function authorizeCommunication(input = {}) {
    const { source, target, action = 'call' } = input;
    const src = getContract(source);
    const dst = getContract(target);
    if (!src || !dst) {
        return { allowed: false, reason: 'missing service contract', source, target, action };
    }
    if (src.status !== 'active' || dst.status !== 'active') {
        return { allowed: false, reason: 'service not active', source, target, action };
    }
    const outbound = src.permissions?.outbound || [];
    const actions = src.permissions?.actions || [];
    const targetAllowed = outbound.includes('*') || outbound.includes(target);
    const actionAllowed = actions.includes('*') || actions.includes(action);
    if (!targetAllowed || !actionAllowed) {
        return { allowed: false, reason: 'east-west communication denied by contract', source, target, action };
    }
    return {
        allowed: true,
        reason: 'authorized by service contract',
        source,
        target,
        action,
        sourceSlo: src.slo,
        targetSlo: dst.slo,
    };
}

function summary() {
    const contracts = readContracts();
    return {
        totalContracts: contracts.length,
        activeContracts: contracts.filter(item => item.status === 'active').length,
        services: contracts.map(item => item.service),
    };
}

module.exports = {
    registerContract,
    getContract,
    listContracts,
    authorizeCommunication,
    summary,
};
