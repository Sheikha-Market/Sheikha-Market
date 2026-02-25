/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ⚙️ إعدادات منظومة شيخة
 *  Sheikha System Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();

const config = {
    // ─── إعدادات الخادم ───────────────────────────────────────────────────────
    server: {
        port: process.env.PORT || 8080,
        host: process.env.HOST || 'localhost',
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
            host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
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
        jwt: {
            secret: process.env.JWT_SECRET || 'sheikha-secure-secret-key-2026',
            expiresIn: '24h',
            refreshExpiresIn: '7d'
        },
        bcrypt: {
            saltRounds: 12
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 دقيقة
            max: 100 // حد الطلبات
        },
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
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
        website: 'https://sheikha.top'
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
