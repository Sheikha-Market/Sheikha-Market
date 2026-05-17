'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIT_DIR = path.join(ROOT_DIR, 'data', 'runtime', 'audits');
const CONNECTION_FILE = path.join(AUDIT_DIR, 'connection-lifecycle.ndjson');
const REPORT_DIR = path.join(ROOT_DIR, 'reports', 'operations', 'connections');

function ensure() {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    if (!fs.existsSync(CONNECTION_FILE)) fs.writeFileSync(CONNECTION_FILE, '', 'utf8');
}

function append(record) {
    ensure();
    fs.appendFileSync(CONNECTION_FILE, `${JSON.stringify(record)}\n`, 'utf8');
}

function clientIp(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.ip
        || req.socket?.remoteAddress
        || 'unknown'
    );
}

function begin(req, operation, correlationId) {
    const reportId = `conn-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const base = {
        reportId,
        correlationId,
        operation,
        ip: clientIp(req),
        method: req.method,
        path: req.originalUrl,
        userAgent: req.headers['user-agent'] || 'unknown',
        startedAt: new Date().toISOString(),
        stages: [],
    };
    const before = {
        stage: 'before_connection',
        at: new Date().toISOString(),
        note: 'request received before processing',
    };
    base.stages.push(before);
    append({ type: 'connection_stage', ...base, currentStage: before });
    return base;
}

function during(base, detail = {}) {
    const stage = {
        stage: 'during_connection',
        at: new Date().toISOString(),
        detail,
    };
    base.stages.push(stage);
    append({ type: 'connection_stage', ...base, currentStage: stage });
}

function end(base, result = {}, impact = {}) {
    const stage = {
        stage: 'after_connection',
        at: new Date().toISOString(),
        result,
        impact,
    };
    base.stages.push(stage);
    base.completedAt = stage.at;
    base.outcome = result;
    base.impact = impact;
    append({ type: 'connection_stage', ...base, currentStage: stage });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORT_DIR, `connection-report-${stamp}-${base.reportId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(base, null, 2), 'utf8');
    fs.writeFileSync(path.join(REPORT_DIR, 'connection-report-latest.json'), JSON.stringify(base, null, 2), 'utf8');
    return { ...base, reportPath };
}

module.exports = {
    begin,
    during,
    end,
};
