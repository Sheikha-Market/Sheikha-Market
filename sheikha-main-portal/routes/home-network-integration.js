/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌉 SHEIKHA HOME NETWORK INTEGRATION BRIDGE                                  ║
 * ║  جسر تكامل شبكة المنزل الذكي مع منظومة سوق شيخة الكاملة                   ║
 * ║                                                                              ║
 * ║  يربط:                                                                       ║
 * ║  🏠 home-network  ↔  🤖 AI/Neural Engine                                    ║
 * ║  🏠 home-network  ↔  🛒 Market / Commerce                                   ║
 * ║  🏠 home-network  ↔  🔐 Security Engine                                     ║
 * ║  🏠 home-network  ↔  📊 Dashboard / SCM                                     ║
 * ║  🏠 home-network  ↔  📡 Telecom Org (Neural Cells)                          ║
 * ║                                                                              ║
 * ║  المسارات:                                                                   ║
 * ║  GET  /api/home-integration/status         — حالة التكامل الكامل            ║
 * ║  GET  /api/home-integration/dashboard      — لوحة القيادة الموحدة           ║
 * ║  POST /api/home-integration/ai/analyze     — تحليل AI + ربط بالسوق          ║
 * ║  POST /api/home-integration/market/connect — ربط المنزل بالسوق الذكي        ║
 * ║  POST /api/home-integration/security/scan  — مسح أمني موحد                 ║
 * ║  GET  /api/home-integration/neural/pulse   — نبضة عصبية كاملة               ║
 * ║  POST /api/home-integration/command        — أمر موحد (المنزل + السوق + AI) ║
 * ║                                                                              ║
 * ║  ﴿ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات: 13      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ── تحميل وحدات الشبكة المنزلية ──────────────────────────────────────────────
let homeNetwork = null;
let homeAI      = null;
try {
    homeNetwork = require('../telecom/home-network/index');
    homeAI      = homeNetwork.aiEngine;
} catch (_) {}

// ── تحميل وحدات الاتصالات الكونية ────────────────────────────────────────────
let telecomOrg = null;
try {
    telecomOrg = require('../core/comms/telecom-org').telecomOrg;
} catch (_) {}

// ── تحميل وحدات السوق الذكي ──────────────────────────────────────────────────
let commerceNetwork = null;
try {
    commerceNetwork = require('../telecom/commerce-network/index');
} catch (_) {}

// ── تحميل وحدة الشبكة العصبية للاتصالات ─────────────────────────────────────
let networkCore = null;
try {
    networkCore = require('../telecom/network-core/index');
} catch (_) {}

// ── تحميل وحدة الذكاء الاصطناعي للاتصالات ───────────────────────────────────
let aiNetwork = null;
try {
    aiNetwork = require('../telecom/ai-network/index');
} catch (_) {}

// ── مساعد الاستجابة ───────────────────────────────────────────────────────────
function ok(res, data) {
    return res.json({ success: true, ...data, _bridge: 'Sheikha Home Integration Bridge v1.0' });
}
function fail(res, status, error, messageAr) {
    return res.status(status).json({ success: false, error, messageAr });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/home-integration/status
// حالة التكامل الكامل — ping لجميع الأنظمة المتصلة
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/status', (req, res) => {
    const systems = {
        home_network: {
            name:   'شبكة المنزل الذكي العصبية',
            status: homeNetwork ? 'connected' : 'unavailable',
            cells:  homeNetwork ? Object.keys(homeNetwork.ALL_HOME_CELLS).length : 0,
            endpoint: '/api/telecom/home-network',
        },
        home_ai_engine: {
            name:   'محرك الذكاء الاصطناعي المنزلي',
            status: homeAI ? 'connected' : 'unavailable',
            models: homeAI ? Object.keys(homeAI.AI_MODELS).length : 0,
            endpoint: '/api/telecom/home-network/ai',
        },
        telecom_org: {
            name:   'منظمة شيخة للاتصالات الكونية',
            status: telecomOrg ? 'connected' : 'unavailable',
            endpoint: '/api/telecom',
        },
        commerce_network: {
            name:   'شبكة التجارة الإسلامية',
            status: commerceNetwork ? 'connected' : 'unavailable',
            endpoint: '/api/telecom/connect',
        },
        network_core: {
            name:   'نواة الشبكة الكونية',
            status: networkCore ? 'connected' : 'unavailable',
            endpoint: '/api/telecom/network-status',
        },
        ai_neural: {
            name:   'شبكة عقد الذكاء الاصطناعي',
            status: aiNetwork ? 'connected' : 'unavailable',
            endpoint: '/api/telecom/ai-nodes',
        },
    };

    const connected = Object.values(systems).filter(s => s.status === 'connected').length;
    const total     = Object.keys(systems).length;

    ok(res, {
        nameAr:         'جسر التكامل — شبكة المنزل الذكي ومنظومة سوق شيخة',
        timestamp:      new Date().toISOString(),
        integration_health: connected === total ? 'full' : connected > total / 2 ? 'partial' : 'degraded',
        connected_systems:  connected,
        total_systems:      total,
        systems,
        verse:  '﴿ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات: 13',
        tawheed:'وحدها لله',
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/home-integration/dashboard
// لوحة القيادة الموحدة — تجمع المنزل الذكي والسوق والذكاء الاصطناعي
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/dashboard', (req, res) => {
    try {
        const homeDash   = homeNetwork   ? homeNetwork.getHomeNetworkDashboard()   : null;
        const netStatus  = networkCore   ? networkCore.getNetworkStatus()           : null;
        const aiNodes    = aiNetwork     ? aiNetwork.getAINodes()                   : null;
        const aiInsights = homeAI        ? homeAI.getAINetworkInsights()            : null;

        ok(res, {
            nameAr:   'لوحة القيادة الموحدة — المنزل الذكي × سوق شيخة',
            timestamp: new Date().toISOString(),

            home_network: homeDash ? {
                totalCells:     homeDash.totalCells,
                activationRate: homeDash.activationRate,
                securityScore:  homeDash.securityScore,
                ai_engine:      homeDash.ai_engine,
            } : null,

            network_core: netStatus ? {
                status:     netStatus.status,
                statusAr:   netStatus.statusAr,
                uptime:     netStatus.uptime,
                principles: netStatus.principles,
            } : null,

            ai_nodes: aiNodes ? {
                engine:        aiNodes.engine,
                engineAr:      aiNodes.engineAr,
                nodes_count:   aiNodes.nodes.length,
                capabilities:  aiNodes.capabilities,
                sharia:        aiNodes.sharia_compliance,
            } : null,

            home_ai_live: aiInsights ? {
                models:       aiInsights.models,
                live_metrics: aiInsights.live_metrics,
                capabilities: aiInsights.ai_capabilities,
            } : null,

            integration_links: [
                { from: 'CELL_HOME_BRIDGE',   to: '/api/telecom/ai-nodes',        type: 'AI_SYNC'     },
                { from: 'CELL_HOME_ROUTER',   to: '/api/telecom/network-status',  type: 'NET_SYNC'    },
                { from: 'CELL_HOME_FIREWALL', to: '/api/telecom/secure-channel',  type: 'SEC_SYNC'    },
                { from: 'CELL_HOME_IOT',      to: '/api/scm/status',              type: 'SCM_CONNECT' },
                { from: 'CELL_HOME_SMART_HUB',to: '/api/market/products',         type: 'MKT_CONNECT' },
            ],

            verse:  '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60',
            hadith: '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي',
            tawheed:'وحدها لله',
        });
    } catch (e) {
        fail(res, 500, 'dashboard_error', 'حدث خطأ في جلب لوحة القيادة الموحدة');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/home-integration/ai/analyze
// تحليل AI موحد: شبكة المنزل + الشبكة الكونية + السوق
// Body: { trafficMetrics?, context?, devices? }
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/ai/analyze', (req, res) => {
    if (!homeAI) return fail(res, 503, 'ai_unavailable', 'محرك الذكاء الاصطناعي غير متاح');
    try {
        const { trafficMetrics = {}, context = {}, devices = [] } = req.body || {};

        // 1. تحليل حركة الشبكة
        const trafficAnalysis = homeAI.analyzeTrafficWithAI(trafficMetrics);

        // 2. توقع التهديدات
        const threatPrediction = homeAI.predictThreats(context);

        // 3. توجيه ذكي للأجهزة
        const routing = devices.length > 0 ? homeAI.smartRouteTraffic(devices) : null;

        // 4. حالة الشبكة الكونية (إذا متوفرة)
        const networkStatus = networkCore ? networkCore.getNetworkStatus() : null;

        // 5. عقد الذكاء الاصطناعي الكوني
        const aiNodes = aiNetwork ? aiNetwork.getAINodes() : null;

        ok(res, {
            nameAr:          'التحليل الذكي الموحد — المنزل × الشبكة الكونية × السوق',
            timestamp:       new Date().toISOString(),
            home_ai: {
                traffic:   trafficAnalysis,
                threats:   threatPrediction,
                routing:   routing,
            },
            cosmic_network: networkStatus ? {
                status:     networkStatus.status,
                principles: networkStatus.principles,
            } : null,
            ai_nodes: aiNodes ? {
                count:       aiNodes.nodes.length,
                capabilities:aiNodes.capabilities,
            } : null,
            integrated_security_score: _calcIntegratedScore(trafficAnalysis, threatPrediction),
            verse:  trafficAnalysis.verse || '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60',
            tawheed:'وحدها لله',
        });
    } catch (e) {
        fail(res, 500, 'ai_analyze_error', 'حدث خطأ في التحليل الذكي الموحد');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/home-integration/market/connect
// ربط المنزل الذكي بالسوق الذكي — تاجر ذكي من المنزل
// Body: { userId, homeDevices?, region? }
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/market/connect', (req, res) => {
    if (!commerceNetwork) return fail(res, 503, 'commerce_unavailable', 'شبكة التجارة غير متاحة');
    try {
        const { userId, homeDevices = [], region } = req.body || {};
        if (!userId) return fail(res, 400, 'user_id_required', 'معرّف المستخدم مطلوب');

        // الربط بالشبكة التجارية
        const commerceResult = commerceNetwork.connectToCommerceNetwork({ userId, type: 'smart_home_trader', region });

        // حالة شبكة المنزل
        const homeDash = homeNetwork ? homeNetwork.getHomeNetworkDashboard() : null;

        // توجيه ذكي للأجهزة إن وجدت
        const routing = homeAI && homeDevices.length > 0
            ? homeAI.smartRouteTraffic(homeDevices)
            : null;

        ok(res, {
            nameAr:        'ربط المنزل الذكي بسوق شيخة',
            userId,
            timestamp:     new Date().toISOString(),
            commerce:      commerceResult,
            home_status:   homeDash ? {
                cells:    homeDash.totalCells,
                security: homeDash.securityScore,
                ai:       homeDash.ai_engine ? 'active' : 'unavailable',
            } : null,
            smart_routing: routing,
            integration_active: true,
            endpoints: {
                home_dashboard:   '/api/telecom/home-network',
                market_dashboard: '/api/smart-market/dashboard',
                ai_assist:        '/api/home-integration/command',
                security_scan:    '/api/home-integration/security/scan',
            },
            verse:  '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ ﴾ — النساء: 29',
            hadith: '«التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ» — الترمذي',
        });
    } catch (e) {
        fail(res, 500, 'market_connect_error', 'حدث خطأ في ربط المنزل بالسوق');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/home-integration/security/scan
// مسح أمني موحد — المنزل + الشبكة الكونية
// Body: { trafficMetrics?, device_count?, scan_depth? }
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/security/scan', (req, res) => {
    if (!homeAI) return fail(res, 503, 'ai_unavailable', 'محرك الأمان غير متاح');
    try {
        const { trafficMetrics = {}, device_count = 10, scan_depth = 'full' } = req.body || {};

        // تحليل حركة الشبكة
        const trafficAnalysis = homeAI.analyzeTrafficWithAI(trafficMetrics);

        // توقع التهديدات
        const threatPrediction = homeAI.predictThreats({ device_count });

        // حالة الأمن المنزلي
        const homeSecStatus = homeNetwork ? homeNetwork.getHomeSecurityStatus() : null;

        // توصيات التحسين
        const optimization = scan_depth === 'full'
            ? homeAI.autoOptimizeNetwork({ security_score: homeSecStatus?.securityScore || 70 })
            : null;

        const overallRiskLevel = _calcRiskLevel(trafficAnalysis.anomaly_score, threatPrediction.predictions.length);

        ok(res, {
            nameAr:       'تقرير المسح الأمني الموحد',
            timestamp:    new Date().toISOString(),
            scan_depth,
            overall_risk: overallRiskLevel,
            home_security: homeSecStatus ? {
                score:       homeSecStatus.securityScore,
                protections: homeSecStatus.active_protections,
                sharia:      homeSecStatus.sharia_principles,
            } : null,
            traffic_analysis: {
                anomaly_score: trafficAnalysis.anomaly_score,
                threat_level:  trafficAnalysis.threat_level,
                is_anomaly:    trafficAnalysis.is_anomaly,
                action:        trafficAnalysis.recommended_action,
            },
            threat_predictions: threatPrediction.predictions,
            optimization_suggestions: optimization ? optimization.suggestions : [],
            verse:  '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ وَمِن رِّبَاطِ الْخَيْلِ ﴾ — الأنفال: 60',
            hadith: '«الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ» — البخاري',
        });
    } catch (e) {
        fail(res, 500, 'security_scan_error', 'حدث خطأ في المسح الأمني الموحد');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/home-integration/neural/pulse
// النبضة العصبية الكاملة — إشارة من جسر المنزل إلى كل الشبكة الكونية
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/neural/pulse', (req, res) => {
    try {
        // إشارة من جسر المنزل الذكي
        const homeSignal = homeNetwork
            ? homeNetwork.fireHomeSignal('CELL_HOME_BRIDGE', { type: 'INTEGRATION_PULSE', payload: 'full_system_check' }, 3)
            : null;

        // حالة الشبكة الكونية
        const netStatus = networkCore ? networkCore.getNetworkStatus() : null;

        // طوبولوجيا الشبكة العصبية الكونية
        const neuralTopology = telecomOrg ? telecomOrg.getNeuralTopology() : null;

        // عقد الذكاء الاصطناعي
        const aiNodes = aiNetwork ? aiNetwork.getAINodes() : null;

        ok(res, {
            nameAr:    'النبضة العصبية الكاملة — المنزل × الشبكة الكونية',
            timestamp: new Date().toISOString(),
            pulse_type:'FULL_INTEGRATION_PULSE',
            home_signal: homeSignal ? {
                origin:       homeSignal.origin,
                propagation:  homeSignal.propagation?.length || 0,
                cells_reached:homeSignal.propagation?.map(p => p.cellId) || [],
            } : null,
            cosmic_network: netStatus ? {
                status:   netStatus.status,
                uptime:   netStatus.uptime,
                levels:   netStatus.levels?.length || 0,
            } : null,
            neural_topology: neuralTopology ? {
                total_cells:   neuralTopology.totalCells || neuralTopology.cells?.length || 0,
                domains:       neuralTopology.domains || [],
            } : null,
            ai_nodes: aiNodes ? {
                engine:  aiNodes.engine,
                count:   aiNodes.nodes?.length || 0,
                sharia:  aiNodes.sharia_compliance,
            } : null,
            integration_complete: !!(homeSignal && netStatus),
            verse:  '﴿ وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ ﴾ — الذاريات: 22',
            tawheed:'وحدها لله',
        });
    } catch (e) {
        fail(res, 500, 'neural_pulse_error', 'حدث خطأ في النبضة العصبية');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/home-integration/command
// أمر موحد — يُنفَّذ في المنزل الذكي والسوق والذكاء الاصطناعي معاً
// Body: { command, userId?, homeState?, context? }
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/command', (req, res) => {
    if (!homeAI) return fail(res, 503, 'ai_unavailable', 'محرك الذكاء الاصطناعي غير متاح');
    try {
        const { command, userId, homeState = {}, context = {} } = req.body || {};
        if (!command) return fail(res, 400, 'command_required', 'الأمر مطلوب');

        // تنفيذ الأمر في محرك المنزل الذكي
        const homeResult = homeAI.processVoiceCommand(command, homeState);

        // إذا الأمر متعلق بالسوق، ربط بالشبكة التجارية
        const isMarketCommand = _isMarketCommand(command);
        let marketResult = null;
        if (isMarketCommand && userId && commerceNetwork) {
            marketResult = commerceNetwork.connectToCommerceNetwork({ userId, type: 'command_trigger', region: context.region });
        }

        // تصنيف شرعي إذا كان الأمر يتضمن محتوى
        const contentUrl = context.url;
        const contentClass = contentUrl ? homeAI.classifyContent(contentUrl) : null;

        ok(res, {
            nameAr:         'تنفيذ الأمر الموحد — المنزل × السوق × الذكاء الاصطناعي',
            timestamp:      new Date().toISOString(),
            command,
            home_execution: homeResult,
            market_action:  marketResult,
            content_check:  contentClass,
            sharia_guard:   { active: true, no_haram_commands: true, ai_powered: true },
            verse:          homeResult.verse || '﴿ وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ ﴾ — النساء: 113',
            tawheed:        'وحدها لله',
        });
    } catch (e) {
        fail(res, 500, 'command_error', 'حدث خطأ في تنفيذ الأمر الموحد');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/home-integration  (نقطة الدخول)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', (req, res) => {
    ok(res, {
        nameAr:   'جسر التكامل — شبكة المنزل الذكي ومنظومة سوق شيخة',
        version:  '1.0.0',
        verse:    '﴿ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات: 13',
        tawheed:  'وحدها لله',
        endpoints: {
            status:          'GET  /api/home-integration/status',
            dashboard:       'GET  /api/home-integration/dashboard',
            ai_analyze:      'POST /api/home-integration/ai/analyze',
            market_connect:  'POST /api/home-integration/market/connect',
            security_scan:   'POST /api/home-integration/security/scan',
            neural_pulse:    'GET  /api/home-integration/neural/pulse',
            command:         'POST /api/home-integration/command',
        },
        connected_systems: [
            '/api/telecom/home-network  (شبكة المنزل الذكي العصبية)',
            '/api/telecom              (الشبكة الكونية)',
            '/api/telecom/connect      (التجارة الإسلامية)',
            '/api/network              (شبكة شيخة المتكاملة)',
            '/api/ai/live              (الذكاء الاصطناعي الحي)',
            '/api/scm/status           (سلسلة الإمداد)',
            '/api/market/products      (السوق الذكي)',
        ],
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// دوال مساعدة داخلية
// ═══════════════════════════════════════════════════════════════════════════════

function _calcIntegratedScore(trafficAnalysis, threatPrediction) {
    const trafficSafe = (1 - (trafficAnalysis?.anomaly_score || 0)) * 50;
    const threatSafe  = Math.max(0, 50 - (threatPrediction?.predictions?.length || 0) * 5);
    return Math.round(trafficSafe + threatSafe);
}

function _calcRiskLevel(anomalyScore, threatCount) {
    const score = (anomalyScore || 0) * 0.6 + Math.min(threatCount / 10, 1) * 0.4;
    if (score > 0.6) return 'high';
    if (score > 0.3) return 'medium';
    return 'low';
}

function _isMarketCommand(command) {
    const marketKeywords = ['اشتر', 'بع', 'سوق', 'تجارة', 'طلب', 'buy', 'sell', 'market', 'order', 'trade'];
    const lower = command.toLowerCase();
    return marketKeywords.some(k => lower.includes(k));
}

// ═══════════════════════════════════════════════════════════════════════════════
module.exports = router;
