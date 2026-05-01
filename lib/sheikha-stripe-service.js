/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════
 * خدمة Stripe — دعم API v2 مع Include-dependent response values
 * SHEIKHA STRIPE SERVICE — API v2 + include-dependent values
 * ═══════════════════════════════════════════════════════════════════════════
 * المالك: سلمان أحمد بن سلمان الراجح | market@sheikha.top
 * مرجع: https://docs.stripe.com/api/include_dependent_response_values
 */
'use strict';

const config = require('../config/config.js');
const STRIPE_V2_BASE = 'https://api.stripe.com/v2';

/**
 * تهيئة Stripe — يُرجع null إذا لم تُضبط المفاتيح
 */
function getStripeClient() {
    const secretKey = config.developmentIntegrations?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.length < 10) return null;
    try {
        const Stripe = require('stripe');
        const apiVersion = config.developmentIntegrations?.stripe?.apiVersion || '2025-03-31.basil';
        return new Stripe(secretKey, { apiVersion });
    } catch (e) {
        return null;
    }
}

/**
 * استدعاء Stripe API v2 مع دعم include-dependent response values
 * @param {string} path - مسار v2 (مثل core/event_destinations)
 * @param {object} opts - { method, body, include }
 * @returns {Promise<{ success, data, error }>}
 */
async function stripeV2Request(path, opts = {}) {
    const { method = 'GET', body = {}, include } = opts;
    const secretKey = config.developmentIntegrations?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
    const apiVersion = config.developmentIntegrations?.stripe?.apiVersion || '2025-03-31.basil';
    const v2IncludeDefaults = config.developmentIntegrations?.stripe?.v2IncludeDefaults || ['identity', 'configuration.customer'];

    if (!secretKey || secretKey.length < 10) {
        return { success: false, error: 'Stripe غير مُفعّل — أضف STRIPE_SECRET_KEY في .env' };
    }

    const url = `${STRIPE_V2_BASE}/${path.replace(/^\//, '')}`;
    const includeArr = Array.isArray(include) && include.length > 0 ? include : v2IncludeDefaults;
    const finalBody = method !== 'GET' ? { ...body, include: includeArr } : null;

    try {
        const fetchOpts = {
            method,
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Stripe-Version': apiVersion,
                'Content-Type': 'application/json'
            }
        };
        if (finalBody && Object.keys(finalBody).length > 0) {
            fetchOpts.body = JSON.stringify(finalBody);
        }
        // للطلبات GET مع include — بعض endpoints تقبل include في query
        const queryParams = method === 'GET' && includeArr.length > 0
            ? '?' + includeArr.map(i => `include[]=${encodeURIComponent(i)}`).join('&')
            : '';
        const res = await fetch(url + queryParams, fetchOpts);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return { success: false, error: data.error?.message || data.message || 'خطأ Stripe', detail: data };
        }
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * قائمة Event Destinations (v2) مع دعم include-dependent values
 * @param {string[]} include - خصائص لجلب قيمها، مثل: webhook_endpoint.url, webhook_endpoint.signing_secret
 */
async function listEventDestinations(include) {
    const eventDestInclude = include && include.length > 0 ? include : ['webhook_endpoint.url', 'webhook_endpoint.signing_secret'];
    return stripeV2Request('core/event_destinations', { method: 'GET', include: eventDestInclude });
}

/**
 * معلومات إصدار Stripe وتهيئة include-dependent
 */
function getStripeVersioning() {
    const stripeCfg = config.developmentIntegrations?.stripe || config.devIntegrations?.stripe || {};
    return {
        apiVersion: stripeCfg.apiVersion || '2025-03-31.basil',
        v2IncludeDefaults: stripeCfg.v2IncludeDefaults || ['identity', 'configuration.customer'],
        includeDependentDocs: 'https://docs.stripe.com/api/include_dependent_response_values',
        preferredSdk: 'Node.js',
        sdkLanguagesApi: '/api/stripe/sdk-languages',
        enabled: !!(stripeCfg.secretKey || process.env.STRIPE_SECRET_KEY)
    };
}

module.exports = {
    getStripeClient,
    stripeV2Request,
    listEventDestinations,
    getStripeVersioning
};
