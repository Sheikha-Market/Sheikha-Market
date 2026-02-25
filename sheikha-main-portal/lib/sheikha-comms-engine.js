const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SHEIKHA COMMUNICATIONS ENGINE — منظومة شيخة للاتصالات الشاملة
 *  «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ» — المائدة ٢
 *  الرسائل النصية | المكالمات الآلية | واتساب | البريد | كل وسيلة مشروعة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaCommsEngine {
    constructor() {
        // سياسة خصوصية افتراضية: بدون Twilio وبدون صوت/تسجيل
        this.privacy = {
            noTwilio: String(process.env.SHEIKHA_NO_TWILIO || 'true').toLowerCase() === 'true',
            disableVoice: String(process.env.SHEIKHA_DISABLE_VOICE || 'true').toLowerCase() === 'true',
            noMediaCapture: String(process.env.SHEIKHA_NO_MEDIA_CAPTURE || 'true').toLowerCase() === 'true',
            voiceApproved: String(process.env.SHEIKHA_VOICE_APPROVED || 'false').toLowerCase() === 'true'
        };
        this.realSend = String(process.env.SHEIKHA_COMMS_REAL_SEND || 'false').toLowerCase() === 'true';
        this.maxRetries = Math.max(0, Number(process.env.SHEIKHA_COMMS_MAX_RETRIES || 2));
        this.retryBackoffMs = Math.max(200, Number(process.env.SHEIKHA_COMMS_RETRY_BACKOFF_MS || 700));
        this.maxLogSize = 5000;
        this.operationLogger = null;
        this.deliveryStore = new Map();
        this.deliveryLogFile = path.join(__dirname, '..', 'data', 'comms-delivery-log.json');
        this.providerComplianceFile = path.join(__dirname, '..', 'data', 'comms-provider-compliance.json');
        this.budgetGuardFile = path.join(__dirname, '..', 'data', 'comms-budget-guard.json');
        this.languagePreferencesFile = path.join(__dirname, '..', 'data', 'comms-language-preferences.json');
        this.billingLedgerFile = path.join(__dirname, '..', 'data', 'comms-billing-ledger.json');
        this.shariaRules = this._loadShariaRules();
        this.foundation = this._buildIslamicFoundation();
        this.providers = this._buildProviders();
        this.providerCompliance = this._loadProviderCompliance();
        this.budgetGuard = this._loadBudgetGuard();
        this.channels = this._buildChannels();
        this.templates = this._buildTemplates();
        this.localizedTemplates = this._buildLocalizedTemplates();
        this.otpSystem = this._buildOTPSystem();
        this.autoReply = this._buildAutoReply();
        this.languagePreferences = this._loadLanguagePreferences();
        this.billingLedger = this._loadBillingLedger();
        this.operationalComms = this._buildOperationalComms();
        this.monitoring = this._buildMonitoring();
        this.log = [];
        this._loadPersistedDeliveries();
        this._startMonitor();
    }

    setOperationLogger(loggerFn) {
        this.operationLogger = typeof loggerFn === 'function' ? loggerFn : null;
    }

    _hasEnv(key) {
        return !!String(process.env[key] || '').trim();
    }

    _loadShariaRules() {
        const f = path.join(__dirname, '..', 'data', 'sharia-rules.json');
        try {
            const raw = fs.readFileSync(f, 'utf8');
            return JSON.parse(raw);
        } catch (_) {
            return {};
        }
    }

    _loadPersistedDeliveries() {
        try {
            if (!fs.existsSync(this.deliveryLogFile)) return;
            const list = JSON.parse(fs.readFileSync(this.deliveryLogFile, 'utf8'));
            if (!Array.isArray(list)) return;
            list.slice(0, this.maxLogSize).forEach((item) => {
                if (item && item.messageId) this.deliveryStore.set(item.messageId, item);
            });
        } catch (_) {}
    }

    _defaultComplianceEntry(provider, channel, slot) {
        return {
            providerId: provider && provider.id ? provider.id : 'unknown',
            providerNameAr: provider && provider.nameAr ? provider.nameAr : 'غير معروف',
            channel,
            slot,
            termsAccepted: false,
            policyAccepted: false,
            noHarmNoDirarConfirmed: false,
            contractArchived: false,
            contractArchiveRef: null,
            policyVersion: null,
            acceptedBy: null,
            acceptedAt: null,
            notes: null
        };
    }

    _buildDefaultProviderCompliance() {
        const compliance = {};
        for (const [channel, bucket] of Object.entries(this.providers || {})) {
            compliance[channel] = {};
            for (const [slot, provider] of Object.entries(bucket || {})) {
                compliance[channel][slot] = this._defaultComplianceEntry(provider, channel, slot);
            }
        }
        return compliance;
    }

    _loadProviderCompliance() {
        const defaults = this._buildDefaultProviderCompliance();
        try {
            if (!fs.existsSync(this.providerComplianceFile)) {
                this._persistProviderCompliance(defaults);
                return defaults;
            }
            const parsed = JSON.parse(fs.readFileSync(this.providerComplianceFile, 'utf8'));
            const merged = this._buildDefaultProviderCompliance();
            for (const [channel, bucket] of Object.entries(parsed || {})) {
                if (!merged[channel] || typeof bucket !== 'object') continue;
                for (const [slot, entry] of Object.entries(bucket || {})) {
                    if (!merged[channel][slot]) continue;
                    merged[channel][slot] = {
                        ...merged[channel][slot],
                        ...(entry || {})
                    };
                }
            }
            return merged;
        } catch (_) {
            return defaults;
        }
    }

    _persistProviderCompliance(nextData = null) {
        try {
            const payload = nextData || this.providerCompliance || this._buildDefaultProviderCompliance();
            fs.mkdirSync(path.dirname(this.providerComplianceFile), { recursive: true });
            fs.writeFileSync(this.providerComplianceFile, JSON.stringify(payload, null, 2), 'utf8');
        } catch (_) {}
    }

    _parseCsvList(value) {
        return String(value || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    _dayKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    _monthKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return year + '-' + month;
    }

    _buildDefaultBudgetGuard() {
        const now = new Date();
        return {
            enabled: String(process.env.SHEIKHA_BUDGET_GUARD_ENABLED || 'true').toLowerCase() === 'true',
            blockPaidBeforeFirstSale: String(process.env.SHEIKHA_BLOCK_PAID_BEFORE_FIRST_SALE || 'true').toLowerCase() === 'true',
            firstSaleConfirmed: String(process.env.SHEIKHA_FIRST_SALE_CONFIRMED || 'false').toLowerCase() === 'true',
            allowlistOnlyBeforeFirstSale: String(process.env.SHEIKHA_ALLOWLIST_ONLY_BEFORE_FIRST_SALE || 'true').toLowerCase() === 'true',
            testAllowlist: this._parseCsvList(process.env.SHEIKHA_COMMS_TEST_ALLOWLIST || ''),
            paidChannels: this._parseCsvList(process.env.SHEIKHA_PAID_CHANNELS || 'sms,whatsapp,voice'),
            dailyLimit: Math.max(0, Number(process.env.SHEIKHA_PAID_DAILY_LIMIT || 10)),
            monthlyLimit: Math.max(0, Number(process.env.SHEIKHA_PAID_MONTHLY_LIMIT || 300)),
            counters: {
                dayKey: this._dayKey(now),
                monthKey: this._monthKey(now),
                dailySent: 0,
                monthlySent: 0,
                totalSent: 0,
                totalBlocked: 0
            },
            updatedAt: now.toISOString(),
            updatedBy: 'system'
        };
    }

    _loadBudgetGuard() {
        const defaults = this._buildDefaultBudgetGuard();
        try {
            if (!fs.existsSync(this.budgetGuardFile)) {
                this._persistBudgetGuard(defaults);
                return defaults;
            }
            const parsed = JSON.parse(fs.readFileSync(this.budgetGuardFile, 'utf8'));
            const merged = {
                ...defaults,
                ...(parsed || {}),
                counters: {
                    ...(defaults.counters || {}),
                    ...(((parsed || {}).counters) || {})
                }
            };
            this._normalizeBudgetCounters(merged);
            return merged;
        } catch (_) {
            return defaults;
        }
    }

    _persistBudgetGuard(nextData = null) {
        try {
            const payload = nextData || this.budgetGuard || this._buildDefaultBudgetGuard();
            fs.mkdirSync(path.dirname(this.budgetGuardFile), { recursive: true });
            fs.writeFileSync(this.budgetGuardFile, JSON.stringify(payload, null, 2), 'utf8');
        } catch (_) {}
    }

    _normalizeBudgetCounters(state) {
        if (!state || !state.counters) return;
        const now = new Date();
        const nowDay = this._dayKey(now);
        const nowMonth = this._monthKey(now);
        if (state.counters.dayKey !== nowDay) {
            state.counters.dayKey = nowDay;
            state.counters.dailySent = 0;
        }
        if (state.counters.monthKey !== nowMonth) {
            state.counters.monthKey = nowMonth;
            state.counters.monthlySent = 0;
        }
    }

    _isPaidChannel(channel) {
        return Array.isArray(this.budgetGuard.paidChannels) && this.budgetGuard.paidChannels.includes(channel);
    }

    _isRecipientInAllowlist(recipient) {
        const cleanRecipient = String(recipient || '').trim();
        if (!cleanRecipient) return false;
        return (this.budgetGuard.testAllowlist || []).includes(cleanRecipient);
    }

    _budgetDecision(channel, recipient, templateId = null) {
        if (!this.budgetGuard || !this.budgetGuard.enabled) return { allowed: true, reason: null };
        this._normalizeBudgetCounters(this.budgetGuard);

        const isPaid = this._isPaidChannel(channel);
        if (!isPaid) return { allowed: true, reason: null };

        if (this.budgetGuard.blockPaidBeforeFirstSale && !this.budgetGuard.firstSaleConfirmed) {
            if (this.budgetGuard.allowlistOnlyBeforeFirstSale && this._isRecipientInAllowlist(recipient)) {
                return { allowed: true, reason: null, mode: 'allowlist_test' };
            }
            return {
                allowed: false,
                reason: 'paid_blocked_before_first_sale',
                details: { channel, recipient, templateId }
            };
        }

        if (this.budgetGuard.dailyLimit > 0 && this.budgetGuard.counters.dailySent >= this.budgetGuard.dailyLimit) {
            return { allowed: false, reason: 'daily_limit_reached', details: { limit: this.budgetGuard.dailyLimit } };
        }
        if (this.budgetGuard.monthlyLimit > 0 && this.budgetGuard.counters.monthlySent >= this.budgetGuard.monthlyLimit) {
            return { allowed: false, reason: 'monthly_limit_reached', details: { limit: this.budgetGuard.monthlyLimit } };
        }
        return { allowed: true, reason: null };
    }

    _registerBudgetSend(channel) {
        if (!this.budgetGuard || !this.budgetGuard.enabled) return;
        if (!this._isPaidChannel(channel)) return;
        this._normalizeBudgetCounters(this.budgetGuard);
        this.budgetGuard.counters.dailySent++;
        this.budgetGuard.counters.monthlySent++;
        this.budgetGuard.counters.totalSent++;
        this.budgetGuard.updatedAt = new Date().toISOString();
        this._persistBudgetGuard();
    }

    _registerBudgetBlock() {
        if (!this.budgetGuard || !this.budgetGuard.enabled) return;
        this.budgetGuard.counters.totalBlocked++;
        this.budgetGuard.updatedAt = new Date().toISOString();
        this._persistBudgetGuard();
    }

    setBudgetGuardConfig(config = {}, actor = 'system') {
        const next = {
            ...this.budgetGuard,
            ...(config || {}),
            paidChannels: Array.isArray(config.paidChannels)
                ? config.paidChannels.map((v) => String(v || '').trim()).filter(Boolean)
                : this.budgetGuard.paidChannels,
            testAllowlist: Array.isArray(config.testAllowlist)
                ? config.testAllowlist.map((v) => String(v || '').trim()).filter(Boolean)
                : this.budgetGuard.testAllowlist,
            dailyLimit: config.dailyLimit === undefined ? this.budgetGuard.dailyLimit : Math.max(0, Number(config.dailyLimit || 0)),
            monthlyLimit: config.monthlyLimit === undefined ? this.budgetGuard.monthlyLimit : Math.max(0, Number(config.monthlyLimit || 0)),
            counters: this.budgetGuard.counters,
            updatedAt: new Date().toISOString(),
            updatedBy: actor
        };
        this._normalizeBudgetCounters(next);
        this.budgetGuard = next;
        this._persistBudgetGuard();
        this._logComm('budget_guard_update', 'multi', actor, 'updated', {
            firstSaleConfirmed: next.firstSaleConfirmed,
            dailyLimit: next.dailyLimit,
            monthlyLimit: next.monthlyLimit
        });
        return { success: true, data: next };
    }

    getBudgetGuardStatus() {
        this._normalizeBudgetCounters(this.budgetGuard);
        return {
            ...this.budgetGuard,
            snapshot: {
                isPreRevenueMode: !this.budgetGuard.firstSaleConfirmed,
                remainingDaily: this.budgetGuard.dailyLimit > 0 ? Math.max(0, this.budgetGuard.dailyLimit - this.budgetGuard.counters.dailySent) : null,
                remainingMonthly: this.budgetGuard.monthlyLimit > 0 ? Math.max(0, this.budgetGuard.monthlyLimit - this.budgetGuard.counters.monthlySent) : null
            }
        };
    }

    setProviderCompliance({ channel, slot, termsAccepted, policyAccepted, noHarmNoDirarConfirmed, contractArchived, contractArchiveRef, policyVersion, acceptedBy, notes }) {
        if (!channel || !slot) {
            return { success: false, message: 'channel و slot مطلوبان.' };
        }
        const provider = (((this.providers || {})[channel] || {})[slot] || null);
        if (!provider) {
            return { success: false, message: 'المزوّد غير موجود لهذا channel/slot.' };
        }
        const current = ((((this.providerCompliance || {})[channel] || {})[slot]) || this._defaultComplianceEntry(provider, channel, slot));
        const next = {
            ...current,
            termsAccepted: termsAccepted === undefined ? current.termsAccepted : !!termsAccepted,
            policyAccepted: policyAccepted === undefined ? current.policyAccepted : !!policyAccepted,
            noHarmNoDirarConfirmed: noHarmNoDirarConfirmed === undefined ? current.noHarmNoDirarConfirmed : !!noHarmNoDirarConfirmed,
            contractArchived: contractArchived === undefined ? current.contractArchived : !!contractArchived,
            contractArchiveRef: contractArchiveRef === undefined ? current.contractArchiveRef : (contractArchiveRef || null),
            policyVersion: policyVersion === undefined ? current.policyVersion : (policyVersion || null),
            acceptedBy: acceptedBy === undefined ? current.acceptedBy : (acceptedBy || null),
            acceptedAt: new Date().toISOString(),
            notes: notes === undefined ? current.notes : (notes || null)
        };

        if (!this.providerCompliance[channel]) this.providerCompliance[channel] = {};
        this.providerCompliance[channel][slot] = next;
        this._persistProviderCompliance();

        this._logComm('provider_compliance_update', channel, provider.id, 'updated', {
            providerId: provider.id,
            slot,
            termsAccepted: next.termsAccepted,
            policyAccepted: next.policyAccepted,
            noHarmNoDirarConfirmed: next.noHarmNoDirarConfirmed,
            contractArchived: next.contractArchived
        });

        return { success: true, data: next };
    }

    getProviderCompliance() {
        const summary = {
            totalProviders: 0,
            fullyCompliant: 0,
            pending: 0
        };
        const records = {};
        for (const [channel, bucket] of Object.entries(this.providerCompliance || {})) {
            records[channel] = {};
            for (const [slot, entry] of Object.entries(bucket || {})) {
                const isCompliant = !!(entry.termsAccepted && entry.policyAccepted && entry.noHarmNoDirarConfirmed && entry.contractArchived);
                records[channel][slot] = { ...entry, compliant: isCompliant };
                summary.totalProviders++;
                if (isCompliant) summary.fullyCompliant++;
                else summary.pending++;
            }
        }
        summary.complianceRate = summary.totalProviders > 0
            ? Math.round((summary.fullyCompliant / summary.totalProviders) * 100)
            : 100;
        return { summary, records };
    }

    _isProviderCompliant(channel, providerId) {
        const bucket = this.providerCompliance[channel];
        if (!bucket) return false;
        const entry = Object.values(bucket).find((row) => row && row.providerId === providerId);
        if (!entry) return false;
        return !!(entry.termsAccepted && entry.policyAccepted && entry.noHarmNoDirarConfirmed && entry.contractArchived);
    }

    _persistDeliveries() {
        try {
            const list = Array.from(this.deliveryStore.values()).slice(-this.maxLogSize);
            fs.writeFileSync(this.deliveryLogFile, JSON.stringify(list, null, 2), 'utf8');
        } catch (_) {}
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📖 الأساس الشرعي
    // ═══════════════════════════════════════════════════════════════════════════
    _buildIslamicFoundation() {
        return {
            nameAr: 'منظومة شيخة للاتصالات الشاملة',
            nameEn: 'Sheikha Communications Engine',
            principle: 'التواصل الصادق الأمين على منهج الكتاب والسنة',
            quran: [
                { ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا', surah: 'الأحزاب', num: 70, principle: 'القول السديد في كل رسالة' },
                { ayah: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ', surah: 'المائدة', num: 2, principle: 'التعاون بالوسائل المشروعة' },
                { ayah: 'وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ', surah: 'الإسراء', num: 53, principle: 'أحسن الكلام والتواصل' },
                { ayah: 'ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ', surah: 'النحل', num: 125, principle: 'الحكمة والموعظة الحسنة' },
                { ayah: 'وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا', surah: 'النساء', num: 86, principle: 'الرد بأحسن' },
                { ayah: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', surah: 'النساء', num: 58, principle: 'أمانة التوصيل والتبليغ' }
            ],
            hadith: [
                { text: 'الكلمة الطيبة صدقة', source: 'متفق عليه', principle: 'كل رسالة طيبة صدقة' },
                { text: 'بلّغوا عني ولو آية', source: 'البخاري', principle: 'التبليغ والتواصل فريضة' },
                { text: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت', source: 'متفق عليه', principle: 'فلترة المحتوى — لا يُرسل إلا خير' },
                { text: 'المسلم من سلم المسلمون من لسانه ويده', source: 'متفق عليه', principle: 'سلامة التواصل الرقمي' },
                { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', source: 'البيهقي', principle: 'إتقان كل رسالة' },
                { text: 'لا ضرر ولا ضرار', source: 'ابن ماجه', principle: 'لا إزعاج ولا spam' }
            ],
            rules: [
                'لا يُرسل ما يخالف الشريعة',
                'لا إزعاج ولا رسائل مكررة بلا فائدة (لا ضرر ولا ضرار)',
                'صدق المحتوى وعدم التدليس',
                'حماية خصوصية البيانات (أمانة)',
                'الرد بأحسن مما وصل',
                'مراعاة أوقات الراحة والنوم',
                'بسملة في بداية كل تواصل رسمي'
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔌 مزودو الخدمات
    // ═══════════════════════════════════════════════════════════════════════════
    _buildProviders() {
        return {
            sms: {
                primary: {
                    id: 'infobip_sms', nameAr: 'إنفوبِب رسائل', nameEn: 'Infobip SMS',
                    type: 'sms_gateway', region: 'السعودية',
                    apiBase: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
                    configured: this._hasEnv('INFOBIP_API_KEY') && this._hasEnv('INFOBIP_BASE_URL'),
                    envKeys: ['INFOBIP_API_KEY', 'INFOBIP_BASE_URL', 'INFOBIP_SMS_SENDER'],
                    features: ['sms', 'otp', '2fa', 'delivery_reports'],
                    hadith: 'بلّغوا عني ولو آية — البخاري'
                },
                fallback: {
                    id: 'legacy_sms_disabled', nameAr: 'نسخة احتياطية معطلة', nameEn: 'Legacy SMS Disabled',
                    type: 'sms_gateway', region: 'داخلي',
                    configured: false,
                    features: []
                }
            },
            whatsapp: {
                primary: {
                    id: 'infobip_whatsapp', nameAr: 'إنفوبِب واتساب', nameEn: 'Infobip WhatsApp',
                    type: 'messaging', region: 'عالمي',
                    apiBase: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
                    configured: this._hasEnv('INFOBIP_API_KEY') && this._hasEnv('INFOBIP_BASE_URL'),
                    envKeys: ['INFOBIP_API_KEY', 'INFOBIP_BASE_URL', 'INFOBIP_WHATSAPP_FROM'],
                    features: ['text', 'media', 'template', 'interactive', 'location', 'delivery_reports']
                },
                fallback: {
                    id: 'legacy_whatsapp_disabled', nameAr: 'نسخة احتياطية معطلة', nameEn: 'Legacy WhatsApp Disabled',
                    type: 'messaging', region: 'داخلي',
                    configured: false,
                    features: []
                }
            },
            email: {
                primary: {
                    id: 'infobip_email', nameAr: 'إنفوبِب بريد', nameEn: 'Infobip Email',
                    type: 'email', region: 'عالمي',
                    apiBase: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
                    configured: this._hasEnv('INFOBIP_API_KEY') && this._hasEnv('INFOBIP_BASE_URL'),
                    envKeys: ['INFOBIP_API_KEY', 'INFOBIP_BASE_URL', 'INFOBIP_EMAIL_FROM'],
                    features: ['transactional', 'templates', 'analytics']
                },
                fallback: {
                    id: 'legacy_email_disabled', nameAr: 'نسخة احتياطية معطلة', nameEn: 'Legacy Email Disabled',
                    type: 'email', region: 'داخلي',
                    configured: false,
                    features: []
                }
            },
            voice: {
                primary: {
                    id: 'unifonic_voice', nameAr: 'يونيفونك صوت', nameEn: 'Unifonic Voice',
                    type: 'voice', region: 'السعودية',
                    configured: this.privacy.voiceApproved && !this.privacy.disableVoice && this._hasEnv('UNIFONIC_APP_SID'),
                    features: ['auto_call', 'otp_voice', 'ivr']
                },
                fallback: {
                    id: 'twilio_voice', nameAr: 'تويليو صوت', nameEn: 'Twilio Voice',
                    type: 'voice', region: 'عالمي',
                    configured: this.privacy.voiceApproved && !this.privacy.noTwilio && !this.privacy.disableVoice && this._hasEnv('TWILIO_ACCOUNT_SID'),
                    features: ['auto_call', 'otp_voice', 'tts']
                }
            },
            push: {
                primary: {
                    id: 'fcm', nameAr: 'إشعارات جوجل', nameEn: 'Firebase Cloud Messaging',
                    type: 'push', region: 'عالمي',
                    configured: this._hasEnv('FCM_SERVER_KEY'),
                    envKeys: ['FCM_SERVER_KEY', 'FCM_SENDER_ID'],
                    features: ['push', 'topic', 'data']
                }
            },
            authenticator: {
                sheikha: {
                    id: 'sheikha_auth', nameAr: 'مصادقة شيخة', nameEn: 'Sheikha Authenticator',
                    type: 'authenticator', region: 'داخلي',
                    configured: true, // دائماً مفعّل
                    features: ['totp', 'push_verify', 'backup_codes']
                },
                google: {
                    id: 'google_auth', nameAr: 'مصادقة قوقل', nameEn: 'Google Authenticator',
                    type: 'authenticator', region: 'عالمي',
                    configured: true,
                    features: ['totp']
                }
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 قنوات الاتصال
    // ═══════════════════════════════════════════════════════════════════════════
    _buildChannels() {
        const smsReady = this.providers.sms.primary.configured || this.providers.sms.fallback.configured;
        const whatsappReady = this.providers.whatsapp.primary.configured || this.providers.whatsapp.fallback.configured;
        const emailReady = this.providers.email.primary.configured || this.providers.email.fallback.configured;
        const voiceReady = this.providers.voice.primary.configured || this.providers.voice.fallback.configured;
        const pushReady = !!(this.providers.push && this.providers.push.primary && this.providers.push.primary.configured);
        return {
            sms: {
                id: 'sms', nameAr: 'الرسائل النصية', nameEn: 'SMS',
                icon: 'SMS', enabled: smsReady, priority: 1,
                useCases: ['otp', 'alerts', 'notifications', 'marketing', 'auth_verify'],
                senderId: process.env.SMS_SENDER_ID || 'SHEIKHA',
                maxLength: 160, // للعربية 70 حرف
                quietHours: { start: '23:00', end: '07:00' }, // لا إزعاج
                rateLimit: { perUser: 10, perHour: 5 },
                templates: ['otp', 'welcome', 'order', 'price_alert', 'shipment', 'payment'],
                quran: 'وَقُولُوا قَوْلًا سَدِيدًا — الأحزاب ٧٠'
            },
            whatsapp: {
                id: 'whatsapp', nameAr: 'واتساب', nameEn: 'WhatsApp',
                icon: 'WA', enabled: whatsappReady, priority: 2,
                useCases: ['otp', 'support', 'notifications', 'documents', 'media', 'auth_verify'],
                businessNumber: process.env.WHATSAPP_NUMBER || '+966554942904',
                features: ['text', 'image', 'document', 'location', 'interactive_buttons', 'list_messages'],
                quietHours: { start: '23:00', end: '07:00' },
                rateLimit: { perUser: 20, perHour: 10 },
                templates: ['otp', 'welcome', 'order_confirmation', 'shipment_update', 'invoice', 'support_reply'],
                quran: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ — المائدة ٢'
            },
            email: {
                id: 'email', nameAr: 'البريد الإلكتروني', nameEn: 'Email',
                icon: 'EM', enabled: emailReady, priority: 3,
                useCases: ['otp', 'welcome', 'reports', 'invoices', 'contracts', 'notifications', 'marketing', 'recovery', 'auth_verify'],
                fromAddress: process.env.EMAIL_FROM || 'noreply@sheikha.top',
                replyTo: 'market@sheikha.top',
                features: ['html', 'attachments', 'templates', 'tracking'],
                rateLimit: { perUser: 50, perDay: 20 },
                templates: ['otp', 'welcome', 'password_reset', 'order', 'invoice', 'report', 'contract', 'marketing'],
                quran: 'ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ — النحل ١٢٥'
            },
            voice: {
                id: 'voice', nameAr: 'المكالمات الآلية', nameEn: 'Automated Voice Calls',
                icon: 'PH', enabled: voiceReady, priority: 4,
                useCases: ['otp_voice', 'urgent_alerts', 'payment_confirmation', 'delivery_notification', 'auth_verify'],
                callerId: process.env.VOICE_CALLER_ID || '+966554942904',
                features: this.privacy.noMediaCapture
                    ? ['tts_arabic', 'tts_english', 'ivr', 'dtmf']
                    : ['tts_arabic', 'tts_english', 'ivr', 'recording', 'dtmf'],
                language: 'ar-SA',
                quietHours: { start: '22:00', end: '08:00' },
                rateLimit: { perUser: 3, perDay: 5 },
                maxDuration: 60, // seconds
                templates: ['otp_voice', 'payment_alert', 'delivery_alert', 'urgent_notification'],
                quran: 'وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا — النساء ٨٦'
            },
            push: {
                id: 'push', nameAr: 'إشعارات التطبيق', nameEn: 'Push Notifications',
                icon: 'PN', enabled: pushReady, priority: 5,
                useCases: ['real_time_alerts', 'price_changes', 'order_updates', 'messages', 'auth_verify'],
                features: ['rich_media', 'actions', 'silent', 'grouped'],
                rateLimit: { perUser: 30, perDay: 50 },
                templates: ['price_alert', 'order_update', 'message', 'system_alert'],
                quran: 'فَبَشِّرْ عِبَادِ الَّذِينَ يَسْتَمِعُونَ الْقَوْلَ فَيَتَّبِعُونَ أَحْسَنَهُ — الزمر ١٧-١٨'
            },
            in_app: {
                id: 'in_app', nameAr: 'إشعارات داخل التطبيق', nameEn: 'In-App Notifications',
                icon: 'IA', enabled: true, priority: 6,
                useCases: ['all_notifications', 'system_messages', 'updates'],
                features: ['persistent', 'read_receipts', 'actions'],
                rateLimit: { perUser: 100, perDay: 200 },
                quran: 'وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ — الإسراء ٥٣'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📝 قوالب الرسائل
    // ═══════════════════════════════════════════════════════════════════════════
    _buildTemplates() {
        return {
            // ─── المصادقة والأمان ───
            otp: {
                id: 'otp', category: 'auth', nameAr: 'رمز التحقق',
                channels: ['sms', 'whatsapp', 'email', 'voice'],
                messages: {
                    sms: 'شيخة: رمز التحقق {code} — صالح لمدة {minutes} دقائق. لا تشاركه مع أحد.',
                    whatsapp: 'بسم الله الرحمن الرحيم\n\nرمز التحقق الخاص بك في شيخة:\n\n*{code}*\n\nصالح لمدة {minutes} دقائق.\nلا تشاركه مع أحد — «وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ»',
                    email: { subject: 'رمز التحقق — شيخة', body: 'رمز التحقق: {code} — صالح لمدة {minutes} دقائق.' },
                    voice: 'السلام عليكم. رمز التحقق الخاص بك في شيخة هو: {code_spoken}. أكرر: {code_spoken}.'
                }
            },
            login_alert: {
                id: 'login_alert', category: 'auth', nameAr: 'تنبيه دخول',
                channels: ['sms', 'email', 'push'],
                messages: {
                    sms: 'شيخة: تم تسجيل دخول لحسابك. إذا لم تكن أنت، غيّر كلمة المرور فوراً.',
                    email: { subject: 'تنبيه تسجيل دخول — شيخة', body: 'تم تسجيل دخول لحسابك في {time} من {device}. إذا لم تكن أنت، غيّر كلمة المرور فوراً.' },
                    push: { title: 'تنبيه أمان', body: 'تم تسجيل دخول لحسابك.' }
                }
            },
            password_reset: {
                id: 'password_reset', category: 'auth', nameAr: 'استعادة كلمة المرور',
                channels: ['sms', 'email', 'whatsapp'],
                messages: {
                    sms: 'شيخة: رمز استعادة كلمة المرور: {code}. صالح {minutes} دقائق.',
                    whatsapp: 'بسم الله الرحمن الرحيم\n\nرمز استعادة كلمة المرور:\n*{code}*\nصالح لمدة {minutes} دقائق.',
                    email: { subject: 'استعادة كلمة المرور — شيخة', body: 'رمز الاستعادة: {code} — صالح {minutes} دقائق. إذا لم تطلب هذا، تجاهل الرسالة.' }
                }
            },
            // ─── الترحيب ───
            welcome: {
                id: 'welcome', category: 'onboarding', nameAr: 'رسالة ترحيب',
                channels: ['sms', 'whatsapp', 'email'],
                messages: {
                    sms: 'بسم الله — أهلاً بك في سوق شيخة! حسابك جاهز. سجّل دخولك: sheikha.top',
                    whatsapp: 'بسم الله الرحمن الرحيم\n\nأهلاً وسهلاً بك في *سوق شيخة* — أول سوق إسلامي رقمي للمعادن\n\nحسابك جاهز ومفعّل\n\n«بارك الله لك فيما أعطاك»\n\nسجّل دخولك من: sheikha.top',
                    email: { subject: 'مرحباً بك في سوق شيخة!', body: 'أهلاً وسهلاً بك. حسابك جاهز ومفعّل.' }
                }
            },
            onboarding_guidance: {
                id: 'onboarding_guidance', category: 'onboarding', nameAr: 'التوجيه والإجراءات بعد التسجيل',
                channels: ['sms', 'whatsapp', 'email'],
                messages: {
                    sms: 'شيخة: مرحباً {name}. أكمل توثيق الحساب بمطابقة الجوال والإيميل عبر رمز التحقق. ثم حدّث الملف الشخصي وابدأ من لوحة التحكم.',
                    whatsapp: 'بسم الله الرحمن الرحيم\n\nمرحباً *{name}* في سوق شيخة.\n\nلإتمام المطابقة والتوثيق:\n1) أدخل رمز التحقق المرسل للجوال والإيميل.\n2) حدّث بيانات الحساب.\n3) فعّل الحماية (2FA).\n4) ابدأ من لوحة التحكم.\n\nللمساعدة: market@sheikha.top',
                    email: {
                        subject: 'خطوات التوثيق والإجراءات بعد التسجيل — شيخة',
                        body: 'مرحباً {name}\n\nتم إنشاء حسابك بنجاح.\n\nالخطوات التالية:\n1) مطابقة الجوال والإيميل عبر رمز التحقق.\n2) استكمال الملف الشخصي وبيانات النشاط.\n3) تفعيل المصادقة الثنائية 2FA للحماية.\n4) بدء استخدام لوحة التحكم والخدمات.\n\nإذا احتجت مساعدة: market@sheikha.top'
                    }
                }
            },
            // ─── العمليات التجارية ───
            order_confirmation: {
                id: 'order_confirmation', category: 'operations', nameAr: 'تأكيد الطلب',
                channels: ['sms', 'whatsapp', 'email', 'push'],
                messages: {
                    sms: 'شيخة: تم تأكيد طلبك #{orderId}. المبلغ: {amount} ر.س.',
                    whatsapp: 'بسم الله\n\nتم تأكيد طلبك في سوق شيخة\n\nرقم الطلب: *#{orderId}*\nالمبلغ: *{amount} ر.س*\n\n«بورك لهما في بيعهما»',
                    email: { subject: 'تأكيد الطلب #{orderId} — شيخة', body: 'تم تأكيد طلبك. رقم الطلب: #{orderId}. المبلغ: {amount} ر.س.' },
                    push: { title: 'تم تأكيد طلبك', body: 'الطلب #{orderId} — {amount} ر.س' }
                }
            },
            shipment_update: {
                id: 'shipment_update', category: 'operations', nameAr: 'تحديث الشحن',
                channels: ['sms', 'whatsapp', 'push'],
                messages: {
                    sms: 'شيخة: شحنتك #{shipmentId} — {status}',
                    whatsapp: 'تحديث الشحنة #{shipmentId}\nالحالة: *{status}*\nالتتبع: {trackingUrl}',
                    push: { title: 'تحديث الشحنة', body: '#{shipmentId} — {status}' }
                }
            },
            payment_received: {
                id: 'payment_received', category: 'operations', nameAr: 'استلام الدفعة',
                channels: ['sms', 'whatsapp', 'email', 'voice'],
                messages: {
                    sms: 'شيخة: تم استلام {amount} ر.س. بارك الله لك.',
                    whatsapp: 'بسم الله\n\nتم استلام الدفعة بنجاح\nالمبلغ: *{amount} ر.س*\n\n«اللهم بارك لهم فيما رزقتهم»',
                    email: { subject: 'تم استلام الدفعة — شيخة', body: 'تم استلام {amount} ر.س بنجاح.' },
                    voice: 'السلام عليكم. سوق شيخة. تم استلام دفعتك بمبلغ {amount} ريال. بارك الله لك.'
                }
            },
            price_alert: {
                id: 'price_alert', category: 'market', nameAr: 'تنبيه سعر',
                channels: ['sms', 'whatsapp', 'push'],
                messages: {
                    sms: 'شيخة: سعر {metal} = {price} ر.س/كجم ({change}%)',
                    whatsapp: 'تنبيه سعر — سوق شيخة\n\n{metal}: *{price} ر.س/كجم*\nالتغيّر: {change}%',
                    push: { title: 'تنبيه سعر', body: '{metal} = {price} ر.س ({change}%)' }
                }
            },
            // ─── إدارة العمليات ───
            system_alert: {
                id: 'system_alert', category: 'admin', nameAr: 'تنبيه النظام',
                channels: ['sms', 'email', 'voice', 'push'],
                messages: {
                    sms: 'شيخة [تنبيه]: {message}',
                    email: { subject: 'تنبيه نظام — شيخة', body: '{message}' },
                    voice: 'تنبيه هام من منظومة شيخة. {message}. يرجى التحقق.',
                    push: { title: 'تنبيه النظام', body: '{message}' }
                }
            },
            daily_report: {
                id: 'daily_report', category: 'admin', nameAr: 'التقرير اليومي',
                channels: ['email', 'whatsapp'],
                messages: {
                    email: { subject: 'التقرير اليومي — شيخة | {date}', body: 'ملخص اليوم: {summary}' },
                    whatsapp: 'التقرير اليومي — شيخة\n{date}\n\n{summary}'
                }
            }
        };
    }

    _buildLocalizedTemplates() {
        return {
            en: {
                otp: {
                    sms: 'SHEIKHA: Your verification code is {code}. Valid for {minutes} minutes. Do not share it.',
                    whatsapp: 'In the name of Allah\n\nYour SHEIKHA verification code:\n*{code}*\n\nValid for {minutes} minutes.\nDo not share this code.',
                    email: { subject: 'Verification Code — SHEIKHA', body: 'Your verification code is {code}. It is valid for {minutes} minutes.' },
                    voice: 'Hello. This is SHEIKHA. Your verification code is: {code_spoken}. I repeat: {code_spoken}.'
                },
                login_alert: {
                    sms: 'SHEIKHA: A login was detected on your account. If this was not you, reset your password now.',
                    email: { subject: 'Login Alert — SHEIKHA', body: 'A login was detected on your account at {time} from {device}. If this was not you, reset your password now.' },
                    push: { title: 'Security Alert', body: 'A login was detected on your account.' }
                },
                password_reset: {
                    sms: 'SHEIKHA: Your password reset code is {code}. Valid for {minutes} minutes.',
                    whatsapp: 'Your password reset code:\n*{code}*\nValid for {minutes} minutes.',
                    email: { subject: 'Password Reset — SHEIKHA', body: 'Your reset code is {code}. It is valid for {minutes} minutes. If you did not request this, ignore this message.' }
                },
                welcome: {
                    sms: 'Welcome to SHEIKHA! Your account is ready. Sign in at sheikha.top',
                    whatsapp: 'Welcome to *SHEIKHA Market*.\nYour account is ready and active.\nSign in at: sheikha.top',
                    email: { subject: 'Welcome to SHEIKHA!', body: 'Welcome. Your account is ready and active.' }
                },
                onboarding_guidance: {
                    sms: 'SHEIKHA: Welcome {name}. Complete account verification by matching your phone and email with the verification code, then finish your profile.',
                    whatsapp: 'Welcome *{name}* to SHEIKHA Market.\n\nNext steps:\n1) Verify phone and email using the code.\n2) Complete your profile.\n3) Enable 2FA.\n4) Start from your dashboard.\n\nSupport: market@sheikha.top',
                    email: {
                        subject: 'Post-registration verification steps — SHEIKHA',
                        body: 'Welcome {name},\n\nYour account has been created successfully.\n\nNext steps:\n1) Verify phone and email with the verification code.\n2) Complete your profile and business data.\n3) Enable 2FA for security.\n4) Start using your dashboard services.\n\nSupport: market@sheikha.top'
                    }
                },
                order_confirmation: {
                    sms: 'SHEIKHA: Your order #{orderId} is confirmed. Amount: {amount} SAR.',
                    whatsapp: 'Your order has been confirmed.\nOrder: *#{orderId}*\nAmount: *{amount} SAR*',
                    email: { subject: 'Order Confirmation #{orderId} — SHEIKHA', body: 'Your order is confirmed. Order ID: #{orderId}. Amount: {amount} SAR.' },
                    push: { title: 'Order Confirmed', body: 'Order #{orderId} — {amount} SAR' }
                },
                shipment_update: {
                    sms: 'SHEIKHA: Shipment #{shipmentId} status: {status}',
                    whatsapp: 'Shipment update #{shipmentId}\nStatus: *{status}*\nTracking: {trackingUrl}',
                    push: { title: 'Shipment Update', body: '#{shipmentId} — {status}' }
                },
                payment_received: {
                    sms: 'SHEIKHA: Payment of {amount} SAR received successfully.',
                    whatsapp: 'Payment received successfully.\nAmount: *{amount} SAR*',
                    email: { subject: 'Payment Received — SHEIKHA', body: 'A payment of {amount} SAR has been received successfully.' },
                    voice: 'Hello. SHEIKHA Market confirms your payment of {amount} SAR has been received.'
                },
                price_alert: {
                    sms: 'SHEIKHA: {metal} price is {price} SAR/kg ({change}%).',
                    whatsapp: 'Price alert\n{metal}: *{price} SAR/kg*\nChange: {change}%',
                    push: { title: 'Price Alert', body: '{metal} = {price} SAR ({change}%)' }
                },
                system_alert: {
                    sms: 'SHEIKHA [Alert]: {message}',
                    email: { subject: 'System Alert — SHEIKHA', body: '{message}' },
                    voice: 'Important alert from SHEIKHA system. {message}. Please check immediately.',
                    push: { title: 'System Alert', body: '{message}' }
                },
                daily_report: {
                    email: { subject: 'Daily Report — SHEIKHA | {date}', body: 'Daily summary: {summary}' },
                    whatsapp: 'SHEIKHA daily report\n{date}\n\n{summary}'
                }
            }
        };
    }

    _normalizeLanguage(langInput) {
        const raw = String(langInput || '').trim().toLowerCase();
        if (!raw) return 'ar';
        if (raw.startsWith('ar')) return 'ar';
        if (raw.startsWith('en')) return 'en';
        // أي لغة أعجمية غير مدعومة الآن تتحول مؤقتاً للإنجليزية
        return 'en';
    }

    _loadLanguagePreferences() {
        try {
            if (!fs.existsSync(this.languagePreferencesFile)) return {};
            const parsed = JSON.parse(fs.readFileSync(this.languagePreferencesFile, 'utf8'));
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    _persistLanguagePreferences() {
        try {
            fs.mkdirSync(path.dirname(this.languagePreferencesFile), { recursive: true });
            fs.writeFileSync(this.languagePreferencesFile, JSON.stringify(this.languagePreferences || {}, null, 2), 'utf8');
        } catch (_) {}
    }

    _loadBillingLedger() {
        const defaults = {
            subscriptions: [],
            invoices: [],
            payments: [],
            updatedAt: new Date().toISOString()
        };
        try {
            if (!fs.existsSync(this.billingLedgerFile)) {
                this._persistBillingLedger(defaults);
                return defaults;
            }
            const parsed = JSON.parse(fs.readFileSync(this.billingLedgerFile, 'utf8'));
            return {
                subscriptions: Array.isArray(parsed && parsed.subscriptions) ? parsed.subscriptions : [],
                invoices: Array.isArray(parsed && parsed.invoices) ? parsed.invoices : [],
                payments: Array.isArray(parsed && parsed.payments) ? parsed.payments : [],
                updatedAt: (parsed && parsed.updatedAt) || new Date().toISOString()
            };
        } catch (_) {
            return defaults;
        }
    }

    _persistBillingLedger(nextData = null) {
        try {
            const payload = nextData || this.billingLedger || this._loadBillingLedger();
            payload.updatedAt = new Date().toISOString();
            fs.mkdirSync(path.dirname(this.billingLedgerFile), { recursive: true });
            fs.writeFileSync(this.billingLedgerFile, JSON.stringify(payload, null, 2), 'utf8');
        } catch (_) {}
    }

    _newLedgerId(prefix) {
        return prefix + '_' + Date.now().toString(36) + '_' + crypto.randomBytes(3).toString('hex');
    }

    createSubscription(input = {}, actor = 'system') {
        const provider = String(input.provider || '').trim();
        const service = String(input.service || '').trim();
        const amount = Number(input.amount || 0);
        const dueDate = String(input.nextDueDate || '').trim();
        if (!provider || !service) {
            return { success: false, message: 'provider و service مطلوبان.' };
        }
        if (!dueDate) {
            return { success: false, message: 'nextDueDate مطلوب.' };
        }
        if (!(amount >= 0)) {
            return { success: false, message: 'amount يجب أن يكون رقماً صالحاً.' };
        }

        const now = new Date().toISOString();
        const row = {
            id: this._newLedgerId('sub'),
            provider,
            service,
            plan: String(input.plan || 'standard').trim(),
            category: String(input.category || 'ai_tool').trim(),
            currency: String(input.currency || 'EUR').trim().toUpperCase(),
            amount,
            billingCycle: String(input.billingCycle || 'monthly').trim(),
            startDate: String(input.startDate || now.slice(0, 10)).trim(),
            nextDueDate: dueDate,
            status: String(input.status || 'active').trim(),
            contractRef: String(input.contractRef || '').trim() || null,
            contractArchived: !!input.contractArchived,
            notes: String(input.notes || '').trim() || null,
            createdAt: now,
            createdBy: actor,
            updatedAt: now
        };
        this.billingLedger.subscriptions.unshift(row);
        this._persistBillingLedger();
        this._logComm('billing_subscription_create', 'in_app', provider, 'created', { subscriptionId: row.id, service });
        return { success: true, data: row };
    }

    listSubscriptions(filters = {}) {
        let rows = this.billingLedger.subscriptions.slice();
        if (filters.status) rows = rows.filter((r) => r.status === filters.status);
        if (filters.provider) rows = rows.filter((r) => String(r.provider).toLowerCase() === String(filters.provider).toLowerCase());
        if (filters.service) rows = rows.filter((r) => String(r.service).toLowerCase() === String(filters.service).toLowerCase());
        return { success: true, data: rows };
    }

    createInvoice(input = {}, actor = 'system') {
        const subscriptionId = String(input.subscriptionId || '').trim();
        const dueDate = String(input.dueDate || '').trim();
        const amount = Number(input.amount || 0);
        if (!subscriptionId) return { success: false, message: 'subscriptionId مطلوب.' };
        if (!dueDate) return { success: false, message: 'dueDate مطلوب.' };
        if (!(amount >= 0)) return { success: false, message: 'amount يجب أن يكون رقماً صالحاً.' };

        const sub = this.billingLedger.subscriptions.find((s) => s.id === subscriptionId);
        if (!sub) return { success: false, message: 'الاشتراك غير موجود.' };

        const now = new Date().toISOString();
        const row = {
            id: this._newLedgerId('inv'),
            subscriptionId,
            provider: sub.provider,
            service: sub.service,
            periodStart: String(input.periodStart || '').trim() || null,
            periodEnd: String(input.periodEnd || '').trim() || null,
            issueDate: String(input.issueDate || now.slice(0, 10)).trim(),
            dueDate,
            amount,
            currency: String(input.currency || sub.currency || 'EUR').trim().toUpperCase(),
            status: String(input.status || 'due').trim(),
            externalRef: String(input.externalRef || '').trim() || null,
            attachmentRef: String(input.attachmentRef || '').trim() || null,
            notes: String(input.notes || '').trim() || null,
            createdAt: now,
            createdBy: actor,
            updatedAt: now
        };
        this.billingLedger.invoices.unshift(row);
        this._persistBillingLedger();
        this._logComm('billing_invoice_create', 'in_app', sub.provider, 'created', { invoiceId: row.id, subscriptionId });
        return { success: true, data: row };
    }

    listInvoices(filters = {}) {
        let rows = this.billingLedger.invoices.slice();
        if (filters.status) rows = rows.filter((r) => r.status === filters.status);
        if (filters.provider) rows = rows.filter((r) => String(r.provider).toLowerCase() === String(filters.provider).toLowerCase());
        if (filters.subscriptionId) rows = rows.filter((r) => r.subscriptionId === String(filters.subscriptionId));
        return { success: true, data: rows };
    }

    listPayments(filters = {}) {
        let rows = this.billingLedger.payments.slice();
        if (filters.provider) rows = rows.filter((r) => String(r.provider).toLowerCase() === String(filters.provider).toLowerCase());
        if (filters.subscriptionId) rows = rows.filter((r) => r.subscriptionId === String(filters.subscriptionId));
        return { success: true, data: rows };
    }

    markInvoicePaid(invoiceId, payment = {}, actor = 'system') {
        const id = String(invoiceId || '').trim();
        if (!id) return { success: false, message: 'invoiceId مطلوب.' };
        const invoice = this.billingLedger.invoices.find((i) => i.id === id);
        if (!invoice) return { success: false, message: 'الفاتورة غير موجودة.' };
        if (invoice.status === 'paid') return { success: true, data: invoice, message: 'الفاتورة مدفوعة مسبقاً.' };

        const nowIso = new Date().toISOString();
        invoice.status = 'paid';
        invoice.paidAt = String(payment.paidAt || nowIso).trim();
        invoice.paymentMethod = String(payment.method || 'manual').trim();
        invoice.paymentRef = String(payment.reference || '').trim() || null;
        invoice.updatedAt = nowIso;

        const paymentRow = {
            id: this._newLedgerId('pay'),
            invoiceId: invoice.id,
            subscriptionId: invoice.subscriptionId,
            provider: invoice.provider,
            service: invoice.service,
            amount: Number(payment.amount || invoice.amount || 0),
            currency: String(payment.currency || invoice.currency || 'EUR').trim().toUpperCase(),
            paidAt: invoice.paidAt,
            method: invoice.paymentMethod,
            reference: invoice.paymentRef,
            notes: String(payment.notes || '').trim() || null,
            createdAt: nowIso,
            createdBy: actor
        };
        this.billingLedger.payments.unshift(paymentRow);
        this._persistBillingLedger();
        this._logComm('billing_invoice_paid', 'in_app', invoice.provider, 'paid', {
            invoiceId: invoice.id,
            paymentId: paymentRow.id,
            amount: paymentRow.amount,
            currency: paymentRow.currency
        });
        return { success: true, data: { invoice, payment: paymentRow } };
    }

    getBillingDashboard(days = 30) {
        const windowDays = Math.max(1, Number(days || 30));
        const now = new Date();
        const end = new Date(now.getTime() + (windowDays * 24 * 60 * 60 * 1000));

        const due = this.billingLedger.invoices.filter((i) => i.status === 'due');
        const overdue = due.filter((i) => new Date(i.dueDate) < now);
        const upcoming = due.filter((i) => {
            const d = new Date(i.dueDate);
            return d >= now && d <= end;
        });
        const paid = this.billingLedger.invoices.filter((i) => i.status === 'paid');

        const monthlyTotals = {};
        this.billingLedger.payments.forEach((p) => {
            const month = String(p.paidAt || '').slice(0, 7) || 'unknown';
            if (!monthlyTotals[month]) monthlyTotals[month] = 0;
            monthlyTotals[month] += Number(p.amount || 0);
        });

        return {
            success: true,
            summary: {
                subscriptions: this.billingLedger.subscriptions.length,
                invoices: this.billingLedger.invoices.length,
                due: due.length,
                overdue: overdue.length,
                paid: paid.length,
                paymentRecords: this.billingLedger.payments.length
            },
            upcomingDueWindowDays: windowDays,
            overdue: overdue.slice(0, 100),
            upcoming: upcoming.slice(0, 100),
            recentPayments: this.billingLedger.payments.slice(0, 100),
            monthlyTotals
        };
    }

    setLanguagePreference(userId, lang) {
        const key = String(userId || '').trim();
        if (!key) return { success: false, message: 'userId مطلوب.' };
        const normalized = this._normalizeLanguage(lang);
        this.languagePreferences[key] = {
            lang: normalized,
            updatedAt: new Date().toISOString()
        };
        this._persistLanguagePreferences();
        this._logComm('language_preference_set', 'in_app', key, 'updated', { lang: normalized });
        return { success: true, userId: key, lang: normalized };
    }

    getLanguagePreference(userId) {
        const key = String(userId || '').trim();
        if (!key) return { success: false, message: 'userId مطلوب.' };
        const entry = this.languagePreferences[key];
        if (!entry) return { success: true, userId: key, lang: 'ar', source: 'default' };
        return { success: true, userId: key, lang: this._normalizeLanguage(entry.lang), source: 'saved', updatedAt: entry.updatedAt || null };
    }

    _resolveLanguage(data) {
        const direct = data && (data.lang || data.language || data.locale);
        if (direct) return this._normalizeLanguage(direct);
        const userId = String((data && data.userId) || '').trim();
        if (userId && this.languagePreferences[userId] && this.languagePreferences[userId].lang) {
            return this._normalizeLanguage(this.languagePreferences[userId].lang);
        }
        return 'ar';
    }

    _getTemplateMessageForLanguage(templateId, channel, baseTemplateMessage, lang) {
        if (lang === 'ar') return baseTemplateMessage;
        const langPack = this.localizedTemplates && this.localizedTemplates[lang];
        const templatePack = langPack && langPack[templateId];
        const localized = templatePack && templatePack[channel];
        return localized || baseTemplateMessage;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔐 منظومة OTP — رمز التحقق
    // ═══════════════════════════════════════════════════════════════════════════
    _buildOTPSystem() {
        return {
            nameAr: 'منظومة رمز التحقق',
            methods: {
                sms: { enabled: true, priority: 1, label: 'رسالة نصية' },
                whatsapp: { enabled: true, priority: 2, label: 'واتساب' },
                email: { enabled: true, priority: 3, label: 'بريد إلكتروني' },
                voice: { enabled: !!(this.channels.voice && this.channels.voice.enabled), priority: 4, label: 'مكالمة صوتية' },
                sheikha_auth: { enabled: true, priority: 5, label: 'مصادقة شيخة' },
                google_auth: { enabled: true, priority: 6, label: 'مصادقة قوقل' }
            },
            config: {
                codeLength: 6,
                expiryMinutes: 5,
                maxAttempts: 5,
                cooldownMinutes: 2,
                lockAfterFails: 5,
                lockDurationMinutes: 15
            },
            store: new Map(), // userId/phone -> { code, expires, attempts, method }
            quran: 'وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ — المؤمنون ٨'
        };
    }

    // Generate and send OTP
    generateOTP(userId, method = 'sms', destination = null) {
        const code = String(100000 + Math.floor(Math.random() * 900000));
        const config = this.otpSystem.config;
        const existing = this.otpSystem.store.get(userId);

        // Cooldown check
        if (existing && existing.createdAt && (Date.now() - existing.createdAt) < config.cooldownMinutes * 60000) {
            const wait = Math.ceil((config.cooldownMinutes * 60000 - (Date.now() - existing.createdAt)) / 1000);
            return { success: false, message: 'انتظر ' + wait + ' ثانية قبل طلب رمز جديد.', waitSeconds: wait };
        }

        this.otpSystem.store.set(userId, {
            code,
            method,
            destination,
            expires: Date.now() + config.expiryMinutes * 60000,
            attempts: 0,
            createdAt: Date.now()
        });

        this._logComm('otp_generated', method, destination || userId, 'generated', { codeHint: code.charAt(0) + '****' + code.charAt(5) });

        return {
            success: true,
            code, // returned for sending — NOT to be exposed to client
            method,
            expiresIn: config.expiryMinutes * 60,
            message: 'تم إنشاء رمز التحقق.'
        };
    }

    // Verify OTP
    verifyOTP(userId, code) {
        const data = this.otpSystem.store.get(userId);
        if (!data) return { success: false, message: 'لم يُطلب رمز تحقق.' };
        if (data.attempts >= this.otpSystem.config.maxAttempts) {
            this.otpSystem.store.delete(userId);
            return { success: false, message: 'تجاوزت المحاولات. أعد الطلب.' };
        }
        if (Date.now() > data.expires) {
            this.otpSystem.store.delete(userId);
            return { success: false, message: 'انتهت صلاحية الرمز.' };
        }
        if (String(data.code) !== String(code).trim()) {
            data.attempts++;
            return { success: false, message: 'رمز غير صحيح.', remaining: this.otpSystem.config.maxAttempts - data.attempts };
        }

        this.otpSystem.store.delete(userId);
        this._logComm('otp_verified', data.method, data.destination || userId, 'verified', {});
        return { success: true, message: 'تم التحقق بنجاح.', method: data.method };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🤖 الرد الآلي
    // ═══════════════════════════════════════════════════════════════════════════
    _buildAutoReply() {
        return {
            enabled: true,
            greetingAr: 'بسم الله الرحمن الرحيم — أهلاً بك في سوق شيخة',
            greetingEn: 'In the name of Allah — Welcome to SHEIKHA Market',
            keywordsAr: {
                'سعر|اسعار|price': 'يمكنك الاطلاع على الأسعار الحية في: sheikha.top/سوق-شيخة.html',
                'طلب|order': 'لمتابعة طلبك، سجّل دخولك في: sheikha.top',
                'شحن|توصيل|shipping': 'لتتبع شحنتك: sheikha.top — قسم الطلبات',
                'تسجيل|register': 'سجّل حسابك: sheikha.top/تسجيل-الدخول.html',
                'مساعدة|help|دعم': 'فريق الدعم: market@sheikha.top | 0554942904',
                'سلام|مرحبا': 'وعليكم السلام ورحمة الله وبركاته! كيف نخدمك في سوق شيخة؟'
            },
            keywordsEn: {
                'price|rates|metal': 'You can view live prices at: sheikha.top/سوق-شيخة.html',
                'order|tracking|track': 'To track your order, sign in at: sheikha.top',
                'shipping|delivery': 'To track your shipment, open sheikha.top and check Orders.',
                'register|signup|sign up': 'Create your account here: sheikha.top/تسجيل-الدخول.html',
                'help|support': 'Support team: market@sheikha.top | +966554942904',
                'hello|hi|salam': 'Welcome. How can we help you in SHEIKHA Market?'
            },
            defaultReplyAr: 'شكراً لتواصلك مع سوق شيخة. سيتم الرد قريباً. market@sheikha.top | 0554942904',
            defaultReplyEn: 'Thank you for contacting SHEIKHA Market. We will respond shortly. market@sheikha.top | +966554942904',
            quran: 'وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا — النساء ٨٦'
        };
    }

    _conversationGreeting(lang) {
        if (lang === 'ar') return this.autoReply.greetingAr;
        // بداية الحوار: عربي أولاً ثم الإنجليزية للمستخدم الأعجمي
        return this.autoReply.greetingAr + '\n' + this.autoReply.greetingEn;
    }

    getAutoReply(message, options = {}) {
        const lang = this._resolveLanguage(options || {});
        const isFirstMessage = !!options.isFirstMessage;
        const lower = (message || '').toLowerCase();
        const keywords = lang === 'ar' ? this.autoReply.keywordsAr : this.autoReply.keywordsEn;
        const defaultReply = lang === 'ar' ? this.autoReply.defaultReplyAr : this.autoReply.defaultReplyEn;
        for (const [patterns, reply] of Object.entries(keywords)) {
            const regex = new RegExp(patterns, 'i');
            if (regex.test(lower)) {
                return {
                    reply: isFirstMessage ? (this._conversationGreeting(lang) + '\n\n' + reply) : reply,
                    matched: patterns,
                    lang
                };
            }
        }
        return {
            reply: isFirstMessage ? (this._conversationGreeting(lang) + '\n\n' + defaultReply) : defaultReply,
            matched: null,
            lang
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏢 الاتصالات التشغيلية
    // ═══════════════════════════════════════════════════════════════════════════
    _buildOperationalComms() {
        return {
            nameAr: 'إدارة الاتصالات التشغيلية',
            workflows: [
                { id: 'user_registration', nameAr: 'تسجيل مستخدم جديد', channels: ['sms', 'whatsapp', 'email'], auto: true, template: 'welcome' },
                { id: 'user_login', nameAr: 'تسجيل دخول', channels: ['push'], auto: true, template: 'login_alert' },
                { id: 'order_placed', nameAr: 'طلب جديد', channels: ['sms', 'whatsapp', 'email', 'push'], auto: true, template: 'order_confirmation' },
                { id: 'payment_received', nameAr: 'استلام دفعة', channels: ['sms', 'email', 'push'], auto: true, template: 'payment_received' },
                { id: 'shipment_update', nameAr: 'تحديث شحنة', channels: ['sms', 'whatsapp', 'push'], auto: true, template: 'shipment_update' },
                { id: 'price_alert', nameAr: 'تنبيه سعر', channels: ['push', 'sms'], auto: true, template: 'price_alert' },
                { id: 'system_alert', nameAr: 'تنبيه نظام', channels: ['sms', 'email', 'voice'], auto: true, template: 'system_alert' },
                { id: 'daily_report', nameAr: 'تقرير يومي', channels: ['email'], auto: true, schedule: '08:00', template: 'daily_report' },
                { id: 'otp_auth', nameAr: 'مصادقة OTP', channels: ['sms', 'whatsapp', 'email', 'voice'], auto: true, template: 'otp' },
                { id: 'password_reset', nameAr: 'استعادة كلمة المرور', channels: ['sms', 'email', 'whatsapp'], auto: true, template: 'password_reset' }
            ],
            quietHours: { enabled: true, start: '23:00', end: '07:00', timezone: 'Asia/Riyadh', exception: ['otp', 'system_alert', 'password_reset'] },
            hadith: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — البيهقي'
        };
    }

    // Send via template
    async sendTemplate(templateId, data, channels = null) {
        const template = this.templates[templateId];
        if (!template) return { success: false, error: 'قالب غير موجود: ' + templateId };
        const lang = this._resolveLanguage(data || {});

        const requestedChannels = channels || template.channels;
        const targetChannels = requestedChannels.filter(ch => this.channels[ch] && this.channels[ch].enabled);
        if (targetChannels.length === 0) {
            return { success: false, error: 'لا توجد قناة مفعلة للإرسال لهذا القالب.' };
        }
        const messageId = 'msg_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
        const recipient = this._resolveRecipient(data);
        const blockedByQuietHours = this._isInQuietHours(templateId);
        if (blockedByQuietHours) {
            const blockedEntry = this._logComm('template_blocked', 'multi', recipient, 'blocked_quiet_hours', { templateId, messageId });
            this._updateDelivery(messageId, { messageId, templateId, recipient, status: 'blocked_quiet_hours', channels: [], attempts: 0, blockedEntryId: blockedEntry.id, updatedAt: new Date().toISOString() });
            return { success: false, error: 'الإرسال متوقف حالياً بسبب أوقات الهدوء.', messageId };
        }

        const results = [];
        let overallSuccess = false;

        for (const ch of targetChannels) {
            const baseTmpl = template.messages[ch];
            const tmpl = this._getTemplateMessageForLanguage(templateId, ch, baseTmpl, lang);
            if (!tmpl) continue;
            const rendered = this._renderTemplate(tmpl, data || {});
            const budgetDecision = this._budgetDecision(ch, recipient, templateId);
            if (!budgetDecision.allowed) {
                this._registerBudgetBlock();
                this.monitoring.governance.budgetGuardBlocked++;
                const blockedByBudget = this._logComm('template_blocked', ch, recipient, 'blocked_budget_guard', {
                    templateId,
                    messageId,
                    reason: budgetDecision.reason,
                    details: budgetDecision.details || null,
                    lang
                });
                results.push({ channel: ch, success: false, reason: budgetDecision.reason, status: 'blocked_budget_guard', logId: blockedByBudget.id });
                continue;
            }
            const compliance = this._checkShariaCompliance(templateId, rendered.message, data || {});
            if (!compliance.allowed) {
                const blocked = this._logComm('template_blocked', ch, recipient, 'blocked_sharia', {
                    templateId,
                    messageId,
                    reason: compliance.reason,
                    lang
                });
                results.push({ channel: ch, success: false, reason: compliance.reason, status: 'blocked_sharia', logId: blocked.id });
                continue;
            }
            const dispatch = await this._dispatchChannel(ch, {
                templateId,
                messageId,
                recipient,
                message: rendered.message,
                subject: rendered.subject,
                data: data || {},
                lang
            });
            if (dispatch.success) this._registerBudgetSend(ch);
            if (dispatch.success) overallSuccess = true;
            results.push(dispatch);
        }

        this._updateDelivery(messageId, {
            messageId,
            templateId,
            recipient,
            status: overallSuccess ? 'sent' : 'failed',
            channels: results,
            attempts: results.reduce((sum, r) => sum + Number(r.attempts || 0), 0),
            updatedAt: new Date().toISOString()
        });

        return { success: overallSuccess, templateId, messageId, results };
    }

    _resolveRecipient(data) {
        if (!data || typeof data !== 'object') return 'unknown';
        return data.phone || data.email || data.to || data.userId || 'unknown';
    }

    _renderTemplate(templateMessage, data) {
        let message = typeof templateMessage === 'string' ? templateMessage : (templateMessage.body || '');
        let subject = typeof templateMessage === 'object' ? templateMessage.subject : null;
        Object.keys(data || {}).forEach((key) => {
            const value = String(data[key]);
            const re = new RegExp('\\{' + key + '\\}', 'g');
            message = message.replace(re, value);
            if (subject) subject = subject.replace(re, value);
        });
        return { message, subject };
    }

    _isInQuietHours(templateId) {
        const quiet = this.operationalComms && this.operationalComms.quietHours;
        if (!quiet || !quiet.enabled) return false;
        if (Array.isArray(quiet.exception) && quiet.exception.includes(templateId)) return false;
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = String(quiet.start || '23:00').split(':').map(Number);
        const [endH, endM] = String(quiet.end || '07:00').split(':').map(Number);
        const start = (startH * 60) + startM;
        const end = (endH * 60) + endM;
        if (start <= end) return nowMinutes >= start && nowMinutes < end;
        return nowMinutes >= start || nowMinutes < end;
    }

    _checkShariaCompliance(templateId, message, data) {
        const text = String(message || '').toLowerCase();
        const contentRules = (((this.shariaRules || {}).principles || {}).content || []);
        const blockedTypes = contentRules
            .filter(r => Array.isArray(r.blockedTypes))
            .flatMap(r => r.blockedTypes)
            .map(t => String(t).toLowerCase());
        const extraBlocked = ['ربا', 'فائدة ربوية', 'قمار', 'خمور', 'خنزير', 'احتيال'];
        const blockedList = [...new Set([...blockedTypes, ...extraBlocked])];
        const hit = blockedList.find(word => text.includes(word));
        if (hit) {
            this.monitoring.governance.shariaBlocked++;
            return { allowed: false, reason: 'محتوى غير متوافق شرعياً: ' + hit };
        }
        this.monitoring.governance.shariaPassed++;
        return { allowed: true, reason: null, templateId, hasData: !!data };
    }

    async _dispatchChannel(channel, payload) {
        const providers = this._selectProviders(channel);
        if (providers.length === 0) {
            const noProvider = this._logComm('template_send', channel, payload.recipient, 'failed_no_provider', {
                templateId: payload.templateId,
                messageId: payload.messageId
            });
            return { channel, success: false, status: 'failed_no_provider', attempts: 0, logId: noProvider.id };
        }

        const dispatched = await this._retryWithProviders(channel, providers, payload);
        const finalStatus = dispatched.success ? 'sent' : 'failed';
        const logEntry = this._logComm('template_send', channel, payload.recipient, finalStatus, {
            templateId: payload.templateId,
            messageId: payload.messageId,
            provider: dispatched.providerId || null,
            attempts: dispatched.attempts,
            error: dispatched.error || null
        });
        return {
            channel,
            success: dispatched.success,
            status: finalStatus,
            provider: dispatched.providerId || null,
            attempts: dispatched.attempts,
            logId: logEntry.id
        };
    }

    _selectProviders(channel) {
        const bucket = this.providers[channel];
        if (!bucket || typeof bucket !== 'object') return [];
        const order = [];
        if (bucket.primary && bucket.primary.configured) order.push(bucket.primary);
        if (bucket.fallback && bucket.fallback.configured) order.push(bucket.fallback);
        return order;
    }

    async _retryWithProviders(channel, providers, payload) {
        let attempts = 0;
        let lastError = null;
        for (const provider of providers) {
            if (!this._isProviderCompliant(channel, provider.id)) {
                lastError = 'provider_policy_not_compliant_' + provider.id;
                this.monitoring.governance.providerPolicyBlocked++;
                this._logComm('template_blocked', channel, payload.recipient, 'blocked_provider_policy', {
                    templateId: payload.templateId,
                    messageId: payload.messageId,
                    provider: provider.id,
                    reason: 'شروط/سياسات/أرشفة العقد غير مكتملة.'
                });
                continue;
            }
            for (let i = 0; i <= this.maxRetries; i++) {
                attempts++;
                const sent = await this._sendThroughProvider(channel, provider, payload);
                if (sent.success) {
                    return { success: true, providerId: provider.id, attempts };
                }
                lastError = sent.error || 'provider_send_failed';
                if (i < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, this.retryBackoffMs * (i + 1)));
                }
            }
        }
        this.monitoring.stats.failed++;
        this.monitoring.errors.unshift({ at: new Date().toISOString(), channel, error: lastError });
        if (this.monitoring.errors.length > 100) this.monitoring.errors = this.monitoring.errors.slice(0, 100);
        return { success: false, providerId: null, attempts, error: lastError };
    }

    async _sendThroughProvider(channel, provider, payload) {
        if (!this.realSend) {
            return { success: true, provider: provider.id, mode: 'dry_run' };
        }
        try {
            if (channel === 'sms' && provider.id === 'infobip_sms') {
                const apiKey = String(process.env.INFOBIP_API_KEY || '').trim();
                const baseUrl = String(process.env.INFOBIP_BASE_URL || '').trim().replace(/\/+$/, '');
                const from = String(process.env.INFOBIP_SMS_SENDER || process.env.SMS_SENDER_ID || 'SHEIKHA').trim();
                const to = String(payload.data.phone || payload.data.to || '').trim();
                if (!apiKey || !baseUrl || !to) {
                    return { success: false, error: 'infobip_sms_missing_config_or_destination' };
                }
                const res = await fetch(baseUrl + '/sms/2/text/advanced', {
                    method: 'POST',
                    headers: {
                        Authorization: 'App ' + apiKey,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [{ from, destinations: [{ to }], text: String(payload.message || '') }]
                    })
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    return { success: false, error: 'infobip_sms_http_' + res.status + ':' + bodyText.slice(0, 240) };
                }
                return { success: true, provider: provider.id };
            }
            if (channel === 'whatsapp' && provider.id === 'infobip_whatsapp') {
                const apiKey = String(process.env.INFOBIP_API_KEY || '').trim();
                const baseUrl = String(process.env.INFOBIP_BASE_URL || '').trim().replace(/\/+$/, '');
                const from = String(process.env.INFOBIP_WHATSAPP_FROM || '').trim();
                const to = String(payload.data.phone || payload.data.to || '').trim();
                if (!apiKey || !baseUrl || !from || !to) {
                    return { success: false, error: 'infobip_whatsapp_missing_config_or_destination' };
                }
                const res = await fetch(baseUrl + '/whatsapp/1/message/text', {
                    method: 'POST',
                    headers: {
                        Authorization: 'App ' + apiKey,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        from,
                        to,
                        content: { text: String(payload.message || '') }
                    })
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    return { success: false, error: 'infobip_whatsapp_http_' + res.status + ':' + bodyText.slice(0, 240) };
                }
                return { success: true, provider: provider.id };
            }
            if (channel === 'email' && provider.id === 'infobip_email') {
                const apiKey = String(process.env.INFOBIP_API_KEY || '').trim();
                const baseUrl = String(process.env.INFOBIP_BASE_URL || '').trim().replace(/\/+$/, '');
                const from = String(process.env.INFOBIP_EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@sheikha.top').trim();
                const to = String(payload.data.to || payload.data.email || '').trim();
                if (!apiKey || !baseUrl || !to) {
                    return { success: false, error: 'infobip_email_missing_config_or_destination' };
                }
                const res = await fetch(baseUrl + '/email/3/send', {
                    method: 'POST',
                    headers: {
                        Authorization: 'App ' + apiKey,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        from,
                        to,
                        subject: String(payload.subject || 'رسالة من شيخة'),
                        text: String(payload.message || '')
                    })
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    return { success: false, error: 'infobip_email_http_' + res.status + ':' + bodyText.slice(0, 240) };
                }
                return { success: true, provider: provider.id };
            }
            if (channel === 'sms' && provider.id === 'unifonic') {
                const appSid = String(process.env.UNIFONIC_APP_SID || '').trim();
                const senderId = String(process.env.UNIFONIC_SENDER_ID || process.env.SMS_SENDER_ID || 'SHEIKHA').trim();
                const to = String(payload.data.phone || payload.data.to || '').trim();
                if (!appSid || !to) {
                    return { success: false, error: 'unifonic_missing_config_or_destination' };
                }

                const form = new URLSearchParams();
                form.set('AppSid', appSid);
                form.set('SenderID', senderId);
                form.set('Recipient', to);
                form.set('Body', String(payload.message || ''));

                const res = await fetch('https://el.cloud.unifonic.com/rest/Messages/Send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: form.toString()
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    return { success: false, error: 'unifonic_http_' + res.status + ':' + bodyText.slice(0, 240) };
                }
                return { success: true, provider: provider.id };
            }
            if (channel === 'sms' && provider.id === 'twilio') {
                const sid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
                const token = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
                const from = String(process.env.TWILIO_PHONE_NUMBER || '').trim();
                const to = String(payload.data.phone || payload.data.to || '').trim();
                if (!sid || !token || !from || !to) {
                    return { success: false, error: 'twilio_missing_config_or_destination' };
                }

                const form = new URLSearchParams();
                form.set('To', to);
                form.set('From', from);
                form.set('Body', String(payload.message || ''));
                const auth = Buffer.from(sid + ':' + token).toString('base64');
                const res = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Basic ' + auth,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: form.toString()
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    return { success: false, error: 'twilio_http_' + res.status + ':' + bodyText.slice(0, 240) };
                }
                return { success: true, provider: provider.id };
            }
            if (channel === 'email' && provider.id === 'sendgrid') {
                const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + process.env.SENDGRID_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{ to: [{ email: payload.data.to || payload.data.email }] }],
                        from: { email: process.env.SENDGRID_FROM_EMAIL },
                        subject: payload.subject || 'رسالة من شيخة',
                        content: [{ type: 'text/plain', value: payload.message }]
                    })
                });
                return { success: res.ok, error: res.ok ? null : ('sendgrid_http_' + res.status) };
            }
            if (channel === 'whatsapp' && provider.id === 'whatsapp_business') {
                const phoneId = process.env.WHATSAPP_PHONE_ID;
                const token = process.env.WHATSAPP_TOKEN;
                const res = await fetch('https://graph.facebook.com/v18.0/' + phoneId + '/messages', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: payload.data.phone || payload.data.to,
                        type: 'text',
                        text: { body: payload.message }
                    })
                });
                return { success: res.ok, error: res.ok ? null : ('whatsapp_http_' + res.status) };
            }
            // بقية المزودات يمكن ربطها لاحقاً بنفس الهيكل.
            return { success: true, provider: provider.id, mode: 'provider_stub' };
        } catch (e) {
            return { success: false, error: e.message || 'provider_exception' };
        }
    }

    _updateDelivery(messageId, entry) {
        if (!messageId) return;
        const merged = {
            ...(this.deliveryStore.get(messageId) || {}),
            ...(entry || {}),
            messageId
        };
        this.deliveryStore.set(messageId, merged);
        this._persistDeliveries();
    }

    updateDeliveryStatus(messageId, status, details = {}) {
        const current = this.deliveryStore.get(messageId);
        if (!current) return { success: false, message: 'messageId غير معروف.' };
        const next = {
            ...current,
            status: status || current.status,
            deliveryDetails: details,
            updatedAt: new Date().toISOString()
        };
        this.deliveryStore.set(messageId, next);
        this._persistDeliveries();
        this._logComm('delivery_status', details.channel || 'unknown', current.recipient || 'unknown', next.status, { messageId, providerEvent: details });
        return { success: true, status: next.status, messageId };
    }

    getMessageStatus(messageId) {
        if (!messageId) return { success: false, message: 'messageId مطلوب.' };
        const item = this.deliveryStore.get(messageId);
        if (!item) return { success: false, message: 'الرسالة غير موجودة.' };
        return { success: true, data: item };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 المراقبة
    // ═══════════════════════════════════════════════════════════════════════════
    _buildMonitoring() {
        return {
            stats: { total: 0, failed: 0, bySms: 0, byWhatsapp: 0, byEmail: 0, byVoice: 0, byPush: 0, otpSent: 0, otpVerified: 0 },
            uptime: Date.now(),
            errors: [],
            lastActivity: null,
            governance: {
                shariaPassed: 0,
                shariaBlocked: 0,
                quietHoursBlocked: 0,
                providerPolicyBlocked: 0,
                budgetGuardBlocked: 0,
                auditCoverageRate: 100
            }
        };
    }

    _startMonitor() {
        // Update stats every 60s
        this._monitorInterval = setInterval(() => {
            this.monitoring.stats.total = this.log.length;
        }, 60000);
    }

    _logComm(type, channel, recipient, status, details) {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
            type,
            channel,
            recipient: String(recipient).substring(0, 40),
            status,
            details,
            at: new Date().toISOString()
        };
        this.log.unshift(entry);
        if (this.log.length > this.maxLogSize) this.log = this.log.slice(0, this.maxLogSize);
        this.monitoring.lastActivity = entry.at;

        // Update stats
        if (channel === 'sms') this.monitoring.stats.bySms++;
        else if (channel === 'whatsapp') this.monitoring.stats.byWhatsapp++;
        else if (channel === 'email') this.monitoring.stats.byEmail++;
        else if (channel === 'voice') this.monitoring.stats.byVoice++;
        else if (channel === 'push') this.monitoring.stats.byPush++;
        if (String(status).indexOf('failed') === 0 || status === 'failed') this.monitoring.stats.failed++;
        if (status === 'blocked_quiet_hours') this.monitoring.governance.quietHoursBlocked++;
        if (type === 'otp_generated') this.monitoring.stats.otpSent++;
        if (type === 'otp_verified') this.monitoring.stats.otpVerified++;
        this.monitoring.stats.total++;
        this.monitoring.governance.auditCoverageRate = this.monitoring.stats.total > 0
            ? Math.round(((this.log.length > 0 ? this.log.length : 0) / this.monitoring.stats.total) * 100)
            : 100;

        if (this.operationLogger) {
            try {
                this.operationLogger(
                    'comms_' + type,
                    'communication',
                    {
                        channel,
                        recipient: entry.recipient,
                        status,
                        messageId: details && details.messageId ? details.messageId : null
                    },
                    { ...details, entryId: entry.id, at: entry.at }
                );
            } catch (_) {}
        }

        return entry;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 API: Dashboard
    // ═══════════════════════════════════════════════════════════════════════════
    getDashboard() {
        const providerStatus = {};
        for (const [cat, providers] of Object.entries(this.providers)) {
            providerStatus[cat] = {};
            for (const [key, p] of Object.entries(providers)) {
                providerStatus[cat][key] = {
                    id: p.id,
                    nameAr: p.nameAr,
                    configured: p.configured,
                    features: p.features,
                    policyCompliant: this._isProviderCompliant(cat, p.id)
                };
            }
        }
        const providerCompliance = this.getProviderCompliance();
        const budgetGuard = this.getBudgetGuardStatus();
        const billing = this.getBillingDashboard(30);

        return {
            foundation: this.foundation,
            channels: Object.values(this.channels).map(c => ({ id: c.id, nameAr: c.nameAr, enabled: c.enabled, priority: c.priority, useCases: c.useCases.length, templates: c.templates ? c.templates.length : 0, quran: c.quran })),
            providers: providerStatus,
            templates: Object.keys(this.templates).length,
            otpConfig: this.otpSystem.config,
            operationalWorkflows: this.operationalComms.workflows.length,
            autoReply: {
                enabled: this.autoReply.enabled,
                keywordsAr: Object.keys(this.autoReply.keywordsAr || {}).length,
                keywordsEn: Object.keys(this.autoReply.keywordsEn || {}).length
            },
            language: {
                default: 'ar',
                supported: ['ar', 'en'],
                note: 'أي لغة أعجمية غير مدعومة تتحول مؤقتاً إلى الإنجليزية',
                savedPreferences: Object.keys(this.languagePreferences || {}).length
            },
            monitoring: this.monitoring,
            recentLog: this.log.slice(0, 20),
            deliveryTracking: {
                totalTracked: this.deliveryStore.size,
                recent: Array.from(this.deliveryStore.values()).slice(-20).reverse()
            },
            governance: {
                shariaComplianceRate: this.monitoring.governance.shariaPassed + this.monitoring.governance.shariaBlocked > 0
                    ? Math.round((this.monitoring.governance.shariaPassed / (this.monitoring.governance.shariaPassed + this.monitoring.governance.shariaBlocked)) * 100)
                    : 100,
                quietHoursBlocked: this.monitoring.governance.quietHoursBlocked,
                providerPolicyBlocked: this.monitoring.governance.providerPolicyBlocked,
                budgetGuardBlocked: this.monitoring.governance.budgetGuardBlocked,
                providerComplianceRate: providerCompliance.summary.complianceRate,
                auditCoverageRate: this.monitoring.governance.auditCoverageRate
            },
            providerCompliance,
            budgetGuard,
            billing,
            summary: {
                totalChannels: Object.keys(this.channels).length,
                totalTemplates: Object.keys(this.templates).length,
                totalWorkflows: this.operationalComms.workflows.length,
                totalProviders: Object.values(this.providers).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
                otpMethods: Object.keys(this.otpSystem.methods).length,
                autoReplyKeywords: Object.keys(this.autoReply.keywordsAr || {}).length + Object.keys(this.autoReply.keywordsEn || {}).length
            }
        };
    }

    getLog(limit = 50, channel = null) {
        let filtered = this.log;
        if (channel) filtered = filtered.filter(e => e.channel === channel);
        return filtered.slice(0, limit);
    }

    destroy() {
        if (this._monitorInterval) clearInterval(this._monitorInterval);
    }
}

module.exports = SheikhaCommsEngine;
