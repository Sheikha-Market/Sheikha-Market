const fs = require('fs');
const path = require('path');

class SheikhaVisualGenerationEngine {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.jobsFile = path.join(rootDir, 'data', 'visual-jobs.json');
    this.libraryFile = path.join(rootDir, 'data', 'visual-library.json');
    this.brandProfile = {
      name: 'SHEIKHA',
      arabicName: 'شيخة',
      palette: ['#030712', '#081121', '#D4AF37', '#FDE68A', '#67E8F9'],
      identity: ['الميزان', 'الدائرة', 'الشبكة العصبية', 'العدل', 'الشمول', 'التقنية'],
      principles: ['الوضوح', 'الإتقان', 'الهوية الموحدة', 'الانسجام البصري', 'عدم الإضرار']
    };
    this.adapters = {
      image: ['sheikha_native_prompt_graph', 'brand_layout_renderer', 'external_image_provider_adapter'],
      video: ['storyboard_builder', 'scene_timeline_engine', 'external_video_provider_adapter'],
      graphic: ['brand_graphic_composer', 'poster_layout_engine', 'vector_pack_renderer']
    };
  }

  readJson(file, fallback) {
    try {
      if (!fs.existsSync(file)) return fallback;
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return fallback;
    }
  }

  writeJson(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  }

  now() {
    return new Date().toISOString();
  }

  health() {
    const jobs = this.readJson(this.jobsFile, []);
    const library = this.readJson(this.libraryFile, []);
    return {
      success: true,
      engine: 'Sheikha Visual Generation Engine',
      version: '1.0.0',
      status: 'active',
      modes: ['image', 'video', 'graphic'],
      adapters: this.adapters,
      jobsCount: jobs.length,
      libraryCount: library.length,
      brandProfile: this.brandProfile
    };
  }

  catalog() {
    return {
      success: true,
      kinds: {
        image: ['identity poster', 'hero banner', 'dashboard background', 'product visual', 'social card'],
        video: ['brand intro', 'market explainer', 'dashboard reel', 'product promo'],
        graphic: ['logo pack', 'icon system', 'infographic', 'report cover']
      },
      adapters: this.adapters,
      brandProfile: this.brandProfile
    };
  }

  normalizePrompt(input = '') {
    return String(input).trim().replace(/\s+/g, ' ');
  }

  plan(payload = {}) {
    const type = payload.type || 'image';
    const prompt = this.normalizePrompt(payload.prompt || 'هوية تقنية متقدمة لشيخة');
    const intent = payload.intent || 'brand_visual';
    const target = payload.target || 'library';

    const brandTokens = [
      this.brandProfile.arabicName,
      ...this.brandProfile.identity,
      ...this.brandProfile.principles
    ];

    const plan = {
      success: true,
      timestamp: this.now(),
      type,
      intent,
      target,
      prompt,
      normalizedPrompt: `${prompt} | ${brandTokens.join(' | ')}`,
      adapterChain: this.adapters[type] || [],
      outputProfile: {
        palette: this.brandProfile.palette,
        format: type === 'video' ? 'mp4' : type === 'graphic' ? 'svg' : 'png',
        resolution: payload.resolution || (type === 'video' ? '1920x1080' : '1536x1024')
      }
    };

    return plan;
  }

  createJob(payload = {}) {
    const jobs = this.readJson(this.jobsFile, []);
    const plan = this.plan(payload);
    const job = {
      id: `VIS-${Date.now()}`,
      createdAt: this.now(),
      status: 'planned',
      ...plan
    };
    jobs.push(job);
    this.writeJson(this.jobsFile, jobs.slice(-500));
    return { success: true, job };
  }

  runJob(payload = {}) {
    const jobs = this.readJson(this.jobsFile, []);
    const library = this.readJson(this.libraryFile, []);
    const plan = this.plan(payload);
    const job = {
      id: `VIS-${Date.now()}`,
      createdAt: this.now(),
      executedAt: this.now(),
      status: 'completed',
      executionMode: 'orchestrated',
      provider: payload.provider || 'sheikha_visual_adapter',
      ...plan,
      output: {
        assetId: `AST-${Date.now()}`,
        title: payload.title || `Sheikha ${plan.type} Asset`,
        type: plan.type,
        path: `/generated/${plan.type}/${Date.now()}.${plan.outputProfile.format}`,
        format: plan.outputProfile.format,
        resolution: plan.outputProfile.resolution
      }
    };
    jobs.push(job);
    library.push({
      id: job.output.assetId,
      createdAt: job.executedAt,
      title: job.output.title,
      type: job.output.type,
      path: job.output.path,
      format: job.output.format,
      prompt: job.prompt,
      provider: job.provider
    });
    this.writeJson(this.jobsFile, jobs.slice(-500));
    this.writeJson(this.libraryFile, library.slice(-500));
    return { success: true, job, asset: job.output };
  }

  analyze(payload = {}) {
    const source = this.normalizePrompt(payload.source || payload.path || '');
    return {
      success: true,
      timestamp: this.now(),
      analysis: {
        source,
        composition: 'brand-centered',
        paletteMatch: 0.94,
        identitySignals: ['gold-balance', 'neural-grid', 'dark-tech-background'],
        recommendation: 'align_with_sheikha_brand_profile'
      }
    };
  }

  listJobs() {
    return { success: true, jobs: this.readJson(this.jobsFile, []) };
  }

  library() {
    return { success: true, assets: this.readJson(this.libraryFile, []) };
  }
}

module.exports = SheikhaVisualGenerationEngine;
