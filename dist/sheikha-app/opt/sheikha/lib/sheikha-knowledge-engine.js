/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA KNOWLEDGE ENGINE — منظومة شيخة المعرفية
 *
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق ١
 * "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ" — الزمر ٩
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة
 *
 * ═══ المصادر المتكاملة ═══
 *   ✅ سعوديبيديا (Saudipedia) — الموسوعة السعودية الرقمية
 *   ✅ ويكيبيديا (Wikipedia) — الموسوعة الحرة (عربي + إنجليزي)
 *   ✅ قاعدة شيخة المعرفية الداخلية
 *   ✅ بحث ذكي متعدد المصادر
 *   ✅ ذاكرة معرفية دائمة (Cache)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class SheikhaKnowledgeEngine {
    constructor() {
        this.name = 'منظومة شيخة المعرفية';
        this.nameEn = 'Sheikha Knowledge Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();

        // ═══ الأساس الشرعي ═══
        this.islamicFoundation = {
            quran: [
                { ayah: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', surah: 'العلق', num: 1, principle: 'أول أمر إلهي: اقرأ — طلب العلم فريضة' },
                { ayah: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', surah: 'الزمر', num: 9, principle: 'تفضيل العلم والمعرفة' },
                { ayah: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', num: 114, principle: 'طلب الزيادة في العلم' },
                { ayah: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', surah: 'المجادلة', num: 11, principle: 'رفعة أهل العلم' },
                { ayah: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا', surah: 'الإسراء', num: 85, principle: 'التواضع المعرفي' },
                { ayah: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', surah: 'البقرة', num: 31, principle: 'العلم أصل التكريم الإلهي' }
            ],
            hadith: [
                { text: 'طلب العلم فريضة على كل مسلم', source: 'ابن ماجه', principle: 'فرضية العلم' },
                { text: 'من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة', source: 'مسلم', principle: 'فضل طلب العلم' },
                { text: 'الحكمة ضالة المؤمن أنّى وجدها فهو أحقّ بها', source: 'الترمذي', principle: 'أخذ العلم من كل مصدر نافع' },
                { text: 'بلّغوا عني ولو آية', source: 'البخاري', principle: 'نشر المعرفة' },
                { text: 'خيركم من تعلّم العلم وعلّمه', source: 'البخاري', principle: 'التعلم والتعليم' }
            ]
        };

        // ═══ المصادر المعرفية ═══
        this.sources = {
            saudipedia: {
                id: 'saudipedia',
                nameAr: 'سعوديبيديا',
                nameEn: 'Saudipedia',
                description: 'الموسوعة السعودية الرقمية — مصدر موثوق للمعرفة عن المملكة العربية السعودية',
                url: 'https://saudipedia.com',
                searchUrl: 'https://saudipedia.com/ar/search?q=',
                icon: '🇸🇦',
                type: 'encyclopedia',
                language: 'ar',
                region: 'السعودية',
                topics: [
                    'تاريخ المملكة', 'الجغرافيا', 'الثقافة والتراث', 'الاقتصاد السعودي',
                    'رؤية 2030', 'المعادن والنفط', 'المدن السعودية', 'الحكومة والأنظمة',
                    'التعليم', 'الصحة', 'السياحة', 'التقنية', 'البيئة',
                    'الفنون والآداب', 'الرياضة', 'المجتمع'
                ],
                categories: [
                    { nameAr: 'التاريخ والتراث', nameEn: 'History & Heritage' },
                    { nameAr: 'الاقتصاد والأعمال', nameEn: 'Economy & Business' },
                    { nameAr: 'الجغرافيا والبيئة', nameEn: 'Geography & Environment' },
                    { nameAr: 'الثقافة والمجتمع', nameEn: 'Culture & Society' },
                    { nameAr: 'التقنية والابتكار', nameEn: 'Technology & Innovation' },
                    { nameAr: 'التعليم والعلوم', nameEn: 'Education & Sciences' },
                    { nameAr: 'المعادن والموارد', nameEn: 'Minerals & Resources' },
                    { nameAr: 'الأنظمة والتشريعات', nameEn: 'Laws & Regulations' }
                ],
                status: 'active',
                trusted: true
            },
            wikipedia_ar: {
                id: 'wikipedia_ar',
                nameAr: 'ويكيبيديا العربية',
                nameEn: 'Arabic Wikipedia',
                description: 'الموسوعة الحرة — أكبر موسوعة متعددة اللغات على الإنترنت',
                url: 'https://ar.wikipedia.org',
                apiUrl: 'https://ar.wikipedia.org/w/api.php',
                searchUrl: 'https://ar.wikipedia.org/wiki/',
                icon: '📖',
                type: 'encyclopedia',
                language: 'ar',
                region: 'عالمي',
                status: 'active',
                trusted: true,
                note: 'يُراجع المحتوى بحكمة — ليست مصدراً شرعياً معتمداً'
            },
            wikipedia_en: {
                id: 'wikipedia_en',
                nameAr: 'ويكيبيديا الإنجليزية',
                nameEn: 'English Wikipedia',
                description: 'The Free Encyclopedia — Largest multilingual encyclopedia',
                url: 'https://en.wikipedia.org',
                apiUrl: 'https://en.wikipedia.org/w/api.php',
                searchUrl: 'https://en.wikipedia.org/wiki/',
                icon: '📚',
                type: 'encyclopedia',
                language: 'en',
                region: 'عالمي',
                status: 'active',
                trusted: true
            }
        };

        // ═══ قاعدة المعرفة الداخلية — شيخة ═══
        this.internalKnowledge = this._buildInternalKnowledge();

        // ═══ ذاكرة البحث ═══
        this.cache = new Map();
        this.maxCache = 500;

        // ═══ إحصائيات ═══
        this.stats = {
            totalSearches: 0,
            wikipediaQueries: 0,
            saudipediaLinks: 0,
            internalHits: 0,
            cacheHits: 0
        };

        console.log(`✅ ${this.name} v${this.version} — ${Object.keys(this.sources).length} مصدر | ${this.internalKnowledge.length} مقال داخلي | ${this.islamicFoundation.quran.length} آية`);
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ قاعدة المعرفة الداخلية ══════
    // ═══════════════════════════════════════════════════════════════
    _buildInternalKnowledge() {
        return [
            // ═══ المعادن ═══
            { id: 'gold', titleAr: 'الذهب', titleEn: 'Gold', category: 'metals',
              summary: 'الذهب (Au) — معدن ثمين ذو لون أصفر لامع، يُستخدم في المجوهرات والاستثمار والصناعة. ذُكر في القرآن الكريم.',
              quran: '﴿ زُيِّنَ لِلنَّاسِ حُبُّ الشَّهَوَاتِ مِنَ النِّسَاءِ وَالْبَنِينَ وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ ﴾ — آل عمران ١٤',
              saudipedia: 'https://saudipedia.com/ar/article/الذهب',
              wikipedia: 'https://ar.wikipedia.org/wiki/ذهب',
              tags: ['ذهب', 'gold', 'Au', 'معدن ثمين', 'استثمار'] },
            { id: 'silver', titleAr: 'الفضة', titleEn: 'Silver', category: 'metals',
              summary: 'الفضة (Ag) — معدن ثمين أبيض لامع، يُستخدم في المجوهرات والصناعة والطب.',
              quran: '﴿ يُطَافُ عَلَيْهِم بِصِحَافٍ مِّن ذَهَبٍ وَأَكْوَابٍ ﴾ — الزخرف ٧١',
              wikipedia: 'https://ar.wikipedia.org/wiki/فضة',
              tags: ['فضة', 'silver', 'Ag', 'معدن ثمين'] },
            { id: 'iron', titleAr: 'الحديد', titleEn: 'Iron', category: 'metals',
              summary: 'الحديد (Fe) — أكثر المعادن استخداماً في العالم، سُميت سورة كاملة باسمه.',
              quran: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾ — الحديد ٢٥',
              saudipedia: 'https://saudipedia.com/ar/article/الحديد',
              wikipedia: 'https://ar.wikipedia.org/wiki/حديد',
              tags: ['حديد', 'iron', 'Fe', 'صلب', 'steel'] },
            { id: 'copper', titleAr: 'النحاس', titleEn: 'Copper', category: 'metals',
              summary: 'النحاس (Cu) — معدن أحمر يُستخدم في الكهرباء والبناء والصناعة.',
              quran: '﴿ آتُونِي زُبَرَ الْحَدِيدِ حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا حَتَّىٰ إِذَا جَعَلَهُ نَارًا قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا ﴾ — الكهف ٩٦',
              wikipedia: 'https://ar.wikipedia.org/wiki/نحاس',
              tags: ['نحاس', 'copper', 'Cu'] },
            // ═══ السعودية ═══
            { id: 'saudi-vision-2030', titleAr: 'رؤية السعودية 2030', titleEn: 'Saudi Vision 2030', category: 'saudi',
              summary: 'رؤية المملكة العربية السعودية 2030 — خطة استراتيجية لتنويع الاقتصاد وتطوير القطاعات غير النفطية.',
              saudipedia: 'https://saudipedia.com/ar/article/رؤية-السعودية-2030',
              wikipedia: 'https://ar.wikipedia.org/wiki/رؤية_السعودية_2030',
              tags: ['رؤية 2030', 'السعودية', 'اقتصاد', 'تنويع'] },
            { id: 'neom', titleAr: 'نيوم', titleEn: 'NEOM', category: 'saudi',
              summary: 'نيوم — مشروع سعودي ضخم لبناء مدينة مستقبلية على ساحل البحر الأحمر.',
              saudipedia: 'https://saudipedia.com/ar/article/نيوم',
              wikipedia: 'https://ar.wikipedia.org/wiki/نيوم',
              tags: ['نيوم', 'NEOM', 'مشروع', 'مستقبل'] },
            { id: 'madinah-market', titleAr: 'سوق المدينة المنورة', titleEn: 'Madinah Market', category: 'islamic',
              summary: 'سوق المدينة المنورة — أول سوق إسلامي أسسه النبي ﷺ على أسس العدل والشفافية.',
              wikipedia: 'https://ar.wikipedia.org/wiki/المدينة_المنورة',
              tags: ['سوق المدينة', 'المدينة المنورة', 'تجارة إسلامية'] },
            // ═══ اقتصاد ═══
            { id: 'islamic-finance', titleAr: 'التمويل الإسلامي', titleEn: 'Islamic Finance', category: 'economy',
              summary: 'التمويل الإسلامي — نظام مالي يقوم على أحكام الشريعة الإسلامية، يحرّم الربا والغرر.',
              saudipedia: 'https://saudipedia.com/ar/article/التمويل-الإسلامي',
              wikipedia: 'https://ar.wikipedia.org/wiki/تمويل_إسلامي',
              tags: ['تمويل إسلامي', 'بنوك إسلامية', 'ربا', 'شريعة'] },
            { id: 'scrap-market', titleAr: 'سوق السكراب', titleEn: 'Scrap Market', category: 'metals',
              summary: 'سوق السكراب والمعادن المعاد تدويرها — قطاع اقتصادي مهم في الاقتصاد الدائري.',
              wikipedia: 'https://ar.wikipedia.org/wiki/خردة',
              tags: ['سكراب', 'خردة', 'إعادة تدوير', 'معادن'] },
            { id: 'eastern-province', titleAr: 'المنطقة الشرقية', titleEn: 'Eastern Province', category: 'saudi',
              summary: 'المنطقة الشرقية — أكبر مناطق المملكة مساحة، مركز صناعة النفط والبتروكيماويات.',
              saudipedia: 'https://saudipedia.com/ar/article/المنطقة-الشرقية',
              wikipedia: 'https://ar.wikipedia.org/wiki/المنطقة_الشرقية_(السعودية)',
              tags: ['المنطقة الشرقية', 'الخبر', 'الدمام', 'الظهران'] },
            { id: 'khobar', titleAr: 'الخبر', titleEn: 'Al Khobar', category: 'saudi',
              summary: 'الخبر — مدينة ساحلية على الخليج العربي، مقر منظومة شيخة.',
              saudipedia: 'https://saudipedia.com/ar/article/الخبر',
              wikipedia: 'https://ar.wikipedia.org/wiki/الخبر',
              tags: ['الخبر', 'Al Khobar', 'شيخة', 'المقر'] }
        ];
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ البحث الموحد — يبحث في كل المصادر ══════
    // ═══════════════════════════════════════════════════════════════
    async search(query, options = {}) {
        if (!query || !query.trim()) return { success: false, message: 'أدخل كلمة البحث' };

        const q = query.trim();
        this.stats.totalSearches++;

        // الذاكرة المخزنة
        const cacheKey = `search:${q}:${options.lang || 'ar'}`;
        if (this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return { success: true, ...this.cache.get(cacheKey), cached: true };
        }

        const results = {
            query: q,
            internal: [],
            wikipedia: [],
            saudipedia: null,
            timestamp: new Date().toISOString()
        };

        // 1. بحث داخلي
        results.internal = this._searchInternal(q);

        // 2. بحث ويكيبيديا
        try {
            const lang = options.lang || 'ar';
            results.wikipedia = await this._searchWikipedia(q, lang);
        } catch (e) {
            results.wikipedia = [];
        }

        // 3. رابط سعوديبيديا
        results.saudipedia = {
            searchUrl: this.sources.saudipedia.searchUrl + encodeURIComponent(q),
            directUrl: this.sources.saudipedia.url,
            note: 'بحث مباشر في سعوديبيديا'
        };
        this.stats.saudipediaLinks++;

        // حفظ في الذاكرة
        if (this.cache.size > this.maxCache) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, results);

        return { success: true, ...results };
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ بحث داخلي ══════
    // ═══════════════════════════════════════════════════════════════
    _searchInternal(query) {
        const q = query.toLowerCase();
        return this.internalKnowledge.filter(item => {
            const searchText = [
                item.titleAr, item.titleEn, item.summary,
                ...(item.tags || [])
            ].join(' ').toLowerCase();
            return searchText.includes(q);
        }).map(item => ({
            id: item.id,
            titleAr: item.titleAr,
            titleEn: item.titleEn,
            summary: item.summary,
            category: item.category,
            quran: item.quran || null,
            links: {
                saudipedia: item.saudipedia || null,
                wikipedia: item.wikipedia || null
            }
        }));
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ بحث ويكيبيديا عبر API ══════
    // ═══════════════════════════════════════════════════════════════
    async _searchWikipedia(query, lang = 'ar') {
        const apiUrl = lang === 'en'
            ? this.sources.wikipedia_en.apiUrl
            : this.sources.wikipedia_ar.apiUrl;

        const params = new URLSearchParams({
            action: 'query',
            list: 'search',
            srsearch: query,
            srlimit: '5',
            utf8: '1',
            format: 'json'
        });

        this.stats.wikipediaQueries++;

        return new Promise((resolve, reject) => {
            const url = `${apiUrl}?${params.toString()}`;
            const req = https.get(url, { timeout: 8000 }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.query && json.query.search) {
                            const results = json.query.search.map(item => ({
                                title: item.title,
                                snippet: (item.snippet || '').replace(/<[^>]*>/g, ''), // إزالة HTML
                                wordcount: item.wordcount,
                                url: lang === 'en'
                                    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`
                                    : `https://ar.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
                                source: lang === 'en' ? 'wikipedia_en' : 'wikipedia_ar'
                            }));
                            resolve(results);
                        } else {
                            resolve([]);
                        }
                    } catch (e) {
                        resolve([]);
                    }
                });
            });
            req.on('error', () => resolve([]));
            req.on('timeout', () => { req.destroy(); resolve([]); });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ جلب مقال ويكيبيديا (ملخص) ══════
    // ═══════════════════════════════════════════════════════════════
    async getWikipediaArticle(title, lang = 'ar') {
        const apiUrl = lang === 'en'
            ? this.sources.wikipedia_en.apiUrl
            : this.sources.wikipedia_ar.apiUrl;

        const params = new URLSearchParams({
            action: 'query',
            titles: title,
            prop: 'extracts|pageimages|info',
            exintro: '1',
            explaintext: '1',
            pithumbsize: '300',
            inprop: 'url',
            format: 'json'
        });

        return new Promise((resolve, reject) => {
            const url = `${apiUrl}?${params.toString()}`;
            const req = https.get(url, { timeout: 8000 }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const pages = json.query && json.query.pages;
                        if (pages) {
                            const pageId = Object.keys(pages)[0];
                            if (pageId && pageId !== '-1') {
                                const page = pages[pageId];
                                resolve({
                                    success: true,
                                    title: page.title,
                                    extract: page.extract || '',
                                    thumbnail: page.thumbnail ? page.thumbnail.source : null,
                                    url: page.fullurl || page.canonicalurl || null,
                                    source: lang === 'en' ? 'wikipedia_en' : 'wikipedia_ar'
                                });
                                return;
                            }
                        }
                        resolve({ success: false, message: 'المقال غير موجود' });
                    } catch (e) {
                        resolve({ success: false, message: 'خطأ في جلب المقال' });
                    }
                });
            });
            req.on('error', () => resolve({ success: false, message: 'خطأ في الاتصال' }));
            req.on('timeout', () => { req.destroy(); resolve({ success: false, message: 'انتهت مهلة الاتصال' }); });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ تسجيل APIs في Express ══════
    // ═══════════════════════════════════════════════════════════════
    registerRoutes(app) {
        const express = require('express');

        // لوحة تحكم المعرفة
        app.get('/api/knowledge/dashboard', (req, res) => {
            res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                verse: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق ١',
                engine: { name: this.name, version: this.version },
                sources: Object.values(this.sources).map(s => ({
                    id: s.id, nameAr: s.nameAr, nameEn: s.nameEn,
                    url: s.url, icon: s.icon, status: s.status
                })),
                internalArticles: this.internalKnowledge.length,
                islamicFoundation: {
                    quranReferences: this.islamicFoundation.quran.length,
                    hadithReferences: this.islamicFoundation.hadith.length
                },
                stats: this.stats
            });
        });

        // بحث موحد
        app.get('/api/knowledge/search', async (req, res) => {
            try {
                const { q, lang } = req.query;
                if (!q) return res.status(400).json({ success: false, message: 'أدخل كلمة البحث — ?q=...' });
                const results = await this.search(q, { lang: lang || 'ar' });
                res.json(results);
            } catch (e) {
                res.status(500).json({ success: false, error: e.message });
            }
        });

        // جلب مقال ويكيبيديا
        app.get('/api/knowledge/wikipedia', async (req, res) => {
            try {
                const { title, lang } = req.query;
                if (!title) return res.status(400).json({ success: false, message: 'عنوان المقال مطلوب — ?title=...' });
                const article = await this.getWikipediaArticle(title, lang || 'ar');
                res.json(article);
            } catch (e) {
                res.status(500).json({ success: false, error: e.message });
            }
        });

        // المصادر المتاحة
        app.get('/api/knowledge/sources', (req, res) => {
            res.json({
                success: true,
                sources: this.sources,
                islamicFoundation: this.islamicFoundation
            });
        });

        // المقالات الداخلية
        app.get('/api/knowledge/articles', (req, res) => {
            const { category } = req.query;
            let articles = this.internalKnowledge;
            if (category) articles = articles.filter(a => a.category === category);
            res.json({ success: true, articles, total: articles.length });
        });

        // رابط سعوديبيديا مباشر
        app.get('/api/knowledge/saudipedia', (req, res) => {
            const { q } = req.query;
            res.json({
                success: true,
                source: this.sources.saudipedia,
                searchUrl: q
                    ? this.sources.saudipedia.searchUrl + encodeURIComponent(q)
                    : this.sources.saudipedia.url,
                categories: this.sources.saudipedia.categories
            });
        });

        // إحصائيات
        app.get('/api/knowledge/stats', (req, res) => {
            res.json({ success: true, stats: this.stats });
        });

        console.log('   📚 Knowledge APIs: /api/knowledge/dashboard, /search, /wikipedia, /saudipedia, /articles, /sources');
    }

    // ═══════════════════════════════════════════════════════════════
    // ══════ ملخص للمحرك ══════
    // ═══════════════════════════════════════════════════════════════
    getSummary() {
        return {
            name: this.name,
            version: this.version,
            sources: Object.keys(this.sources).length,
            articles: this.internalKnowledge.length,
            quranRefs: this.islamicFoundation.quran.length,
            hadithRefs: this.islamicFoundation.hadith.length,
            stats: this.stats
        };
    }
}

module.exports = SheikhaKnowledgeEngine;
