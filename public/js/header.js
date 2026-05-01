/**
 * نظام القوائم الموحد - منظومة شيخة
 * Sheikha Unified Navigation System
 */

// تعريف الأقسام الرئيسية
const SECTIONS = {
    market: {
        title: 'السوق والتجارة',
        icon: '🛒',
        items: [
            { href: '/السوق.html', icon: '🛒', title: 'سوق المعادن', desc: 'تصفح وشراء المعادن والسكراب' },
            { href: '/المتاجر.html', icon: '🏪', title: 'المتاجر', desc: 'تصفح متاجر التجار' },
            { href: '/عرض-بضائع.html', icon: '📦', title: 'عرض بضائع', desc: 'أضف منتجاتك للبيع' },
            { href: '/آلية-البيع.html', icon: '⚖️', title: 'آلية البيع', desc: 'كيف تعمل المنظومة' }
        ]
    },
    supplyChain: {
        title: 'سلسلة التوريد',
        icon: '🔗',
        items: [
            { href: '/نظام-شيخة-الذكي.html', icon: '🔗', title: 'الشبكات التجارية', desc: 'نظام شيخة الذكي المتكامل' },
            { href: '/enterprise.html', icon: '🏭', title: 'المشاريع الضخمة', desc: 'مناجم، مصاهر، مصانع' },
            { href: '/fbs.html', icon: '📦', title: 'FBS التخزين', desc: 'خدمات التخزين والشحن' },
            { href: '/نظام-اللوجستيات.html', icon: '🚚', title: 'اللوجستيات', desc: 'النقل والشحن الذكي' },
            { href: '/تسجيل-ناقل.html', icon: '🚛', title: 'تسجيل ناقل', desc: 'انضم كشركة نقل' }
        ]
    },
    systems: {
        title: 'الأنظمة',
        icon: '📊',
        items: [
            { href: '/لوحة-التحكم.html', icon: '📊', title: 'لوحة التحكم', desc: 'إدارة متجرك' },
            { href: '/لوحة-المؤشرات.html', icon: '📈', title: 'المؤشرات', desc: 'تحليلات وإحصائيات' },
            { href: '/النظام-المحاسبي.html', icon: '💰', title: 'المحاسبة', desc: 'الفواتير والمالية' },
            { href: '/نظام-المدفوعات.html', icon: '💳', title: 'المدفوعات', desc: 'الدفع الإلكتروني' },
            { href: '/تكامل.html', icon: '🔌', title: 'التكامل API', desc: 'ربط الأنظمة' }
        ]
    },
    support: {
        title: 'المساعد والمعرفة',
        icon: '🤖',
        items: [
            { href: '/مساعد-شيخة.html', icon: '🤖', title: 'المستشار الذكي', desc: 'استشارات AI متخصصة' },
            { href: '/مركز-الأبحاث.html', icon: '🔬', title: 'مركز الأبحاث', desc: 'دراسات ومقالات' },
            { href: '/المنتدى.html', icon: '💬', title: 'المنتدى', desc: 'مجتمع التجار' },
            { href: '/اللوائح-والقوانين-والاجراءات.html', icon: '📜', title: 'اللوائح', desc: 'القوانين والإجراءات' }
        ]
    }
};

// إنشاء Header
function createHeader(activePage = '') {
    const header = document.createElement('header');
    header.className = 'sheikha-header';
    header.innerHTML = `
        <div class="header-container">
            <a href="/" class="sheikha-logo">
                <div class="logo-symbol">ش</div>
                <div class="logo-info">
                    <h1>شيخة</h1>
                    <p>المعادن والسكراب ♻️</p>
                </div>
            </a>
            
            <nav class="sheikha-nav">
                <a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}">🏠 الرئيسية</a>
                
                ${createNavDropdown('market', 'السوق', activePage)}
                ${createNavDropdown('supplyChain', 'سلسلة التوريد', activePage)}
                ${createNavDropdown('systems', 'الأنظمة', activePage)}
                ${createNavDropdown('support', 'المساعد', activePage)}
            </nav>
            
            <button class="mobile-menu-btn" onclick="toggleMobileNav()">☰</button>
            
            <div class="header-actions">
                <a href="/app.html" class="btn btn-primary btn-sm">📱 التطبيق</a>
                <a href="/تسجيل-تاجر.html" class="btn btn-gold">افتح متجرك</a>
                <a href="/تسجيل-الدخول.html" class="btn btn-outline btn-sm">دخول</a>
            </div>
        </div>
    `;
    
    return header;
}

// إنشاء قائمة منسدلة
function createNavDropdown(sectionKey, label, activePage) {
    const section = SECTIONS[sectionKey];
    const isActive = section.items.some(item => activePage && item.href.includes(activePage));
    
    return `
        <div class="nav-item">
            <a href="${section.items[0].href}" class="nav-link ${isActive ? 'active' : ''}">
                ${section.icon} ${label} <span class="arrow">▼</span>
            </a>
            <div class="nav-dropdown">
                <div class="dropdown-section">
                    <div class="dropdown-title">${section.title}</div>
                    ${section.items.map(item => `
                        <a href="${item.href}" class="dropdown-item">
                            <span class="dropdown-icon">${item.icon}</span>
                            <div class="dropdown-text">
                                <h4>${item.title}</h4>
                                <p>${item.desc}</p>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// إنشاء قائمة الجوال
function createMobileNav() {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.id = 'mobileNav';
    
    let sectionsHTML = '';
    for (const [key, section] of Object.entries(SECTIONS)) {
        sectionsHTML += `
            <div class="mobile-nav-section">
                <div class="mobile-nav-title">${section.icon} ${section.title}</div>
                ${section.items.map(item => `
                    <a href="${item.href}" class="mobile-nav-link">
                        <span>${item.icon}</span>
                        <span>${item.title}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }
    
    mobileNav.innerHTML = `
        <div class="mobile-nav-header">
            <div class="sheikha-logo">
                <div class="logo-symbol">ش</div>
                <div class="logo-info">
                    <h1>شيخة</h1>
                </div>
            </div>
            <button class="mobile-nav-close" onclick="toggleMobileNav()">✕</button>
        </div>
        ${sectionsHTML}
        <div class="mobile-nav-section">
            <a href="/app.html" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">📱 تحميل التطبيق</a>
            <a href="/تسجيل-تاجر.html" class="btn btn-gold" style="width: 100%;">افتح متجرك</a>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.id = 'mobileOverlay';
    overlay.onclick = toggleMobileNav;
    
    document.body.appendChild(overlay);
    document.body.appendChild(mobileNav);
}

// تبديل قائمة الجوال
function toggleMobileNav() {
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');
    
    if (nav && overlay) {
        nav.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    }
}

// تهيئة Header
function initHeader(activePage = '') {
    // إضافة CSS
    if (!document.querySelector('link[href*="nav.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/nav.css';
        document.head.appendChild(link);
    }
    
    // إنشاء Header
    const header = createHeader(activePage);
    const existingHeader = document.querySelector('header');
    
    if (existingHeader) {
        existingHeader.replaceWith(header);
    } else {
        document.body.insertBefore(header, document.body.firstChild);
    }
    
    // إنشاء قائمة الجوال
    createMobileNav();
}

// تصدير للاستخدام الخارجي
window.SheikhaNav = {
    init: initHeader,
    toggle: toggleMobileNav,
    SECTIONS
};
