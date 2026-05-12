/**
 * routes/visual.routes.js
 * 🔌 API Endpoints لمحرك الإنتاج البصري المملوك لشيخة
 * 
 * Endpoints:
 * GET  /health         → حالة المحرك
 * GET  /catalog        → فهرس الخدمات
 * GET  /brain          → هوية شيخة البصرية
 * GET  /jobs           → قائمة المهام
 * GET  /library        → مكتبة الوسائط
 * POST /plan           → تخطيط بصري
 * POST /job            → إنشاء مهمة
 * POST /generate       → توليد بصري
 * POST /analyze        → تحليل أصل
 * GET  /stats          → إحصائيات شاملة
 */

const express = require('express');
const path = require('node:path');
const SheikhaVisualEngine = require('../lib/sheikha-visual-generation-engine');
const SheikhaJobQueue = require('../lib/sheikha-job-queue');
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');

const router = express.Router();
const visualEngine = new SheikhaVisualEngine();
const queue = new SheikhaJobQueue(path.join(__dirname, '..'));

// ═══════════════════════════════════════════════════════════════════════════
// 🏥 HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/visual/health
 * التحقق من صحة محرك الإنتاج البصري
 */
router.get('/health', (req, res) => {
  return res.json({
    success: true,
    data: {
      status: 'operational',
      engine: 'sheikha_visual_generation_v1',
      uptime: process.uptime(),
      capabilities: [
        'brand-enforcement',
        'visual-planning',
        'multi-adapter-chain',
        'media-library-management',
        'palette-mapping',
        'quality-analysis'
      ],
      owner: 'شيخة',
      license: 'proprietary',
      braided: 'Brand Brain متكامل'
    },
    message: 'محرك الإنتاج البصري المملوك لشيخة يعمل بكفاءة عالية',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 BRAND BRAIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/visual/brain
 * الحصول على هوية شيخة البصرية الكاملة
 */
router.get('/brain', (req, res) => {
  const brain = visualEngine.getBrandBrain();
  return res.json(brain);
});

// ═══════════════════════════════════════════════════════════════════════════
// 📋 CATALOG & PLANNING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/visual/catalog
 * فهرس الخدمات والقدرات المتاحة
 */
router.get('/catalog', (req, res) => {
  return res.json({
    success: true,
    data: {
      visualTypes: ['image', 'banner', 'icon', 'logo', 'ui', 'video', 'illustration'],
      intents: [
        'brand_visual',
        'marketplace_visual',
        'technical_visual',
        'sharia_visual',
        'marketing_visual',
        'educational_visual',
        'general_visual'
      ],
      adapterChains: {
        image: [
          'input_processor',
          'brand_enforcer',
          'palette_mapper',
          'neural_renderer',
          'quality_checker'
        ],
        banner: [
          'layout_optimizer',
          'brand_enforcer',
          'text_renderer',
          'neural_renderer'
        ],
        video: [
          'scene_planner',
          'frame_generator',
          'audio_sync',
          'quality_checker'
        ]
      },
      formats: ['png', 'jpg', 'webp', 'svg', 'mp4'],
      qualities: ['draft', 'standard', 'high', 'ultra'],
      resolutions: ['720p', '1080p', '1440p', '2160p', 'custom']
    },
    message: 'فهرس خدمات محرك الإنتاج البصري',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/visual/plan
 * تخطيط مهمة بصرية
 */
router.post('/plan', (req, res) => {
  const { command, type, intent, aspectRatio, resolution, quality } = req.body;

  if (!command) {
    return res.status(400).json({
      success: false,
      message: 'أمر البصري مطلوب'
    });
  }

  const plan = visualEngine.planVisual(command, {
    type,
    intent,
    aspectRatio,
    resolution,
    quality
  });

  return res.json({
    success: true,
    data: plan,
    message: 'تم تخطيط المهمة البصرية بنجاح',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 JOB MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/visual/jobs
 * قائمة جميع مهام الإنتاج البصري
 */
router.get('/jobs', (req, res) => {
  const stats = visualEngine.getEngineStats();
  return res.json({
    success: true,
    data: {
      jobs: visualEngine.visualJobs,
      stats: stats.jobs,
      summary: {
        total: visualEngine.visualJobs.length,
        processing: stats.jobs.processing,
        completed: stats.jobs.completed,
        failed: stats.jobs.failed
      }
    },
    message: 'قائمة مهام الإنتاج البصري',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/visual/job
 * إنشاء مهمة بصرية جديدة
 */
router.post('/job', (req, res) => {
  const payload = req.body || {};
  const { command, prompt } = payload;

  if (!command && !prompt) {
    return res.status(400).json({
      success: false,
      message: 'أمر أو وصف بصري مطلوب'
    });
  }

  const queued = queue.createJob({
    type: 'visual',
    mode: payload.type || 'image',
    priority: payload.priority || 'normal',
    payload
  });

  sheikhaRealtimeHub.emitEvent('visual.job.created', {
    queueJobId: queued.job.id,
    type: queued.job.type,
    mode: queued.job.mode,
    priority: queued.job.priority,
    prompt: payload.prompt || payload.command || 'visual-job'
  });

  return res.json({
    ...queued,
    data: queued.job,
    message: 'تم إدراج مهمة الإنتاج البصري في الطابور',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/visual/generate
 * توليد بصري (بدء تنفيذ مهمة)
 */
router.post('/generate', (req, res) => {
  const payload = req.body || {};
  const { type, intent, prompt, aspectRatio } = payload;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'وصف الإنتاج البصري مطلوب'
    });
  }

  if (payload.async === true) {
    const queued = queue.createJob({
      type: 'visual',
      mode: payload.type || 'image',
      priority: payload.priority || 'normal',
      payload
    });

    sheikhaRealtimeHub.emitEvent('visual.job.created', {
      queueJobId: queued.job.id,
      type: queued.job.type,
      mode: queued.job.mode,
      priority: queued.job.priority,
      prompt: payload.prompt || 'visual-generate'
    });

    return res.json({
      ...queued,
      data: {
        queueJobId: queued.job.id,
        status: queued.job.status,
        priority: queued.job.priority,
        message: 'تم إدراج مهمة الإنتاج البصري في الطابور'
      },
      message: 'تم قبول الطلب بنمط غير متزامن',
      timestamp: new Date().toISOString()
    });
  }

  // إنشاء خطة أولاً
  const plan = visualEngine.planVisual(prompt, { aspectRatio });

  // إنشاء مهمة
  const job = visualEngine.createVisualJob({
    ...plan,
    type: type || 'image',
    intent: intent || plan.intent,
    prompt
  });

  sheikhaRealtimeHub.emitEvent('visual.job.created', {
    jobId: job.id,
    type: job.type,
    intent: job.intent,
    prompt: job.prompt
  });

  // بدء التنفيذ
  visualEngine.executeVisualJob(job.id);

  setTimeout(() => {
    const latest = visualEngine.visualJobs.find((item) => item.id === job.id);
    if (latest?.status === 'completed') {
      sheikhaRealtimeHub.emitEvent('visual.job.completed', {
        jobId: latest.id,
        status: latest.status,
        qualityScore: latest.metadata?.quality_score || 0,
        assets: latest.assets
      });
    }
  }, 6200);

  return res.json({
    success: true,
    data: {
      jobId: job.id,
      status: 'processing',
      progress: 10,
      message: 'جاري التوليد البصري',
      estimatedTime: '15-30 ثانية',
      provider: 'sheikha_visual_adapter',
      tracking: {
        plan_id: plan.id,
        brand_locked: true,
        adapter_chain: plan.adapterChain
      }
    },
    message: 'بدء عملية الإنتاج البصري',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 📚 MEDIA LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/visual/library
 * مكتبة الوسائط البصرية المملوكة
 */
router.get('/library', (req, res) => {
  const { search, type, category } = req.query;

  let assets = visualEngine.visualLibrary;

  if (search) {
    const q = search.toLowerCase();
    assets = assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.metadata.tags.some(tag => tag.toLowerCase().includes(q)) ||
      a.metadata.description.toLowerCase().includes(q)
    );
  }

  if (type) {
    assets = assets.filter(a => a.type === type);
  }

  if (category) {
    assets = assets.filter(a => a.category === category);
  }

  const stats = visualEngine.getLibraryStats();

  return res.json({
    success: true,
    data: {
      assets,
      found: assets.length,
      stats,
      ownership: {
        owner: 'sheikha',
        license: 'proprietary',
        all_brand_locked: assets.every(a => a.ownership.brand_locked)
      }
    },
    message: 'مكتبة الوسائط البصرية المملوكة لشيخة',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/visual/analyze
 * تحليل أصل بصري
 */
router.post('/analyze', (req, res) => {
  const { assetId } = req.body;

  if (!assetId) {
    return res.status(400).json({
      success: false,
      message: 'معرّف الأصل البصري مطلوب'
    });
  }

  const analysis = visualEngine.analyzeVisualAsset(assetId);

  if (!analysis) {
    return res.status(404).json({
      success: false,
      message: 'الأصل البصري غير موجود'
    });
  }

  return res.json({
    success: true,
    data: analysis,
    message: 'تحليل الأصل البصري اكتمل',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 📊 STATISTICS & MONITORING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/visual/stats
 * إحصائيات شاملة لمحرك الإنتاج البصري
 */
router.get('/stats', (req, res) => {
  const stats = visualEngine.getEngineStats();
  return res.json({
    success: true,
    data: stats,
    message: 'إحصائيات محرك الإنتاج البصري الشامل',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/visual/job/:jobId
 * الحصول على تفاصيل مهمة محددة
 */
router.get('/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = visualEngine.visualJobs.find(j => j.id === jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'المهمة غير موجودة'
    });
  }

  return res.json({
    success: true,
    data: job,
    message: 'تفاصيل المهمة البصرية',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
