/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🗄️ إعدادات قاعدة البيانات
 *  Database Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

class Database {
    constructor() {
        this.dataPath = path.resolve(__dirname, '..', config.database.path);
        this.cache = new Map();
        this.initialized = false;
    }

    /**
     * تهيئة قاعدة البيانات
     */
    async initialize() {
        if (this.initialized) return;

        // التأكد من وجود مجلد البيانات
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }

        // تحميل الملفات في الذاكرة
        for (const [key, filename] of Object.entries(config.database.files)) {
            const filePath = path.join(this.dataPath, filename);
            if (fs.existsSync(filePath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    this.cache.set(key, data);
                } catch (e) {
                    console.warn(`⚠️ خطأ في تحميل ${filename}:`, e.message);
                    this.cache.set(key, {});
                }
            } else {
                this.cache.set(key, {});
            }
        }

        this.initialized = true;
        console.log(`✅ قاعدة البيانات: تم تحميل ${this.cache.size} ملف`);
    }

    /**
     * قراءة بيانات
     */
    read(collection) {
        return this.cache.get(collection) || null;
    }

    /**
     * كتابة بيانات
     */
    write(collection, data) {
        this.cache.set(collection, data);
        
        // حفظ في الملف
        const filename = config.database.files[collection];
        if (filename) {
            const filePath = path.join(this.dataPath, filename);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        
        return true;
    }

    /**
     * إضافة عنصر
     */
    insert(collection, item) {
        let data = this.cache.get(collection);
        if (!data) data = [];
        if (!Array.isArray(data)) data = [data];
        
        data.push(item);
        this.write(collection, data);
        return item;
    }

    /**
     * تحديث عنصر
     */
    update(collection, id, updates) {
        let data = this.cache.get(collection);
        if (!data || !Array.isArray(data)) return null;

        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;

        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        this.write(collection, data);
        return data[index];
    }

    /**
     * حذف عنصر
     */
    delete(collection, id) {
        let data = this.cache.get(collection);
        if (!data || !Array.isArray(data)) return false;

        const index = data.findIndex(item => item.id === id);
        if (index === -1) return false;

        data.splice(index, 1);
        this.write(collection, data);
        return true;
    }

    /**
     * البحث
     */
    find(collection, query = {}) {
        let data = this.cache.get(collection);
        if (!data) return [];
        if (!Array.isArray(data)) return [data];

        if (Object.keys(query).length === 0) return data;

        return data.filter(item => {
            return Object.entries(query).every(([key, value]) => item[key] === value);
        });
    }

    /**
     * البحث عن عنصر واحد
     */
    findOne(collection, query) {
        const results = this.find(collection, query);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * البحث بالمعرف
     */
    findById(collection, id) {
        return this.findOne(collection, { id });
    }

    /**
     * عدد العناصر
     */
    count(collection, query = {}) {
        return this.find(collection, query).length;
    }

    /**
     * إحصائيات
     */
    getStats() {
        const stats = {};
        for (const [key, data] of this.cache.entries()) {
            stats[key] = Array.isArray(data) ? data.length : 1;
        }
        return stats;
    }
}

// إنشاء نسخة واحدة
const database = new Database();

module.exports = database;
