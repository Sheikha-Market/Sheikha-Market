/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏢 نموذج الشركة
 *  Company Model
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { v4: uuid } = require('uuid');
const database = require('../config/database');

class Company {
    constructor(data = {}) {
        this.id = data.id || uuid();
        this.name = data.name || '';
        this.nameAr = data.nameAr || data.name || '';
        this.nameEn = data.nameEn || '';
        this.crNumber = data.crNumber || null;
        this.vatNumber = data.vatNumber || null;
        this.sector = data.sector || null;
        this.activity = data.activity || '';
        this.size = data.size || 'small'; // small, medium, large, enterprise
        this.type = data.type || 'private'; // private, public, government
        
        // بيانات الاتصال
        this.contact = data.contact || {
            email: null,
            phone: null,
            website: null,
            address: null,
            city: null,
            country: 'السعودية'
        };

        // البيانات المالية
        this.financial = data.financial || {
            capital: null,
            revenue: null,
            employees: null
        };

        // المنتجات والخدمات
        this.products = data.products || [];
        this.services = data.services || [];

        // التقنيات والفجوات
        this.technologies = data.technologies || [];
        this.gaps = data.gaps || [];
        this.opportunities = data.opportunities || [];

        // سلسلة التوريد
        this.supplyChain = data.supplyChain || {
            suppliers: [],
            customers: [],
            logistics: []
        };

        // تحليل SWOT
        this.swot = data.swot || {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
        };

        // حالة التسجيل
        this.status = data.status || 'pending'; // pending, active, inactive, suspended
        this.verified = data.verified || false;
        this.subscriptionPlan = data.subscriptionPlan || 'free';

        // المستخدمون المرتبطون
        this.ownerId = data.ownerId || null;
        this.adminIds = data.adminIds || [];

        // البيانات الوصفية
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // ─── حفظ الشركة ───────────────────────────────────────────────────────────
    save() {
        this.updatedAt = new Date().toISOString();
        let companies = database.read('companies') || [];
        if (!Array.isArray(companies)) companies = Object.values(companies);

        const index = companies.findIndex(c => c.id === this.id);

        if (index >= 0) {
            companies[index] = this;
        } else {
            companies.push(this);
        }

        database.write('companies', companies);
        return this;
    }

    // ─── البحث عن شركة بالمعرف ────────────────────────────────────────────────
    static findById(id) {
        let companies = database.read('companies') || [];
        if (!Array.isArray(companies)) companies = Object.values(companies);
        
        const data = companies.find(c => c.id === id);
        return data ? new Company(data) : null;
    }

    // ─── البحث عن شركة بالسجل التجاري ─────────────────────────────────────────
    static findByCR(crNumber) {
        let companies = database.read('companies') || [];
        if (!Array.isArray(companies)) companies = Object.values(companies);
        
        const data = companies.find(c => c.crNumber === crNumber);
        return data ? new Company(data) : null;
    }

    // ─── البحث عن شركات ───────────────────────────────────────────────────────
    static find(query = {}) {
        let companies = database.read('companies') || [];
        if (!Array.isArray(companies)) companies = Object.values(companies);

        let results = companies;

        if (Object.keys(query).length > 0) {
            results = companies.filter(c => {
                return Object.entries(query).every(([key, value]) => c[key] === value);
            });
        }

        return results.map(data => new Company(data));
    }

    // ─── البحث حسب القطاع ─────────────────────────────────────────────────────
    static findBySector(sector) {
        return Company.find({ sector });
    }

    // ─── إنشاء شركة جديدة ─────────────────────────────────────────────────────
    static create(data) {
        const company = new Company(data);
        return company.save();
    }

    // ─── حذف شركة ─────────────────────────────────────────────────────────────
    static delete(id) {
        let companies = database.read('companies') || [];
        if (!Array.isArray(companies)) companies = Object.values(companies);
        
        const index = companies.findIndex(c => c.id === id);

        if (index >= 0) {
            companies.splice(index, 1);
            database.write('companies', companies);
            return true;
        }
        return false;
    }

    // ─── عدد الشركات ──────────────────────────────────────────────────────────
    static count(query = {}) {
        return Company.find(query).length;
    }

    // ─── تحليل الفجوات ────────────────────────────────────────────────────────
    analyzeGaps() {
        const gaps = [];

        // فحص التقنيات
        if (this.technologies.length < 3) {
            gaps.push({
                type: 'technology',
                description: 'عدد قليل من التقنيات المستخدمة',
                recommendation: 'دراسة تبني تقنيات حديثة'
            });
        }

        // فحص سلسلة التوريد
        if (this.supplyChain.suppliers.length < 2) {
            gaps.push({
                type: 'supply-chain',
                description: 'اعتماد على مورد واحد',
                recommendation: 'تنويع قاعدة الموردين'
            });
        }

        // فحص المنتجات
        if (this.products.length < 2) {
            gaps.push({
                type: 'products',
                description: 'تركز على منتج واحد',
                recommendation: 'التوسع في خط المنتجات'
            });
        }

        this.gaps = gaps;
        return gaps;
    }

    // ─── تحديث SWOT ───────────────────────────────────────────────────────────
    updateSWOT(swot) {
        this.swot = { ...this.swot, ...swot };
        return this.save();
    }

    // ─── الحصول على الملخص ────────────────────────────────────────────────────
    getSummary() {
        return {
            id: this.id,
            name: this.nameAr || this.name,
            sector: this.sector,
            status: this.status,
            verified: this.verified,
            productsCount: this.products.length,
            gapsCount: this.gaps.length
        };
    }
}

module.exports = Company;
