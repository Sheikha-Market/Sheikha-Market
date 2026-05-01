/**
 * 🌍 نظام الترجمة الآلية لسوق شيخة
 * Sheikha Market Auto Translation System
 * 
 * العربية هي اللغة الأساسية
 * Arabic is the primary language
 */

const SheikhaI18n = (function() {
    'use strict';

    // اللغات المدعومة
    const LANGUAGES = {
        ar: { name: 'العربية', nameEn: 'Arabic', dir: 'rtl', flag: '🇸🇦', primary: true },
        en: { name: 'English', nameEn: 'English', dir: 'ltr', flag: '🇺🇸' },
        zh: { name: '中文', nameEn: 'Chinese', dir: 'ltr', flag: '🇨🇳' },
        hi: { name: 'हिन्दी', nameEn: 'Hindi', dir: 'ltr', flag: '🇮🇳' },
        es: { name: 'Español', nameEn: 'Spanish', dir: 'ltr', flag: '🇪🇸' },
        fr: { name: 'Français', nameEn: 'French', dir: 'ltr', flag: '🇫🇷' },
        ru: { name: 'Русский', nameEn: 'Russian', dir: 'ltr', flag: '🇷🇺' },
        pt: { name: 'Português', nameEn: 'Portuguese', dir: 'ltr', flag: '🇧🇷' },
        de: { name: 'Deutsch', nameEn: 'German', dir: 'ltr', flag: '🇩🇪' },
        ja: { name: '日本語', nameEn: 'Japanese', dir: 'ltr', flag: '🇯🇵' },
        ko: { name: '한국어', nameEn: 'Korean', dir: 'ltr', flag: '🇰🇷' },
        tr: { name: 'Türkçe', nameEn: 'Turkish', dir: 'ltr', flag: '🇹🇷' },
        ur: { name: 'اردو', nameEn: 'Urdu', dir: 'rtl', flag: '🇵🇰' },
        fa: { name: 'فارسی', nameEn: 'Persian', dir: 'rtl', flag: '🇮🇷' },
        id: { name: 'Bahasa Indonesia', nameEn: 'Indonesian', dir: 'ltr', flag: '🇮🇩' },
        ms: { name: 'Bahasa Melayu', nameEn: 'Malay', dir: 'ltr', flag: '🇲🇾' },
        th: { name: 'ไทย', nameEn: 'Thai', dir: 'ltr', flag: '🇹🇭' },
        vi: { name: 'Tiếng Việt', nameEn: 'Vietnamese', dir: 'ltr', flag: '🇻🇳' },
        it: { name: 'Italiano', nameEn: 'Italian', dir: 'ltr', flag: '🇮🇹' },
        nl: { name: 'Nederlands', nameEn: 'Dutch', dir: 'ltr', flag: '🇳🇱' },
        pl: { name: 'Polski', nameEn: 'Polish', dir: 'ltr', flag: '🇵🇱' },
        uk: { name: 'Українська', nameEn: 'Ukrainian', dir: 'ltr', flag: '🇺🇦' },
        bn: { name: 'বাংলা', nameEn: 'Bengali', dir: 'ltr', flag: '🇧🇩' },
        tl: { name: 'Tagalog', nameEn: 'Tagalog', dir: 'ltr', flag: '🇵🇭' },
        sw: { name: 'Kiswahili', nameEn: 'Swahili', dir: 'ltr', flag: '🇰🇪' }
    };

    // القاموس المحلي (للاستخدام السريع بدون API)
    const LOCAL_DICTIONARY = {
        // الواجهة الأساسية
        'سوق شيخة': { en: 'Sheikha Market', zh: '谢赫市场', fr: 'Marché Sheikha', es: 'Mercado Sheikha', de: 'Sheikha Markt' },
        'تسجيل الدخول': { en: 'Login', zh: '登录', fr: 'Connexion', es: 'Iniciar sesión', de: 'Anmelden' },
        'تسجيل جديد': { en: 'Register', zh: '注册', fr: "S'inscrire", es: 'Registrarse', de: 'Registrieren' },
        'السوق': { en: 'Market', zh: '市场', fr: 'Marché', es: 'Mercado', de: 'Markt' },
        'المنتجات': { en: 'Products', zh: '产品', fr: 'Produits', es: 'Productos', de: 'Produkte' },
        'أضف إلى السلة': { en: 'Add to Cart', zh: '加入购物车', fr: 'Ajouter au panier', es: 'Añadir al carrito' },
        'اشترِ الآن': { en: 'Buy Now', zh: '立即购买', fr: 'Acheter maintenant', es: 'Comprar ahora' },
        'الدفع': { en: 'Payment', zh: '付款', fr: 'Paiement', es: 'Pago', de: 'Zahlung' },
        'الشحن': { en: 'Shipping', zh: '配送', fr: 'Livraison', es: 'Envío', de: 'Versand' },
        'البحث': { en: 'Search', zh: '搜索', fr: 'Rechercher', es: 'Buscar', de: 'Suchen' },
        'السعر': { en: 'Price', zh: '价格', fr: 'Prix', es: 'Precio', de: 'Preis' },
        'مرحباً بك': { en: 'Welcome', zh: '欢迎', fr: 'Bienvenue', es: 'Bienvenido', de: 'Willkommen' },
        'تم بنجاح': { en: 'Success', zh: '成功', fr: 'Succès', es: 'Éxito', de: 'Erfolg' },
        'خطأ': { en: 'Error', zh: '错误', fr: 'Erreur', es: 'Error', de: 'Fehler' },
        'ريال سعودي': { en: 'Saudi Riyal', zh: '沙特里亚尔', fr: 'Riyal saoudien', es: 'Riyal saudí' },
        'كيلوجرام': { en: 'Kilogram', zh: '公斤', fr: 'Kilogramme', es: 'Kilogramo' },
        'طن': { en: 'Ton', zh: '吨', fr: 'Tonne', es: 'Tonelada', de: 'Tonne' },
        // المعادن
        'نحاس': { en: 'Copper', zh: '铜', fr: 'Cuivre', es: 'Cobre', de: 'Kupfer' },
        'ألمنيوم': { en: 'Aluminum', zh: '铝', fr: 'Aluminium', es: 'Aluminio', de: 'Aluminium' },
        'حديد': { en: 'Iron', zh: '铁', fr: 'Fer', es: 'Hierro', de: 'Eisen' },
        'ذهب': { en: 'Gold', zh: '黄金', fr: 'Or', es: 'Oro', de: 'Gold' },
        'فضة': { en: 'Silver', zh: '白银', fr: 'Argent', es: 'Plata', de: 'Silber' },
        'سكراب': { en: 'Scrap', zh: '废料', fr: 'Ferraille', es: 'Chatarra', de: 'Schrott' },
        // الأزرار والإجراءات
        'إرسال': { en: 'Send', zh: '发送', fr: 'Envoyer', es: 'Enviar', de: 'Senden' },
        'إلغاء': { en: 'Cancel', zh: '取消', fr: 'Annuler', es: 'Cancelar', de: 'Abbrechen' },
        'حفظ': { en: 'Save', zh: '保存', fr: 'Sauvegarder', es: 'Guardar', de: 'Speichern' },
        'تعديل': { en: 'Edit', zh: '编辑', fr: 'Modifier', es: 'Editar', de: 'Bearbeiten' },
        'حذف': { en: 'Delete', zh: '删除', fr: 'Supprimer', es: 'Eliminar', de: 'Löschen' },
        'تأكيد': { en: 'Confirm', zh: '确认', fr: 'Confirmer', es: 'Confirmar', de: 'Bestätigen' },
        // الرسائل
        'شريكك الموثوق في عالم المعادن': { en: 'Your trusted partner in the world of metals', zh: '您在金属世界的可信赖伙伴' },
        'لا ضرر ولا ضرار': { en: 'No harm, no foul', zh: '不伤害，不受害', fr: 'Sans préjudice' }
    };

    // الذاكرة المؤقتة
    let cache = new Map();
    let currentLang = localStorage.getItem('sheikha_lang') || 'ar';

    // تحديد اللغة من المتصفح
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        return LANGUAGES[langCode] ? langCode : 'en';
    }

    // الحصول على اللغة الحالية
    function getCurrentLanguage() {
        return currentLang;
    }

    // تغيير اللغة
    function setLanguage(langCode) {
        if (LANGUAGES[langCode]) {
            currentLang = langCode;
            localStorage.setItem('sheikha_lang', langCode);
            updatePageDirection();
            translatePage();
            return true;
        }
        return false;
    }

    // تحديث اتجاه الصفحة
    function updatePageDirection() {
        const langInfo = LANGUAGES[currentLang];
        document.documentElement.dir = langInfo.dir;
        document.documentElement.lang = currentLang;
        document.body.style.direction = langInfo.dir;
        
        // تحديث CSS للاتجاه
        if (langInfo.dir === 'rtl') {
            document.body.classList.add('rtl');
            document.body.classList.remove('ltr');
        } else {
            document.body.classList.add('ltr');
            document.body.classList.remove('rtl');
        }
    }

    // ترجمة نص واحد
    function translate(text, targetLang = currentLang) {
        if (!text || targetLang === 'ar') return text;

        // البحث في القاموس المحلي
        if (LOCAL_DICTIONARY[text] && LOCAL_DICTIONARY[text][targetLang]) {
            return LOCAL_DICTIONARY[text][targetLang];
        }

        // البحث في الذاكرة المؤقتة
        const cacheKey = `${text}:${targetLang}`;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        return text;
    }

    // ترجمة عبر API
    async function translateAsync(text, targetLang = currentLang) {
        if (!text || targetLang === 'ar') return text;

        // البحث المحلي أولاً
        const localTranslation = translate(text, targetLang);
        if (localTranslation !== text) return localTranslation;

        // طلب من API
        try {
            const response = await fetch('/api/i18n/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang, sourceLang: 'ar' })
            });
            const data = await response.json();
            if (data.success && data.translation) {
                cache.set(`${text}:${targetLang}`, data.translation);
                return data.translation;
            }
        } catch (error) {
            console.error('Translation API error:', error);
        }

        return text;
    }

    // ترجمة مجموعة نصوص
    async function translateBatch(texts, targetLang = currentLang) {
        if (!texts || !texts.length || targetLang === 'ar') return texts;

        try {
            const response = await fetch('/api/i18n/translate-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts, targetLang, sourceLang: 'ar' })
            });
            const data = await response.json();
            if (data.success) {
                return data.translations.map(t => t.translation);
            }
        } catch (error) {
            console.error('Batch translation error:', error);
        }

        return texts;
    }

    // ترجمة الصفحة كاملة
    function translatePage() {
        if (currentLang === 'ar') {
            location.reload(); // إعادة تحميل للعودة للعربية
            return;
        }

        // ترجمة العناصر المعلّمة
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = translate(key, currentLang);
            if (translation !== key) {
                el.textContent = translation;
            }
        });

        // ترجمة النصوص العربية الظاهرة
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, th, td').forEach(async el => {
            const text = el.textContent.trim();
            if (text && /[\u0600-\u06FF]/.test(text)) { // نص عربي
                const translated = translate(text, currentLang);
                if (translated !== text) {
                    el.textContent = translated;
                }
            }
        });

        // ترجمة placeholders
        document.querySelectorAll('[placeholder]').forEach(el => {
            const placeholder = el.getAttribute('placeholder');
            if (/[\u0600-\u06FF]/.test(placeholder)) {
                const translated = translate(placeholder, currentLang);
                if (translated !== placeholder) {
                    el.setAttribute('placeholder', translated);
                }
            }
        });

        // ترجمة title
        const pageTitle = document.title;
        if (/[\u0600-\u06FF]/.test(pageTitle)) {
            const translated = translate(pageTitle, currentLang);
            if (translated !== pageTitle) {
                document.title = translated;
            }
        }
    }

    // إنشاء محدد اللغات
    function createLanguageSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const selector = document.createElement('div');
        selector.className = 'sheikha-lang-selector';
        selector.innerHTML = `
            <button class="lang-btn" onclick="SheikhaI18n.toggleDropdown()">
                <span class="lang-flag">${LANGUAGES[currentLang].flag}</span>
                <span class="lang-name">${LANGUAGES[currentLang].name}</span>
                <span class="lang-arrow">▼</span>
            </button>
            <div class="lang-dropdown" id="langDropdown">
                ${Object.entries(LANGUAGES).map(([code, info]) => `
                    <div class="lang-option ${code === currentLang ? 'active' : ''}" 
                         onclick="SheikhaI18n.setLanguage('${code}')">
                        <span class="lang-flag">${info.flag}</span>
                        <span class="lang-name">${info.name}</span>
                        <span class="lang-name-en">${info.nameEn}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(selector);
        addSelectorStyles();
    }

    // إضافة أنماط المحدد
    function addSelectorStyles() {
        if (document.getElementById('sheikha-i18n-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'sheikha-i18n-styles';
        styles.textContent = `
            .sheikha-lang-selector {
                position: relative;
                display: inline-block;
            }
            .lang-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: inherit;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.9rem;
                transition: all 0.3s;
            }
            .lang-btn:hover {
                background: rgba(212, 175, 55, 0.2);
                border-color: #d4af37;
            }
            .lang-flag { font-size: 1.2rem; }
            .lang-arrow { font-size: 0.7rem; opacity: 0.7; }
            .lang-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                min-width: 200px;
                max-height: 400px;
                overflow-y: auto;
                background: #0d1424;
                border: 1px solid #1e3a5f;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                z-index: 1000;
                display: none;
                margin-top: 8px;
            }
            .lang-dropdown.show { display: block; }
            .lang-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .lang-option:hover { background: rgba(212, 175, 55, 0.1); }
            .lang-option.active { background: rgba(212, 175, 55, 0.2); }
            .lang-option .lang-name { flex: 1; }
            .lang-option .lang-name-en { 
                font-size: 0.8rem; 
                opacity: 0.6;
            }
            /* RTL Support */
            .rtl .lang-dropdown { right: auto; left: 0; }
            .ltr .sheikha-lang-selector { direction: ltr; }
        `;
        document.head.appendChild(styles);
    }

    // تبديل القائمة المنسدلة
    function toggleDropdown() {
        const dropdown = document.getElementById('langDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sheikha-lang-selector')) {
            const dropdown = document.getElementById('langDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });

    // تهيئة تلقائية
    function init() {
        // تحديث الاتجاه
        updatePageDirection();
        
        // الترجمة التلقائية إذا لم تكن العربية
        if (currentLang !== 'ar') {
            translatePage();
        }
    }

    // تشغيل عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API العام
    return {
        LANGUAGES,
        getCurrentLanguage,
        setLanguage,
        translate,
        translateAsync,
        translateBatch,
        translatePage,
        createLanguageSelector,
        toggleDropdown,
        detectBrowserLanguage,
        init
    };
})();

// جعله متاحاً عالمياً
window.SheikhaI18n = SheikhaI18n;
window.__ = SheikhaI18n.translate; // اختصار للترجمة
