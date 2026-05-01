'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config');

function createTenantContextMiddleware(authAgent) {
    return function tenantContextMiddleware(requiredScope) {
        return function tenantContextHandler(req, res, next) {
            const token = req.headers['x-tenant-agent-token'];
            const result = authAgent.verifyToken(token, requiredScope || 'tenant:read');
            if (!result.ok) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'فشل التحقق من هوية الجهة',
                    error: result.reason || 'unauthorized',
                    timestamp: new Date().toISOString()
                });
            }
            const strictJwt = String(process.env.SHEIKHA_REQUIRE_JWT_TENANT || 'true') !== 'false';
            const authHeader = String(req.headers.authorization || '');
            if (strictJwt && !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'التوكن JWT مطلوب مع claim tid',
                    error: 'jwt_required',
                    timestamp: new Date().toISOString()
                });
            }
            const headerTenantId = String(req.headers['x-tenant-id'] || '').trim();
            if (headerTenantId && headerTenantId !== result.tenantId) {
                return res.status(403).json({
                    success: false,
                    data: null,
                    message: 'رفض الطلب: تعارض معرف الجهة في الهيدر',
                    error: 'tenant_header_mismatch',
                    timestamp: new Date().toISOString()
                });
            }

            let jwtTenantId = String(((req.user || {}).tid || (req.user || {}).tenantId || '')).trim();
            let jwtUserId = String(((req.user || {}).uid || (req.user || {}).id || '')).trim();
            if (!jwtTenantId && authHeader.startsWith('Bearer ')) {
                try {
                    const bearer = authHeader.slice(7);
                    const decoded = jwt.verify(bearer, config.security.jwt.secret);
                    jwtTenantId = String((decoded || {}).tid || (decoded || {}).tenantId || '').trim();
                    jwtUserId = String((decoded || {}).uid || (decoded || {}).id || '').trim();
                    req.user = Object.assign({}, req.user || {}, decoded || {});
                } catch (_) {
                    return res.status(401).json({
                        success: false,
                        data: null,
                        message: 'JWT غير صالح',
                        error: 'invalid_jwt',
                        timestamp: new Date().toISOString()
                    });
                }
            }
            if (strictJwt && (!jwtTenantId || !jwtUserId)) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'JWT claims uid/tid إلزامية',
                    error: 'missing_jwt_claims',
                    timestamp: new Date().toISOString()
                });
            }
            if (jwtTenantId && jwtTenantId !== result.tenantId) {
                return res.status(403).json({
                    success: false,
                    data: null,
                    message: 'رفض الطلب: تعارض معرف الجهة في JWT',
                    error: 'tenant_jwt_mismatch',
                    timestamp: new Date().toISOString()
                });
            }
            req.tenantContext = {
                tenantId: result.tenantId,
                scope: result.scope,
                tenant: result.tenant,
                expiresAt: result.expiresAt,
                userId: jwtUserId || ''
            };
            return next();
        };
    };
}

module.exports = createTenantContextMiddleware;
