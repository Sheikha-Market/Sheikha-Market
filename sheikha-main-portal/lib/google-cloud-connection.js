/**
 * إمبراطورية شيخة - محرك التحقق من الاتصال الحقيقي
 * القائد: الإمبراطور الملك الحكيم الدكتور سلمان الراجح
 * المنظمة: 224557279528
 */

const { Storage } = require('@google-cloud/storage');
const { BigQuery } = require('@google-cloud/bigquery');
const { PubSub } = require('@google-cloud/pubsub');
const path = require('path');
const fs = require('fs');
const os = require('os');

class SheikhaGoogleCloud {
    constructor() {
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'sheikha-marketplace';
        this.keyPath = path.join(__dirname, '..', 'service-account-key.json');
        this.adcPath = path.join(os.homedir(), '.config', 'gcloud', 'application_default_credentials.json');
        this.storage = null;
        this.bigquery = null;
        this.pubsub = null;
        this.isConnected = false;
        this.authMode = 'none';
    }

    /**
     * تهيئة العميل - اتصال حقيقي
     */
    init() {
        try {
            const explicitKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const explicitKeyExists = explicitKeyPath && fs.existsSync(explicitKeyPath);
            const localKeyExists = fs.existsSync(this.keyPath);
            const adcExists = fs.existsSync(this.adcPath);

            if (!explicitKeyExists && !localKeyExists && !adcExists) {
                console.warn('⚠️ لا يوجد اعتماد Google Cloud صالح (Key/ADC).');
                console.warn('   فعّل أحد الخيارين:');
                console.warn('   1) gcloud auth application-default login (ADC)');
                console.warn('   2) service-account-key.json أو GOOGLE_APPLICATION_CREDENTIALS');
                return false;
            }

            const keyFilename = explicitKeyExists ? explicitKeyPath : (localKeyExists ? this.keyPath : undefined);

            this.authMode = keyFilename ? 'service-account-key' : 'application-default-credentials';

            const clientOptions = {
                projectId: this.projectId,
                ...(keyFilename ? { keyFilename } : {})
            };

            // إنشاء عملاء الاتصال
            this.storage = new Storage(clientOptions);

            this.bigquery = new BigQuery(clientOptions);

            this.pubsub = new PubSub(clientOptions);

            console.log(`🛡️ وضع المصادقة السحابي: ${this.authMode}`);

            return true;
        } catch (error) {
            console.error('❌ خطأ في تهيئة Google Cloud:', error.message);
            return false;
        }
    }

    /**
     * اختبار اتصال Storage (Real Connection)
     */
    async checkStorageConnection() {
        if (!this.storage) {
            return { success: false, message: 'Storage غير مهيأ' };
        }

        try {
            const [buckets] = await this.storage.getBuckets();
            return {
                success: true,
                message: '🛡️ تم الاتصال بنجاح بـ Google Cloud Storage',
                buckets: buckets.map(b => b.name),
                count: buckets.length
            };
        } catch (error) {
            return {
                success: false,
                message: '⚠️ خطأ في الاتصال بـ Storage',
                error: error.message
            };
        }
    }

    /**
     * اختبار اتصال BigQuery (Real Connection)
     */
    async checkBigQueryConnection() {
        if (!this.bigquery) {
            return { success: false, message: 'BigQuery غير مهيأ' };
        }

        try {
            const [datasets] = await this.bigquery.getDatasets();
            return {
                success: true,
                message: '🛡️ تم الاتصال بنجاح بـ Google Cloud BigQuery',
                datasets: datasets.map(d => d.id),
                count: datasets.length
            };
        } catch (error) {
            return {
                success: false,
                message: '⚠️ خطأ في الاتصال بـ BigQuery',
                error: error.message
            };
        }
    }

    /**
     * اختبار اتصال Pub/Sub (Real Connection)
     */
    async checkPubSubConnection() {
        if (!this.pubsub) {
            return { success: false, message: 'Pub/Sub غير مهيأ' };
        }

        try {
            const [subscriptions] = await this.pubsub.getSubscriptions();
            return {
                success: true,
                message: '🛡️ تم الاتصال بنجاح بـ Google Cloud Pub/Sub',
                subscriptions: subscriptions.map(s => s.name),
                count: subscriptions.length
            };
        } catch (error) {
            return {
                success: false,
                message: '⚠️ خطأ في الاتصال بـ Pub/Sub',
                error: error.message
            };
        }
    }

    /**
     * اختبار شامل لكل الاتصالات
     */
    async checkAllConnections() {
        const results = {
            projectId: this.projectId,
            timestamp: new Date().toISOString(),
            connections: {}
        };

        console.log('\n🔍 جاري فحص اتصالات Google Cloud...\n');

        // Storage
        results.connections.storage = await this.checkStorageConnection();
        if (results.connections.storage.success) {
            console.log('✅ Storage:', results.connections.storage.message);
            console.log('   عدد السلال:', results.connections.storage.count);
        } else {
            console.log('❌ Storage:', results.connections.storage.message);
        }

        // BigQuery
        results.connections.bigquery = await this.checkBigQueryConnection();
        if (results.connections.bigquery.success) {
            console.log('✅ BigQuery:', results.connections.bigquery.message);
            console.log('   عدد مجموعات البيانات:', results.connections.bigquery.count);
        } else {
            console.log('❌ BigQuery:', results.connections.bigquery.message);
        }

        // Pub/Sub
        results.connections.pubsub = await this.checkPubSubConnection();
        if (results.connections.pubsub.success) {
            console.log('✅ Pub/Sub:', results.connections.pubsub.message);
            console.log('   عدد الاشتراكات:', results.connections.pubsub.count);
        } else {
            console.log('❌ Pub/Sub:', results.connections.pubsub.message);
        }

        this.isConnected = Object.values(results.connections).some(c => c.success);

        console.log('\n' + '='.repeat(50));
        console.log('الحالة النهائية:', this.isConnected ? '✅ متصل' : '⚠️ غير متصل');
        console.log('='.repeat(50) + '\n');

        return results;
    }

    /**
     * الحصول على حالة الاتصال
     */
    getStatus() {
        return {
            connected: this.isConnected,
            projectId: this.projectId,
            authMode: this.authMode,
            storageAvailable: !!this.storage,
            bigqueryAvailable: !!this.bigquery,
            pubsubAvailable: !!this.pubsub
        };
    }
}

// إنشاء مثيل عام
const sheikhaCloud = new SheikhaGoogleCloud();

// تصدير الوحدة
module.exports = sheikhaCloud;

// إذا تم تشغيل الملف مباشرة، قم باختبار الاتصالات
if (require.main === module) {
    (async () => {
        console.log('🚀 بسم الله.. اختبار الاتصال بـ Google Cloud\n');

        if (!sheikhaCloud.init()) {
            console.log('\n⚠️ لم تتمكن من الاتصال. تأكد من:');
            console.log('1. تشغيل: gcloud auth application-default login');
            console.log('2. أو توفير service-account-key.json / GOOGLE_APPLICATION_CREDENTIALS');
            console.log('3. تفعيل Google Cloud APIs المطلوبة\n');
            process.exit(1);
        }

        await sheikhaCloud.checkAllConnections();
    })();
}
