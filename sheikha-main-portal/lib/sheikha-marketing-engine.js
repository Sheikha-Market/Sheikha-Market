/**
 * ═══════════════════════════════════════════════════════════
 * شيخة — محرك التسويق الرقمي الذكي
 * SHEIKHA Digital Marketing Engine v2.0
 * ═══════════════════════════════════════════════════════════
 * 
 * المحرك المركزي لإدارة:
 * - الحملات التسويقية (إنشاء / جدولة / تتبع / تحليل)
 * - تقويم المحتوى (تخطيط / نشر / أتمتة)
 * - القمع التسويقي (وعي → اهتمام → قرار → شراء → ولاء)
 * - تحليلات الأداء (KPIs / ROI / معدل التحويل)
 * - توليد المحتوى بالذكاء الاصطناعي
 * - إدارة العملاء المحتملين (Leads)
 * - SEO + Social + Email Marketing
 * 
 * المالك: سلمان أحمد بن سلمان الراجح
 * الشريعة: كل المحتوى يخضع للتدقيق الشرعي
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class SheikaMarketingEngine {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..');
    this.dataPath = path.join(this.basePath, 'data', 'marketing-services.json');
    this.campaignsPath = path.join(this.basePath, 'data', 'marketing-campaigns.json');
    this.leadsPath = path.join(this.basePath, 'data', 'marketing-leads.json');
    this.analyticsPath = path.join(this.basePath, 'data', 'analytics');
    this.data = this._loadJSON(this.dataPath, {});
    this.campaigns = this._loadJSON(this.campaignsPath, []);
    this.leads = this._loadJSON(this.leadsPath, []);

    // Marketing channels
    this.channels = {
      linkedin: { name: 'LinkedIn', type: 'social', active: true, audience: 'B2B/B2G' },
      x: { name: 'X (Twitter)', type: 'social', active: true, audience: 'B2B/B2C' },
      whatsapp: { name: 'WhatsApp Business', type: 'direct', active: true, audience: 'B2B/B2C' },
      email: { name: 'Email Marketing', type: 'email', active: true, audience: 'all' },
      google: { name: 'Google Ads + SEO', type: 'search', active: true, audience: 'all' },
      youtube: { name: 'YouTube', type: 'video', active: true, audience: 'B2B/B2C' },
      exhibitions: { name: 'المعارض والمؤتمرات', type: 'offline', active: true, audience: 'B2B/B2G' }
    };

    // Marketing funnel stages
    this.funnelStages = ['awareness', 'interest', 'consideration', 'decision', 'purchase', 'loyalty'];

    // Sharia compliance keywords to flag
    this.shariaFlags = ['ربا', 'فائدة', 'قرض ربوي', 'ميسر', 'قمار', 'غرر', 'خداع', 'احتكار'];
  }

  // ═══════════════════════════════════════
  // CAMPAIGN MANAGEMENT
  // ═══════════════════════════════════════

  createCampaign(campaignData) {
    const campaign = {
      id: 'CMP-' + uuidv4().substring(0, 8).toUpperCase(),
      name: campaignData.name,
      nameEn: campaignData.nameEn || '',
      type: campaignData.type || 'awareness', // awareness, lead-gen, conversion, retention
      channels: campaignData.channels || ['linkedin'],
      target: campaignData.target || 'B2B', // B2B, B2G, B2C, all
      status: 'draft', // draft, scheduled, active, paused, completed
      budget: campaignData.budget || 0,
      spent: 0,
      startDate: campaignData.startDate || null,
      endDate: campaignData.endDate || null,
      content: campaignData.content || [],
      kpis: {
        impressions: 0,
        clicks: 0,
        leads: 0,
        conversions: 0,
        ctr: 0,
        cpl: 0,
        roi: 0
      },
      shariaCompliant: this._checkShariaCompliance(campaignData.content || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.campaigns.push(campaign);
    this._saveCampaigns();
    this._logEvent('campaign_created', campaign.id, campaign.name);
    return campaign;
  }

  updateCampaign(campaignId, updates) {
    const idx = this.campaigns.findIndex(c => c.id === campaignId);
    if (idx === -1) return { error: 'Campaign not found' };

    const allowed = ['name', 'nameEn', 'type', 'channels', 'target', 'status', 'budget', 'startDate', 'endDate', 'content'];
    allowed.forEach(key => {
      if (updates[key] !== undefined) this.campaigns[idx][key] = updates[key];
    });

    if (updates.content) {
      this.campaigns[idx].shariaCompliant = this._checkShariaCompliance(updates.content);
    }
    this.campaigns[idx].updatedAt = new Date().toISOString();
    this._saveCampaigns();
    return this.campaigns[idx];
  }

  activateCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'active' });
  }

  pauseCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'paused' });
  }

  completeCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'completed' });
  }

  getCampaign(campaignId) {
    return this.campaigns.find(c => c.id === campaignId) || null;
  }

  getAllCampaigns(filter = {}) {
    let result = [...this.campaigns];
    if (filter.status) result = result.filter(c => c.status === filter.status);
    if (filter.type) result = result.filter(c => c.type === filter.type);
    if (filter.target) result = result.filter(c => c.target === filter.target);
    if (filter.channel) result = result.filter(c => c.channels.includes(filter.channel));
    return result;
  }

  recordCampaignMetric(campaignId, metric, value) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return { error: 'Campaign not found' };
    if (campaign.kpis[metric] !== undefined) {
      campaign.kpis[metric] += value;
      // Auto-calculate derived KPIs
      if (campaign.kpis.impressions > 0) {
        campaign.kpis.ctr = ((campaign.kpis.clicks / campaign.kpis.impressions) * 100).toFixed(2);
      }
      if (campaign.kpis.leads > 0 && campaign.spent > 0) {
        campaign.kpis.cpl = (campaign.spent / campaign.kpis.leads).toFixed(2);
      }
      this._saveCampaigns();
    }
    return campaign.kpis;
  }

  // ═══════════════════════════════════════
  // CONTENT CALENDAR
  // ═══════════════════════════════════════

  addContentItem(item) {
    const content = {
      id: 'CNT-' + uuidv4().substring(0, 8).toUpperCase(),
      title: item.title,
      type: item.type || 'post', // post, article, video, infographic, story, reel
      channel: item.channel || 'linkedin',
      campaignId: item.campaignId || null,
      scheduledDate: item.scheduledDate || null,
      status: 'draft', // draft, scheduled, published, archived
      content: {
        textAr: item.textAr || '',
        textEn: item.textEn || '',
        hashtags: item.hashtags || ['#شيخة', '#SHEIKHA', '#SMI'],
        mediaUrl: item.mediaUrl || null,
        cta: item.cta || null
      },
      metrics: { views: 0, likes: 0, shares: 0, comments: 0, clicks: 0 },
      shariaCompliant: this._checkShariaCompliance([item.textAr || '', item.textEn || '']),
      createdAt: new Date().toISOString()
    };

    if (!this.data.contentCalendar) this.data.contentCalendar = [];
    this.data.contentCalendar.push(content);
    this._saveData();
    return content;
  }

  getContentCalendar(filters = {}) {
    const items = this.data.contentCalendar || [];
    let result = [...items];
    if (filters.channel) result = result.filter(i => i.channel === filters.channel);
    if (filters.status) result = result.filter(i => i.status === filters.status);
    if (filters.month) {
      result = result.filter(i => i.scheduledDate && i.scheduledDate.startsWith(filters.month));
    }
    return result.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }

  publishContent(contentId) {
    const items = this.data.contentCalendar || [];
    const idx = items.findIndex(i => i.id === contentId);
    if (idx === -1) return { error: 'Content not found' };
    items[idx].status = 'published';
    items[idx].publishedAt = new Date().toISOString();
    this._saveData();
    return items[idx];
  }

  // ═══════════════════════════════════════
  // LEAD MANAGEMENT
  // ═══════════════════════════════════════

  addLead(leadData) {
    const lead = {
      id: 'LEAD-' + uuidv4().substring(0, 8).toUpperCase(),
      name: leadData.name,
      company: leadData.company || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      type: leadData.type || 'B2B', // B2B, B2G, B2C
      source: leadData.source || 'website', // website, linkedin, referral, exhibition, whatsapp, google
      stage: 'new', // new, contacted, qualified, proposal, negotiation, won, lost
      score: this._calculateLeadScore(leadData),
      interest: leadData.interest || [],
      notes: leadData.notes || '',
      assignedTo: leadData.assignedTo || null,
      campaignId: leadData.campaignId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [{
        type: 'created',
        date: new Date().toISOString(),
        note: 'Lead created from ' + (leadData.source || 'website')
      }]
    };

    this.leads.push(lead);
    this._saveLeads();

    // Update campaign lead count
    if (lead.campaignId) {
      this.recordCampaignMetric(lead.campaignId, 'leads', 1);
    }

    return lead;
  }

  updateLeadStage(leadId, newStage, note = '') {
    const idx = this.leads.findIndex(l => l.id === leadId);
    if (idx === -1) return { error: 'Lead not found' };
    
    const oldStage = this.leads[idx].stage;
    this.leads[idx].stage = newStage;
    this.leads[idx].updatedAt = new Date().toISOString();
    this.leads[idx].activities.push({
      type: 'stage_change',
      from: oldStage,
      to: newStage,
      date: new Date().toISOString(),
      note: note
    });

    if (newStage === 'won' && this.leads[idx].campaignId) {
      this.recordCampaignMetric(this.leads[idx].campaignId, 'conversions', 1);
    }

    this._saveLeads();
    return this.leads[idx];
  }

  getLeads(filters = {}) {
    let result = [...this.leads];
    if (filters.stage) result = result.filter(l => l.stage === filters.stage);
    if (filters.type) result = result.filter(l => l.type === filters.type);
    if (filters.source) result = result.filter(l => l.source === filters.source);
    if (filters.minScore) result = result.filter(l => l.score >= filters.minScore);
    return result.sort((a, b) => b.score - a.score);
  }

  getLeadFunnel() {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const funnel = {};
    stages.forEach(stage => {
      funnel[stage] = this.leads.filter(l => l.stage === stage).length;
    });
    funnel.total = this.leads.length;
    funnel.conversionRate = funnel.total > 0 ? ((funnel.won / funnel.total) * 100).toFixed(1) : 0;
    return funnel;
  }

  _calculateLeadScore(leadData) {
    let score = 0;
    // Type scoring
    if (leadData.type === 'B2G') score += 30;
    else if (leadData.type === 'B2B') score += 20;
    else score += 10;
    // Source scoring
    const sourceScores = { referral: 25, exhibition: 20, linkedin: 15, google: 12, website: 10, whatsapp: 8 };
    score += sourceScores[leadData.source] || 5;
    // Data completeness
    if (leadData.email) score += 10;
    if (leadData.phone) score += 10;
    if (leadData.company) score += 10;
    if (leadData.interest && leadData.interest.length > 0) score += 5 * Math.min(leadData.interest.length, 3);
    return Math.min(score, 100);
  }

  // ═══════════════════════════════════════
  // ANALYTICS & KPIs
  // ═══════════════════════════════════════

  getDashboard() {
    const activeCampaigns = this.campaigns.filter(c => c.status === 'active');
    const totalBudget = this.campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpent = this.campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalImpressions = this.campaigns.reduce((sum, c) => sum + (c.kpis?.impressions || 0), 0);
    const totalClicks = this.campaigns.reduce((sum, c) => sum + (c.kpis?.clicks || 0), 0);
    const totalLeads = this.leads.length;
    const totalConversions = this.leads.filter(l => l.stage === 'won').length;
    const funnel = this.getLeadFunnel();
    const contentItems = (this.data.contentCalendar || []);
    const publishedContent = contentItems.filter(c => c.status === 'published').length;
    const scheduledContent = contentItems.filter(c => c.status === 'scheduled').length;

    return {
      overview: {
        activeCampaigns: activeCampaigns.length,
        totalCampaigns: this.campaigns.length,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0
      },
      performance: {
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
        leads: totalLeads,
        conversions: totalConversions,
        conversionRate: totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0
      },
      funnel,
      content: {
        total: contentItems.length,
        published: publishedContent,
        scheduled: scheduledContent,
        drafts: contentItems.filter(c => c.status === 'draft').length
      },
      leadsBySource: this._groupBy(this.leads, 'source'),
      leadsByType: this._groupBy(this.leads, 'type'),
      campaignsByStatus: this._groupBy(this.campaigns, 'status'),
      channels: Object.entries(this.channels).map(([key, ch]) => ({
        id: key,
        ...ch,
        campaignCount: this.campaigns.filter(c => c.channels.includes(key)).length
      })),
      lastUpdated: new Date().toISOString()
    };
  }

  getChannelPerformance() {
    const perf = {};
    Object.keys(this.channels).forEach(ch => {
      const chCampaigns = this.campaigns.filter(c => c.channels.includes(ch));
      perf[ch] = {
        ...this.channels[ch],
        campaigns: chCampaigns.length,
        impressions: chCampaigns.reduce((s, c) => s + (c.kpis?.impressions || 0), 0),
        clicks: chCampaigns.reduce((s, c) => s + (c.kpis?.clicks || 0), 0),
        leads: chCampaigns.reduce((s, c) => s + (c.kpis?.leads || 0), 0),
        spent: chCampaigns.reduce((s, c) => s + (c.spent || 0), 0)
      };
    });
    return perf;
  }

  // ═══════════════════════════════════════
  // AI CONTENT GENERATION
  // ═══════════════════════════════════════

  generateSMIPost(smiData) {
    const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const templates = [
      {
        textAr: `📊 مؤشر شيخة SMI — ${today}\n\n🔸 ذهب: ${smiData.gold || '—'} $/oz\n🔸 فضة: ${smiData.silver || '—'} $/oz\n🔸 نحاس: ${smiData.copper || '—'} $/ton\n🔸 حديد: ${smiData.iron || '—'} $/ton\n🔸 ألمنيوم: ${smiData.aluminum || '—'} $/ton\n\n⚖️ أسعار شفافة — بلا غرر بلا احتكار\n\n#شيخة #SHEIKHA #SMI #معادن #أسعار_المعادن`,
        textEn: `📊 SHEIKHA SMI Index — ${new Date().toLocaleDateString('en-US')}\n\nGold: ${smiData.gold || '—'} | Silver: ${smiData.silver || '—'} | Copper: ${smiData.copper || '—'}\n\nTransparent pricing — Islamic digital marketplace\n\n#SHEIKHA #SMI #Metals #IslamicFinance`
      }
    ];
    return templates[0];
  }

  generateCampaignContent(campaignType, target) {
    const templates = {
      'awareness-B2B': {
        textAr: '🏭 هل تبحث عن مصدر موثوق للمعادن والسكراب؟\n\nشيخة — أول سوق إسلامي رقمي يضمن لك:\n✅ أسعار شفافة عبر مؤشر SMI\n✅ معاملات حلال 100%\n✅ شحن ولوجستيات متكاملة\n✅ ضمان الجودة والمواصفات\n\n🌐 sheikha.top\n\n#شيخة #معادن #سكراب #B2B',
        hashtags: ['#شيخة', '#SHEIKHA', '#معادن', '#سكراب', '#B2B'],
        cta: 'سجّل شركتك الآن — sheikha.top'
      },
      'awareness-B2G': {
        textAr: '🏛 بوابة شيخة الحكومية\n\nنظام متكامل للمشتريات الحكومية في قطاع المعادن:\n✅ متوافق مع رؤية 2030\n✅ ZATCA + IKTVA + NCA\n✅ مصادقة نفاذ\n✅ تقارير ESG والاستدامة\n\n🌐 sheikha.top\n\n#شيخة #رؤية_2030 #مشتريات_حكومية',
        hashtags: ['#شيخة', '#رؤية_2030', '#B2G', '#مشتريات_حكومية'],
        cta: 'سجّل جهتك الحكومية — sheikha.top'
      },
      'awareness-B2C': {
        textAr: '💰 استثمر في المعادن الثمينة بطريقة حلال\n\nشيخة — منصتك الموثوقة:\n✅ ذهب · فضة · نحاس · حديد\n✅ أسعار لحظية شفافة\n✅ بلا ربا بلا غرر\n✅ حاسبة زكاة مدمجة\n\n🌐 sheikha.top\n\n#شيخة #ذهب #استثمار_حلال',
        hashtags: ['#شيخة', '#ذهب', '#استثمار_حلال', '#معادن'],
        cta: 'ابدأ التداول — sheikha.top'
      },
      'lead-gen-B2B': {
        textAr: '📋 احصل على تقرير مجاني عن أسعار المعادن في السعودية\n\nتقرير شيخة الشهري يتضمن:\n📊 تحليل أسعار 15+ معدن\n📈 توقعات السوق\n🔍 فرص الاستثمار\n\nحمّل التقرير مجاناً من:\n🌐 sheikha.top/reports\n\n#شيخة #تحليل_سوق #معادن',
        hashtags: ['#شيخة', '#تحليل_سوق', '#معادن'],
        cta: 'حمّل التقرير المجاني'
      }
    };

    const key = `${campaignType}-${target}`;
    return templates[key] || templates['awareness-B2B'];
  }

  // ═══════════════════════════════════════
  // SHARIA COMPLIANCE
  // ═══════════════════════════════════════

  _checkShariaCompliance(contentArray) {
    const contentStr = (Array.isArray(contentArray) ? contentArray.join(' ') : String(contentArray)).toLowerCase();
    const violations = [];
    this.shariaFlags.forEach(flag => {
      if (contentStr.includes(flag)) violations.push(flag);
    });
    return {
      compliant: violations.length === 0,
      violations,
      checkedAt: new Date().toISOString()
    };
  }

  // ═══════════════════════════════════════
  // MARKETING MATERIALS LIBRARY
  // ═══════════════════════════════════════

  getMaterialsLibrary() {
    return {
      businessCards: [
        { id: 'card-v5', name: 'بطاقة أعمال V5', file: '/marketing/SHEIKHA-CARDS-V5.html', type: 'html' },
        { id: 'card-v4', name: 'بطاقة أعمال V4', file: '/marketing/business-card-v4.html', type: 'html' }
      ],
      branding: [
        { id: 'digital-pkg', name: 'الحزمة الرقمية الشاملة', file: '/marketing/SHEIKHA-DIGITAL-PACKAGE.html', type: 'html' },
        { id: 'logo-svg', name: 'الشعار SVG', file: '/images/logo.svg', type: 'svg' },
        { id: 'logo-hd', name: 'الشعار HD', file: '/images/sheikha-full-logo-hd.png', type: 'png' },
        { id: 'emblem-hd', name: 'الرمز HD', file: '/images/sheikha-emblem-hd.png', type: 'png' }
      ],
      corporate: [
        { id: 'profile', name: 'ملف الشركة', file: '/marketing/company-profile.html', type: 'html' },
        { id: 'brochure', name: 'البروشور', file: '/marketing/brochure.html', type: 'html' }
      ],
      digital: [
        { id: 'email-sig', name: 'توقيع البريد', file: '/marketing/email-signature.html', type: 'html' },
        { id: 'banners', name: 'بانرات إعلانية', file: '/marketing/banner.html', type: 'html' }
      ]
    };
  }

  // ═══════════════════════════════════════
  // PRESET CAMPAIGNS (AUTO SETUP)
  // ═══════════════════════════════════════

  setupDefaultCampaigns() {
    const defaults = [
      {
        name: 'حملة الوعي — تعريف بشيخة',
        nameEn: 'Brand Awareness Campaign',
        type: 'awareness',
        channels: ['linkedin', 'x', 'google'],
        target: 'all',
        budget: 5000
      },
      {
        name: 'حملة مؤشر SMI اليومية',
        nameEn: 'Daily SMI Index Posts',
        type: 'awareness',
        channels: ['linkedin', 'x'],
        target: 'B2B',
        budget: 0,
        content: ['نشر مؤشر SMI يومياً على LinkedIn و X']
      },
      {
        name: 'حملة استقطاب الشركات',
        nameEn: 'B2B Lead Generation',
        type: 'lead-gen',
        channels: ['linkedin', 'google', 'email'],
        target: 'B2B',
        budget: 8000
      },
      {
        name: 'حملة القطاع الحكومي',
        nameEn: 'Government Sector Outreach',
        type: 'lead-gen',
        channels: ['linkedin', 'exhibitions', 'email'],
        target: 'B2G',
        budget: 10000
      },
      {
        name: 'حملة المحتوى التعليمي',
        nameEn: 'Educational Content Series',
        type: 'awareness',
        channels: ['linkedin', 'youtube', 'x'],
        target: 'all',
        budget: 3000,
        content: ['مقالات تعليمية عن المعادن', 'فيديوهات قصيرة عن السوق']
      }
    ];

    const created = [];
    defaults.forEach(d => {
      const exists = this.campaigns.find(c => c.name === d.name);
      if (!exists) {
        created.push(this.createCampaign(d));
      }
    });

    return { created: created.length, campaigns: created };
  }

  setupDefaultContentCalendar() {
    const now = new Date();
    const contents = [];
    const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

    // Generate 4 weeks of content
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + (week * 7));

      // Sunday: SMI Index
      contents.push(this.addContentItem({
        title: `مؤشر SMI — الأسبوع ${week + 1}`,
        type: 'post',
        channel: 'linkedin',
        scheduledDate: new Date(weekStart.setDate(weekStart.getDate() - weekStart.getDay())).toISOString().split('T')[0],
        textAr: '📊 مؤشر شيخة SMI الأسبوعي — أسعار المعادن بشفافية',
        hashtags: ['#شيخة', '#SMI', '#معادن']
      }));

      // Tuesday: Educational content
      const tue = new Date(weekStart);
      tue.setDate(tue.getDate() + 2);
      contents.push(this.addContentItem({
        title: `محتوى تعليمي — الأسبوع ${week + 1}`,
        type: 'article',
        channel: 'linkedin',
        scheduledDate: tue.toISOString().split('T')[0],
        textAr: '📚 هل تعلم؟ — سلسلة تعليمية عن المعادن والتجارة الإسلامية',
        hashtags: ['#شيخة', '#معادن', '#تعليم']
      }));

      // Thursday: Community engagement
      const thu = new Date(weekStart);
      thu.setDate(thu.getDate() + 4);
      contents.push(this.addContentItem({
        title: `تفاعل مجتمعي — الأسبوع ${week + 1}`,
        type: 'post',
        channel: 'x',
        scheduledDate: thu.toISOString().split('T')[0],
        textAr: '💬 شاركنا رأيك — ما المعدن الأكثر طلباً في مشاريعكم؟',
        hashtags: ['#شيخة', '#معادن', '#مجتمع_شيخة']
      }));
    }

    return { created: contents.length, items: contents };
  }

  // ═══════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════

  _groupBy(arr, key) {
    const result = {};
    arr.forEach(item => {
      const k = item[key] || 'unknown';
      result[k] = (result[k] || 0) + 1;
    });
    return result;
  }

  _loadJSON(filePath, defaultVal) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch (e) { /* ignore */ }
    return defaultVal;
  }

  _saveData() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) { console.error('Marketing save error:', e.message); }
  }

  _saveCampaigns() {
    try {
      fs.writeFileSync(this.campaignsPath, JSON.stringify(this.campaigns, null, 2), 'utf-8');
    } catch (e) { console.error('Campaign save error:', e.message); }
  }

  _saveLeads() {
    try {
      fs.writeFileSync(this.leadsPath, JSON.stringify(this.leads, null, 2), 'utf-8');
    } catch (e) { console.error('Leads save error:', e.message); }
  }

  _logEvent(type, id, description) {
    const logPath = path.join(this.basePath, 'data', 'operations', 'marketing-events.ndjson');
    try {
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const entry = JSON.stringify({ type, id, description, timestamp: new Date().toISOString() }) + '\n';
      fs.appendFileSync(logPath, entry, 'utf-8');
    } catch (e) { /* ignore */ }
  }
}

module.exports = SheikaMarketingEngine;
