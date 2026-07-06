'use strict';

const {
    buildSecurityCorsAllowedOrigins,
    isSecurityCorsOriginAllowed
} = require('../lib/runtime/middleware/security-middleware');

describe('security middleware CORS policy', () => {
    test('allows governed production and local runtime origins', () => {
        const allowedOrigins = buildSecurityCorsAllowedOrigins();

        expect(isSecurityCorsOriginAllowed(undefined, allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('https://sheikha.top', allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('https://www.sheikha.top', allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('http://localhost:8080', allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('http://127.0.0.1:8080', allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('http://localhost:8082', allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('http://127.0.0.1:8082', allowedOrigins)).toBe(true);
    });

    test('keeps unknown browser origins denied by default', () => {
        const allowedOrigins = buildSecurityCorsAllowedOrigins();

        expect(isSecurityCorsOriginAllowed('https://example.invalid', allowedOrigins)).toBe(false);
    });

    test('extends allowed origins from SECURITY_CORS_ORIGINS', () => {
        const allowedOrigins = buildSecurityCorsAllowedOrigins({
            SECURITY_CORS_ORIGINS: 'https://ops.sheikha.top, http://localhost:5173'
        });

        expect(isSecurityCorsOriginAllowed('https://ops.sheikha.top', allowedOrigins)).toBe(true);
        expect(isSecurityCorsOriginAllowed('http://localhost:5173', allowedOrigins)).toBe(true);
    });
});
