'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const STORE_DIR = path.join(ROOT_DIR, 'data', 'runtime', 'audits');
const STORE_FILE = path.join(STORE_DIR, 'operational-events.ndjson');

function ensureStore() {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '', 'utf8');
}

function readLines() {
    ensureStore();
    const content = fs.readFileSync(STORE_FILE, 'utf8');
    if (!content.trim()) return [];
    return content
        .split('\n')
        .filter(Boolean)
        .map(line => {
            try { return JSON.parse(line); } catch (_) { return null; }
        })
        .filter(Boolean);
}

function getLastHash(lines) {
    if (!lines.length) return 'GENESIS';
    return lines[lines.length - 1]?.chain?.hash || 'GENESIS';
}

function appendEvent(event) {
    ensureStore();
    if (!event || typeof event !== 'object') throw new Error('event object is required');
    if (!event.correlationId || typeof event.correlationId !== 'string') {
        throw new Error('correlationId is required');
    }

    const existing = readLines();
    const prevHash = getLastHash(existing);
    const payload = {
        eventId: `evt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        recordedAt: new Date().toISOString(),
        ...event,
    };
    const hash = crypto
        .createHash('sha256')
        .update(`${prevHash}:${JSON.stringify(payload)}`)
        .digest('hex');

    const sealed = {
        ...payload,
        chain: { prevHash, hash },
    };
    fs.appendFileSync(STORE_FILE, `${JSON.stringify(sealed)}\n`, 'utf8');
    return sealed;
}

function replay(filters = {}) {
    const { correlationId, type, actor, since, until, limit = 100 } = filters;
    const sinceTs = since ? new Date(since).getTime() : null;
    const untilTs = until ? new Date(until).getTime() : null;
    const lines = readLines().filter(item => {
        if (correlationId && item.correlationId !== correlationId) return false;
        if (type && item.type !== type) return false;
        if (actor && item.actor !== actor) return false;
        const ts = new Date(item.recordedAt || item.at || 0).getTime();
        if (sinceTs && ts < sinceTs) return false;
        if (untilTs && ts > untilTs) return false;
        return true;
    });
    return lines.slice(-Math.max(1, Math.min(Number(limit) || 100, 1000)));
}

function summary() {
    const lines = readLines();
    const byType = {};
    for (const item of lines) byType[item.type || 'unknown'] = (byType[item.type || 'unknown'] || 0) + 1;
    return {
        file: STORE_FILE,
        totalEvents: lines.length,
        byType,
        lastEventAt: lines.length ? lines[lines.length - 1].recordedAt : null,
    };
}

module.exports = {
    STORE_FILE,
    appendEvent,
    replay,
    summary,
};
