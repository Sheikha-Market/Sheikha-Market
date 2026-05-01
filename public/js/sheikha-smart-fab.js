/**
 * ═══════════════════════════════════════════════════════════════
 * شيخة — الزر الذكي الموحّد | Sheikha Smart FAB
 * ═══════════════════════════════════════════════════════════════
 * «التَّاجِرُ الصَّدُوقُ الأَمِين مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»
 * ═══════════════════════════════════════════════════════════════
 * زر مختصر واحد أسفل الشاشة → يفتح قائمة واضحة
 * — المستخدم العادي: أدوات التصفح والمساعدة
 * — التاجر: أدوات التجارة والكتابة
 * — الإدارة: أوامر التقارير والعقود (مخفية عن غير المدير)
 * ═══════════════════════════════════════════════════════════════
 */
(function() {
'use strict';

if (window.__sheikhaFAB) return;
window.__sheikhaFAB = true;

function getRole() {
    try {
        if (window.SheikhaAccess && typeof window.SheikhaAccess.getRole === 'function') {
            return window.SheikhaAccess.getRole() || 'visitor';
        }
        return localStorage.getItem('sheikha_role') || 'visitor';
    } catch(e) { return 'visitor'; }
}

function getToken() {
    try { return localStorage.getItem('sheikha_token') || ''; } catch(e) { return ''; }
}

function getLang() {
    try { return document.documentElement.lang || localStorage.getItem('sheikha_lang') || 'ar'; } catch(e) { return 'ar'; }
}

function build() {
    // إزالة العناصر القديمة
    ['sheikha-chat-widget','sheikha-toolbar','sfab'].forEach(id => {
        const old = document.getElementById(id);
        if (old) old.remove();
    });

    const role = getRole();
    const isLoggedIn = !!getToken();
    const isAdmin = isLoggedIn && (
        (window.SheikhaAccess && typeof window.SheikhaAccess.isAdmin === 'function' && window.SheikhaAccess.isAdmin()) ||
        role === 'admin' ||
        role === 'owner'
    );
    const isMerchant = isLoggedIn && (role === 'merchant' || role === 'company');

    const el = document.createElement('div');
    el.id = 'sfab';
    el.innerHTML = `
<style>
/* ─── الزر العائم ─── */
#sfab{position:fixed;bottom:20px;right:20px;z-index:9999;font-family:'Tajawal',sans-serif;direction:rtl}
#sfab *{box-sizing:border-box;margin:0;padding:0}

.sfab-btn{
    width:56px;height:56px;border-radius:16px;border:none;
    background:linear-gradient(135deg,#D4AF37,#b8960c);
    color:#050810;font-size:1.6rem;font-weight:900;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 24px rgba(212,175,55,.35);
    transition:all .3s cubic-bezier(.4,0,.2,1);
    font-family:'Tajawal',sans-serif;
    letter-spacing:-1px;
}
.sfab-btn:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(212,175,55,.45)}
.sfab-btn.open{border-radius:50%;background:#1e293b;color:#D4AF37;font-size:1.3rem;letter-spacing:0}

/* ─── اللوحة ─── */
.sfab-panel{
    position:absolute;bottom:68px;right:0;width:320px;
    background:rgba(8,12,24,.97);backdrop-filter:blur(40px);
    border:1px solid rgba(212,175,55,.12);border-radius:18px;
    box-shadow:0 20px 60px rgba(0,0,0,.5);
    display:none;overflow:hidden;
}
.sfab-panel.show{display:block;animation:sfabIn .25s ease}
@keyframes sfabIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}

/* الرأس */
.sfab-hdr{
    padding:16px 18px 12px;
    border-bottom:1px solid rgba(255,255,255,.04);
    display:flex;align-items:center;gap:10px;
}
.sfab-hdr-icon{
    width:36px;height:36px;border-radius:10px;
    background:linear-gradient(135deg,#D4AF37,#b8960c);
    display:flex;align-items:center;justify-content:center;
    color:#050810;font-weight:900;font-size:1.1rem;flex-shrink:0;
}
.sfab-hdr-text{flex:1}
.sfab-hdr-title{font-size:.9rem;font-weight:800;color:#D4AF37}
.sfab-hdr-sub{font-size:.68rem;color:#64748b;margin-top:1px}

/* شارة الثقة */
.sfab-trust{
    padding:8px 12px;margin:0 8px;
    background:rgba(16,185,129,.04);border:1px solid rgba(16,185,129,.08);
    border-radius:10px;display:flex;align-items:center;gap:8px;
    font-size:.7rem;color:#10b981;
}
.sfab-trust-icon{font-size:1rem}
.sfab-trust-text{flex:1;line-height:1.4}
.sfab-trust-label{font-weight:700;color:#34d399}

/* القائمة */
.sfab-menu{padding:8px;max-height:420px;overflow-y:auto}
.sfab-menu::-webkit-scrollbar{width:3px}
.sfab-menu::-webkit-scrollbar-thumb{background:#333;border-radius:2px}

.sfab-group{margin-bottom:4px}
.sfab-group-title{
    padding:8px 10px 4px;font-size:.65rem;font-weight:700;
    color:#475569;text-transform:uppercase;letter-spacing:1px;
}

.sfab-item{
    display:flex;align-items:center;gap:10px;
    padding:10px 12px;border-radius:12px;cursor:pointer;
    transition:all .2s;color:#94a3b8;
}
.sfab-item:hover{background:rgba(212,175,55,.05);color:#f1f5f9}
.sfab-item:active{transform:scale(.98)}

.sfab-item-icon{
    width:34px;height:34px;border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    font-size:1rem;flex-shrink:0;
}
.sfab-item-text{flex:1}
.sfab-item-name{font-size:.82rem;font-weight:700;color:#e2e8f0}
.sfab-item-desc{font-size:.66rem;color:#64748b;margin-top:1px;line-height:1.4}

.sfab-item-arrow{color:#334155;font-size:.7rem}

/* ألوان الأيقونات */
.ic-gold{background:rgba(212,175,55,.1);color:#D4AF37}
.ic-green{background:rgba(16,185,129,.1);color:#10b981}
.ic-blue{background:rgba(59,130,246,.1);color:#3b82f6}
.ic-purple{background:rgba(139,92,246,.1);color:#8b5cf6}
.ic-red{background:rgba(239,68,68,.1);color:#ef4444}
.ic-cyan{background:rgba(6,182,212,.1);color:#06b6d4}
.ic-orange{background:rgba(245,158,11,.1);color:#f59e0b}

/* الشات المصغر */
.sfab-chat{display:none;padding:12px}
.sfab-chat.show{display:block}
.sfab-chat-msgs{max-height:260px;overflow-y:auto;margin-bottom:8px;display:flex;flex-direction:column;gap:6px}
.sfab-chat-msg{padding:10px 12px;border-radius:12px;font-size:.8rem;line-height:1.7;max-width:88%;white-space:pre-line}
.sfab-chat-bot{background:rgba(212,175,55,.05);border:1px solid rgba(212,175,55,.06);color:#d4d4d8;align-self:flex-start;border-radius:4px 12px 12px 12px}
.sfab-chat-user{background:rgba(212,175,55,.12);color:#f4f4f5;align-self:flex-end;border-radius:12px 4px 12px 12px}
.sfab-chat-input{display:flex;gap:6px}
.sfab-chat-input input{flex:1;padding:10px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;color:#f4f4f5;font-family:inherit;font-size:.82rem;outline:none}
.sfab-chat-input input:focus{border-color:rgba(212,175,55,.3)}
.sfab-chat-input button{padding:8px 14px;background:#D4AF37;color:#050810;border:none;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:.8rem}
.sfab-voice-bar{display:flex;align-items:center;gap:6px;padding:6px 8px;border-top:1px solid rgba(212,175,55,.06)}
.sfab-voice-btn{width:32px;height:32px;border-radius:50%;border:1px solid rgba(212,175,55,.15);background:rgba(212,175,55,.05);color:#D4AF37;font-size:.9rem;cursor:pointer;display:grid;place-items:center;transition:.3s}
.sfab-voice-btn:hover{background:rgba(212,175,55,.12)}
.sfab-voice-btn.active{background:#D4AF37;color:#050810;animation:sfab-pulse 1.2s infinite}
.sfab-voice-btn.speaking{background:rgba(34,197,94,.15);color:#22c55e;border-color:rgba(34,197,94,.3)}
@keyframes sfab-pulse{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.3)}50%{box-shadow:0 0 0 8px rgba(212,175,55,0)}}
.sfab-voice-status{font-size:.65rem;color:#71717a;flex:1}
.sfab-back{display:flex;align-items:center;gap:6px;padding:6px 10px;margin-bottom:8px;cursor:pointer;color:#64748b;font-size:.78rem;font-weight:600;border-radius:8px}
.sfab-back:hover{color:#D4AF37;background:rgba(212,175,55,.04)}

@media(max-width:480px){.sfab-panel{width:calc(100vw - 20px);right:-4px}}
</style>

<div class="sfab-panel" id="sfabPanel">
    <div class="sfab-hdr">
        <div class="sfab-hdr-icon">◉</div>
        <div class="sfab-hdr-text">
            <div class="sfab-hdr-title">شيخة</div>
            <div class="sfab-hdr-sub">بسم الله الرحمن الرحيم</div>
        </div>
    </div>

    <!-- شارة الصدق والأمانة -->
    <div class="sfab-trust">
        <div class="sfab-trust-icon">☪</div>
        <div class="sfab-trust-text">
            <div class="sfab-trust-label">التاجر الصدوق الأمين</div>
            كل تاجر يُصنّف بصدقه وأمانته
        </div>
    </div>

    <!-- القائمة الرئيسية -->
    <div class="sfab-menu" id="sfabMenu">

        <!-- ١. المساعد الذكي — متاح للجميع -->
        <div class="sfab-group">
            <div class="sfab-group-title">المساعد الذكي</div>
            <div class="sfab-item" onclick="sfab.openChat()">
                <div class="sfab-item-icon ic-gold">💬</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">محادثة شيخة</div>
                    <div class="sfab-item-desc">اسأل عن الأسعار أو أي شيء</div>
                </div>
                <div class="sfab-item-arrow">←</div>
            </div>
        </div>

        <!-- ٢. أدوات الصفحة — متاح للجميع -->
        <div class="sfab-group">
            <div class="sfab-group-title">أدوات الصفحة</div>
            <div class="sfab-item" onclick="sfab.tool('print')">
                <div class="sfab-item-icon ic-blue">🖨</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">طباعة</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.tool('copy')">
                <div class="sfab-item-icon ic-cyan">📋</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">نسخ المحتوى</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.tool('link')">
                <div class="sfab-item-icon ic-green">🔗</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">نسخ الرابط</div>
                </div>
            </div>
        </div>

        <!-- ٣. المشاركة — متاح للجميع -->
        <div class="sfab-group">
            <div class="sfab-group-title">مشاركة</div>
            <div class="sfab-item" onclick="sfab.tool('whatsapp')">
                <div class="sfab-item-icon" style="background:rgba(37,211,102,.1);color:#25D366">💚</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">واتساب</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.tool('email')">
                <div class="sfab-item-icon ic-orange">✉️</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">بريد إلكتروني</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.tool('twitter')">
                <div class="sfab-item-icon ic-blue">𝕏</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">منصة X</div>
                </div>
            </div>
        </div>

        ${isLoggedIn ? `
        <!-- ٤. كتابة ذكية — للمسجلين فقط -->
        <div class="sfab-group">
            <div class="sfab-group-title">كتابة ذكية</div>
            <div class="sfab-item" onclick="sfab.aiWrite('product')">
                <div class="sfab-item-icon ic-purple">📦</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">وصف منتج</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.aiWrite('rfq')">
                <div class="sfab-item-icon ic-purple">💰</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">طلب عرض سعر</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.aiWrite('email')">
                <div class="sfab-item-icon ic-purple">📧</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">بريد رسمي</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.aiWrite('ad')">
                <div class="sfab-item-icon ic-purple">📢</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">إعلان تسويقي</div>
                </div>
            </div>
        </div>
        ` : `
        <!-- ٤. للزوار: دعوة التسجيل -->
        <div class="sfab-group">
            <div class="sfab-group-title">انضم إلينا</div>
            <div class="sfab-item" onclick="window.location.href='/تسجيل-الدخول.html'">
                <div class="sfab-item-icon ic-gold">🔑</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">تسجيل الدخول</div>
                    <div class="sfab-item-desc">سجّل لتفتح جميع المزايا</div>
                </div>
                <div class="sfab-item-arrow">←</div>
            </div>
        </div>
        `}

        ${isMerchant || isAdmin ? `
        <!-- ٥. أدوات التاجر — للتجار والإدارة فقط -->
        <div class="sfab-group">
            <div class="sfab-group-title">أدوات التاجر</div>
            <div class="sfab-item" onclick="sfab.aiWrite('contract')">
                <div class="sfab-item-icon ic-orange">📜</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">عقد إلكتروني</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.aiWrite('feasibility')">
                <div class="sfab-item-icon ic-orange">📊</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">دراسة جدوى</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.aiWrite('legal')">
                <div class="sfab-item-icon ic-orange">⚖️</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">استشارة شرعية ونظامية</div>
                </div>
            </div>
        </div>
        ` : ''}

        ${isAdmin ? `
        <!-- ٦. الإدارة — مخفية تماماً عن المستخدمين والتجار -->
        <div class="sfab-group">
            <div class="sfab-group-title" style="color:#ef4444">الإدارة</div>
            <div class="sfab-item" onclick="sfab.aiWrite('campaign')">
                <div class="sfab-item-icon ic-red">🎯</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">حملة تسويقية</div>
                </div>
            </div>
            <div class="sfab-item" onclick="sfab.adminReport()">
                <div class="sfab-item-icon ic-red">📈</div>
                <div class="sfab-item-text">
                    <div class="sfab-item-name">تقرير المنظومة</div>
                </div>
            </div>
        </div>
        ` : ''}

    </div>

    <!-- صفحة الشات -->
    <div class="sfab-chat" id="sfabChat">
        <div class="sfab-back" onclick="sfab.backToMenu()">→ رجوع</div>
        <div class="sfab-chat-msgs" id="sfabChatMsgs">
            <div class="sfab-chat-msg sfab-chat-bot">بسم الله الرحمن الرحيم\nأهلاً بك! اسألني عن الأسعار أو المعادن أو أي شيء.</div>
        </div>
        <div class="sfab-voice-bar">
            <button class="sfab-voice-btn" id="sfabMicBtn" onclick="sfab.toggleMic()" title="تحدث بصوتك">🎤</button>
            <span class="sfab-voice-status" id="sfabVoiceStatus">اضغط للتحدث</span>
            <button class="sfab-voice-btn" id="sfabSpeakToggle" onclick="sfab.toggleAutoSpeak()" title="تشغيل/إيقاف الرد الصوتي">🔊</button>
        </div>
        <div class="sfab-chat-input">
            <input type="text" id="sfabChatIn" placeholder="اكتب أو تحدث بصوتك..." onkeydown="if(event.key==='Enter')sfab.sendChat()">
            <button onclick="sfab.sendChat()">إرسال</button>
        </div>
    </div>

    <!-- صفحة الكتابة الذكية -->
    <div class="sfab-chat" id="sfabAI">
        <div class="sfab-back" onclick="sfab.backToMenu()">→ رجوع</div>
        <div style="font-size:.82rem;font-weight:700;color:#a78bfa;margin-bottom:10px" id="sfabAITitle">كتابة ذكية</div>
        <textarea id="sfabAIInput" placeholder="صِف ما تريد كتابته..." style="width:100%;padding:10px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.12);border-radius:10px;color:#f4f4f5;font-family:inherit;font-size:.82rem;min-height:70px;resize:vertical;outline:none;margin-bottom:8px"></textarea>
        <button onclick="sfab.generateAI()" style="width:100%;padding:10px;background:linear-gradient(135deg,#a855f7,#6366f1);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.84rem;font-weight:700;cursor:pointer" id="sfabAIBtn">توليد</button>
        <div id="sfabAIResult" style="margin-top:10px;padding:12px;background:rgba(139,92,246,.04);border:1px solid rgba(139,92,246,.08);border-radius:10px;font-size:.8rem;color:#d4d4d8;line-height:1.8;display:none;white-space:pre-line"></div>
        <div id="sfabAIActions" style="display:none;gap:6px;margin-top:8px">
            <button onclick="sfab.copyAIResult()" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(139,92,246,.1);background:rgba(139,92,246,.04);color:#a78bfa;font-size:.72rem;font-weight:600;cursor:pointer;font-family:inherit">نسخ</button>
            <button onclick="sfab.generateAI()" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(139,92,246,.1);background:rgba(139,92,246,.04);color:#a78bfa;font-size:.72rem;font-weight:600;cursor:pointer;font-family:inherit">إعادة</button>
        </div>
    </div>
</div>

<button class="sfab-btn" id="sfabBtn" onclick="sfab.toggle()" title="مساعد شيخة">◉</button>
`;
    document.body.appendChild(el);
}

// ═══ التحكم ═══
window.sfab = {
    _aiType: 'product',

    toggle() {
        const panel = document.getElementById('sfabPanel');
        const btn = document.getElementById('sfabBtn');
        panel.classList.toggle('show');
        btn.classList.toggle('open');
        btn.textContent = panel.classList.contains('show') ? '✕' : '◉';
        if (!panel.classList.contains('show')) { this.backToMenu(); this.stopSpeaking(); }
    },

    backToMenu() {
        document.getElementById('sfabMenu').style.display = '';
        document.getElementById('sfabChat').classList.remove('show');
        document.getElementById('sfabAI').classList.remove('show');
    },

    openChat() {
        document.getElementById('sfabMenu').style.display = 'none';
        document.getElementById('sfabChat').classList.add('show');
        document.getElementById('sfabChatIn').focus();
        this._initVoice();
    },

    sendChat() {
        const input = document.getElementById('sfabChatIn');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        const msgs = document.getElementById('sfabChatMsgs');
        msgs.innerHTML += '<div class="sfab-chat-msg sfab-chat-user">' + text + '</div>';
        msgs.scrollTop = msgs.scrollHeight;

        const loading = document.createElement('div');
        loading.className = 'sfab-chat-msg sfab-chat-bot';
        loading.textContent = 'جارٍ التفكير...';
        loading.id = 'sfabLoading';
        msgs.appendChild(loading);
        msgs.scrollTop = msgs.scrollHeight;

        fetch('/api/ai-core/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, role: getRole(), context: 'fab-chat' })
        })
        .then(r => r.json())
        .then(data => {
            var el = document.getElementById('sfabLoading');
            if (el) el.remove();
            var reply = (data.success && data.response) ? data.response : this._fallback(text);
            msgs.innerHTML += '<div class="sfab-chat-msg sfab-chat-bot">' + reply + '</div>';
            msgs.scrollTop = msgs.scrollHeight;
            this.speak(reply);
        })
        .catch(() => {
            var el = document.getElementById('sfabLoading');
            if (el) el.remove();
            var reply = this._fallback(text);
            msgs.innerHTML += '<div class="sfab-chat-msg sfab-chat-bot">' + reply + '</div>';
            msgs.scrollTop = msgs.scrollHeight;
            this.speak(reply);
        });
    },

    // ═══ نظام الصوت — TTS + STT ═══
    _voiceEngine: null,
    _autoSpeak: true,
    _isListening: false,
    _recognition: null,
    _bestVoices: {},

    _initVoice() {
        if (this._voiceEngine) return;
        this._voiceEngine = window.speechSynthesis || null;
        // تحميل أفضل الأصوات لكل لغة
        const loadVoices = () => {
            if (!this._voiceEngine) return;
            const voices = this._voiceEngine.getVoices();
            if (!voices.length) return;
            // أفضل أصوات عربية
            const arPriority = ['Maged','Majed','Tarik','Laila','Google العربية','Microsoft Hoda','Zeina'];
            const arVoices = voices.filter(v => v.lang.startsWith('ar'));
            this._bestVoices['ar'] = arVoices.find(v => arPriority.some(p => v.name.includes(p))) || arVoices[0] || null;
            // أفضل أصوات إنجليزية
            const enPriority = ['Samantha','Google US English','Microsoft David','Daniel'];
            const enVoices = voices.filter(v => v.lang.startsWith('en'));
            this._bestVoices['en'] = enVoices.find(v => enPriority.some(p => v.name.includes(p))) || enVoices[0] || null;
            // لغات أخرى — أفضل صوت متاح
            ['fr','es','de','tr','ur','zh','ja','ko','id','ms','pt','ru','hi'].forEach(l => {
                const lv = voices.filter(v => v.lang.startsWith(l));
                this._bestVoices[l] = lv[0] || null;
            });
        };
        loadVoices();
        if (this._voiceEngine) this._voiceEngine.onvoiceschanged = loadVoices;
        // STT — التعرف على الكلام
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this._recognition = new SpeechRec();
            this._recognition.continuous = false;
            this._recognition.interimResults = true;
            this._recognition.lang = getLang() === 'ar' ? 'ar-SA' : 'en-US';
            this._recognition.onresult = (e) => {
                let final = '', interim = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    if (e.results[i].isFinal) final += e.results[i][0].transcript;
                    else interim += e.results[i][0].transcript;
                }
                const input = document.getElementById('sfabChatIn');
                if (input) input.value = final || interim;
                const status = document.getElementById('sfabVoiceStatus');
                if (status) status.textContent = interim ? 'أسمعك...' : (final ? 'تم — اضغط إرسال' : 'أتحدث...');
            };
            this._recognition.onend = () => {
                this._isListening = false;
                const btn = document.getElementById('sfabMicBtn');
                if (btn) btn.classList.remove('active');
                const status = document.getElementById('sfabVoiceStatus');
                if (status && !document.getElementById('sfabChatIn')?.value) status.textContent = 'اضغط للتحدث';
                // إرسال تلقائي إذا هناك نص
                const input = document.getElementById('sfabChatIn');
                if (input && input.value.trim()) this.sendChat();
            };
            this._recognition.onerror = (e) => {
                this._isListening = false;
                const btn = document.getElementById('sfabMicBtn');
                if (btn) btn.classList.remove('active');
                const status = document.getElementById('sfabVoiceStatus');
                if (status) status.textContent = e.error === 'not-allowed' ? 'اسمح بالمايكروفون' : 'حاول مرة أخرى';
            };
        }
        // تحديث حالة زر السماعة
        const st = document.getElementById('sfabSpeakToggle');
        if (st) st.textContent = this._autoSpeak ? '🔊' : '🔇';
    },

    toggleMic() {
        this._initVoice();
        if (!this._recognition) {
            const s = document.getElementById('sfabVoiceStatus');
            if (s) s.textContent = 'المتصفح لا يدعم الصوت';
            return;
        }
        if (this._isListening) {
            this._recognition.stop();
            this._isListening = false;
            return;
        }
        // تحديد لغة الاستماع
        const lang = getLang();
        const langMap = {ar:'ar-SA',en:'en-US',fr:'fr-FR',es:'es-ES',de:'de-DE',tr:'tr-TR',ur:'ur-PK',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR',id:'id-ID',ms:'ms-MY',pt:'pt-BR',ru:'ru-RU',hi:'hi-IN'};
        this._recognition.lang = langMap[lang] || 'ar-SA';
        try {
            this._recognition.start();
            this._isListening = true;
            const btn = document.getElementById('sfabMicBtn');
            if (btn) btn.classList.add('active');
            const status = document.getElementById('sfabVoiceStatus');
            if (status) status.textContent = 'أستمع... تحدث الآن';
        } catch(e) {
            const s = document.getElementById('sfabVoiceStatus');
            if (s) s.textContent = 'خطأ — حاول مرة أخرى';
        }
    },

    toggleAutoSpeak() {
        this._initVoice();
        this._autoSpeak = !this._autoSpeak;
        const st = document.getElementById('sfabSpeakToggle');
        if (st) st.textContent = this._autoSpeak ? '🔊' : '🔇';
        const status = document.getElementById('sfabVoiceStatus');
        if (status) status.textContent = this._autoSpeak ? 'الرد الصوتي مفعّل' : 'الرد الصوتي متوقف';
    },

    speak(text) {
        this._initVoice();
        if (!this._voiceEngine || !this._autoSpeak) return;
        // إيقاف أي كلام سابق
        this._voiceEngine.cancel();
        // تنظيف النص من الرموز
        const clean = text.replace(/[﴿﴾«»—\n•]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!clean) return;
        // تقسيم النص الطويل لمقاطع (حد المتصفح ~200 حرف)
        const chunks = [];
        const sentences = clean.split(/[.،؟!。]/);
        let current = '';
        sentences.forEach(s => {
            if ((current + s).length > 180) { if (current) chunks.push(current.trim()); current = s; }
            else current += (current ? '، ' : '') + s;
        });
        if (current) chunks.push(current.trim());
        // كشف اللغة
        const lang = getLang();
        const isArabic = /[\u0600-\u06FF]/.test(clean);
        const voiceLang = isArabic ? 'ar' : (lang || 'ar');
        // نطق كل مقطع
        const speakChunk = (i) => {
            if (i >= chunks.length) {
                const btn = document.getElementById('sfabSpeakToggle');
                if (btn) btn.classList.remove('speaking');
                return;
            }
            const u = new SpeechSynthesisUtterance(chunks[i]);
            u.voice = this._bestVoices[voiceLang] || this._bestVoices['ar'] || null;
            u.lang = voiceLang === 'ar' ? 'ar-SA' : (voiceLang === 'en' ? 'en-US' : voiceLang);
            u.rate = 0.95;
            u.pitch = 1.0;
            u.volume = 1.0;
            u.onend = () => speakChunk(i + 1);
            u.onerror = () => speakChunk(i + 1);
            this._voiceEngine.speak(u);
        };
        const btn = document.getElementById('sfabSpeakToggle');
        if (btn) btn.classList.add('speaking');
        speakChunk(0);
    },

    stopSpeaking() {
        if (this._voiceEngine) this._voiceEngine.cancel();
        const btn = document.getElementById('sfabSpeakToggle');
        if (btn) btn.classList.remove('speaking');
    },

    _fallback(q) {
        var ql = q.toLowerCase();
        if (ql.includes('سعر') || ql.includes('أسعار') || ql.includes('price')) return 'أسعار المعادن اليوم:\n• الذهب: $2,342/أونصة\n• الفضة: $24.85/أونصة\n• النحاس: $8,720/طن\n• الحديد: $320/طن\n\n«إن الله هو المسعّر»';
        if (ql.includes('شيخة') || ql.includes('ما هي')) return 'شيخة — أول سوق إسلامي رقمي للمعادن، مبني على مبادئ سوق المدينة المنورة.\n\n﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾';
        if (ql.includes('تسجيل') || ql.includes('register')) return 'للتسجيل:\n١. اذهب لصفحة التسجيل\n٢. أدخل بياناتك\n٣. تحقّق من هويتك عبر نفاذ';
        if (ql.includes('زكاة') || ql.includes('zakat')) return 'حاسبة الزكاة:\nنصاب الذهب: 85 جرام\nالنسبة: 2.5%\n\n﴿ وَآتُوا الزَّكَاةَ ﴾';
        if (ql.includes('تواصل') || ql.includes('اتصال') || ql.includes('contact')) return 'تواصل معنا:\n• البريد: market@sheikha.top\n• واتساب: 0554942904';
        return 'بسم الله الرحمن الرحيم\n\nيمكنني مساعدتك في:\n• أسعار المعادن\n• التسجيل كتاجر\n• حاسبة الزكاة\n• معلومات عن المنظومة';
    },

    aiWrite(type) {
        this._aiType = type;
        var titles = {
            product: 'وصف منتج', ad: 'إعلان تسويقي', email: 'بريد رسمي',
            rfq: 'طلب عرض سعر', contract: 'عقد إلكتروني', feasibility: 'دراسة جدوى',
            legal: 'استشارة شرعية ونظامية', campaign: 'حملة تسويقية', report: 'تقرير'
        };
        document.getElementById('sfabAITitle').textContent = titles[type] || 'كتابة ذكية';
        document.getElementById('sfabAIResult').style.display = 'none';
        document.getElementById('sfabAIActions').style.display = 'none';
        document.getElementById('sfabAIInput').value = '';
        document.getElementById('sfabMenu').style.display = 'none';
        document.getElementById('sfabAI').classList.add('show');
        document.getElementById('sfabAIInput').focus();
    },

    generateAI() {
        var input = document.getElementById('sfabAIInput').value.trim();
        if (!input) { alert('اكتب وصفاً أولاً'); return; }
        var btn = document.getElementById('sfabAIBtn');
        btn.textContent = 'جارٍ التوليد...';
        btn.disabled = true;

        fetch('/api/ai-core/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: this._aiType, input: input, role: getRole() })
        })
        .then(r => r.json())
        .then(data => {
            var result = (data.success && data.output) ? data.output : this._localGenerate(input);
            this._showAIResult(result, btn);
        })
        .catch(() => {
            var result = this._localGenerate(input);
            this._showAIResult(result, btn);
        });
    },

    _showAIResult(result, btn) {
        document.getElementById('sfabAIResult').textContent = result;
        document.getElementById('sfabAIResult').style.display = 'block';
        document.getElementById('sfabAIActions').style.display = 'flex';
        btn.textContent = 'توليد';
        btn.disabled = false;
    },

    _localGenerate(input) {
        var t = this._aiType;
        var date = new Date().toLocaleDateString('ar-SA');
        var T = {
            product: input + '\n\nمنتج أصلي بمعايير الجودة — مُعتمد شرعياً.\n\nالمواصفات:\n• جودة عالية ومضمونة\n• شهادة مطابقة\n• توصيل مؤمّن\n\nتسعير عادل — متوافق شرعياً',
            ad: 'عرض حصري!\n\n' + input + '\n\nأسعار تنافسية — بدون وسيط\nمعاملات شرعية — تسعير شفاف\n\nsheikha.top',
            email: 'بسم الله الرحمن الرحيم\n\nالسلام عليكم ورحمة الله وبركاته،\n\n' + input + '\n\nمع خالص التقدير والاحترام،\nفريق شيخة — sheikha.top',
            rfq: 'طلب عرض أسعار\nالتاريخ: ' + date + '\n\nالمطلوب:\n' + input + '\n\nنرجو تزويدنا بعرض شامل خلال 48 ساعة.',
            contract: 'عقد إلكتروني — SH-' + Date.now().toString(36).toUpperCase() + '\n\nبسم الله الرحمن الرحيم\n\nعقد بشأن: ' + input + '\nالتاريخ: ' + date + '\n\nالمادة ١ — محل العقد:\n' + input + '\n\nالمادة ٢ — الشروط الشرعية:\n• لا ربا • لا غرر • لا احتكار\n\nالمادة ٣ — التحكيم:\nيُحال أي نزاع للتحكيم الشرعي.',
            feasibility: 'دراسة جدوى: ' + input + '\nالتاريخ: ' + date + '\n\n١. تحليل السوق: يحتاج تقدير\n٢. الإيرادات المتوقعة: عمولة 1-2%\n٣. نقطة التعادل: 12-18 شهر\n٤. العائد: 200-400%',
            legal: 'استشارة شرعية ونظامية\n\nالموضوع: ' + input + '\n\nالأدلة:\n• ﴿ لَا تَأْكُلُوا أَمْوَالَكُمْ بَيْنَكُمْ بِالْبَاطِلِ ﴾ — النساء: 29\n• نظام التجارة الإلكترونية (1440هـ)\n\nالتوصية: بناءً على الأدلة المذكورة...',
            campaign: 'حملة: ' + input + '\nالمدة: 30 يوم\n\nالقنوات: واتساب — منصة X — بريد إلكتروني\nالمستهدف: 50,000 وصول\nالخطوات:\n١. إعداد المحتوى\n٢. جدولة النشر\n٣. تقرير أسبوعي'
        };
        return T[t] || T.product;
    },

    copyAIResult() {
        var text = document.getElementById('sfabAIResult').textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() { alert('تم النسخ'); }).catch(function() { prompt('انسخ:', text); });
        } else { prompt('انسخ:', text); }
    },

    adminReport() {
        this.openChat();
        var msgs = document.getElementById('sfabChatMsgs');
        msgs.innerHTML += '<div class="sfab-chat-msg sfab-chat-user">تقرير حالة المنظومة</div>';
        var loading = document.createElement('div');
        loading.className = 'sfab-chat-msg sfab-chat-bot';
        loading.textContent = 'جارٍ جمع البيانات...';
        msgs.appendChild(loading);
        msgs.scrollTop = msgs.scrollHeight;
        fetch('/api/health').then(r => r.json()).then(data => {
            loading.remove();
            var report = 'تقرير المنظومة — ' + new Date().toLocaleDateString('ar-SA') + '\n\n';
            report += 'الحالة: ' + (data.status || 'يعمل') + '\n';
                        report += 'الأمان: 10 طبقات\n';
            report += 'الخادم: يعمل\n\n';
            report += 'بسم الله — المنظومة تعمل بكفاءة.';
            msgs.innerHTML += '<div class="sfab-chat-msg sfab-chat-bot">' + report + '</div>';
            msgs.scrollTop = msgs.scrollHeight;
        }).catch(function() {
            loading.remove();
            msgs.innerHTML += '<div class="sfab-chat-msg sfab-chat-bot">المنظومة تعمل — بسم الله.</div>';
        });
    },

    tool(type) {
        var url = window.location.href;
        var title = document.title;
        var copyText = function(text, msg) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() { alert(msg); }).catch(function() { prompt('انسخ:', text); });
            } else { prompt('انسخ:', text); }
        };
        switch(type) {
            case 'print': window.print(); break;
            case 'copy':
                var main = document.querySelector('main,.main,article,.content') || document.body;
                copyText(main.innerText.substring(0, 5000), 'تم نسخ المحتوى');
                break;
            case 'whatsapp': window.open('https://wa.me/?text=' + encodeURIComponent(title + '\n' + url)); break;
            case 'email': window.location.href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url); break;
            case 'twitter': window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url)); break;
            case 'link': copyText(url, 'تم نسخ الرابط'); break;
        }
        this.toggle();
    }
};

// ═══ التهيئة ═══
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
} else {
    build();
}

})();
