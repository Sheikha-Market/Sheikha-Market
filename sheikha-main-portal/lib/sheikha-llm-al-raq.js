/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 LLM الراق — نموذج اللغة الذكي الراقي للبكسل الكوني
 *    Sheikha LLM Al-Raq — Elite Language Model for Cosmic Pixel Intelligence
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق: 1
 * ﴿ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ ﴾ — العلق: 5
 * ﴿ وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا ﴾ — الإسراء: 85
 *
 * المهام الرئيسية لـ LLM الراق:
 *   ✦ تفسير أحداث البكسل بلغة طبيعية (عربية + إنجليزية)
 *   ✦ توليد سكربتات البكسل الذكية (JS / Python / cURL)
 *   ✦ هندسة المحفزات (Prompt Engineering) للأحداث التجارية
 *   ✦ ترجمة إشارات السوق إلى قرارات شرعية مفسَّرة
 *   ✦ توليد توصيات ذكية بناءً على سياق السوق
 *   ✦ دمج مع محرك تحسين LLM الموجود
 *   ✦ محرك الذاكرة قصيرة المدى للسياق المتراكم
 *
 * الإصدار: 1.0.0-RAQY
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت LLM الراق ─────────────────────────────────────────────────────────
const RAQY_VERSION   = '1.0.0-RAQY';
const RAQY_NAME_AR   = 'LLM الراق — نموذج اللغة الذكي الراقي';
const RAQY_NAME_EN   = 'Sheikha LLM Al-Raq — Elite Cosmic Pixel LLM';
const RAQY_NAMESPACE = 'LLM-RAQY';

// ─── قوالب المحفزات الشرعية ──────────────────────────────────────────────────
const PROMPT_TEMPLATES = {
    pixel_event_ar: (event) =>
        `بسم الله الرحمن الرحيم\nقم بتحليل حدث البكسل التالي شرعياً وتجارياً:\n${JSON.stringify(event, null, 2)}\nالمطلوب: التصنيف الشرعي، درجة الثقة، والتوصية.`,

    pixel_event_en: (event) =>
        `Bismillah. Analyze the following pixel event for Sharia compliance and market intelligence:\n${JSON.stringify(event, null, 2)}\nRequired: Sharia classification, confidence score, and recommendation.`,

    script_gen_js: (config) =>
        `Generate a halal-compliant JavaScript pixel tracking script for:\nEvent: ${config.eventName}\nDomain: ${config.domain}\nMarket: ${config.market || 'GCC'}\nRequirements: No riba, no gharar, no data exploitation. Use Islamic trade principles.`,

    script_gen_python: (config) =>
        `Generate a Sharia-compliant Python pixel analytics script:\nEvent: ${config.eventName}\nEndpoint: ${config.endpoint}\nPrinciples: Halal data handling, no unauthorized tracking, fair use only.`,

    market_signal: (signal) =>
        `تحليل إشارة السوق التالية وفق الشريعة الإسلامية:\nالإشارة: ${signal.type}\nالقيمة: ${signal.value}\nالسوق: ${signal.market}\nالمطلوب: هل هذه الإشارة حلال؟ ما التوصية؟`,

    recommendation: (context) =>
        `بناءً على السياق التجاري التالي، ما هي توصيتك الشرعية والتجارية؟\nالسياق: ${JSON.stringify(context)}\nالمبادئ: الحلال، الشفافية، العدل، لا ضرر ولا ضرار.`
};

// ─── قاموس المصطلحات التجارية الإسلامية ──────────────────────────────────────
const ISLAMIC_TRADE_TERMS = {
    مرابحة:     { en: 'murabaha',   type: 'halal_finance', confidence: 0.98 },
    مضاربة:     { en: 'mudaraba',   type: 'halal_finance', confidence: 0.97 },
    مشاركة:     { en: 'musharaka',  type: 'halal_finance', confidence: 0.97 },
    إجارة:      { en: 'ijara',      type: 'halal_finance', confidence: 0.96 },
    استصناع:    { en: 'istisna',    type: 'halal_contract', confidence: 0.95 },
    سلم:        { en: 'salam',      type: 'halal_contract', confidence: 0.95 },
    تكافل:      { en: 'takaful',    type: 'halal_insurance', confidence: 0.96 },
    صكوك:       { en: 'sukuk',      type: 'halal_bond', confidence: 0.95 },
    زكاة:       { en: 'zakat',      type: 'obligation', confidence: 1.00 },
    وقف:        { en: 'waqf',       type: 'endowment', confidence: 0.99 },
    murabaha:   { ar: 'مرابحة',     type: 'halal_finance', confidence: 0.98 },
    mudaraba:   { ar: 'مضاربة',     type: 'halal_finance', confidence: 0.97 },
    musharaka:  { ar: 'مشاركة',     type: 'halal_finance', confidence: 0.97 },
    sukuk:      { ar: 'صكوك',       type: 'halal_bond', confidence: 0.95 },
    takaful:    { ar: 'تكافل',      type: 'halal_insurance', confidence: 0.96 }
};

// ─── مولّد الاستجابات الذكية (Rule-Based LLM محلي) ────────────────────────────
const RESPONSE_RULES = [
    {
        trigger: /مرابحة|murabaha/i,
        response_ar: 'المرابحة عقد بيع بالربح المعلوم — حلال وفق الفقه الإسلامي. ✅',
        response_en: 'Murabaha is a cost-plus financing — Sharia-compliant. ✅',
        confidence: 0.98, halal: true
    },
    {
        trigger: /زكاة|zakat/i,
        response_ar: 'الزكاة فريضة إسلامية — تُقوّي التكافل الاجتماعي. ✅',
        response_en: 'Zakat is an Islamic obligation — strengthens social solidarity. ✅',
        confidence: 1.00, halal: true
    },
    {
        trigger: /تكافل|takaful/i,
        response_ar: 'التكافل تأمين تعاوني إسلامي — بديل حلال للتأمين التقليدي. ✅',
        response_en: 'Takaful is Islamic cooperative insurance — Halal alternative. ✅',
        confidence: 0.96, halal: true
    },
    {
        trigger: /صكوك|sukuk/i,
        response_ar: 'الصكوك أوراق مالية إسلامية مدعومة بأصول حقيقية — حلال. ✅',
        response_en: 'Sukuk are asset-backed Islamic securities — Halal bonds. ✅',
        confidence: 0.95, halal: true
    },
    {
        trigger: /ربا|riba|فائدة مركبة|compound interest/i,
        response_ar: 'الربا محرم قطعاً ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: 275 ❌',
        response_en: 'Riba (usury/interest) is strictly prohibited in Islam. ❌',
        confidence: 0.01, halal: false
    },
    {
        trigger: /احتكار|monopoly/i,
        response_ar: 'الاحتكار محرم — «من احتكر فهو خاطئ» (مسلم). ❌',
        response_en: 'Monopoly is prohibited — Prophet (ﷺ) condemned it. ❌',
        confidence: 0.05, halal: false
    },
    {
        trigger: /تجارة عادلة|fair trade|حلال|halal/i,
        response_ar: 'التجارة العادلة الحلال هي أساس الاقتصاد الإسلامي. ✅',
        response_en: 'Fair halal trade is the foundation of Islamic economics. ✅',
        confidence: 0.92, halal: true
    }
];

// ─── قوالب سكربتات البكسل المولَّدة ─────────────────────────────────────────
function _generateJSScript(config) {
    const { eventName = 'page_view', endpoint = '/api/cosmic-pixel/process', market = 'GCC', domain = 'e-commerce' } = config;
    return `/**
 * بسم الله الرحمن الرحيم
 * Sheikha Halal Pixel Script — مولَّد بـ LLM الراق
 * الحدث: ${eventName} | السوق: ${market} | النطاق: ${domain}
 * لا ضرر ولا ضرار — بيانات شفافة وأمينة فقط
 */
(function SheikhaCOSMICPixel() {
    'use strict';

    const PIXEL_CONFIG = {
        event:    '${eventName}',
        market:   '${market}',
        domain:   '${domain}',
        endpoint: '${endpoint}',
        ts:       new Date().toISOString(),
        session:  (function() {
            let s = sessionStorage.getItem('spce_session');
            if (!s) { s = 'spce-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9); sessionStorage.setItem('spce_session', s); }
            return s;
        })()
    };

    // إرسال الحدث بشكل آمن وشفاف
    function sendPixelEvent(extraData = {}) {
        const payload = { ...PIXEL_CONFIG, ...extraData, zone: '${market}' };
        // لا يتم جمع: كلمات مرور، بيانات مالية حساسة، بيانات شخصية دون موافقة
        fetch(PIXEL_CONFIG.endpoint, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-Halal-Pixel': 'SPCE-v3' },
            body:    JSON.stringify({ payload })
        })
        .then(r => r.json())
        .then(d => { if (d.success && d.data?.halal) console.log('[SPCE] ✅ حلال:', d.data.verdict_ar); })
        .catch(e => console.warn('[SPCE] تحذير:', e.message));
    }

    // تفعيل الحدث عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => sendPixelEvent({ trigger: 'dom_ready' }));
    } else {
        sendPixelEvent({ trigger: 'immediate' });
    }

    // تتبع النقرات على روابط التجارة الحلال فقط
    document.addEventListener('click', function(e) {
        const el = e.target.closest('[data-halal-track]');
        if (el) sendPixelEvent({ trigger: 'click', element: el.dataset.halalTrack, text: el.textContent.trim().slice(0, 50) });
    });

    // تصدير للاستخدام الخارجي
    window.SheikhaCOSMICPixel = { send: sendPixelEvent, config: PIXEL_CONFIG };
})();`;
}

function _generatePythonScript(config) {
    const { eventName = 'page_view', endpoint = 'http://localhost:3000/api/cosmic-pixel/process', market = 'GCC' } = config;
    return `# بسم الله الرحمن الرحيم
# Sheikha Halal Pixel Script (Python) — مولَّد بـ LLM الراق
# الحدث: ${eventName} | السوق: ${market}
# لا ضرر ولا ضرار

import requests
import json
from datetime import datetime, timezone

PIXEL_CONFIG = {
    "event":    "${eventName}",
    "market":   "${market}",
    "endpoint": "${endpoint}",
}

def send_pixel_event(extra_data=None):
    """إرسال حدث بكسل حلال بشكل آمن وشفاف."""
    payload = {
        **PIXEL_CONFIG,
        "ts": datetime.now(timezone.utc).isoformat(),
        **(extra_data or {})
    }
    try:
        r = requests.post(
            PIXEL_CONFIG["endpoint"],
            json={"payload": payload, "zone": "${market}"},
            headers={"Content-Type": "application/json", "X-Halal-Pixel": "SPCE-v3-Python"},
            timeout=5
        )
        result = r.json()
        if result.get("success") and result.get("data", {}).get("halal"):
            print(f"[SPCE] ✅ حلال: {result['data'].get('verdict_ar', '')}")
        else:
            print(f"[SPCE] ⚠️ مراجعة مطلوبة: {result.get('data', {}).get('violations', [])}")
        return result
    except Exception as e:
        print(f"[SPCE] خطأ: {e}")
        return None

if __name__ == "__main__":
    send_pixel_event({"trigger": "manual_test", "source": "python_sdk"})
`;
}

function _generateCurlScript(config) {
    const { eventName = 'page_view', endpoint = 'http://localhost:3000/api/cosmic-pixel/process', market = 'GCC' } = config;
    return `# بسم الله الرحمن الرحيم
# Sheikha Halal Pixel — cURL Script — مولَّد بـ LLM الراق

curl -s -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Halal-Pixel: SPCE-v3-cURL' \\
  -d '{"payload":"${eventName} حلال","zone":"${market}"}' | python3 -m json.tool
`;
}

// ══════════════════════════════════════════════════════════════════════════════
// فئة LLM الراق الرئيسية
// ══════════════════════════════════════════════════════════════════════════════
class SheikhaLLMAlRaq extends EventEmitter {
    constructor(options = {}) {
        super();
        this.name      = RAQY_NAME_AR;
        this.nameEn    = RAQY_NAME_EN;
        this.namespace = RAQY_NAMESPACE;
        this.version   = RAQY_VERSION;
        this.options   = { maxContext: 50, language: 'ar', ...options };

        // ذاكرة السياق قصيرة المدى
        this._context  = [];
        this._seq      = 0;

        // الإحصائيات
        this._stats = {
            prompts: 0, responses: 0, scriptsGenerated: 0,
            halalResponses: 0, haramResponses: 0, errors: 0
        };

        // محاولة تحميل محرك LLM الموجود
        this._llmAgent = null;
        try {
            const { SheikhaLLMOptimizationAgent } = require('./sheikha-llm-optimization-agent.js');
            this._llmAgent = new SheikhaLLMOptimizationAgent();
            console.log(`[${RAQY_NAMESPACE}] ✅ محرك LLM Optimization Agent محمّل ومتصل`);
        } catch (e) {
            console.log(`[${RAQY_NAMESPACE}] ℹ️ LLM Optimization Agent غير متوفر — وضع المحرك المحلي`);
        }

        this._startTime = Date.now();
        console.log(`[${RAQY_NAMESPACE}] 🧠 تهيئة ${RAQY_NAME_AR} — الإصدار ${RAQY_VERSION}`);
        console.log(`[${RAQY_NAMESPACE}] ✅ محرك اللغة الراقي جاهز`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // prompt(text, opts?) — إرسال محفز واستقبال استجابة ذكية
    // ══════════════════════════════════════════════════════════════════════════
    prompt(text, opts = {}) {
        const ts  = new Date().toISOString();
        const seq = ++this._seq;
        this._stats.prompts++;

        try {
            const lang = opts.language || this.options.language || 'ar';
            const lower = String(text || '').toLowerCase();

            // مطابقة قواعد الاستجابة
            let matched = null;
            for (const rule of RESPONSE_RULES) {
                if (rule.trigger.test(lower)) {
                    matched = rule;
                    break;
                }
            }

            // كشف مصطلحات التجارة الإسلامية
            const terms = [];
            for (const [term, info] of Object.entries(ISLAMIC_TRADE_TERMS)) {
                if (lower.includes(term.toLowerCase())) {
                    terms.push({ term, ...info });
                }
            }

            const response = matched
                ? (lang === 'ar' ? matched.response_ar : matched.response_en)
                : (lang === 'ar'
                    ? `تحليل LLM الراق: النص يحتاج مراجعة شرعية متأنية. المبدأ: ${terms.length > 0 ? terms.map(t => t.term).join('، ') : 'لا مصطلحات معروفة'}`
                    : `LLM Al-Raq: Text requires careful Sharia review. Terms: ${terms.length > 0 ? terms.map(t => t.term).join(', ') : 'none detected'}`);

            const confidence  = matched ? matched.confidence : 0.50;
            const halal       = matched ? matched.halal : (terms.some(t => t.confidence > 0.9) ? true : null);

            if (halal === true)  this._stats.halalResponses++;
            if (halal === false) this._stats.haramResponses++;
            this._stats.responses++;

            const record = {
                id: `raqy-${seq}-${Date.now()}`,
                seq, ts,
                prompt:    text.slice(0, 200),
                response,
                confidence,
                halal,
                terms,
                lang,
                engine: `${RAQY_NAMESPACE} v${RAQY_VERSION}`
            };

            // حفظ في السياق
            this._addContext({ role: 'user', content: text });
            this._addContext({ role: 'assistant', content: response, confidence });

            this.emit('response', record);
            return { success: true, ...record };

        } catch (err) {
            this._stats.errors++;
            return { success: false, error: err.message, seq, timestamp: ts };
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // interpretPixelEvent(event, opts?) — تفسير حدث بكسل بلغة طبيعية
    // ══════════════════════════════════════════════════════════════════════════
    interpretPixelEvent(event, opts = {}) {
        const lang = opts.language || 'ar';
        const tmpl = lang === 'ar'
            ? PROMPT_TEMPLATES.pixel_event_ar(event)
            : PROMPT_TEMPLATES.pixel_event_en(event);
        return this.prompt(tmpl, opts);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // generateScript(config, type?) — توليد سكربت بكسل ذكي
    // type: 'js' | 'python' | 'curl'
    // ══════════════════════════════════════════════════════════════════════════
    generateScript(config = {}, type = 'js') {
        const ts  = new Date().toISOString();
        this._stats.scriptsGenerated++;

        let script, lang_name;
        switch (type.toLowerCase()) {
            case 'python': script = _generatePythonScript(config); lang_name = 'Python'; break;
            case 'curl':   script = _generateCurlScript(config);   lang_name = 'cURL';   break;
            default:       script = _generateJSScript(config);     lang_name = 'JavaScript'; break;
        }

        return {
            success:    true,
            type,
            lang_name,
            script,
            config,
            lines:      script.split('\n').length,
            generated_by: `${RAQY_NAMESPACE} v${RAQY_VERSION}`,
            bismillah:  'بسم الله الرحمن الرحيم',
            quranRef:   '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
            timestamp:  ts
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // analyzeMarketSignal(signal) — تحليل إشارة سوقية بالذكاء الاصطناعي
    // ══════════════════════════════════════════════════════════════════════════
    analyzeMarketSignal(signal) {
        const tmpl = PROMPT_TEMPLATES.market_signal(signal);
        const result = this.prompt(tmpl, { language: 'ar' });
        return {
            ...result,
            signal,
            islamicStandard: 'AAOIFI + OIC Fiqh Academy',
            marketZone: signal.market || 'GLOBAL'
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getStatus() — حالة LLM الراق
    // ══════════════════════════════════════════════════════════════════════════
    getStatus() {
        const now = Date.now();
        return {
            status:     'RAQY_READY',
            version:    this.version,
            name:       this.name,
            nameEn:     this.nameEn,
            namespace:  this.namespace,
            timestamp:  new Date().toISOString(),
            uptimeMs:   now - this._startTime,
            contextSize:this._context.length,
            llmAgentConnected: !!this._llmAgent,
            statistics: { ...this._stats },
            capabilities: [
                'pixel_event_interpretation',
                'script_generation_js',
                'script_generation_python',
                'script_generation_curl',
                'market_signal_analysis',
                'sharia_prompt_engineering',
                'short_term_context_memory'
            ],
            islamicFoundation: {
                quranRef: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق: 1',
                hadith:   '«طلب العلم فريضة على كل مسلم» — ابن ماجه'
            }
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getContext(limit?) — ذاكرة السياق
    // ══════════════════════════════════════════════════════════════════════════
    getContext(limit = 20) {
        return this._context.slice(-Math.min(limit, this.options.maxContext));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // clearContext() — مسح السياق
    // ══════════════════════════════════════════════════════════════════════════
    clearContext() {
        this._context = [];
    }

    // دوال مساعدة داخلية
    _addContext(entry) {
        this._context.push({ ...entry, ts: new Date().toISOString() });
        while (this._context.length > this.options.maxContext) {
            this._context.shift();
        }
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
let _raqyInstance = null;

function getInstance() {
    if (!_raqyInstance) _raqyInstance = new SheikhaLLMAlRaq();
    return _raqyInstance;
}

function createRaqy(options = {}) {
    return new SheikhaLLMAlRaq(options);
}

// ─── تصدير LLM الراق ─────────────────────────────────────────────────────────
const instance = getInstance();
module.exports = instance;
module.exports.SheikhaLLMAlRaq    = SheikhaLLMAlRaq;
module.exports.getInstance        = getInstance;
module.exports.createRaqy         = createRaqy;
module.exports.RAQY_VERSION       = RAQY_VERSION;
module.exports.PROMPT_TEMPLATES   = PROMPT_TEMPLATES;
module.exports.ISLAMIC_TRADE_TERMS = ISLAMIC_TRADE_TERMS;
