'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_PRIVILEGED_PREFIXES = [
    '/api/admin',
    '/api/governance',
    '/api/runtime-root',
    '/api/operational-fabric',
    '/api/unified-operational-fabric',
    '/api/neural',
    '/api/cloud',
    '/api/organizations',
    '/api/enterprise'
];

const DEFAULT_BYPASS_PATHS = new Set([
    '/api/live',
    '/api/health',
    '/api/ready',
    '/api/version',
    '/api/runtime',
    '/api/sheikha-node/status',
    '/api/observability/summary',
    '/api/observability/policy-enforcement'
]);

function parseBool(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    const normalized = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
    return fallback;
}

function resolveStrictMode(explicitValue) {
    if (explicitValue !== undefined && explicitValue !== null && explicitValue !== '') {
        return parseBool(explicitValue, false);
    }
    return String(process.env.NODE_ENV || 'development') === 'production';
}

function canonicalPath(requestPath) {
    return String(requestPath || '/').split('?')[0] || '/';
}

function signaturePayload({ method, requestPath, policyId, timestamp, tenantId, userId }) {
    return [
        String(method || 'GET').toUpperCase(),
        canonicalPath(requestPath),
        String(policyId || ''),
        String(timestamp || ''),
        String(tenantId || ''),
        String(userId || '')
    ].join('\n');
}

function buildPolicySignature(input, secret) {
    return crypto
        .createHmac('sha256', String(secret || ''))
        .update(signaturePayload(input), 'utf8')
        .digest('hex');
}

function safeSignatureEquals(actual, expected) {
    if (!actual || !expected) return false;
    if (actual.length !== expected.length) return false;

    try {
        const left = Buffer.from(actual, 'hex');
        const right = Buffer.from(expected, 'hex');
        if (left.length === 0 || right.length === 0 || left.length !== right.length) {
            return false;
        }
        return crypto.timingSafeEqual(left, right);
    } catch (_) {
        return false;
    }
}

function createRuntimeIsolationPolicy(options = {}) {
    const strictMode = resolveStrictMode(options.strictMode ?? process.env.SHEIKHA_RUNTIME_STRICT_ISOLATION);
    const policySignatureRequired = parseBool(
        options.policySignatureRequired ?? process.env.SHEIKHA_POLICY_SIGNATURE_REQUIRED,
        strictMode
    );
    const policySignatureSecret = String(
        (options.policySignatureSecret ?? process.env.SHEIKHA_POLICY_SIGNATURE_SECRET) || ''
    );
    const maxSkewMs = Number(options.maxSkewMs || process.env.SHEIKHA_POLICY_SIGNATURE_MAX_SKEW_MS || 5 * 60 * 1000);
    const privilegedPrefixes = Array.isArray(options.privilegedPrefixes) && options.privilegedPrefixes.length
        ? options.privilegedPrefixes
        : DEFAULT_PRIVILEGED_PREFIXES;
    const bypassPaths = new Set([
        ...DEFAULT_BYPASS_PATHS,
        ...(Array.isArray(options.bypassPaths) ? options.bypassPaths : [])
    ]);

    const auditFilePath = options.auditFilePath || path.join(process.cwd(), 'logs', 'security', 'runtime-policy.ndjson');
    const state = {
        strictMode,
        policySignatureRequired,
        privilegedPrefixes,
        maxSkewMs,
        totals: {
            allowed: 0,
            denied: 0
        },
        denialsByReason: {}
    };

    const appendAuditLog = (event) => {
        try {
            fs.mkdirSync(path.dirname(auditFilePath), { recursive: true });
            fs.appendFileSync(auditFilePath, JSON.stringify(event) + '\n', { encoding: 'utf8' });
        } catch (_) {
            // intentionally ignore audit write errors to preserve request handling
        }
    };

    const incrementDenied = (reason) => {
        state.totals.denied += 1;
        state.denialsByReason[reason] = (state.denialsByReason[reason] || 0) + 1;
    };

    const middleware = (req, res, next) => {
        const requestPath = canonicalPath(req.originalUrl || req.url || req.path || '/');

        if (bypassPaths.has(requestPath)) {
            return next();
        }

        const isPrivileged = privilegedPrefixes.some((prefix) => requestPath.startsWith(prefix));
        if (!isPrivileged) {
            return next();
        }

        const requestMeta = {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || null,
            method: String(req.method || 'GET').toUpperCase(),
            path: requestPath,
            ip: req.ip || req.connection?.remoteAddress || '',
            userAgent: req.headers['user-agent'] || ''
        };

        const tenantContextTenantId = String(req.tenantContext?.tenantId || '').trim();
        const jwtTenantId = String(req.user?.tid || req.user?.tenantId || '').trim();
        const tenantId = tenantContextTenantId || jwtTenantId || String(req.headers['x-tenant-id'] || '').trim();
        const userId = String(req.user?.uid || req.user?.id || req.tenantContext?.userId || '').trim();

        const deny = (statusCode, reason, message, extra = {}) => {
            incrementDenied(reason);
            appendAuditLog({
                event: 'runtime_policy_denied',
                reason,
                statusCode,
                strictMode,
                ...requestMeta,
                tenantId: tenantId || null,
                userId: userId || null,
                ...extra
            });
            return res.status(statusCode).json({
                success: false,
                error: reason,
                message,
                timestamp: new Date().toISOString()
            });
        };

        if (!tenantId || !userId) {
            return deny(
                401,
                'RUNTIME_PRINCIPAL_REQUIRED',
                'Strict runtime isolation requires authenticated principal with uid/tid claims.'
            );
        }

        if (tenantContextTenantId && jwtTenantId && tenantContextTenantId !== jwtTenantId) {
            return deny(
                403,
                'RUNTIME_TENANT_CONTEXT_MISMATCH',
                'Tenant context mismatch detected and blocked by strict runtime isolation.'
            );
        }

        if (policySignatureRequired) {
            if (!policySignatureSecret) {
                return deny(
                    503,
                    'RUNTIME_POLICY_MISCONFIGURED',
                    'Policy signature secret is missing while strict policy enforcement is enabled.'
                );
            }

            const policyId = String(req.headers['x-policy-id'] || '').trim();
            const policyTimestamp = String(req.headers['x-policy-timestamp'] || '').trim();
            const signature = String(req.headers['x-policy-signature'] || '').trim().toLowerCase();

            if (!policyId || !policyTimestamp || !signature) {
                return deny(
                    403,
                    'RUNTIME_POLICY_SIGNATURE_REQUIRED',
                    'Policy signature headers are required for privileged routes.'
                );
            }

            const timestampMs = Date.parse(policyTimestamp);
            if (!Number.isFinite(timestampMs)) {
                return deny(
                    403,
                    'RUNTIME_POLICY_SIGNATURE_TIMESTAMP_INVALID',
                    'Policy signature timestamp is invalid.'
                );
            }

            const skewMs = Math.abs(Date.now() - timestampMs);
            if (skewMs > maxSkewMs) {
                return deny(
                    403,
                    'RUNTIME_POLICY_SIGNATURE_EXPIRED',
                    'Policy signature timestamp is outside allowed skew window.',
                    { skewMs }
                );
            }

            const expectedSignature = buildPolicySignature(
                {
                    method: req.method,
                    requestPath,
                    policyId,
                    timestamp: policyTimestamp,
                    tenantId,
                    userId
                },
                policySignatureSecret
            );

            if (!safeSignatureEquals(signature, expectedSignature)) {
                return deny(
                    403,
                    'RUNTIME_POLICY_SIGNATURE_INVALID',
                    'Policy signature validation failed.'
                );
            }
        }

        state.totals.allowed += 1;
        req.runtimeIsolation = {
            strictMode,
            policySignatureRequired,
            privilegedRoute: true,
            tenantId,
            userId
        };

        appendAuditLog({
            event: 'runtime_policy_allowed',
            strictMode,
            ...requestMeta,
            tenantId,
            userId
        });

        return next();
    };

    middleware.getStatus = () => ({
        strictMode: state.strictMode,
        policySignatureRequired: state.policySignatureRequired,
        privilegedPrefixes: state.privilegedPrefixes,
        maxSkewMs: state.maxSkewMs,
        totals: { ...state.totals },
        denialsByReason: { ...state.denialsByReason }
    });

    return middleware;
}

module.exports = {
    createRuntimeIsolationPolicy,
    buildPolicySignature
};
