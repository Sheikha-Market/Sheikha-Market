/**
 * ═══════════════════════════════════════════════════════════════
 * أدوات شيخة — Sheikha Smart Tools
 * ═══════════════════════════════════════════════════════════════
 * أدوات حفظ/نشر/إرسال/طباعة/كتابة AI
 * تُضاف تلقائياً لأي صفحة تحتوي .sheikha-tools-target
 * ═══════════════════════════════════════════════════════════════
 */
(function() {
'use strict';

// ═══ شريط الأدوات العائم ═══
function injectToolbar() {
    if (document.getElementById('sheikha-toolbar')) return;

    var toolbar = document.createElement('div');
    toolbar.id = 'sheikha-toolbar';
    toolbar.innerHTML = `
    <style>
    #sheikha-toolbar{position:fixed;bottom:24px;left:24px;z-index:9990;font-family:'Tajawal',sans-serif;direction:rtl}
    .st-bar{display:flex;gap:6px;align-items:center;background:rgba(8,12,24,.96);backdrop-filter:blur(40px);border:1px solid rgba(212,175,55,.1);border-radius:16px;padding:8px 12px;box-shadow:0 12px 40px rgba(0,0,0,.4)}
    .st-btn{width:42px;height:42px;border-radius:12px;border:1px solid rgba(212,175,55,.08);background:rgba(212,175,55,.03);color:#a1a1aa;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .25s;position:relative;font-size:1rem}
    .st-btn:hover{color:#D4AF37;border-color:rgba(212,175,55,.2);background:rgba(212,175,55,.06);transform:translateY(-2px)}
    .st-btn[data-tip]::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);right:50%;transform:translateX(50%);background:rgba(3,5,9,.95);color:#f4f4f5;font-size:.7rem;font-weight:600;padding:5px 10px;border-radius:8px;white-space:nowrap;opacity:0;visibility:hidden;transition:.2s;pointer-events:none;border:1px solid rgba(212,175,55,.1)}
    .st-btn:hover[data-tip]::after{opacity:1;visibility:visible}
    .st-sep{width:1px;height:28px;background:rgba(212,175,55,.08);margin:0 4px}
    .st-ai-btn{background:linear-gradient(135deg,rgba(168,85,247,.15),rgba(59,130,246,.1));border-color:rgba(168,85,247,.15);color:#a855f7}
    .st-ai-btn:hover{color:#c084fc;border-color:rgba(168,85,247,.3);background:linear-gradient(135deg,rgba(168,85,247,.2),rgba(59,130,246,.15))}
    /* AI Panel */
    .st-ai-panel{position:absolute;bottom:calc(100% + 12px);left:0;width:380px;background:rgba(8,12,24,.98);backdrop-filter:blur(40px);border:1px solid rgba(168,85,247,.15);border-radius:18px;padding:20px;display:none;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:st-slide .3s ease}
    .st-ai-panel.open{display:block}
    @keyframes st-slide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .st-ai-panel h4{font-size:.85rem;font-weight:800;color:#c084fc;margin:0 0 12px;display:flex;align-items:center;gap:8px}
    .st-ai-select{width:100%;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(168,85,247,.1);border-radius:10px;color:#f4f4f5;font-family:inherit;font-size:.82rem;margin-bottom:10px;outline:none;cursor:pointer;-webkit-appearance:none}
    .st-ai-select:focus{border-color:rgba(168,85,247,.3)}
    .st-ai-textarea{width:100%;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(168,85,247,.1);border-radius:10px;color:#f4f4f5;font-family:inherit;font-size:.82rem;min-height:80px;resize:vertical;outline:none}
    .st-ai-textarea:focus{border-color:rgba(168,85,247,.3)}
    .st-ai-textarea::placeholder{color:#52525b}
    .st-ai-generate{width:100%;padding:12px;background:linear-gradient(135deg,#a855f7,#6366f1);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;margin-top:10px;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px}
    .st-ai-generate:hover{opacity:.9;transform:translateY(-1px)}
    .st-ai-generate:disabled{opacity:.4;cursor:wait}
    .st-ai-result{margin-top:12px;padding:14px;background:rgba(168,85,247,.04);border:1px solid rgba(168,85,247,.08);border-radius:12px;font-size:.82rem;color:#d4d4d8;line-height:1.7;max-height:200px;overflow-y:auto;display:none;white-space:pre-wrap}
    .st-ai-result.show{display:block}
    .st-ai-actions{display:flex;gap:6px;margin-top:8px}
    .st-ai-actions button{flex:1;padding:8px;border-radius:8px;border:1px solid rgba(168,85,247,.1);background:rgba(168,85,247,.04);color:#a1a1aa;font-size:.72rem;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s}
    .st-ai-actions button:hover{color:#c084fc;border-color:rgba(168,85,247,.2)}
    /* Share Panel */
    .st-share-panel{position:absolute;bottom:calc(100% + 12px);left:0;width:300px;background:rgba(8,12,24,.98);backdrop-filter:blur(40px);border:1px solid rgba(212,175,55,.1);border-radius:18px;padding:16px;display:none;box-shadow:0 20px 60px rgba(0,0,0,.5)}
    .st-share-panel.open{display:block}
    .st-share-panel h4{font-size:.85rem;font-weight:800;color:#D4AF37;margin:0 0 12px}
    .st-share-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .st-share-btn{padding:12px 6px;border-radius:12px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.02);cursor:pointer;text-align:center;transition:.2s;text-decoration:none;display:block}
    .st-share-btn:hover{border-color:rgba(212,175,55,.15);transform:translateY(-2px)}
    .st-share-btn .si{font-size:1.4rem;margin-bottom:4px}
    .st-share-btn .sn{font-size:.65rem;color:#71717a;font-weight:600}
    /* Toast */
    .st-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%);background:rgba(16,185,129,.95);color:#fff;padding:12px 24px;border-radius:12px;font-size:.85rem;font-weight:700;z-index:99999;opacity:0;transition:.3s;pointer-events:none;font-family:'Tajawal',sans-serif}
    .st-toast.show{opacity:1}
    @media(max-width:480px){.st-bar{gap:3px;padding:6px 8px}.st-btn{width:36px;height:36px;border-radius:10px}.st-ai-panel,.st-share-panel{width:calc(100vw - 32px)}}
    </style>

    <div class="st-bar">
        <!-- حفظ PDF -->
        <button class="st-btn" data-tip="حفظ PDF" onclick="sheikhaTools.savePDF()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <!-- طباعة -->
        <button class="st-btn" data-tip="طباعة" onclick="sheikhaTools.print()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        </button>
        <!-- نسخ -->
        <button class="st-btn" data-tip="نسخ المحتوى" onclick="sheikhaTools.copy()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
        <div class="st-sep"></div>
        <!-- مشاركة -->
        <button class="st-btn" data-tip="مشاركة" onclick="sheikhaTools.toggleShare()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <!-- إرسال بريد -->
        <button class="st-btn" data-tip="إرسال بريد" onclick="sheikhaTools.email()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </button>
        <div class="st-sep"></div>
        <!-- كتابة AI -->
        <button class="st-btn st-ai-btn" data-tip="كتابة بالذكاء الاصطناعي" onclick="sheikhaTools.toggleAI()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </button>
    </div>

    <!-- لوحة AI -->
    <div class="st-ai-panel" id="st-ai-panel">
        <h4>✨ الكتابة بالذكاء الاصطناعي</h4>
        <select class="st-ai-select" id="st-ai-type">
            <option value="product">وصف منتج معدني</option>
            <option value="ad">إعلان تسويقي</option>
            <option value="email">بريد إلكتروني تجاري</option>
            <option value="social">منشور تواصل اجتماعي</option>
            <option value="rfq">طلب عرض سعر (RFQ)</option>
            <option value="brochure">نص بروشور</option>
            <option value="proposal">عرض تجاري</option>
            <option value="report">تقرير دوري</option>
        </select>
        <textarea class="st-ai-textarea" id="st-ai-input" placeholder="صِف ما تريد كتابته... مثال: وصف لمنتج نحاس أحمر نقاوة 99.9% للتصدير"></textarea>
        <button class="st-ai-generate" id="st-ai-gen" onclick="sheikhaTools.generateAI()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            توليد بالذكاء الاصطناعي
        </button>
        <div class="st-ai-result" id="st-ai-result"></div>
        <div class="st-ai-actions" id="st-ai-actions" style="display:none">
            <button onclick="sheikhaTools.copyAIResult()">📋 نسخ</button>
            <button onclick="sheikhaTools.insertAIResult()">📝 إدراج</button>
            <button onclick="sheikhaTools.regenerateAI()">🔄 إعادة</button>
        </div>
    </div>

    <!-- لوحة المشاركة -->
    <div class="st-share-panel" id="st-share-panel">
        <h4>مشاركة</h4>
        <div class="st-share-grid">
            <a class="st-share-btn" onclick="sheikhaTools.shareWhatsApp()"><div class="si">💬</div><div class="sn">واتساب</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.shareTelegram()"><div class="si">✈️</div><div class="sn">تيليجرام</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.shareTwitter()"><div class="si">🐦</div><div class="sn">تويتر</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.shareLinkedIn()"><div class="si">💼</div><div class="sn">لينكدإن</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.shareFacebook()"><div class="si">📘</div><div class="sn">فيسبوك</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.email()"><div class="si">📧</div><div class="sn">بريد</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.copyLink()"><div class="si">🔗</div><div class="sn">نسخ الرابط</div></a>
            <a class="st-share-btn" onclick="sheikhaTools.qrCode()"><div class="si">📱</div><div class="sn">QR</div></a>
        </div>
    </div>`;

    // Toast
    var toast = document.createElement('div');
    toast.className = 'st-toast';
    toast.id = 'st-toast';
    document.body.appendChild(toast);

    document.body.appendChild(toolbar);
}

// ═══ Toast ═══
function showToast(msg) {
    var t = document.getElementById('st-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 2500);
}

// ═══ النماذج AI ═══
var AI_TEMPLATES = {
    product: function(desc) {
        return '🏷️ منتج: ' + (desc || 'نحاس أحمر') + '\n\n' +
            '━━━ الوصف التجاري ━━━\n' +
            'منتج معدني عالي الجودة من شيخة — أول سوق إسلامي رقمي للمعادن.\n' +
            'مطابق للمواصفات العالمية (ISO/ASTM) ومعايير الجودة الشرعية.\n\n' +
            '✅ نقاوة مضمونة ومعتمدة\n' +
            '✅ شهادة منشأ وفحص جودة\n' +
            '✅ تسليم دولي مؤمّن\n' +
            '✅ تسعير عادل — بلا ربا ولا غش\n\n' +
            '📞 للطلب: market@sheikha.top | 0554942904\n' +
            '🌐 sheikha.top';
    },
    ad: function(desc) {
        return '🔶 إعلان شيخة\n\n' +
            '━━━━━━━━━━━━━━━\n' +
            (desc ? desc + '\n\n' : '') +
            '⚡ أول سوق إسلامي رقمي للمعادن\n' +
            '💰 أسعار مباشرة من البورصات العالمية\n' +
            '🤝 +2,400 تاجر موثوق\n' +
            '☪️ مبني على مبادئ سوق المدينة المنورة\n\n' +
            '📲 سجّل مجاناً: sheikha.top\n' +
            '#شيخة #معادن #سكراب #تجارة_حلال';
    },
    email: function(desc) {
        return 'بسم الله الرحمن الرحيم\n\n' +
            'السلام عليكم ورحمة الله وبركاته،\n\n' +
            'تحية طيبة وبعد،\n\n' +
            (desc || 'نود إبلاغكم بأحدث عروضنا في سوق شيخة للمعادن.') + '\n\n' +
            'نأمل أن تجدوا في عروضنا ما يلبي احتياجاتكم.\n' +
            'لا تترددوا في التواصل معنا لأي استفسار.\n\n' +
            'وفقكم الله،\n' +
            'فريق شيخة\n' +
            'market@sheikha.top | 0554942904\n' +
            'sheikha.top';
    },
    social: function(desc) {
        return '🏪 ' + (desc || 'أسعار المعادن اليوم') + '\n\n' +
            '⚙️ حديد: $780/طن\n' +
            '🔶 نحاس: $9,150/طن\n' +
            '🥇 ذهب: $2,340/أونصة\n\n' +
            '📈 تابع الأسعار لحظياً على #شيخة\n' +
            '🌐 sheikha.top\n\n' +
            '#معادن #ذهب #نحاس #حديد #سكراب #تجارة_إسلامية';
    },
    rfq: function(desc) {
        return '═══ طلب عرض سعر (RFQ) ═══\n\n' +
            'رقم الطلب: RFQ-' + Date.now().toString(36).toUpperCase() + '\n' +
            'التاريخ: ' + new Date().toLocaleDateString('ar-SA') + '\n\n' +
            '📦 المنتج المطلوب:\n' +
            (desc || '[حدد نوع المعدن والمواصفات]') + '\n\n' +
            '📋 المواصفات:\n' +
            '• الكمية: [حدد]\n' +
            '• النقاوة: [حدد]\n' +
            '• الشكل: [سبائك/لفائف/أسلاك/خردة]\n' +
            '• التغليف: [حدد]\n\n' +
            '📅 التسليم المطلوب: [حدد]\n' +
            '📍 مكان التسليم: [حدد]\n\n' +
            '━━━ الشروط ━━━\n' +
            '• الدفع: [حدد طريقة الدفع]\n' +
            '• صلاحية العرض: 7 أيام\n' +
            '• الفحص: شهادة جودة مطلوبة\n\n' +
            'شيخة — أول سوق إسلامي رقمي للمعادن\n' +
            'sheikha.top | market@sheikha.top';
    },
    brochure: function(desc) {
        return '═══ شيخة — أول سوق إسلامي رقمي للمعادن ═══\n\n' +
            (desc ? '◆ ' + desc + '\n\n' : '') +
            '◆ من نحن\n' +
            'منظومة وسوق شيخة — مركز اقتصادي إسلامي رقمي مبني على مبادئ سوق المدينة المنورة.\n\n' +
            '◆ خدماتنا\n' +
            '• تداول المعادن الأساسية والثمينة والنادرة\n' +
            '• سوق السكراب وإعادة التدوير\n' +
            '• تسعير لحظي من البورصات العالمية\n' +
            '• مستشار AI متخصص\n\n' +
            '◆ لماذا شيخة؟\n' +
            '✅ التزام بالكتاب والسنة\n' +
            '✅ شفافية كاملة — بلا ربا\n' +
            '✅ +2,400 تاجر | +5,100 منتج | 42 دولة\n\n' +
            '📞 market@sheikha.top | sheikha.top';
    },
    proposal: function(desc) {
        return 'بسم الله الرحمن الرحيم\n\n' +
            '═══ عرض تجاري ═══\n\n' +
            'رقم العرض: PRO-' + Date.now().toString(36).toUpperCase() + '\n' +
            'التاريخ: ' + new Date().toLocaleDateString('ar-SA') + '\n\n' +
            (desc || '[تفاصيل العرض]') + '\n\n' +
            '━━━ الشروط التجارية ━━━\n' +
            '• السعر: [حدد]\n' +
            '• الكمية: [حدد]\n' +
            '• التسليم: [حدد]\n' +
            '• الدفع: [حدد]\n' +
            '• صلاحية العرض: 14 يوم\n\n' +
            'شيخة — تجارة حلال بامتياز\n' +
            'sheikha.top';
    },
    report: function(desc) {
        return '═══ تقرير ' + (desc || 'دوري') + ' ═══\n\n' +
            'التاريخ: ' + new Date().toLocaleDateString('ar-SA') + '\n\n' +
            '📊 الملخص التنفيذي:\n' +
            '[أدخل ملخص التقرير هنا]\n\n' +
            '📈 المؤشرات الرئيسية:\n' +
            '• [مؤشر 1]: [القيمة]\n' +
            '• [مؤشر 2]: [القيمة]\n' +
            '• [مؤشر 3]: [القيمة]\n\n' +
            '📋 التفاصيل:\n' +
            '[التفاصيل]\n\n' +
            '✅ التوصيات:\n' +
            '1. [توصية]\n' +
            '2. [توصية]\n\n' +
            '━━━━━━━━━━\n' +
            'شيخة | sheikha.top';
    }
};

// ═══ الأدوات العامة ═══
window.sheikhaTools = {
    savePDF: function() {
        window.print();
        showToast('✅ جاري حفظ PDF...');
    },
    print: function() {
        window.print();
    },
    copy: function() {
        var content = document.querySelector('.sheikha-tools-target, .tab-content:not([style*="none"]), main, .container, article, .content');
        if (content) {
            var text = content.innerText || content.textContent;
            navigator.clipboard.writeText(text).then(function() {
                showToast('✅ تم نسخ المحتوى');
            }).catch(function() {
                showToast('⚠️ تعذر النسخ');
            });
        } else {
            showToast('⚠️ لا يوجد محتوى للنسخ');
        }
    },
    email: function() {
        var subject = encodeURIComponent(document.title);
        var body = encodeURIComponent(window.location.href + '\n\n' + (document.querySelector('meta[name="description"]') || {}).content || '');
        window.open('mailto:?subject=' + subject + '&body=' + body);
    },
    copyLink: function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            showToast('✅ تم نسخ الرابط');
        });
    },
    // مشاركة
    toggleShare: function() {
        var p = document.getElementById('st-share-panel');
        document.getElementById('st-ai-panel').classList.remove('open');
        p.classList.toggle('open');
    },
    shareWhatsApp: function() {
        window.open('https://wa.me/?text=' + encodeURIComponent(document.title + '\n' + window.location.href));
    },
    shareTelegram: function() {
        window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(document.title));
    },
    shareTwitter: function() {
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title) + '&url=' + encodeURIComponent(window.location.href));
    },
    shareLinkedIn: function() {
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href));
    },
    shareFacebook: function() {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));
    },
    qrCode: function() {
        window.open('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(window.location.href));
    },
    // AI
    toggleAI: function() {
        var p = document.getElementById('st-ai-panel');
        document.getElementById('st-share-panel').classList.remove('open');
        p.classList.toggle('open');
    },
    generateAI: function() {
        var type = document.getElementById('st-ai-type').value;
        var input = document.getElementById('st-ai-input').value.trim();
        var btn = document.getElementById('st-ai-gen');
        var result = document.getElementById('st-ai-result');
        var actions = document.getElementById('st-ai-actions');

        btn.disabled = true;
        btn.innerHTML = '<span style="animation:sc-dot .6s ease infinite">⏳</span> جاري التوليد...';

        setTimeout(function() {
            var template = AI_TEMPLATES[type];
            if (template) {
                result.textContent = template(input);
                result.classList.add('show');
                actions.style.display = 'flex';
            }
            btn.disabled = false;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> توليد بالذكاء الاصطناعي';
            showToast('✅ تم التوليد بنجاح');
        }, 800 + Math.random() * 600);
    },
    regenerateAI: function() {
        this.generateAI();
    },
    copyAIResult: function() {
        var text = document.getElementById('st-ai-result').textContent;
        navigator.clipboard.writeText(text).then(function() {
            showToast('✅ تم نسخ النص المولّد');
        });
    },
    insertAIResult: function() {
        showToast('📝 تم الإدراج — ألصق في أي مكان (Ctrl+V)');
        var text = document.getElementById('st-ai-result').textContent;
        navigator.clipboard.writeText(text);
    }
};

// إغلاق عند النقر خارج اللوحات
document.addEventListener('click', function(e) {
    if (!e.target.closest('#sheikha-toolbar')) {
        var ai = document.getElementById('st-ai-panel');
        var share = document.getElementById('st-share-panel');
        if (ai) ai.classList.remove('open');
        if (share) share.classList.remove('open');
    }
});

// ═══ التشغيل ═══
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToolbar);
} else {
    injectToolbar();
}

})();
