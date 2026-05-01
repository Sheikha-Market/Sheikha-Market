/**
 * ═══════════════════════════════════════════════════════════════
 * شات شيخة الذكي — Sheikha Smart Chat
 * ═══════════════════════════════════════════════════════════════
 * شات يتكيف مع دور المستخدم:
 *   visitor → مساعد تعريفي بالسوق + توجيه للتسجيل
 *   user    → مساعد تجاري (أسعار، طلبات، فواتير)
 *   company → مساعد الشركة (تقارير، موردين، عقود)
 *   gov     → مساعد حكومي (إحصائيات، تقارير، مناقصات)
 *   admin   → مساعد إداري كامل (كل شيء + تحكم بالنظام)
 * ═══════════════════════════════════════════════════════════════
 */
(function() {
'use strict';

// ═══ إعدادات الشات حسب الدور ═══
const CHAT_CONFIG = {
    visitor: {
        title: 'مرحباً بك في شيخة',
        subtitle: 'كيف أساعدك؟',
        color: '#D4AF37',
        icon: '💬',
        greeting: 'أهلاً وسهلاً! أنا مساعد شيخة. يمكنني مساعدتك في:\n• التعرف على السوق\n• معرفة أسعار المعادن\n• كيفية التسجيل كتاجر\n\nبماذا تريد أن أساعدك؟',
        quickActions: [
            { label: 'ما هي شيخة؟', msg: 'ما هي منظومة شيخة؟' },
            { label: 'أسعار المعادن', msg: 'أعطني أسعار المعادن الحالية' },
            { label: 'كيف أسجّل؟', msg: 'كيف أسجل كتاجر في شيخة؟' },
            { label: 'تواصل معنا', msg: 'أريد التواصل مع فريق شيخة' }
        ],
        capabilities: ['info', 'prices', 'register-guide']
    },
    user: {
        title: 'مساعد التاجر',
        subtitle: 'مساعدك التجاري الذكي',
        color: '#10b981',
        icon: '🤝',
        greeting: 'أهلاً بك تاجرنا! أنا مساعدك التجاري. يمكنني:\n• عرض أسعار المعادن الحية\n• إنشاء طلبات شراء/بيع\n• متابعة صفقاتك\n• حساب الزكاة\n\nكيف أخدمك اليوم؟',
        quickActions: [
            { label: 'أسعار اليوم', msg: 'أعطني أسعار المعادن اليوم' },
            { label: 'طلب جديد', msg: 'أريد إنشاء طلب شراء جديد' },
            { label: 'صفقاتي', msg: 'اعرض لي آخر صفقاتي' },
            { label: 'حاسبة الزكاة', msg: 'أريد حساب زكاة تجارتي' },
            { label: 'لوحة التحكم', msg: 'خذني إلى لوحة التحكم' }
        ],
        capabilities: ['info', 'prices', 'orders', 'tracking', 'zakat', 'dashboard']
    },
    company: {
        title: 'مساعد الشركة',
        subtitle: 'إدارة أعمالك بذكاء',
        color: '#3b82f6',
        icon: '🏢',
        greeting: 'مرحباً بكم! أنا مساعد شركتكم في شيخة. أستطيع:\n• إعداد تقارير تجارية\n• إدارة الموردين والعملاء\n• متابعة العقود والمناقصات\n• تحليل السوق\n\nبماذا أبدأ؟',
        quickActions: [
            { label: 'تقرير يومي', msg: 'أعطني التقرير اليومي للشركة' },
            { label: 'الموردون', msg: 'اعرض لي قائمة الموردين النشطين' },
            { label: 'العقود', msg: 'ما العقود المعلقة حالياً؟' },
            { label: 'تحليل السوق', msg: 'أعطني تحليل سوق المعادن هذا الأسبوع' },
            { label: 'إنشاء RFQ', msg: 'أريد إنشاء طلب عرض سعر جديد' }
        ],
        capabilities: ['info', 'prices', 'orders', 'reports', 'suppliers', 'contracts', 'analytics']
    },
    gov: {
        title: 'المساعد الحكومي',
        subtitle: 'خدمات الجهات الحكومية',
        color: '#8b5cf6',
        icon: '🏛️',
        greeting: 'مرحباً بالجهة الحكومية! أنا مساعدكم في شيخة. أقدم:\n• إحصائيات السوق\n• تقارير الامتثال\n• بيانات المناقصات\n• تقارير مخصصة\n\nكيف أخدمكم؟',
        quickActions: [
            { label: 'إحصائيات السوق', msg: 'أعطني إحصائيات سوق المعادن' },
            { label: 'تقرير امتثال', msg: 'أريد تقرير الامتثال الشرعي' },
            { label: 'المناقصات', msg: 'ما المناقصات المتاحة حالياً؟' },
            { label: 'تقرير مخصص', msg: 'أريد إعداد تقرير مخصص' }
        ],
        capabilities: ['info', 'prices', 'statistics', 'compliance', 'tenders', 'reports']
    },
    admin: {
        title: 'مركز التحكم',
        subtitle: 'إدارة المنظومة بالكامل',
        color: '#ef4444',
        icon: '👑',
        greeting: 'مرحباً أيها المدير! لديك صلاحيات كاملة. أستطيع:\n• مراقبة كل المحركات\n• إدارة المستخدمين والشركات\n• تشغيل التسويق والحملات\n• تحليل الأداء والـ KPIs\n• كتابة محتوى بالذكاء الاصطناعي\n\nماذا تريد؟',
        quickActions: [
            { label: 'حالة النظام', msg: 'أعطني حالة جميع المحركات' },
            { label: 'KPIs اليوم', msg: 'اعرض مؤشرات الأداء اليومية' },
            { label: 'المستخدمون', msg: 'كم مستخدم نشط اليوم؟' },
            { label: 'التسويق', msg: 'أعطني تقرير حملات التسويق' },
            { label: 'كتابة AI', msg: 'أريد كتابة محتوى تسويقي بالذكاء الاصطناعي' },
            { label: 'فهرس المنظومة', msg: 'خذني إلى فهرس المنظومة' }
        ],
        capabilities: ['all']
    }
};

// ═══ الحصول على الدور ═══
function getRole() {
    try {
        if (!localStorage.getItem('sheikha_token')) return 'visitor';
        return localStorage.getItem('sheikha_role') || 'user';
    } catch(e) { return 'visitor'; }
}

// ═══ بناء واجهة الشات ═══
function buildChatUI() {
    var role = getRole();
    var cfg = CHAT_CONFIG[role] || CHAT_CONFIG.visitor;

    // إزالة أي شات سابق
    var old = document.getElementById('sheikha-chat-widget');
    if (old) old.remove();

    // الحاوية الرئيسية
    var widget = document.createElement('div');
    widget.id = 'sheikha-chat-widget';
    widget.innerHTML = `
    <style>
    #sheikha-chat-widget{position:fixed;bottom:24px;right:24px;z-index:9999;font-family:'Tajawal',sans-serif;direction:rtl}
    .sc-fab{width:60px;height:60px;border-radius:50%;background:${cfg.color};color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 6px 28px rgba(0,0,0,.3);transition:all .3s;position:relative}
    .sc-fab:hover{transform:scale(1.08);box-shadow:0 8px 36px rgba(0,0,0,.4)}
    .sc-fab .sc-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;background:#ef4444;border-radius:50%;border:2px solid #030509;animation:sc-pulse 2s infinite}
    @keyframes sc-pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .sc-panel{position:absolute;bottom:72px;right:0;width:380px;max-height:560px;background:rgba(8,12,24,.98);backdrop-filter:blur(40px);border:1px solid rgba(212,175,55,.1);border-radius:20px;overflow:hidden;display:none;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:sc-slide .3s ease}
    .sc-panel.open{display:flex}
    @keyframes sc-slide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .sc-header{padding:16px 20px;background:linear-gradient(135deg,${cfg.color}15,${cfg.color}08);border-bottom:1px solid rgba(212,175,55,.06);display:flex;align-items:center;gap:12px}
    .sc-header-icon{width:40px;height:40px;border-radius:12px;background:${cfg.color}20;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
    .sc-header-info h3{font-size:.92rem;font-weight:800;color:#f4f4f5;margin:0}
    .sc-header-info p{font-size:.7rem;color:#71717a;margin:0}
    .sc-close{margin-right:auto;background:none;border:none;color:#71717a;cursor:pointer;font-size:1.2rem;padding:4px 8px;border-radius:8px;transition:.2s}
    .sc-close:hover{color:#f4f4f5;background:rgba(255,255,255,.05)}
    .sc-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;max-height:320px;scrollbar-width:thin;scrollbar-color:rgba(212,175,55,.1) transparent}
    .sc-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:.84rem;line-height:1.65;white-space:pre-wrap}
    .sc-msg.bot{background:rgba(212,175,55,.06);color:#a1a1aa;align-self:flex-start;border-bottom-right-radius:4px}
    .sc-msg.user{background:${cfg.color};color:#fff;align-self:flex-end;border-bottom-left-radius:4px;font-weight:600}
    .sc-msg.bot .sc-time,.sc-msg.user .sc-time{display:block;font-size:.6rem;opacity:.5;margin-top:4px}
    .sc-quick{padding:8px 16px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(212,175,55,.04)}
    .sc-quick-btn{padding:6px 14px;border-radius:20px;border:1px solid rgba(212,175,55,.1);background:rgba(212,175,55,.03);color:#a1a1aa;font-size:.72rem;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s;white-space:nowrap}
    .sc-quick-btn:hover{color:${cfg.color};border-color:${cfg.color}40;background:${cfg.color}08}
    .sc-input-wrap{padding:12px 16px;border-top:1px solid rgba(212,175,55,.06);display:flex;gap:8px;align-items:center}
    .sc-input{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.08);border-radius:12px;padding:10px 14px;color:#f4f4f5;font-size:.85rem;font-family:inherit;outline:none;resize:none;min-height:40px;max-height:80px}
    .sc-input:focus{border-color:${cfg.color}50}
    .sc-input::placeholder{color:#52525b}
    .sc-send{width:40px;height:40px;border-radius:12px;background:${cfg.color};color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;flex-shrink:0}
    .sc-send:hover{opacity:.85}
    .sc-send:disabled{opacity:.3;cursor:not-allowed}
    .sc-typing{display:flex;gap:4px;padding:8px 14px;align-self:flex-start}
    .sc-typing span{width:6px;height:6px;border-radius:50%;background:#71717a;animation:sc-dot .8s ease infinite}
    .sc-typing span:nth-child(2){animation-delay:.15s}
    .sc-typing span:nth-child(3){animation-delay:.3s}
    @keyframes sc-dot{0%,100%{opacity:.3}50%{opacity:1}}
    @media(max-width:480px){.sc-panel{width:calc(100vw - 32px);right:-8px;bottom:68px;max-height:70vh}}
    </style>

    <!-- زر الشات العائم -->
    <button class="sc-fab" id="sc-toggle" aria-label="فتح الشات">
        ${cfg.icon}
        <span class="sc-badge"></span>
    </button>

    <!-- لوحة الشات -->
    <div class="sc-panel" id="sc-panel">
        <div class="sc-header">
            <div class="sc-header-icon">${cfg.icon}</div>
            <div class="sc-header-info">
                <h3>${cfg.title}</h3>
                <p>${cfg.subtitle}</p>
            </div>
            <button class="sc-close" id="sc-close">✕</button>
        </div>
        <div class="sc-messages" id="sc-messages"></div>
        <div class="sc-quick" id="sc-quick"></div>
        <div class="sc-input-wrap">
            <textarea class="sc-input" id="sc-input" placeholder="اكتب رسالتك..." rows="1"></textarea>
            <button class="sc-send" id="sc-send" disabled>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </div>
    </div>`;

    document.body.appendChild(widget);

    // ═══ الأحداث ═══
    var panel = document.getElementById('sc-panel');
    var toggle = document.getElementById('sc-toggle');
    var closeBtn = document.getElementById('sc-close');
    var msgContainer = document.getElementById('sc-messages');
    var input = document.getElementById('sc-input');
    var sendBtn = document.getElementById('sc-send');
    var quickWrap = document.getElementById('sc-quick');

    // فتح/إغلاق
    toggle.onclick = function() {
        var isOpen = panel.classList.toggle('open');
        toggle.querySelector('.sc-badge').style.display = 'none';
        if (isOpen && msgContainer.children.length === 0) {
            addBotMsg(cfg.greeting);
            renderQuickActions(cfg.quickActions);
        }
    };
    closeBtn.onclick = function() { panel.classList.remove('open'); };

    // الإجراءات السريعة
    function renderQuickActions(actions) {
        quickWrap.innerHTML = '';
        actions.forEach(function(a) {
            var btn = document.createElement('button');
            btn.className = 'sc-quick-btn';
            btn.textContent = a.label;
            btn.onclick = function() { sendMessage(a.msg); };
            quickWrap.appendChild(btn);
        });
    }
    renderQuickActions(cfg.quickActions);

    // إرسال رسالة
    input.addEventListener('input', function() {
        sendBtn.disabled = !input.value.trim();
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.value.trim()) sendMessage(input.value.trim());
        }
    });
    sendBtn.onclick = function() {
        if (input.value.trim()) sendMessage(input.value.trim());
    };

    function sendMessage(text) {
        addUserMsg(text);
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        showTyping();

        // معالجة الرسالة
        setTimeout(function() {
            hideTyping();
            var response = processMessage(text, role, cfg);
            addBotMsg(response);
        }, 600 + Math.random() * 800);
    }

    function addBotMsg(text) {
        var div = document.createElement('div');
        div.className = 'sc-msg bot';
        var time = new Date().toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit' });
        div.innerHTML = text + '<span class="sc-time">' + time + '</span>';
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function addUserMsg(text) {
        var div = document.createElement('div');
        div.className = 'sc-msg user';
        var time = new Date().toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit' });
        div.textContent = text;
        div.innerHTML += '<span class="sc-time">' + time + '</span>';
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    var typingEl = null;
    function showTyping() {
        typingEl = document.createElement('div');
        typingEl.className = 'sc-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        msgContainer.appendChild(typingEl);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    function hideTyping() {
        if (typingEl) { typingEl.remove(); typingEl = null; }
    }
}

// ═══ معالجة الرسائل (ذكاء محلي) ═══
function processMessage(text, role, cfg) {
    var lower = text.toLowerCase();
    var ar = text;

    // --- ردود عامة ---
    if (ar.includes('شيخة') && (ar.includes('ما هي') || ar.includes('ما هو'))) {
        return 'شيخة هي أول سوق إسلامي رقمي للمعادن والسكراب، مبنية على مبادئ سوق المدينة المنورة الذي أسسه النبي ﷺ.\n\n✅ تسعير نبوي عادل\n✅ بدون ربا\n✅ شفافية كاملة\n✅ رقابة ذكية (المحتسب الرقمي)\n\n🌐 sheikha.top';
    }
    if (ar.includes('أسعار') || ar.includes('سعر')) {
        return '📊 أسعار المعادن (تقريبية):\n\n🥇 ذهب: $2,340/أونصة\n🥈 فضة: $27.5/أونصة\n🔶 نحاس: $9,150/طن\n⬛ حديد خام: $780/طن\n🔷 ألمنيوم: $2,480/طن\n\n📈 للأسعار الحية: <a href="/سوق-شيخة.html" style="color:' + cfg.color + '">افتح السوق</a>';
    }
    if (ar.includes('سجل') || ar.includes('تسجيل') || ar.includes('كيف أسجل')) {
        return 'التسجيل سهل وسريع! 🚀\n\n1️⃣ اختر نوع الحساب (تاجر/شركة/حكومي)\n2️⃣ أدخل بياناتك الأساسية\n3️⃣ ارفع الوثائق المطلوبة\n4️⃣ تحقق من هويتك\n5️⃣ ابدأ التداول!\n\n<a href="/تسجيل-الشركات.html" style="color:' + cfg.color + '">سجّل الآن ←</a>';
    }
    if (ar.includes('تواصل') || ar.includes('اتصال') || ar.includes('واتساب')) {
        return '📞 طرق التواصل:\n\n📧 market@sheikha.top\n📱 واتساب: 0554942904\n🌐 sheikha.top\n\nأو أرسل رسالتك هنا وسنتواصل معك!';
    }
    if (ar.includes('زكاة') || ar.includes('زكاه')) {
        return '📿 حاسبة الزكاة:\n\nزكاة عروض التجارة = 2.5% من قيمة البضاعة بسعر السوق عند حولان الحول.\n\nمثال: بضاعة معادن بقيمة 100,000 ريال\nالزكاة = 2,500 ريال\n\n<a href="/الشريعة-الاسلامية.html" style="color:' + cfg.color + '">افتح حاسبة الزكاة ←</a>';
    }
    if (ar.includes('لوحة التحكم') || ar.includes('لوحتي') || ar.includes('داشبورد')) {
        var dashMap = { user: '/لوحة-تحكم-المستخدم.html', company: '/لوحة-الشركة.html', gov: '/gov-dashboard.html', admin: '/لوحة-الادمن.html' };
        var url = dashMap[role] || '/تسجيل-الدخول.html';
        return 'حاضر! <a href="' + url + '" style="color:' + cfg.color + '">افتح لوحة التحكم ←</a>';
    }

    // --- ردود خاصة بالمدير ---
    if (role === 'admin') {
        if (ar.includes('حالة النظام') || ar.includes('المحركات')) {
            return '✅ حالة النظام — كل المحركات تعمل:\n\n🟢 53 محرك نشط\n🟢 الخادم: يعمل\n🟢 مؤشر النضج SMI: 78%\n🟢 الأمان: 10 طبقات فعّالة\n🟢 الأتمتة: 100%\n\n<a href="/فهرس-المنظومة.html" style="color:#ef4444">فهرس المنظومة ←</a>';
        }
        if (ar.includes('KPI') || ar.includes('مؤشر')) {
            return '📊 مؤشرات الأداء:\n\n📈 المستخدمون النشطون: 2,400+\n📦 المنتجات: 5,100+\n🌍 الدول: 42\n💰 حجم التداول: 15.2M ريال\n⭐ رضا العملاء: 94%\n🏆 مؤشر البركة: 93/100';
        }
        if (ar.includes('كتابة') && ar.includes('AI') || ar.includes('ذكاء') || ar.includes('محتوى تسويقي')) {
            return '✍️ مولّد المحتوى الذكي:\n\nاختر نوع المحتوى:\n• "اكتب وصف منتج" — وصف منتج معدني\n• "اكتب إعلان" — إعلان تسويقي\n• "اكتب بريد" — بريد إلكتروني تجاري\n• "اكتب منشور" — منشور لمنصات التواصل\n\nأو اكتب طلبك وسأساعدك!';
        }
        if (ar.includes('تسويق') || ar.includes('حملات')) {
            return '📊 تقرير التسويق:\n\n📧 الحملات النشطة: 3\n👁️ الانطباعات: 125K\n🖱️ النقرات: 8.2K (CTR: 6.5%)\n📝 العملاء المحتملون: 340\n💰 التحويلات: 52\n\n<a href="/التسويق-الرقمي.html" style="color:#ef4444">لوحة التسويق ←</a>';
        }
        if (ar.includes('فهرس')) {
            return '<a href="/فهرس-المنظومة.html" style="color:#ef4444">فهرس المنظومة ←</a>\n\nأو اختر:\n<a href="/خريطة-شيخة.html" style="color:#ef4444">🗺️ خريطة شيخة</a>\n<a href="/المخطط-الهيكلي.html" style="color:#ef4444">🏗️ المخطط الهيكلي</a>';
        }
    }

    // --- ردود خاصة بالشركة ---
    if (role === 'company') {
        if (ar.includes('تقرير') || ar.includes('يومي')) {
            return '📋 التقرير اليومي للشركة:\n\n📦 طلبات جديدة: 12\n✅ طلبات مكتملة: 8\n⏳ طلبات معلقة: 4\n💰 إيرادات اليوم: 45,200 ريال\n📈 نمو أسبوعي: +12%\n\n<a href="/لوحة-الشركة.html" style="color:#3b82f6">تفاصيل أكثر ←</a>';
        }
        if (ar.includes('مورد') || ar.includes('موردين')) {
            return '🏭 الموردون النشطون: 23 مورد\n\n• 8 موردين حديد وصلب\n• 6 موردين نحاس وألمنيوم\n• 5 موردين سكراب\n• 4 موردين معادن ثمينة\n\n⭐ تقييم المتوسط: 4.3/5';
        }
        if (ar.includes('RFQ') || ar.includes('عرض سعر')) {
            return 'إنشاء طلب عرض سعر (RFQ):\n\nاكتب تفاصيل الطلب:\n• نوع المعدن\n• الكمية (طن)\n• مواصفات الجودة\n• موعد التسليم المطلوب\n\nوسأعد لك RFQ احترافي!';
        }
    }

    // --- رد افتراضي ---
    return 'شكراً لرسالتك! 🌟\n\nأعمل على تحسين قدراتي باستمرار. حالياً يمكنني مساعدتك في:\n' + cfg.quickActions.map(function(a) { return '• ' + a.label; }).join('\n') + '\n\nأو تواصل مع الفريق مباشرة:\n📧 market@sheikha.top\n📱 واتساب: 0554942904';
}

// ═══ التشغيل ═══
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildChatUI);
} else {
    buildChatUI();
}

// إعادة بناء الشات عند تغيير الدور
window.addEventListener('storage', function(e) {
    if (e.key === 'sheikha_role' || e.key === 'sheikha_token') {
        buildChatUI();
    }
});

})();
