'use strict';

const crypto = require('crypto');

class SheikhaTenantAuthAgent {
    constructor(options) {
        const cfg = options || {};
        this.secret = String(cfg.secret || 'sheikha-tenant-agent-secret');
        this.modelStore = cfg.modelStore;
        this.logEvent = typeof cfg.logEvent === 'function' ? cfg.logEvent : null;
    }

    _sign(tenantId, scope, expiresAt) {
        const payload = `${tenantId}|${scope}|${expiresAt}`;
        return crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    }

    issueScopedToken(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const scope = String(req.scope || 'tenant:read').trim();
        const ttlSec = Math.max(60, Number(req.ttlSec || 3600));
        if (!tenantId) return { success: false, message: 'tenantId مطلوب' };
        const tenant = this.modelStore ? this.modelStore.getTenant(tenantId) : null;
        if (!tenant) return { success: false, message: 'الجهة غير موجودة' };

        const expiresAt = Date.now() + (ttlSec * 1000);
        const sig = this._sign(tenantId, scope, expiresAt);
        const token = Buffer.from(`${tenantId}|${scope}|${expiresAt}|${sig}`, 'utf8').toString('base64url');
        if (this.logEvent) this.logEvent('tenant_agent_token_issued', { tenantId, scope, ttlSec });
        return {
            success: true,
            token,
            expiresAt: new Date(expiresAt).toISOString(),
            scope
        };
    }

    verifyToken(rawToken, requiredScope) {
        try {
            const token = String(rawToken || '').trim();
            if (!token) return { ok: false, reason: 'missing_token' };
            const decoded = Buffer.from(token, 'base64url').toString('utf8');
            const parts = decoded.split('|');
            if (parts.length !== 4) return { ok: false, reason: 'invalid_format' };
            const tenantId = parts[0];
            const scope = parts[1];
            const expiresAt = Number(parts[2]);
            const sig = parts[3];
            if (!tenantId || !scope || !Number.isFinite(expiresAt) || !sig) {
                return { ok: false, reason: 'invalid_payload' };
            }
            if (Date.now() > expiresAt) return { ok: false, reason: 'expired' };
            const expected = this._sign(tenantId, scope, expiresAt);
            if (sig !== expected) return { ok: false, reason: 'bad_signature' };
            if (requiredScope && requiredScope !== scope && scope !== 'tenant:*') {
                return { ok: false, reason: 'scope_mismatch' };
            }
            const tenant = this.modelStore ? this.modelStore.getTenant(tenantId) : null;
            if (!tenant) return { ok: false, reason: 'tenant_not_found' };
            return {
                ok: true,
                tenantId,
                scope,
                tenant,
                expiresAt: new Date(expiresAt).toISOString()
            };
        } catch (_) {
            return { ok: false, reason: 'verify_failed' };
        }
    }
}

module.exports = SheikhaTenantAuthAgent;
