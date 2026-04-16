/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ⚙️ إعدادات منظومة شيخة
 *  Sheikha System Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const crypto = require('crypto');

const isProductionEnv = String(process.env.NODE_ENV || 'development') === 'production';
const runtimeDevJwtSecret = crypto.createHash('sha256')
    .update('sheikha-dev:' + String(process.pid) + ':' + String(Date.now()))
    .digest('hex');
const generatedFallbackEncryptionKey = crypto.createHash('sha256')
    .update(String(process.env.HOSTNAME || 'sheikha') + String(process.pid))
    .digest('hex');

const config = {
    // ─── إعدادات الخادم ───────────────────────────────────────────────────────
    server: {
        port: process.env.PORT || 8080,
        // 🛡️ الإنتاج → 0.0.0.0 (داخل الحاوية) | التطوير → 127.0.0.1 (محلي فقط)
        host: process.env.HOST || (isProductionEnv ? '0.0.0.0' : '127.0.0.1'),
        env: process.env.NODE_ENV || 'development'
    },

    // ─── إعدادات قاعدة البيانات ───────────────────────────────────────────────
    database: {
        type: 'json', // json | sqlite | postgresql
        path: './data',
        files: {
            users: 'users.json',
            companies: 'companies-registry.json',
            listings: 'listings.json',
            traders: 'traders.json',
            saudiMarket: 'saudi-market-preloaded.json',
            shariaRules: 'sharia-rules.json',
            marketingServices: 'marketing-services.json',
            aiLearning: 'ai-learning.json'
        }
    },

    // ─── إعدادات الذكاء الاصطناعي ─────────────────────────────────────────────
    ai: {
        ollama: {
            enabled: process.env.OLLAMA_ENABLED !== 'false',
            // الأولوية: Azure VM Endpoint > OLLAMA_HOST > localhost
            host: process.env.OLLAMA_AZURE_ENDPOINT || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
            azureVmIp: process.env.OLLAMA_AZURE_VM_IP || null,
            azureEndpoint: process.env.OLLAMA_AZURE_ENDPOINT || null,
            profile: process.env.OLLAMA_PROFILE || 'auto',
            autoUpdate: process.env.OLLAMA_AUTO_UPDATE !== 'false',
            updateIntervalHours: parseInt(process.env.OLLAMA_UPDATE_INTERVAL_HOURS || '24', 10),
            allowPull: process.env.OLLAMA_ALLOW_PULL === 'true',
            defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1:8b',
            strongModel: process.env.OLLAMA_STRONG_MODEL || 'qwen2.5:14b',
            lightModel: process.env.OLLAMA_LIGHT_MODEL || 'phi3:mini',
            timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '90000', 10)
        },
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.AI_LLM_MODEL || 'gpt-5.2',
            maxTokens: 4000
        },
        humain: {
            apiKey: process.env.HUMAIN_API_KEY,
            hfApiKey: process.env.HUGGINGFACE_API_KEY,
            model: process.env.HUMAIN_MODEL || 'humain-ai/ALLaM-7B-Instruct-preview',
            baseUrl: process.env.HUMAIN_BASE_URL || 'https://api-inference.huggingface.co',
            maxTokens: parseInt(process.env.HUMAIN_MAX_TOKENS) || 2048,
            notes: 'هيوماين — PIF | شراكات: AWS، NVIDIA، AMD | نموذج ALLaM عربي'
        },
        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-6-20260205',
            maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 8192,
            // ─── مميزات Opus 4.6 الجديدة ──────────────────────────────
            extendedContext: process.env.CLAUDE_EXTENDED_CONTEXT === 'true',    // نافذة سياق 1M توكن
            adaptiveThinking: process.env.CLAUDE_ADAPTIVE_THINKING === 'true', // التفكير التكيفي المتقدم
            contextCompaction: process.env.CLAUDE_CONTEXT_COMPACTION === 'true', // ضغط السياق للمحادثات اللانهائية
            version: '4.6',
            releaseDate: '2026-02-05',
            capabilities: [
                'adaptive-thinking',      // تفكير تكيفي متقدم للمهام المعقدة
                'extended-context-1m',     // نافذة سياق 1 مليون توكن
                'context-compaction',      // ضغط السياق لمحادثات لا نهائية
                'agent-teams',             // فرق وكلاء ذكية للعمل الجماعي
                'production-code-gen',     // توليد كود جاهز للإنتاج
                'complex-reasoning',       // استدلال معقد متعدد الخطوات
                'financial-analysis',      // تحليل مالي متقدم
                'research-synthesis',      // تجميع وتحليل أبحاث
                'enterprise-workflows',    // سير عمل المؤسسات
                'multi-step-planning',     // تخطيط متعدد الخطوات
                'arabic-understanding'     // فهم متقدم للعربية
            ]
        },
        routing: {
            development: 'anthropic',   // Claude Opus 4.6 للتطوير (الأقوى)
            analysis: 'anthropic',      // Claude Opus 4.6 للتحليل المتقدم
            coding: 'anthropic',        // Claude Opus 4.6 للبرمجة
            chat: 'openai',             // GPT للمحادثة العامة
            quickTasks: 'openai'        // GPT للمهام السريعة
        },
        mode: process.env.AI_MODE || 'auto'
    },

    // ─── إعدادات الأمان ───────────────────────────────────────────────────────
    security: {
        strictSecrets: process.env.SECURITY_STRICT_SECRETS === 'true',
        jwt: {
            secret: process.env.JWT_SECRET || runtimeDevJwtSecret,
            minSecretLength: 32,
            expiresIn: '24h',
            refreshExpiresIn: '7d'
        },
        tls: {
            enforceHttps: process.env.SECURITY_ENFORCE_HTTPS === 'true',
            hstsEnabled: process.env.SECURITY_HSTS_ENABLED === 'true' || process.env.HSTS_ENABLED === 'true',
            hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10)
        },
        encryption: {
            algorithm: process.env.DATA_ENCRYPTION_ALGORITHM || 'aes-256-gcm',
            key: process.env.DATA_ENCRYPTION_KEY || process.env.DATA_ENCRYPTION_KEY_HEX || generatedFallbackEncryptionKey,
            keyVersion: process.env.DATA_ENCRYPTION_KEY_VERSION || 'v1'
        },
        bcrypt: {
            saltRounds: 12
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 دقيقة
            max: 100 // حد الطلبات
        },
        cors: {
            origin: process.env.CORS_ORIGIN || (isProductionEnv ? 'https://www.sheikha.top' : '*'),
            credentials: true
        },
        malwareScan: {
            enabled: process.env.MALWARE_SCAN_ENABLED === 'true',
            host: process.env.MALWARE_SCAN_HOST || '127.0.0.1',
            port: parseInt(process.env.MALWARE_SCAN_PORT || '3310', 10),
            quarantineDir: process.env.MALWARE_SCAN_QUARANTINE_DIR || './quarantine'
        }
    },

    // ─── إعدادات الشريعة ──────────────────────────────────────────────────────
    sharia: {
        enabled: true,
        strictMode: true,
        rules: {
            noRiba: true,           // تحريم الربا
            noGharar: true,         // تحريم الغرر
            halal: true,            // اشتراط الحلال
            transparency: true      // الشفافية
        }
    },

    // ─── إعدادات اللغة العربية ────────────────────────────────────────────────
    arabic: {
        enabled: true,
        defaultLocale: 'ar-SA',
        rtl: true,
        engines: {
            grammar: true,    // محرك النحو
            parser: true,     // محرك الإعراب
            morphology: true, // محرك الصرف
            rhetoric: true    // محرك البلاغة
        }
    },

    // ─── إعدادات الإشعارات ────────────────────────────────────────────────────
    notifications: {
        email: {
            enabled: process.env.EMAIL_ENABLED === 'true',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        sms: {
            enabled: process.env.SMS_ENABLED === 'true',
            provider: process.env.SMS_PROVIDER
        },
        push: {
            enabled: true
        }
    },

    // ─── تكاملات التطوير (Adobe, Figma, NVIDIA, Sentry, Linear, OpenAI, Stripe, Ramp) ───
    developmentIntegrations: {
        catalog: 'data/development-integrations-catalog.json',
        figma: { apiKey: process.env.FIGMA_ACCESS_TOKEN, baseUrl: 'https://api.figma.com/v1' },
        sentry: { dsn: process.env.SENTRY_DSN },
        linear: { apiKey: process.env.LINEAR_API_KEY, baseUrl: 'https://api.linear.app/graphql' },
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            apiVersion: process.env.STRIPE_API_VERSION || '2025-03-31.basil',
            // Include-dependent response values (API v2) — خصائص تُرجع null افتراضياً لتقليل حجم الاستجابة
            v2IncludeDefaults: ['identity', 'configuration.customer'],
            sdkLanguagesCatalog: 'data/stripe-sdk-languages.json'
        },
        ramp: { apiKey: process.env.RAMP_API_KEY },
        nvidia: { apiKey: process.env.NVIDIA_API_KEY },
        adobe: { clientId: process.env.ADOBE_CLIENT_ID, clientSecret: process.env.ADOBE_CLIENT_SECRET },
        // بديل Adobe Sign — توقيع إلكتروني
        dropboxSign: { apiKey: process.env.DROPBOX_SIGN_API_KEY, baseUrl: 'https://api.hellosign.com/v3' },
        // بديل Adobe Stock — صور مجانية
        pexels: { apiKey: process.env.PEXELS_API_KEY, baseUrl: 'https://api.pexels.com' }
    },

    // ─── تكاملات التطوير (Adobe, Figma, NVIDIA, Sentry, Linear, OpenAI, Stripe, Ramp) ─
    devIntegrations: {
        stripe: {
            enabled: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.length > 10),
            secretKey: process.env.STRIPE_SECRET_KEY,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            purpose: 'بوابة الدفع الإلكتروني',
            apiVersion: process.env.STRIPE_API_VERSION || '2025-03-31.basil',
            v2IncludeDefaults: ['identity', 'configuration.customer']
        },
        figma: {
            enabled: !!(process.env.FIGMA_ACCESS_TOKEN && process.env.FIGMA_ACCESS_TOKEN.length > 10),
            accessToken: process.env.FIGMA_ACCESS_TOKEN,
            purpose: 'تصميم الواجهات وتصدير الأصول'
        },
        nvidia: {
            enabled: !!(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.length > 10),
            apiKey: process.env.NVIDIA_API_KEY,
            purpose: 'NIM / AI inference — نماذج ذكاء اصطناعي'
        },
        sentry: {
            enabled: !!(process.env.SENTRY_DSN && process.env.SENTRY_DSN.length > 20),
            dsn: process.env.SENTRY_DSN,
            purpose: 'تتبع الأخطاء ومراقبة الأداء — بديل Datadog'
        },
        linear: {
            enabled: !!(process.env.LINEAR_API_KEY && process.env.LINEAR_API_KEY.length > 10),
            apiKey: process.env.LINEAR_API_KEY,
            purpose: 'إدارة المهام والمشاريع'
        },
        adobe: {
            enabled: !!(process.env.ADOBE_CLIENT_ID && process.env.ADOBE_CLIENT_SECRET),
            clientId: process.env.ADOBE_CLIENT_ID,
            clientSecret: process.env.ADOBE_CLIENT_SECRET,
            purpose: 'Creative Cloud / PDF / تصميم'
        },
        dropboxSign: {
            enabled: !!(process.env.DROPBOX_SIGN_API_KEY && process.env.DROPBOX_SIGN_API_KEY.length > 10),
            apiKey: process.env.DROPBOX_SIGN_API_KEY,
            purpose: 'توقيع إلكتروني — بديل Adobe Sign'
        },
        pexels: {
            enabled: !!(process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY.length > 10),
            apiKey: process.env.PEXELS_API_KEY,
            purpose: 'صور مجانية عالية الجودة — بديل Adobe Stock'
        },
        ramp: {
            enabled: !!(process.env.RAMP_API_KEY && process.env.RAMP_API_KEY.length > 10),
            apiKey: process.env.RAMP_API_KEY,
            purpose: 'إدارة النفقات والبطاقات'
        },
        openai: {
            enabled: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10),
            purpose: 'المحادثة والتحليل الذكي'
        }
    },

    // ─── إعدادات التخزين ──────────────────────────────────────────────────────
    storage: {
        uploads: './uploads',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    },

    // ─── إعدادات السجلات ──────────────────────────────────────────────────────
    logging: {
        enabled: true,
        level: process.env.LOG_LEVEL || 'info',
        path: './logs',
        files: {
            access: 'access.log',
            error: 'error.log',
            audit: 'audit.log'
        }
    },

    // ─── معلومات النظام ───────────────────────────────────────────────────────
    system: {
        name: 'منظومة شيخة للمعادن والسكراب',
        nameEn: 'Sheikha Metals & Scrap System',
        version: '2.0.0',
        buildDate: new Date().toISOString(),
        author: 'فريق شيخة',
        website: 'https://sheikha.top',
        // حماية شاملة — استقلالية وملكية فكرية (لا انتماء لمعادن/هيوماين/أرامكو/PIF)
        independenceDoc: 'docs/حماية-شاملة-واستثمارات-الدولة.md'
    }
};

// ─── دوال مساعدة ──────────────────────────────────────────────────────────────

/**
 * الحصول على إعداد معين
 */
config.get = function(path, defaultValue = null) {
    const keys = path.split('.');
    let result = this;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    return result;
};

/**
 * التحقق من البيئة
 */
config.isDevelopment = () => config.server.env === 'development';
config.isProduction = () => config.server.env === 'production';
config.isTest = () => config.server.env === 'test';

if (isProductionEnv && !process.env.JWT_SECRET) {
    console.warn('⚠️ [SECURITY] JWT_SECRET غير مضبوط في بيئة الإنتاج.');
}
if (isProductionEnv && !process.env.DATA_ENCRYPTION_KEY) {
    console.warn('⚠️ [SECURITY] DATA_ENCRYPTION_KEY غير مضبوط في بيئة الإنتاج.');
}

/**
 * طباعة الإعدادات (للتطوير)
 */
config.print = function() {
    console.log('═'.repeat(60));
    console.log('⚙️  إعدادات منظومة شيخة');
    console.log('═'.repeat(60));
    console.log(`📍 البيئة: ${this.server.env}`);
    console.log(`🌐 المنفذ: ${this.server.port}`);
    console.log(`🤖 OpenAI: ${this.ai.openai.apiKey ? '✅ ' + this.ai.openai.model : '❌ غير مفعّل'}`);
    console.log(`🧠 Claude: ${this.ai.anthropic.apiKey ? '✅ Opus 4.6 — أقوى نموذج ذكاء اصطناعي' : '❌ غير مفعّل'}`);
    if (this.ai.anthropic.apiKey) {
        console.log(`   ├─ التفكير التكيفي: ${this.ai.anthropic.adaptiveThinking ? '✅' : '❌'}`);
        console.log(`   ├─ سياق 1M توكن: ${this.ai.anthropic.extendedContext ? '✅' : '❌'}`);
        console.log(`   └─ ضغط السياق: ${this.ai.anthropic.contextCompaction ? '✅' : '❌'}`);
    }
    console.log(`☪️  الشريعة: ${this.sharia.enabled ? '✅ مفعّل' : '❌ غير مفعّل'}`);
    console.log(`📖 العربية: ${this.arabic.enabled ? '✅ مفعّل' : '❌ غير مفعّل'}`);
    console.log('═'.repeat(60));
};

module.exports = config;
