/**
 * 🕋 Sheikha Execution Orchestrator
 * محرك القرار التنفيذي - يقرر ويعمل
 * 
 * المسؤولية:
 * - قراءة حالة النظام من جميع المراقبين
 * - تحليل الحالة وإنشاء قرار تنفيذي
 * - تنفيذ الإجراء المناسب
 * - تسجيل كل إجراء والنتيجة
 */

const fs = require('fs').promises;
const path = require('path');

const ORCHESTRATOR_LOG_FILE = path.join(__dirname, '../data/execution-orchestrator-log.json');

// الحالات المسموحة
const EXECUTION_MODES = {
    NORMAL_PRODUCTION: 'NORMAL_PRODUCTION',      // الإنتاج العادي
    BOOST_SUPPLY: 'BOOST_SUPPLY',                // تسريع التوريد
    SAFE_MODE: 'SAFE_MODE',                      // وضع آمن
    FREEZE_DEPLOY: 'FREEZE_DEPLOY',              // تجميد النشرات
    MAINTENANCE: 'MAINTENANCE'                   // صيانة
};

// الإجراءات الممكنة
const ACTIONS = {
    ACTIVATE_PM1: 'ACTIVATE_PM1',                // تفعيل إدارة الطلبات
    ACTIVATE_PM2: 'ACTIVATE_PM2',                // تفعيل إدارة المبيعات
    ACTIVATE_PM3: 'ACTIVATE_PM3',                // تفعيل إدارة التوريد
    ACTIVATE_PM4: 'ACTIVATE_PM4',                // تفعيل إدارة الإنتاج
    ACTIVATE_PM5: 'ACTIVATE_PM5',                // تفعيل إدارة الجودة
    LOCK_SENSITIVE_ROUTES: 'LOCK_SENSITIVE_ROUTES',
    REQUIRE_GIT_SNAPSHOT: 'REQUIRE_GIT_SNAPSHOT',
    ENABLE_AUTO_SCALING: 'ENABLE_AUTO_SCALING',
    TRIGGER_ALERTS: 'TRIGGER_ALERTS',
    INITIATE_SAFE_MODE: 'INITIATE_SAFE_MODE'
};

class ExecutionOrchestrator {
    constructor() {
        this.currentMode = EXECUTION_MODES.NORMAL_PRODUCTION;
        this.executionLog = [];
        this.lastDecision = null;
        this.activeActions = [];
    }

    /**
     * قراءة الحالة من جميع المصادر
     * إذا لم تُمرَّر stateData، يقرأ من ملفات البيانات الحقيقية
     */
    async readSystemState(stateData = {}) {
        try {
            // قراءة من ملفات البيانات الحقيقية إذا لم تُمرَّر بيانات صريحة
            let orders = stateData.orders;
            let supply = stateData.supply;
            let contracts = stateData.contracts;

            if (orders === undefined) {
                try {
                    const ordersFile = path.join(__dirname, '../data/orders.json');
                    const raw = await fs.readFile(ordersFile, 'utf8');
                    const arr = JSON.parse(raw);
                    // مجموع الكميات المطلوبة في الطلبات
                    orders = Array.isArray(arr) ? arr.reduce((s, item) => s + (item.quantity || 0), 0) : 0;
                } catch { orders = 0; }
            }

            if (supply === undefined) {
                try {
                    const supplyFile = path.join(__dirname, '../data/supply.json');
                    const raw = await fs.readFile(supplyFile, 'utf8');
                    const arr = JSON.parse(raw);
                    // مجموع الكميات المتاحة
                    supply = Array.isArray(arr) ? arr.reduce((s, item) => s + (item.quantity || 0), 0) : 0;
                } catch { supply = 0; }
            }

            if (contracts === undefined) {
                try {
                    const contractsFile = path.join(__dirname, '../data/contracts.json');
                    const raw = await fs.readFile(contractsFile, 'utf8');
                    const arr = JSON.parse(raw);
                    contracts = Array.isArray(arr) ? arr.length : 0;
                } catch { contracts = 0; }
            }

            const alerts = stateData.alerts || [];
            const gitDirty = stateData.gitDirty || 0;
            const users = stateData.users || 0;
            const traders = stateData.traders || 0;

            return {
                timestamp: new Date().toISOString(),
                alerts,
                alertCount: alerts.length,
                gitDirty,
                orders,
                supply,
                contracts,
                users,
                traders,
                supplyGap: Math.max(0, orders - supply)
            };
        } catch (error) {
            console.error('❌ خطأ في قراءة حالة النظام:', error);
            return null;
        }
    }

    /**
     * تحليل الحالة وتحديد الإجراء
     * قاعدة القرار الذكية
     */
    analyzeAndDecide(systemState) {
        if (!systemState) return EXECUTION_MODES.MAINTENANCE;

        const { alertCount, gitDirty, orders, supply, supplyGap, contracts } = systemState;

        let decision = {
            mode: EXECUTION_MODES.NORMAL_PRODUCTION,
            actions: [],
            reasoning: [],
            priority: 'normal',
            timestamp: new Date().toISOString()
        };

        // قاعدة 1: إذا كان هناك تنبيهات حرجة
        if (alertCount >= 2) {
            decision.mode = EXECUTION_MODES.SAFE_MODE;
            decision.priority = 'critical';
            decision.actions.push(
                ACTIONS.INITIATE_SAFE_MODE,
                ACTIONS.TRIGGER_ALERTS,
                ACTIONS.LOCK_SENSITIVE_ROUTES
            );
            decision.reasoning.push(`عدد التنبيهات الحرجة: ${alertCount} (الحد الأدنى: 2)`);
        }

        // قاعدة 2: إذا زاد عدد التعديلات المحلية
        if (gitDirty > 50 && !decision.actions.includes(ACTIONS.FREEZE_DEPLOY)) {
            decision.mode = EXECUTION_MODES.FREEZE_DEPLOY;
            decision.priority = 'high';
            decision.actions.push(
                ACTIONS.REQUIRE_GIT_SNAPSHOT,
                ACTIONS.LOCK_SENSITIVE_ROUTES
            );
            decision.reasoning.push(`عدد التعديلات المحلية عالي جداً: ${gitDirty}`);
        }

        // قاعدة 3: إذا زادت الطلبات عن التوريد بشكل كبير
        if (supplyGap > 10) {
            decision.mode = EXECUTION_MODES.BOOST_SUPPLY;
            decision.priority = 'high';
            decision.actions.push(
                ACTIONS.ACTIVATE_PM3,
                ACTIONS.ACTIVATE_PM4,
                ACTIONS.ENABLE_AUTO_SCALING
            );
            decision.reasoning.push(`فجوة التوريد كبيرة: ${supplyGap} طلب بدون توريد`);
        }

        // قاعدة 4: إذا زادت الطلبات والعقود
        if (orders > 0 && contracts > 0) {
            if (!decision.actions.includes(ACTIONS.ACTIVATE_PM2)) {
                decision.actions.push(ACTIONS.ACTIVATE_PM1, ACTIONS.ACTIVATE_PM2);
                decision.reasoning.push(`تفعيل PM1 وPM2: الطلبات=${orders}، العقود=${contracts}`);
            }
        }

        // إذا كانت الحالة مستقرة جداً
        if (alertCount === 0 && gitDirty < 10 && supplyGap === 0 && orders === 0) {
            decision.mode = EXECUTION_MODES.NORMAL_PRODUCTION;
            decision.reasoning.push('النظام في حالة استقرار كامل');
        }

        return decision;
    }

    /**
     * تنفيذ القرار الصادر
     */
    async executeDecision(decision) {
        const executionResult = {
            timestamp: new Date().toISOString(),
            decision: decision.mode,
            actions: [],
            executedAt: new Date().toISOString(),
            success: true
        };

        try {
            // تنفيذ كل إجراء
            for (const action of decision.actions) {
                const actionResult = await this.executeAction(action);
                executionResult.actions.push(actionResult);
            }

            // تسجيل القرار والتنفيذ
            this.lastDecision = decision;
            this.currentMode = decision.mode;
            this.activeActions = decision.actions;

            await this.logExecution(decision, executionResult);

            return executionResult;
        } catch (error) {
            console.error('❌ خطأ في تنفيذ القرار:', error);
            executionResult.success = false;
            executionResult.error = error.message;
            return executionResult;
        }
    }

    /**
     * تنفيذ إجراء واحد
     */
    async executeAction(action) {
        const result = {
            action,
            timestamp: new Date().toISOString(),
            status: 'executed'
        };

        switch (action) {
            case ACTIONS.ACTIVATE_PM1:
                result.message = 'تم تفعيل PM1 - إدارة الطلبات';
                console.log('✅ تفعيل PM1');
                break;

            case ACTIONS.ACTIVATE_PM2:
                result.message = 'تم تفعيل PM2 - إدارة المبيعات';
                console.log('✅ تفعيل PM2');
                break;

            case ACTIONS.ACTIVATE_PM3:
                result.message = 'تم تفعيل PM3 - إدارة التوريد';
                console.log('✅ تفعيل PM3');
                break;

            case ACTIONS.ACTIVATE_PM4:
                result.message = 'تم تفعيل PM4 - إدارة الإنتاج';
                console.log('✅ تفعيل PM4');
                break;

            case ACTIONS.LOCK_SENSITIVE_ROUTES:
                result.message = 'تم قفل المسارات الحساسة';
                console.log('🔒 قفل المسارات الحساسة');
                break;

            case ACTIONS.REQUIRE_GIT_SNAPSHOT:
                result.message = 'مطلوب snapshot من git قبل النشر';
                console.log('📸 مطلوب git snapshot');
                break;

            case ACTIONS.ENABLE_AUTO_SCALING:
                result.message = 'تم تفعيل التوسع الآلي';
                console.log('📈 تفعيل التوسع الآلي');
                break;

            case ACTIONS.TRIGGER_ALERTS:
                result.message = 'تم إطلاق التنبيهات';
                console.log('🚨 إطلاق التنبيهات');
                break;

            case ACTIONS.INITIATE_SAFE_MODE:
                result.message = 'تم تفعيل وضع الأمان';
                console.log('🛡️ تفعيل وضع الأمان');
                break;

            default:
                result.message = `إجراء غير معروف: ${action}`;
                result.status = 'unknown';
        }

        return result;
    }

    /**
     * تسجيل التنفيذ في السجل
     */
    async logExecution(decision, executionResult) {
        try {
            let logs = [];

            // قراءة السجل الحالي
            try {
                const content = await fs.readFile(ORCHESTRATOR_LOG_FILE, 'utf-8');
                logs = JSON.parse(content);
            } catch {
                logs = [];
            }

            // إضافة التنفيذ الجديد
            logs.push({
                timestamp: new Date().toISOString(),
                decision: decision.mode,
                reasoning: decision.reasoning,
                actions: decision.actions,
                executionResult: executionResult.success ? 'success' : 'failed',
                actionsExecuted: executionResult.actions
            });

            // الاحتفاظ بآخر 100 إدخال فقط
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }

            await fs.writeFile(ORCHESTRATOR_LOG_FILE, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('❌ خطأ في تسجيل التنفيذ:', error);
        }
    }

    /**
     * الحصول على السجل
     */
    async getExecutionLog() {
        try {
            const content = await fs.readFile(ORCHESTRATOR_LOG_FILE, 'utf-8');
            return JSON.parse(content);
        } catch {
            return [];
        }
    }

    /**
     * الحصول على الحالة الحالية
     */
    getStatus() {
        return {
            currentMode: this.currentMode,
            activeActions: this.activeActions,
            lastDecision: this.lastDecision,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * إعادة تعيين الحالة
     */
    reset() {
        this.currentMode = EXECUTION_MODES.NORMAL_PRODUCTION;
        this.lastDecision = null;
        this.activeActions = [];
        console.log('🔄 تم إعادة تعيين Orchestrator');
    }
}

module.exports = {
    ExecutionOrchestrator,
    EXECUTION_MODES,
    ACTIONS
};
