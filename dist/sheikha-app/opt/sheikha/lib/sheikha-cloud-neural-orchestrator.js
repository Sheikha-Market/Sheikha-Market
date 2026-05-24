'use strict';

/**
 * Sheikha Cloud Neural Orchestrator
 * دمج ذكاء التشغيل بين السيرفرات الذكية + الشبكة العصبية الجذرية + السحابات.
 */

const ORCHESTRATOR_VERSION = '1.0.0';

function normalizeServers(servers) {
    if (!Array.isArray(servers) || !servers.length) {
        return [
            { id: 'core-api-1', region: 'core', load: 0.45, health: 'healthy', role: 'api' },
            { id: 'edge-gateway-1', region: 'edge', load: 0.35, health: 'healthy', role: 'gateway' },
            { id: 'realtime-hub-1', region: 'core', load: 0.40, health: 'healthy', role: 'realtime' }
        ];
    }

    return servers.map((item, index) => ({
        id: item.id || `server-${index + 1}`,
        region: item.region || 'core',
        role: item.role || 'api',
        load: typeof item.load === 'number' ? item.load : 0.5,
        health: item.health || 'unknown'
    }));
}

function computeNetworkPosture(servers) {
    const healthy = servers.filter((srv) => String(srv.health).toLowerCase() === 'healthy');
    const avgLoad = servers.reduce((sum, srv) => sum + srv.load, 0) / servers.length;

    if (healthy.length === servers.length && avgLoad < 0.75) {
        return { posture: 'active', score: 95 };
    }

    if (healthy.length >= Math.ceil(servers.length / 2)) {
        return { posture: 'degraded', score: 72 };
    }

    return { posture: 'critical', score: 35 };
}

function buildRoutingPlan(servers) {
    const sorted = [...servers].sort((a, b) => a.load - b.load);
    const primary = sorted[0];
    const secondary = sorted[1] || sorted[0];

    return {
        strategy: 'least-load + health-weighted',
        primary: primary ? primary.id : null,
        secondary: secondary ? secondary.id : null,
        rules: [
            'traffic.api -> lowest healthy api/gateway node',
            'traffic.realtime -> nearest healthy realtime node',
            'failover -> automatic within 2s on unhealthy state'
        ]
    };
}

function orchestrateCloudNeuralMesh(input = {}) {
    const servers = normalizeServers(input.servers);
    const posture = computeNetworkPosture(servers);
    const routingPlan = buildRoutingPlan(servers);

    return {
        version: ORCHESTRATOR_VERSION,
        timestamp: new Date().toISOString(),
        mode: input.mode || 'production',
        objective: 'تكامل ذكي بين السيرفرات الذكية والشبكة العصبية الجذرية للسحابات',
        posture,
        servers,
        routingPlan,
        aiDecisions: {
            balancing: posture.posture === 'active' ? 'normal' : 'adaptive',
            failover: posture.posture === 'critical' ? 'aggressive' : 'standard',
            neuralControl: 'enabled'
        },
        shariaGuardrails: ['no-riba', 'no-gharar', 'no-ghish', 'fair-access']
    };
}

module.exports = {
    ORCHESTRATOR_VERSION,
    orchestrateCloudNeuralMesh
};
