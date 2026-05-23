// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 Sheikha Resilient Fetch — إعادة المحاولة + المهلة الزمنية
// ═══════════════════════════════════════════════════════════════════════════════
// غلاف على fetch المدمج في Node 20+ يضيف:
//   • timeout    — إلغاء الطلب بعد مدة محددة
//   • retry      — إعادة المحاولة مع تأخير أسي عند أخطاء الشبكة أو 5xx
//   • jitter     — تشويش بسيط لمنع طوفان الإعادة المتزامنة
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

const DEFAULT_TIMEOUT       = 10_000;  // ms
const DEFAULT_RETRIES       = 3;
const DEFAULT_BASE_DELAY    = 300;     // ms
const DEFAULT_MAX_DELAY     = 10_000;  // ms

// الحالات التي يستحق فيها إعادة المحاولة
const RETRYABLE_STATUSES    = new Set([429, 500, 502, 503, 504]);

/**
 * delay مع jitter
 * @param {number} attempt   - رقم المحاولة (يبدأ من 1)
 * @param {number} baseDelay
 * @param {number} maxDelay
 */
function _backoff(attempt, baseDelay, maxDelay) {
    const exp    = Math.min(baseDelay * 2 ** attempt, maxDelay);
    const jitter = Math.random() * exp * 0.2;
    return new Promise(r => setTimeout(r, exp + jitter));
}

/**
 * fetch مرن مع مهلة وإعادة محاولة
 *
 * @param {string|URL} url
 * @param {object}     options           - خيارات fetch العادية
 * @param {number}     [options.timeout]   - مهلة ms (افتراضي: 10000)
 * @param {number}     [options.retries]   - عدد إعادة المحاولات (افتراضي: 3)
 * @param {number}     [options.baseDelay] - تأخير أساسي ms (افتراضي: 300)
 * @param {number}     [options.maxDelay]  - تأخير أقصى ms (افتراضي: 10000)
 * @param {Function}   [options.onRetry]   - callback(attempt, error)
 * @returns {Promise<Response>}
 */
async function resilientFetch(url, options = {}) {
    const {
        timeout   = DEFAULT_TIMEOUT,
        retries   = DEFAULT_RETRIES,
        baseDelay = DEFAULT_BASE_DELAY,
        maxDelay  = DEFAULT_MAX_DELAY,
        onRetry,
        ...fetchOptions
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });

            clearTimeout(timer);

            // إعادة المحاولة على حالات 5xx / 429
            if (!response.ok && RETRYABLE_STATUSES.has(response.status) && attempt < retries) {
                lastError = new Error(`HTTP ${response.status} — ${response.statusText}`);
                lastError.status = response.status;
                if (typeof onRetry === 'function') onRetry(attempt + 1, lastError);
                await _backoff(attempt, baseDelay, maxDelay);
                continue;
            }

            return response;
        } catch (err) {
            clearTimeout(timer);

            // إعادة المحاولة على أخطاء الشبكة والإلغاء (timeout)
            lastError = err;
            const isNetwork = err.name === 'AbortError' ||
                              err.code === 'ECONNRESET' ||
                              err.code === 'ECONNREFUSED' ||
                              err.code === 'ENOTFOUND' ||
                              err.code === 'ETIMEDOUT';

            if (isNetwork && attempt < retries) {
                if (typeof onRetry === 'function') onRetry(attempt + 1, err);
                await _backoff(attempt, baseDelay, maxDelay);
                continue;
            }

            throw err;
        }
    }

    throw lastError;
}

/**
 * GET بسيط مع إعادة المحاولة + JSON parsing
 * @param {string|URL} url
 * @param {object}     [options]
 * @returns {Promise<any>}
 */
async function resilientGetJSON(url, options = {}) {
    const res = await resilientFetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', ...options.headers },
        ...options
    });
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status} — ${res.statusText}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}

module.exports = { resilientFetch, resilientGetJSON };
