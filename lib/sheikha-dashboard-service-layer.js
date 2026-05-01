'use strict';

/**
 * طبقة خدمة موحدة للوحات التحكم
 * توحيد البيانات + الصلاحيات + الفحص الشرعي الأساسي.
 */
class SheikhaDashboardServiceLayer {
    constructor(deps = {}) {
        this.getUsers = deps.getUsers || (() => []);
        this.getTraders = deps.getTraders || (() => []);
        this.getListings = deps.getListings || (() => []);
        this.getOrders = deps.getOrders || (() => []);
        this.getContainers = deps.getContainers || (() => []);
    }

    normalizeDashboardType(type, role) {
        const roleToType = {
            admin: 'admin',
            owner: 'admin',
            gov: 'admin',
            company: 'company',
            user: 'user'
        };
        const normalizedType = String(type || '').trim().toLowerCase();
        if (['admin', 'company', 'user'].includes(normalizedType)) {
            return normalizedType;
        }
        return roleToType[String(role || 'user').trim().toLowerCase()] || 'user';
    }

    buildRoleCapabilities(role) {
        const key = String(role || 'user').trim().toLowerCase();
        const matrix = {
            owner: ['dashboard:all', 'users:manage', 'security:manage', 'finance:view', 'sharia:audit'],
            admin: ['dashboard:all', 'users:manage', 'security:view', 'finance:view', 'sharia:audit'],
            gov: ['dashboard:admin_read', 'reports:view', 'compliance:view', 'sharia:audit'],
            company: ['dashboard:company', 'orders:manage', 'contracts:manage', 'finance:view_own'],
            user: ['dashboard:user', 'orders:view_own', 'market:browse']
        };
        return matrix[key] || matrix.user;
    }

    evaluateShariaCompliance(input = '') {
        const text = String(input || '').toLowerCase();
        const blockedTerms = [
            'ربا',
            'فائدة ربوية',
            'قرض بفائدة',
            'usury',
            'interest loan',
            'غرر',
            'قمار',
            'نجش',
            'احتكار',
            'غش'
        ];
        const violation = blockedTerms.find((term) => text.includes(term));
        if (violation) {
            return {
                allowed: false,
                code: 'SHARIA_POLICY_BLOCKED',
                message: 'تم إيقاف الطلب: يحتوي على صيغة مخالفة للضوابط الشرعية.',
                violation
            };
        }
        return {
            allowed: true,
            code: 'SHARIA_OK',
            message: 'الطلب منضبط ضمن الضوابط الشرعية الأساسية.'
        };
    }

    buildShariaPolicyProfile() {
        return {
            mode: 'block_and_warn',
            source: 'quran_and_sunnah',
            creed: 'أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله',
            principles: [
                'لا ربا',
                'لا غرر',
                'لا غش',
                'لا احتكار',
                'لا نجش'
            ],
            controls: [
                'منع الطلبات المخالفة',
                'تنبيه تشغيلي عند الرفض',
                'تدقيق الحدث وإتاحته للمراجعة'
            ]
        };
    }

    getShariaGovernanceStatus(role = 'user') {
        return {
            role: String(role || 'user').toLowerCase(),
            policy: this.buildShariaPolicyProfile(),
            capabilities: this.buildRoleCapabilities(role),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * واجهات بيانات صريحة لكل لوحة (توحيد المعمارية)
     */
    getAdminDashboardData(user) {
        return this.getUnifiedDashboard({ type: 'admin', user, intentText: '' });
    }
    getUserDashboardData(user) {
        return this.getUnifiedDashboard({ type: 'user', user, intentText: '' });
    }
    getCompanyDashboardData(user) {
        return this.getUnifiedDashboard({ type: 'company', user, intentText: '' });
    }

    /**
     * مصفوفة ربط الأقسام بالقدرات (لتفعيل/إخفاء ديناميكي)
     */
    getSectionCapabilityMap() {
        return {
            admin: {
                dashboard: 'dashboard:all',
                roles: 'users:manage',
                users: 'users:manage',
                market: 'dashboard:all',
                finance: 'finance:view',
                security: 'security:view',
                reports: 'reports:view',
                settings: 'dashboard:all'
            },
            user: {
                dashboard: 'dashboard:user',
                orders: 'orders:view_own',
                market: 'market:browse',
                profile: 'dashboard:user'
            },
            company: {
                overview: 'dashboard:company',
                products: 'orders:manage',
                sales: 'orders:manage',
                procurement: 'orders:manage',
                contracts: 'contracts:manage',
                finance: 'finance:view_own',
                logistics: 'orders:manage'
            }
        };
    }

    canAccessSection(role, dashboardType, sectionId) {
        const map = this.getSectionCapabilityMap();
        const sections = map[dashboardType] || map.user;
        const requiredCap = sections[sectionId];
        if (!requiredCap) return true;
        const caps = this.buildRoleCapabilities(role);
        return caps.includes(requiredCap) || caps.includes('dashboard:all');
    }

    buildGrowthFruitProfile(summary = {}) {
        const users = Number(summary.totalUsers || 0);
        const traders = Number(summary.totalTraders || 0);
        const listings = Number(summary.totalListings || 0);
        const orders = Number(summary.totalOrders || 0);
        const containers = Number(summary.totalContainers || 0);

        const growthScore = Math.min(100, Math.round((users * 0.3) + (traders * 0.7)));
        const fruitScore = Math.min(100, Math.round((listings * 0.4) + (orders * 0.6)));
        const impactScore = Math.min(100, Math.round((orders * 0.5) + (traders * 0.5)));
        const tasteScore = Math.min(100, Math.round((containers * 0.2) + (orders * 0.8)));
        const summitIndex = Math.round((growthScore + fruitScore + impactScore + tasteScore) / 4);

        return {
            growth: {
                score: growthScore,
                description: 'نمو المستخدمين والشركات والتشغيل'
            },
            fruits: {
                score: fruitScore,
                description: 'ثمار المنظومة عبر العروض والطلبات المنجزة'
            },
            impact: {
                score: impactScore,
                description: 'الأثر التشغيلي والسوقي'
            },
            taste: {
                score: tasteScore,
                description: 'جودة التجربة وسلاسة التنفيذ'
            },
            summitIndex,
            timestamp: new Date().toISOString()
        };
    }

    getSummitStatus() {
        const summary = {
            totalUsers: this.getUsers().length,
            totalTraders: this.getTraders().length,
            totalListings: this.getListings().filter((item) => item.status !== 'deleted').length,
            totalOrders: this.getOrders().length,
            totalContainers: this.getContainers().length
        };
        const profile = this.buildGrowthFruitProfile(summary);
        return {
            target: 'sheikha_global_impact',
            mode: 'quran_sunnah_guided_growth',
            summary,
            profile
        };
    }

    buildSystemIndices(context = {}) {
        const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value || 0))));

        const compute = context.compute || {};
        const global = context.global || {};
        const governance = context.governance || {};
        const research = context.research || {};
        const sharia = context.sharia || {};

        const computePowerIndex = clamp(
            (Number(compute.nodeHealthScore || 75) * 0.35) +
            (Number(compute.throughputScore || 70) * 0.30) +
            (Number(compute.queueHealthScore || 70) * 0.20) +
            (Number(compute.reliabilityScore || 70) * 0.15)
        );

        const globalReachIndex = clamp(
            (Number(global.multiRegionScore || 40) * 0.40) +
            (Number(global.uptimeScore || 85) * 0.35) +
            (Number(global.latencyScore || 70) * 0.25)
        );

        const governanceComplianceIndex = clamp(
            (Number(governance.policyCoverageScore || 80) * 0.35) +
            (Number(governance.auditScore || 75) * 0.30) +
            (Number(governance.accessControlScore || 80) * 0.20) +
            (Number(governance.drScore || 65) * 0.15)
        );

        const researchInnovationIndex = clamp(
            (Number(research.pipelineScore || 70) * 0.40) +
            (Number(research.experimentScore || 65) * 0.35) +
            (Number(research.productionAdoptionScore || 60) * 0.25)
        );

        const shariaComplianceIndex = clamp(
            (Number(sharia.guardCoverageScore || 90) * 0.45) +
            (Number(sharia.auditTraceScore || 85) * 0.35) +
            (Number(sharia.violationControlScore || 80) * 0.20)
        );

        const sheikhaSummitIndex = clamp(
            (computePowerIndex * 0.20) +
            (globalReachIndex * 0.20) +
            (governanceComplianceIndex * 0.20) +
            (researchInnovationIndex * 0.15) +
            (shariaComplianceIndex * 0.25)
        );

        return {
            computePowerIndex,
            globalReachIndex,
            governanceComplianceIndex,
            researchInnovationIndex,
            shariaComplianceIndex,
            sheikhaSummitIndex,
            timestamp: new Date().toISOString()
        };
    }

    getSystemIndicesStatus(context = {}) {
        const indices = this.buildSystemIndices(context);
        return {
            mode: 'standard_and_sharia_mapped',
            mapping: {
                justiceAndTransparency: 'GovernanceComplianceIndex',
                rightsPreservation: 'GovernanceComplianceIndex',
                noHarm: 'ComputePowerIndex + GlobalReachIndex + GovernanceComplianceIndex',
                honestyAndIntegrity: 'ShariaComplianceIndex + auditability',
                stewardshipAndReform: 'ResearchInnovationIndex + sustainability_readiness'
            },
            indices
        };
    }

    clampScore(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, Math.round(n)));
    }

    /**
     * مؤشرات القمة القياسية:
     * ComputePowerIndex, GlobalReachIndex, GovernanceComplianceIndex,
     * ResearchInnovationIndex, ShariaComplianceIndex + SheikhaSummitIndex.
     */
    buildSummitIndices(input = {}) {
        const summary = Object.assign({
            totalUsers: 0,
            totalTraders: 0,
            totalListings: 0,
            totalOrders: 0,
            totalContainers: 0
        }, input.summary || {});

        const activeRegions = Number(input.activeRegions || 0);
        const auditEvents = Number(input.auditEvents || 0);
        const governanceIncidents = Number(input.governanceIncidents || 0);
        const blockedShariaRequests = Number(input.blockedShariaRequests || 0);
        const totalShariaCheckedRequests = Number(input.totalShariaCheckedRequests || 0);
        const innovationSignals = Number(input.innovationSignals || 0);
        const uptimeHours = Number(input.uptimeHours || 0);
        const accelerationEnabled = Boolean(input.accelerationEnabled);
        const multiRegionReady = Boolean(input.multiRegionReady);

        const computeBase = 25
            + Math.min(30, summary.totalOrders * 0.8)
            + Math.min(20, summary.totalListings * 0.6)
            + Math.min(15, uptimeHours * 0.15)
            + (accelerationEnabled ? 10 : 0);
        const computePowerIndex = this.clampScore(computeBase);

        const globalBase = 20
            + Math.min(45, activeRegions * 7)
            + (multiRegionReady ? 20 : 0)
            + Math.min(15, summary.totalUsers * 0.2);
        const globalReachIndex = this.clampScore(globalBase);

        const governancePenalty = Math.min(40, governanceIncidents * 5);
        const governanceBase = 85
            + Math.min(10, auditEvents * 0.01)
            - governancePenalty;
        const governanceComplianceIndex = this.clampScore(governanceBase);

        const researchBase = 30
            + Math.min(45, innovationSignals * 8)
            + Math.min(25, summary.totalTraders * 0.5);
        const researchInnovationIndex = this.clampScore(researchBase);

        const shariaRatio = totalShariaCheckedRequests > 0
            ? ((totalShariaCheckedRequests - blockedShariaRequests) / totalShariaCheckedRequests) * 100
            : 100;
        const shariaComplianceIndex = this.clampScore(shariaRatio);

        const weights = {
            computePowerIndex: 0.2,
            globalReachIndex: 0.2,
            governanceComplianceIndex: 0.2,
            researchInnovationIndex: 0.2,
            shariaComplianceIndex: 0.2
        };

        const sheikhaSummitIndex = this.clampScore(
            (computePowerIndex * weights.computePowerIndex)
            + (globalReachIndex * weights.globalReachIndex)
            + (governanceComplianceIndex * weights.governanceComplianceIndex)
            + (researchInnovationIndex * weights.researchInnovationIndex)
            + (shariaComplianceIndex * weights.shariaComplianceIndex)
        );

        return {
            ComputePowerIndex: computePowerIndex,
            GlobalReachIndex: globalReachIndex,
            GovernanceComplianceIndex: governanceComplianceIndex,
            ResearchInnovationIndex: researchInnovationIndex,
            ShariaComplianceIndex: shariaComplianceIndex,
            SheikhaSummitIndex: sheikhaSummitIndex,
            weights,
            context: {
                summary,
                activeRegions,
                auditEvents,
                governanceIncidents,
                blockedShariaRequests,
                totalShariaCheckedRequests,
                innovationSignals,
                uptimeHours,
                accelerationEnabled,
                multiRegionReady
            },
            timestamp: new Date().toISOString()
        };
    }

    getUnifiedDashboard({ type, user, intentText }) {
        const role = String(user?.role || 'user').toLowerCase();
        const normalizedType = this.normalizeDashboardType(type, role);

        const shariaCheck = this.evaluateShariaCompliance(intentText || normalizedType);
        if (!shariaCheck.allowed) {
            const err = new Error(shariaCheck.message);
            err.statusCode = 422;
            err.code = shariaCheck.code;
            err.violation = shariaCheck.violation;
            throw err;
        }

        if (normalizedType === 'admin' && !['admin', 'owner', 'gov'].includes(role)) {
            const err = new Error('غير مصرح لك بالوصول إلى لوحة الإدارة.');
            err.statusCode = 403;
            err.code = 'FORBIDDEN_DASHBOARD_ADMIN';
            throw err;
        }

        if (normalizedType === 'company' && !['company', 'admin', 'owner'].includes(role)) {
            const err = new Error('غير مصرح لك بالوصول إلى لوحة الشركة.');
            err.statusCode = 403;
            err.code = 'FORBIDDEN_DASHBOARD_COMPANY';
            throw err;
        }

        const users = this.getUsers();
        const traders = this.getTraders();
        const listings = this.getListings().filter((item) => item.status !== 'deleted');
        const orders = this.getOrders();
        const containers = this.getContainers();

        const profile = users.find((u) => u.id === user?.id) || {};
        const now = new Date().toISOString();

        const data = {
            dashboardType: normalizedType,
            userRole: role,
            user: {
                id: user?.id || null,
                name: profile.name || user?.name || 'مستخدم شيخة',
                organizationProfile: profile.organizationProfile || null
            },
            capabilities: this.buildRoleCapabilities(role),
            sectionCapabilityMap: this.getSectionCapabilityMap()[normalizedType] || {},
            summary: {
                totalUsers: users.length,
                totalTraders: traders.length,
                totalListings: listings.length,
                totalOrders: orders.length,
                totalContainers: containers.length
            },
            growthAndImpact: this.buildGrowthFruitProfile({
                totalUsers: users.length,
                totalTraders: traders.length,
                totalListings: listings.length,
                totalOrders: orders.length,
                totalContainers: containers.length
            }),
            companyProfile: normalizedType === 'company' ? {
                nameAr: profile.companyName || profile.storeName || profile.name || 'شركة شيخة',
                companyId: profile.id || user?.id || null,
                vision: 'الريادة في تجارة المعادن والسكراب بأمانة وامتثال.',
                mission: 'تسعير عادل وتداول شفاف بمنهج الكتاب والسنة.'
            } : null,
            sharia: Object.assign({}, this.buildShariaPolicyProfile(), { check: shariaCheck }),
            timestamp: now
        };

        return data;
    }
}

module.exports = SheikhaDashboardServiceLayer;
