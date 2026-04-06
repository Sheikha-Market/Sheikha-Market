/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════
 *  منظومة شيخة — المرحلة ٢٨
 *  محرك الجرافيك الحلال عالي الجودة
 *  SHEIKHA HALAL GRAPHICS ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *  الضابط: لا تصوير ذوي الأرواح — الهندسة والخط والطبيعة والتجريد فقط
 *  الأساس: حديث تحريم التصوير + نماذج الهندسة الإسلامية العريقة
 *  التقنية: SVG + WebGL + Three.js + A-Frame + CSS3D + Manim
 * ═══════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ══ قواعد الجرافيك الحلال (من الكتاب والسنة) ═══════════════════════════
const HALAL_GRAPHIC_RULES = [
    {
        rule: 'لا تصوير ذوي الأرواح',
        arabic: 'لا يُجوز رسم أو توليد صور الإنسان أو الحيوان بأي بُعد',
        daleel: 'حديث: «أشد الناس عذاباً يوم القيامة المصورون» — متفق عليه',
        scope: ['إنسان', 'حيوان', 'جن', 'ملائكة بصورة مجسمة'],
        verdict: 'محرم',
    },
    {
        rule: 'عالم النبات والطبيعة الجامدة جائز',
        arabic: 'الأشجار والأزهار والجبال والبحار والأنهار جائزة',
        daleel: 'استثناء العلماء للنبات والجمادات',
        scope: ['نبات', 'جماد', 'طبيعة', 'فلك', 'جواهر'],
        verdict: 'جائز',
    },
    {
        rule: 'الهندسة الإسلامية والخط العربي',
        arabic: 'فن الزخرفة الهندسية والخط القرآني من أرقى الفنون الإسلامية',
        daleel: 'الإجماع على جواز الزخرفة الهندسية في المساجد والمخطوطات',
        scope: ['هندسة', 'خط عربي', 'زخرفة', 'أرابيسك', 'نجمية'],
        verdict: 'جائز ومستحب',
    },
    {
        rule: 'الرسوم التجريدية والبيانية',
        arabic: 'الرسوم البيانية والإنفوجرافيك والخرائط جائزة بلا قيود',
        daleel: 'لا نص في تحريمها — الأصل الإباحة',
        scope: ['بياني', 'إنفوجرافيك', 'خريطة', 'مؤشر', 'رسم توضيحي'],
        verdict: 'جائز ومفيد',
    },
    {
        rule: 'الصور الفلكية والفضائية',
        arabic: 'الكواكب والنجوم والمجرات جائزة التصوير لأنها لا أرواح',
        daleel: '﴿وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا﴾',
        scope: ['نجوم', 'كواكب', 'مجرات', 'فضاء', 'فلك'],
        verdict: 'جائز ومستحب للتفكر',
    },
    {
        rule: 'التجسيد الثلاثي للمنتجات والمعادن',
        arabic: 'تصوير المنتجات التجارية كالمعادن والسكراب والسلع جائز',
        daleel: 'الحاجة للتصوير التجاري في العرض والبيع — الإقناع بالحجج',
        scope: ['معادن', 'منتجات', 'سلع', 'مواد خام', 'آليات'],
        verdict: 'جائز للغرض التجاري',
    },
];

// ══ الأبعاد الجرافيكية المدعومة ═════════════════════════════════════════
const GRAPHIC_DIMENSIONS = [
    {
        dim: '2D', label: 'ثنائي الأبعاد',
        tech: ['SVG', 'Canvas 2D', 'CSS Animation'],
        use: ['شعارات', 'أيقونات', 'رسوم بيانية', 'خط عربي'],
        halal: true,
    },
    {
        dim: '3D', label: 'ثلاثي الأبعاد',
        tech: ['Three.js', 'WebGL', 'Babylon.js', 'Blender GLTF'],
        use: ['منتجات تجارية', 'معادن', 'خرائط مجسمة', 'نماذج هندسية'],
        halal: true,
    },
    {
        dim: '4D', label: 'رباعي الأبعاد (زمن+مكان)',
        tech: ['Three.js Animation', 'GSAP', 'WebGL Shaders', 'Timeline API'],
        use: ['بيانات حية متحركة', 'تطور الأسواق عبر الزمن', 'مؤشرات ديناميكية'],
        halal: true,
    },
    {
        dim: '5D', label: 'خماسي الأبعاد (بيانات متعددة)',
        tech: ['D3.js', 'Plotly', 'WebXR + Data Layers'],
        use: ['تحليل السوق الخماسي', 'مؤشر شيخة المتعدد الأبعاد', 'خرائط بيانات معقدة'],
        halal: true,
    },
    {
        dim: '360°', label: 'بانورامي ٣٦٠ درجة',
        tech: ['A-Frame', 'Three.js EquirectangularCamera', 'WebXR'],
        use: ['جولات افتراضية بالأسواق', 'معارض المنتجات', 'مشاهد الطبيعة'],
        halal: true,
    },
    {
        dim: 'VR/AR', label: 'الواقع الافتراضي والمعزز',
        tech: ['WebXR', 'A-Frame', 'AR.js', 'Three.js XR'],
        use: ['معرض سكراب افتراضي', 'فحص المعادن عن بُعد', 'التدريب الرقمي'],
        halal: true,
    },
    {
        dim: '∞D', label: 'لا محدود (بيانات + فضاء + زمن)',
        tech: ['Procedural Generation', 'WebGPU', 'Quantum Viz', 'Neural Render'],
        use: ['توليد فراكتال الهندسة الإسلامية', 'خرائط الكون الاقتصادي', 'مؤشرات ∞'],
        halal: true,
    },
];

// ══ أنماط الجرافيك الحلال المدعومة ═════════════════════════════════════
const HALAL_VISUAL_PATTERNS = [
    { id: 'arabesque',   label: 'أرابيسك',        desc: 'الزخرفة العربية التقليدية — أنماط نباتية متشابكة', color: '#D4AF37' },
    { id: 'geometric',   label: 'هندسة إسلامية',  desc: 'النجمة الثمانية، المضلعات المتداخلة، التكاثر الهندسي', color: '#B87333' },
    { id: 'calligraphy', label: 'خط عربي',         desc: 'الخط الكوفي والنسخ والثلث والرقعة والفارسي', color: '#D4AF37' },
    { id: 'fractal',     label: 'فراكتال إسلامي',  desc: 'أنماط هندسية لانهائية مستوحاة من كتب الجبر الإسلامي', color: '#16a085' },
    { id: 'cosmic',      label: 'فلكي كوني',        desc: 'النجوم والكواكب والمجرات بدون أرواح', color: '#2980b9' },
    { id: 'metallic',    label: 'معادن وخامات',    desc: 'تصوير تجاري احترافي للمعادن والخامات والسكراب', color: '#B87333' },
    { id: 'botanical',   label: 'نباتي طبيعي',     desc: 'الأشجار والأزهار والغابات والحدائق', color: '#27ae60' },
    { id: 'infographic', label: 'إنفوجرافيك',       desc: 'رسوم بيانية ومؤشرات وخرائط بيانية احترافية', color: '#8e44ad' },
    { id: 'datavis',     label: 'تصوير البيانات',   desc: 'تحويل البيانات الاقتصادية إلى مشاهد بصرية جميلة', color: '#2980b9' },
    { id: 'manim',       label: 'Manim رياضيات',   desc: 'تحريك المعادلات الرياضية والإسلامية (Manim engine)', color: '#e74c3c' },
];

// ══ خريطة التقنيات الجرافيكية ═══════════════════════════════════════════
const TECH_STACK = {
    '2D_vector':     { lib: 'SVG + CSS3 + Snap.svg', halal: true, realtime: true },
    '3D_web':        { lib: 'Three.js + WebGL 2.0',  halal: true, realtime: true },
    '3D_xr':         { lib: 'A-Frame + WebXR API',   halal: true, vr: true },
    'animation':     { lib: 'GSAP + Lottie + Manim', halal: true, math: true },
    'mapping':       { lib: 'Leaflet.js + Mapbox GL', halal: true, geo: true },
    'charts':        { lib: 'Chart.js + D3.js + ECharts', halal: true, data: true },
    'gpu_compute':   { lib: 'WebGPU + compute shaders', halal: true, performance: true },
    'procedural':    { lib: 'P5.js + ShaderToy',      halal: true, generative: true },
};

// ══ قوائم المحتوى المحظور ════════════════════════════════════════════════
const HARAM_CONTENT = [
    'وجوه بشرية واقعية',
    'حيوانات واقعية',
    'أصنام أو تماثيل',
    'محتوى جنسي',
    'رموز دينية غير إسلامية بقصد التعظيم',
    'توليد صور بالذكاء الاصطناعي لذوي الأرواح',
];

class SheikhaHalalGraphicsEngine {
    getRules() { return HALAL_GRAPHIC_RULES; }
    getDimensions() { return GRAPHIC_DIMENSIONS; }
    getPatterns() { return HALAL_VISUAL_PATTERNS; }
    getTechStack() { return TECH_STACK; }
    getHaramContent() { return HARAM_CONTENT; }

    checkContent(contentType) {
        const lower = contentType.toLowerCase();
        const haram = HARAM_CONTENT.some(h => lower.includes(h.split(' ')[0].toLowerCase()));
        return {
            contentType,
            verdict: haram ? 'محظور شرعاً' : 'جائز',
            allowed: !haram,
            advice: haram
                ? 'هذا النوع من المحتوى محظور. يرجى استخدام الهندسة أو الخط أو الطبيعة.'
                : 'المحتوى جائز — يمكن إنتاجه وفق معايير الجودة الشيخية.',
        };
    }

    getOverview() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            phase: 28,
            name: 'محرك الجرافيك الحلال عالي الجودة',
            halal_rules_count: HALAL_GRAPHIC_RULES.length,
            dimensions_count: GRAPHIC_DIMENSIONS.length,
            patterns_count: HALAL_VISUAL_PATTERNS.length,
            principle: 'لا تصوير ذوي الأرواح — الجمال الإسلامي في أعلى مستوى',
            verse: '﴿إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ﴾',
            tech_stack: Object.keys(TECH_STACK).length + ' تقنية',
            supported_dims: GRAPHIC_DIMENSIONS.map(d => d.dim),
            timestamp: new Date().toISOString(),
        };
    }
}

module.exports = new SheikhaHalalGraphicsEngine();
