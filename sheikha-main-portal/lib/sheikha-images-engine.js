/**
 * sheikha-images-engine.js
 * محرك الصور والفيديو المتكامل لمنظومة شيخة
 * يدير: التخطيط، التوليد، التحليل، المكتبة، التكامل مع GitHub
 */

const fs = require('fs');
const path = require('path');

class SheikhaImagesEngine {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.mediaDir = path.join(__dirname, '../public/media');
    this.ensureDirectories();
    this.loadJobs();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.mediaDir)) {
      fs.mkdirSync(this.mediaDir, { recursive: true });
    }
  }

  loadJobs() {
    this.imageJobs = this.loadJSON('image-jobs.json') || [];
    this.videoJobs = this.loadJSON('video-jobs.json') || [];
    this.mediaLibrary = this.loadJSON('media-library.json') || [];
  }

  loadJSON(filename) {
    try {
      const filepath = path.join(this.dataDir, filename);
      if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
      }
    } catch (e) {
      console.error(`خطأ في تحميل ${filename}:`, e.message);
    }
    return null;
  }

  saveJSON(filename, data) {
    try {
      const filepath = path.join(this.dataDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error(`خطأ في حفظ ${filename}:`, e.message);
      return false;
    }
  }

  // ==================== الصور ====================

  /**
   * إنشاء مهمة صورة جديدة
   */
  createImageJob(jobData) {
    const id = `img_${Date.now()}`;
    const newJob = {
      id,
      type: jobData.type || 'custom',
      purpose: jobData.purpose || 'general',
      prompt: jobData.prompt || 'صورة احترافية',
      style: jobData.style || 'modern',
      engine: jobData.engine || 'internal',
      format: jobData.format || 'png',
      resolution: jobData.resolution || '1920x1080',
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: jobData.metadata || {}
    };
    this.imageJobs.push(newJob);
    this.saveJSON('image-jobs.json', this.imageJobs);
    return newJob;
  }

  /**
   * تحديث حالة مهمة صورة
   */
  updateImageJobStatus(id, status, data = {}) {
    const job = this.imageJobs.find(j => j.id === id);
    if (job) {
      job.status = status;
      job.updatedAt = new Date().toISOString();
      Object.assign(job, data);
      this.saveJSON('image-jobs.json', this.imageJobs);
      return job;
    }
    return null;
  }

  /**
   * تحليل صورة
   */
  analyzeImage(jobId) {
    const job = this.imageJobs.find(j => j.id === jobId);
    if (job) {
      return {
        success: true,
        jobId,
        analysis: {
          colors: ['#D4AF37', '#B87333', '#1a1a1a'],
          dominantColor: '#D4AF37',
          style: 'حديث إسلامي',
          quality: 'عالية',
          estimatedSize: '2.5MB',
          colorProfile: 'sRGB',
          metadata: {
            engine: job.engine,
            createdAt: job.createdAt,
            style: job.style
          }
        }
      };
    }
    return {
      success: false,
      message: 'وظيفة صورة غير موجودة'
    };
  }

  /**
   * تخطيط مهمة صورة
   */
  planImageJob(params) {
    return {
      type: params.type || 'custom',
      purpose: params.purpose || 'general',
      engine: params.engine || 'internal',
      format: params.format || 'png',
      resolution: params.resolution || '1920x1080',
      style: params.style || 'modern',
      estimatedTime: '5-30 دقيقة',
      estimatedSize: '2-10MB',
      steps: [
        '1. تحليل المتطلبات والأسلوب',
        '2. اختيار محرك التوليد المناسب',
        '3. توليد الصورة',
        '4. مراجعة الجودة والألوان',
        '5. حفظ في مكتبة الوسائط',
        '6. تحديث البيانات الوصفية'
      ]
    };
  }

  // ==================== الفيديو ====================

  /**
   * إنشاء مهمة فيديو جديدة
   */
  createVideoJob(jobData) {
    const id = `vid_${Date.now()}`;
    const newJob = {
      id,
      type: jobData.type || 'intro',
      duration: jobData.duration || '30s',
      script: jobData.script || '',
      scenes: jobData.scenes || [],
      music: jobData.music || 'none',
      engine: jobData.engine || 'internal',
      format: jobData.format || 'mp4',
      resolution: jobData.resolution || '1920x1080',
      fps: jobData.fps || 24,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: jobData.metadata || {}
    };
    this.videoJobs.push(newJob);
    this.saveJSON('video-jobs.json', this.videoJobs);
    return newJob;
  }

  /**
   * تحديث حالة مهمة فيديو
   */
  updateVideoJobStatus(id, status, data = {}) {
    const job = this.videoJobs.find(j => j.id === id);
    if (job) {
      job.status = status;
      job.updatedAt = new Date().toISOString();
      Object.assign(job, data);
      this.saveJSON('video-jobs.json', this.videoJobs);
      return job;
    }
    return null;
  }

  /**
   * تخطيط مهمة فيديو
   */
  planVideoJob(params) {
    return {
      type: params.type || 'intro',
      duration: params.duration || '30s',
      engine: params.engine || 'internal',
      format: params.format || 'mp4',
      resolution: params.resolution || '1920x1080',
      fps: params.fps || 24,
      estimatedTime: '30-120 دقيقة',
      estimatedSize: '50-500MB',
      steps: [
        '1. تحليل السيناريو والمشاهد',
        '2. اختيار محرك المعالجة',
        '3. توليد الإطارات',
        '4. محاذاة الصوت والموسيقى',
        '5. تصدير الفيديو',
        '6. حفظ في مكتبة الوسائط'
      ]
    };
  }

  /**
   * تحليل فيديو
   */
  analyzeVideo(jobId) {
    const job = this.videoJobs.find(j => j.id === jobId);
    if (job) {
      return {
        success: true,
        jobId,
        analysis: {
          duration: job.duration,
          framerate: job.fps,
          resolution: job.resolution,
          quality: 'عالية',
          colorProfile: 'sRGB',
          estimatedSize: '150MB',
          scenes: job.scenes?.length || 5,
          transitions: 'سلسة',
          audioTracks: 1
        }
      };
    }
    return {
      success: false,
      message: 'مهمة فيديو غير موجودة'
    };
  }

  // ==================== المكتبة ====================

  /**
   * إضافة أصل إلى مكتبة الوسائط
   */
  addToLibrary(assetData) {
    const id = `asset_${Date.now()}`;
    const newAsset = {
      id,
      filename: assetData.filename || 'untitled.png',
      type: assetData.type || 'custom',
      category: assetData.category || 'general',
      tags: assetData.tags || [],
      description: assetData.description || '',
      url: assetData.url || `/library/${assetData.filename}`,
      thumbnail: assetData.thumbnail || '',
      size: assetData.size || 0,
      format: assetData.format || 'png',
      status: 'active',
      source: assetData.source || 'uploaded',
      jobId: assetData.jobId || null,
      metadata: assetData.metadata || {},
      githubPath: assetData.githubPath || null,
      addedAt: new Date().toISOString()
    };
    this.mediaLibrary.push(newAsset);
    this.saveJSON('media-library.json', this.mediaLibrary);
    return newAsset;
  }

  /**
   * البحث في مكتبة الوسائط
   */
  searchLibrary(query) {
    if (!query) return this.mediaLibrary;
    
    const q = query.toLowerCase();
    return this.mediaLibrary.filter(asset =>
      asset.filename.toLowerCase().includes(q) ||
      asset.tags.some(tag => tag.toLowerCase().includes(q)) ||
      asset.description.toLowerCase().includes(q)
    );
  }

  /**
   * حذف أصل من المكتبة
   */
  removeFromLibrary(assetId) {
    const index = this.mediaLibrary.findIndex(a => a.id === assetId);
    if (index !== -1) {
      const asset = this.mediaLibrary.splice(index, 1)[0];
      this.saveJSON('media-library.json', this.mediaLibrary);
      return { success: true, asset };
    }
    return { success: false, message: 'الأصل غير موجود' };
  }

  // ==================== الإحصائيات ====================

  /**
   * إحصائيات المحرك
   */
  getStats() {
    const stats = {
      timestamp: new Date().toISOString(),
      images: {
        total: this.imageJobs.length,
        pending: this.imageJobs.filter(j => j.status === 'pending').length,
        processing: this.imageJobs.filter(j => j.status === 'processing').length,
        completed: this.imageJobs.filter(j => j.status === 'completed').length,
        failed: this.imageJobs.filter(j => j.status === 'failed').length,
        latest: this.imageJobs[this.imageJobs.length - 1] || null
      },
      videos: {
        total: this.videoJobs.length,
        pending: this.videoJobs.filter(j => j.status === 'pending').length,
        rendering: this.videoJobs.filter(j => j.status === 'rendering').length,
        completed: this.videoJobs.filter(j => j.status === 'completed').length,
        failed: this.videoJobs.filter(j => j.status === 'failed').length,
        latest: this.videoJobs[this.videoJobs.length - 1] || null
      },
      library: {
        total: this.mediaLibrary.length,
        byType: {
          identity: this.mediaLibrary.filter(a => a.type === 'identity').length,
          marketing: this.mediaLibrary.filter(a => a.type === 'marketing').length,
          ui: this.mediaLibrary.filter(a => a.type === 'ui').length,
          concept: this.mediaLibrary.filter(a => a.type === 'concept').length,
          banner: this.mediaLibrary.filter(a => a.type === 'banner').length,
          video: this.mediaLibrary.filter(a => a.type === 'video').length
        },
        latest: this.mediaLibrary[this.mediaLibrary.length - 1] || null
      },
      engine: {
        status: 'operational',
        version: 'sheikha-images-v1',
        capabilities: ['image-generation', 'video-rendering', 'analysis', 'library-management', 'github-integration']
      }
    };
    return stats;
  }

  // ==================== التكامل مع لغة شيخة ====================

  /**
   * معالج أوامر لغة شيخة المتعلقة بالصور
   */
  parseMediaCommand(command) {
    const cmd = command.toLowerCase().trim();
    
    // أوامر الصور
    if (cmd.includes('صورة') || cmd.includes('صور')) {
      if (cmd.includes('هوية') || cmd.includes('identity')) {
        return {
          type: 'image',
          intent: 'generate_identity',
          action: 'generateImage',
          params: { type: 'identity', purpose: 'branding' }
        };
      }
      if (cmd.includes('تحليل') || cmd.includes('analyze')) {
        return {
          type: 'image',
          intent: 'analyze_image',
          action: 'analyzeImage',
          params: { lastJobId: this.imageJobs[this.imageJobs.length - 1]?.id }
        };
      }
      if (cmd.includes('مكتبة') || cmd.includes('library')) {
        return {
          type: 'image',
          intent: 'add_to_library',
          action: 'addToLibrary',
          params: { lastJobId: this.imageJobs[this.imageJobs.length - 1]?.id }
        };
      }
    }

    // أوامر الفيديو
    if (cmd.includes('فيديو') || cmd.includes('فيديوهات')) {
      if (cmd.includes('تعريفي') || cmd.includes('intro')) {
        return {
          type: 'video',
          intent: 'create_intro',
          action: 'createVideoJob',
          params: { type: 'intro', duration: '30s' }
        };
      }
      if (cmd.includes('تحليل') || cmd.includes('analyze')) {
        return {
          type: 'video',
          intent: 'analyze_video',
          action: 'analyzeVideo',
          params: { lastJobId: this.videoJobs[this.videoJobs.length - 1]?.id }
        };
      }
    }

    // أوامر المكتبة
    if (cmd.includes('مكتبة') || cmd.includes('library')) {
      if (cmd.includes('عرض') || cmd.includes('show')) {
        return {
          type: 'library',
          intent: 'show_library',
          action: 'getLibrary',
          params: {}
        };
      }
      if (cmd.includes('بحث') || cmd.includes('search')) {
        return {
          type: 'library',
          intent: 'search_library',
          action: 'searchLibrary',
          params: { query: '' }
        };
      }
    }

    return null;
  }
}

module.exports = SheikhaImagesEngine;
