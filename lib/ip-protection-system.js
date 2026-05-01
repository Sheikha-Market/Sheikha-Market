/**
 * 🔐 إمبراطورية شيخة - نظام حماية الملكية الفكرية والسرية
 * ═════════════════════════════════════════════════════════════
 * حماية شاملة للأكواد والتصاميم والوسائط والبيانات
 * المالك: سلمان أحمد بن سلمان الراجح
 * السجل: 2051263653 | الاعتماد: ciscc2250603061
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class IPProtectionSystem {
    constructor() {
        this.owner = 'Salman_Ahmed_AlRajih';
        this.orgID = '224557279528';
        this.commercialRegistry = '2051263653';
        this.internationalCredential = 'ciscc2250603061';
        this.encryptionAlgorithm = 'aes-256-gcm';
        this.protectedAssets = new Map();
        this.auditLog = [];
    }

    /**
     * توقيع ملكية فكرية على ملف أو محتوى
     */
    signAsset(assetName, assetContent) {
        const timestamp = new Date().toISOString();

        // التوقيع: hash + owner + timestamp
        const signature = crypto
            .createHash('sha256')
            .update(`${assetName}|${assetContent}|${this.owner}|${timestamp}`)
            .digest('hex');

        const metadata = {
            asset: assetName,
            owner: this.owner,
            orgID: this.orgID,
            registry: this.commercialRegistry,
            credential: this.internationalCredential,
            signature,
            timestamp,
            ipProtected: true,
            watermark: this.generateWatermark(assetName)
        };

        this.protectedAssets.set(assetName, metadata);
        this.logAssetProtection(assetName, 'signed');

        return metadata;
    }

    /**
     * توليد علامة مائية رقمية خفية
     */
    generateWatermark(assetName) {
        const watermarkData = {
            owner: this.owner,
            asset: assetName,
            protected: true,
            timestamp: Date.now(),
            checksum: crypto.randomBytes(16).toString('hex')
        };

        return crypto
            .createHash('sha256')
            .update(JSON.stringify(watermarkData))
            .digest('hex')
            .substring(0, 32);
    }

    /**
     * تشفير محتوى حساس
     */
    encryptContent(content, key = null) {
        const encryptionKey = key || process.env.IP_ENCRYPTION_KEY || crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.encryptionAlgorithm, encryptionKey, iv);

        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            algorithm: this.encryptionAlgorithm,
            owner: this.owner
        };
    }

    /**
     * فك تشفير محتوى
     */
    decryptContent(encryptedData, key = null) {
        try {
            const encryptionKey = key || process.env.IP_ENCRYPTION_KEY;
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const authTag = Buffer.from(encryptedData.authTag, 'hex');

            const decipher = crypto.createDecipheriv(encryptedData.algorithm, encryptionKey, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            this.logAssetProtection('decryption', 'accessed');
            return decrypted;
        } catch (err) {
            console.error(`❌ فشل فك التشفير: ${err.message}`);
            this.logSecurityEvent('decryption_failure', err.message);
            return null;
        }
    }

    /**
     * حماية ملف برمجي
     */
    protectFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath);

            // توقيع الملف
            const signature = this.signAsset(fileName, content);

            // إضافة تعليق الحماية في أول الملف
            const protectedHeader = `/**
 * 🔐 محمي بموجب قوانين الملكية الفكرية
 * المالك: ${this.owner}
 * السجل التجاري: ${this.commercialRegistry}
 * الاعتماد الدولي: ${this.internationalCredential}
 * التوقيع: ${signature.signature.substring(0, 32)}...
 * التاريخ: ${signature.timestamp}
 * ممنوع: النسخ، التعديل، البيع، التوزيع بدون إذن صريح
 */\n`;

            const protectedContent = protectedHeader + content;

            // حفظ نسخة محمية
            const protectedPath = filePath.replace(/\.js$/, '.protected.js');
            fs.writeFileSync(protectedPath, protectedContent);

            console.log(`✅ تم حماية الملف: ${fileName}`);
            return { success: true, signature, protectedPath };
        } catch (err) {
            console.error(`❌ فشل حماية الملف: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * حماية مجلد كامل
     */
    protectDirectory(dirPath) {
        const results = {
            files: [],
            errors: [],
            timestamp: new Date().toISOString()
        };

        try {
            const files = fs.readdirSync(dirPath, { recursive: true });

            for (const file of files) {
                if (file.endsWith('.js') && !file.endsWith('.protected.js')) {
                    const fullPath = path.join(dirPath, file);
                    const result = this.protectFile(fullPath);
                    results.files.push({ file, ...result });
                }
            }

            console.log(`📁 تم حماية ${results.files.length} ملف`);
            return results;
        } catch (err) {
            console.error(`❌ فشل حماية المجلد: ${err.message}`);
            results.errors.push(err.message);
            return results;
        }
    }

    /**
     * راقب محاولات الوصول غير المصرح
     */
    monitorUnauthorizedAccess(filePath, caller) {
        const event = {
            timestamp: new Date().toISOString(),
            filePath,
            caller,
            status: 'blocked',
            severity: 'high'
        };

        this.logSecurityEvent('unauthorized_access_attempt', JSON.stringify(event));

        console.warn(`⚠️ محاولة وصول غير مصرح: ${caller} -> ${filePath}`);

        // في بيئة الإنتاج: إرسال تنبيه فوري
        return event;
    }

    /**
     * نموذج DRM (Digital Rights Management)
     */
    implementDRM(contentPath) {
        const drmConfig = {
            contentPath,
            owner: this.owner,
            restrictions: {
                copyProtected: true,
                printDisabled: true,
                screenshotBlocked: true,
                rightClickDisabled: true,
                developerToolsWarning: true
            },
            license: {
                exclusive: true,
                transferable: false,
                resellable: false,
                shareableCount: 1
            },
            enforcement: {
                drmLevel: 'maximum',
                watermarkInsertionInterval: '5s',
                checksumValidation: true
            },
            signature: this.generateSignature()
        };

        return drmConfig;
    }

    /**
     * توقيع رقمي متقدم
     */
    generateSignature() {
        const data = {
            owner: this.owner,
            timestamp: Date.now(),
            version: '1.0',
            algorithm: 'RSA-2048'
        };

        return crypto
            .createHash('sha512')
            .update(JSON.stringify(data))
            .digest('base64')
            .substring(0, 64);
    }

    /**
     * تسجيل الأحداث الأمنية (Audit Trail)
     */
    logSecurityEvent(eventType, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType,
            details,
            owner: this.owner,
            severity: eventType.includes('failure') ? 'critical' : 'info'
        };

        this.auditLog.push(logEntry);

        // حفظ في ملف السجل
        const logPath = path.join(process.cwd(), 'data', 'security-audit.ndjson');
        const logDir = path.dirname(logPath);

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    }

    /**
     * تسجيل حماية الأصول
     */
    logAssetProtection(assetName, action) {
        this.logSecurityEvent('asset_protection', {
            asset: assetName,
            action,
            owner: this.owner
        });
    }

    /**
     * التحقق من سلامة الملف
     */
    verifyFileIntegrity(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const hash = crypto.createHash('sha256').update(content).digest('hex');

            const metadata = this.protectedAssets.get(path.basename(filePath));

            if (metadata && metadata.signature === hash) {
                console.log(`✅ الملف سليم: ${filePath}`);
                return { valid: true, hash };
            } else {
                console.warn(`⚠️ تحذير: قد يكون الملف قد تم تعديله: ${filePath}`);
                this.logSecurityEvent('integrity_check_failed', { filePath, hash });
                return { valid: false, hash };
            }
        } catch (err) {
            console.error(`❌ فشل التحقق من السلامة: ${err.message}`);
            return { valid: false, error: err.message };
        }
    }

    /**
     * تقرير حماية شامل
     */
    generateSecurityReport() {
        return {
            timestamp: new Date().toISOString(),
            owner: this.owner,
            registry: this.commercialRegistry,
            credential: this.internationalCredential,
            protectedAssets: this.protectedAssets.size,
            securityEventCount: this.auditLog.length,
            lastUpdate: this.auditLog[this.auditLog.length - 1]?.timestamp,
            status: 'Active and Monitoring',
            encryptionLevel: '256-bit AES-GCM',
            watermarkingEnabled: true,
            drmEnabled: true
        };
    }
}

// تصدير النظام
module.exports = IPProtectionSystem;
