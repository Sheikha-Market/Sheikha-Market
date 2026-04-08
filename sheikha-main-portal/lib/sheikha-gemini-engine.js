'use strict';

/**
 * sheikha-gemini-engine.js
 * محرك Gemini AI الشامل — منظومة شيخة
 * المرحلة ٤٢ — الذكاء الاصطناعي الإسلامي المتكامل
 * Gemini 2.0 Pro | Flash | Vision | Embeddings | Grounding
 * بسم الله الرحمن الرحيم
 * وَمَا أُوتِيتُمْ مِنَ الْعِلْمِ إِلَّا قَلِيلاً (الإسراء:85)
 */

// ─────────────────────────────────────────────────────────────
// إعدادات Gemini لمنظومة شيخة
// ─────────────────────────────────────────────────────────────
const GEMINI_CONFIG = {
    api_base: 'https://generativelanguage.googleapis.com/v1beta',
    vertex_base: 'https://me-central1-aiplatform.googleapis.com/v1/projects/sheikha-marketplace/locations/me-central1/publishers/google/models',
    api_key_env: 'GEMINI_API_KEY',
    project_id: 'sheikha-marketplace',
    location: 'me-central1',
    phase: 42,
    quran_ref: 'وَمَا أُوتِيتُمْ مِنَ الْعِلْمِ إِلَّا قَلِيلاً — الإسراء:85',
    islamic_principle: 'الذكاء الاصطناعي أداة — الحكم والأخلاق للإنسان المسلم المسؤول'
};

// ─────────────────────────────────────────────────────────────
// نماذج Gemini المتاحة لشيخة
// ─────────────────────────────────────────────────────────────
const GEMINI_MODELS = {
    gemini_2_flash: {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash — السريع',
        icon: '⚡',
        tier: 'fast',
        context_window: 1000000,
        max_output: 8192,
        supports_vision: true,
        supports_audio: true,
        cost_per_1m_input: 0.075,  // USD
        cost_per_1m_output: 0.30,   // USD
        sheikha_uses: [
            'ردود فورية على استفسارات التجار',
            'تصنيف المنتجات والسكراب سريعاً',
            'ترجمة العقود والوثائق',
            'تلخيص تقارير السوق',
            'استخراج HS Code من وصف المنتج',
            'فحص سريع للامتثال الشرعي'
        ],
        recommended_for: 'API calls المتكررة — chatbot — تصنيف تلقائي'
    },
    gemini_2_pro: {
        id: 'gemini-2.0-pro',
        name: 'Gemini 2.0 Pro — المتخصص',
        icon: '🧠',
        tier: 'advanced',
        context_window: 2000000,
        max_output: 8192,
        supports_vision: true,
        supports_audio: true,
        supports_grounding: true,
        cost_per_1m_input: 1.25,  // USD
        cost_per_1m_output: 5.00,  // USD
        sheikha_uses: [
            'تحليل عقود معقدة وتفسيرها قانونياً وشرعياً',
            'توليد تقارير سوق مفصلة',
            'إعداد خطط عمل ومقترحات تجارية',
            'تحليل Incoterms ومراجعة شروط الشحن',
            'دراسات الجدوى الاقتصادية',
            'مراجعة دقيقة للامتثال لمعايير الشريعة'
        ],
        recommended_for: 'التحليل المعمق — العقود — التقارير المفصلة'
    },
    gemini_15_vision: {
        id: 'gemini-1.5-pro-002',
        name: 'Gemini 1.5 Pro Vision — محلل الصور',
        icon: '👁️',
        tier: 'vision',
        context_window: 2000000,
        max_output: 8192,
        supports_vision: true,
        supports_video: true,
        sheikha_uses: [
            'تحليل صور السكراب وتقدير الجودة',
            'قراءة وثائق ضوئية (PDF, صور فواتير)',
            'تصنيف أنواع المعادن من الصورة',
            'استخراج نصوص من الصور العربية والإنجليزية',
            'مراجعة بطاقات الشحن وملصقات المنتجات',
            'تحليل فيديوهات معاينة البضاعة'
        ],
        recommended_for: 'تحليل الصور والمستندات الضوئية'
    },
    text_embedding: {
        id: 'text-embedding-004',
        name: 'Text Embedding — البحث الدلالي',
        icon: '🔍',
        tier: 'embedding',
        dimensions: 768,
        sheikha_uses: [
            'البحث الدلالي في قاعدة بيانات الفتاوى',
            'تشابه المنتجات والمواصفات',
            'البحث في الأحاديث والآيات الشرعية ذات الصلة',
            'تصنيف التقارير والوثائق'
        ],
        recommended_for: 'Vector Search في قاعدة البيانات الشرعية وكتالوج المنتجات'
    },
    imagen: {
        id: 'imagen-3.0-generate-001',
        name: 'Imagen 3 — توليد الصور',
        icon: '🎨',
        tier: 'image_generation',
        sheikha_uses: [
            'توليد صور تسويقية للمعادن',
            'إنشاء شعارات ومواد مرئية',
            'تصميم بطاقات العروض',
            'صور مرافقة للتقارير والمنشورات'
        ],
        recommended_for: 'المحتوى التسويقي والتصاميم',
        halal_constraint: 'لا صور بشرية أو حيوانية — حسب الضوابط الشرعية للتصوير'
    }
};

// ─────────────────────────────────────────────────────────────
// الشخصيات الذكية (System Prompts) لمنظومة شيخة
// ─────────────────────────────────────────────────────────────
const SHEIKHA_AI_PERSONAS = {
    sharia_advisor: {
        id: 'sharia_advisor',
        name: 'مستشار الشريعة الاقتصادية',
        icon: '📖',
        model: 'gemini-2.0-pro',
        system_prompt: `أنت مستشار الشريعة الاقتصادية في منظومة شيخة للمعادن والسكراب.
دورك: مراجعة المعاملات التجارية للتأكد من خلوها من الربا والغرر والغش والاحتكار.
مبادئك الثوابت:
- لا ربا: أي فائدة محرمة على كل المبالغ — القرض بفائدة محرم
- لا غرر: يجب الوضوح الكامل في الكميات والجودة والسعر وموعد التسليم
- لا غش: الصدق التام في وصف البضاعة
- لا احتكار: تيسير البيع وعدم الاحتجان
- لا نجش: لا مزايدة زائفة لرفع الأسعار
ملاحظات:
- لا تُفتِ بالأحكام القطعية — أشر فقط لمخاطر عدم الامتثال
- اقترح صيغ شرعية بديلة عند الحاجة (مرابحة، مشاركة، مضاربة)
- اللغة: العربية الفصحى الواضحة`,
        use_cases: ['فحص عقود التوريد', 'مراجعة اتفاقيات القرض', 'تقييم عروض التمويل', 'تصنيف المعاملة شرعياً']
    },
    metals_expert: {
        id: 'metals_expert',
        name: 'خبير المعادن والسكراب',
        icon: '⚙️',
        model: 'gemini-2.0-flash',
        system_prompt: `أنت خبير المعادن والسكراب في منظومة شيخة.
خبرتك: تحديد أنواع المعادن الحديدية وغير الحديدية، تقدير الجودة والأسعار السوقية، HS Codes للاستيراد والتصدير.
معلوماتك تشمل:
- المعادن الحديدية: حديد، فولاذ، صلب، حديد زهر (cast iron)
- غير حديدية: نحاس (bare bright, copper#1, copper#2)، ألومنيوم (المج، الشيت، الكابل)، رصاص، زنك، نيكل، ستانلس
- الثمينة: ذهب، فضة، بلاتين
- منظومة: HS Codes، Incoterms، شهادات الجودة
اللغة: عربي أو إنجليزي حسب طلب التاجر`,
        use_cases: ['تصنيف السكراب من وصف أو صورة', 'استخراج HS Code', 'تقدير السعر السوقي', 'مراجعة مواصفات الشحن']
    },
    market_analyst: {
        id: 'market_analyst',
        name: 'محلل سوق المعادن',
        icon: '📈',
        model: 'gemini-2.0-pro',
        system_prompt: `أنت محلل سوق المعادن لمنظومة شيخة الاقتصادية.
مهمتك: تحليل أسعار المعادن العالمية، اتجاهات العرض والطلب، المؤشرات الاقتصادية ذات الصلة.
مصادرك المرجعية: LME (London Metal Exchange)، SHFE، سوق المعادن السعودي، أسعار الخردة العالمية.
أسلوبك: موضوعي، محايد، يستند للأرقام.
تنبه: لا تقدم توصيات استثمارية ملزمة — التحليل للاستئناس وليس للاستشارة المالية.
اللغة: عربية أو إنجليزية`,
        use_cases: ['تقرير السوق اليومي', 'تحليل اتجاهات الأسعار', 'مقارنة الأسواق', 'تقدير قيمة الكمية']
    },
    customer_service: {
        id: 'customer_service',
        name: 'خدمة عملاء شيخة',
        icon: '💬',
        model: 'gemini-2.0-flash',
        system_prompt: `أنت مساعد خدمة العملاء في منظومة شيخة للمعادن والسكراب.
قيمك: الصدق والأمانة والكرم مع العملاء.
مهمتك: الرد على الاستفسارات، إرشاد التجار، حل المشكلات، شرح خدمات المنظومة.
خدمات شيخة التي تشرحها: السوق، الزكاة، اللوجستيات، التمويل الحلال، الشريعة، التسجيل.
أسلوبك: مهذب، واضح، مفيد، إسلامي الروح.
البداية: ابدأ بالبسملة أو السلام إن لم يبدأ بها العميل.
اللغة الرئيسية: العربية مع إمكانية الإنجليزية`,
        use_cases: ['الرد على استفسارات العملاء', 'إرشاد التسجيل', 'شرح كيفية الاستخدام', 'حل الشكاوى الأولية']
    },
    zakat_guide: {
        id: 'zakat_guide',
        name: 'مرشد الزكاة التجارية',
        icon: '🧮',
        model: 'gemini-2.0-flash',
        system_prompt: `أنت مرشد الزكاة التجارية في منظومة شيخة.
تخصصك: حساب زكاة عروض التجارة، المعادن، السكراب، الذهب والفضة.
مفيد للتعليم — لا تُفتِ بوجوب أو عدم وجوب (خاص بالعلماء).
قواعدك:
- النصاب المعتمد: نصاب الفضة (الأنفع للفقراء)
- المعدل: 2.5% (ربع العشر)
- الحول: سنة هجرية (354.37 يوم)
- وعاء الزكاة: البضاعة + النقود + الذمم − الديون الحالة
- المصارف الثمانية: التوبة:60
اللغة: العربية مع الأدلة القرآنية والحديثية`,
        use_cases: ['شرح كيفية حساب الزكاة', 'تحديد وعاء الزكاة', 'الإجابة على أسئلة الزكاة التجارية', 'إرشاد توزيع الزكاة']
    }
};

// ─────────────────────────────────────────────────────────────
// قوالب الطلبات الجاهزة
// ─────────────────────────────────────────────────────────────
const PROMPT_TEMPLATES = {
    classify_scrap: (description) => `صنّف هذا السكراب وأعطِ HS Code المناسب له:
الوصف: ${description}
المطلوب: النوع الدقيق (حديدي/غير حديدي/ثمين) + HS Code + نطاق السعر المتوقع بالريال السعودي للطن`,

    check_sharia: (transaction) => `افحص هذه المعاملة التجارية للامتثال الشرعي:
${transaction}
المطلوب: هل فيها شبهة ربا أو غرر أو غش؟ ما البديل الشرعي الصحيح؟`,

    calculate_zakat_guide: (assets) => `أرشدني لحساب الزكاة على أصولي التجارية:
${assets}
المطلوب: آلية الحساب خطوة بخطوة مع الأدلة الشرعية`,

    market_report: (metal, period) => `أعد تقريراً عن سوق ${metal} خلال ${period} يشمل:
- اتجاه الأسعار
- العوامل المؤثرة
- التوقعات القريبة
- توصيات للتجار في السوق السعودي`,

    translate_contract: (text, target_lang) => `ترجم هذا النص من عقد تجاري للمعادن إلى ${target_lang} مع الحفاظ على الدقة القانونية:
${text}`
};

// ─────────────────────────────────────────────────────────────
// إعداد الطلب إلى Gemini API
// ─────────────────────────────────────────────────────────────
function buildGeminiRequest(params) {
    const {
        model = 'gemini-2.0-flash',
        persona_id = null,
        user_message,
        temperature = 0.7,
        max_tokens = 2048,
        language = 'ar'
    } = params;

    const persona = persona_id ? SHEIKHA_AI_PERSONAS[persona_id] : null;
    const system = persona ? persona.system_prompt : `أنت مساعد ذكاء اصطناعي لمنظومة شيخة الاقتصادية الإسلامية. أجب باللغة ${language === 'ar' ? 'العربية' : 'الإنجليزية'}.`;

    return {
        model,
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user_message }] }],
        generationConfig: {
            temperature,
            maxOutputTokens: max_tokens,
            topP: 0.95,
            topK: 64
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };
}

// ─────────────────────────────────────────────────────────────
// استدعاء Gemini API (يحتاج GEMINI_API_KEY)
// ─────────────────────────────────────────────────────────────
async function callGemini(params) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            success: false,
            error: 'GEMINI_API_KEY غير مضبوط في بيئة الخادم',
            hint: 'أضف GEMINI_API_KEY في .env أو Google Secret Manager'
        };
    }

    const { model = 'gemini-2.0-flash', user_message, persona_id, temperature = 0.7, max_tokens = 2048 } = params;
    const persona = persona_id ? SHEIKHA_AI_PERSONAS[persona_id] : null;
    const systemText = persona ? persona.system_prompt : 'أنت مساعد ذكاء اصطناعي لمنظومة شيخة الاقتصادية.';

    try {
        const https = require('https');
        const body = JSON.stringify({
            system_instruction: { parts: [{ text: systemText }] },
            contents: [{ role: 'user', parts: [{ text: user_message }] }],
            generationConfig: { temperature, maxOutputTokens: max_tokens }
        });

        const result = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(new Error('فشل تحليل استجابة Gemini')); }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });

        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
            success: true,
            model,
            persona: persona_id,
            response: text,
            usage: result?.usageMetadata || {},
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────
// إحصائيات المحرك
// ─────────────────────────────────────────────────────────────
function getEngineStats() {
    return {
        engine: 'sheikha-gemini-engine',
        version: '1.0.0',
        phase: 42,
        models_available: Object.keys(GEMINI_MODELS).length,
        personas: Object.keys(SHEIKHA_AI_PERSONAS).length,
        prompt_templates: Object.keys(PROMPT_TEMPLATES).length,
        primary_model: 'gemini-2.0-flash',
        advanced_model: 'gemini-2.0-pro',
        api_key_configured: !!process.env.GEMINI_API_KEY,
        quran_ref: GEMINI_CONFIG.quran_ref,
        islamic_principle: GEMINI_CONFIG.islamic_principle
    };
}

module.exports = {
    getEngineStats,
    getAllModels: () => Object.values(GEMINI_MODELS),
    getModelById: (id) => Object.values(GEMINI_MODELS).find(m => m.id === id) || null,
    getAllPersonas: () => Object.values(SHEIKHA_AI_PERSONAS),
    getPersonaById: (id) => SHEIKHA_AI_PERSONAS[id] || null,
    getPromptTemplates: () => PROMPT_TEMPLATES,
    buildGeminiRequest,
    callGemini,
    GEMINI_CONFIG
};
