'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const POLICY_DIR = path.join(ROOT_DIR, 'data', 'runtime', 'governance');
const EXCEPTIONS_FILE = path.join(POLICY_DIR, 'policy-exceptions.json');

const AUTONOMOUS_ALLOWED_ACTIONS = new Set([
    'propose.change',
    'fix.safe',
    'run.tests',
    'run.lint',
    'open.pr',
    'write.report',
]);

function ensureFiles() {
    fs.mkdirSync(POLICY_DIR, { recursive: true });
    if (!fs.existsSync(EXCEPTIONS_FILE)) {
        fs.writeFileSync(EXCEPTIONS_FILE, JSON.stringify({ exceptions: [] }, null, 2), 'utf8');
    }
}

function readExceptions() {
    ensureFiles();
    try {
        return JSON.parse(fs.readFileSync(EXCEPTIONS_FILE, 'utf8')).exceptions || [];
    } catch (_) {
        return [];
    }
}

function writeExceptions(exceptions) {
    ensureFiles();
    fs.writeFileSync(EXCEPTIONS_FILE, JSON.stringify({ exceptions }, null, 2), 'utf8');
}

function isExceptionActive(exception, action, principal) {
    if (!exception || exception.action !== action) return false;
    if (exception.principal && principal && exception.principal !== principal) return false;
    if (!exception.signature || String(exception.signature).length < 16) return false;
    return new Date(exception.expiresAt).getTime() > Date.now();
}

function registerTemporaryException(input = {}) {
    const { action, principal, signedBy, signature, expiresAt, reason } = input;
    if (!action || !signature || !expiresAt) throw new Error('action, signature and expiresAt are required');
    const expiry = new Date(expiresAt).getTime();
    if (!Number.isFinite(expiry) || expiry <= Date.now()) throw new Error('expiresAt must be in the future');

    const exceptions = readExceptions();
    const entry = {
        exceptionId: `exc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        action,
        principal: principal || null,
        signedBy: signedBy || 'unknown',
        signature,
        reason: reason || 'temporary exception',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(expiry).toISOString(),
    };
    exceptions.push(entry);
    writeExceptions(exceptions);
    return entry;
}

function evaluate(policyInput = {}) {
    const {
        action,
        category = 'operations',
        principal = 'system',
        actorType = 'human',
        context = {},
    } = policyInput;

    if (!action) return { allowed: false, reason: 'deny-by-default: missing action', category };

    const exceptions = readExceptions();
    const active = exceptions.find(item => isExceptionActive(item, action, principal));
    if (active) return { allowed: true, reason: 'temporary signed exception', category, exception: active.exceptionId };

    if (String(action).startsWith('destructive.')) {
        return { allowed: false, reason: 'destructive operations are denied', category: 'security' };
    }
    if (action === 'modify.secrets') {
        return { allowed: false, reason: 'secret modification denied by policy', category: 'compliance' };
    }
    if (context?.shariaFlags?.some(flag => ['riba', 'gharar', 'haram'].includes(flag))) {
        return { allowed: false, reason: 'sharia policy violation', category: 'sharia' };
    }
    if (actorType === 'autonomous') {
        if (!AUTONOMOUS_ALLOWED_ACTIONS.has(action)) {
            return { allowed: false, reason: 'autonomous action is out of allowed scope', category: 'operations' };
        }
    }
    if (action === 'deploy.production' && !context.humanReview) {
        return { allowed: false, reason: 'production deploy requires human review', category: 'operations' };
    }

    return { allowed: true, reason: 'allowed by policy rules', category };
}

module.exports = {
    AUTONOMOUS_ALLOWED_ACTIONS: [...AUTONOMOUS_ALLOWED_ACTIONS],
    evaluate,
    registerTemporaryException,
};
