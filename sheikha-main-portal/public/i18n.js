/**
 * شيخة — ترجمة الموقع والنظام
 * العربية أساسية، الإنجليزية وجميع اللغات المدعومة
 * Arabic primary, English and all project languages
 */
const SHEIKHA_I18N = {
    ar: {
        langName: 'العربية',
        dir: 'rtl',
        nav: { home: 'الرئيسية', services: 'خدماتنا', market: 'السوق', scrapSpecialist: 'متخصص السكراب', scrapCommunity: 'مجتمع السكراب', sciences: 'موسوعة المعادن', contact: 'تواصل معنا' },
        hero: { title: 'شريكك الموثوق في عالم المعادن والسكراب', subtitle: 'منصة متكاملة تربط بين المنتجين والمصنعين والتجار ومعيدي التدوير', cta1: 'استكشف السوق', cta2: 'أضف عرضك' },
        scrapPage: { title: 'متخصص السكراب', subtitle: 'حديث تخصصي وهندسي ومختبري وإداري عن السكراب', expertEnv: 'خبير بيئة مجتمعية', specialist: 'تخصصي', engineering: 'هندسي', laboratory: 'مختبري', administrative: 'إداري', personasTitle: 'خبراؤنا الافتراضيون', personasNote: 'شخصيات افتراضية عربية للتمثيل فقط — بدون ادعاء روح أو هوية حقيقية. حلال.', communityTitle: 'مجتمع متخصصي السكراب', communityTagline: 'مساحة احترافية للمهتمين بالسكراب: بحوث وتطوير وتجارة — كل ما يخص السكراب في مكان واحد، بأسلوب أفضل من المنتديات.', communityRulesTitle: 'قواعد المجتمع', communityCtaText: 'الدخول إلى سوق شيخة', communityResearchTitle: 'بحوث للشركات والتقنيات', communityResearchIntro: 'المجتمع يخدم البحوث والتطوير للشركات والتقنيات المتعلقة بالسكراب والمعادن وإعادة تدويرها:', communityResearch1: 'تقنيات الفرز والتحليل والتصنيف (حديد، غير حديدي، نحاس، ألومنيوم، ستانلس، إلخ).', communityResearch2: 'تقنيات الصهر وإعادة التدوير والاقتصاد الدائري.', communityResearch3: 'معايير الجودة والسلامة والامتثال (ISRI ومثيلاتها).', communityResearch4: 'حلول لوجستية وتتبع سلاسل الإمداد والشفافية.', policyTitle: 'السياسات والقوانين', policyAllowRd: 'يُسمح باستخدام المحتوى المنشور في المجتمع لغرض البحث والتطوير', engineTitle: 'محرك التحليل والذكاء الصناعي', engineDesc: 'محرك لتحليل كامل البيانات والتطوير والبحث عن حلول في مجالات السكراب والمعادن وإعادة التدوير. يعمل الذكاء الصناعي على منع الردود المحظورة آلياً — فلا يظهر محتوى مخالف للشريعة أو القانون أو الإساءة أو الاحتيال أو التوجيه للتعامل خارج السوق.', engineFeat1Title: 'تحليل البيانات', engineFeat1Text: 'تحليل كامل للبيانات والتقارير والاتجاهات', engineFeat2Title: 'البحث عن حلول', engineFeat2Text: 'بحث وتطوير وحلول للسكراب والمعادن', engineFeat3Title: 'منع المحظور آلياً', engineFeat3Text: 'ذكاء صناعي يمنع الردود المحظورة تلقائياً' },
        personas: [
            { name: 'شيخة', role: 'خبيرة سكراب ومعادن', specialty: 'تخصصي', bio: 'تصنيف وتقييم وتداول السكراب حسب المعايير العالمية.' },
            { name: 'شيخة', role: 'مهندسة معادن وتدوير', specialty: 'هندسي', bio: 'عمليات الفرز والقطع والصهر وإعادة التدوير.' },
            { name: 'شيخة', role: 'فنية مختبر وتحليل', specialty: 'مختبري', bio: 'تحليل كيميائي وفحص جودة وشهادات المطابقة.' },
            { name: 'شيخة', role: 'مديرة عمليات وإدارة سكراب', specialty: 'إداري', bio: 'إجراءات التوريد والتخزين والمتابعة والامتثال.' },
            { name: 'سلمان', role: 'خبير بيئة مجتمعية', specialty: 'بيئة مجتمعية', bio: 'الاستدامة والاقتصاد الدائري وأثر السكراب على المجتمع والبيئة.', voiceNote: 'صوت عربي' }
        ],
        footer: { rights: 'جميع الحقوق محفوظة.', sheikha: 'سوق شيخة' }
    },
    en: {
        langName: 'English',
        dir: 'ltr',
        nav: { home: 'Home', services: 'Services', market: 'Market', scrapSpecialist: 'Scrap Specialist', scrapCommunity: 'Scrap Community', sciences: 'Metals Encyclopedia', contact: 'Contact' },
        hero: { title: 'Your Trusted Partner in Metals & Scrap', subtitle: 'An integrated platform connecting producers, manufacturers, traders and recyclers', cta1: 'Explore Market', cta2: 'Add Listing' },
        scrapPage: { title: 'Scrap Specialist', subtitle: 'Specialist, engineering, laboratory and administrative focus on scrap', expertEnv: 'Community Environment Expert', specialist: 'Specialist', engineering: 'Engineering', laboratory: 'Laboratory', administrative: 'Administrative', personasTitle: 'Our Virtual Experts', personasNote: 'Arabic virtual personas for representation only — no claim of spirit or real identity. Halal.', communityTitle: 'Scrap Specialists Community', communityTagline: 'A professional space for those interested in scrap: R&D and trade — everything about scrap in one place, better than forums.', communityRulesTitle: 'Community Rules', communityCtaText: 'Go to Sheikha Market', communityResearchTitle: 'Research for Companies & Technologies', communityResearchIntro: 'The community serves R&D for companies and technologies related to scrap, metals and recycling:', communityResearch1: 'Sorting, analysis and classification tech (ferrous, non-ferrous, copper, aluminium, stainless, etc).', communityResearch2: 'Smelting, recycling and circular economy technologies.', communityResearch3: 'Quality, safety and compliance standards (ISRI and equivalents).', communityResearch4: 'Logistics and supply chain tracking and transparency solutions.', policyTitle: 'Policies & Laws', policyAllowRd: 'Content published in the community may be used for research and development purposes', engineTitle: 'Analysis Engine & AI', engineDesc: 'An engine for full data analysis, development and solution search in scrap, metals and recycling. AI automatically blocks prohibited replies — no content that violates Sharia, law, abuse, fraud or off-market dealing.', engineFeat1Title: 'Data Analysis', engineFeat1Text: 'Full analysis of data, reports and trends', engineFeat2Title: 'Solution Search', engineFeat2Text: 'R&D and solutions for scrap and metals', engineFeat3Title: 'Auto-Block Prohibited', engineFeat3Text: 'AI blocks prohibited replies automatically' },
        personas: [
            { name: 'Sheikha', role: 'Scrap & Metals Expert', specialty: 'Specialist', bio: 'Classification, valuation and trading of scrap to international standards.' },
            { name: 'Sheikha', role: 'Metals & Recycling Engineer', specialty: 'Engineering', bio: 'Sorting, cutting, melting and recycling operations.' },
            { name: 'Sheikha', role: 'Laboratory & Analysis Technician', specialty: 'Laboratory', bio: 'Chemical analysis, quality testing and certificates of conformity.' },
            { name: 'Sheikha', role: 'Operations & Scrap Management', specialty: 'Administrative', bio: 'Procurement, storage, follow-up and compliance procedures.' },
            { name: 'Salman', role: 'Community Environment Expert', specialty: 'Community Environment', bio: 'Sustainability, circular economy and impact of scrap on society and environment.', voiceNote: 'Arabic voice' }
        ],
        footer: { rights: 'All rights reserved.', sheikha: 'Sheikha Market' }
    },
    fr: { langName: 'Français', dir: 'ltr', nav: { home: 'Accueil', services: 'Services', market: 'Marché', scrapSpecialist: 'Spécialiste Ferraille', sciences: 'Encyclopédie', contact: 'Contact' }, scrapPage: { title: 'Spécialiste Ferraille', personasTitle: 'Nos experts virtuels' }, footer: { rights: 'Tous droits réservés.', sheikha: 'Marché Sheikha' } },
    tr: { langName: 'Türkçe', dir: 'ltr', nav: { home: 'Ana Sayfa', services: 'Hizmetler', market: 'Pazar', scrapSpecialist: 'Hurda Uzmanı', sciences: 'Ansiklopedi', contact: 'İletişim' }, scrapPage: { title: 'Hurda Uzmanı', personasTitle: 'Sanal uzmanlarımız' }, footer: { rights: 'Tüm hakları saklıdır.', sheikha: 'Sheikha Pazar' } },
    ur: { langName: 'اردو', dir: 'rtl', nav: { home: 'ہوم', services: 'خدمات', market: 'مارکیٹ', scrapSpecialist: 'سکریپ ماہر', contact: 'رابطہ' }, scrapPage: { title: 'سکریپ ماہر', personasTitle: 'ہمارے ورچوئل ماہرین' }, footer: { rights: 'جملہ حقوق محفوظ.', sheikha: 'شیخہ مارکیٹ' } },
    zh: { langName: '中文', dir: 'ltr', nav: { home: '首页', services: '服务', market: '市场', scrapSpecialist: '废料专家', contact: '联系' }, scrapPage: { title: '废料专家', personasTitle: '我们的虚拟专家' }, footer: { rights: '版权所有.', sheikha: 'Sheikha市场' } }
};

function t(keyPath, lang) {
    const l = lang || (typeof currentLang !== 'undefined' ? currentLang : 'ar');
    const data = SHEIKHA_I18N[l] || SHEIKHA_I18N.ar;
    const keys = keyPath.split('.');
    let v = data;
    for (const k of keys) { v = v && v[k]; if (v === undefined) return SHEIKHA_I18N.ar ? (keys.reduce((o, k) => o && o[k], SHEIKHA_I18N.ar)) || keyPath : keyPath; }
    return typeof v === 'object' ? (v.name || v.title || JSON.stringify(v)) : v;
}

function setPageLang(lang) {
    const data = SHEIKHA_I18N[lang] || SHEIKHA_I18N.ar;
    document.documentElement.lang = lang === 'ar' ? 'ar' : lang;
    document.documentElement.dir = data.dir || 'rtl';
    if (typeof currentLang !== 'undefined') currentLang = lang;
    try { localStorage.setItem('sheikha_lang', lang); } catch (e) {}
}

function getStoredLang() {
    try { return localStorage.getItem('sheikha_lang') || 'ar'; } catch (e) { return 'ar'; }
}
