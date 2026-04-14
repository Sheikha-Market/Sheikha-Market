/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  👤 نموذج المستخدم
 *  User Model
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const database = require('../config/database');
const config = require('../config/config');

class User {
    constructor(data = {}) {
        this.id = data.id || uuid();
        this.name = data.name || '';
        this.email = data.email || '';
        this.password = data.password || null;
        this.phone = data.phone || null;
        this.role = data.role || 'user'; // user, admin, company, trader
        this.status = data.status || 'active'; // active, inactive, suspended
        this.avatar = data.avatar || null;
        this.companyId = data.companyId || null;
        this.permissions = data.permissions || [];
        this.preferences = data.preferences || {};
        this.culturalIdentity = data.culturalIdentity || {
            origin: null,          // arab | ajam | mixed | other
            ajamPeople: null,      // persian | turkish | urdu | amazigh | ...
            tribe: null,           // معرّف القبيلة من cultural-identity-db
            tribeName: null,       // اسم القبيلة بحرية
            family: null,          // معرّف العائلة التجارية من cultural-identity-db
            familyName: null,      // اسم العائلة بحرية
            languages: [],         // ['ar','en','fa',...]
            nationality: null,     // رمز الجنسية أو البلد
            region: null           // المنطقة الجغرافية
        };
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastLogin = data.lastLogin || null;
    }

    // ─── تشفير كلمة المرور ────────────────────────────────────────────────────
    static hashPassword(password) {
        return crypto
            .createHash('sha256')
            .update(password + config.security.jwt.secret)
            .digest('hex');
    }

    // ─── التحقق من كلمة المرور ────────────────────────────────────────────────
    verifyPassword(password) {
        return this.password === User.hashPassword(password);
    }

    // ─── الحصول على البيانات الآمنة (بدون كلمة المرور) ──────────────────────────
    toSafeObject() {
        const { password, ...safeData } = this;
        return safeData;
    }

    // ─── حفظ المستخدم ─────────────────────────────────────────────────────────
    save() {
        this.updatedAt = new Date().toISOString();
        const users = database.read('users') || [];
        const index = users.findIndex(u => u.id === this.id);

        if (index >= 0) {
            users[index] = this;
        } else {
            users.push(this);
        }

        database.write('users', users);
        return this;
    }

    // ─── البحث عن مستخدم بالمعرف ──────────────────────────────────────────────
    static findById(id) {
        const users = database.read('users') || [];
        const data = users.find(u => u.id === id);
        return data ? new User(data) : null;
    }

    // ─── البحث عن مستخدم بالبريد ──────────────────────────────────────────────
    static findByEmail(email) {
        const users = database.read('users') || [];
        const data = users.find(u => u.email === email);
        return data ? new User(data) : null;
    }

    // ─── البحث عن مستخدمين ────────────────────────────────────────────────────
    static find(query = {}) {
        const users = database.read('users') || [];
        let results = users;

        if (Object.keys(query).length > 0) {
            results = users.filter(u => {
                return Object.entries(query).every(([key, value]) => u[key] === value);
            });
        }

        return results.map(data => new User(data));
    }

    // ─── إنشاء مستخدم جديد ────────────────────────────────────────────────────
    static create(data) {
        const user = new User(data);
        if (data.password) {
            user.password = User.hashPassword(data.password);
        }
        return user.save();
    }

    // ─── حذف مستخدم ───────────────────────────────────────────────────────────
    static delete(id) {
        const users = database.read('users') || [];
        const index = users.findIndex(u => u.id === id);
        
        if (index >= 0) {
            users.splice(index, 1);
            database.write('users', users);
            return true;
        }
        return false;
    }

    // ─── عدد المستخدمين ───────────────────────────────────────────────────────
    static count(query = {}) {
        return User.find(query).length;
    }

    // ─── التحقق من الصلاحية ───────────────────────────────────────────────────
    hasPermission(permission) {
        if (this.role === 'admin') return true;
        return this.permissions.includes(permission);
    }

    // ─── تحديث آخر تسجيل دخول ─────────────────────────────────────────────────
    updateLastLogin() {
        this.lastLogin = new Date().toISOString();
        return this.save();
    }
}

module.exports = User;
