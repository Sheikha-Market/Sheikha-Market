'use strict';

const pm2FabricClusters = Object.freeze([
  {
    id: 'pm2-1-main-runtime',
    name: 'Main Runtime Cluster',
    arabicName: 'تجمع التشغيل الرئيسي',
    pm2Name: 'sheikha-main-portal',
    role: 'runtime-api-health',
    priority: 1,
    required: true
  },
  {
    id: 'pm2-2-proxy-edge',
    name: 'Proxy Edge Cluster',
    arabicName: 'تجمع البوابة والوكيل',
    pm2Name: 'sheikha-proxy-8082',
    role: 'edge-proxy-routing',
    priority: 2,
    required: false
  },
  {
    id: 'pm2-3-universal-api',
    name: 'Universal API Cluster',
    arabicName: 'تجمع الواجهة الشاملة',
    pm2Name: 'sheikha-universal-api',
    role: 'universal-api-integration',
    priority: 3,
    required: false
  },
  {
    id: 'pm2-4-ai-worker',
    name: 'AI Worker Cluster',
    arabicName: 'تجمع الذكاء الصناعي',
    pm2Name: 'sheikha-ai-worker',
    role: 'ai-background-processing',
    priority: 4,
    required: false
  },
  {
    id: 'pm2-5-governance-worker',
    name: 'Governance Worker Cluster',
    arabicName: 'تجمع الحوكمة والتدقيق',
    pm2Name: 'sheikha-governance-worker',
    role: 'audit-governance-policy',
    priority: 5,
    required: false
  },
  {
    id: 'pm2-6-observability-worker',
    name: 'Observability Worker Cluster',
    arabicName: 'تجمع المراقبة والقياس',
    pm2Name: 'sheikha-observability-worker',
    role: 'metrics-logs-health',
    priority: 6,
    required: false
  }
]);

function evaluatePm2Fabric(processes = []) {
  const byName = new Map(processes.map((p) => [p.name, p]));

  const clusters = pm2FabricClusters.map((cluster) => {
    const process = byName.get(cluster.pm2Name);
    const online = process?.pm2_env?.status === 'online';

    return {
      ...cluster,
      present: Boolean(process),
      online,
      status: online ? 'ONLINE' : cluster.required ? 'REQUIRED_OFFLINE' : 'OPTIONAL_OFFLINE',
      pid: process?.pid || null,
      memory: process?.monit?.memory || null,
      cpu: process?.monit?.cpu || null
    };
  });

  const requiredOffline = clusters.filter((c) => c.required && !c.online);
  const onlineCount = clusters.filter((c) => c.online).length;

  return {
    system: 'SHEIKHA_PM2_FABRIC_V1',
    status: requiredOffline.length ? 'BLOCKED' : 'PASSED',
    score: Math.round((onlineCount / clusters.length) * 100),
    clusters,
    requiredOffline,
    logic: {
      principle: 'كل PM2 تجمع متخصص، ثم يتم التكامل عبر Fabric موحد.',
      mode: 'PM2_CLUSTER_SPECIALIZATION_AND_INTEGRATION',
      noHarm: true,
      humanReview: true
    }
  };
}

module.exports = {
  pm2FabricClusters,
  evaluatePm2Fabric
};
