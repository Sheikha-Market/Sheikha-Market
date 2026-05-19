/**
 * بسم الله الرحمن الرحيم
 * أدوات ومساعدات البكسل المتقدمة
 * Advanced Pixel Tools & Utilities
 */

'use strict';

const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
// 🛠️ مجموعة الأدوات المساعدة
// ═══════════════════════════════════════════════════════════════════════════════

class PixelUtilities {
    /**
     * تحويل البيانات إلى بكسل موحد
     */
    static normalizePixelData(data) {
        return {
            normalized: true,
            original: data,
            stringLength: JSON.stringify(data).length,
            type: typeof data,
            isEmpty: Object.keys(data || {}).length === 0,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * التحقق من صحة البكسل
     */
    static validatePixel(pixel) {
        const errors = [];
        const warnings = [];

        if (!pixel.id) errors.push('معرّف البكسل مفقود');
        if (!pixel.data) errors.push('بيانات البكسل مفقودة');
        if (!pixel.timestamp) warnings.push('الطابع الزمني غير موجود');

        if (JSON.stringify(pixel).length > 1000000) {
            warnings.push('البكسل كبير جداً (> 1MB)');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            pixelId: pixel.id
        };
    }

    /**
     * حساب بصمة البكسل
     */
    static generatePixelFingerprint(pixel) {
        const data = JSON.stringify(pixel.data);
        let hash = 0;

        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return {
            fingerprint: Math.abs(hash).toString(16),
            pixelId: pixel.id,
            dataHash: hash.toString(16),
            size: data.length
        };
    }

    /**
     * مقارنة بكسلين متقدمة
     */
    static advancedCompare(pixel1, pixel2) {
        const fp1 = this.generatePixelFingerprint(pixel1);
        const fp2 = this.generatePixelFingerprint(pixel2);

        const similarity = this.calculateSimilarity(pixel1.data, pixel2.data);
        const diff = this.findDetailedDifferences(pixel1, pixel2);

        return {
            pixel1Id: pixel1.id,
            pixel2Id: pixel2.id,
            similarity: similarity,
            fingerprint1: fp1.fingerprint,
            fingerprint2: fp2.fingerprint,
            sameFingerpint: fp1.fingerprint === fp2.fingerprint,
            differences: diff,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * حساب التشابه بنسبة مئوية
     */
    static calculateSimilarity(data1, data2) {
        const str1 = JSON.stringify(data1);
        const str2 = JSON.stringify(data2);

        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * مسافة Levenshtein (لحساب الاختلاف)
     */
    static levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * إيجاد الاختلافات التفصيلية
     */
    static findDetailedDifferences(pixel1, pixel2) {
        const diffs = {
            idDifferent: pixel1.id !== pixel2.id,
            dataDifferent: JSON.stringify(pixel1.data) !== JSON.stringify(pixel2.data),
            metadataDifferent: JSON.stringify(pixel1.metadata) !== JSON.stringify(pixel2.metadata),
            details: []
        };

        // مقارنة الحقول الأساسية
        if (pixel1.id !== pixel2.id) {
            diffs.details.push({ field: 'id', value1: pixel1.id, value2: pixel2.id });
        }

        return diffs;
    }

    /**
     * تحويل البكسلات إلى تقرير
     */
    static generateReport(pixels) {
        const report = {
            title: 'تقرير تحليل البكسلات',
            totalPixels: pixels.length,
            timestamp: new Date().toISOString(),
            statistics: {
                averageDataSize: this.calculateAverageSize(pixels),
                totalDataSize: this.calculateTotalSize(pixels),
                validPixels: pixels.filter(p => this.validatePixel(p).valid).length,
                invalidPixels: pixels.filter(p => !this.validatePixel(p).valid).length
            },
            samples: pixels.slice(0, 3).map(p => ({
                id: p.id,
                dataPreview: JSON.stringify(p.data).substring(0, 100) + '...'
            })),
            recommendations: this.generateRecommendations(pixels)
        };

        return report;
    }

    /**
     * حساب متوسط حجم البيانات
     */
    static calculateAverageSize(pixels) {
        if (pixels.length === 0) return 0;
        const total = pixels.reduce((sum, p) => sum + JSON.stringify(p.data).length, 0);
        return (total / pixels.length).toFixed(2);
    }

    /**
     * حساب الحجم الكلي
     */
    static calculateTotalSize(pixels) {
        return pixels.reduce((sum, p) => sum + JSON.stringify(p.data).length, 0);
    }

    /**
     * توليد التوصيات
     */
    static generateRecommendations(pixels) {
        const recommendations = [];

        if (pixels.length > 1000) {
            recommendations.push('عدد البكسلات كبير جداً - فكر في التقسيم إلى دفعات');
        }

        const avgSize = parseFloat(this.calculateAverageSize(pixels));
        if (avgSize > 10000) {
            recommendations.push('حجم البكسلات كبير - يمكن تحسين الضغط');
        }

        return recommendations;
    }

    /**
     * تحويل البكسلات إلى CSV
     */
    static exportToCSV(pixels) {
        let csv = 'ID,Type,DataSize,Status\n';

        pixels.forEach(pixel => {
            const validation = this.validatePixel(pixel);
            csv += `"${pixel.id}","${typeof pixel.data}",${JSON.stringify(pixel.data).length},"${validation.valid ? 'Valid' : 'Invalid'}"\n`;
        });

        return csv;
    }

    /**
     * تحويل البكسلات إلى JSON
     */
    static exportToJSON(pixels) {
        return JSON.stringify({
            export: {
                timestamp: new Date().toISOString(),
                pixelCount: pixels.length,
                pixels: pixels.map(p => ({
                    id: p.id,
                    data: p.data,
                    metadata: p.metadata,
                    timestamp: p.timestamp
                }))
            }
        }, null, 2);
    }

    /**
     * استيراد من JSON
     */
    static importFromJSON(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            return {
                success: true,
                pixels: parsed.export?.pixels || parsed.pixels || [],
                count: parsed.export?.pixelCount || parsed.pixels?.length || 0
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * تشفير البكسل
     */
    static encryptPixel(pixel, key = 'default-key') {
        // تشفير بسيط للمثال (في الإنتاج استخدم crypto حقيقي)
        const encrypted = Buffer.from(JSON.stringify(pixel.data)).toString('base64');

        return {
            pixelId: pixel.id,
            encrypted: encrypted,
            key: key,
            encryptedAt: new Date().toISOString()
        };
    }

    /**
     * فك تشفير البكسل
     */
    static decryptPixel(encryptedData, key = 'default-key') {
        try {
            const decrypted = Buffer.from(encryptedData.encrypted, 'base64').toString('utf8');
            return {
                success: true,
                data: JSON.parse(decrypted),
                pixelId: encryptedData.pixelId
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * الحصول على الإحصائيات الكاملة
     */
    static getDetailedStatistics(pixels) {
        const stats = {
            total: pixels.length,
            validCount: 0,
            invalidCount: 0,
            totalSize: 0,
            averageSize: 0,
            largestPixel: null,
            smallestPixel: null,
            dataTypes: {},
            timestamp: new Date().toISOString()
        };

        let maxSize = 0;
        let minSize = Infinity;

        pixels.forEach(pixel => {
            const validation = this.validatePixel(pixel);
            if (validation.valid) stats.validCount++;
            else stats.invalidCount++;

            const size = JSON.stringify(pixel.data).length;
            stats.totalSize += size;

            const type = typeof pixel.data;
            stats.dataTypes[type] = (stats.dataTypes[type] || 0) + 1;

            if (size > maxSize) {
                maxSize = size;
                stats.largestPixel = pixel.id;
            }

            if (size < minSize) {
                minSize = size;
                stats.smallestPixel = pixel.id;
            }
        });

        stats.averageSize = (stats.totalSize / pixels.length).toFixed(2);

        return stats;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصادرات
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = PixelUtilities;
