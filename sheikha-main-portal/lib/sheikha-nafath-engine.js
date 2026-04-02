'use strict';
/**
 * sheikha-nafath-engine.js
 * محرك تكامل النفاذ الوطني الموحد — SDAIA OAuth / OIDC
 *
 * الجهة المُصدِرة: هيئة البيانات والذكاء الاصطناعي (SDAIA)
 * المرجع: https://nafath.api.gov.sa/
 * النموذج: OAuth 2.0 + OpenID Connect
 *
 * للتفعيل الحقيقي يجب التسجيل في:
 *   https://info.sdaia.gov.sa/nafath-services-gateway
 * والحصول على: CLIENT_ID + CLIENT_SECRET + REDIRECT_URI مسموح به
 */

// ═══════════════════════════════════════════
// إعدادات النفاذ
// ═══════════════════════════════════════════
const NAFATH_CONFIG = {
    // نقاط النهاية الرسمية لـ SDAIA Nafath
    authUrl:     process.env.NAFATH_AUTH_URL     || 'https://nafath.api.gov.sa/oauth/authorize',
    tokenUrl:    process.env.NAFATH_TOKEN_URL     || 'https://nafath.api.gov.sa/oauth/token',
    userInfoUrl: process.env.NAFATH_USERINFO_URL  || 'https://nafath.api.gov.sa/oauth/userinfo',
    // بيانات التطبيق
    clientId:     process.env.NAFATH_CLIENT_ID     || null,
    clientSecret: process.env.NAFATH_CLIENT_SECRET || null,
    // الصلاحيات المطلوبة (OIDC scopes)
    scope: process.env.NAFATH_SCOPE || 'openid profile email national_id phone',
};

/**
 * هل مفاتيح نفاذ حقيقية (غير CHANGE_ME)؟
 */
function isNafathConfigured() {
    const cid = NAFATH_CONFIG.clientId;
    const sec = NAFATH_CONFIG.clientSecret;
    if (!cid || !sec) return false;
    if (cid.startsWith('CHANGE_ME') || sec.startsWith('CHANGE_ME')) return false;
    if (cid.startsWith('REPLACE_WITH') || sec.startsWith('REPLACE_WITH')) return false;
    return cid.length > 5 && sec.length > 5;
}

/**
 * بناء رابط OAuth للتوجيه إليه
 * @param {string} redirectUri - رابط إعادة التوجيه (يجب أن يطابق ما في بوابة SDAIA)
 * @param {string} state - قيمة state لمنع CSRF
 * @param {object} extras - معاملات إضافية (mode, accountType)
 */
function buildAuthUrl(redirectUri, state, extras = {}) {
    const params = new URLSearchParams({
        client_id:     NAFATH_CONFIG.clientId,
        redirect_uri:  redirectUri,
        response_type: 'code',
        scope:         NAFATH_CONFIG.scope,
        state:         state,
    });

    // إضافة معاملات إضافية كـ prompt=login بشكل آمن
    if (extras.prompt)       params.set('prompt', extras.prompt);
    if (extras.ui_locales)   params.set('ui_locales', extras.ui_locales);
    if (extras.acr_values)   params.set('acr_values', extras.acr_values);

    return NAFATH_CONFIG.authUrl + '?' + params.toString();
}

/**
 * تبادل authorization_code بـ access_token
 * @param {string} code
 * @param {string} redirectUri
 */
async function exchangeCodeForToken(code, redirectUri) {
    const body = new URLSearchParams({
        code,
        client_id:     NAFATH_CONFIG.clientId,
        client_secret: NAFATH_CONFIG.clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
    });

    const resp = await fetch(NAFATH_CONFIG.tokenUrl, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept':       'application/json',
        },
        body: body.toString(),
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error('nafath_token_error: ' + resp.status + ' — ' + text.slice(0, 200));
    }

    return resp.json();
}

/**
 * جلب بيانات المستخدم من نفاذ
 * @param {string} accessToken
 */
async function fetchUserInfo(accessToken) {
    const resp = await fetch(NAFATH_CONFIG.userInfoUrl, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Accept':        'application/json',
        },
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error('nafath_userinfo_error: ' + resp.status + ' — ' + text.slice(0, 200));
    }

    return resp.json();
}

/**
 * تطبيع بيانات المستخدم القادمة من نفاذ
 * نفاذ يعيد: sub, name, given_name, family_name, email, phone_number, national_id
 * @param {object} raw
 */
function normalizeNafathUser(raw) {
    return {
        sub:        raw.sub        || raw.id                        || null,
        name:       raw.name       || raw.full_name                 || (raw.given_name + ' ' + raw.family_name) || '',
        email:      raw.email      || '',
        phone:      raw.phone_number || raw.phone                   || '',
        nationalId: raw.national_id || raw.nationalID               || '',
        verified:   true,
        provider:   'nafath',
    };
}

/**
 * التحقق من صحة نتيجة الـ state لمنع CSRF
 * @param {string} sessionState - المحفوظ في session/cookie
 * @param {string} queryState   - القادم في query string
 */
function validateState(sessionState, queryState) {
    if (!sessionState || !queryState) return false;
    return sessionState === queryState;
}

/**
 * إنشاء قيمة state عشوائية
 */
function generateState() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ═══════════════════════════════════════════
// تصدير
// ═══════════════════════════════════════════
module.exports = {
    isNafathConfigured,
    buildAuthUrl,
    exchangeCodeForToken,
    fetchUserInfo,
    normalizeNafathUser,
    validateState,
    generateState,
    NAFATH_CONFIG,
};
