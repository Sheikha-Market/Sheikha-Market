/**
 * مركز الإشعارات الذكي — منظومة شيخة
 * Notification Center — Sheikha Platform
 *
 * مبادئ شرعية:
 * - وَالنَّاشِئَةُ بِاللَّيْلِ (المزمل:6) — التنبيه والرقابة
 * - وَعَلَى اللَّهِ قَصْدُ السَّبِيلِ وَمِنْهَا جَائِرٌ (النحل:9) — إرشاد الطريق الصحيح
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class NotificationCenter extends EventEmitter {
    constructor() {
        super();
        this.notifications = [];
        this.subscribers = new Map();
        this.templates = new Map();
        this.history = [];
        this.maxNotifications = 10000;

        this.notificationPath = path.join(__dirname, '../data/notifications.ndjson');
        this.initializeTemplates();
        this.loadHistory();
    }

    /**
     * تهيئة قوالب الإشعارات
     */
    initializeTemplates() {
        this.templates.set('error', {
            title: '❌ خطأ',
            icon: '🚨',
            priority: 'high',
            color: '#e74c3c',
            quranRef: 'الدخان:37 — صرخة الحق'
        });

        this.templates.set('warning', {
            title: '⚠️ تحذير',
            icon: '⚡',
            priority: 'medium',
            color: '#f39c12',
            quranRef: 'المائدة:100 — التمييز بين الطيب والخبيث'
        });

        this.templates.set('success', {
            title: '✅ نجاح',
            icon: '🎉',
            priority: 'low',
            color: '#27ae60',
            quranRef: 'يونس:58 — الفرح بقضاء الحاجة'
        });

        this.templates.set('info', {
            title: 'ℹ️ معلومة',
            icon: '📌',
            priority: 'low',
            color: '#3498db',
            quranRef: 'العلق:1-5 — اقرأ'
        });

        this.templates.set('security', {
            title: '🔒 أمان',
            icon: '🛡️',
            priority: 'critical',
            color: '#8e44ad',
            quranRef: 'البقرة:48 — الحماية والأمان'
        });

        this.templates.set('performance', {
            title: '⚙️ أداء',
            icon: '📊',
            priority: 'medium',
            color: '#16a085',
            quranRef: 'الشورى:38 — التشاور والتصحيح'
        });

        this.templates.set('audit', {
            title: '📋 تدقيق',
            icon: '🔍',
            priority: 'medium',
            color: '#2980b9',
            quranRef: 'البقرة:282 — فاكتبوه'
        });
    }

    /**
     * إضافة إخطار جديد
     */
    notify(type, message, metadata = {}) {
        const notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type,
            message,
            metadata,
            template: this.templates.get(type) || this.templates.get('info'),
            read: false,
            actions: []
        };

        this.notifications.push(notification);
        this.history.push(notification);

        // تحديد السعة
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }

        // حفظ
        this.persistNotification(notification);

        // بث الإخطار للمشتركين
        this.broadcastNotification(notification);

        // الإصدار
        this.emit('notification', notification);

        console.log(`\n📢 إخطار: ${notification.template.icon} ${notification.message}`);

        return notification;
    }

    /**
     * الاشتراك في الإخطارات
     */
    subscribe(type, callback) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, []);
        }
        this.subscribers.get(type).push(callback);

        return () => {
            const idx = this.subscribers.get(type).indexOf(callback);
            if (idx > -1) {
                this.subscribers.get(type).splice(idx, 1);
            }
        };
    }

    /**
     * بث الإخطار للمشتركين
     */
    broadcastNotification(notification) {
        const typeSubscribers = this.subscribers.get(notification.type) || [];
        const allSubscribers = this.subscribers.get('*') || [];

        [...typeSubscribers, ...allSubscribers].forEach(callback => {
            try {
                callback(notification);
            } catch (err) {
                console.error('❌ خطأ في معالج الإخطار:', err.message);
            }
        });
    }

    /**
     * حفظ الإخطار
     */
    persistNotification(notification) {
        try {
            fs.appendFileSync(this.notificationPath, JSON.stringify(notification) + '\n');
        } catch (err) {
            console.warn('⚠️ فشل حفظ الإخطار:', err.message);
        }
    }

    /**
     * تحميل السجل التاريخي
     */
    loadHistory() {
        try {
            if (fs.existsSync(this.notificationPath)) {
                const logs = fs
                    .readFileSync(this.notificationPath, 'utf-8')
                    .split('\n')
                    .filter(l => l);
                this.history = logs.map(l => JSON.parse(l)).slice(-1000); // آخر 1000
            }
        } catch (err) {
            console.warn('⚠️ فشل تحميل السجل:', err.message);
        }
    }

    /**
     * الحصول على الإخطارات غير المقروءة
     */
    getUnread() {
        return this.notifications.filter(n => !n.read);
    }

    /**
     * تحديد الإخطار كمقروء
     */
    markAsRead(notificationId) {
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
            notif.read = true;
            this.emit('notification-read', notif);
            return true;
        }
        return false;
    }

    /**
     * تحديد جميع الإخطارات كمقروءة
     */
    markAllAsRead() {
        this.notifications.forEach(n => {
            n.read = true;
        });
        this.emit('all-read');
    }

    /**
     * حذف إخطار
     */
    delete(notificationId) {
        const idx = this.notifications.findIndex(n => n.id === notificationId);
        if (idx > -1) {
            const deleted = this.notifications.splice(idx, 1);
            this.emit('notification-deleted', deleted[0]);
            return true;
        }
        return false;
    }

    /**
     * حذف جميع الإخطارات
     */
    clear() {
        const count = this.notifications.length;
        this.notifications = [];
        this.emit('notifications-cleared', count);
    }

    /**
     * البحث في الإخطارات
     */
    search(query) {
        return this.notifications.filter(
            n => n.message.includes(query) || n.type.includes(query) || n.id.includes(query)
        );
    }

    /**
     * الحصول على الإحصائيات
     */
    getStatistics() {
        const stats = {
            totalNotifications: this.notifications.length,
            unread: this.getUnread().length,
            byType: {},
            byPriority: {},
            historySize: this.history.length
        };

        this.notifications.forEach(n => {
            stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
            const priority = n.template?.priority || 'unknown';
            stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
        });

        return stats;
    }

    /**
     * الإخطارات المهمة (الحرجة والعالية)
     */
    getImportant() {
        return this.notifications.filter(
            n => n.template?.priority === 'critical' || n.template?.priority === 'high'
        );
    }

    /**
     * الحصول على آخر الإخطارات
     */
    getRecent(limit = 10) {
        return this.notifications.slice(-limit).reverse();
    }
}

module.exports = new NotificationCenter();
