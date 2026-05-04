/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 👁️ مسارات الرؤية الحاسوبية — Computer Vision Routes
 *
 * API endpoints لمحرك الرؤية الحاسوبية
 * OCR | كشف الأشياء | باركود QR | تحليل المستندات | فحص الجودة
 *
 * "أَوَلَمْ يَنظُرُوا فِي مَلَكُوتِ السَّمَاوَاتِ وَالْأَرْضِ" — الأعراف: ١٨٥
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();

// تحميل المُرقمِّن الإسلامي للربط مع التقارير
let digitizer, reportWriter;
try {
    digitizer = require('../lib/sheikha-islamic-digitizer.js');
} catch (_) { digitizer = null; }
try {
    reportWriter = require('../lib/sheikha-report-writer.js');
} catch (_) { reportWriter = null; }

let ComputerVisionEngine;
let cvEngine;

try {
    ComputerVisionEngine = require('../lib/sheikha-computer-vision-engine.js');
    cvEngine = new ComputerVisionEngine();
    console.log('✅ [COMPUTER-VISION-ROUTES] محرك الرؤية الحاسوبية محمّل');
} catch (e) {
    console.log('⚠️ [COMPUTER-VISION-ROUTES] فشل تحميل محرك الرؤية الحاسوبية:', e.message);
    cvEngine = null;
}

function engineCheck(req, res) {
    if (!cvEngine) {
        res.status(503).json({ success: false, message: 'محرك الرؤية الحاسوبية غير متاح', timestamp: new Date().toISOString() });
        return false;
    }
    return true;
}

function getImageInput(body) {
    return body.imageBase64 || body.imageUrl || body.image || null;
}

// ─── GET /api/computer-vision/status ───────────────────────────────────────
/**
 * حالة محرك الرؤية الحاسوبية
 */
router.get('/status', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        res.json({ success: true, data: cvEngine.getStatus(), timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/ocr ─────────────────────────────────────────
/**
 * استخراج النصوص من الصور (OCR)
 * Body: { imageBase64, imageUrl, language?, outputFormat?, detectTables? }
 */
router.post('/ocr', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { language, outputFormat, detectTables, detectForms } = req.body;
        const result = await cvEngine.extractText(imageInput, { language, outputFormat, detectTables, detectForms });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/detect-objects ──────────────────────────────
/**
 * كشف الأشياء في الصور
 * Body: { imageBase64, imageUrl, categories?, confidenceThreshold?, maxObjects? }
 */
router.post('/detect-objects', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { categories, confidenceThreshold, maxObjects, returnBoundingBoxes } = req.body;
        const result = await cvEngine.detectObjects(imageInput, {
            categories,
            confidenceThreshold: confidenceThreshold ? parseFloat(confidenceThreshold) : 0.5,
            maxObjects: maxObjects ? parseInt(maxObjects) : 50,
            returnBoundingBoxes
        });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/barcode ─────────────────────────────────────
/**
 * قراءة الباركود وQR Code
 * Body: { imageBase64, imageUrl, formats?, tryHarder? }
 */
router.post('/barcode', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { formats, tryHarder } = req.body;
        const result = await cvEngine.readBarcode(imageInput, { formats, tryHarder });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/recognize-product ───────────────────────────
/**
 * التعرف على المنتجات
 * Body: { imageBase64, imageUrl, searchInCatalog?, returnSimilar?, maxSimilar? }
 */
router.post('/recognize-product', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { searchInCatalog, returnSimilar, maxSimilar } = req.body;
        const result = await cvEngine.recognizeProduct(imageInput, { searchInCatalog, returnSimilar, maxSimilar });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/quality-inspect ─────────────────────────────
/**
 * فحص جودة المنتجات
 * Body: { imageBase64, imageUrl, productType?, defectTypes?, strictMode? }
 */
router.post('/quality-inspect', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { productType, defectTypes, strictMode } = req.body;
        const result = await cvEngine.inspectQuality(imageInput, { productType, defectTypes, strictMode });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/analyze-document ────────────────────────────
/**
 * تحليل المستندات (فاتورة، عقد، جواز سفر، ...)
 * Body: { imageBase64, imageUrl, documentType?, extractFields?, validateData?, language? }
 */
router.post('/analyze-document', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة للمستند (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { documentType, extractFields, validateData, language } = req.body;
        const result = await cvEngine.analyzeDocument(imageInput, { documentType, extractFields, validateData, language });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/analyze-colors ──────────────────────────────
/**
 * تحليل ألوان الصورة
 * Body: { imageBase64, imageUrl, maxColors?, includeHarmony?, islamicCheck? }
 */
router.post('/analyze-colors', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { maxColors, includeHarmony, islamicCheck } = req.body;
        const result = await cvEngine.analyzeColors(imageInput, {
            maxColors: maxColors ? parseInt(maxColors) : 10,
            includeHarmony,
            islamicCheck
        });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/sentiment ───────────────────────────────────
/**
 * تحليل المشاعر البصرية
 * Body: { imageBase64, imageUrl }
 */
router.post('/sentiment', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const result = await cvEngine.analyzeVisualSentiment(imageInput);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/satellite ───────────────────────────────────
/**
 * تحليل صور الأقمار الصناعية والجوية
 * Body: { imageBase64, imageUrl, analysisType?, includeVegetation?, includeUrbanDensity?, includeWaterBodies? }
 */
router.post('/satellite', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { analysisType, includeVegetation, includeUrbanDensity, includeWaterBodies } = req.body;
        const result = await cvEngine.analyzeSatelliteImage(imageInput, {
            analysisType, includeVegetation, includeUrbanDensity, includeWaterBodies
        });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/detect-defects ──────────────────────────────
/**
 * كشف عيوب التصنيع
 * Body: { imageBase64, imageUrl, materialType?, defectSensitivity?, includeHeatmap? }
 */
router.post('/detect-defects', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const { materialType, defectSensitivity, includeHeatmap } = req.body;
        const result = await cvEngine.detectManufacturingDefects(imageInput, {
            materialType, defectSensitivity, includeHeatmap
        });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/computer-vision/analyze-full ────────────────────────────────
/**
 * تحليل شامل للصورة (كل القدرات دفعة واحدة)
 * Body: { imageBase64, imageUrl, includeOCR?, includeObjects?, includeBarcode?, includeColors?, includeSentiment?, includeQuality?, language? }
 */
router.post('/analyze-full', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const imageInput = getImageInput(req.body);
        if (!imageInput) {
            return res.status(400).json({
                success: false,
                message: 'يجب تقديم صورة (imageBase64 أو imageUrl)',
                timestamp: new Date().toISOString()
            });
        }

        const {
            includeOCR, includeObjects, includeBarcode,
            includeColors, includeSentiment, includeQuality, language
        } = req.body;

        const result = await cvEngine.analyzeImageFull(imageInput, {
            includeOCR: includeOCR !== false,
            includeObjects: includeObjects !== false,
            includeBarcode: includeBarcode !== false,
            includeColors: includeColors !== false,
            includeSentiment: includeSentiment !== false,
            includeQuality: includeQuality === true,
            language
        });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/computer-vision/health ──────────────────────────────────────────
/**
 * فحص صحة محرك الرؤية الحاسوبية والمكتبات
 */
router.get('/health', (req, res) => {
    const checks = {
        engine: !!cvEngine,
        digitizer: !!digitizer,
        reportWriter: !!reportWriter
    };
    const allOk = Object.values(checks).every(Boolean);
    res.status(allOk ? 200 : 206).json({
        success: true,
        healthy: allOk,
        checks,
        quranRef: '﴿ أَوَلَمْ يَنظُرُوا فِي مَلَكُوتِ السَّمَاوَاتِ وَالْأَرْضِ ﴾ — الأعراف: 185',
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/computer-vision/quran-tagging ───────────────────────────────────
/**
 * تصنيف الصور وإرفاق أقرب آية قرآنية دلالياً
 * Body: { imageBase64?, imageUrl?, category? }
 */
router.post('/quran-tagging', async (req, res) => {
    try {
        const imageInput = getImageInput(req.body);
        const { category = 'general' } = req.body || {};

        let visionData = null;
        if (cvEngine && imageInput) {
            try {
                visionData = await cvEngine.detectObjects(imageInput, { maxObjects: 5 });
            } catch (_) {}
        }

        // استخراج مفهوم من التحليل أو من الفئة المُدخَلة
        const concept = visionData?.objects?.[0]?.label || category;
        const islamicTag = digitizer ? digitizer.digitize(concept) : {
            ref: 'الأعراف: 185',
            arabic: '﴿ أَوَلَمْ يَنظُرُوا فِي مَلَكُوتِ السَّمَاوَاتِ وَالْأَرْضِ ﴾',
            meaning: 'النظر والتأمل'
        };

        // تسجيل تقرير رؤية تلقائياً
        if (reportWriter) {
            try {
                reportWriter.writeReport('vision', {
                    action: 'quran-tagging',
                    concept,
                    islamicTag,
                    hasImage: !!imageInput
                }, 'computer-vision-server');
            } catch (_) {}
        }

        res.json({
            success: true,
            concept,
            islamicTag,
            visionSummary: visionData
                ? { objectsDetected: visionData.objects?.length || 0, topObject: visionData.objects?.[0] || null }
                : null,
            bismillah: 'بسم الله الرحمن الرحيم',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
