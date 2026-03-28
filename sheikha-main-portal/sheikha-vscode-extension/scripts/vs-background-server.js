#!/usr/bin/env node

const http = require('node:http');
const { URL } = require('node:url');
const {
    SHEIKHA_GOVERNANCE_PROFILE,
    normalizeLocale,
    resolveDirection,
    validatePayloadUtf8,
    buildRequestContext
} = require('../../lib/sheikha-governance-core');

function readArg(name, fallback) {
    const prefix = `--${name}=`;
    const found = process.argv.find(item => item.startsWith(prefix));
    if (!found) {
        return fallback;
    }
    return found.slice(prefix.length);
}

const tier = String(readArg('tier', 'professional')).toLowerCase();
const port = Number(readArg('port', tier === 'enterprise' ? 48481 : 48480));
const host = readArg('host', '127.0.0.1');
const defaultLanguage = String(readArg('default-language', 'ar')).toLowerCase();

const unicodeTierCatalog = {
    'sheikha-unicode-standard': {
        title: 'Sheikha Unicode Standard',
        concept: 'Unicode Standard',
        descriptionAr: 'معيار موحد للتمثيل النصي متعدد اللغات مع أساس عربي.'
    },
    'sheikha-variable-width-encoding': {
        title: 'Sheikha Variable-Width Encoding',
        concept: 'Variable-Width Encoding',
        descriptionAr: 'ترميز متغير العرض لدعم النصوص متعددة البايت بكفاءة.'
    },
    'sheikha-code-points': {
        title: 'Sheikha Code Points',
        concept: 'Code Points',
        descriptionAr: 'إدارة نقاط الترميز النصية مع توافق Unicode.'
    },
    'sheikha-byte-sequence': {
        title: 'Sheikha Byte Sequence',
        concept: 'Byte Sequence (Bytes)',
        descriptionAr: 'تحليل وتمثيل تسلسلات البايت للنصوص.'
    },
    'sheikha-ascii-compatibility': {
        title: 'Sheikha Backward Compatibility with ASCII',
        concept: 'Backward Compatibility with ASCII',
        descriptionAr: 'حفاظ كامل على توافق ASCII مع طبقة Unicode.'
    },
    'sheikha-self-synchronization': {
        title: 'Sheikha Self-Synchronization',
        concept: 'Self-Synchronization',
        descriptionAr: 'قدرة مزامنة ذاتية في تدفقات الترميز متعددة البايت.'
    },
    'sheikha-multi-byte-characters': {
        title: 'Sheikha Multi-byte Characters',
        concept: 'Multi-byte Characters',
        descriptionAr: 'تمثيل محارف متعددة البايت للغات العالمية.'
    },
    'sheikha-data-representation': {
        title: 'Sheikha Data Representation',
        concept: 'Data Representation',
        descriptionAr: 'تمثيل البيانات رقميا مع أساس عربي ثم ترجمة عالمية.'
    },
    'sheikha-encoding-systems': {
        title: 'Sheikha Encoding Systems',
        concept: 'Encoding Systems',
        descriptionAr: 'محرك ترميز موحد يشمل UTF-8 وASCII والتوافق بينهما.'
    },
    'sheikha-data-storage': {
        title: 'Sheikha Data Storage',
        concept: 'Data Storage',
        descriptionAr: 'تنظيم تخزين البيانات وهيكلتها واسترجاعها بصورة آمنة.'
    },
    'sheikha-utf-8-core': {
        title: 'Sheikha UTF-8 Core',
        concept: 'UTF-8 Core',
        descriptionAr: 'نواة UTF-8 الأساسية للمنظومة.'
    },
    'sheikha-ascii-core': {
        title: 'Sheikha ASCII Core',
        concept: 'ASCII Core',
        descriptionAr: 'طبقة ASCII الأساسية للتوافق الخلفي.'
    },
    'sheikha-hardware': {
        title: 'Sheikha Hardware',
        concept: 'Hardware Architecture',
        descriptionAr: 'طبقة العتاد: CPU, ALU, CU, Memory, Storage, Bus, I/O.'
    },
    'sheikha-software': {
        title: 'Sheikha Software & Data',
        concept: 'Software Architecture',
        descriptionAr: 'طبقة البرمجيات: OS, Kernel, Languages, Algorithms, Data Structures.'
    },
    'sheikha-networking': {
        title: 'Sheikha Networking & Communication',
        concept: 'Networking Architecture',
        descriptionAr: 'طبقة الشبكات: IP, Protocols, NIC, Secure Communication.'
    },
    'sheikha-protocol': {
        title: 'Sheikha Protocol',
        concept: 'Application Protocol',
        descriptionAr: 'بروتوكول شيخة للتخاطب الآمن بين الخدمات.'
    },
    'sheikha-neural-interpreters': {
        title: 'Sheikha Neural Interpreters',
        concept: 'Neural Interpreters',
        descriptionAr: 'مفسرات عصبية لتحليل اللغة والأوامر والسياق.'
    },
    'sheikha-neural-engines': {
        title: 'Sheikha Neural Engines',
        concept: 'Neural Engines',
        descriptionAr: 'محركات عصبية للاستدلال والتخطيط واتخاذ القرار.'
    },
    'sheikha-neural-translators': {
        title: 'Sheikha Neural Translators',
        concept: 'Neural Translators',
        descriptionAr: 'مترجمات عصبية للترجمة من العربية وإليها بكل اللغات.'
    },
    'sheikha-neural-accelerator': {
        title: 'Sheikha Neural Accelerator',
        concept: 'Neural Accelerator',
        descriptionAr: 'مسرّع تنفيذي لشبكة المعالجة اللغوية العصبية.'
    },
    'sheikha-arabic-foundation': {
        title: 'Sheikha Arabic Foundation',
        concept: 'Arabic Foundation Layer',
        descriptionAr: 'طبقة التأسيس العربية كمرجعية أولى للمعنى والبيان.'
    }
};

function resolveProductTitle(currentTier) {
    if (currentTier === 'enterprise') {
        return 'Visual Studio Enterprise';
    }
    if (currentTier === 'utf-8' || currentTier === 'utf8') {
        return 'Sheikha UTF-8 Background Server';
    }
    if (unicodeTierCatalog[currentTier]) {
        return unicodeTierCatalog[currentTier].title;
    }
    return 'Visual Studio Professional';
}

function resolveLanguage(selectedLanguage) {
    if (!selectedLanguage || selectedLanguage === 'auto') {
        return SHEIKHA_GOVERNANCE_PROFILE.languageBase;
    }
    return normalizeLocale(selectedLanguage);
}

function resolveTierInfo(currentTier) {
    const info = unicodeTierCatalog[currentTier];
    if (!info) {
        return {
            title: resolveProductTitle(currentTier),
            concept: 'General Background Service',
            descriptionAr: 'خدمة خلفية عامة لمنظومة شيخة.'
        };
    }
    return info;
}

if (!Number.isInteger(port) || port <= 0) {
    console.error(`[Sheikha VS Background] invalid port: ${port}`);
    process.exit(1);
}

const startedAt = new Date().toISOString();
const tierInfo = resolveTierInfo(tier);

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url || '/', `http://${host}:${port}`);
    const lang = resolveLanguage(parsedUrl.searchParams.get('lang') || defaultLanguage);
    const route = parsedUrl.pathname;
    const context = buildRequestContext({
        locale: lang,
        route,
        actor: 'vs-background-server'
    });

    if (route === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
            JSON.stringify({
                success: true,
                data: {
                    status: 'ok',
                    tier,
                    languageBase: context.languageBase,
                    direction: context.direction,
                    governance: {
                        encoding: SHEIKHA_GOVERNANCE_PROFILE.requiredEncoding,
                        references: SHEIKHA_GOVERNANCE_PROFILE.references
                    }
                },
                message: lang === 'ar' ? 'الخدمة تعمل' : 'Service is healthy',
                timestamp: new Date().toISOString()
            })
        );
        return;
    }

    if (route === '/encoding') {
        const utf8Check = validatePayloadUtf8(
            tierInfo.descriptionAr || '',
            'tierInfo.descriptionAr'
        );
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
            JSON.stringify({
                success: true,
                data: {
                    tier,
                    concept: tierInfo.concept,
                    unicode: true,
                    variableWidth: true,
                    asciiCompatible: true,
                    selfSynchronization: true,
                    multiByteCharacters: true,
                    arabicFirst: true,
                    globalTranslationReady: true,
                    utf8Strict: utf8Check.length === 0
                },
                message: lang === 'ar' ? 'بيانات الترميز متاحة' : 'Encoding metadata available',
                timestamp: new Date().toISOString()
            })
        );
        return;
    }

    const payload = {
        success: true,
        data: {
            product: resolveProductTitle(tier),
            tier,
            concept: tierInfo.concept,
            descriptionAr: tierInfo.descriptionAr,
            language: {
                requested: lang,
                base: context.languageBase,
                direction: resolveDirection(lang),
                fallbackToArabic: true,
                translationScope: 'all-languages'
            },
            governance: {
                ownerAr: SHEIKHA_GOVERNANCE_PROFILE.ownerAr,
                ownerEn: SHEIKHA_GOVERNANCE_PROFILE.ownerEn,
                principlesAr: SHEIKHA_GOVERNANCE_PROFILE.principlesAr,
                references: SHEIKHA_GOVERNANCE_PROFILE.references
            },
            integration: {
                hardware: true,
                software: true,
                networking: true,
                data: true,
                protocol: 'sheikha-protocol',
                neuralMesh: {
                    interpreters: true,
                    engines: true,
                    translators: true,
                    accelerator: true,
                    arabicFoundation: true
                }
            },
            host,
            port,
            status: 'active',
            startedAt,
            pid: process.pid
        },
        message:
            lang === 'ar'
                ? 'خادم شيخة الخلفي يعمل والأساس اللغوي عربي'
                : 'Sheikha background server is active with Arabic-first base',
        timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
});

server.listen(port, host, () => {
    console.log(`[Sheikha VS Background] ${tier} server active on http://${host}:${port}`);
});

function shutdown(signal) {
    console.log(`[Sheikha VS Background] ${tier} server shutting down on ${signal}`);
    server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
