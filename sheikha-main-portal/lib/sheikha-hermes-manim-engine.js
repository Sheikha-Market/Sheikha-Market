/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════
 *  منظومة شيخة — المرحلة ٢٩
 *  محرك هيرمس + Manim + إنتاج الفيديو الحلال
 *  SHEIKHA HERMES + MANIM + HALAL VIDEO ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *  هيرمس: نموذج ذكاء اصطناعي محلي حر (Hermes-3 via Ollama)
 *  Manim: مكتبة تحريك الرياضيات (3Blue1Brown) — تشغيل عبر Python
 *  Video pipeline: خط إنتاج الفيديو الحلال FFMPEG-based
 * ═══════════════════════════════════════════════════════════════════════════
 */
'use strict';

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ══ إعدادات هيرمس ═══════════════════════════════════════════════════════
const HERMES_CONFIG = {
    model: 'nous-hermes2',          // اسم النموذج في Ollama
    fallback_model: 'llama3.2',     // بديل إذا لم يوجد هيرمس
    port: 11434,                    // منفذ Ollama الافتراضي
    base_url: 'http://localhost:11434',
    timeout_ms: 30000,
    system_prompt: `أنت مساعد ذكاء اصطناعي إسلامي في منظومة شيخة.
تتبع أحكام الشريعة الإسلامية. تتحدث العربية والإنجليزية.
متخصص في: الاقتصاد الإسلامي، تجارة المعادن، الأسواق الحلال.
لا تُفتي في الأمور الدينية — أحِل إلى العلماء.`,
};

// ══ إعدادات Manim ════════════════════════════════════════════════════════
const MANIM_CONFIG = {
    python_exec: 'python3',
    manim_exec: 'manim',
    output_dir: path.join(__dirname, '../public/manim-renders'),
    quality: 'medium_quality',     // low|medium|high
    format: 'mp4',
    background_color: '#050508',   // لون شيخة الداكن
    text_color: '#D4AF37',         // ذهبي شيخة
    available_scenes: [
        { id: 'zakat_calc',     label: 'حساب الزكاة بصرياً',       class: 'ZakatCalculation' },
        { id: 'profit_curve',   label: 'منحنى الربح الإسلامي',     class: 'IslamicProfitCurve' },
        { id: 'gold_ratio',     label: 'نسبة الذهب إلى الفضة',     class: 'GoldSilverRatio' },
        { id: 'market_wave',    label: 'موجة السوق المعدني',        class: 'MetalMarketWave' },
        { id: 'arabic_geo',     label: 'الهندسة الإسلامية المتحركة', class: 'IslamicGeometry' },
        { id: 'quran_math',     label: 'معجزات الأرقام القرآنية',   class: 'QuranMathMiracles' },
        { id: 'oic_trade',      label: 'شبكة تجارة دول OIC',        class: 'OICTradeNetwork' },
        { id: 'dinar_system',   label: 'نظام الدينار الذهبي',       class: 'DinarGoldSystem' },
    ],
};

// ══ إعدادات خط إنتاج الفيديو ════════════════════════════════════════════
const VIDEO_CONFIG = {
    ffmpeg: 'ffmpeg',
    output_dir: path.join(__dirname, '../public/video-renders'),
    formats: ['mp4', 'webm', 'gif'],
    max_duration_sec: 120,
    default_fps: 30,
    watermark: 'sheikha.top ❘ منظومة شيخة',
    allowed_content: [
        'رسوم هندسية إسلامية',
        'خط عربي متحرك',
        'إنفوجرافيك بيانات',
        'مشاهد طبيعية (بدون أرواح)',
        'معادلات رياضية متحركة (Manim)',
        'مؤشرات اقتصادية',
        'خرائط جغرافية متحركة',
    ],
};

// ══ إدارة خادم هيرمس الخلفي ══════════════════════════════════════════════
let hermesProcess = null;
let hermesStatus  = 'stopped';

function startHermesServer() {
    if (hermesStatus === 'running') return { started: false, reason: 'يعمل بالفعل', status: hermesStatus };
    try {
        // تحقق من وجود Ollama
        execSync('which ollama', { stdio: 'ignore' });
    } catch (_) {
        hermesStatus = 'unavailable';
        return { started: false, reason: 'Ollama غير مثبَّت — استخدم: curl -fsSL https://ollama.ai/install.sh | sh', status: hermesStatus };
    }
    hermesProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    hermesProcess.stdout && hermesProcess.stdout.on('data', () => { hermesStatus = 'running'; });
    hermesProcess.on('close', () => { hermesStatus = 'stopped'; hermesProcess = null; });
    hermesProcess.on('error', () => { hermesStatus = 'error'; });
    hermesProcess.unref(); // الخادم مستقل عن العملية الرئيسية
    hermesStatus = 'starting';
    return { started: true, pid: hermesProcess.pid, status: hermesStatus };
}

function stopHermesServer() {
    if (hermesProcess) { hermesProcess.kill('SIGTERM'); hermesProcess = null; }
    hermesStatus = 'stopped';
    return { stopped: true };
}

function getHermesStatus() {
    return {
        status: hermesStatus,
        model: HERMES_CONFIG.model,
        fallback: HERMES_CONFIG.fallback_model,
        port: HERMES_CONFIG.port,
        base_url: HERMES_CONFIG.base_url,
        pid: hermesProcess ? hermesProcess.pid : null,
    };
}

// ══ توليد مشهد Manim ═════════════════════════════════════════════════════
function getManimScenes() { return MANIM_CONFIG.available_scenes; }

function generateManimScript(sceneId, params = {}) {
    const scene = MANIM_CONFIG.available_scenes.find(s => s.id === sceneId);
    if (!scene) return null;
    // قالب Python/Manim
    return `# بسم الله الرحمن الرحيم
# Manim Scene: ${scene.label}
# Generated by Sheikha Platform

from manim import *
config.background_color = "${MANIM_CONFIG.background_color}"

class ${scene.class}(Scene):
    def construct(self):
        title = Text("${scene.label}", color="${MANIM_CONFIG.text_color}", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        # [مكان منطق المشهد — يُخصَّص حسب المعاملات: ${JSON.stringify(params)}]
        self.wait(2)
`;
}

// ══ معلومات الإنتاج ══════════════════════════════════════════════════════
class SheikhaHermesManimEngine {
    getOverview() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            phase: 29,
            name: 'محرك هيرمس + Manim + الفيديو الحلال',
            hermes: {
                model: HERMES_CONFIG.model,
                status: hermesStatus,
                port: HERMES_CONFIG.port,
            },
            manim: {
                scenes: MANIM_CONFIG.available_scenes.length,
                output_dir: MANIM_CONFIG.output_dir,
                quality: MANIM_CONFIG.quality,
            },
            video: {
                formats: VIDEO_CONFIG.formats,
                max_duration: VIDEO_CONFIG.max_duration_sec + ' ثانية',
                allowed_content: VIDEO_CONFIG.allowed_content.length + ' نوع حلال',
            },
            timestamp: new Date().toISOString(),
        };
    }
    startServer()           { return startHermesServer(); }
    stopServer()            { return stopHermesServer(); }
    getStatus()             { return getHermesStatus(); }
    getScenes()             { return getManimScenes(); }
    getVideoConfig()        { return VIDEO_CONFIG; }
    generateScript(id, p)   { return generateManimScript(id, p); }
    getAllowedContent()      { return VIDEO_CONFIG.allowed_content; }
    getHermesConfig()       { return { model: HERMES_CONFIG.model, fallback: HERMES_CONFIG.fallback_model, port: HERMES_CONFIG.port }; }
}

module.exports = new SheikhaHermesManimEngine();
