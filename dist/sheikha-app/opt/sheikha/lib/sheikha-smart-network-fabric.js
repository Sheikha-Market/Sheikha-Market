'use strict';

/**
 * شبكة شيخة الذكية السيادية
 * طبقة تشغيل للشبكة الذكية: Cloud + CDN + VPN Mesh + Realtime + API Gateway
 */

const SMART_FABRIC_VERSION = '1.0.0';
const BOOTED_AT = new Date().toISOString();

const SMART_NODES = Object.freeze([
    {
        id: 'edge-gateway',
        role: 'API Edge Gateway',
        zone: 'core',
        status: 'active'
    },
    {
        id: 'realtime-bus',
        role: 'Realtime SSE/WebSocket Bus',
        zone: 'core',
        status: 'active'
    },
    {
        id: 'cdn-bridge',
        role: 'CDN Distribution Bridge',
        zone: 'edge',
        status: 'active'
    },
    {
        id: 'vpn-mesh-controller',
        role: 'Sovereign VPN Mesh Controller',
        zone: 'security',
        status: 'planned'
    },
    {
        id: 'identity-trust',
        role: 'Identity + Trust Envelope',
        zone: 'security',
        status: 'planned'
    }
]);

function evaluateFromRuntime(runtime = {}) {
    const networkHealth = runtime.networkHealth || 'unknown';
    const realtimeHealth = runtime.realtimeHealth || 'unknown';
    const apiHealth = runtime.apiHealth || 'unknown';

    const isHealthy = ['healthy', 'ok', 'ready', 'live'].includes(String(networkHealth).toLowerCase());
    const realtimeUp = ['healthy', 'ok', 'ready', 'live'].includes(String(realtimeHealth).toLowerCase());
    const apiUp = ['healthy', 'ok', 'ready', 'live'].includes(String(apiHealth).toLowerCase());

    const score = [isHealthy, realtimeUp, apiUp].filter(Boolean).length;
    const posture = score === 3 ? 'active' : score >= 1 ? 'degraded' : 'planned';

    return {
        version: SMART_FABRIC_VERSION,
        bootedAt: BOOTED_AT,
        posture,
        score,
        maxScore: 3,
        runtime: {
            networkHealth,
            realtimeHealth,
            apiHealth
        },
        nodes: SMART_NODES,
        summary: {
            totalNodes: SMART_NODES.length,
            activeNodes: SMART_NODES.filter((node) => node.status === 'active').length,
            plannedNodes: SMART_NODES.filter((node) => node.status === 'planned').length,
            architecture: 'Sovereign Cloud → Edge Gateway → Realtime Bus → CDN Bridge → VPN Mesh'
        }
    };
}

module.exports = {
    SMART_FABRIC_VERSION,
    SMART_NODES,
    evaluateFromRuntime
};
