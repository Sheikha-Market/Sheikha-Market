'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
    createRuntimeIsolationPolicy,
    buildPolicySignature
} = require('../lib/runtime/middleware/runtime-isolation-policy');

function createMockResponse() {
    return {
        statusCode: 200,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.payload = body;
            return this;
        }
    };
}

describe('runtime isolation policy middleware', () => {
    test('denies privileged route by default without authenticated principal', () => {
        const middleware = createRuntimeIsolationPolicy({
            strictMode: true,
            policySignatureRequired: false,
            auditFilePath: path.join(os.tmpdir(), `runtime-policy-${Date.now()}-1.ndjson`)
        });
        const req = {
            method: 'GET',
            path: '/api/governance/status',
            headers: {},
            user: null,
            tenantContext: null
        };
        const res = createMockResponse();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res.payload.error).toBe('RUNTIME_PRINCIPAL_REQUIRED');
    });

    test('allows privileged route with valid tenant claims and policy signature', () => {
        const secret = 'test-secret';
        const nowIso = new Date().toISOString();
        const req = {
            method: 'POST',
            path: '/api/governance/approve',
            headers: {
                'x-policy-id': 'gov-approval-v1',
                'x-policy-timestamp': nowIso
            },
            user: { id: 'u-1', tid: 'tenant-1' },
            tenantContext: { tenantId: 'tenant-1', userId: 'u-1' }
        };
        req.headers['x-policy-signature'] = buildPolicySignature(
            {
                method: req.method,
                requestPath: req.path,
                policyId: req.headers['x-policy-id'],
                timestamp: req.headers['x-policy-timestamp'],
                tenantId: 'tenant-1',
                userId: 'u-1'
            },
            secret
        );

        const middleware = createRuntimeIsolationPolicy({
            strictMode: true,
            policySignatureRequired: true,
            policySignatureSecret: secret,
            auditFilePath: path.join(os.tmpdir(), `runtime-policy-${Date.now()}-2.ndjson`)
        });
        const res = createMockResponse();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(200);
    });

    test('denies privileged route on tenant mismatch', () => {
        const middleware = createRuntimeIsolationPolicy({
            strictMode: true,
            policySignatureRequired: false,
            auditFilePath: path.join(os.tmpdir(), `runtime-policy-${Date.now()}-3.ndjson`)
        });
        const req = {
            method: 'GET',
            path: '/api/runtime-root/secure',
            headers: {},
            user: { id: 'u-1', tid: 'tenant-a' },
            tenantContext: { tenantId: 'tenant-b', userId: 'u-1' }
        };
        const res = createMockResponse();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(403);
        expect(res.payload.error).toBe('RUNTIME_TENANT_CONTEXT_MISMATCH');
    });

    test('fails closed when signature is required but secret is missing', () => {
        const middleware = createRuntimeIsolationPolicy({
            strictMode: true,
            policySignatureRequired: true,
            policySignatureSecret: '',
            auditFilePath: path.join(os.tmpdir(), `runtime-policy-${Date.now()}-4.ndjson`)
        });
        const req = {
            method: 'GET',
            path: '/api/governance/secure',
            headers: {},
            user: { id: 'u-1', tid: 'tenant-a' },
            tenantContext: { tenantId: 'tenant-a', userId: 'u-1' }
        };
        const res = createMockResponse();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(503);
        expect(res.payload.error).toBe('RUNTIME_POLICY_MISCONFIGURED');
    });

    test('writes append-only audit log entries', () => {
        const auditFilePath = path.join(os.tmpdir(), `runtime-policy-${Date.now()}-5.ndjson`);
        const middleware = createRuntimeIsolationPolicy({
            strictMode: true,
            policySignatureRequired: false,
            auditFilePath
        });
        const req = {
            method: 'GET',
            path: '/api/governance/audit',
            headers: {},
            user: null,
            tenantContext: null
        };
        const res = createMockResponse();

        middleware(req, res, () => {});
        const content = fs.readFileSync(auditFilePath, 'utf8');

        expect(content).toContain('"event":"runtime_policy_denied"');
        expect(content.trim().split('\n').length).toBeGreaterThanOrEqual(1);
    });
});
