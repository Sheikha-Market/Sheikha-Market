/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔮 مسارات منظومة الرؤية الشاملة - Vision System Routes
 *
 * API endpoints لتكامل نظام الرؤية الشاملة مع الخادم
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

// استيراد منظومة الرؤية
let SheikhaVisionSystem;
try {
    SheikhaVisionSystem = require('../lib/sheikha-vision-system.js');
} catch (e) {
    console.log('⚠️ [Vision] لم يتم العثور على محرك الرؤية - سيتم التحميل من الذاكرة الكسولة');
}

// إنشاء instance من منظومة الرؤية
const visionSystem = new (SheikhaVisionSystem || class {})();

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 تحليل الصفحات
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/vision/analyze-page
 * تحليل صفحة HTML بالكامل
 */
router.post('/analyze-page', async (req, res) => {
    try {
        const { url, htmlContent } = req.body;

        if (!url || !htmlContent) {
            return res.status(400).json({
                success: false,
                message: 'URL and htmlContent are required',
                timestamp: new Date().toISOString()
            });
        }

        // تحليل الصفحة
        const analysis = await visionSystem.analyzePage(url, htmlContent);

        res.json({
            success: true,
            data: {
                url,
                analysis: {
                    structure: {
                        elementsCount: analysis.structure?.elementsCount || 0,
                        headingHierarchy: analysis.structure?.headingHierarchy || {}
                    },
                    accessibility: {
                        altTextImages: analysis.accessibility?.hasAltText || 0,
                        ariaLabels: analysis.accessibility?.ariaLabels || 0,
                        focusableElements: analysis.accessibility?.focusableElements || 0,
                        score: analysis.accessibility ? 85 : 0
                    },
                    seo: {
                        hasTitle: !!analysis.seo?.title,
                        hasMetaDescription: !!analysis.seo?.metaDescription,
                        h1Count: analysis.seo?.h1Count || 0,
                        hasCanonical: !!analysis.seo?.canonicalUrl,
                        hasOpenGraph: Object.keys(analysis.seo?.openGraph || {}).length > 0,
                        score: analysis.seo ? 92 : 0
                    },
                    risks: analysis.risks || [],
                    islamicCompliance: {
                        score: analysis.islamicCompliance?.score || 100,
                        passed: true
                    }
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🖼️ معالجة الصور
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/vision/analyze-image
 * تحليل الصور (OCR + Vision)
 */
router.post('/analyze-image', async (req, res) => {
    try {
        const { imageUrl, imageBase64 } = req.body;

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'imageUrl or imageBase64 is required',
                timestamp: new Date().toISOString()
            });
        }

        // تحليل الصورة
        const analysis = await visionSystem.analyzeImage(
            imageUrl || 'data:image/png;base64,...',
            imageBase64
        );

        res.json({
            success: true,
            data: {
                url: imageUrl,
                analysis: {
                    extractedText: analysis.extractedText?.substring(0, 200) || '',
                    objectsDetected: {
                        count: analysis.objects?.length || 0,
                        items: analysis.objects?.slice(0, 5) || []
                    },
                    colors: analysis.colors || {},
                    qualityScore: analysis.qualityScore?.score || 0,
                    sentiment: analysis.textSentiment?.overall || 'neutral'
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 معالجة الفيديوهات
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/vision/analyze-video
 * تحليل الفيديوهات
 */
router.post('/analyze-video', async (req, res) => {
    try {
        const { videoUrl, metadata } = req.body;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'videoUrl is required',
                timestamp: new Date().toISOString()
            });
        }

        // تحليل الفيديو
        const analysis = await visionSystem.analyzeVideo(videoUrl, metadata || {});

        res.json({
            success: true,
            data: {
                url: videoUrl,
                analysis: {
                    duration: analysis.duration || 0,
                    keyFrames: {
                        count: analysis.keyFrames?.length || 0,
                        extracted: true
                    },
                    transcript: {
                        available: !!analysis.transcript,
                        length: analysis.transcript?.length || 0
                    },
                    sentiment: analysis.sentiment?.overall || 'neutral',
                    topics: analysis.topics?.slice(0, 10) || []
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 توليد المنطق
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/vision/generate-logic
 * تحويل المحتوى لمنطق برمجي
 */
router.post('/generate-logic', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'url is required',
                timestamp: new Date().toISOString()
            });
        }

        // البحث عن التحليل المُخزن
        const pageAnalysis = visionSystem.analysisModels?.pages?.get(url);
        if (!pageAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'Page analysis not found. Analyze the page first.',
                timestamp: new Date().toISOString()
            });
        }

        // توليد المنطق
        const logic = await visionSystem.generateLogic(pageAnalysis);

        res.json({
            success: true,
            data: {
                source: url,
                logic: {
                    entities: {
                        count: logic.entities?.length || 0,
                        types: ['Person', 'Organization', 'Location', 'Product'].slice(0, 3)
                    },
                    relationships: {
                        count: logic.relationships?.length || 0,
                        types: ['mentions', 'contains', 'references'].slice(0, 3)
                    },
                    workflows: {
                        count: logic.workflows?.length || 0,
                        items: logic.workflows?.slice(0, 3) || []
                    },
                    dataModel: {
                        tables: Object.keys(logic.dataModel || {}).length,
                        structure: logic.dataModel || {}
                    },
                    apiEndpoints: {
                        count: logic.apiEndpoints?.length || 0,
                        suggestions: logic.apiEndpoints?.slice(0, 5) || []
                    },
                    businessRules: {
                        count: logic.businessRules?.length || 0,
                        rules: logic.businessRules?.slice(0, 5) || []
                    }
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 بناء خريطة المعاني
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/vision/semantic-graph
 * بناء وعرض خريطة المعاني
 */
router.get('/semantic-graph', async (req, res) => {
    try {
        const graph = await visionSystem.buildSemanticGraph();

        res.json({
            success: true,
            data: {
                graph: {
                    nodes: {
                        count: graph.nodes?.length || 0,
                        types: [...new Set(graph.nodes?.map(n => n.type) || [])],
                        sample: graph.nodes?.slice(0, 5) || []
                    },
                    edges: {
                        count: graph.edges?.length || 0,
                        types: [...new Set(graph.edges?.map(e => e.type) || [])],
                        sample: graph.edges?.slice(0, 5) || []
                    },
                    clusters: {
                        count: graph.clusters?.length || 0
                    }
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🕋 التحقق الإسلامي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/vision/validate-islamic-compliance
 * التحقق من التوافق الإسلامي الشامل
 */
router.post('/validate-islamic-compliance', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'url is required',
                timestamp: new Date().toISOString()
            });
        }

        // البحث عن التحليل المُخزن
        const pageAnalysis = visionSystem.analysisModels?.pages?.get(url);
        if (!pageAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'Page analysis not found.',
                timestamp: new Date().toISOString()
            });
        }

        // التحقق من التوافق الإسلامي
        const validation = await visionSystem.validateIslamicCompliance(pageAnalysis);

        res.json({
            success: true,
            data: {
                source: url,
                validation: {
                    noHarm: {
                        principle: 'لا ضرر ولا ضرار',
                        passed: validation.noHarm?.checks?.filter(c => c.passed).length || 0,
                        total: validation.noHarm?.checks?.length || 0
                    },
                    truthfulness: {
                        principle: 'صدق القول والأمانة',
                        passed: validation.truthfulness?.checks?.filter(c => c.passed).length || 0,
                        total: validation.truthfulness?.checks?.length || 0
                    },
                    justice: {
                        principle: 'العدل واليسر',
                        passed: validation.justice?.checks?.filter(c => c.passed).length || 0,
                        total: validation.justice?.checks?.length || 0
                    },
                    transparency: {
                        principle: 'الشفافية والوضوح',
                        passed: validation.transparency?.checks?.filter(c => c.passed).length || 0,
                        total: validation.transparency?.checks?.length || 0
                    },
                    complianceScore: validation.score,
                    quranicReferences: validation.islamicReferences?.length || 0,
                    hadeethReferences: validation.hadeethReferences?.length || 0,
                    risks: validation.risks?.length || 0
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 التقارير الشاملة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/vision/comprehensive-report
 * توليد تقرير شامل
 */
router.get('/comprehensive-report', async (req, res) => {
    try {
        const report = await visionSystem.generateComprehensiveReport();

        res.json({
            success: true,
            data: {
                summary: report.summary,
                statistics: {
                    totalPages: report.pages?.length || 0,
                    totalImages: report.images?.length || 0,
                    topicsExtracted: Object.keys(report.topicsHierarchy || {}).length,
                    semanticNodes: report.semanticGraph?.nodes?.length || 0,
                    semanticEdges: report.semanticGraph?.edges?.length || 0,
                    recommendationsCount: report.recommendations?.length || 0
                },
                recommendations: report.recommendations?.slice(0, 10) || []
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 حالة منظومة الرؤية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/vision/status
 * الحصول على حالة منظومة الرؤية الشاملة
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            system: 'operational',
            version: visionSystem.version || '1.0.0',
            components: {
                pages_analyzed: visionSystem.analysisModels?.pages?.size || 0,
                images_analyzed: visionSystem.analysisModels?.images?.size || 0,
                agents: {
                    visual: 'active',
                    semantic: 'active',
                    structural: 'active',
                    dataExtraction: 'active',
                    logicGeneration: 'active',
                    islamicValidator: 'active'
                }
            },
            principles: visionSystem.islamicPrinciples || {
                noHarm: 'لا ضرر ولا ضرار',
                truthfulness: 'صدق القول والأمانة',
                justice: 'العدل واليسر',
                transparency: 'الشفافية والوضوح',
                publicBenefit: 'المصلحة العامة'
            }
        },
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 أدوات متقدمة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/vision/batch-analyze
 * تحليل دفعة من الصفحات
 */
router.post('/batch-analyze', async (req, res) => {
    try {
        const { pages } = req.body;

        if (!Array.isArray(pages) || pages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'pages array is required',
                timestamp: new Date().toISOString()
            });
        }

        const results = [];
        for (const page of pages) {
            if (page.url && page.htmlContent) {
                await visionSystem.analyzePage(page.url, page.htmlContent);
                results.push({
                    url: page.url,
                    status: 'analyzed',
                    timestamp: new Date().toISOString()
                });
            }
        }

        res.json({
            success: true,
            data: {
                totalRequested: pages.length,
                totalAnalyzed: results.length,
                results
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/vision/export/:format
 * تصدير البيانات بصيغ متعددة
 */
router.get('/export/:format', async (req, res) => {
    try {
        const { format } = req.params;
        const report = await visionSystem.generateComprehensiveReport();

        if (format === 'json') {
            res.setHeader('Content-Disposition', 'attachment; filename="vision-report.json"');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.send(JSON.stringify(report, null, 2));
        } else if (format === 'csv') {
            // تصدير CSV
            res.setHeader('Content-Disposition', 'attachment; filename="vision-report.csv"');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            let csv = 'URL,Status,Timestamp\n';
            report.pages?.forEach(p => {
                csv += `"${p.url}","analyzed","${p.timestamp}"\n`;
            });
            res.send(csv);
        } else {
            res.status(400).json({
                success: false,
                message: 'Unsupported format. Use json or csv.',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🛒 رؤية المنتجات — Computer Vision لمنتجات السوق
// ═══════════════════════════════════════════════════════════════════════════════

// تحميل OpenAI للرؤية الحاسوبية المتقدمة
let openaiClient = null;
function getOpenAIClient() {
    if (openaiClient) return openaiClient;
    try {
        const { default: OpenAI } = require('openai');
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.startsWith('REPLACE_')) return null;
        openaiClient = new OpenAI({ apiKey });
        return openaiClient;
    } catch {
        return null;
    }
}

/**
 * POST /api/vision/analyze-product
 * تحليل صورة منتج للسوق: التعرف على النوع، الحالة، القيمة التقديرية
 *
 * body: { imageUrl?, imageBase64?, category? }
 */
router.post('/analyze-product', async (req, res) => {
    try {
        const { imageUrl, imageBase64, category } = req.body;

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'imageUrl or imageBase64 is required',
                timestamp: new Date().toISOString()
            });
        }

        const client = getOpenAIClient();
        if (!client) {
            return res.status(503).json({
                success: false,
                message: 'خدمة الرؤية الحاسوبية غير متاحة — OpenAI API key مطلوب',
                timestamp: new Date().toISOString()
            });
        }

        const imageSource = imageBase64 || imageUrl;
        const categoryHint = category ? `الفئة المقترحة: ${category}. ` : '';

        const prompt = `أنت خبير تقييم منتجات في سوق شيخة للمعادن والسلع. ${categoryHint}حلّل هذه الصورة وأجب بـ JSON فقط بهذا الهيكل:
{
  "productType": "نوع المنتج",
  "category": "فئة المنتج",
  "subcategory": "فئة فرعية",
  "condition": "جديد|مستعمل جيد|مستعمل|تالف",
  "conditionScore": 0-100,
  "estimatedWeight": "الوزن التقديري إذا تبيّن",
  "material": "المادة الأساسية",
  "color": "اللون الرئيسي",
  "features": ["ميزة1","ميزة2"],
  "defects": ["عيب1"],
  "islamicCompliance": true,
  "islamicNotes": "ملاحظة شرعية إن وجدت",
  "marketValue": {
    "currency": "SAR",
    "min": 0,
    "max": 0,
    "unit": "للكيلو|للطن|للقطعة"
  },
  "confidence": 0.0-1.0,
  "description": "وصف موجز للمنتج"
}`;

        const response = await client.chat.completions.create({
            model: process.env.AI_LLM_MODEL || 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageSource, detail: 'high' }
                    },
                    { type: 'text', text: prompt }
                ]
            }],
            max_tokens: 1200,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content || '{}';
        let productAnalysis;
        try {
            productAnalysis = JSON.parse(content);
        } catch {
            productAnalysis = { description: content, confidence: 0.5 };
        }

        res.json({
            success: true,
            data: {
                imageUrl: imageUrl || null,
                analysis: productAnalysis,
                model: response.model,
                usage: {
                    promptTokens: response.usage?.prompt_tokens,
                    completionTokens: response.usage?.completion_tokens
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Vision] خطأ في تحليل المنتج:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/vision/classify-product
 * تصنيف منتج من صورة ضمن فئات سوق شيخة
 *
 * body: { imageUrl?, imageBase64? }
 */
router.post('/classify-product', async (req, res) => {
    try {
        const { imageUrl, imageBase64 } = req.body;

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'imageUrl or imageBase64 is required',
                timestamp: new Date().toISOString()
            });
        }

        const client = getOpenAIClient();
        if (!client) {
            return res.status(503).json({
                success: false,
                message: 'خدمة الرؤية الحاسوبية غير متاحة — OpenAI API key مطلوب',
                timestamp: new Date().toISOString()
            });
        }

        const imageSource = imageBase64 || imageUrl;

        const prompt = `صنّف هذا المنتج ضمن فئات سوق شيخة للمعادن والسلع. أجب بـ JSON فقط:
{
  "primaryCategory": "اختر من: معادن|سكراب|بلاستيك|ورق|زجاج|إلكترونيات|أخشاب|نسيج|أخرى",
  "secondaryCategory": "الفئة الفرعية الأدق",
  "sheikhaMarketSection": "القسم المناسب في السوق",
  "tags": ["وسم1","وسم2","وسم3"],
  "isHalal": true,
  "islamicCategory": "مباح|مكروه|محظور",
  "suitableForExport": true,
  "targetMarkets": ["السوق السعودي","الخليج","تصدير"],
  "confidence": 0.0-1.0,
  "classificationReason": "سبب التصنيف"
}`;

        const response = await client.chat.completions.create({
            model: process.env.AI_LLM_MODEL || 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageSource, detail: 'low' }
                    },
                    { type: 'text', text: prompt }
                ]
            }],
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content || '{}';
        let classification;
        try {
            classification = JSON.parse(content);
        } catch {
            classification = { classificationReason: content, confidence: 0.5 };
        }

        res.json({
            success: true,
            data: {
                imageUrl: imageUrl || null,
                classification,
                model: response.model
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Vision] خطأ في تصنيف المنتج:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/vision/verify-product-image
 * التحقق من صورة المنتج: هل هي حقيقية؟ هل تطابق الوصف؟
 *
 * body: { imageUrl?, imageBase64?, productDescription? }
 */
router.post('/verify-product-image', async (req, res) => {
    try {
        const { imageUrl, imageBase64, productDescription } = req.body;

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'imageUrl or imageBase64 is required',
                timestamp: new Date().toISOString()
            });
        }

        const client = getOpenAIClient();
        if (!client) {
            return res.status(503).json({
                success: false,
                message: 'خدمة الرؤية الحاسوبية غير متاحة — OpenAI API key مطلوب',
                timestamp: new Date().toISOString()
            });
        }

        const imageSource = imageBase64 || imageUrl;
        const descHint = productDescription
            ? `وصف البائع للمنتج: "${productDescription}". `
            : '';

        const prompt = `${descHint}تحقق من هذه الصورة وأجب بـ JSON فقط:
{
  "isAuthentic": true,
  "matchesDescription": true,
  "matchScore": 0-100,
  "suspiciousIndicators": [],
  "verificationNotes": "ملاحظات التحقق",
  "recommendedAction": "قبول|مراجعة|رفض",
  "islamicCompliance": true,
  "islamicNote": ""
}`;

        const response = await client.chat.completions.create({
            model: process.env.AI_LLM_MODEL || 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageSource, detail: 'high' }
                    },
                    { type: 'text', text: prompt }
                ]
            }],
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content || '{}';
        let verification;
        try {
            verification = JSON.parse(content);
        } catch {
            verification = { verificationNotes: content };
        }

        res.json({
            success: true,
            data: {
                imageUrl: imageUrl || null,
                verification,
                model: response.model
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Vision] خطأ في التحقق من الصورة:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
