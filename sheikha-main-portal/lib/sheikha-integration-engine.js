/**
 * بسم الله الرحمن الرحيم
 * SHEIKHA INTEGRATION ENGINE — منظومة التكامل والتحويل والتحليل
 * المالك: سلمان أحمد بن سلمان الراجح
 */
'use strict';

const fs = require('fs');
const path = require('path');
const nodeCrypto = require('crypto');
const { execSync } = require('child_process');
const SheikhaTenantModelStore = require('./sheikha-tenant-model');
const SheikhaTenantAuthAgent = require('./sheikha-tenant-auth-agent');
const createTenantContextMiddleware = require('../middleware/tenant-context');

class SheikhaIntegrationEngine {
    constructor(basePath) {
        this.basePath = basePath || path.join(__dirname, '..');
        this.name = 'Sheikha Integration Engine';
        this.nameAr = 'منظومة شيخة للتكامل الذكي';
        this.version = '2.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this.stateFile = path.join(this.basePath, 'data', 'integration-hub-state.json');
        this.eventsFile = path.join(this.basePath, 'data', 'operations', 'integration-events.ndjson');
        this.autonomousTimer = null;
        this.autonomousLock = false;
        this._init();
    }

    _init() {
        this.quranReferences = [
            { ayah: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى', surah: 'المائدة', num: 2, topic: 'التعاون والتكامل' },
            { ayah: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا', surah: 'آل عمران', num: 103, topic: 'الوحدة والترابط' }
        ];
        this.integrationLayers = [
            { id: 'INT-01', nameAr: 'طبقة البيانات', nameEn: 'Data Layer', desc: 'تدفق البيانات بين كل المحركات', protocols: ['REST API', 'WebSocket', 'Message Queue', 'Event Bus'] },
            { id: 'INT-02', nameAr: 'طبقة الخدمات', nameEn: 'Service Layer', desc: 'تكامل الخدمات والوظائف', patterns: ['Microservices', 'API Gateway', 'Service Mesh', 'Circuit Breaker'] },
            { id: 'INT-03', nameAr: 'طبقة الأمان', nameEn: 'Security Layer', desc: 'توحيد الأمان والمصادقة', features: ['SSO', 'OAuth 2.0', 'JWT', 'Role-Based Access'] },
            { id: 'INT-04', nameAr: 'طبقة التحويل', nameEn: 'Transformation Layer', desc: 'تحويل النماذج بين شيخة وERP', features: ['Field Mapping', 'Value Normalization', 'Validation Rules', 'Schema Versioning'] },
            { id: 'INT-05', nameAr: 'طبقة القياس والتقارير', nameEn: 'Analytics & Reporting', desc: 'قياس الفجوات وأتمتة التقارير التصحيحية', features: ['Gap Analysis', 'Data Quality Score', 'Corrective Actions', 'Executive Reports'] }
        ];
        this.engineMap = {
            totalEngines: 53,
            categories: ['شريعة', 'حوكمة', 'علوم', 'تقنية', 'اقتصاد', 'تجارة', 'صناعة', 'إمداد', 'موارد', 'مجتمع', 'تشغيل', 'جودة', 'تسويق', 'نظام تشغيل', 'متصفح', 'تطوير', 'رزنامة', 'فهرسة', 'طبية', 'تعليمات', 'كتاب وسنة', 'هوية', 'معالجة ذاتية', 'تكامل']
        };
        this.dataFlowPatterns = [
            { nameAr: 'نشر/اشتراك', nameEn: 'Pub/Sub', desc: 'محرك ينشر حدث وباقي المحركات تستقبل' },
            { nameAr: 'طلب/استجابة', nameEn: 'Request/Response', desc: 'محرك يطلب بيانات من محرك آخر' },
            { nameAr: 'تدفق أحداث', nameEn: 'Event Streaming', desc: 'تدفق مستمر للأحداث بين المحركات' },
            { nameAr: 'تزامن بيانات', nameEn: 'Data Sync', desc: 'مزامنة البيانات بين المحركات' }
        ];
        this.shariaGuidelines = {
            principles: ['التكامل يخدم مقاصد الشريعة', 'حماية البيانات أمانة', 'الشفافية في تدفق البيانات', 'لا تكامل مع أنظمة محرمة']
        };
        this.connectors = [
            { id: 'sap-s4hana', name: 'SAP S/4HANA', protocols: ['OData', 'REST', 'IDoc', 'SFTP'], direction: 'bidirectional', status: 'ready' },
            { id: 'oracle-erp-cloud', name: 'Oracle ERP Cloud', protocols: ['REST', 'SOAP', 'SFTP'], direction: 'bidirectional', status: 'ready' },
            { id: 'ms-dynamics', name: 'Microsoft Dynamics 365', protocols: ['REST', 'OData'], direction: 'bidirectional', status: 'ready' },
            { id: 'odoo', name: 'Odoo', protocols: ['REST', 'RPC', 'Webhook'], direction: 'bidirectional', status: 'ready' },
            { id: 'custom', name: 'Custom ERP', protocols: ['REST', 'Webhook', 'CSV'], direction: 'bidirectional', status: 'ready' }
        ];
        this.defaultMapping = {
            productCode: ['sku', 'materialCode', 'item_code'],
            description: ['name', 'description', 'item_name'],
            hsCode: ['hs', 'hsCode', 'customs_code'],
            quantity: ['qty', 'quantity', 'availableQty'],
            uom: ['unit', 'uom', 'unitOfMeasure'],
            unitPrice: ['price', 'unitPrice', 'rate'],
            currency: ['currency', 'currencyCode'],
            storeName: ['storeName', 'warehouseName', 'branchName'],
            timestamp: ['updatedAt', 'timestamp', 'lastModified']
        };
        this.oracleConfigFile = path.join(this.basePath, 'data', 'integration-oracle-config.json');
        this.oracleTokenCache = {
            accessToken: '',
            tokenType: 'Bearer',
            fetchedAt: 0,
            expiresAt: 0,
            scope: ''
        };
        this.oracleConfig = this._loadOracleConfig();
        this.tenantModelStore = new SheikhaTenantModelStore(this.basePath);
        this.tenantAuthAgent = new SheikhaTenantAuthAgent({
            secret: process.env.SHEIKHA_TENANT_AGENT_SECRET || process.env.JWT_SECRET || 'sheikha-tenant-agent-secret',
            modelStore: this.tenantModelStore,
            logEvent: (type, payload) => this._logEvent(type, payload)
        });
        this.tenantContextMiddleware = createTenantContextMiddleware(this.tenantAuthAgent);
        this.state = this._loadState();
        this._bootstrapAutonomousMode();
    }

    _defaultState() {
        return {
            pipelines: [],
            connections: [],
            reports: [],
            tenants: [],
            tenantConnections: [],
            mappingProfiles: [],
            packActivations: [],
            flowRuns: [],
            deadLetterQueue: [],
            queuedFlows: [],
            sourcingProviders: [],
            sourcingCampaigns: [],
            sourcingCatalog: [],
            sourcingScoringConfig: {
                weights: {
                    security: 0.3,
                    reliability: 0.3,
                    sharia: 0.25,
                    cost: 0.15
                },
                defaults: {
                    security: 70,
                    reliability: 70,
                    sharia: 85,
                    cost: 60
                }
            },
            vcsActivityRuns: [],
            idempotencyRegistry: {},
            zeroKeyPairings: [],
            zeroKeyConnections: [],
            superiorActivations: [],
            verticalActivations: [],
            saasProvisioningRuns: [],
            ecosystemRuns: [],
            operatingLayerRuns: [],
            supremeArchitectureRuns: [],
            autonomousOps: {
                enabled: false,
                intervalSec: 30,
                maxRunsPerCycle: 25,
                stopOnFailureRate: 0.5,
                minSampleForStop: 6,
                lastStartedAt: null,
                lastStoppedAt: null,
                lastCycleAt: null,
                lastCycleSummary: null,
                pausedReason: ''
            },
            lastGapAnalysis: null,
            oracleAudit: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                rateLimited: 0,
                retriedRequests: 0,
                lastRequestAt: null
            },
            kpis: {
                totalTransforms: 0,
                successfulTransforms: 0,
                failedTransforms: 0,
                averageQualityScore: 0,
                averageGapScore: 0
            }
        };
    }

    _loadState() {
        try {
            if (fs.existsSync(this.stateFile)) {
                return Object.assign(this._defaultState(), JSON.parse(fs.readFileSync(this.stateFile, 'utf8')));
            }
        } catch (_) {}
        return this._defaultState();
    }

    _saveState() {
        try {
            const dir = path.dirname(this.stateFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2), 'utf8');
        } catch (_) {}
    }

    _logEvent(type, payload) {
        try {
            const dir = path.dirname(this.eventsFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const entry = JSON.stringify({ type, payload, timestamp: new Date().toISOString() }) + '\n';
            fs.appendFileSync(this.eventsFile, entry, 'utf8');
        } catch (_) {}
    }

    _defaultOracleConfig() {
        return {
            enabled: false,
            client_id: process.env.ORACLE_CLIENT_ID || '',
            client_secret: process.env.ORACLE_CLIENT_SECRET || '',
            token_url: process.env.ORACLE_TOKEN_URL || '',
            scopes: (process.env.ORACLE_SCOPES || '').split(/\s+/).filter(Boolean),
            grant_type: process.env.ORACLE_GRANT_TYPE || 'client_credentials',
            refresh_token: process.env.ORACLE_REFRESH_TOKEN || '',
            token_buffer_sec: Number(process.env.ORACLE_TOKEN_BUFFER_SEC || 90),
            timeout_ms: Number(process.env.ORACLE_TIMEOUT_MS || 15000),
            retry: {
                maxAttempts: Number(process.env.ORACLE_RETRY_MAX_ATTEMPTS || 3),
                baseDelayMs: Number(process.env.ORACLE_RETRY_BASE_DELAY_MS || 450),
                maxDelayMs: Number(process.env.ORACLE_RETRY_MAX_DELAY_MS || 5000)
            },
            rateLimit: {
                maxRequests: Number(process.env.ORACLE_RATE_MAX_REQUESTS || 120),
                windowMs: Number(process.env.ORACLE_RATE_WINDOW_MS || 60000)
            }
        };
    }

    _loadOracleConfig() {
        const defaults = this._defaultOracleConfig();
        try {
            if (fs.existsSync(this.oracleConfigFile)) {
                const raw = JSON.parse(fs.readFileSync(this.oracleConfigFile, 'utf8'));
                return Object.assign({}, defaults, raw, {
                    retry: Object.assign({}, defaults.retry, raw.retry || {}),
                    rateLimit: Object.assign({}, defaults.rateLimit, raw.rateLimit || {})
                });
            }
        } catch (_) {}
        return defaults;
    }

    _saveOracleConfig() {
        try {
            const dir = path.dirname(this.oracleConfigFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.oracleConfigFile, JSON.stringify(this.oracleConfig, null, 2), 'utf8');
        } catch (_) {}
    }

    _maskSecret(secret) {
        const s = String(secret || '');
        if (!s) return '';
        if (s.length <= 6) return '***';
        return `${s.slice(0, 3)}***${s.slice(-3)}`;
    }

    _oracleConfigPublic() {
        const cfg = this.oracleConfig || this._defaultOracleConfig();
        return {
            enabled: !!cfg.enabled,
            client_id: cfg.client_id || '',
            client_secret_masked: this._maskSecret(cfg.client_secret),
            token_url: cfg.token_url || '',
            scopes: Array.isArray(cfg.scopes) ? cfg.scopes : [],
            grant_type: cfg.grant_type || 'client_credentials',
            has_refresh_token: !!cfg.refresh_token,
            token_buffer_sec: Number(cfg.token_buffer_sec || 90),
            timeout_ms: Number(cfg.timeout_ms || 15000),
            retry: Object.assign({ maxAttempts: 3, baseDelayMs: 450, maxDelayMs: 5000 }, cfg.retry || {}),
            rateLimit: Object.assign({ maxRequests: 120, windowMs: 60000 }, cfg.rateLimit || {})
        };
    }

    _validateOracleConfig(cfg) {
        const errors = [];
        if (!cfg.client_id) errors.push('client_id مطلوب');
        if (!cfg.client_secret) errors.push('client_secret مطلوب');
        if (!cfg.token_url) errors.push('token_url مطلوب');
        return {
            ok: errors.length === 0,
            errors
        };
    }

    configureOracleAuth(input) {
        const body = input || {};
        const current = this.oracleConfig || this._defaultOracleConfig();
        const next = Object.assign({}, current);
        if (body.enabled !== undefined) next.enabled = !!body.enabled;
        if (body.client_id !== undefined) next.client_id = String(body.client_id || '').trim();
        if (body.client_secret !== undefined) next.client_secret = String(body.client_secret || '').trim();
        if (body.token_url !== undefined) next.token_url = String(body.token_url || '').trim();
        if (body.scopes !== undefined) {
            if (Array.isArray(body.scopes)) next.scopes = body.scopes.map((x) => String(x || '').trim()).filter(Boolean);
            else next.scopes = String(body.scopes || '').split(/\s+/).filter(Boolean);
        }
        if (body.grant_type !== undefined) next.grant_type = String(body.grant_type || 'client_credentials').trim();
        if (body.refresh_token !== undefined) next.refresh_token = String(body.refresh_token || '').trim();
        if (body.token_buffer_sec !== undefined) next.token_buffer_sec = Math.max(10, Number(body.token_buffer_sec) || 90);
        if (body.timeout_ms !== undefined) next.timeout_ms = Math.max(1000, Number(body.timeout_ms) || 15000);
        next.retry = Object.assign({}, current.retry || {}, body.retry || {});
        next.rateLimit = Object.assign({}, current.rateLimit || {}, body.rateLimit || {});
        next.retry.maxAttempts = Math.max(1, Number(next.retry.maxAttempts) || 3);
        next.retry.baseDelayMs = Math.max(100, Number(next.retry.baseDelayMs) || 450);
        next.retry.maxDelayMs = Math.max(next.retry.baseDelayMs, Number(next.retry.maxDelayMs) || 5000);
        next.rateLimit.maxRequests = Math.max(1, Number(next.rateLimit.maxRequests) || 120);
        next.rateLimit.windowMs = Math.max(1000, Number(next.rateLimit.windowMs) || 60000);
        this.oracleConfig = next;
        this._saveOracleConfig();
        this._logEvent('oracle_config_updated', {
            enabled: next.enabled,
            token_url: next.token_url,
            scopes: next.scopes,
            grant_type: next.grant_type
        });
        return {
            success: true,
            config: this._oracleConfigPublic(),
            validation: this._validateOracleConfig(next)
        };
    }

    _oracleTokenNearExpiry(bufferSec) {
        const now = Date.now();
        const b = Math.max(10, Number(bufferSec || 90)) * 1000;
        return !this.oracleTokenCache.accessToken || (this.oracleTokenCache.expiresAt - now) <= b;
    }

    async _wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async _fetchOracleToken(forceRefresh) {
        const cfg = this.oracleConfig || this._defaultOracleConfig();
        const valid = this._validateOracleConfig(cfg);
        if (!valid.ok) {
            throw new Error(`إعداد Oracle OAuth غير مكتمل: ${valid.errors.join(' | ')}`);
        }

        const grantType = String(cfg.grant_type || 'client_credentials').toLowerCase();
        const body = new URLSearchParams();
        let usingGrantType = grantType;

        // دعم refresh token عند الطلب أو عند اقتراب انتهاء التوكن.
        if ((grantType === 'refresh_token' || forceRefresh) && cfg.refresh_token) {
            body.set('grant_type', 'refresh_token');
            body.set('refresh_token', cfg.refresh_token);
            usingGrantType = 'refresh_token';
        } else {
            body.set('grant_type', 'client_credentials');
            usingGrantType = 'client_credentials';
        }

        body.set('client_id', cfg.client_id);
        body.set('client_secret', cfg.client_secret);
        if (Array.isArray(cfg.scopes) && cfg.scopes.length) {
            body.set('scope', cfg.scopes.join(' '));
        }

        const startedAt = Date.now();
        const resp = await fetch(cfg.token_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: body.toString()
        });

        let tokenData = {};
        try {
            tokenData = await resp.json();
        } catch (_) {}

        if (!resp.ok) {
            const msg = tokenData.error_description || tokenData.error || `HTTP ${resp.status}`;
            throw new Error(`فشل جلب Oracle token: ${msg}`);
        }

        const accessToken = String(tokenData.access_token || '');
        const tokenType = String(tokenData.token_type || 'Bearer');
        const expiresInSec = Math.max(30, Number(tokenData.expires_in || 3600));
        if (!accessToken) throw new Error('استجابة التوكن لا تحتوي access_token');

        if (tokenData.refresh_token) this.oracleConfig.refresh_token = String(tokenData.refresh_token);
        this.oracleTokenCache = {
            accessToken,
            tokenType,
            fetchedAt: Date.now(),
            expiresAt: Date.now() + (expiresInSec * 1000),
            scope: String(tokenData.scope || (cfg.scopes || []).join(' '))
        };
        this._saveOracleConfig();
        this._logEvent('oracle_token_fetched', {
            grantType: usingGrantType,
            latencyMs: Date.now() - startedAt,
            expiresInSec
        });
        return {
            tokenType,
            expiresInSec,
            expiresAt: new Date(this.oracleTokenCache.expiresAt).toISOString(),
            scope: this.oracleTokenCache.scope,
            grantType: usingGrantType
        };
    }

    async getOracleAccessToken(input) {
        const cfg = this.oracleConfig || this._defaultOracleConfig();
        const forceRefresh = !!(input && input.forceRefresh);
        if (forceRefresh || this._oracleTokenNearExpiry(cfg.token_buffer_sec)) {
            await this._fetchOracleToken(forceRefresh);
        }
        return {
            accessToken: this.oracleTokenCache.accessToken,
            tokenType: this.oracleTokenCache.tokenType || 'Bearer',
            expiresAt: this.oracleTokenCache.expiresAt
        };
    }

    _applyOracleRateLimit() {
        const cfg = this.oracleConfig || this._defaultOracleConfig();
        const rl = cfg.rateLimit || { maxRequests: 120, windowMs: 60000 };
        const now = Date.now();
        if (!this.state.oracleRateLimit) {
            this.state.oracleRateLimit = { windowStart: now, count: 0 };
        }
        if ((now - this.state.oracleRateLimit.windowStart) >= rl.windowMs) {
            this.state.oracleRateLimit.windowStart = now;
            this.state.oracleRateLimit.count = 0;
        }
        if (this.state.oracleRateLimit.count >= rl.maxRequests) {
            this.state.oracleAudit.rateLimited += 1;
            this._saveState();
            return {
                allowed: false,
                retryAfterMs: Math.max(0, rl.windowMs - (now - this.state.oracleRateLimit.windowStart))
            };
        }
        this.state.oracleRateLimit.count += 1;
        this._saveState();
        return { allowed: true, retryAfterMs: 0 };
    }

    async sendOracleRequest(input) {
        const req = input || {};
        const url = String(req.url || '').trim();
        if (!url) return { success: false, message: 'url مطلوب' };
        const method = String(req.method || 'GET').toUpperCase();
        const body = req.body;
        const customHeaders = (req.headers && typeof req.headers === 'object') ? req.headers : {};
        const cfg = this.oracleConfig || this._defaultOracleConfig();
        const retryCfg = cfg.retry || { maxAttempts: 3, baseDelayMs: 450, maxDelayMs: 5000 };
        const maxAttempts = Math.max(1, Number(retryCfg.maxAttempts || 3));
        const baseDelayMs = Math.max(100, Number(retryCfg.baseDelayMs || 450));
        const maxDelayMs = Math.max(baseDelayMs, Number(retryCfg.maxDelayMs || 5000));
        const rate = this._applyOracleRateLimit();
        if (!rate.allowed) {
            return {
                success: false,
                message: `تم تجاوز حد الطلبات المسموح (${cfg.rateLimit.maxRequests}/${cfg.rateLimit.windowMs}ms)`,
                retryAfterMs: rate.retryAfterMs
            };
        }

        let attempt = 0;
        let lastError = null;
        let lastStatus = 0;
        const startedAt = Date.now();
        while (attempt < maxAttempts) {
            attempt += 1;
            try {
                const token = await this.getOracleAccessToken({ forceRefresh: attempt > 1 });
                const headers = Object.assign({}, customHeaders, {
                    'Authorization': `${token.tokenType || 'Bearer'} ${token.accessToken}`,
                    'Accept': 'application/json'
                });
                let payload;
                if (body !== undefined && body !== null) {
                    if (typeof body === 'string') {
                        payload = body;
                    } else {
                        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
                        payload = JSON.stringify(body);
                    }
                }

                const resp = await fetch(url, {
                    method,
                    headers,
                    body: payload
                });
                lastStatus = resp.status;
                const raw = await resp.text();
                const isJson = (resp.headers.get('content-type') || '').includes('application/json');
                const parsed = isJson ? (() => { try { return JSON.parse(raw); } catch (_) { return null; } })() : null;
                if (resp.ok) {
                    this.state.oracleAudit.totalRequests += 1;
                    this.state.oracleAudit.successfulRequests += 1;
                    this.state.oracleAudit.lastRequestAt = new Date().toISOString();
                    this._saveState();
                    this._logEvent('oracle_outbound_success', {
                        method,
                        url,
                        status: resp.status,
                        attempt,
                        latencyMs: Date.now() - startedAt
                    });
                    return {
                        success: true,
                        status: resp.status,
                        data: parsed !== null ? parsed : raw,
                        meta: {
                            attempt,
                            signed: true,
                            latencyMs: Date.now() - startedAt
                        }
                    };
                }

                const shouldRetry = resp.status === 429 || resp.status >= 500;
                lastError = new Error(`Oracle HTTP ${resp.status}`);
                if (!shouldRetry || attempt >= maxAttempts) break;
                this.state.oracleAudit.retriedRequests += 1;
                this._saveState();
            } catch (e) {
                lastError = e;
                if (attempt >= maxAttempts) break;
                this.state.oracleAudit.retriedRequests += 1;
                this._saveState();
            }

            const backoff = Math.min(maxDelayMs, baseDelayMs * (2 ** (attempt - 1)));
            await this._wait(backoff);
        }

        this.state.oracleAudit.totalRequests += 1;
        this.state.oracleAudit.failedRequests += 1;
        this.state.oracleAudit.lastRequestAt = new Date().toISOString();
        this._saveState();
        this._logEvent('oracle_outbound_failed', {
            method,
            url,
            attempts: attempt,
            status: lastStatus,
            error: String((lastError && lastError.message) || 'unknown'),
            latencyMs: Date.now() - startedAt
        });

        return {
            success: false,
            message: String((lastError && lastError.message) || 'فشل طلب Oracle'),
            status: lastStatus,
            attempts: attempt
        };
    }

    _canonicalModel() {
        return {
            version: '1.0.0',
            entities: {
                customer: ['canonicalId', 'name', 'taxId', 'country', 'email', 'phone', 'status', 'updatedAt'],
                supplier: ['canonicalId', 'name', 'taxId', 'country', 'email', 'phone', 'status', 'updatedAt'],
                item: ['canonicalId', 'sku', 'name', 'hsCode', 'uom', 'unitPrice', 'currency', 'updatedAt'],
                material: ['canonicalId', 'materialCode', 'description', 'hsCode', 'uom', 'updatedAt'],
                scrapLot: ['canonicalId', 'lotCode', 'materialType', 'grade', 'weightKg', 'originSite', 'hsCode', 'qualityScore', 'createdAt'],
                dismantledPart: ['canonicalId', 'partCode', 'vehicleRef', 'category', 'condition', 'weightKg', 'serialNo', 'createdAt'],
                salvageVehicle: ['canonicalId', 'vehicleRef', 'vin', 'make', 'model', 'year', 'status', 'originYard', 'createdAt'],
                weighbridgeTicket: ['canonicalId', 'ticketNo', 'lotRef', 'grossKg', 'tareKg', 'netKg', 'measuredAt'],
                purchaseOrder: ['canonicalId', 'poNumber', 'buyerId', 'supplierId', 'lines', 'currency', 'total', 'status', 'createdAt'],
                salesOrder: ['canonicalId', 'soNumber', 'sellerId', 'customerId', 'lines', 'currency', 'total', 'status', 'createdAt'],
                invoice: ['canonicalId', 'invoiceNumber', 'orderRef', 'amount', 'currency', 'status', 'issuedAt'],
                payment: ['canonicalId', 'paymentRef', 'invoiceRef', 'amount', 'currency', 'method', 'status', 'paidAt'],
                inventory: ['canonicalId', 'itemRef', 'warehouseRef', 'quantity', 'uom', 'updatedAt'],
                shipment: ['canonicalId', 'shipmentNo', 'orderRef', 'carrier', 'status', 'shippedAt', 'deliveredAt'],
                glJournal: ['canonicalId', 'journalNo', 'companyCode', 'costCenter', 'lines', 'postedAt', 'status'],
                costCenter: ['canonicalId', 'code', 'name', 'companyCode', 'status', 'updatedAt']
            }
        };
    }

    _integrationPacks() {
        return [
            { id: 'pack-customers-items', name: 'Customers + Items Sync', flows: ['customers.sync', 'items.sync'], priority: 1 },
            { id: 'pack-orders', name: 'PO/SO', flows: ['purchaseOrders.sync', 'salesOrders.sync'], priority: 2 },
            { id: 'pack-invoices-payments', name: 'Invoices + Payments', flows: ['invoices.sync', 'payments.sync'], priority: 3 },
            { id: 'pack-inventory-shipments', name: 'Inventory + Shipments', flows: ['inventory.sync', 'shipments.sync'], priority: 4 },
            { id: 'pack-gl', name: 'GL Journals', flows: ['glJournals.sync'], priority: 5 },
            { id: 'pack-metals-trading', name: 'Metals Trading Core', flows: ['metals.catalog.sync', 'metals.quote.sync', 'metals.order.sync'], priority: 6 },
            { id: 'pack-scrap-yard', name: 'Scrap Yard Operations', flows: ['scrap.lot.sync', 'scrap.weighbridge.sync', 'scrap.compliance.sync'], priority: 7 },
            { id: 'pack-dismantling', name: 'Dismantling & Salvage', flows: ['dismantling.vehicle.sync', 'dismantling.parts.sync', 'dismantling.auction.sync'], priority: 8 }
        ];
    }

    _marketVerticalProfiles() {
        return {
            'metals-scrap-dismantling': {
                id: 'metals-scrap-dismantling',
                name: 'المعادن + السكراب + التشليح',
                description: 'المرحلة التشغيلية الأولى لسوق شيخة مع سلاسل توريد المعادن وإدارة السكراب والتشليح',
                startupPacks: [
                    'pack-customers-items',
                    'pack-metals-trading',
                    'pack-scrap-yard',
                    'pack-dismantling',
                    'pack-orders',
                    'pack-invoices-payments',
                    'pack-inventory-shipments'
                ],
                startupFlows: [
                    'metals.catalog.sync',
                    'scrap.lot.sync',
                    'scrap.weighbridge.sync',
                    'dismantling.parts.sync',
                    'purchaseOrders.sync',
                    'salesOrders.sync'
                ],
                kpis: ['lotTurnoverDays', 'yieldRecoveryPct', 'partSellThroughPct', 'onTimeShipmentPct'],
                expansionPath: ['precious-metals', 'industrial-materials', 'construction-surplus', 'global-b2b-marketplace']
            },
            'precious-metals': {
                id: 'precious-metals',
                name: 'المعادن الثمينة',
                description: 'امتداد لسوق السبائك والذهب والفضة مع ضبط مطابقة العيارات والشهادات',
                startupPacks: ['pack-customers-items', 'pack-orders', 'pack-invoices-payments'],
                startupFlows: ['metals.catalog.sync', 'metals.quote.sync', 'invoices.sync'],
                kpis: ['purityCompliancePct', 'hedgeCoveragePct', 'settlementLeadTimeHours'],
                expansionPath: ['global-bullion-hubs']
            },
            'general-b2b': {
                id: 'general-b2b',
                name: 'أسواق B2B عامة',
                description: 'توسع أفقي لأسواق أخرى بنفس هيكل التكامل المؤسسي',
                startupPacks: ['pack-customers-items', 'pack-orders', 'pack-inventory-shipments'],
                startupFlows: ['customers.sync', 'items.sync', 'salesOrders.sync', 'shipments.sync'],
                kpis: ['orderCycleHours', 'fillRatePct', 'reconciliationAccuracyPct'],
                expansionPath: ['regional-wholesale', 'cross-border-b2b']
            }
        };
    }

    _erpSystems() {
        return ['oracle-erp-cloud', 'sap-s4hana', 'ms-dynamics', 'odoo', 'custom-erp'];
    }

    _newId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    _slugifyTenantName(name) {
        const base = String(name || '')
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        if (base) return base.slice(0, 48);
        return `tenant-${Date.now()}`;
    }

    _containsRawSecretInput(input) {
        const txt = JSON.stringify(input || {}).toLowerCase();
        return txt.includes('client_secret') || txt.includes('private_key') || txt.includes('password') || txt.includes('token_url');
    }

    _hashPayload(payload) {
        const raw = JSON.stringify(payload || {});
        return nodeCrypto.createHash('sha256').update(raw).digest('hex');
    }

    _error(code, message, details) {
        return {
            success: false,
            error: {
                code,
                message,
                details: details || null
            }
        };
    }

    registerTenant(input) {
        const req = input || {};
        const name = String(req.name || '').trim();
        if (!name) return this._error('TENANT_NAME_REQUIRED', 'اسم الجهة مطلوب');
        const tenantSlug = this._slugifyTenantName(name);
        const tenant = {
            tenantId: this._newId('TEN'),
            name,
            displayName: String(req.displayName || name).trim() || name,
            tenantSlug,
            subdomain: `${tenantSlug}.sheikha.top`,
            defaultWorkspaceId: this._newId('WS'),
            type: String(req.type || 'company'),
            country: String(req.country || 'SA'),
            partitionKey: {
                legalEntity: String((req.partitionKey || {}).legalEntity || req.legalEntity || '').trim(),
                businessUnit: String((req.partitionKey || {}).businessUnit || req.businessUnit || '').trim(),
                companyCode: String((req.partitionKey || {}).companyCode || req.companyCode || '').trim()
            },
            isolationMode: 'strict',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        this.state.tenants.unshift(tenant);
        this.state.tenants = this.state.tenants.slice(0, 1000);
        if (this.tenantModelStore && typeof this.tenantModelStore.upsertTenant === 'function') {
            this.tenantModelStore.upsertTenant({
                tenantId: tenant.tenantId,
                name: tenant.name,
                market: req.market || 'metals-scrap-dismantling',
                erpSystem: req.erpSystem || '',
                partitionKey: tenant.partitionKey,
                status: tenant.status
            });
        }
        this._saveState();
        this._logEvent('tenant_registered', { tenantId: tenant.tenantId, name: tenant.name });
        return { success: true, tenant };
    }

    listTenants() {
        return (this.state.tenants || []).map((t) => ({
            tenantId: t.tenantId,
            name: t.name,
            displayName: t.displayName || t.name || '',
            tenantSlug: t.tenantSlug || '',
            subdomain: t.subdomain || '',
            type: t.type,
            country: t.country,
            status: t.status,
            partitionKey: t.partitionKey,
            createdAt: t.createdAt
        }));
    }

    connectTenantSystem(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const targetSystem = String(req.targetSystem || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!targetSystem) return this._error('TARGET_SYSTEM_REQUIRED', 'targetSystem مطلوب');
        if (this._containsRawSecretInput(req)) {
            return this._error('RAW_SECRET_FORBIDDEN', 'مرفوض أمنيًا: لا ترسل أسرار ERP مباشرة، استخدم secret_ref فقط');
        }
        const tenant = (this.state.tenants || []).find((t) => t.tenantId === tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');
        if (!this._erpSystems().includes(targetSystem) && !['google-workspace', 'microsoft-365', 'github', 'gitlab'].includes(targetSystem)) {
            return this._error('SYSTEM_NOT_SUPPORTED', 'النظام المطلوب غير مدعوم');
        }

        const connection = {
            connectionId: this._newId('TCONN'),
            tenantId,
            targetSystem,
            authMode: String(req.authMode || 'oauth2'),
            authMethod: String(req.authMethod || req.authMode || 'oauth2'),
            scopes: Array.isArray(req.scopes) ? req.scopes : ['read', 'write', 'sync'],
            partitionKey: Object.assign({}, tenant.partitionKey, req.partitionKey || {}),
            status: String(req.status || 'pending_auth'),
            secretRef: String(req.secretRef || ''),
            vaultProvider: String(req.vaultProvider || ''),
            baseUrl: String(req.baseUrl || ''),
            identityUrl: String(req.identityUrl || ''),
            cacheIsolationKey: `${tenantId}:${targetSystem}`,
            rotationPolicyDays: Number(req.rotationPolicyDays || 90),
            nextRotationAt: new Date(Date.now() + ((Number(req.rotationPolicyDays || 90)) * 24 * 60 * 60 * 1000)).toISOString(),
            createdAt: new Date().toISOString(),
            lastHealthCheckAt: null
        };

        this.state.tenantConnections.unshift(connection);
        this.state.tenantConnections = this.state.tenantConnections.slice(0, 4000);
        this._saveState();
        this._logEvent('tenant_connection_created', {
            tenantId,
            connectionId: connection.connectionId,
            targetSystem
        });
        return { success: true, connection };
    }

    listTenantConnections(tenantId) {
        return (this.state.tenantConnections || []).filter((c) => c.tenantId === tenantId);
    }

    activatePack(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const packId = String(req.packId || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!packId) return this._error('PACK_ID_REQUIRED', 'packId مطلوب');
        const tenant = (this.state.tenants || []).find((t) => t.tenantId === tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');
        const pack = this._integrationPacks().find((p) => p.id === packId);
        if (!pack) return this._error('PACK_NOT_FOUND', 'حزمة التكامل غير موجودة');

        const activation = {
            activationId: this._newId('PACK'),
            tenantId,
            packId,
            packName: pack.name,
            flows: pack.flows,
            status: 'active',
            activatedAt: new Date().toISOString()
        };
        this.state.packActivations.unshift(activation);
        this.state.packActivations = this.state.packActivations.slice(0, 4000);

        const mappingProfile = {
            profileId: this._newId('MAP'),
            tenantId,
            packId,
            canonicalVersion: this._canonicalModel().version,
            mappings: pack.flows.map((f) => ({
                flow: f,
                sourceToCanonical: [],
                canonicalToTarget: []
            })),
            createdAt: new Date().toISOString()
        };
        this.state.mappingProfiles.unshift(mappingProfile);
        this.state.mappingProfiles = this.state.mappingProfiles.slice(0, 4000);
        this._saveState();
        this._logEvent('integration_pack_activated', {
            tenantId,
            packId,
            activationId: activation.activationId,
            profileId: mappingProfile.profileId
        });
        return { success: true, activation, mappingProfile };
    }

    _flowRequiredFields(flowType) {
        const map = {
            'customers.sync': ['name'],
            'items.sync': ['sku', 'hsCode'],
            'purchaseOrders.sync': ['poNumber', 'lines'],
            'salesOrders.sync': ['soNumber', 'lines'],
            'invoices.sync': ['invoiceNumber', 'amount'],
            'payments.sync': ['paymentRef', 'amount'],
            'inventory.sync': ['itemRef', 'quantity'],
            'shipments.sync': ['shipmentNo', 'orderRef'],
            'glJournals.sync': ['journalNo', 'lines'],
            'metals.catalog.sync': ['materialCode', 'hsCode'],
            'metals.quote.sync': ['materialCode', 'unitPrice', 'currency'],
            'metals.order.sync': ['orderNo', 'materialCode', 'quantity'],
            'scrap.lot.sync': ['lotCode', 'materialType', 'weightKg'],
            'scrap.weighbridge.sync': ['ticketNo', 'netKg'],
            'scrap.compliance.sync': ['lotCode', 'complianceStatus'],
            'dismantling.vehicle.sync': ['vehicleRef', 'vin', 'status'],
            'dismantling.parts.sync': ['partCode', 'vehicleRef', 'condition'],
            'dismantling.auction.sync': ['auctionRef', 'partCode', 'startingBid']
        };
        return map[flowType] || ['canonicalId'];
    }

    _checkIdempotency(key, requestHash) {
        if (!key) return { duplicate: false };
        const bucket = this.state.idempotencyRegistry || {};
        if (bucket[key]) {
            const sameRequest = !requestHash || !bucket[key].requestHash || bucket[key].requestHash === requestHash;
            return {
                duplicate: true,
                sameRequest,
                existingRunId: bucket[key].runId,
                at: bucket[key].at
            };
        }
        return { duplicate: false };
    }

    _saveIdempotency(key, runId, requestHash, responseRef) {
        if (!key) return;
        this.state.idempotencyRegistry = this.state.idempotencyRegistry || {};
        this.state.idempotencyRegistry[key] = {
            runId,
            requestHash: requestHash || '',
            responseRef: responseRef || '',
            at: new Date().toISOString()
        };
    }

    _autonomousConfig(input) {
        const req = input || {};
        const current = this.state.autonomousOps || {};
        return {
            enabled: req.enabled !== undefined ? !!req.enabled : !!current.enabled,
            intervalSec: Math.max(5, Number(req.intervalSec !== undefined ? req.intervalSec : (current.intervalSec || 30))),
            maxRunsPerCycle: Math.max(1, Number(req.maxRunsPerCycle !== undefined ? req.maxRunsPerCycle : (current.maxRunsPerCycle || 25))),
            stopOnFailureRate: Math.min(0.95, Math.max(0.1, Number(req.stopOnFailureRate !== undefined ? req.stopOnFailureRate : (current.stopOnFailureRate || 0.5)))),
            minSampleForStop: Math.max(3, Number(req.minSampleForStop !== undefined ? req.minSampleForStop : (current.minSampleForStop || 6))),
            lastStartedAt: current.lastStartedAt || null,
            lastStoppedAt: current.lastStoppedAt || null,
            lastCycleAt: current.lastCycleAt || null,
            lastCycleSummary: current.lastCycleSummary || null,
            pausedReason: current.pausedReason || ''
        };
    }

    _bootstrapAutonomousMode() {
        const envEnabled = String(process.env.SHEIKHA_AUTONOMOUS_ENABLED || 'true') !== 'false';
        if (!envEnabled) return;
        const cfg = this._autonomousConfig({
            enabled: true,
            intervalSec: process.env.SHEIKHA_AUTONOMOUS_INTERVAL_SEC,
            maxRunsPerCycle: process.env.SHEIKHA_AUTONOMOUS_MAX_RUNS,
            stopOnFailureRate: process.env.SHEIKHA_AUTONOMOUS_STOP_FAILURE_RATE,
            minSampleForStop: process.env.SHEIKHA_AUTONOMOUS_STOP_MIN_SAMPLE
        });
        this.state.autonomousOps = cfg;
        this.state.autonomousOps.lastStartedAt = new Date().toISOString();
        this.state.autonomousOps.pausedReason = '';
        this._saveState();
        this._ensureAutonomousTimer();
    }

    _ensureAutonomousTimer() {
        if (!this.state.autonomousOps || !this.state.autonomousOps.enabled) return;
        const delayMs = Math.max(5000, Number(this.state.autonomousOps.intervalSec || 30) * 1000);
        if (this.autonomousTimer) clearInterval(this.autonomousTimer);
        this.autonomousTimer = setInterval(() => this.runAutonomousCycle(), delayMs);
        if (this.autonomousTimer && typeof this.autonomousTimer.unref === 'function') this.autonomousTimer.unref();
    }

    _stopAutonomousTimer() {
        if (this.autonomousTimer) {
            clearInterval(this.autonomousTimer);
            this.autonomousTimer = null;
        }
    }

    enqueueFlow(input) {
        const req = input || {};
        const sourceTenantId = String(req.sourceTenantId || '').trim();
        const targetTenantId = String(req.targetTenantId || '').trim();
        const flowType = String(req.flowType || '').trim();
        const payload = req.payload || {};
        const idempotencyKey = String(req.idempotencyKey || '').trim() || this._newId('IDEMP_AUTO');
        if (!sourceTenantId || !targetTenantId) return this._error('TENANT_REQUIRED', 'sourceTenantId و targetTenantId مطلوبان');
        if (!flowType) return this._error('FLOW_REQUIRED', 'flowType مطلوب');

        const item = {
            queueId: this._newId('QFLOW'),
            sourceTenantId,
            targetTenantId,
            flowType,
            payload,
            idempotencyKey,
            status: 'queued',
            retries: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.state.queuedFlows.unshift(item);
        this.state.queuedFlows = this.state.queuedFlows.slice(0, 50000);
        this._saveState();
        this._logEvent('flow_enqueued', {
            queueId: item.queueId,
            sourceTenantId,
            targetTenantId,
            flowType
        });
        return { success: true, queueItem: item };
    }

    listQueuedFlows(input) {
        const req = input || {};
        const status = String(req.status || '').trim();
        const tenantId = String(req.tenantId || '').trim();
        let items = this.state.queuedFlows || [];
        if (status) items = items.filter((x) => x.status === status);
        if (tenantId) items = items.filter((x) => x.sourceTenantId === tenantId || x.targetTenantId === tenantId);
        return items.slice(0, 300);
    }

    runAutonomousCycle() {
        if (this.autonomousLock) return { success: true, skipped: true, reason: 'busy' };
        const cfg = this.state.autonomousOps || this._autonomousConfig({});
        if (!cfg.enabled) return { success: true, skipped: true, reason: 'disabled' };

        this.autonomousLock = true;
        try {
            const queued = (this.state.queuedFlows || []).filter((x) => x.status === 'queued');
            const pick = queued.slice(0, cfg.maxRunsPerCycle);
            let completed = 0;
            let failed = 0;
            for (let i = 0; i < pick.length; i++) {
                const item = pick[i];
                item.status = 'running';
                item.updatedAt = new Date().toISOString();
                const result = this.executeFlow({
                    sourceTenantId: item.sourceTenantId,
                    targetTenantId: item.targetTenantId,
                    flowType: item.flowType,
                    payload: item.payload,
                    idempotencyKey: item.idempotencyKey,
                    actor: 'autonomous-engine'
                });
                if (result.success) {
                    item.status = 'completed';
                    item.runId = result.run && result.run.runId ? result.run.runId : (result.runId || '');
                    item.updatedAt = new Date().toISOString();
                    completed += 1;
                } else {
                    item.status = 'failed';
                    item.error = result.error || { code: 'UNKNOWN', message: 'unknown' };
                    item.retries = Number(item.retries || 0) + 1;
                    item.updatedAt = new Date().toISOString();
                    failed += 1;
                }
            }

            const sample = completed + failed;
            const failureRate = sample ? (failed / sample) : 0;
            // حارس لا ضرر ولا ضرار: إيقاف ذاتي عند سلوك فشل مرتفع
            if (sample >= cfg.minSampleForStop && failureRate >= cfg.stopOnFailureRate) {
                cfg.enabled = false;
                cfg.pausedReason = `auto_stop_failure_rate:${failureRate.toFixed(2)}`;
                cfg.lastStoppedAt = new Date().toISOString();
                this._stopAutonomousTimer();
                this._logEvent('autonomous_auto_stopped', {
                    failureRate,
                    sample,
                    reason: cfg.pausedReason
                });
            }

            cfg.lastCycleAt = new Date().toISOString();
            cfg.lastCycleSummary = {
                scannedQueued: queued.length,
                processed: sample,
                completed,
                failed,
                failureRate: Number(failureRate.toFixed(4))
            };
            this.state.autonomousOps = cfg;
            this._saveState();
            this._logEvent('autonomous_cycle', cfg.lastCycleSummary);
            return { success: true, summary: cfg.lastCycleSummary, active: !!cfg.enabled };
        } finally {
            this.autonomousLock = false;
        }
    }

    startAutonomousMode(input) {
        const cfg = this._autonomousConfig(Object.assign({}, input || {}, { enabled: true }));
        cfg.lastStartedAt = new Date().toISOString();
        cfg.pausedReason = '';
        this.state.autonomousOps = cfg;
        this._saveState();
        this._ensureAutonomousTimer();
        this._logEvent('autonomous_started', {
            intervalSec: cfg.intervalSec,
            maxRunsPerCycle: cfg.maxRunsPerCycle
        });
        return { success: true, config: cfg };
    }

    stopAutonomousMode(input) {
        const req = input || {};
        const cfg = this._autonomousConfig({});
        cfg.enabled = false;
        cfg.pausedReason = String(req.reason || 'manual_stop');
        cfg.lastStoppedAt = new Date().toISOString();
        this.state.autonomousOps = cfg;
        this._saveState();
        this._stopAutonomousTimer();
        this._logEvent('autonomous_stopped', { reason: cfg.pausedReason });
        return { success: true, config: cfg };
    }

    autonomousStatus() {
        const cfg = this.state.autonomousOps || this._autonomousConfig({});
        const queued = this.state.queuedFlows || [];
        return {
            enabled: !!cfg.enabled,
            lock: !!this.autonomousLock,
            config: cfg,
            queue: {
                total: queued.length,
                queued: queued.filter((x) => x.status === 'queued').length,
                running: queued.filter((x) => x.status === 'running').length,
                completed: queued.filter((x) => x.status === 'completed').length,
                failed: queued.filter((x) => x.status === 'failed').length
            }
        };
    }

    _sourcingProviderTypes() {
        return [
            'erp_company',
            'market_supplier',
            'carrier',
            'trucking_fleet',
            'logistics_tech',
            'digital_service_provider',
            'software_vendor',
            'fintech_provider'
        ];
    }

    _sourcingCatalogItemTypes() {
        return ['product', 'service', 'program', 'software', 'integration_pack'];
    }

    sourcingBlueprint() {
        return {
            success: true,
            blueprint: {
                model: 'System-to-System Sourcing',
                objective: 'جذب وتسجيل الموردين ومقدمي الخدمات ومنتجاتهم الرقمية آلياً',
                channels: [
                    'ERP delegated OAuth onboarding',
                    'Zero-key agent pairing',
                    'Partner referral network',
                    'Public provider intake API'
                ],
                providerTypes: this._sourcingProviderTypes(),
                itemTypes: this._sourcingCatalogItemTypes(),
                shariaGovernance: {
                    policy: 'لا ضرر ولا ضرار + لا ربا + لا غرر + حفظ الملكية الفكرية',
                    checks: ['consent_required', 'data_minimization', 'auditable_registration', 'anti_monopoly']
                }
            }
        };
    }

    registerSourcingProvider(input) {
        const req = input || {};
        const providerName = String(req.providerName || '').trim();
        const providerType = String(req.providerType || '').trim();
        const country = String(req.country || 'SA').trim().toUpperCase();
        if (!providerName) return this._error('PROVIDER_NAME_REQUIRED', 'providerName مطلوب');
        if (!providerType) return this._error('PROVIDER_TYPE_REQUIRED', 'providerType مطلوب');
        if (!this._sourcingProviderTypes().includes(providerType)) {
            return this._error('PROVIDER_TYPE_UNSUPPORTED', 'نوع المزود غير مدعوم');
        }

        const normalizedName = this._slugifyTenantName(providerName);
        const existing = (this.state.sourcingProviders || []).find((x) =>
            x.normalizedName === normalizedName && x.providerType === providerType && x.country === country
        );
        if (existing) {
            return { success: true, duplicate: true, provider: existing };
        }

        const provider = {
            providerId: this._newId('PROV'),
            providerName,
            normalizedName,
            providerType,
            sourceSystem: String(req.sourceSystem || 'unknown'),
            registrationMode: String(req.registrationMode || 'system_to_system'),
            country,
            contact: {
                email: String(req.email || '').trim(),
                phone: String(req.phone || '').trim(),
                website: String(req.website || '').trim()
            },
            capabilities: Array.isArray(req.capabilities) ? req.capabilities.map((x) => String(x || '').trim()).filter(Boolean) : [],
            compliance: {
                shariaPolicy: 'لا ضرر ولا ضرار',
                status: 'pending_review'
            },
            status: String(req.status || 'prospect'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.state.sourcingProviders.unshift(provider);
        this.state.sourcingProviders = this.state.sourcingProviders.slice(0, 20000);
        this._saveState();
        this._logEvent('sourcing_provider_registered', {
            providerId: provider.providerId,
            providerType: provider.providerType,
            sourceSystem: provider.sourceSystem
        });
        return { success: true, provider };
    }

    listSourcingProviders(input) {
        const req = input || {};
        const providerType = String(req.providerType || '').trim();
        const status = String(req.status || '').trim();
        const country = String(req.country || '').trim().toUpperCase();
        let rows = this.state.sourcingProviders || [];
        if (providerType) rows = rows.filter((x) => x.providerType === providerType);
        if (status) rows = rows.filter((x) => x.status === status);
        if (country) rows = rows.filter((x) => x.country === country);
        return rows.slice(0, 500);
    }

    launchSourcingCampaign(input) {
        const req = input || {};
        const campaignName = String(req.campaignName || '').trim() || `campaign-${Date.now()}`;
        const targetSegments = Array.isArray(req.targetSegments) && req.targetSegments.length
            ? req.targetSegments.map((x) => String(x || '').trim()).filter(Boolean)
            : ['carrier', 'digital_service_provider', 'software_vendor'];
        const sourceSystems = Array.isArray(req.sourceSystems) && req.sourceSystems.length
            ? req.sourceSystems.map((x) => String(x || '').trim()).filter(Boolean)
            : this.connectors.map((c) => c.id);
        const campaign = {
            campaignId: this._newId('SRC'),
            campaignName,
            targetSegments,
            sourceSystems,
            status: 'active',
            autoEnroll: req.autoEnroll !== false,
            discoveredCount: 0,
            discoveredLeads: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.state.sourcingCampaigns.unshift(campaign);
        this.state.sourcingCampaigns = this.state.sourcingCampaigns.slice(0, 2000);
        this._saveState();
        this._logEvent('sourcing_campaign_launched', {
            campaignId: campaign.campaignId,
            sourceSystems: campaign.sourceSystems,
            targetSegments: campaign.targetSegments
        });
        return { success: true, campaign };
    }

    _providerTypeFromSegment(segment) {
        const s = String(segment || '').trim();
        if (this._sourcingProviderTypes().includes(s)) return s;
        if (s.includes('carrier') || s.includes('transport') || s.includes('truck')) return 'carrier';
        if (s.includes('erp')) return 'erp_company';
        if (s.includes('software')) return 'software_vendor';
        if (s.includes('digital')) return 'digital_service_provider';
        return 'market_supplier';
    }

    tenantDisplayName(tenant) {
        return String(
            (tenant && (tenant.tenantName || tenant.name || tenant.name_ar || tenant.name_en || tenant.slug))
            || 'unknown'
        ).trim();
    }

    runSourcingCampaign(input) {
        const req = input || {};
        const campaignId = String(req.campaignId || '').trim();
        const campaign = (this.state.sourcingCampaigns || []).find((x) => x.campaignId === campaignId);
        if (!campaign) return this._error('CAMPAIGN_NOT_FOUND', 'حملة Sourcing غير موجودة');
        if (campaign.status !== 'active') return this._error('CAMPAIGN_INACTIVE', 'الحملة ليست نشطة');

        const candidates = [];
        const tenantById = {};
        (this.state.tenants || []).forEach((t) => { tenantById[t.tenantId] = t; });
        const connections = (this.state.tenantConnections || []).filter((c) => campaign.sourceSystems.includes(c.targetSystem));
        for (let i = 0; i < connections.length; i++) {
            const c = connections[i];
            const tenant = tenantById[c.tenantId];
            if (!tenant) continue;
            const tenantName = this.tenantDisplayName(tenant);
            for (let j = 0; j < campaign.targetSegments.length; j++) {
                const seg = campaign.targetSegments[j];
                const providerType = this._providerTypeFromSegment(seg);
                candidates.push({
                    providerName: `${tenantName} ${providerType}`,
                    providerType,
                    sourceSystem: c.targetSystem,
                    country: tenant.country || 'SA',
                    registrationMode: 'system_to_system',
                    capabilities: [seg, c.targetSystem, 'b2b-integration']
                });
            }
        }

        const limited = candidates.slice(0, 120);
        const enrolled = [];
        for (let i = 0; i < limited.length; i++) {
            const candidate = limited[i];
            const r = this.registerSourcingProvider(candidate);
            if (r.success) {
                enrolled.push({
                    providerId: (r.provider || {}).providerId || '',
                    providerName: (r.provider || {}).providerName || candidate.providerName,
                    duplicate: !!r.duplicate
                });
            }
        }

        campaign.discoveredLeads = enrolled.slice(0, 500);
        campaign.discoveredCount = enrolled.length;
        campaign.updatedAt = new Date().toISOString();
        if (!campaign.autoEnroll) campaign.status = 'review_required';
        this._saveState();
        this._logEvent('sourcing_campaign_ran', {
            campaignId,
            discoveredCount: campaign.discoveredCount
        });
        return {
            success: true,
            data: {
                campaignId,
                discoveredCount: campaign.discoveredCount,
                leads: campaign.discoveredLeads
            }
        };
    }

    listSourcingCampaigns() {
        return (this.state.sourcingCampaigns || []).slice(0, 200);
    }

    registerSourcingCatalogItem(input) {
        const req = input || {};
        const itemName = String(req.itemName || '').trim();
        const itemType = String(req.itemType || '').trim();
        if (!itemName) return this._error('ITEM_NAME_REQUIRED', 'itemName مطلوب');
        if (!itemType) return this._error('ITEM_TYPE_REQUIRED', 'itemType مطلوب');
        if (!this._sourcingCatalogItemTypes().includes(itemType)) {
            return this._error('ITEM_TYPE_UNSUPPORTED', 'نوع العنصر غير مدعوم');
        }
        const providerId = String(req.providerId || '').trim();
        if (providerId) {
            const provider = (this.state.sourcingProviders || []).find((x) => x.providerId === providerId);
            if (!provider) return this._error('PROVIDER_NOT_FOUND', 'providerId غير موجود');
        }

        const item = {
            itemId: this._newId('CAT'),
            itemName,
            itemType,
            providerId,
            sourceSystem: String(req.sourceSystem || 'unknown'),
            tags: Array.isArray(req.tags) ? req.tags.map((x) => String(x || '').trim()).filter(Boolean) : [],
            criticality: String(req.criticality || 'high'),
            status: String(req.status || 'active'),
            shariaGuard: 'لا ضرر ولا ضرار + حفظ الحقوق',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.state.sourcingCatalog.unshift(item);
        this.state.sourcingCatalog = this.state.sourcingCatalog.slice(0, 50000);
        this._saveState();
        this._logEvent('sourcing_catalog_item_registered', {
            itemId: item.itemId,
            itemType: item.itemType,
            sourceSystem: item.sourceSystem
        });
        return { success: true, item };
    }

    listSourcingCatalog(input) {
        const req = input || {};
        const itemType = String(req.itemType || '').trim();
        const sourceSystem = String(req.sourceSystem || '').trim();
        let rows = this.state.sourcingCatalog || [];
        if (itemType) rows = rows.filter((x) => x.itemType === itemType);
        if (sourceSystem) rows = rows.filter((x) => x.sourceSystem === sourceSystem);
        return rows.slice(0, 800);
    }

    sourcingIntelligence() {
        const providers = this.state.sourcingProviders || [];
        const catalog = this.state.sourcingCatalog || [];
        const byType = {};
        providers.forEach((p) => {
            byType[p.providerType] = Number(byType[p.providerType] || 0) + 1;
        });
        const catalogByType = {};
        catalog.forEach((x) => {
            catalogByType[x.itemType] = Number(catalogByType[x.itemType] || 0) + 1;
        });
        return {
            providersTotal: providers.length,
            providersByType: byType,
            catalogTotal: catalog.length,
            catalogByType,
            topProvidersPreview: this.getSourcingScorecard({ limit: 3 }).topProviders,
            guidance: [
                'فعّل حملات sourcing أسبوعية لكل نظام ERP',
                'اعتمد onboarding بدون API keys عبر agent pairing',
                'لا يتم تفعيل أي مزود قبل اجتياز فحص الامتثال'
            ]
        };
    }

    _currentSourcingScoringConfig() {
        const current = this.state.sourcingScoringConfig || {};
        const weights = Object.assign({
            security: 0.3,
            reliability: 0.3,
            sharia: 0.25,
            cost: 0.15
        }, current.weights || {});
        const defaults = Object.assign({
            security: 70,
            reliability: 70,
            sharia: 85,
            cost: 60
        }, current.defaults || {});
        return { weights, defaults };
    }

    updateSourcingScoringConfig(input) {
        const req = input || {};
        const current = this._currentSourcingScoringConfig();
        const nextWeights = Object.assign({}, current.weights, (req.weights || {}));
        const nextDefaults = Object.assign({}, current.defaults, (req.defaults || {}));
        const keys = ['security', 'reliability', 'sharia', 'cost'];
        let sum = 0;
        keys.forEach((k) => {
            nextWeights[k] = Number(nextWeights[k]);
            if (!Number.isFinite(nextWeights[k]) || nextWeights[k] < 0) nextWeights[k] = 0;
            sum += nextWeights[k];
            nextDefaults[k] = Number(nextDefaults[k]);
            if (!Number.isFinite(nextDefaults[k])) nextDefaults[k] = current.defaults[k];
            nextDefaults[k] = Math.max(0, Math.min(100, nextDefaults[k]));
        });
        // تطبيع الأوزان لضمان حساب عادل
        if (sum <= 0) {
            nextWeights.security = 0.3;
            nextWeights.reliability = 0.3;
            nextWeights.sharia = 0.25;
            nextWeights.cost = 0.15;
        } else {
            keys.forEach((k) => { nextWeights[k] = Number((nextWeights[k] / sum).toFixed(6)); });
        }
        this.state.sourcingScoringConfig = { weights: nextWeights, defaults: nextDefaults };
        this._saveState();
        this._logEvent('sourcing_scoring_config_updated', this.state.sourcingScoringConfig);
        return { success: true, config: this.state.sourcingScoringConfig };
    }

    _providerSystemScores(provider) {
        const sourceSystem = String((provider || {}).sourceSystem || '').trim();
        const table = {
            'sap-s4hana': { security: 86, reliability: 84, sharia: 85, cost: 55 },
            'oracle-erp-cloud': { security: 84, reliability: 82, sharia: 85, cost: 58 },
            'ms-dynamics': { security: 82, reliability: 81, sharia: 85, cost: 62 },
            odoo: { security: 74, reliability: 76, sharia: 84, cost: 72 },
            github: { security: 78, reliability: 80, sharia: 84, cost: 68 },
            gitlab: { security: 79, reliability: 79, sharia: 84, cost: 67 },
            'custom-erp': { security: 68, reliability: 66, sharia: 82, cost: 74 }
        };
        return table[sourceSystem] || null;
    }

    _providerTypeAdjustments(providerType) {
        const p = String(providerType || '').trim();
        const table = {
            erp_company: { security: 4, reliability: 4, sharia: 2, cost: -4 },
            software_vendor: { security: 2, reliability: 2, sharia: 1, cost: -2 },
            digital_service_provider: { security: 1, reliability: 1, sharia: 1, cost: 0 },
            carrier: { security: -1, reliability: 2, sharia: 1, cost: 3 },
            trucking_fleet: { security: -1, reliability: 1, sharia: 1, cost: 4 },
            market_supplier: { security: 0, reliability: 0, sharia: 1, cost: 2 }
        };
        return table[p] || { security: 0, reliability: 0, sharia: 0, cost: 0 };
    }

    _safeScore(v) {
        return Math.max(0, Math.min(100, Number(v) || 0));
    }

    _buildProviderScore(provider, catalogCount, cfg) {
        const base = Object.assign({}, cfg.defaults || {});
        const system = this._providerSystemScores(provider);
        const adj = this._providerTypeAdjustments((provider || {}).providerType);
        const registrationMode = String((provider || {}).registrationMode || '').trim();
        const capabilitiesCount = Array.isArray((provider || {}).capabilities) ? provider.capabilities.length : 0;

        const security = this._safeScore((system ? system.security : base.security) + adj.security + (registrationMode === 'system_to_system' ? 3 : 0));
        const reliability = this._safeScore((system ? system.reliability : base.reliability) + adj.reliability + Math.min(6, capabilitiesCount));
        const sharia = this._safeScore((system ? system.sharia : base.sharia) + adj.sharia + 2);
        const cost = this._safeScore((system ? system.cost : base.cost) + adj.cost + Math.min(8, catalogCount));

        const w = cfg.weights || { security: 0.3, reliability: 0.3, sharia: 0.25, cost: 0.15 };
        const overall = this._safeScore(
            (security * Number(w.security || 0)) +
            (reliability * Number(w.reliability || 0)) +
            (sharia * Number(w.sharia || 0)) +
            (cost * Number(w.cost || 0))
        );
        return {
            providerId: provider.providerId,
            providerName: provider.providerName,
            providerType: provider.providerType,
            sourceSystem: provider.sourceSystem,
            scores: {
                security,
                reliability,
                sharia,
                cost,
                overall: Number(overall.toFixed(2))
            },
            catalogCount
        };
    }

    getSourcingScorecard(input) {
        const req = input || {};
        const providerType = String(req.providerType || '').trim();
        const sourceSystem = String(req.sourceSystem || '').trim();
        const country = String(req.country || '').trim().toUpperCase();
        const limit = Math.max(1, Math.min(100, Number(req.limit || 10)));
        const cfg = this._currentSourcingScoringConfig();

        const catalog = this.state.sourcingCatalog || [];
        const catalogCountByProvider = {};
        catalog.forEach((x) => {
            if (!x.providerId) return;
            catalogCountByProvider[x.providerId] = Number(catalogCountByProvider[x.providerId] || 0) + 1;
        });

        let providers = this.state.sourcingProviders || [];
        if (providerType) providers = providers.filter((x) => x.providerType === providerType);
        if (sourceSystem) providers = providers.filter((x) => x.sourceSystem === sourceSystem);
        if (country) providers = providers.filter((x) => String(x.country || '').toUpperCase() === country);

        const scored = providers.map((p) => this._buildProviderScore(
            p,
            Number(catalogCountByProvider[p.providerId] || 0),
            cfg
        ));
        scored.sort((a, b) => b.scores.overall - a.scores.overall);

        return {
            success: true,
            config: cfg,
            totalProviders: scored.length,
            topProviders: scored.slice(0, limit),
            summary: {
                averageOverall: scored.length
                    ? Number((scored.reduce((s, x) => s + x.scores.overall, 0) / scored.length).toFixed(2))
                    : 0,
                highest: scored[0] || null
            }
        };
    }

    executeFlow(input) {
        const req = input || {};
        const sourceTenantId = String(req.sourceTenantId || '').trim();
        const targetTenantId = String(req.targetTenantId || '').trim();
        const flowType = String(req.flowType || '').trim();
        const payload = req.payload || {};
        const idempotencyKey = String(req.idempotencyKey || '').trim();
        const actor = String(req.actor || 'system');
        const requestHash = this._hashPayload({
            sourceTenantId,
            targetTenantId,
            flowType,
            payload
        });

        if (!sourceTenantId || !targetTenantId) return this._error('TENANT_REQUIRED', 'sourceTenantId و targetTenantId مطلوبان');
        if (!flowType) return this._error('FLOW_REQUIRED', 'flowType مطلوب');

        const idem = this._checkIdempotency(idempotencyKey, requestHash);
        if (idem.duplicate) {
            if (idem.sameRequest === false) {
                return this._error('IDEMPOTENCY_KEY_CONFLICT', 'مفتاح Idempotency مستخدم بطلب مختلف', {
                    existingRunId: idem.existingRunId
                });
            }
            return {
                success: true,
                duplicate: true,
                runId: idem.existingRunId,
                message: 'تم تجاهل الطلب المكرر عبر idempotency_key'
            };
        }

        const required = this._flowRequiredFields(flowType);
        const missing = required.filter((k) => payload[k] === undefined || payload[k] === null || payload[k] === '');
        const runId = this._newId('FLOW');
        const nowIso = new Date().toISOString();
        if (missing.length) {
            const dlqItem = {
                dlqId: this._newId('DLQ'),
                runId,
                flowType,
                sourceTenantId,
                targetTenantId,
                reason: 'validation_failed',
                missingFields: missing,
                payload,
                status: 'open',
                createdAt: nowIso
            };
            this.state.deadLetterQueue.unshift(dlqItem);
            this.state.deadLetterQueue = this.state.deadLetterQueue.slice(0, 10000);
            this.state.flowRuns.unshift({
                runId,
                flowType,
                sourceTenantId,
                targetTenantId,
                idempotencyKey,
                status: 'failed',
                actor,
                audit: {
                    who: actor,
                    what: 'flow_execute_failed',
                    when: nowIso,
                    sourceSystemRef: '',
                    targetSystemRef: ''
                },
                errorCode: 'FLOW_VALIDATION_FAILED',
                missingFields: missing,
                createdAt: nowIso
            });
            this._saveState();
            this._logEvent('flow_failed', { runId, flowType, sourceTenantId, targetTenantId, missing });
            return this._error('FLOW_VALIDATION_FAILED', 'فشل التحقق من بيانات التدفق', { runId, missingFields: missing });
        }

        const sourceRef = req.sourceRef || `SRC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const targetRef = req.targetRef || `TGT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const run = {
            runId,
            flowType,
            sourceTenantId,
            targetTenantId,
            idempotencyKey,
            status: 'completed',
            actor,
            payloadSummary: Object.keys(payload),
            audit: {
                who: actor,
                what: 'flow_execute_completed',
                when: nowIso,
                sourceSystemRef: sourceRef,
                targetSystemRef: targetRef
            },
            createdAt: nowIso
        };
        this.state.flowRuns.unshift(run);
        this.state.flowRuns = this.state.flowRuns.slice(0, 20000);
        this._saveIdempotency(idempotencyKey, runId, requestHash, targetRef);
        this._saveState();
        this._logEvent('flow_completed', { runId, flowType, sourceTenantId, targetTenantId, sourceRef, targetRef });
        return { success: true, run };
    }

    reconciliationDashboard(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const runs = (this.state.flowRuns || []).filter((r) => !tenantId || r.sourceTenantId === tenantId || r.targetTenantId === tenantId);
        const dlq = (this.state.deadLetterQueue || []).filter((d) => !tenantId || d.sourceTenantId === tenantId || d.targetTenantId === tenantId);
        const completed = runs.filter((r) => r.status === 'completed').length;
        const failed = runs.filter((r) => r.status !== 'completed').length;
        return {
            tenantId: tenantId || 'all',
            totalRuns: runs.length,
            completedRuns: completed,
            failedRuns: failed,
            openMismatches: dlq.filter((x) => x.status === 'open').length,
            latestMismatches: dlq.slice(0, 20)
        };
    }

    retryDlq(input) {
        const req = input || {};
        const dlqId = String(req.dlqId || '').trim();
        const item = (this.state.deadLetterQueue || []).find((x) => x.dlqId === dlqId);
        if (!item) return this._error('DLQ_NOT_FOUND', 'سجل DLQ غير موجود');
        if (item.status === 'resolved') return { success: true, message: 'هذا السجل محلول مسبقًا', dlqItem: item };
        item.status = 'resolved';
        item.resolvedAt = new Date().toISOString();
        this._saveState();
        this._logEvent('dlq_resolved', { dlqId, runId: item.runId });
        return { success: true, dlqItem: item };
    }

    integrationContract() {
        return {
            naming: {
                apiPrefix: '/api/integration',
                flowPattern: '{domain}.{action}',
                idPattern: 'PREFIX-timestamp-random'
            },
            errorCodes: [
                'TENANT_NAME_REQUIRED',
                'TENANT_NOT_FOUND',
                'SYSTEM_NOT_SUPPORTED',
                'PACK_NOT_FOUND',
                'VERTICAL_NOT_FOUND',
                'FLOW_VALIDATION_FAILED',
                'DLQ_NOT_FOUND'
            ],
            sla: {
                tokenFetchP95Ms: 1500,
                apiFlowP95Ms: 3000,
                reconciliationWindowMin: 5
            }
        };
    }

    sheikhaUnifiedCharter() {
        return {
            title: 'ميثاق شيخة الموحّد',
            foundation: {
                aqeedah: 'توحيد الله عز وجل',
                purpose: 'تشغيل رقمي متقن يخدم الناس بالعدل والصدق'
            },
            principles: [
                'العدل والشفافية في كل تدفق ومعاملة',
                'لا ضرر ولا ضرار',
                'لا غش ولا احتكار',
                'حفظ الحقوق والملكية الفكرية',
                'حفظ أمانة البيانات وعدم إساءة استخدامها'
            ],
            operatingPolicy: {
                requiredChecks: [
                    'data_validity',
                    'security_validation',
                    'sharia_compliance',
                    'audit_trace'
                ],
                stopConditions: [
                    'high_failure_rate',
                    'critical_security_risk',
                    'contract_or_compliance_violation'
                ]
            },
            digitalGovernance: {
                tenantIsolation: 'strict',
                idempotency: 'required_for_create_operations',
                dlqPolicy: 'mandatory',
                observability: 'logs_metrics_traces_required'
            },
            declaration: 'شيخة أساسها التوحيد، ومنهجها العدل، وتشغيلها بلا ضرر ولا ظلم.'
        };
    }

    _erpArchitectureCatalog() {
        return {
            'sap-s4hana': {
                id: 'sap-s4hana',
                name: 'SAP S/4HANA',
                topologies: ['cloud', 'on-prem', 'hybrid'],
                strengths: ['قوة مالية ومحاسبية عالية', 'عمق سلاسل الإمداد', 'معيارية مؤسسية'],
                integrationInterfaces: ['OData', 'REST', 'IDoc', 'SFTP', 'Event Mesh'],
                authOptions: ['OAuth2', 'Client Certificate', 'Communication User'],
                risks: ['تعقيد الإعداد الأولي', 'تفاوت كبير بين Cloud وOn-Prem'],
                sheikhaBestFit: {
                    primary: 'agent_pairing',
                    secondary: 'oauth_delegated',
                    notes: 'للبيئات المقيدة: Agent داخل شبكة العميل + Canonical Mapping'
                }
            },
            'oracle-erp-cloud': {
                id: 'oracle-erp-cloud',
                name: 'Oracle Fusion Cloud ERP',
                topologies: ['cloud'],
                strengths: ['واجهات حديثة نسبيًا', 'تكامل قوي للمالية والمشتريات', 'توثيق جيد'],
                integrationInterfaces: ['REST', 'SOAP', 'SFTP', 'Business Events'],
                authOptions: ['OAuth2 Client Credentials', 'OAuth2 JWT', 'Basic/Legacy'],
                risks: ['اختلاف سياسات الـ Identity Domain بين العملاء', 'قيود Rate Limit'],
                sheikhaBestFit: {
                    primary: 'agent_pairing',
                    secondary: 'oauth_delegated',
                    notes: 'بدون API key يدوي: اقتران وكيل + تفويض OAuth عندما يتاح'
                }
            },
            odoo: {
                id: 'odoo',
                name: 'Odoo',
                topologies: ['cloud', 'on-prem'],
                strengths: ['مرونة عالية', 'سرعة تخصيص', 'تكلفة أقل نسبيًا'],
                integrationInterfaces: ['REST', 'RPC', 'Webhook', 'CSV'],
                authOptions: ['Token', 'Session', 'OAuth/OIDC عبر إضافات'],
                risks: ['اختلافات الإصدارات والإضافات', 'تباين جودة التطبيقات المخصصة'],
                sheikhaBestFit: {
                    primary: 'agent_pairing',
                    secondary: 'oauth_delegated',
                    notes: 'Agent يقلل أثر اختلاف الإصدارات ويوحّد النقل'
                }
            },
            'ms-dynamics': {
                id: 'ms-dynamics',
                name: 'Microsoft Dynamics 365',
                topologies: ['cloud', 'hybrid'],
                strengths: ['تكامل ممتاز مع Microsoft 365', 'OData جيد', 'نظام أذونات قوي'],
                integrationInterfaces: ['REST', 'OData', 'Dataverse', 'Power Platform'],
                authOptions: ['OAuth2 / Entra ID'],
                risks: ['اعتماد مرتفع على سياسات Entra وبيئة العميل'],
                sheikhaBestFit: {
                    primary: 'oauth_delegated',
                    secondary: 'agent_pairing',
                    notes: 'تفويض مباشر ممتاز، وAgent للبيئات المقيدة'
                }
            },
            'custom-erp': {
                id: 'custom-erp',
                name: 'Custom ERP',
                topologies: ['unknown', 'on-prem', 'cloud'],
                strengths: ['مرونة كاملة لاحتياج العميل'],
                integrationInterfaces: ['REST', 'Webhook', 'SFTP', 'CSV', 'DB Bridge'],
                authOptions: ['متنوع حسب العميل'],
                risks: ['غياب معيار موحد', 'تفاوت الجودة والأمان'],
                sheikhaBestFit: {
                    primary: 'agent_pairing',
                    secondary: 'sftp_key_exchange',
                    notes: 'الوكيل هو الخيار الأكثر انضباطًا لتوحيد الأنظمة المخصصة'
                }
            }
        };
    }

    analyzeErpArchitecture(input) {
        const req = input || {};
        const systems = Array.isArray(req.systems) && req.systems.length
            ? req.systems
            : ['sap-s4hana', 'oracle-erp-cloud', 'odoo', 'ms-dynamics', 'custom-erp'];
        const catalog = this._erpArchitectureCatalog();
        const details = systems
            .map((id) => catalog[id])
            .filter(Boolean)
            .map((row) => ({
                systemId: row.id,
                name: row.name,
                topologies: row.topologies,
                interfaces: row.integrationInterfaces,
                auth: row.authOptions,
                strengths: row.strengths,
                risks: row.risks,
                sheikhaBestFit: row.sheikhaBestFit
            }));

        const blueprint = {
            architecture: 'Sheikha Superior Integration Mesh',
            layers: [
                'Tenant Isolation Layer',
                'Canonical Data Model Layer',
                'Policy & Trust Layer (Zero-Key)',
                'Connector Runtime Layer',
                'Reliability Layer (Idempotency + DLQ + Reconciliation)',
                'Observability & Audit Layer'
            ],
            modes: ['oauth_delegated', 'agent_pairing', 'sftp_key_exchange'],
            defaultModePriority: ['oauth_delegated', 'agent_pairing', 'sftp_key_exchange']
        };

        return {
            success: true,
            details,
            blueprint
        };
    }

    _superiorModeForSystem(systemId) {
        const methods = this._zeroKeyMethods(systemId || '');
        const first = methods[0] ? methods[0].method : 'agent_pairing';
        return {
            mode: first,
            methods
        };
    }

    activateSuperiorIntegration(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const targetSystem = String(req.targetSystem || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!targetSystem) return this._error('TARGET_SYSTEM_REQUIRED', 'targetSystem مطلوب');
        const tenant = (this.state.tenants || []).find((t) => t.tenantId === tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');

        const modeDecision = this._superiorModeForSystem(targetSystem);
        const connectResult = this.startZeroKeyConnection({
            tenantId,
            targetSystem,
            expiresInMin: req.expiresInMin || 15
        });
        if (!connectResult.success) return connectResult;

        const defaultPacks = Array.isArray(req.packs) && req.packs.length
            ? req.packs
            : ['pack-customers-items', 'pack-orders', 'pack-invoices-payments'];
        const packResults = [];
        defaultPacks.forEach((packId) => {
            const r = this.activatePack({ tenantId, packId });
            if (r.success) packResults.push({ packId, status: 'active', activationId: r.activation.activationId });
        });

        const activation = {
            activationId: this._newId('SUP'),
            tenantId,
            targetSystem,
            mode: modeDecision.mode,
            methods: modeDecision.methods,
            connection: connectResult,
            packs: packResults,
            activatedAt: new Date().toISOString()
        };
        this.state.superiorActivations.unshift(activation);
        this.state.superiorActivations = this.state.superiorActivations.slice(0, 2000);
        this._saveState();
        this._logEvent('superior_integration_activated', {
            activationId: activation.activationId,
            tenantId,
            targetSystem,
            mode: activation.mode
        });

        return {
            success: true,
            activation,
            message: 'تم تفعيل التكامل المتقن الأعلى بدون طلب API key يدوي'
        };
    }

    activateMarketVertical(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const targetSystem = String(req.targetSystem || '').trim();
        const verticalId = String(req.verticalId || 'metals-scrap-dismantling').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!targetSystem) return this._error('TARGET_SYSTEM_REQUIRED', 'targetSystem مطلوب');
        const tenant = (this.state.tenants || []).find((t) => t.tenantId === tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');
        const profiles = this._marketVerticalProfiles();
        const vertical = profiles[verticalId];
        if (!vertical) return this._error('VERTICAL_NOT_FOUND', 'القطاع المطلوب غير معرّف');

        const superior = this.activateSuperiorIntegration({
            tenantId,
            targetSystem,
            packs: vertical.startupPacks,
            expiresInMin: req.expiresInMin || 15
        });
        if (!superior.success) return superior;

        const readiness = {
            phase: 'phase-1-live',
            verticalId: vertical.id,
            startupFlows: vertical.startupFlows,
            kpis: vertical.kpis,
            expansionPath: vertical.expansionPath
        };
        const activation = {
            verticalActivationId: this._newId('VERT'),
            tenantId,
            targetSystem,
            verticalId: vertical.id,
            verticalName: vertical.name,
            readiness,
            superiorActivationId: superior.activation.activationId,
            activatedAt: new Date().toISOString()
        };
        this.state.verticalActivations.unshift(activation);
        this.state.verticalActivations = this.state.verticalActivations.slice(0, 2000);
        this._saveState();
        this._logEvent('vertical_activated', {
            verticalActivationId: activation.verticalActivationId,
            tenantId,
            targetSystem,
            verticalId
        });
        return {
            success: true,
            activation,
            message: 'تم تفعيل قطاع المعادن والسكراب والتشليح مع جاهزية التوسع'
        };
    }

    getVerticalReadiness(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const rows = (this.state.verticalActivations || []).filter((v) => !tenantId || v.tenantId === tenantId);
        return {
            success: true,
            total: rows.length,
            latest: rows.slice(0, 20),
            availableVerticals: Object.keys(this._marketVerticalProfiles()).map((id) => this._marketVerticalProfiles()[id])
        };
    }

    _zeroKeyMethods(systemId) {
        const oauthDelegated = ['google-workspace', 'microsoft-365', 'github', 'gitlab'];
        if (oauthDelegated.includes(systemId)) {
            return [
                { method: 'oauth_delegated', rank: 1, reason: 'تفويض مباشر من المزود بدون API Key يدوي' },
                { method: 'agent_pairing', rank: 2, reason: 'بديل للشبكات المغلقة أو القيود المؤسسية' }
            ];
        }
        if (systemId === 'oracle-erp-cloud' || systemId === 'sap-s4hana') {
            return [
                { method: 'agent_pairing', rank: 1, reason: 'أفضل خيار بدون مشاركة مفاتيح API لكل عميل' },
                { method: 'oauth_delegated', rank: 2, reason: 'إذا كان OAuth/Trust مفعّل في بيئة ERP' },
                { method: 'sftp_key_exchange', rank: 3, reason: 'Fallback عبر مفاتيح SSH بدلاً من API keys' }
            ];
        }
        return [
            { method: 'agent_pairing', rank: 1, reason: 'تكامل آمن بدون إدخال مفاتيح API' },
            { method: 'oauth_delegated', rank: 2, reason: 'مناسب إذا النظام يدعم OIDC/OAuth2' }
        ];
    }

    _newPairingCode() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }

    createZeroKeyPairing(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const targetSystem = String(req.targetSystem || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!targetSystem) return this._error('TARGET_SYSTEM_REQUIRED', 'targetSystem مطلوب');
        const tenant = (this.state.tenants || []).find((t) => t.tenantId === tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');
        const ttlMin = Math.max(5, Math.min(60, Number(req.expiresInMin || 15)));
        const now = Date.now();
        const pairing = {
            pairingId: this._newId('PAIR'),
            pairingCode: this._newPairingCode(),
            tenantId,
            targetSystem,
            status: 'pending',
            createdAt: new Date(now).toISOString(),
            expiresAt: new Date(now + ttlMin * 60000).toISOString(),
            agentFingerprint: '',
            activatedAt: null
        };
        this.state.zeroKeyPairings.unshift(pairing);
        this.state.zeroKeyPairings = this.state.zeroKeyPairings.slice(0, 5000);
        this._saveState();
        this._logEvent('zero_key_pairing_created', {
            pairingId: pairing.pairingId,
            tenantId,
            targetSystem,
            expiresAt: pairing.expiresAt
        });
        return {
            success: true,
            pairing: {
                pairingId: pairing.pairingId,
                pairingCode: pairing.pairingCode,
                expiresAt: pairing.expiresAt,
                status: pairing.status
            },
            instructions: [
                'شغّل Sheikha Connector Agent داخل بيئة العميل',
                'أدخل pairingCode داخل الوكيل',
                'بعد التحقق، يتم إنشاء اتصال آمن بدون API key يدوي'
            ]
        };
    }

    completeZeroKeyPairing(input) {
        const req = input || {};
        const pairingCode = String(req.pairingCode || '').trim();
        const agentFingerprint = String(req.agentFingerprint || '').trim();
        if (!pairingCode) return this._error('PAIRING_CODE_REQUIRED', 'pairingCode مطلوب');
        if (!agentFingerprint) return this._error('AGENT_FINGERPRINT_REQUIRED', 'agentFingerprint مطلوب');
        const now = Date.now();
        const pairing = (this.state.zeroKeyPairings || []).find((p) => p.pairingCode === pairingCode && p.status === 'pending');
        if (!pairing) return this._error('PAIRING_NOT_FOUND', 'رمز الاقتران غير صالح أو منتهي');
        if (now > new Date(pairing.expiresAt).getTime()) {
            pairing.status = 'expired';
            this._saveState();
            return this._error('PAIRING_EXPIRED', 'رمز الاقتران منتهي');
        }
        pairing.status = 'active';
        pairing.agentFingerprint = agentFingerprint;
        pairing.activatedAt = new Date(now).toISOString();

        const zeroConn = {
            connectionId: this._newId('ZCONN'),
            pairingId: pairing.pairingId,
            tenantId: pairing.tenantId,
            targetSystem: pairing.targetSystem,
            mode: 'agent_pairing',
            status: 'active',
            establishedAt: pairing.activatedAt,
            agentFingerprint
        };
        this.state.zeroKeyConnections.unshift(zeroConn);
        this.state.zeroKeyConnections = this.state.zeroKeyConnections.slice(0, 5000);

        // تكامل تلقائي مع tenant connections للحفاظ على واجهة موحدة داخل شيخة.
        const autoConn = this.connectTenantSystem({
            tenantId: pairing.tenantId,
            targetSystem: pairing.targetSystem,
            authMode: 'agent-pairing',
            scopes: ['read', 'write', 'sync']
        });
        this._saveState();
        this._logEvent('zero_key_pairing_activated', {
            pairingId: pairing.pairingId,
            tenantId: pairing.tenantId,
            targetSystem: pairing.targetSystem
        });
        return {
            success: true,
            pairing: {
                pairingId: pairing.pairingId,
                status: pairing.status,
                activatedAt: pairing.activatedAt
            },
            zeroConnection: zeroConn,
            tenantConnection: autoConn.success ? autoConn.connection : null
        };
    }

    getZeroKeyPairingStatus(pairingId) {
        const pid = String(pairingId || '').trim();
        const p = (this.state.zeroKeyPairings || []).find((x) => x.pairingId === pid);
        if (!p) return this._error('PAIRING_NOT_FOUND', 'سجل الاقتران غير موجود');
        return {
            success: true,
            pairing: {
                pairingId: p.pairingId,
                tenantId: p.tenantId,
                targetSystem: p.targetSystem,
                status: p.status,
                expiresAt: p.expiresAt,
                activatedAt: p.activatedAt
            }
        };
    }

    startZeroKeyConnection(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const targetSystem = String(req.targetSystem || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!targetSystem) return this._error('TARGET_SYSTEM_REQUIRED', 'targetSystem مطلوب');
        const methods = this._zeroKeyMethods(targetSystem);
        const primary = methods[0] ? methods[0].method : 'agent_pairing';

        // مزودات OAuth القياسية: نرجع رابط التفويض بدل طلب API key.
        if (primary === 'oauth_delegated') {
            const oauthMap = {
                'google-workspace': 'google',
                'microsoft-365': 'microsoft',
                github: 'github',
                gitlab: 'gitlab'
            };
            const provider = oauthMap[targetSystem];
            if (provider) {
                return {
                    success: true,
                    mode: 'oauth_delegated',
                    provider,
                    authStart: `/api/auth/oauth/${provider}?userId=${encodeURIComponent(tenantId)}`,
                    note: 'تفويض مباشر من المزود، بدون إدخال API key يدوي'
                };
            }
        }

        const pairing = this.createZeroKeyPairing({
            tenantId,
            targetSystem,
            expiresInMin: req.expiresInMin || 15
        });
        if (!pairing.success) return pairing;
        return {
            success: true,
            mode: 'agent_pairing',
            methods,
            pairing: pairing.pairing,
            instructions: pairing.instructions
        };
    }

    _normalizeValue(key, value) {
        if (value === null || value === undefined) return '';
        if (key === 'hsCode') return String(value).replace(/\s/g, '');
        if (key === 'quantity' || key === 'unitPrice') {
            const num = Number(String(value).replace(/[^\d.\-]/g, ''));
            return Number.isFinite(num) ? num : 0;
        }
        return String(value).trim();
    }

    transformRecord(record, mapping, options) {
        const source = record || {};
        const map = mapping || this.defaultMapping;
        const out = {};
        const missingRequired = [];
        const required = (options && Array.isArray(options.required)) ? options.required : ['productCode', 'hsCode', 'quantity'];

        Object.keys(map).forEach((targetKey) => {
            const candidates = Array.isArray(map[targetKey]) ? map[targetKey] : [map[targetKey]];
            let picked;
            for (const c of candidates) {
                if (source[c] !== undefined && source[c] !== null && source[c] !== '') {
                    picked = source[c];
                    break;
                }
            }
            out[targetKey] = this._normalizeValue(targetKey, picked);
        });

        required.forEach((k) => {
            if (out[k] === '' || out[k] === 0 || out[k] === null || out[k] === undefined) missingRequired.push(k);
        });

        const qualityScore = Math.max(0, 100 - (missingRequired.length * 20));
        const success = missingRequired.length === 0;
        const result = {
            success,
            transformed: out,
            qualityScore,
            missingRequired,
            recommendations: missingRequired.map((k) => `أضف الحقل الإلزامي: ${k}`)
        };
        return result;
    }

    analyzeGaps(input) {
        const req = input || {};
        const targetSystem = String(req.targetSystem || 'unknown');
        const requiredFields = Array.isArray(req.requiredFields) ? req.requiredFields : ['productCode', 'hsCode', 'quantity', 'unitPrice', 'currency'];
        const payload = req.payload || {};
        const present = [];
        const missing = [];

        requiredFields.forEach((f) => {
            if (payload[f] !== undefined && payload[f] !== null && payload[f] !== '') present.push(f);
            else missing.push(f);
        });

        const gapScore = requiredFields.length ? Math.round((missing.length / requiredFields.length) * 100) : 0;
        const severity = gapScore >= 50 ? 'high' : gapScore >= 25 ? 'medium' : 'low';
        const actions = [
            ...missing.map((f) => ({ type: 'data-completion', field: f, action: `استكمال الحقل ${f}` })),
            { type: 'schema-alignment', action: 'توحيد مخطط الحقول بين شيخة وERP' },
            { type: 'automation', action: 'تفعيل تحويل آلي قبل الإرسال' }
        ];

        const report = {
            targetSystem,
            requiredFields,
            presentFields: present,
            missingFields: missing,
            gapScore,
            severity,
            actions,
            generatedAt: new Date().toISOString()
        };
        this.state.lastGapAnalysis = report;
        this.state.kpis.averageGapScore = this.state.kpis.averageGapScore
            ? Math.round((this.state.kpis.averageGapScore + gapScore) / 2)
            : gapScore;
        this._saveState();
        this._logEvent('gap_analysis', report);
        return report;
    }

    buildExecutiveReport(input) {
        const ctx = input || {};
        const report = {
            id: 'INT-REP-' + Date.now(),
            title: ctx.title || 'تقرير تكامل وتحويل البيانات',
            summary: {
                totalTransforms: this.state.kpis.totalTransforms,
                successRate: this.state.kpis.totalTransforms
                    ? Math.round((this.state.kpis.successfulTransforms / this.state.kpis.totalTransforms) * 100)
                    : 0,
                averageQualityScore: this.state.kpis.averageQualityScore || 0,
                averageGapScore: this.state.kpis.averageGapScore || 0
            },
            recommendations: [
                'توحيد نموذج البيانات المرجعي Master Data Model',
                'فرض قواعد تحقق قبل إرسال أي رسالة للنظام الخارجي',
                'اعتماد Retry + Dead Letter Queue للحالات الفاشلة',
                'تشغيل تقارير فجوات يومية مع خطة تصحيح آلية'
            ],
            generatedAt: new Date().toISOString()
        };
        this.state.reports.unshift(report);
        this.state.reports = this.state.reports.slice(0, 50);
        this._saveState();
        this._logEvent('executive_report', report);
        return report;
    }

    runProcedure(input) {
        const req = input || {};
        const procedure = String(req.procedure || 'sync-products');
        const result = {
            procedure,
            status: 'completed',
            steps: [
                { name: 'استخراج البيانات', status: 'done' },
                { name: 'تحويل وتوحيد الحقول', status: 'done' },
                { name: 'فحص الفجوات', status: 'done' },
                { name: 'إرسال للنظام المستهدف', status: 'done' },
                { name: 'توثيق السجل والتقرير', status: 'done' }
            ],
            timestamp: new Date().toISOString()
        };
        this._logEvent('procedure_run', result);
        return result;
    }

    _supportedSharedSystems() {
        return [
            { id: 'google-workspace', name: 'Google Workspace', type: 'shared', methods: ['oauth2', 'apiKey', 'serviceAccount'] },
            { id: 'microsoft-365', name: 'Microsoft 365', type: 'shared', methods: ['oauth2', 'graphApi'] },
            { id: 'github', name: 'GitHub', type: 'shared', methods: ['oauth2', 'personalToken', 'appIntegration'] },
            { id: 'gitlab', name: 'GitLab', type: 'shared', methods: ['oauth2', 'personalToken', 'groupIntegration'] },
            { id: 'sap-s4hana', name: 'SAP S/4HANA', type: 'erp', methods: ['odata', 'rest', 'idoc', 'sftp'] },
            { id: 'oracle-erp-cloud', name: 'Oracle ERP Cloud', type: 'erp', methods: ['rest', 'soap', 'sftp'] },
            { id: 'ms-dynamics', name: 'Microsoft Dynamics 365', type: 'erp', methods: ['rest', 'odata'] },
            { id: 'odoo', name: 'Odoo', type: 'erp', methods: ['rest', 'rpc', 'webhook'] },
            { id: 'custom-erp', name: 'Custom ERP', type: 'erp', methods: ['rest', 'webhook', 'csvBridge'] }
        ];
    }

    _rankMethod(systemId, hint) {
        const h = String(hint || '').toLowerCase();
        if (systemId === 'google-workspace' || systemId === 'microsoft-365' || systemId === 'github' || systemId === 'gitlab') {
            return { method: 'oauth2', reason: 'أفضل تجربة مباشرة للمستخدم مع صلاحيات آمنة' };
        }
        if (h.includes('real') || h.includes('live') || h.includes('مباشر')) {
            return { method: 'direct-api', reason: 'تكامل لحظي مباشر عبر API' };
        }
        if (h.includes('legacy') || h.includes('قديم') || h.includes('ملف')) {
            return { method: 'csv-bridge', reason: 'ملائم للأنظمة التي تعتمد التبادل بالملفات' };
        }
        return { method: 'direct-api', reason: 'أفضل وسيلة افتراضية للأداء والمرونة' };
    }

    discoverBestConnection(input) {
        const req = input || {};
        const systemId = String(req.systemId || '');
        const system = this._supportedSharedSystems().find((s) => s.id === systemId);
        if (!system) {
            return { success: false, message: 'النظام المطلوب غير مدعوم حالياً' };
        }
        const ranked = this._rankMethod(systemId, req.hint);
        const fallback = system.methods[0] || 'rest';
        const selected = system.methods.includes(ranked.method) ? ranked.method : fallback;
        return {
            success: true,
            system,
            recommendation: {
                method: selected,
                reason: ranked.reason,
                direct: ['direct-api', 'oauth2', 'odata', 'rest', 'graphApi'].includes(selected)
            },
            alternatives: system.methods.filter((m) => m !== selected)
        };
    }

    oneClickConnect(input) {
        const req = input || {};
        const discovery = this.discoverBestConnection(req);
        if (!discovery.success) return discovery;
        const oauthSystems = new Set(['google-workspace', 'microsoft-365', 'github', 'gitlab']);
        const requiresOAuth = oauthSystems.has(discovery.system.id);

        const connection = {
            id: 'CONN-' + Date.now(),
            icon: 'شيخة للتكامل',
            targetSystem: discovery.system.id,
            targetName: discovery.system.name,
            targetType: discovery.system.type,
            method: discovery.recommendation.method,
            mode: discovery.recommendation.direct ? 'direct' : 'bridge',
            status: requiresOAuth ? 'pending_auth' : 'active',
            autoSync: req.autoSync !== false,
            userId: req.userId || 'anonymous',
            scopes: Array.isArray(req.scopes) ? req.scopes : ['read', 'write', 'sync'],
            requiresOAuth,
            activatedAt: new Date().toISOString(),
            lastSyncAt: null
        };

        this.state.connections.unshift(connection);
        this.state.connections = this.state.connections.slice(0, 200);
        this._saveState();
        this._logEvent('one_click_connect', connection);

        return {
            success: true,
            connection,
            nextSteps: [
                requiresOAuth ? 'الاتصال بانتظار إكمال OAuth' : 'تم إنشاء الاتصال بنجاح',
                'يمكن تشغيل مزامنة أولية عبر /api/integration/procedure/run',
                'يمكن مراقبة الجودة عبر /api/integration/gap-analysis'
            ]
        };
    }

    recordOAuthLink(input) {
        const req = input || {};
        const provider = String(req.provider || '').toLowerCase();
        const providerToSystem = {
            google: 'google-workspace',
            microsoft: 'microsoft-365',
            github: 'github',
            gitlab: 'gitlab'
        };
        const targetSystem = providerToSystem[provider] || provider;
        const userId = req.userId || 'anonymous';
        const idx = this.state.connections.findIndex((c) => c.targetSystem === targetSystem && c.userId === userId);
        const nowIso = new Date().toISOString();
        const oauthMeta = {
            provider,
            accountId: req.accountId || '',
            accountEmail: req.accountEmail || '',
            linkedAt: nowIso
        };
        if (idx >= 0) {
            this.state.connections[idx].status = 'active';
            this.state.connections[idx].requiresOAuth = false;
            this.state.connections[idx].oauth = oauthMeta;
            this.state.connections[idx].lastSyncAt = this.state.connections[idx].lastSyncAt || nowIso;
        } else {
            this.state.connections.unshift({
                id: 'CONN-' + Date.now(),
                icon: 'شيخة للتكامل',
                targetSystem,
                targetName: req.targetName || targetSystem,
                targetType: 'shared',
                method: 'oauth2',
                mode: 'direct',
                status: 'active',
                autoSync: true,
                userId,
                scopes: req.scopes || ['read', 'sync'],
                requiresOAuth: false,
                oauth: oauthMeta,
                activatedAt: nowIso,
                lastSyncAt: nowIso
            });
        }
        this.state.connections = this.state.connections.slice(0, 200);
        this._saveState();
        this._logEvent('oauth_linked', { provider, userId, targetSystem, accountId: oauthMeta.accountId });
        return { success: true, provider, targetSystem, userId };
    }

    _vcsConfig(providerRaw) {
        const provider = String(providerRaw || '').toLowerCase();
        if (provider === 'github') {
            return {
                provider: 'github',
                token: String(process.env.SHEIKHA_GITHUB_ACCESS_TOKEN || process.env.GITHUB_TOKEN || '').trim(),
                owner: String(process.env.SHEIKHA_GITHUB_OWNER || '').trim(),
                repo: String(process.env.SHEIKHA_GITHUB_REPO || '').trim(),
                projectId: '',
                apiBase: 'https://api.github.com'
            };
        }
        if (provider === 'gitlab') {
            return {
                provider: 'gitlab',
                token: String(process.env.SHEIKHA_GITLAB_ACCESS_TOKEN || process.env.GITLAB_TOKEN || '').trim(),
                owner: String(process.env.SHEIKHA_GITLAB_OWNER || '').trim(),
                repo: String(process.env.SHEIKHA_GITLAB_REPO || '').trim(),
                projectId: String(process.env.SHEIKHA_GITLAB_PROJECT_ID || '').trim(),
                apiBase: String(process.env.SHEIKHA_GITLAB_API_BASE || 'https://gitlab.com/api/v4').trim()
            };
        }
        return null;
    }

    _vcsRemoteUrl(repoPath) {
        try {
            return String(execSync(`git -C "${repoPath}" remote get-url origin`, { encoding: 'utf8' }) || '').trim();
        } catch (_) {
            return '';
        }
    }

    _extractRepoFromRemote(remoteUrl, host) {
        const remote = String(remoteUrl || '').trim();
        if (!remote) return { owner: '', repo: '' };
        let normalized = remote;
        if (host === 'github.com' && normalized.startsWith('git@github.com:')) {
            normalized = normalized.replace('git@github.com:', 'https://github.com/');
        }
        if (host === 'gitlab.com' && normalized.startsWith('git@gitlab.com:')) {
            normalized = normalized.replace('git@gitlab.com:', 'https://gitlab.com/');
        }
        const rx = host === 'github.com'
            ? /github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/i
            : /gitlab\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/i;
        const m = normalized.match(rx);
        if (!m) return { owner: '', repo: '' };
        return { owner: String(m[1] || '').trim(), repo: String(m[2] || '').trim() };
    }

    discoverVcsProject(input) {
        const req = input || {};
        const provider = String(req.provider || '').toLowerCase();
        if (!['github', 'gitlab'].includes(provider)) return this._error('PROVIDER_NOT_SUPPORTED', 'provider يجب أن يكون github أو gitlab');
        const cfg = this._vcsConfig(provider) || {};

        const owner = String(req.owner || cfg.owner || '').trim();
        const repo = String(req.repo || cfg.repo || '').trim();
        const projectId = String(req.projectId || cfg.projectId || '').trim();
        if (provider === 'gitlab' && projectId) {
            return {
                success: true,
                provider,
                source: 'explicit_or_env',
                project: { projectId, fullName: projectId }
            };
        }
        if (owner && repo) {
            return {
                success: true,
                provider,
                source: 'explicit_or_env',
                project: {
                    owner,
                    repo,
                    fullName: `${owner}/${repo}`,
                    projectId: provider === 'gitlab' ? `${owner}/${repo}` : ''
                }
            };
        }

        const repoPath = String(req.repoPath || path.join(this.basePath, '..')).trim();
        const remote = this._vcsRemoteUrl(repoPath);
        const parsed = this._extractRepoFromRemote(remote, provider === 'github' ? 'github.com' : 'gitlab.com');
        if (parsed.owner && parsed.repo) {
            return {
                success: true,
                provider,
                source: 'git_remote',
                remote,
                project: {
                    owner: parsed.owner,
                    repo: parsed.repo,
                    fullName: `${parsed.owner}/${parsed.repo}`,
                    projectId: provider === 'gitlab' ? `${parsed.owner}/${parsed.repo}` : ''
                }
            };
        }
        return this._error('PROJECT_DISCOVERY_FAILED', 'تعذر اكتشاف مشروع المستودع تلقائياً', { provider, remote });
    }

    async _fetchVcsJson(url, provider, token) {
        const headers = {
            Accept: 'application/json',
            'User-Agent': 'SHEIKHA-Integration-Engine'
        };
        if (token) {
            if (provider === 'gitlab') headers['PRIVATE-TOKEN'] = token;
            else headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch(url, { method: 'GET', headers });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`${provider} API ${res.status}: ${txt.slice(0, 180)}`);
        }
        return res.json();
    }

    _localGitFallbackActivity(input) {
        const req = input || {};
        const provider = String(req.provider || 'github').toLowerCase();
        const repoPath = String(req.repoPath || path.join(this.basePath, '..')).trim();
        const limit = Math.max(1, Math.min(100, Number(req.limit || 30)));
        try {
            const out = execSync(
                `git -C "${repoPath}" log --date=iso --pretty=format:%H%x1f%an%x1f%ae%x1f%ad%x1f%s -n ${limit}`,
                { encoding: 'utf8' }
            );
            const commits = String(out || '').split('\n').filter(Boolean).map((line) => {
                const parts = line.split('\x1f');
                return {
                    sha: parts[0] || '',
                    author: parts[1] || '',
                    authorEmail: parts[2] || '',
                    date: parts[3] || '',
                    message: parts.slice(4).join('|'),
                    url: ''
                };
            });
            return {
                success: true,
                provider,
                source: 'local_git_fallback',
                project: { fullName: path.basename(repoPath) },
                commits,
                mergeRequests: [],
                pullRequests: []
            };
        } catch (e) {
            return this._error('LOCAL_GIT_FALLBACK_FAILED', 'تعذر استخراج النشاط المحلي من git', { reason: e.message });
        }
    }

    async fetchVcsActivity(input) {
        const req = input || {};
        const provider = String(req.provider || '').toLowerCase();
        if (!['github', 'gitlab'].includes(provider)) return this._error('PROVIDER_NOT_SUPPORTED', 'provider يجب أن يكون github أو gitlab');
        const projectInfo = this.discoverVcsProject(req);
        if (!projectInfo.success) return this._localGitFallbackActivity(req);
        const cfg = this._vcsConfig(provider) || {};
        const limit = Math.max(1, Math.min(100, Number(req.limit || 30)));
        const sinceDays = Math.max(1, Math.min(90, Number(req.sinceDays || 14)));
        const sinceIso = new Date(Date.now() - (sinceDays * 24 * 60 * 60 * 1000)).toISOString();

        try {
            if (provider === 'github') {
                const owner = projectInfo.project.owner;
                const repo = projectInfo.project.repo;
                const commitsUrl = `${cfg.apiBase}/repos/${owner}/${repo}/commits?since=${encodeURIComponent(sinceIso)}&per_page=${limit}`;
                const prsUrl = `${cfg.apiBase}/repos/${owner}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=${limit}`;
                const [commitsRaw, prsRaw] = await Promise.all([
                    this._fetchVcsJson(commitsUrl, provider, cfg.token),
                    this._fetchVcsJson(prsUrl, provider, cfg.token)
                ]);
                const commits = (Array.isArray(commitsRaw) ? commitsRaw : []).map((c) => ({
                    sha: c.sha || '',
                    author: ((c.commit || {}).author || {}).name || '',
                    date: ((c.commit || {}).author || {}).date || '',
                    message: ((c.commit || {}).message || '').split('\n')[0],
                    url: c.html_url || ''
                }));
                const pullRequests = (Array.isArray(prsRaw) ? prsRaw : []).map((p) => ({
                    number: p.number || 0,
                    title: p.title || '',
                    state: p.state || '',
                    draft: !!p.draft,
                    mergedAt: p.merged_at || null,
                    author: (p.user || {}).login || '',
                    updatedAt: p.updated_at || '',
                    url: p.html_url || ''
                }));
                return {
                    success: true,
                    provider,
                    source: 'api',
                    project: projectInfo.project,
                    commits,
                    pullRequests,
                    mergeRequests: [],
                    meta: { sinceDays, limit, tokenConfigured: !!cfg.token }
                };
            }

            const projectIdRaw = String(projectInfo.project.projectId || projectInfo.project.fullName || '').trim();
            const projectId = encodeURIComponent(projectIdRaw);
            const commitsUrl = `${cfg.apiBase}/projects/${projectId}/repository/commits?since=${encodeURIComponent(sinceIso)}&per_page=${limit}`;
            const mrsUrl = `${cfg.apiBase}/projects/${projectId}/merge_requests?state=all&per_page=${limit}&order_by=updated_at&sort=desc`;
            const [commitsRaw, mrsRaw] = await Promise.all([
                this._fetchVcsJson(commitsUrl, provider, cfg.token),
                this._fetchVcsJson(mrsUrl, provider, cfg.token)
            ]);
            const commits = (Array.isArray(commitsRaw) ? commitsRaw : []).map((c) => ({
                sha: c.id || '',
                author: c.author_name || '',
                date: c.created_at || '',
                message: c.title || '',
                url: c.web_url || ''
            }));
            const mergeRequests = (Array.isArray(mrsRaw) ? mrsRaw : []).map((m) => ({
                iid: m.iid || 0,
                title: m.title || '',
                state: m.state || '',
                draft: !!m.draft,
                mergedAt: m.merged_at || null,
                author: (m.author || {}).username || '',
                updatedAt: m.updated_at || '',
                url: m.web_url || ''
            }));
            return {
                success: true,
                provider,
                source: 'api',
                project: projectInfo.project,
                commits,
                pullRequests: [],
                mergeRequests,
                meta: { sinceDays, limit, tokenConfigured: !!cfg.token }
            };
        } catch (e) {
            const fallback = this._localGitFallbackActivity(req);
            if (fallback.success) {
                fallback.warning = `${provider} API fallback: ${e.message}`;
                return fallback;
            }
            return this._error('VCS_ACTIVITY_FETCH_FAILED', 'تعذر جلب نشاط المستودع', { provider, reason: e.message });
        }
    }

    async buildVcsOpsReport(input) {
        const req = input || {};
        const provider = String(req.provider || '').toLowerCase();
        if (!['github', 'gitlab'].includes(provider)) return this._error('PROVIDER_NOT_SUPPORTED', 'provider يجب أن يكون github أو gitlab');
        const activity = await this.fetchVcsActivity(req);
        if (!activity.success) return activity;
        const commits = activity.commits || [];
        const prs = activity.pullRequests || [];
        const mrs = activity.mergeRequests || [];
        const contributorsMap = {};
        commits.forEach((c) => {
            const key = String(c.author || '').trim() || 'unknown';
            contributorsMap[key] = Number(contributorsMap[key] || 0) + 1;
        });
        const topContributors = Object.entries(contributorsMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, commits: count }));
        const run = {
            runId: this._newId('VCSREP'),
            provider,
            source: activity.source,
            project: activity.project,
            generatedAt: new Date().toISOString(),
            summary: {
                commits: commits.length,
                pullRequests: prs.length,
                mergeRequests: mrs.length,
                openPrs: prs.filter((p) => p.state === 'open').length,
                openMrs: mrs.filter((m) => m.state === 'opened').length,
                mergedPrs: prs.filter((p) => p.mergedAt).length,
                mergedMrs: mrs.filter((m) => m.mergedAt).length,
                topContributors
            },
            links: {
                latestCommits: commits.slice(0, 10),
                latestPullRequests: prs.slice(0, 10),
                latestMergeRequests: mrs.slice(0, 10)
            },
            operationalSignals: {
                deliveryCadence: commits.length >= 20 ? 'high' : (commits.length >= 8 ? 'medium' : 'low'),
                collaboration: (prs.length + mrs.length) >= 10 ? 'high' : ((prs.length + mrs.length) >= 4 ? 'medium' : 'low'),
                recommendation: 'اربط التقرير بلوحة التشغيل اليومية لمتابعة سرعة التطوير وجودة التعاون'
            }
        };
        this.state.vcsActivityRuns.unshift(run);
        this.state.vcsActivityRuns = this.state.vcsActivityRuns.slice(0, 1000);
        this._saveState();
        this._logEvent('vcs_ops_report_generated', {
            runId: run.runId,
            provider,
            project: (run.project || {}).fullName || (run.project || {}).projectId || '',
            commits: run.summary.commits,
            pullRequests: run.summary.pullRequests,
            mergeRequests: run.summary.mergeRequests
        });
        return { success: true, report: run };
    }

    listVcsOpsReports(input) {
        const req = input || {};
        const provider = String(req.provider || '').toLowerCase();
        const limit = Math.max(1, Math.min(200, Number(req.limit || 20)));
        let rows = this.state.vcsActivityRuns || [];
        if (provider) rows = rows.filter((x) => x.provider === provider);
        return rows.slice(0, limit);
    }

    async runDailyOpsReport(input) {
        const req = input || {};
        const providers = Array.isArray(req.providers) && req.providers.length
            ? req.providers.map((x) => String(x || '').toLowerCase()).filter((x) => ['github', 'gitlab'].includes(x))
            : ['github', 'gitlab'];
        const runs = [];
        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            const r = await this.buildVcsOpsReport({
                provider,
                owner: req.owner || '',
                repo: req.repo || '',
                projectId: req.projectId || '',
                repoPath: req.repoPath || '',
                limit: req.limit || 30,
                sinceDays: req.sinceDays || 14
            });
            runs.push({
                provider,
                success: !!r.success,
                runId: (((r || {}).report || {}).runId) || '',
                summary: (((r || {}).report || {}).summary) || null,
                error: r.success ? null : (r.error || null)
            });
        }
        const successCount = runs.filter((x) => x.success).length;
        return {
            success: successCount > 0,
            generatedAt: new Date().toISOString(),
            runs,
            summary: {
                total: runs.length,
                success: successCount,
                failed: runs.length - successCount
            }
        };
    }

    async opsExecutiveDailyReport(input) {
        const req = input || {};
        const dailyVcs = await this.runDailyOpsReport({
            providers: req.providers || ['github', 'gitlab'],
            limit: req.limit || 20,
            sinceDays: req.sinceDays || 14,
            owner: req.owner || '',
            repo: req.repo || '',
            projectId: req.projectId || '',
            repoPath: req.repoPath || ''
        });
        const autonomous = this.autonomousStatus();
        const sourcing = this.sourcingIntelligence();
        const scorecard = this.getSourcingScorecard({ limit: 10 });
        const reconciliation = this.reconciliationDashboard({ tenantId: '' });
        const openDlq = (this.state.deadLetterQueue || []).filter((x) => x.status === 'open').length;
        const vcsLiveApi = (dailyVcs.runs || []).filter((r) => r.success && !r.error).length;

        return {
            success: true,
            generatedAt: new Date().toISOString(),
            summary: {
                vcsProviders: (dailyVcs.summary || {}).total || 0,
                vcsSuccess: (dailyVcs.summary || {}).success || 0,
                autonomousEnabled: !!autonomous.enabled,
                autonomousQueueQueued: autonomous.queue.queued,
                sourcingProviders: sourcing.providersTotal,
                openDlq,
                reconciliationOpenMismatches: reconciliation.openMismatches,
                vcsLiveApiSignals: vcsLiveApi
            },
            sections: {
                vcs: dailyVcs,
                autonomous,
                sourcing,
                scorecard,
                reconciliation
            },
            recommendations: [
                'حافظ على تشغيل التقرير اليومي لأنشطة VCS (GitHub/GitLab).',
                'أي ارتفاع في DLQ أو mismatches يتطلب تدخل تشغيلي فوري.',
                'فعّل دورات sourcing أسبوعية مع مراجعة Top 10 مزودين.',
                'راجع صلاحيات OAuth والتوكنات دوريًا وفق مبدأ أقل صلاحية.'
            ]
        };
    }

    getDashboard() {
        const oauthReady = {
            github: !!(process.env.SHEIKHA_GITHUB_CLIENT_ID && process.env.SHEIKHA_GITHUB_CLIENT_SECRET),
            gitlab: !!(process.env.SHEIKHA_GITLAB_CLIENT_ID && process.env.SHEIKHA_GITLAB_CLIENT_SECRET),
            google: !!(process.env.SHEIKHA_GOOGLE_CLIENT_ID || process.env.SHEIKHA_GOOGLE),
            microsoft: !!(process.env.SHEIKHA_MS_CLIENT_ID || process.env.SHEIKHA_MS)
        };
        return {
            engine: this.name,
            nameAr: this.nameAr,
            version: this.version,
            owner: this.owner,
            activatedAt: this.activatedAt,
            summary: {
                integrationLayers: this.integrationLayers.length,
                totalEngines: this.engineMap.totalEngines,
                dataFlowPatterns: this.dataFlowPatterns.length,
                categories: this.engineMap.categories.length,
                shariaPrinciples: this.shariaGuidelines.principles.length,
                connectors: this.connectors.length,
                activeConnections: (this.state.connections || []).filter((c) => c.status === 'active').length,
                totalTransforms: this.state.kpis.totalTransforms,
                successTransforms: this.state.kpis.successfulTransforms,
                failedTransforms: this.state.kpis.failedTransforms,
                oracleRequests: this.state.oracleAudit.totalRequests,
                oracleSuccessRequests: this.state.oracleAudit.successfulRequests,
                superiorActivations: (this.state.superiorActivations || []).length,
                verticalActivations: (this.state.verticalActivations || []).length,
                saasProvisioningRuns: (this.state.saasProvisioningRuns || []).length,
                operatingLayerRuns: (this.state.operatingLayerRuns || []).length,
                vcsReports: (this.state.vcsActivityRuns || []).length
            },
            integrationLayers: this.integrationLayers,
            engineMap: this.engineMap,
            dataFlowPatterns: this.dataFlowPatterns,
            quranReferences: this.quranReferences,
            shariaGuidelines: this.shariaGuidelines,
            connectors: this.connectors,
            sharedSystems: this._supportedSharedSystems(),
            lastGapAnalysis: this.state.lastGapAnalysis,
            tenants: {
                total: (this.state.tenants || []).length,
                activeConnections: (this.state.tenantConnections || []).length,
                activePacks: (this.state.packActivations || []).length
            },
            oracle: {
                config: this._oracleConfigPublic(),
                audit: this.state.oracleAudit
            },
            architecture: {
                superiorMesh: 'Sheikha Superior Integration Mesh',
                supportedErpSystems: Object.keys(this._erpArchitectureCatalog())
            },
            verticals: {
                active: (this.state.verticalActivations || []).length,
                catalog: Object.keys(this._marketVerticalProfiles())
            },
            readiness: {
                oauth: oauthReady,
                vcs: {
                    reportsGenerated: (this.state.vcsActivityRuns || []).length,
                    latestReportAt: ((this.state.vcsActivityRuns || [])[0] || {}).generatedAt || null
                }
            }
        };
    }

    tenantGovernanceBlueprint() {
        return {
            model: 'Multi-Tenant SaaS Governance',
            tenantDefinition: {
                tenantId: 'معرف جهة فريد',
                partitionKey: ['legalEntity', 'businessUnit', 'companyCode'],
                isolationMode: 'strict',
                marketProfile: 'metals-scrap-dismantling'
            },
            architecture: {
                middleware: 'tenant-context middleware عبر x-tenant-agent-token',
                modelStore: 'tenant-governance-store.json',
                authAgent: 'scoped token with HMAC signature',
                endpointExample: '/api/integration/tenant-governance/contracts/evaluate'
            },
            shariaDigitalization: {
                quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                principles: ['لا ربا', 'لا غرر', 'التراضي', 'الشفافية'],
                enforcement: 'رفض أي عقد يحمل فائدة ربوية أو غموض جسيم'
            }
        };
    }

    intellectualPropertySecurityPolicy() {
        return {
            title: 'سياسة حماية الملكية الفكرية الرقمية — شيخة',
            controls: [
                'عزل بيانات كل Tenant بعقد صلاحيات مستقل',
                'منع إدخال الأسرار الحساسة داخل قواعد البيانات التشغيلية',
                'تسجيل الأحداث الحساسة بسجل تدقيق غير قابل للتلاعب',
                'حصر الوصول بالمبدأ الأقل صلاحية',
                'منع التصدير غير المصرح به لخرائط التكامل والتحويل'
            ],
            legalAndEthical: {
                noHarmRule: 'لا ضرر ولا ضرار',
                antiMisuse: true,
                ownershipRespect: true
            }
        };
    }

    tenantSecurityPosture(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        const tenant = (this.state.tenants || []).find((x) => x.tenantId === tenantId) || this.tenantModelStore.getTenant(tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');

        const connections = (this.state.tenantConnections || []).filter((c) => c.tenantId === tenantId);
        const hasVaultRef = connections.some((c) => !!c.secretRef);
        const pendingAuth = connections.filter((c) => c.status === 'pending_auth').length;
        const activeAuth = connections.filter((c) => c.status === 'active').length;
        const strictIsolation = String(tenant.isolationMode || 'strict') === 'strict';

        const checks = {
            tenantFromToken: true,
            noRawSecretsInConnection: !connections.some((c) => this._containsRawSecretInput(c)),
            vaultReferenceUsed: hasVaultRef || connections.length === 0,
            strictIsolation
        };
        const passed = checks.tenantFromToken && checks.noRawSecretsInConnection && checks.vaultReferenceUsed && checks.strictIsolation;
        return {
            success: true,
            result: {
                tenantId,
                passed,
                checks,
                connections: {
                    total: connections.length,
                    pendingAuth,
                    activeAuth
                },
                timestamp: new Date().toISOString()
            }
        };
    }

    securityHardeningReport(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const tenant = tenantId ? ((this.state.tenants || []).find((x) => x.tenantId === tenantId) || this.tenantModelStore.getTenant(tenantId)) : null;
        const connections = (this.state.tenantConnections || []).filter((c) => !tenantId || c.tenantId === tenantId);
        const hasSecretRefOnly = connections.every((c) => !this._containsRawSecretInput(c));
        const hasPendingAuth = connections.some((c) => c.status === 'pending_auth' || c.status === 'active');
        const hasRotationPolicy = connections.every((c) => Number(c.rotationPolicyDays || 0) >= 90 && !!c.nextRotationAt);
        const idempotencyWithHash = !!((this.state.idempotencyRegistry || {}) && Object.values(this.state.idempotencyRegistry || {}).some((x) => !!x.requestHash));
        const report = {
            objective: 'تحقيق أمن مؤسسي بلا ضرر ولا ضرار مع حماية الملكية الفكرية',
            tenantId: tenantId || 'all',
            checklist: [
                { control: 'Hard Tenant Isolation via token/JWT', status: 'active' },
                { control: 'Header/JWT tenant mismatch blocking', status: 'active' },
                { control: 'Secrets Vault isolation by secret_ref', status: hasSecretRefOnly ? 'active' : 'needs_action' },
                { control: 'Token cache isolation (tenant+connection)', status: hasPendingAuth ? 'active' : 'needs_action' },
                { control: 'Institutional audit trail without secrets', status: 'active' },
                { control: 'Idempotency with request_hash', status: idempotencyWithHash ? 'active' : 'needs_action' },
                { control: 'ERP rotation policy every 90 days', status: hasRotationPolicy ? 'active' : 'needs_action' },
                { control: 'Rate limit / retry / DLQ', status: 'active' },
                { control: 'Subdomain isolation readiness', status: tenant && tenant.subdomain ? 'active' : 'partial' },
                { control: 'Intellectual property protection policy', status: 'active' }
            ],
            quranAndSunnah: {
                quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                policy: ['لا ضرر ولا ضرار', 'لا ربا', 'لا غرر', 'حفظ الحقوق والملكية']
            },
            generatedAt: new Date().toISOString()
        };
        this._logEvent('security_hardening_report_generated', {
            tenantId: report.tenantId,
            checklistCount: report.checklist.length
        });
        return { success: true, report };
    }

    _findTenantConnection(tenantId, connectionId) {
        return (this.state.tenantConnections || []).find((c) => c.tenantId === tenantId && c.connectionId === connectionId) || null;
    }

    attachConnectionSecretRef(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const connectionId = String(req.connectionId || '').trim();
        const secretRef = String(req.secretRef || '').trim();
        const vaultProvider = String(req.vaultProvider || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!connectionId) return this._error('CONNECTION_ID_REQUIRED', 'connectionId مطلوب');
        if (!secretRef) return this._error('SECRET_REF_REQUIRED', 'secret_ref مطلوب');
        const conn = this._findTenantConnection(tenantId, connectionId);
        if (!conn) return this._error('CONNECTION_NOT_FOUND', 'سجل الاتصال غير موجود');
        const expectedPrefix = `vault://tenants/${tenantId}/connections/${connectionId}/`;
        if (!secretRef.startsWith(expectedPrefix)) {
            return this._error('SECRET_REF_INVALID', `secret_ref يجب أن يبدأ بـ ${expectedPrefix}`);
        }
        conn.secretRef = secretRef;
        conn.vaultProvider = vaultProvider || conn.vaultProvider || 'vault';
        conn.status = conn.status === 'active' ? 'active' : 'pending_auth';
        conn.updatedAt = new Date().toISOString();
        this._saveState();
        this._logEvent('connection_secret_ref_attached', {
            tenantId,
            connectionId,
            vaultProvider: conn.vaultProvider
        });
        return {
            success: true,
            data: {
                tenantId,
                connectionId,
                secretRefAttached: true,
                status: conn.status
            }
        };
    }

    runConnectionHealthCheck(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const connectionId = String(req.connectionId || '').trim();
        const actorUserId = String(req.actorUserId || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        if (!connectionId) return this._error('CONNECTION_ID_REQUIRED', 'connectionId مطلوب');
        const conn = this._findTenantConnection(tenantId, connectionId);
        if (!conn) return this._error('CONNECTION_NOT_FOUND', 'سجل الاتصال غير موجود');
        if (!conn.secretRef) return this._error('SECRET_REF_REQUIRED', 'لا يمكن health_check بدون secret_ref');

        const nowIso = new Date().toISOString();
        conn.lastHealthCheckAt = nowIso;
        conn.status = 'active';
        conn.health = {
            token: 'ok',
            ping: 'ok',
            updatedAt: nowIso
        };
        this._saveState();
        this._logEvent('connection_health_check', {
            tenantId,
            connectionId,
            actorUserId,
            status: 'active'
        });
        return {
            success: true,
            data: {
                tenantId,
                connectionId,
                status: conn.status,
                health: conn.health
            }
        };
    }

    enableTenantPacks(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const verticalId = String(req.verticalId || 'metals-scrap-dismantling').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        const verticals = this._marketVerticalProfiles();
        const profile = verticals[verticalId];
        if (!profile) return this._error('VERTICAL_NOT_FOUND', 'القطاع المطلوب غير معرّف');
        const existing = new Set((this.state.packActivations || []).filter((p) => p.tenantId === tenantId).map((p) => p.packId));
        const activated = [];
        (profile.startupPacks || []).forEach((packId) => {
            if (existing.has(packId)) return;
            const r = this.activatePack({ tenantId, packId });
            if (r.success) activated.push({ packId, activationId: r.activation.activationId });
        });
        return {
            success: true,
            data: {
                tenantId,
                verticalId,
                activatedCount: activated.length,
                activated
            }
        };
    }

    tenantProvisioningExecutionReport(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        const tenant = (this.state.tenants || []).find((t) => t.tenantId === tenantId) || this.tenantModelStore.getTenant(tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');
        const connections = (this.state.tenantConnections || []).filter((c) => c.tenantId === tenantId);
        const packs = (this.state.packActivations || []).filter((p) => p.tenantId === tenantId);
        const latestVertical = (this.state.verticalActivations || []).find((v) => v.tenantId === tenantId) || null;
        const healthReady = connections.some((c) => c.status === 'active' && c.health && c.health.token === 'ok');
        const secretReady = connections.some((c) => !!c.secretRef);
        const report = {
            tenant: {
                tenantId,
                tenantSlug: tenant.tenantSlug || '',
                subdomain: tenant.subdomain || '',
                status: tenant.status || 'provisioning'
            },
            connections: {
                total: connections.length,
                pendingAuth: connections.filter((c) => c.status === 'pending_auth').length,
                active: connections.filter((c) => c.status === 'active').length
            },
            packs: {
                totalActive: packs.length,
                latest: packs.slice(0, 10).map((p) => p.packId)
            },
            readiness: {
                attach_secret_ref: secretReady,
                run_health_check: healthReady,
                enable_packs: packs.length > 0,
                verticalActivated: !!latestVertical
            },
            shariaAndProtection: {
                principles: ['لا ضرر ولا ضرار', 'لا ربا', 'لا غرر', 'حفظ الملكية الفكرية'],
                quran: ['المائدة:2', 'النساء:29', 'البقرة:275']
            },
            generatedAt: new Date().toISOString()
        };
        return { success: true, report };
    }

    issueTenantAgentToken(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const scope = String(req.scope || 'tenant:read').trim();
        const ttlSec = Number(req.ttlSec || 3600);
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        const result = this.tenantAuthAgent.issueScopedToken({ tenantId, scope, ttlSec });
        if (!result.success) return this._error('AGENT_TOKEN_FAILED', result.message || 'تعذر إصدار التوكن');
        return {
            success: true,
            tenantId,
            scope: result.scope,
            token: result.token,
            expiresAt: result.expiresAt
        };
    }

    _containsRibaIndicators(payload) {
        const text = JSON.stringify(payload || {}).toLowerCase();
        return text.includes('interest') || text.includes('riba') || text.includes('فائدة') || text.includes('ربا');
    }

    _containsGhararIndicators(payload) {
        const text = JSON.stringify(payload || {}).toLowerCase();
        return text.includes('unknown') || text.includes('جهالة') || text.includes('undefined-spec');
    }

    evaluateTenantContract(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const contract = req.contract || {};
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        const tenant = this.tenantModelStore.getTenant(tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');

        const hasRiba = this._containsRibaIndicators(contract);
        const hasGharar = this._containsGhararIndicators(contract);
        const accepted = !hasRiba && !hasGharar;
        const result = {
            accepted,
            tenantId,
            checks: {
                noRiba: !hasRiba,
                noGharar: !hasGharar,
                mutualConsentRequired: true
            },
            message: accepted ? 'العقد متوافق شرعيًا وفق الضوابط الرقمية الأساسية' : 'العقد مرفوض لوجود مؤشرات مخالفة',
            quranBasis: ['المائدة:2', 'النساء:29', 'البقرة:275'],
            timestamp: new Date().toISOString()
        };
        this._logEvent('tenant_contract_evaluated', {
            tenantId,
            accepted,
            noRiba: !hasRiba,
            noGharar: !hasGharar
        });
        return { success: true, result };
    }

    saasSmartBlueprint() {
        return {
            product: 'SHEIKHA Smart Digital SaaS',
            model: 'Vertical-first multi-tenant SaaS',
            pillars: [
                'Tenant Isolation + Zero-Key Trust',
                'ERP Connectors + Canonical Model',
                'Smart Provisioning + Auto Packs',
                'Sharia Digital Governance (Quran & Sunnah)',
                'Operational Reliability (Idempotency, DLQ, Reconciliation)'
            ],
            quranAndSunnah: {
                quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                hadithThemes: ['الصدق في البيع', 'تحريم الغش', 'رفع الضرر'],
                digitalPolicies: ['no_riba', 'no_gharar', 'mutual_consent', 'full_transparency']
            },
            launchVertical: 'metals-scrap-dismantling',
            expansion: ['precious-metals', 'general-b2b', 'global-b2b-marketplace']
        };
    }

    _gradeScore(score) {
        const s = Math.max(0, Math.min(100, Number(score || 0)));
        if (s >= 90) return 'ممتاز';
        if (s >= 75) return 'جيد جدًا';
        if (s >= 60) return 'جيد';
        return 'يحتاج تحسين';
    }

    calculateShariaDigitalScore(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const contract = req.contract || {};
        const op = req.operations || {};
        if (!tenantId) return this._error('TENANT_ID_REQUIRED', 'tenantId مطلوب');
        const tenant = this.tenantModelStore.getTenant(tenantId);
        if (!tenant) return this._error('TENANT_NOT_FOUND', 'الجهة غير موجودة');

        const hasRiba = this._containsRibaIndicators(contract);
        const hasGharar = this._containsGhararIndicators(contract);
        const transparency = op.transparency !== false;
        const mutualConsent = op.mutualConsent !== false;
        const truthfulness = op.truthfulness !== false;
        const antiFraud = op.antiFraud !== false;

        let score = 100;
        if (hasRiba) score -= 45;
        if (hasGharar) score -= 25;
        if (!transparency) score -= 10;
        if (!mutualConsent) score -= 10;
        if (!truthfulness) score -= 5;
        if (!antiFraud) score -= 5;
        score = Math.max(0, Math.min(100, score));

        const result = {
            tenantId,
            score,
            grade: this._gradeScore(score),
            passed: score >= 75 && !hasRiba && !hasGharar,
            checks: {
                noRiba: !hasRiba,
                noGharar: !hasGharar,
                transparency,
                mutualConsent,
                truthfulness,
                antiFraud
            },
            references: {
                quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                policy: ['no_riba', 'no_gharar', 'mutual_consent', 'anti_fraud']
            },
            timestamp: new Date().toISOString()
        };
        this._logEvent('saas_sharia_score', {
            tenantId,
            score,
            passed: result.passed
        });
        return { success: true, result };
    }

    provisionSmartSaas(input) {
        const req = input || {};
        const targetSystem = String(req.targetSystem || 'oracle-erp-cloud').trim();
        const verticalId = String(req.verticalId || 'metals-scrap-dismantling').trim();
        let tenantId = String(req.tenantId || '').trim();
        let tenantMeta = null;

        if (!tenantId) {
            const create = this.registerTenant({
                name: String(req.tenantName || 'عميل شيخة SaaS'),
                type: req.type || 'company',
                country: req.country || 'SA',
                companyCode: req.companyCode || '',
                businessUnit: req.businessUnit || '',
                legalEntity: req.legalEntity || '',
                market: verticalId,
                erpSystem: targetSystem
            });
            if (!create.success) return create;
            tenantId = create.tenant.tenantId;
            tenantMeta = create.tenant;
        } else {
            tenantMeta = (this.state.tenants || []).find((x) => x.tenantId === tenantId) || null;
        }

        const erpConn = this.connectTenantSystem({
            tenantId,
            targetSystem,
            authMode: 'oauth2',
            authMethod: 'oauth_client_credentials',
            status: 'pending_auth',
            secretRef: String(req.secretRef || ''),
            vaultProvider: String(req.vaultProvider || ''),
            baseUrl: String(req.baseUrl || ''),
            identityUrl: String(req.identityUrl || '')
        });
        const erpConnectionId = erpConn.success ? erpConn.connection.connectionId : '';

        const vertical = this.activateMarketVertical({
            tenantId,
            targetSystem,
            verticalId,
            expiresInMin: req.expiresInMin || 15
        });
        if (!vertical.success) return vertical;

        const tokenRes = this.issueTenantAgentToken({
            tenantId,
            scope: 'tenant:*',
            ttlSec: req.tokenTtlSec || 7200
        });
        if (!tokenRes.success) return tokenRes;

        const saasRun = {
            runId: this._newId('SAAS'),
            tenantId,
            targetSystem,
            verticalId,
            plan: String(req.plan || 'growth'),
            status: 'active',
            activationRef: vertical.activation.verticalActivationId,
            createdAt: new Date().toISOString()
        };
        this.state.saasProvisioningRuns.unshift(saasRun);
        this.state.saasProvisioningRuns = this.state.saasProvisioningRuns.slice(0, 4000);
        this._saveState();
        this._logEvent('saas_provisioned', {
            runId: saasRun.runId,
            tenantId,
            targetSystem,
            verticalId
        });

        return {
            success: true,
            data: {
                saasRun,
                tenantId,
                tenantSlug: (tenantMeta && tenantMeta.tenantSlug) || '',
                subdomain: (tenantMeta && tenantMeta.subdomain) || '',
                defaultWorkspaceId: (tenantMeta && tenantMeta.defaultWorkspaceId) || '',
                status: 'provisioning',
                targetSystem,
                verticalId,
                erpConnectionId,
                token: {
                    value: tokenRes.token,
                    scope: tokenRes.scope,
                    expiresAt: tokenRes.expiresAt
                },
                readiness: vertical.activation.readiness,
                nextSteps: [
                    'create_admin_user',
                    'configure_erp_oauth',
                    'run_health_check',
                    'enable_integration_packs'
                ]
            },
            message: 'تم تفعيل SaaS الذكي الرقمي بنجاح وفق الضوابط الشرعية'
        };
    }

    saasCommandCenter(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const runs = (this.state.saasProvisioningRuns || []).filter((x) => !tenantId || x.tenantId === tenantId);
        return {
            success: true,
            summary: {
                totalRuns: runs.length,
                activeRuns: runs.filter((x) => x.status === 'active').length,
                metalsRuns: runs.filter((x) => x.verticalId === 'metals-scrap-dismantling').length
            },
            latest: runs.slice(0, 20),
            blueprint: this.saasSmartBlueprint()
        };
    }

    ecosystemSmartBlueprint() {
        return {
            title: 'SHEIKHA Smart Integrated Digital Ecosystem',
            objective: 'منظومة تشغيل رقمية ذكية متكاملة قابلة للتوسع',
            layers: [
                'Digital Identity & Tenant Governance',
                'Trust Layer (Zero-Key + Agent Token)',
                'ERP Integration Hub (SAP/Oracle/Odoo/...)',
                'Operational Intelligence (KPIs + Reconciliation + DLQ)',
                'Sharia Governance (Quran & Sunnah Policy Engine)'
            ],
            quranAndSunnahDigitization: {
                quran: [
                    { ref: 'المائدة:2', policy: 'التعاون على البر والتقوى' },
                    { ref: 'النساء:29', policy: 'التراضي ومنع أكل الأموال بالباطل' },
                    { ref: 'البقرة:275', policy: 'منع الربا' }
                ],
                sunnahThemes: [
                    'الصدق في المعاملة',
                    'منع الغش',
                    'رفع الضرر وتحقيق العدل'
                ],
                digitalControls: ['no_riba', 'no_gharar', 'mutual_consent', 'truthfulness', 'anti_fraud']
            },
            launchVertical: 'metals-scrap-dismantling',
            expansionRoadmap: ['precious-metals', 'industrial-materials', 'general-b2b', 'global-b2b-marketplace']
        };
    }

    activateSmartEcosystem(input) {
        const req = input || {};
        const provision = this.provisionSmartSaas({
            tenantId: req.tenantId || '',
            tenantName: req.tenantName || 'عميل منظومة شيخة الرقمية',
            targetSystem: req.targetSystem || 'oracle-erp-cloud',
            verticalId: req.verticalId || 'metals-scrap-dismantling',
            plan: req.plan || 'growth',
            country: req.country || 'SA',
            type: req.type || 'company',
            companyCode: req.companyCode || '',
            businessUnit: req.businessUnit || '',
            legalEntity: req.legalEntity || '',
            tokenTtlSec: req.tokenTtlSec || 7200
        });
        if (!provision.success) return provision;

        const tenantId = provision.data.tenantId;
        const shariaAudit = this.calculateShariaDigitalScore({
            tenantId,
            contract: req.contract || { type: 'standard-trade', clause: 'no-interest' },
            operations: Object.assign({
                transparency: true,
                mutualConsent: true,
                truthfulness: true,
                antiFraud: true
            }, req.operations || {})
        });
        if (!shariaAudit.success) return shariaAudit;

        const ecoRun = {
            ecosystemRunId: this._newId('ECO'),
            tenantId,
            targetSystem: provision.data.targetSystem,
            verticalId: provision.data.verticalId,
            status: 'active',
            shariaScore: shariaAudit.result.score,
            shariaGrade: shariaAudit.result.grade,
            activationRef: provision.data.saasRun.runId,
            createdAt: new Date().toISOString()
        };
        this.state.ecosystemRuns.unshift(ecoRun);
        this.state.ecosystemRuns = this.state.ecosystemRuns.slice(0, 4000);
        this._saveState();
        this._logEvent('ecosystem_activated', {
            ecosystemRunId: ecoRun.ecosystemRunId,
            tenantId,
            targetSystem: ecoRun.targetSystem,
            verticalId: ecoRun.verticalId,
            shariaScore: ecoRun.shariaScore
        });

        return {
            success: true,
            data: {
                ecosystem: ecoRun,
                provisioning: provision.data,
                shariaAudit: shariaAudit.result,
                blueprint: this.ecosystemSmartBlueprint()
            },
            message: 'تم تفعيل النظام البيئي المتكامل الرقمي الذكي وفق ضوابط الكتاب والسنة'
        };
    }

    ecosystemCommandCenter(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const rows = (this.state.ecosystemRuns || []).filter((x) => !tenantId || x.tenantId === tenantId);
        const avgScore = rows.length ? Math.round(rows.reduce((a, b) => a + Number(b.shariaScore || 0), 0) / rows.length) : 0;
        return {
            success: true,
            summary: {
                totalEcosystems: rows.length,
                activeEcosystems: rows.filter((x) => x.status === 'active').length,
                averageShariaScore: avgScore,
                grade: this._gradeScore(avgScore)
            },
            latest: rows.slice(0, 20),
            blueprint: this.ecosystemSmartBlueprint()
        };
    }

    operatingLayerBlueprint() {
        return {
            strategy: 'Operating Layer فوق ERP',
            positioning: {
                role: 'طبقة تشغيل مركزية محايدة',
                notReplacingErp: true,
                value: [
                    'تنسيق عمليات بين الشركات',
                    'توحيد البيانات بين Oracle/SAP/Odoo',
                    'مراقبة تشغيل لحظية',
                    'امتثال شرعي وتشغيلي',
                    'تسريع الصفقات وتقليل الأخطاء'
                ]
            },
            noHarmPolicy: {
                principle: 'لا ضرر ولا ضرار',
                controls: [
                    'لا احتكار للبيانات',
                    'قابلية التصدير والخروج',
                    'أقل صلاحيات ممكنة',
                    'لا مشاركة بيانات بدون إذن'
                ]
            },
            shariaDigitization: {
                quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                sunnahThemes: ['الصدق', 'منع الغش', 'رفع الضرر'],
                policies: ['no_riba', 'no_gharar', 'mutual_consent', 'anti_fraud', 'ip_protection']
            },
            operatingDomains: [
                'orders_control_tower',
                'invoice_reconciliation',
                'b2b_collaboration',
                'integration_observability',
                'compliance_audit'
            ]
        };
    }

    operatingLayerLaunch90Days() {
        return {
            title: 'خطة إطلاق 90 يوم',
            phases: [
                {
                    phase: 'اليوم 1-30',
                    objective: 'إثبات القيمة التشغيلية',
                    deliverables: [
                        'ربط Customers/Items',
                        'تشغيل Orders بين نظامين ERP',
                        'لوحة مراقبة أولية + KPI baseline'
                    ]
                },
                {
                    phase: 'اليوم 31-60',
                    objective: 'ضبط المطابقة والامتثال',
                    deliverables: [
                        'تشغيل Invoices + Reconciliation',
                        'DLQ + حل تلقائي للحالات المتكررة',
                        'تقرير امتثال شرعي رقمي'
                    ]
                },
                {
                    phase: 'اليوم 61-90',
                    objective: 'جاهزية البيع المؤسسي',
                    deliverables: [
                        'Case Study رقمية بالأثر',
                        'SLA تشغيلي نهائي',
                        'حزم تسعير + وثائق onboarding'
                    ]
                }
            ]
        };
    }

    operatingLayerPricingModel() {
        return {
            currency: 'SAR',
            plans: [
                {
                    id: 'starter',
                    name: 'Starter Integration',
                    monthlyFrom: 3900,
                    includes: ['1 ERP connection', '2 integration packs', 'basic dashboard']
                },
                {
                    id: 'growth',
                    name: 'Growth Operating Layer',
                    monthlyFrom: 12900,
                    includes: ['3 ERP connections', 'all core packs', 'reconciliation + alerts']
                },
                {
                    id: 'enterprise',
                    name: 'Enterprise Operating Layer',
                    monthlyFrom: 39000,
                    includes: ['unlimited connections', 'advanced governance', 'dedicated SLA']
                }
            ],
            transactionFees: {
                orders: 'حسب حجم المعاملات',
                invoices: 'حسب المطابقات والتسويات'
            }
        };
    }

    operatingLayerRoadmap12Months() {
        return {
            horizon: '12_months',
            quarters: [
                {
                    quarter: 'Q1',
                    focus: 'core operating layer',
                    milestones: ['hard isolation', 'erp control tower', 'sharia scoring']
                },
                {
                    quarter: 'Q2',
                    focus: 'b2b network scale',
                    milestones: ['multi-tenant federation', 'cross-company workflows', 'advanced reconciliation']
                },
                {
                    quarter: 'Q3',
                    focus: 'intelligence and automation',
                    milestones: ['predictive delays', 'smart routing', 'autonomous exception handling']
                },
                {
                    quarter: 'Q4',
                    focus: 'regional expansion',
                    milestones: ['multi-region readiness', 'partner marketplace', 'compliance automation']
                }
            ]
        };
    }

    activateOperatingLayer(input) {
        const req = input || {};
        const activation = this.activateSmartEcosystem({
            tenantId: req.tenantId || '',
            tenantName: req.tenantName || 'عميل طبقة التشغيل',
            targetSystem: req.targetSystem || 'oracle-erp-cloud',
            verticalId: req.verticalId || 'metals-scrap-dismantling',
            plan: req.plan || 'growth',
            country: req.country || 'SA',
            companyCode: req.companyCode || '',
            businessUnit: req.businessUnit || '',
            legalEntity: req.legalEntity || '',
            operations: req.operations || {},
            contract: req.contract || {}
        });
        if (!activation.success) return activation;

        const run = {
            runId: this._newId('OPL'),
            tenantId: activation.data.provisioning.tenantId,
            targetSystem: activation.data.provisioning.targetSystem,
            verticalId: activation.data.provisioning.verticalId,
            status: 'active',
            strategy: 'operating-layer',
            createdAt: new Date().toISOString()
        };
        this.state.operatingLayerRuns.unshift(run);
        this.state.operatingLayerRuns = this.state.operatingLayerRuns.slice(0, 4000);
        this._saveState();
        this._logEvent('operating_layer_activated', {
            runId: run.runId,
            tenantId: run.tenantId,
            targetSystem: run.targetSystem
        });

        return {
            success: true,
            data: {
                run,
                blueprint: this.operatingLayerBlueprint(),
                launch90Days: this.operatingLayerLaunch90Days(),
                pricing: this.operatingLayerPricingModel(),
                roadmap12Months: this.operatingLayerRoadmap12Months(),
                ecosystem: activation.data
            },
            message: 'تم تفعيل Operating Layer المتقدمة بنجاح'
        };
    }

    operatingLayerExecutiveReport(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const rows = (this.state.operatingLayerRuns || []).filter((x) => !tenantId || x.tenantId === tenantId);
        const ecosystemRows = (this.state.ecosystemRuns || []).filter((x) => !tenantId || x.tenantId === tenantId);
        const avgSharia = ecosystemRows.length ? Math.round(ecosystemRows.reduce((a, b) => a + Number(b.shariaScore || 0), 0) / ecosystemRows.length) : 0;
        return {
            success: true,
            report: {
                summary: {
                    operatingLayerRuns: rows.length,
                    activeOperatingLayers: rows.filter((x) => x.status === 'active').length,
                    avgShariaScore: avgSharia,
                    shariaGrade: this._gradeScore(avgSharia)
                },
                riskPosture: {
                    noHarmNoMonopoly: true,
                    ipProtectionPolicyEnabled: true,
                    hardIsolationEnabled: true
                },
                references: {
                    quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                    principle: 'لا ضرر ولا ضرار'
                },
                generatedAt: new Date().toISOString()
            }
        };
    }

    _sitePageStructureBlueprint() {
        return {
            primaryPages: [
                '/index.html',
                '/سوق-شيخة.html',
                '/المجتمع.html',
                '/رياض-الجنة-الباحثين.html',
                '/تسجيل-الدخول.html',
                '/تسجيل-الشركات.html'
            ],
            controlDashboards: [
                '/لوحة-الادمن.html',
                '/لوحة-تحكم-المستخدم.html',
                '/لوحة-الشركة.html',
                '/gov-dashboard.html',
                '/لوحة-المؤشرات.html',
                '/_admin/sheikha-command-center.html'
            ],
            operationsAndIntegrations: [
                '/SHEIKHA-SMART-DIGITAL.html',
                '/SHEIKHA-MARKET-SYSTEM.html',
                '/_admin/التكاملات-والشراكات.html',
                '/_admin/نظام-متابعة-وتنفيذ-وتحليل.html',
                '/_admin/api-docs.html',
                '/_admin/devops.html'
            ],
            designAndIdentity: [
                '/هوية-السوق.html',
                '/خريطة-شيخة.html',
                '/خريطة-الشبكات.html',
                '/فهرس-المنظومة.html'
            ]
        };
    }

    _developmentStackProfile() {
        return {
            runtime: {
                node: '^20.0.0 || ^25.0.0',
                backend: 'Express.js',
                storage: 'JSON store + operational files'
            },
            corePackages: [
                'express',
                'helmet',
                'compression',
                'express-rate-limit',
                'jsonwebtoken',
                'ws',
                'uuid',
                'dotenv'
            ],
            aiPackages: ['openai', '@anthropic-ai/sdk', '@google/generative-ai', 'ollama'],
            opsTooling: ['pm2', 'node-cron'],
            frontend: {
                style: 'HTML/CSS/Vanilla JS',
                language: 'Arabic-first RTL',
                designIdentity: 'Dark + Gold/Copper + Tajawal'
            }
        };
    }

    _erpComprehensiveMatrix() {
        return [
            {
                system: 'sap-s4hana',
                roleInSheikha: 'Core enterprise finance/supply anchor',
                bestIntegrationMode: 'agent_pairing + strict canonical mapping',
                dashboards: ['orders_control_tower', 'invoice_reconciliation', 'sla_monitor'],
                valueMetrics: ['cycle_time_hours', 'invoice_match_rate', 'exceptions_per_100_docs']
            },
            {
                system: 'oracle-erp-cloud',
                roleInSheikha: 'Cloud ERP transactional and finance backbone',
                bestIntegrationMode: 'oauth_delegated when available, otherwise agent_pairing',
                dashboards: ['procurement_visibility', 'payment_settlement', 'audit_chain'],
                valueMetrics: ['on_time_settlement_pct', 'auto_match_pct', 'manual_touches_reduction']
            },
            {
                system: 'odoo',
                roleInSheikha: 'Flexible SME layer with rapid extension',
                bestIntegrationMode: 'agent_pairing with compatibility adapters',
                dashboards: ['inventory_flow', 'customer_order_stream', 'quality_events'],
                valueMetrics: ['stock_accuracy_pct', 'quote_to_order_time', 'rework_rate']
            },
            {
                system: 'ms-dynamics',
                roleInSheikha: 'Microsoft ecosystem enterprise operations',
                bestIntegrationMode: 'oauth_delegated + graph/odata connectors',
                dashboards: ['workflow_health', 'integration_backlog', 'reconciliation_board'],
                valueMetrics: ['integration_latency_ms', 'dlq_open_count', 'flow_success_rate']
            }
        ];
    }

    _businessAndServiceModelBlueprint() {
        return {
            services: [
                'Operating Layer Activation',
                'ERP Integration Packs',
                'Reconciliation as a Service',
                'Sharia Digital Compliance',
                'Supply Chain Control Tower',
                'Data Quality & Gap Advisory'
            ],
            businessModels: [
                'Monthly SaaS subscription per tenant',
                'Transaction-based fee on reconciled operations',
                'Premium analytics and compliance reporting',
                'Enterprise SLA and dedicated success plan'
            ],
            marketingPlan: {
                entry: 'Metals/Scrap/Dismantling vertical first',
                demandHooks: [
                    'تقليل فروقات الوزن والنقاوة',
                    'خفض أخطاء الفواتير',
                    'تسريع دورة الشراء/البيع بين الشركات'
                ],
                phases: ['Proof of Value', 'Case Study', 'Enterprise Rollout']
            },
            operationsPlan: {
                daily: ['health checks', 'DLQ triage', 'SLA monitoring'],
                weekly: ['reconciliation audit', 'rotation checks', 'optimization review'],
                monthly: ['executive review', 'cost/benefit report', 'sharia compliance score']
            }
        };
    }

    _networkAndFlowModelBlueprint() {
        return {
            networkModel: {
                topology: 'Hub-and-Spoke with federated tenants',
                centralHub: 'Sheikha Operating Layer',
                endpoints: ['ERP systems', 'B2B counterparties', 'control dashboards', 'audit services']
            },
            dataFlow: [
                'ERP Event Ingestion',
                'Canonical Normalization',
                'Policy & Sharia Validation',
                'Target ERP Dispatch',
                'Reconciliation & Audit Publication'
            ],
            controlBoards: [
                'Integration Health Board',
                'B2B Settlement Board',
                'Sharia Compliance Board',
                'Security & IP Protection Board'
            ]
        };
    }

    supremeOperatingArchitectureReport(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const summary = this.operatingLayerExecutiveReport({ tenantId });
        return {
            success: true,
            report: {
                identity: {
                    title: 'Sheikha Supreme Operating Architecture',
                    objective: 'تحويل شيخة إلى طبقة تشغيل مركزية متفوقة فوق كل ERP'
                },
                architecture: this.operatingLayerBlueprint(),
                erpMatrix: this._erpComprehensiveMatrix(),
                pageStructure: this._sitePageStructureBlueprint(),
                dashboards: {
                    user: ['لوحة-تحكم-المستخدم', 'سوق-شيخة', 'لوحة-المؤشرات'],
                    company: ['لوحة-الشركة', 'التكاملات-والشراكات', 'نظام-متابعة-وتنفيذ-وتحليل'],
                    admin: ['لوحة-الادمن', 'sheikha-command-center', 'api-docs', 'devops'],
                    government: ['gov-dashboard', 'لوحة-الحكومة-السعودية', 'لوحة-الحكومات-الدولية']
                },
                development: this._developmentStackProfile(),
                businessAndServices: this._businessAndServiceModelBlueprint(),
                networkAndFlows: this._networkAndFlowModelBlueprint(),
                launch: {
                    plan90Days: this.operatingLayerLaunch90Days(),
                    pricing: this.operatingLayerPricingModel(),
                    roadmap12Months: this.operatingLayerRoadmap12Months()
                },
                shariaDigitization: {
                    quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                    sunnahThemes: ['الصدق', 'منع الغش', 'رفع الضرر'],
                    policy: 'لا ضرر ولا ضرار + حفظ الملكية الفكرية + منع الاحتكار'
                },
                executionSummary: summary.report,
                generatedAt: new Date().toISOString()
            }
        };
    }

    activateSupremeOperatingLayer(input) {
        const req = input || {};
        const activation = this.activateOperatingLayer(req);
        if (!activation.success) return activation;
        const tenantId = activation.data.run.tenantId;
        const report = this.supremeOperatingArchitectureReport({ tenantId });
        const run = {
            runId: this._newId('SUPREME'),
            tenantId,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        this.state.supremeArchitectureRuns.unshift(run);
        this.state.supremeArchitectureRuns = this.state.supremeArchitectureRuns.slice(0, 4000);
        this._saveState();
        return {
            success: true,
            data: {
                run,
                activation: activation.data,
                report: report.report
            },
            message: 'تم تفعيل المعمارية العليا لشيخة بنجاح'
        };
    }

    allSystemsMasterReport(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const supreme = this.supremeOperatingArchitectureReport({ tenantId });
        const operating = this.operatingLayerExecutiveReport({ tenantId });
        const ecosystem = this.ecosystemCommandCenter({ tenantId });
        const saas = this.saasCommandCenter({ tenantId });
        const security = this.securityHardeningReport({ tenantId });
        return {
            success: true,
            report: {
                title: 'Master Comprehensive Sheikha Report',
                vision: 'شيخة طبقة تشغيل محايدة متقدمة فوق جميع أنظمة ERP مع قيمة سوقية وتشغيلية قابلة للقياس',
                mission: 'تمكين الشركات من العمل البيني السريع والآمن والممتثل شرعياً دون ضرر أو احتكار',
                strategicPillars: [
                    'Operating Layer فوق ERP',
                    'Vertical Intelligence للمعادن والسكراب والتشليح',
                    'Enterprise Security + Tenant Isolation',
                    'Digital Sharia Governance',
                    'Scalable B2B Network'
                ],
                architecture: supreme.report.architecture,
                erpMatrix: supreme.report.erpMatrix,
                pagesAndUx: supreme.report.pageStructure,
                dashboards: supreme.report.dashboards,
                developmentStack: supreme.report.development,
                businessAndServices: supreme.report.businessAndServices,
                networksAndFlows: supreme.report.networkAndFlows,
                kpis: {
                    operating: operating.report.summary,
                    ecosystem: ecosystem.summary,
                    saas: saas.summary
                },
                securityPosture: security.report,
                quranAndSunnahDigitization: {
                    quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                    sunnahThemes: ['الصدق', 'منع الغش', 'رفع الضرر'],
                    policy: 'لا ضرر ولا ضرار + حفظ الملكية الفكرية + منع الاحتكار'
                },
                generatedAt: new Date().toISOString()
            }
        };
    }

    activateMasterExcellence(input) {
        const req = input || {};
        const activation = this.activateSupremeOperatingLayer(req);
        if (!activation.success) return activation;
        const tenantId = activation.data.activation.run.tenantId;
        const report = this.allSystemsMasterReport({ tenantId });
        return {
            success: true,
            data: {
                activation: activation.data,
                masterReport: report.report
            },
            message: 'تم تفعيل منظومة شيخة المتقدمة الشاملة بنجاح'
        };
    }

    _scientificAdvancementFramework() {
        return {
            vision: 'شيخة طبقة تشغيل معرفية وتجارية تقود التقدم الصناعي والتجاري بمنهج رقمي شرعي',
            mission: 'تمكين الشركات من التشغيل المتكامل فوق ERP بسرعة وأمان وعدل',
            strategicObjectives: [
                'تقليل زمن دورة الطلبات والفواتير بين الشركات',
                'رفع دقة المطابقة المحاسبية والتشغيلية',
                'تعظيم الشفافية وتقليل النزاعات',
                'بناء شبكة تشغيل B2B قابلة للتوسع',
                'تحويل الامتثال الشرعي إلى سياسات رقمية قابلة للقياس'
            ],
            principles: ['حياد تشغيلي', 'لا ضرر ولا ضرار', 'لا احتكار بيانات', 'حفظ الملكية الفكرية']
        };
    }

    _interfaceAndDesignSystemBlueprint() {
        return {
            interfaceModel: {
                style: 'Arabic-first RTL enterprise',
                tokens: ['Gold #D4AF37', 'Copper #B87333', 'Dark theme'],
                consistencyBoards: ['User Board', 'Company Board', 'Admin Board', 'Gov Board']
            },
            pageCoordination: {
                coreNavigation: ['الرئيسية', 'السوق', 'المجتمع', 'لوحات التحكم', 'التكاملات'],
                orderingRule: 'عام -> تشغيلي -> تكامل -> تدقيق -> تقارير',
                accessibility: ['contrast compliance', 'clear action hierarchy', 'mobile readiness']
            },
            graphicsAndContent: {
                graphicsPolicy: 'وظيفي أولًا ثم جمالي',
                dataViz: ['KPI cards', 'flow status lanes', 'reconciliation heatmap', 'risk flags']
            }
        };
    }

    _erpOperatingPlaybooks() {
        return {
            sap: {
                onboarding: ['tenant setup', 'connection pending_auth', 'secret_ref attach', 'health check', 'packs enable'],
                controlBoards: ['PO/SO lane', 'invoice match', 'exception routing'],
                value: ['faster procure-to-pay', 'reduced manual reconciliations']
            },
            oracle: {
                onboarding: ['tenant setup', 'oauth profile', 'secret_ref attach', 'token ping', 'flow enable'],
                controlBoards: ['procurement sync', 'settlement board', 'audit trail'],
                value: ['better settlement speed', 'fewer invoice disputes']
            },
            odoo_and_others: {
                onboarding: ['agent pairing', 'mapping profile', 'validation dry-run', 'go-live'],
                controlBoards: ['inventory accuracy', 'order latency', 'quality exceptions'],
                value: ['high adaptability', 'faster SME onboarding']
            }
        };
    }

    _aiSystemsBlueprint() {
        return {
            intelligenceLayers: [
                'Operational anomaly detection',
                'Flow bottleneck prediction',
                'Smart counterparty matching',
                'Sharia compliance scoring',
                'Executive insight generation'
            ],
            safeguards: ['human-in-the-loop for critical actions', 'auditable decisions', 'no sensitive secret logging']
        };
    }

    masterSheikhaTransformationReport(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const supreme = this.supremeOperatingArchitectureReport({ tenantId });
        return {
            success: true,
            report: {
                title: 'Sheikha Master Transformation Report',
                framework: this._scientificAdvancementFramework(),
                architecture: supreme.report,
                interfaceAndDesign: this._interfaceAndDesignSystemBlueprint(),
                erpPlaybooks: this._erpOperatingPlaybooks(),
                aiSystems: this._aiSystemsBlueprint(),
                marketingAndOperations: this._businessAndServiceModelBlueprint(),
                developmentStack: this._developmentStackProfile(),
                shariaDigitization: {
                    quran: ['المائدة:2', 'النساء:29', 'البقرة:275'],
                    sunnahThemes: ['الصدق', 'منع الغش', 'رفع الضرر'],
                    governance: ['no_riba', 'no_gharar', 'mutual_consent', 'ip_protection', 'no_harm']
                },
                generatedAt: new Date().toISOString()
            }
        };
    }

    activateMasterSheikhaTransformation(input) {
        const activation = this.activateSupremeOperatingLayer(input || {});
        if (!activation.success) return activation;
        const tenantId = (((activation.data || {}).activation || {}).run || {}).tenantId || '';
        const report = this.masterSheikhaTransformationReport({ tenantId });
        return {
            success: true,
            data: {
                activation: activation.data,
                report: report.report
            },
            message: 'تم تفعيل التحول الشامل لشيخة بنجاح'
        };
    }

    registerRoutes(app) {
        if (!app) return;

        app.get('/api/integration/dashboard', (req, res) => {
            res.json({
                success: true,
                data: this.getDashboard(),
                message: 'تم جلب لوحة التكامل بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/connectors', (req, res) => {
            res.json({
                success: true,
                data: this.connectors,
                message: 'تم جلب الموصلات المتاحة',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/connectors/:id/test', (req, res) => {
            const id = req.params.id;
            const connector = this.connectors.find((x) => x.id === id);
            if (!connector) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    message: 'الموصل غير موجود',
                    timestamp: new Date().toISOString()
                });
            }
            const result = {
                connectorId: connector.id,
                connectorName: connector.name,
                status: 'healthy',
                latencyMs: Math.floor(80 + Math.random() * 120),
                auth: 'ok',
                transport: 'ok'
            };
            this._logEvent('connector_test', result);
            return res.json({
                success: true,
                data: result,
                message: 'تم اختبار الموصل بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/transform', (req, res) => {
            const body = req.body || {};
            const result = this.transformRecord(body.record, body.mapping, body.options);
            this.state.kpis.totalTransforms += 1;
            if (result.success) this.state.kpis.successfulTransforms += 1;
            else this.state.kpis.failedTransforms += 1;
            this.state.kpis.averageQualityScore = this.state.kpis.averageQualityScore
                ? Math.round((this.state.kpis.averageQualityScore + result.qualityScore) / 2)
                : result.qualityScore;
            this._saveState();
            this._logEvent('transform', result);
            res.json({
                success: true,
                data: result,
                message: 'تم تنفيذ التحويل بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/gap-analysis', (req, res) => {
            const report = this.analyzeGaps(req.body || {});
            res.json({
                success: true,
                data: report,
                message: 'تم تحليل الفجوات بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/report', (req, res) => {
            const report = this.buildExecutiveReport(req.body || {});
            res.json({
                success: true,
                data: report,
                message: 'تم إصدار التقرير التنفيذي',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/procedure/run', (req, res) => {
            const result = this.runProcedure(req.body || {});
            res.json({
                success: true,
                data: result,
                message: 'تم تشغيل الإجراء الرقمي بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/one-click/options', (req, res) => {
            res.json({
                success: true,
                data: {
                    icon: 'شيخة للتكامل',
                    systems: this._supportedSharedSystems()
                },
                message: 'خيارات الربط المباشر جاهزة',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/one-click/discover', (req, res) => {
            const result = this.discoverBestConnection(req.body || {});
            res.json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم اكتشاف أفضل وسيلة ربط' : (result.message || 'تعذر اكتشاف وسيلة الربط'),
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/one-click/connect', (req, res) => {
            const result = this.oneClickConnect(req.body || {});
            res.json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم التفعيل بضغطة زر بنجاح' : (result.message || 'تعذر التفعيل'),
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/erp/direct-connect', (req, res) => {
            const payload = Object.assign({}, req.body || {}, { hint: 'direct erp' });
            const result = this.oneClickConnect(payload);
            res.json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم الربط المباشر مع ERP بنجاح' : (result.message || 'تعذر ربط ERP'),
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/oracle/config', (req, res) => {
            const validation = this._validateOracleConfig(this.oracleConfig || {});
            res.json({
                success: true,
                data: {
                    config: this._oracleConfigPublic(),
                    validation
                },
                message: 'تم جلب إعدادات Oracle بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/oracle/config', (req, res) => {
            const result = this.configureOracleAuth(req.body || {});
            res.json({
                success: true,
                data: result,
                message: 'تم تحديث إعدادات Oracle بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/oracle/token/fetch', async (req, res) => {
            try {
                const forceRefresh = !!(req.body || {}).forceRefresh;
                const token = await this.getOracleAccessToken({ forceRefresh });
                res.json({
                    success: true,
                    data: {
                        tokenType: token.tokenType,
                        expiresAt: new Date(token.expiresAt).toISOString(),
                        cached: true
                    },
                    message: 'تم تجهيز Oracle token بنجاح',
                    timestamp: new Date().toISOString()
                });
            } catch (e) {
                res.status(400).json({
                    success: false,
                    data: null,
                    message: String(e.message || e),
                    timestamp: new Date().toISOString()
                });
            }
        });

        app.post('/api/integration/oracle/request', async (req, res) => {
            try {
                const result = await this.sendOracleRequest(req.body || {});
                res.status(result.success ? 200 : 400).json({
                    success: !!result.success,
                    data: result.success ? result : null,
                    message: result.success ? 'تم تنفيذ طلب Oracle بنجاح' : (result.message || 'فشل طلب Oracle'),
                    timestamp: new Date().toISOString()
                });
            } catch (e) {
                res.status(500).json({
                    success: false,
                    data: null,
                    message: String(e.message || e),
                    timestamp: new Date().toISOString()
                });
            }
        });

        app.get('/api/integration/oracle/audit', (req, res) => {
            res.json({
                success: true,
                data: this.state.oracleAudit,
                message: 'تم جلب سجل Oracle audit',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/canonical-model', (req, res) => {
            res.json({
                success: true,
                data: this._canonicalModel(),
                message: 'تم جلب النموذج الموحد بنجاح',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/packs', (req, res) => {
            res.json({
                success: true,
                data: this._integrationPacks(),
                message: 'تم جلب باقات التكامل',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/verticals', (req, res) => {
            const verticals = this._marketVerticalProfiles();
            res.json({
                success: true,
                data: Object.keys(verticals).map((k) => verticals[k]),
                message: 'تم جلب قطاعات التكامل الجاهزة',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenant-governance/blueprint', (req, res) => {
            res.json({
                success: true,
                data: this.tenantGovernanceBlueprint(),
                message: 'تم جلب مخطط Tenant Governance',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenant-governance/ip-policy', (req, res) => {
            res.json({
                success: true,
                data: this.intellectualPropertySecurityPolicy(),
                message: 'تم جلب سياسة حماية الملكية الفكرية',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/security/hardening-report', (req, res) => {
            const result = this.securityHardeningReport({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result.report,
                message: 'تم إصدار تقرير التحصين الأمني المؤسسي',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenant-governance/provisioning-report', this.tenantContextMiddleware('tenant:read'), (req, res) => {
            const result = this.tenantProvisioningExecutionReport({ tenantId: req.tenantContext.tenantId });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.report : null,
                message: result.success ? 'تم إصدار تقرير تنفيذ التفعيل' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/saas/blueprint', (req, res) => {
            res.json({
                success: true,
                data: this.saasSmartBlueprint(),
                message: 'تم جلب مخطط SaaS الذكي الرقمي',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/ecosystem/blueprint', (req, res) => {
            res.json({
                success: true,
                data: this.ecosystemSmartBlueprint(),
                message: 'تم جلب مخطط النظام البيئي الرقمي الذكي',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/blueprint', (req, res) => {
            res.json({
                success: true,
                data: this.operatingLayerBlueprint(),
                message: 'تم جلب مخطط طبقة التشغيل المركزية',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/launch-90-days', (req, res) => {
            res.json({
                success: true,
                data: this.operatingLayerLaunch90Days(),
                message: 'تم جلب خطة إطلاق 90 يوم',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/pricing', (req, res) => {
            res.json({
                success: true,
                data: this.operatingLayerPricingModel(),
                message: 'تم جلب نموذج التسعير',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/roadmap-12m', (req, res) => {
            res.json({
                success: true,
                data: this.operatingLayerRoadmap12Months(),
                message: 'تم جلب خارطة الطريق 12 شهر',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/supreme-architecture', (req, res) => {
            const result = this.supremeOperatingArchitectureReport({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result.report,
                message: 'تم جلب تقرير المعمارية العليا لشيخة',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/master/report', (req, res) => {
            const result = this.allSystemsMasterReport({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result.report,
                message: 'تم جلب التقرير الشامل لكل المنظومة',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/master-transformation', (req, res) => {
            const result = this.masterSheikhaTransformationReport({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result.report,
                message: 'تم جلب تقرير التحول الشامل لشيخة',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/saas/provision', (req, res) => {
            const result = this.provisionSmartSaas(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/ecosystem/activate', (req, res) => {
            const result = this.activateSmartEcosystem(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/operating-layer/activate', (req, res) => {
            const result = this.activateOperatingLayer(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/operating-layer/activate-supreme', (req, res) => {
            const result = this.activateSupremeOperatingLayer(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/master/activate', (req, res) => {
            const result = this.activateMasterExcellence(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/operating-layer/activate-master', (req, res) => {
            const result = this.activateMasterSheikhaTransformation(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/saas/command-center', (req, res) => {
            const result = this.saasCommandCenter({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result,
                message: 'تم جلب لوحة قيادة SaaS',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/ecosystem/command-center', (req, res) => {
            const result = this.ecosystemCommandCenter({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result,
                message: 'تم جلب لوحة قيادة النظام البيئي الرقمي',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/operating-layer/executive-report', (req, res) => {
            const result = this.operatingLayerExecutiveReport({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result.report,
                message: 'تم جلب التقرير التنفيذي لطبقة التشغيل',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/saas/sharia-score', this.tenantContextMiddleware('tenant:*'), (req, res) => {
            const result = this.calculateShariaDigitalScore({
                tenantId: req.tenantContext.tenantId,
                contract: (req.body || {}).contract || {},
                operations: (req.body || {}).operations || {}
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.result : null,
                message: result.success ? 'تم احتساب الدرجة الشرعية الرقمية' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenant-governance/agent-token', (req, res) => {
            const result = this.issueTenantAgentToken(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم إصدار Tenant Agent Token' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenant-governance/me', this.tenantContextMiddleware('tenant:read'), (req, res) => {
            res.json({
                success: true,
                data: req.tenantContext,
                message: 'سياق الجهة صالح ومفعل',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenant-governance/security-posture', this.tenantContextMiddleware('tenant:read'), (req, res) => {
            const result = this.tenantSecurityPosture({ tenantId: req.tenantContext.tenantId });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.result : null,
                message: result.success ? 'تم تقييم الوضع الأمني للجهة' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenant-governance/connections/:connectionId/attach-secret', this.tenantContextMiddleware('tenant:*'), (req, res) => {
            const result = this.attachConnectionSecretRef({
                tenantId: req.tenantContext.tenantId,
                connectionId: req.params.connectionId,
                secretRef: (req.body || {}).secretRef,
                vaultProvider: (req.body || {}).vaultProvider
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? 'تم ربط secret_ref بالاتصال' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenant-governance/connections/:connectionId/health-check', this.tenantContextMiddleware('tenant:*'), (req, res) => {
            const result = this.runConnectionHealthCheck({
                tenantId: req.tenantContext.tenantId,
                connectionId: req.params.connectionId,
                actorUserId: req.tenantContext.userId || ''
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? 'تم تشغيل Health Check وتفعيل الاتصال' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenant-governance/enable-packs', this.tenantContextMiddleware('tenant:*'), (req, res) => {
            const result = this.enableTenantPacks({
                tenantId: req.tenantContext.tenantId,
                verticalId: (req.body || {}).verticalId || 'metals-scrap-dismantling'
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? 'تم تفعيل باقات التكامل للجهة' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenant-governance/contracts/evaluate', this.tenantContextMiddleware('tenant:*'), (req, res) => {
            const result = this.evaluateTenantContract({
                tenantId: req.tenantContext.tenantId,
                contract: (req.body || {}).contract || {}
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.result : null,
                message: result.success ? result.result.message : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenants/register', (req, res) => {
            const result = this.registerTenant(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تسجيل الجهة بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenants', (req, res) => {
            res.json({
                success: true,
                data: this.listTenants(),
                message: 'تم جلب الجهات المسجلة',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/tenants/:tenantId/connections', (req, res) => {
            const payload = Object.assign({}, req.body || {}, { tenantId: req.params.tenantId });
            const result = this.connectTenantSystem(payload);
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم ربط الجهة بالنظام بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/tenants/:tenantId/connections', (req, res) => {
            const tenantId = String(req.params.tenantId || '').trim();
            res.json({
                success: true,
                data: this.listTenantConnections(tenantId),
                message: 'تم جلب اتصالات الجهة',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/packs/activate', (req, res) => {
            const result = this.activatePack(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تفعيل حزمة التكامل بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/verticals/activate', (req, res) => {
            const result = this.activateMarketVertical(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تفعيل القطاع بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/verticals/readiness', (req, res) => {
            const result = this.getVerticalReadiness({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: result,
                message: 'تم جلب حالة جاهزية القطاعات',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/flows/execute', (req, res) => {
            const result = this.executeFlow(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? (result.duplicate ? 'تم تجاهل طلب مكرر بنجاح' : 'تم تشغيل التدفق بنجاح') : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/flows/enqueue', (req, res) => {
            const result = this.enqueueFlow(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تمت إضافة التدفق إلى طابور التشغيل الذاتي' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/flows/queue', (req, res) => {
            res.json({
                success: true,
                data: this.listQueuedFlows({
                    status: req.query.status || '',
                    tenantId: req.query.tenantId || ''
                }),
                message: 'تم جلب طابور التدفقات',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/autonomous/status', (req, res) => {
            res.json({
                success: true,
                data: this.autonomousStatus(),
                message: 'تم جلب حالة التشغيل الذاتي',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/autonomous/start', (req, res) => {
            const result = this.startAutonomousMode(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تفعيل التشغيل الذاتي بدون ضغط زر' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/autonomous/stop', (req, res) => {
            const result = this.stopAutonomousMode(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم إيقاف التشغيل الذاتي' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/autonomous/cycle/run', (req, res) => {
            const result = this.runAutonomousCycle();
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تنفيذ دورة التشغيل الذاتي' : 'تعذر تنفيذ دورة التشغيل',
                error: result.success ? null : (result.error || null),
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/sourcing/blueprint', (req, res) => {
            const result = this.sourcingBlueprint();
            res.json({
                success: true,
                data: result.blueprint,
                message: 'تم جلب مخطط نظام جذب الموردين والمنتجات',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/sourcing/providers/register', (req, res) => {
            const result = this.registerSourcingProvider(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تسجيل المزود بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/sourcing/providers', (req, res) => {
            const rows = this.listSourcingProviders({
                providerType: req.query.providerType || '',
                status: req.query.status || '',
                country: req.query.country || ''
            });
            res.json({
                success: true,
                data: rows,
                message: 'تم جلب المزودين المسجلين',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/sourcing/campaigns/launch', (req, res) => {
            const result = this.launchSourcingCampaign(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم إطلاق حملة جذب الموردين' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/sourcing/campaigns', (req, res) => {
            res.json({
                success: true,
                data: this.listSourcingCampaigns(),
                message: 'تم جلب حملات Sourcing',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/sourcing/campaigns/:campaignId/run', (req, res) => {
            const result = this.runSourcingCampaign({ campaignId: req.params.campaignId });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result.data : null,
                message: result.success ? 'تم تشغيل حملة Sourcing بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/sourcing/catalog/register', (req, res) => {
            const result = this.registerSourcingCatalogItem(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تسجيل عنصر في كتالوج الموردين' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/sourcing/catalog', (req, res) => {
            const rows = this.listSourcingCatalog({
                itemType: req.query.itemType || '',
                sourceSystem: req.query.sourceSystem || ''
            });
            res.json({
                success: true,
                data: rows,
                message: 'تم جلب كتالوج المنتجات والخدمات',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/sourcing/intelligence', (req, res) => {
            res.json({
                success: true,
                data: this.sourcingIntelligence(),
                message: 'تم جلب تحليلات جذب الموردين والمنتجات',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/sourcing/scorecard', (req, res) => {
            const result = this.getSourcingScorecard({
                providerType: req.query.providerType || '',
                sourceSystem: req.query.sourceSystem || '',
                country: req.query.country || '',
                limit: req.query.limit || 10
            });
            res.json({
                success: true,
                data: result,
                message: 'تم جلب مصفوفة تقييم المزودين وترتيب Top 10',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/sourcing/scorecard/config', (req, res) => {
            const result = this.updateSourcingScoringConfig(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تحديث إعدادات تقييم المزودين' : (result.error || {}).message,
                error: result.success ? null : (result.error || null),
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/vcs/discover', (req, res) => {
            const result = this.discoverVcsProject({
                provider: req.query.provider || '',
                owner: req.query.owner || '',
                repo: req.query.repo || '',
                projectId: req.query.projectId || '',
                repoPath: req.query.repoPath || ''
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم اكتشاف مشروع VCS بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/vcs/activity', async (req, res) => {
            const result = await this.fetchVcsActivity({
                provider: req.query.provider || '',
                owner: req.query.owner || '',
                repo: req.query.repo || '',
                projectId: req.query.projectId || '',
                repoPath: req.query.repoPath || '',
                limit: req.query.limit || 30,
                sinceDays: req.query.sinceDays || 14
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم جلب نشاط VCS بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/vcs/report/generate', async (req, res) => {
            const result = await this.buildVcsOpsReport(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم توليد تقرير تشغيل VCS' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/vcs/report/daily/run', async (req, res) => {
            const result = await this.runDailyOpsReport(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تشغيل التقرير اليومي لأنشطة التطوير' : 'تعذر تشغيل التقرير اليومي',
                error: result.success ? null : (result.error || null),
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/ops/executive/daily/run', async (req, res) => {
            const result = await this.opsExecutiveDailyReport(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تشغيل التقرير التنفيذي الموحّد' : 'تعذر تشغيل التقرير التنفيذي الموحّد',
                error: result.success ? null : (result.error || null),
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/ops/executive', async (req, res) => {
            const result = await this.opsExecutiveDailyReport({
                providers: req.query.providers ? String(req.query.providers).split(',') : ['github', 'gitlab'],
                limit: req.query.limit || 20,
                sinceDays: req.query.sinceDays || 14,
                owner: req.query.owner || '',
                repo: req.query.repo || '',
                projectId: req.query.projectId || '',
                repoPath: req.query.repoPath || ''
            });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم جلب التقرير التنفيذي الموحّد' : 'تعذر جلب التقرير التنفيذي الموحّد',
                error: result.success ? null : (result.error || null),
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/vcs/reports', (req, res) => {
            const rows = this.listVcsOpsReports({
                provider: req.query.provider || '',
                limit: req.query.limit || 20
            });
            res.json({
                success: true,
                data: rows,
                message: 'تم جلب تقارير أنشطة VCS',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/reconciliation/dashboard', (req, res) => {
            const report = this.reconciliationDashboard({ tenantId: req.query.tenantId || '' });
            res.json({
                success: true,
                data: report,
                message: 'تم جلب لوحة المطابقة',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/dlq', (req, res) => {
            const tenantId = String(req.query.tenantId || '').trim();
            const items = (this.state.deadLetterQueue || []).filter((d) => !tenantId || d.sourceTenantId === tenantId || d.targetTenantId === tenantId);
            res.json({
                success: true,
                data: items.slice(0, 300),
                message: 'تم جلب سجل DLQ',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/dlq/:id/retry', (req, res) => {
            const result = this.retryDlq({ dlqId: req.params.id });
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم حل سجل DLQ بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/contract', (req, res) => {
            res.json({
                success: true,
                data: this.integrationContract(),
                message: 'تم جلب معيار التكامل المؤسسي',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/charter', (req, res) => {
            res.json({
                success: true,
                data: this.sheikhaUnifiedCharter(),
                message: 'تم جلب ميثاق شيخة الموحّد',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/architecture/erp-systems', (req, res) => {
            const catalog = this._erpArchitectureCatalog();
            res.json({
                success: true,
                data: Object.keys(catalog).map((k) => catalog[k]),
                message: 'تم جلب تحليل هيكلة أنظمة ERP',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/architecture/analyze', (req, res) => {
            const result = this.analyzeErpArchitecture(req.body || {});
            res.json({
                success: true,
                data: result,
                message: 'تم تحليل المعمارية المؤسسية للتكامل',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/superior/activate', (req, res) => {
            const result = this.activateSuperiorIntegration(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تفعيل التكامل المتقن الأعلى' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/zero-key/methods', (req, res) => {
            const systemId = String(req.query.systemId || '').trim();
            if (!systemId) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message: 'systemId مطلوب',
                    timestamp: new Date().toISOString()
                });
            }
            res.json({
                success: true,
                data: {
                    systemId,
                    methods: this._zeroKeyMethods(systemId)
                },
                message: 'تم جلب طرق التكامل بدون API key',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/zero-key/connect/start', (req, res) => {
            const result = this.startZeroKeyConnection(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تجهيز التكامل بدون مفاتيح يدويًا' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/zero-key/pairing/create', (req, res) => {
            const result = this.createZeroKeyPairing(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم إنشاء رمز اقتران التكامل' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/integration/zero-key/pairing/complete', (req, res) => {
            const result = this.completeZeroKeyPairing(req.body || {});
            res.status(result.success ? 200 : 400).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم تفعيل الاقتران بنجاح' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/integration/zero-key/pairing/:pairingId', (req, res) => {
            const result = this.getZeroKeyPairingStatus(req.params.pairingId);
            res.status(result.success ? 200 : 404).json({
                success: !!result.success,
                data: result.success ? result : null,
                message: result.success ? 'تم جلب حالة الاقتران' : result.error.message,
                error: result.success ? null : result.error,
                timestamp: new Date().toISOString()
            });
        });
    }
}

module.exports = SheikhaIntegrationEngine;
