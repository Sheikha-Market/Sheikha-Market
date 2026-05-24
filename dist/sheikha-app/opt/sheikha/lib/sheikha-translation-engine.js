/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA TRANSLATION ENGINE — منظومة شيخة للترجمة المتقدمة
 *
 * "وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ" — الروم ٢٢
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة
 *
 * ═══ القدرات ═══
 *   ✅ قاموس ذكي بالعبارات الكاملة (Phrase Dictionary)
 *   ✅ مطابقة جزئية (Partial Match) — يكسر الجمل الطويلة
 *   ✅ ترجمة آلية مجانية (MyMemory API) — بدون اشتراك
 *   ✅ ذاكرة تراكمية دائمة (Persistent Cache)
 *   ✅ 20+ لغة مدعومة
 *   ✅ اتجاه النص التلقائي (RTL/LTR)
 *   ✅ رقمنة بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class SheikhaTranslationEngine {
    constructor(opts = {}) {
        this.name = 'منظومة شيخة للترجمة المتقدمة';
        this.version = '2.0.0';
        this.dataDir = opts.dataDir || path.join(__dirname, '..', 'data');

        // ═══ اللغات المدعومة — 22 لغة ═══
        this.languages = {
            ar: { name: 'العربية', nameEn: 'Arabic', dir: 'rtl', flag: '🇸🇦', code: 'ar', primary: true },
            en: { name: 'English', nameEn: 'English', dir: 'ltr', flag: '🇬🇧', code: 'en' },
            fr: { name: 'Français', nameEn: 'French', dir: 'ltr', flag: '🇫🇷', code: 'fr' },
            tr: { name: 'Türkçe', nameEn: 'Turkish', dir: 'ltr', flag: '🇹🇷', code: 'tr' },
            ur: { name: 'اردو', nameEn: 'Urdu', dir: 'rtl', flag: '🇵🇰', code: 'ur' },
            id: { name: 'Indonesia', nameEn: 'Indonesian', dir: 'ltr', flag: '🇮🇩', code: 'id' },
            ms: { name: 'Melayu', nameEn: 'Malay', dir: 'ltr', flag: '🇲🇾', code: 'ms' },
            de: { name: 'Deutsch', nameEn: 'German', dir: 'ltr', flag: '🇩🇪', code: 'de' },
            zh: { name: '中文', nameEn: 'Chinese', dir: 'ltr', flag: '🇨🇳', code: 'zh-CN' },
            es: { name: 'Español', nameEn: 'Spanish', dir: 'ltr', flag: '🇪🇸', code: 'es' },
            ru: { name: 'Русский', nameEn: 'Russian', dir: 'ltr', flag: '🇷🇺', code: 'ru' },
            pt: { name: 'Português', nameEn: 'Portuguese', dir: 'ltr', flag: '🇧🇷', code: 'pt' },
            hi: { name: 'हिन्दी', nameEn: 'Hindi', dir: 'ltr', flag: '🇮🇳', code: 'hi' },
            ja: { name: '日本語', nameEn: 'Japanese', dir: 'ltr', flag: '🇯🇵', code: 'ja' },
            ko: { name: '한국어', nameEn: 'Korean', dir: 'ltr', flag: '🇰🇷', code: 'ko' },
            it: { name: 'Italiano', nameEn: 'Italian', dir: 'ltr', flag: '🇮🇹', code: 'it' },
            nl: { name: 'Nederlands', nameEn: 'Dutch', dir: 'ltr', flag: '🇳🇱', code: 'nl' },
            pl: { name: 'Polski', nameEn: 'Polish', dir: 'ltr', flag: '🇵🇱', code: 'pl' },
            fa: { name: 'فارسی', nameEn: 'Persian', dir: 'rtl', flag: '🇮🇷', code: 'fa' },
            th: { name: 'ไทย', nameEn: 'Thai', dir: 'ltr', flag: '🇹🇭', code: 'th' },
            vi: { name: 'Tiếng Việt', nameEn: 'Vietnamese', dir: 'ltr', flag: '🇻🇳', code: 'vi' },
            sw: { name: 'Kiswahili', nameEn: 'Swahili', dir: 'ltr', flag: '🇹🇿', code: 'sw' }
        };

        // ═══ ذاكرة الترجمة الدائمة ═══
        this.cache = new Map();
        this.cacheFile = path.join(this.dataDir, 'translation-cache.json');
        this._loadCache();

        // ═══ إحصائيات ═══
        this.stats = {
            totalTranslations: 0,
            cacheHits: 0,
            dictionaryHits: 0,
            apiCalls: 0,
            apiErrors: 0,
            uniquePhrases: this.cache.size,
            startedAt: new Date().toISOString()
        };

        // ═══ حد طلبات API (لتجنب الحظر) ═══
        this._apiQueue = [];
        this._apiProcessing = false;
        this._lastApiCall = 0;
        this._apiDelayMs = 1000; // ثانية بين كل طلب

        console.log(`[TransEngine] ✅ منظومة الترجمة v${this.version} — ${Object.keys(this.languages).length} لغة | ${this.cache.size} ترجمة مخزنة`);
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 1. الترجمة الرئيسية — ذكية ومتعددة المراحل ══════
    // ═══════════════════════════════════════════════════════════════
    async translate(text, targetLang, sourceLang = 'ar') {
        if (!text || !targetLang) return text;
        if (targetLang === sourceLang) return text;
        if (targetLang === 'ar') return text;

        const trimmed = text.trim();
        if (!trimmed) return text;
        this.stats.totalTranslations++;

        // المرحلة 1: البحث في الذاكرة المخزنة
        const cacheKey = `${sourceLang}:${targetLang}:${trimmed}`;
        if (this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }

        // المرحلة 2: البحث في القاموس الخارجي (TRANSLATIONS من server.js)
        if (this._externalDict) {
            const dictResult = this._lookupDictionary(trimmed, targetLang);
            if (dictResult && dictResult !== trimmed) {
                this.stats.dictionaryHits++;
                this._saveToCache(cacheKey, dictResult);
                return dictResult;
            }
        }

        // المرحلة 3: التكسير الذكي — ترجمة العبارات الطويلة كلمة/عبارة
        const smartResult = this._smartFragmentTranslate(trimmed, targetLang);
        if (smartResult !== trimmed && this._translationQuality(smartResult, trimmed) > 0.5) {
            this._saveToCache(cacheKey, smartResult);
            return smartResult;
        }

        // المرحلة 4: الترجمة الآلية عبر API مجاني (MyMemory)
        try {
            const apiResult = await this._translateViaAPI(trimmed, targetLang, sourceLang);
            if (apiResult && apiResult !== trimmed) {
                this._saveToCache(cacheKey, apiResult);
                return apiResult;
            }
        } catch (e) {
            // فشل API — نستخدم أفضل نتيجة متوفرة
        }

        // المرحلة 5: إرجاع أفضل نتيجة (تكسير ذكي أو النص الأصلي)
        if (smartResult !== trimmed) {
            this._saveToCache(cacheKey, smartResult);
            return smartResult;
        }

        return trimmed;
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 2. ترجمة دفعة (Batch) — أسرع ═══════
    // ═══════════════════════════════════════════════════════════════
    async translateBatch(texts, targetLang, sourceLang = 'ar') {
        if (!texts || !Array.isArray(texts)) return [];
        const results = [];
        for (const text of texts) {
            const translated = await this.translate(text, targetLang, sourceLang);
            results.push({ original: text, translation: translated });
        }
        return results;
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 3. البحث في القاموس ═══════
    // ═══════════════════════════════════════════════════════════════
    _lookupDictionary(text, targetLang) {
        if (!this._externalDict) return null;

        // مطابقة تامة
        if (this._externalDict[text] && this._externalDict[text][targetLang]) {
            return this._externalDict[text][targetLang];
        }

        // مطابقة بدون مسافات زائدة
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (this._externalDict[normalized] && this._externalDict[normalized][targetLang]) {
            return this._externalDict[normalized][targetLang];
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 4. التكسير الذكي — يقسم النص لأجزاء ويترجم كل جزء ═══
    // ═══════════════════════════════════════════════════════════════
    _smartFragmentTranslate(text, targetLang) {
        if (!this._externalDict) return text;

        // ترتيب مفاتيح القاموس من الأطول للأقصر (لمطابقة العبارات الطويلة أولاً)
        if (!this._sortedDictKeys) {
            this._sortedDictKeys = Object.keys(this._externalDict)
                .filter(k => k.length >= 2)
                .sort((a, b) => b.length - a.length);
        }

        let result = text;
        let translated = false;

        for (const key of this._sortedDictKeys) {
            if (result.includes(key) && this._externalDict[key][targetLang]) {
                result = result.split(key).join(this._externalDict[key][targetLang]);
                translated = true;
            }
        }

        return translated ? result : text;
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 5. جودة الترجمة ═══════
    // ═══════════════════════════════════════════════════════════════
    _translationQuality(translated, original) {
        if (translated === original) return 0;
        // حساب نسبة الأحرف العربية المتبقية (أقل = أفضل)
        const arabicChars = (translated.match(/[\u0600-\u06FF]/g) || []).length;
        const totalChars = translated.length;
        if (totalChars === 0) return 0;
        // نسبة الترجمة = 1 - (أحرف عربية متبقية / إجمالي الأحرف)
        return 1 - (arabicChars / totalChars);
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 6. API ترجمة آلية مجانية (MyMemory) ═══════
    // ═══════════════════════════════════════════════════════════════
    async _translateViaAPI(text, targetLang, sourceLang = 'ar') {
        // تحديد كود اللغة
        const srcCode = (this.languages[sourceLang] || {}).code || sourceLang;
        const tgtCode = (this.languages[targetLang] || {}).code || targetLang;

        // تحديد سرعة الطلبات
        const now = Date.now();
        if (now - this._lastApiCall < this._apiDelayMs) {
            await new Promise(r => setTimeout(r, this._apiDelayMs - (now - this._lastApiCall)));
        }
        this._lastApiCall = Date.now();

        // حد الطول
        if (text.length > 500) {
            // تقسيم النص الطويل
            const mid = text.lastIndexOf(' ', 250);
            if (mid > 50) {
                const part1 = await this._translateViaAPI(text.slice(0, mid), targetLang, sourceLang);
                const part2 = await this._translateViaAPI(text.slice(mid + 1), targetLang, sourceLang);
                return part1 + ' ' + part2;
            }
        }

        return new Promise((resolve, reject) => {
            const encodedText = encodeURIComponent(text.slice(0, 500));
            const langpair = `${srcCode}|${tgtCode}`;
            const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langpair}&de=market@sheikha.top`;

            this.stats.apiCalls++;

            const req = https.get(url, { timeout: 8000 }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.responseStatus === 200 && json.responseData && json.responseData.translatedText) {
                            const translated = json.responseData.translatedText;
                            // تجاهل الترجمات الفارغة أو المماثلة
                            if (translated && translated.toLowerCase() !== text.toLowerCase()) {
                                resolve(translated);
                            } else {
                                resolve(null);
                            }
                        } else {
                            this.stats.apiErrors++;
                            resolve(null);
                        }
                    } catch (e) {
                        this.stats.apiErrors++;
                        resolve(null);
                    }
                });
            });
            req.on('error', () => { this.stats.apiErrors++; resolve(null); });
            req.on('timeout', () => { req.destroy(); this.stats.apiErrors++; resolve(null); });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 7. الذاكرة الدائمة ═══════
    // ═══════════════════════════════════════════════════════════════
    _loadCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
                if (data && typeof data === 'object') {
                    for (const [k, v] of Object.entries(data)) {
                        this.cache.set(k, v);
                    }
                }
            }
        } catch (_) {}
    }

    _saveToCache(key, value) {
        this.cache.set(key, value);
        this.stats.uniquePhrases = this.cache.size;
        // حفظ كل 50 ترجمة جديدة
        if (this.stats.totalTranslations % 50 === 0) {
            this._persistCache();
        }
    }

    _persistCache() {
        try {
            const obj = {};
            // أقصى 10000 مدخل
            let count = 0;
            for (const [k, v] of this.cache) {
                obj[k] = v;
                count++;
                if (count >= 10000) break;
            }
            fs.writeFileSync(this.cacheFile, JSON.stringify(obj, null, 0));
        } catch (_) {}
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 8. ربط القاموس الخارجي ═══════
    // ═══════════════════════════════════════════════════════════════
    setDictionary(dict) {
        this._externalDict = dict;
        this._sortedDictKeys = null; // إعادة الترتيب
        console.log(`[TransEngine] 📚 تم ربط القاموس — ${Object.keys(dict).length} عبارة`);
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 9. تسجيل APIs في Express ═══════
    // ═══════════════════════════════════════════════════════════════
    registerRoutes(app) {
        const express = require('express');

        // لوحة تحكم الترجمة
        app.get('/api/translation/dashboard', (req, res) => {
            res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                verse: '﴿ وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ ﴾ — الروم ٢٢',
                engine: { name: this.name, version: this.version },
                languages: this.languages,
                totalLanguages: Object.keys(this.languages).length,
                stats: this.stats,
                capabilities: [
                    'قاموس ذكي بالعبارات الكاملة',
                    'مطابقة جزئية — يكسر الجمل الطويلة',
                    'ترجمة آلية مجانية (MyMemory API)',
                    'ذاكرة تراكمية دائمة',
                    'ترجمة صفحات كاملة',
                    'ترجمة دفعة (Batch)',
                    'اتجاه نص تلقائي RTL/LTR'
                ]
            });
        });

        // ترجمة نص واحد
        app.post('/api/translation/translate', express.json(), async (req, res) => {
            try {
                const { text, targetLang, sourceLang = 'ar' } = req.body;
                if (!text || !targetLang) return res.status(400).json({ success: false, message: 'النص واللغة المستهدفة مطلوبان' });
                const translation = await this.translate(text, targetLang, sourceLang);
                res.json({
                    success: true,
                    original: text,
                    translation,
                    sourceLang,
                    targetLang,
                    direction: (this.languages[targetLang] || {}).dir || 'ltr'
                });
            } catch (e) {
                res.status(500).json({ success: false, error: e.message });
            }
        });

        // ترجمة دفعة
        app.post('/api/translation/batch', express.json(), async (req, res) => {
            try {
                const { texts, targetLang, sourceLang = 'ar' } = req.body;
                if (!texts || !Array.isArray(texts) || !targetLang) {
                    return res.status(400).json({ success: false, message: 'النصوص واللغة المستهدفة مطلوبان' });
                }
                const translations = await this.translateBatch(texts.slice(0, 100), targetLang, sourceLang);
                res.json({ success: true, translations, targetLang, sourceLang });
            } catch (e) {
                res.status(500).json({ success: false, error: e.message });
            }
        });

        // اللغات المدعومة
        app.get('/api/translation/languages', (req, res) => {
            res.json({ success: true, languages: this.languages, total: Object.keys(this.languages).length, primary: 'ar' });
        });

        // إحصائيات
        app.get('/api/translation/stats', (req, res) => {
            res.json({ success: true, stats: { ...this.stats, uniquePhrases: this.cache.size } });
        });

        // حفظ الذاكرة
        app.post('/api/translation/save-cache', (req, res) => {
            this._persistCache();
            res.json({ success: true, saved: this.cache.size });
        });

        // إضافة ترجمة يدوية
        app.post('/api/translation/add', express.json(), (req, res) => {
            const { arabic, translations } = req.body;
            if (!arabic || !translations || typeof translations !== 'object') {
                return res.status(400).json({ success: false, message: 'النص العربي والترجمات مطلوبة' });
            }
            // إضافة للقاموس الخارجي
            if (this._externalDict) {
                this._externalDict[arabic] = { ...(this._externalDict[arabic] || {}), ...translations };
                this._sortedDictKeys = null;
            }
            // إضافة للذاكرة
            for (const [lang, trans] of Object.entries(translations)) {
                this._saveToCache(`ar:${lang}:${arabic}`, trans);
            }
            this._persistCache();
            res.json({ success: true, message: 'تم إضافة الترجمة', arabic, translations });
        });

        console.log('[TransEngine] 🌐 تم تسجيل APIs الترجمة المتقدمة');
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ 10. حفظ عند الإغلاق ═══════
    // ═══════════════════════════════════════════════════════════════
    shutdown() {
        this._persistCache();
        console.log(`[TransEngine] 💾 تم حفظ ${this.cache.size} ترجمة`);
    }
}

module.exports = SheikhaTranslationEngine;
