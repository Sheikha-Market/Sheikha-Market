/**
 * 🔗 نظام تكامل النظام الإداري مع الخادم الرئيسي (Server Integration)
 * بسم الله الرحمن الرحيم
 */

const express = require('express');
const router = express.Router();
const ComprehensiveAdministrativeManagementSystem = require('./comprehensive-administrative-management-system');

// ═══════════════════════════════════════════════════════════════════════
// تهيئة نظام الإدارة المتكاملة
// ═══════════════════════════════════════════════════════════════════════

const camsInstance = new ComprehensiveAdministrativeManagementSystem();

// ═══════════════════════════════════════════════════════════════════════
// Middleware للتحقق من الصلاحيات
// ═══════════════════════════════════════════════════════════════════════

const requireRole = requiredRoles => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !requiredRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'الصلاحيات غير كافية',
                timestamp: new Date().toISOString()
            });
        }
        next();
    };
};

// ═══════════════════════════════════════════════════════════════════════
// نهايات API لإدارة الأدوار والصلاحيات
// ═══════════════════════════════════════════════════════════════════════

/**
 * الحصول على جميع الأدوار والصلاحيات
 */
router.get('/api/admin/roles', requireRole(['admin']), (req, res) => {
    try {
        const roles = camsInstance.rolesAndPermissions;
        return res.json({
            success: true,
            data: roles,
            totalRoles: Object.keys(roles.roles).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على الأدوار',
            error: error.message
        });
    }
});

/**
 * الحصول على تفاصيل دور معين
 */
router.get('/api/admin/roles/:roleId', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { roleId } = req.params;
        const roles = camsInstance.rolesAndPermissions.roles;
        const role = Object.values(roles).find(
            r => r.id === roleId || Object.keys(roles)[Object.values(roles).indexOf(r)] === roleId
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'الدور غير موجود'
            });
        }

        return res.json({
            success: true,
            data: role,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على تفاصيل الدور'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API لإدارة المشاريع
// ═══════════════════════════════════════════════════════════════════════

/**
 * إنشاء مشروع جديد
 */
router.post('/api/projects', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { name, description, manager, team, budget, timeline } = req.body;

        if (!name || !manager) {
            return res.status(400).json({
                success: false,
                message: 'البيانات المطلوبة ناقصة'
            });
        }

        const project = camsInstance.createProject({
            name,
            description,
            manager,
            team,
            budget,
            timeline
        });

        return res.status(201).json({
            success: true,
            data: project,
            message: 'تم إنشاء المشروع بنجاح',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المشروع'
        });
    }
});

/**
 * الحصول على جميع المشاريع
 */
router.get('/api/projects', requireRole(['admin', 'manager', 'team_lead']), (req, res) => {
    try {
        const projects = camsInstance.projectManagementSystem.projects;
        return res.json({
            success: true,
            data: Object.values(projects),
            totalProjects: Object.keys(projects).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على المشاريع'
        });
    }
});

/**
 * الحصول على تفاصيل مشروع معين
 */
router.get(
    '/api/projects/:projectId',
    requireRole(['admin', 'manager', 'team_lead']),
    (req, res) => {
        try {
            const { projectId } = req.params;
            const project = camsInstance.projectManagementSystem.projects[projectId];

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'المشروع غير موجود'
                });
            }

            return res.json({
                success: true,
                data: project,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'خطأ في الحصول على تفاصيل المشروع'
            });
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// نهايات API لإدارة الفريق
// ═══════════════════════════════════════════════════════════════════════

/**
 * إنشاء فريق جديد
 */
router.post('/api/teams', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { name, department, lead, members } = req.body;

        if (!name || !lead) {
            return res.status(400).json({
                success: false,
                message: 'البيانات المطلوبة ناقصة'
            });
        }

        const team = camsInstance.createTeam({
            name,
            department,
            lead,
            members
        });

        return res.status(201).json({
            success: true,
            data: team,
            message: 'تم إنشاء الفريق بنجاح',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الفريق'
        });
    }
});

/**
 * الحصول على جميع الفريق
 */
router.get('/api/teams', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const teams = camsInstance.teamManagementSystem.teams;
        return res.json({
            success: true,
            data: Object.values(teams),
            totalTeams: Object.keys(teams).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على الفريق'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API لتقييم الأداء
// ═══════════════════════════════════════════════════════════════════════

/**
 * تقييم أداء الموظف
 */
router.post(
    '/api/performance/evaluate/:employeeId',
    requireRole(['admin', 'manager']),
    (req, res) => {
        try {
            const { employeeId } = req.params;
            const evaluation = camsInstance.evaluatePerformance(employeeId);

            return res.json({
                success: true,
                data: evaluation,
                message: 'تم تقييم الأداء بنجاح',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'خطأ في تقييم الأداء'
            });
        }
    }
);

/**
 * الحصول على مؤشرات الأداء الرئيسية
 */
router.get('/api/performance/kpis', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const kpis = camsInstance.performanceTrackingSystem.kpis;
        return res.json({
            success: true,
            data: kpis,
            totalKPIs: Object.keys(kpis).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على مؤشرات الأداء'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API للتقارير
// ═══════════════════════════════════════════════════════════════════════

/**
 * إنشاء تقرير
 */
router.post('/api/reports', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { reportType, data } = req.body;

        if (!reportType || !data) {
            return res.status(400).json({
                success: false,
                message: 'البيانات المطلوبة ناقصة'
            });
        }

        const report = camsInstance.generateReport(reportType, data);

        return res.json({
            success: true,
            data: report,
            message: 'تم إنشاء التقرير بنجاح',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء التقرير'
        });
    }
});

/**
 * الحصول على أنواع التقارير المتاحة
 */
router.get('/api/reports/types', requireRole(['admin', 'manager', 'team_lead']), (req, res) => {
    try {
        const reportTypes = camsInstance.reportingAnalyticsSystem.reportTypes;
        return res.json({
            success: true,
            data: reportTypes,
            totalTypes: Object.keys(reportTypes).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على أنواع التقارير'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API لإدارة الموارد
// ═══════════════════════════════════════════════════════════════════════

/**
 * الحصول على نظرة عامة على الموارد
 */
router.get('/api/resources', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const resources = camsInstance.resourceManagementSystem.resources;
        const budgetPlanning = camsInstance.resourceManagementSystem.budgetPlanning;

        return res.json({
            success: true,
            data: {
                resources,
                budgetPlanning
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على الموارد'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API لضمان الجودة
// ═══════════════════════════════════════════════════════════════════════

/**
 * الحصول على معايير الجودة
 */
router.get('/api/quality/standards', requireRole(['admin', 'manager']), (req, res) => {
    try {
        const standards = camsInstance.qualityManagementSystem.qualityStandards;
        return res.json({
            success: true,
            data: standards,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على معايير الجودة'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API للامتثال والمراقبة
// ═══════════════════════════════════════════════════════════════════════

/**
 * الحصول على حالة الامتثال
 */
router.get('/api/compliance/status', requireRole(['admin']), (req, res) => {
    try {
        const compliance = camsInstance.complianceMonitoringSystem;
        return res.json({
            success: true,
            data: compliance,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على حالة الامتثال'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهايات API للأساس الإسلامي
// ═══════════════════════════════════════════════════════════════════════

/**
 * الحصول على القيم الإسلامية الأساسية
 */
router.get('/api/islamic/values', (req, res) => {
    try {
        const principles = camsInstance.islamicPrinciples;
        return res.json({
            success: true,
            data: principles,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على القيم الإسلامية'
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// نهاية API لحالة النظام الشامل
// ═══════════════════════════════════════════════════════════════════════

/**
 * الحصول على حالة النظام الشامل
 */
router.get('/api/admin/system-status', requireRole(['admin']), (req, res) => {
    try {
        const systemStatus = camsInstance.getComprehensiveReport();
        return res.json({
            success: true,
            data: systemStatus,
            message: 'النظام يعمل بكفاءة ممتازة',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على حالة النظام'
        });
    }
});

module.exports = router;
