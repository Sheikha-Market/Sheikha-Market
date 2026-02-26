'use strict';

const fs = require('fs');
const path = require('path');

class NationalAddressClient {
    constructor(opts = {}) {
        this.baseUrl = String(opts.baseUrl || process.env.NATIONAL_ADDRESS_BASE_URL || '').trim().replace(/\/+$/, '');
        this.apiKey = String(opts.apiKey || process.env.NATIONAL_ADDRESS_API_KEY || '').trim();
        this.clientId = String(opts.clientId || process.env.NATIONAL_ADDRESS_CLIENT_ID || '').trim();
        this.clientSecret = String(opts.clientSecret || process.env.NATIONAL_ADDRESS_CLIENT_SECRET || '').trim();
        this.plan = String(opts.plan || process.env.NATIONAL_ADDRESS_PLAN || 'development').toLowerCase();
        this.timeoutMs = Number(opts.timeoutMs || process.env.NATIONAL_ADDRESS_TIMEOUT_MS || 12000);

        this._lastCallAt = 0;
        this._monthCounter = { ym: this._currentYm(), calls: 0 };
        this._planCfg = this._loadPlanConfig();
    }

    _currentYm() {
        const d = new Date();
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    }

    _loadPlanConfig() {
        try {
            const cfgPath = path.join(__dirname, '..', '..', 'config', 'gov-api-plans.json');
            const raw = fs.readFileSync(cfgPath, 'utf8');
            const parsed = JSON.parse(raw);
            const selected = parsed && parsed.plans && parsed.plans[this.plan];
            if (selected) return selected;
        } catch (_) {}
        return { minIntervalMs: 5000, monthlyCalls: 100 };
    }

    _ensureWindowCounters() {
        const ym = this._currentYm();
        if (this._monthCounter.ym !== ym) {
            this._monthCounter.ym = ym;
            this._monthCounter.calls = 0;
        }
    }

    _assertMonthlyQuota() {
        this._ensureWindowCounters();
        const quota = Number(this._planCfg.monthlyCalls || 0);
        if (quota > 0 && this._monthCounter.calls >= quota) {
            const err = new Error('تم تجاوز حد الاستدعاءات الشهري لباقتك الحالية.');
            err.code = 'NA_MONTHLY_QUOTA_EXCEEDED';
            throw err;
        }
    }

    async _throttle() {
        const minInterval = Number(this._planCfg.minIntervalMs || 0);
        if (minInterval <= 0) return;
        const now = Date.now();
        const waitMs = (this._lastCallAt + minInterval) - now;
        if (waitMs > 0) {
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
        this._lastCallAt = Date.now();
    }

    _buildHeaders(extraHeaders = {}) {
        const headers = {
            'Accept': 'application/json',
            ...extraHeaders
        };

        if (this.apiKey) headers['x-api-key'] = this.apiKey;
        if (this.clientId) headers['x-client-id'] = this.clientId;
        if (this.clientSecret) headers['x-client-secret'] = this.clientSecret;

        return headers;
    }

    async _request(pathname, query = {}) {
        if (!this.baseUrl) {
            const err = new Error('NATIONAL_ADDRESS_BASE_URL غير مضبوط.');
            err.code = 'NA_BASE_URL_MISSING';
            throw err;
        }

        this._assertMonthlyQuota();
        await this._throttle();

        const u = new URL(this.baseUrl + pathname);
        for (const [k, v] of Object.entries(query || {})) {
            if (v !== undefined && v !== null && String(v).trim() !== '') {
                u.searchParams.set(k, String(v));
            }
        }

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);

        try {
            const res = await fetch(u.toString(), {
                method: 'GET',
                headers: this._buildHeaders(),
                signal: ctrl.signal
            });

            const text = await res.text();
            let json;
            try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }

            this._monthCounter.calls += 1;

            if (!res.ok) {
                const err = new Error(`فشل استدعاء National Address: ${res.status}`);
                err.code = 'NA_HTTP_ERROR';
                err.status = res.status;
                err.data = json;
                throw err;
            }

            return {
                success: true,
                status: res.status,
                data: json,
                meta: {
                    provider: 'NationalAddress',
                    plan: this.plan,
                    monthlyCallsUsed: this._monthCounter.calls,
                    month: this._monthCounter.ym
                }
            };
        } finally {
            clearTimeout(timer);
        }
    }

    // NationalAddress.Address
    async getAddress(params = {}) {
        return this._request('/NationalAddress/Address', params);
    }

    // NationalAddress.Lookups
    async getLookups(params = {}) {
        return this._request('/NationalAddress/Lookups', params);
    }

    // NationalAddress.Maps
    async getMaps(params = {}) {
        return this._request('/NationalAddress/Maps', params);
    }

    // NationalAddress.NationalAddressByShortAddress
    async getByShortAddress(params = {}) {
        return this._request('/NationalAddress/NationalAddressByShortAddress', params);
    }

    getReadiness() {
        return {
            success: true,
            provider: 'NationalAddress',
            configured: {
                baseUrl: !!this.baseUrl,
                apiKey: !!this.apiKey,
                clientId: !!this.clientId,
                clientSecret: !!this.clientSecret
            },
            plan: this.plan,
            limits: this._planCfg,
            monthCounter: this._monthCounter
        };
    }
}

module.exports = NationalAddressClient;
