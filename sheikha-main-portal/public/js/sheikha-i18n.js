/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * نظام شيخة للترجمة متعدد اللغات — Sheikha i18n System
 *
 * الأساس: اللغة العربية — "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ" — يوسف ٢
 * الترجمة: للمستخدمين الأعاجم — كل محتوى عربي يُترجم للغة المختارة
 *
 * الآلية:
 * ١. العربية هي الأصل دائماً (RTL)
 * ٢. إذا اختار المستخدم لغة أخرى: يُترجم كل النص المعروض
 * ٣. في السوق والمنتدى: النصوص المكتوبة بالعربي تظهر مترجمة للأعجمي
 * ٤. النصوص المكتوبة بلغة أعجمية تظهر بالعربي للعرب
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const SheikhaI18n = (function() {

    const SUPPORTED_LANGS = {
        ar: { name: 'العربية', nameEn: 'Arabic', dir: 'rtl', flag: '🇸🇦', isArabic: true },
        en: { name: 'English', nameEn: 'English', dir: 'ltr', flag: '🇬🇧', isArabic: false },
        fr: { name: 'Français', nameEn: 'French', dir: 'ltr', flag: '🇫🇷', isArabic: false },
        tr: { name: 'Türkçe', nameEn: 'Turkish', dir: 'ltr', flag: '🇹🇷', isArabic: false },
        ur: { name: 'اردو', nameEn: 'Urdu', dir: 'rtl', flag: '🇵🇰', isArabic: false },
        id: { name: 'Indonesia', nameEn: 'Indonesian', dir: 'ltr', flag: '🇮🇩', isArabic: false },
        ms: { name: 'Melayu', nameEn: 'Malay', dir: 'ltr', flag: '🇲🇾', isArabic: false },
        de: { name: 'Deutsch', nameEn: 'German', dir: 'ltr', flag: '🇩🇪', isArabic: false },
        zh: { name: '中文', nameEn: 'Chinese', dir: 'ltr', flag: '🇨🇳', isArabic: false },
        es: { name: 'Español', nameEn: 'Spanish', dir: 'ltr', flag: '🇪🇸', isArabic: false },
        ru: { name: 'Русский', nameEn: 'Russian', dir: 'ltr', flag: '🇷🇺', isArabic: false },
        hi: { name: 'हिन्दी', nameEn: 'Hindi', dir: 'ltr', flag: '🇮🇳', isArabic: false },
        bn: { name: 'বাংলা', nameEn: 'Bengali', dir: 'ltr', flag: '🇧🇩', isArabic: false },
        sw: { name: 'Kiswahili', nameEn: 'Swahili', dir: 'ltr', flag: '🇹🇿', isArabic: false }
    };

    // الواجهة العامة المترجمة — UI translations
    const UI_TRANSLATIONS = {
        en: {
            home: 'Home', market: 'Market', sharia: 'Sharia', community: 'Community',
            map: 'Map', register: 'Register as Trader', login: 'Login',
            search: 'Search...', loading: 'Loading...', 'lang-switch': 'Language',
            copyright: '© Sheikha Market & Ecosystem', owner: 'Owner: Salman Ahmed bin Salman Al-Rajeh',
            footer_loc: 'Al-Khobar, Eastern Province, Saudi Arabia',
            based_on: 'Built on Quran & Sunnah'
        },
        fr: {
            home: 'Accueil', market: 'Marché', sharia: 'Charia', community: 'Communauté',
            map: 'Carte', register: 'S\'inscrire', login: 'Connexion',
            search: 'Rechercher...', loading: 'Chargement...',
            copyright: '© Marché et Écosystème Sheikha', owner: 'Propriétaire: Salman Ahmed bin Salman Al-Rajeh',
            based_on: 'Basé sur le Coran et la Sunna'
        },
        tr: {
            home: 'Ana Sayfa', market: 'Pazar', sharia: 'Şeriat', community: 'Topluluk',
            map: 'Harita', register: 'Tüccar Ol', login: 'Giriş',
            copyright: '© Sheikha Pazar ve Ekosistem', based_on: 'Kuran ve Sünnet Üzerine İnşa Edildi'
        },
        ur: {
            home: 'ہوم', market: 'مارکیٹ', sharia: 'شریعت', community: 'کمیونٹی',
            map: 'نقشہ', register: 'تاجر بنیں', login: 'لاگ ان',
            copyright: '© شیخہ مارکیٹ اور ایکو سسٹم', based_on: 'قرآن و سنت پر مبنی'
        },
        id: {
            home: 'Beranda', market: 'Pasar', sharia: 'Syariah', community: 'Komunitas',
            map: 'Peta', register: 'Daftar Pedagang', login: 'Masuk',
            copyright: '© Pasar dan Ekosistem Sheikha', based_on: 'Berdasarkan Quran & Sunnah'
        }
    };

    let _currentLang = 'ar';
    let _originalTexts = new Map();

    function getCurrentLang() { return _currentLang; }
    function getSupportedLangs() { return SUPPORTED_LANGS; }
    function isRTL(lang) { return (SUPPORTED_LANGS[lang] || {}).dir === 'rtl'; }

    function setLanguage(lang) {
        if (!SUPPORTED_LANGS[lang]) lang = 'ar';
        _currentLang = lang;
        localStorage.setItem('sheikha-lang', lang);

        // Update HTML direction
        document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // Translate UI elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (!_originalTexts.has(el)) _originalTexts.set(el, el.textContent);
            if (lang === 'ar') {
                el.textContent = _originalTexts.get(el);
            } else {
                const key = el.dataset.i18n;
                const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en || {};
                if (dict[key]) el.textContent = dict[key];
            }
        });

        // If not Arabic and API available, translate remaining visible text via server
        if (lang !== 'ar') {
            _translatePageContent(lang);
        }

        // Update language switcher button text
        document.querySelectorAll('.sheikha-lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Dispatch event for custom handlers
        document.dispatchEvent(new CustomEvent('sheikha-lang-changed', { detail: { lang, dir: isRTL(lang) ? 'rtl' : 'ltr' } }));
    }

    // ═══ ترجمة محتوى الصفحة عبر API أو القاموس المحلي ═══
    const _translationCache = {};
    function _translatePageContent(lang) {
        // Translate elements that have data-translate attribute or visible text content
        const translatableSelectors = 'h1, h2, h3, h4, h5, h6, p, a, button, label, span, .sec-label, .pillar p, .id-card p, .tl-content p, .tl-content h3, .opening-sub';
        const elements = document.querySelectorAll(translatableSelectors);
        const toTranslate = [];

        elements.forEach(el => {
            // Skip already translated elements, hidden elements, and script/style
            if (el.dataset.i18n) return;
            if (el.closest('script, style, .sheikha-i18n-switcher')) return;
            if (!el.textContent.trim()) return;
            // Only translate Arabic text
            const text = el.textContent.trim();
            if (!/[\u0600-\u06FF]/.test(text)) return;
            if (text.length < 3 || text.length > 500) return;

            if (!el._origText) el._origText = text;

            const cacheKey = lang + ':' + el._origText;
            if (_translationCache[cacheKey]) {
                el.textContent = _translationCache[cacheKey];
                return;
            }
            toTranslate.push(el);
        });

        // Batch translate via API (if available)
        if (toTranslate.length > 0) {
            const texts = toTranslate.map(el => el._origText);
            const uniqueTexts = [...new Set(texts)];

            fetch('/api/i18n/translate-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: uniqueTexts.slice(0, 50), targetLang: lang, sourceLang: 'ar' })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.translations) {
                    const transMap = {};
                    uniqueTexts.forEach((t, i) => {
                        if (data.translations[i]) {
                            // Handle both string and object response formats
                            const translated = typeof data.translations[i] === 'object' 
                                ? (data.translations[i].translation || data.translations[i].text || t)
                                : data.translations[i];
                            transMap[t] = translated;
                            _translationCache[lang + ':' + t] = translated;
                        }
                    });
                    toTranslate.forEach(el => {
                        if (transMap[el._origText]) {
                            el.textContent = transMap[el._origText];
                        }
                    });
                }
            })
            .catch((err) => {
                console.log('i18n: API not available, using dictionary fallback');
            });
        }
    }

    // Create the language switcher HTML
    function createSwitcher(targetId) {
        const container = document.getElementById(targetId);
        if (!container) return;

        const mainLangs = ['ar', 'en', 'fr', 'tr', 'ur', 'id'];
        container.innerHTML = `
            <div class="sheikha-i18n-switcher">
                <div class="sheikha-lang-main">
                    ${mainLangs.map(l => `<button class="sheikha-lang-btn ${l === _currentLang ? 'active' : ''}" data-lang="${l}" title="${SUPPORTED_LANGS[l].nameEn}">${SUPPORTED_LANGS[l].flag} ${SUPPORTED_LANGS[l].name}</button>`).join('')}
                </div>
            </div>`;

        container.addEventListener('click', e => {
            const btn = e.target.closest('.sheikha-lang-btn');
            if (btn) setLanguage(btn.dataset.lang);
        });
    }

    // Auto-detect user language
    function detectLanguage() {
        const saved = localStorage.getItem('sheikha-lang');
        if (saved && SUPPORTED_LANGS[saved]) return saved;
        const browser = (navigator.language || 'ar').slice(0, 2);
        return SUPPORTED_LANGS[browser] ? browser : 'ar';
    }

    // Initialize
    function init(switcherId) {
        _currentLang = detectLanguage();
        if (switcherId) createSwitcher(switcherId);
        // Store originals first
        document.querySelectorAll('[data-i18n]').forEach(el => { _originalTexts.set(el, el.textContent); });
        if (_currentLang !== 'ar') setLanguage(_currentLang);
    }

    return { init, setLanguage, getCurrentLang, getSupportedLangs, isRTL, detectLanguage, createSwitcher, UI_TRANSLATIONS };
})();

// Export for Node if needed
if (typeof module !== 'undefined' && module.exports) module.exports = SheikhaI18n;
