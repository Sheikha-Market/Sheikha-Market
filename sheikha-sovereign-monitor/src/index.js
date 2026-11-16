/**
 * SHEIKHA SOVEREIGN MONITOR v1.0.0
 * منصة المراقبة السيادية — تراقب كل Workers + R2 + D1 + KV
 * BOUND_BY_QURAN_SUNNAH
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Routes
    if (path === "/" || path === "/dashboard") {
      return new Response(getDashboardHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    }

    if (path === "/api/status") {
      return jsonResponse(await getSystemStatus(env), corsHeaders);
    }

    if (path === "/api/workers") {
      return jsonResponse(await getWorkersStatus(env), corsHeaders);
    }

    if (path === "/api/health") {
      return jsonResponse({ status: "healthy", timestamp: new Date().toISOString(), governance: "BOUND_BY_QURAN_SUNNAH" }, corsHeaders);
    }

    if (path === "/api/metrics") {
      return jsonResponse(await getMetrics(env), corsHeaders);
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },

  // Cron trigger — كل 5 دقائق
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runHealthChecks(env));
  },
};

// ═══════════════════════════════════════════════════════════════
// System Status
// ═══════════════════════════════════════════════════════════════
async function getSystemStatus(env) {
  const workers = await getWorkersStatus(env);
  return {
    platform: "Sheikha Sovereign Platform v1.0.0",
    governance: "BOUND_BY_QURAN_SUNNAH",
    owner: "Salman Ahmed Al-Rajih Trading Est. (CR: 2051263653)",
    timestamp: new Date().toISOString(),
    workers_count: workers.length,
    workers_healthy: workers.filter(w => w.status === "healthy").length,
    workers_total: workers.length,
    services: {
      workers_ai: "available",
      r2: "available",
      d1: "available",
      kv: "available",
      ai_gateway: "read-only",
    },
    workers,
  };
}

// ═══════════════════════════════════════════════════════════════
// Workers Status — ping each worker
// ═══════════════════════════════════════════════════════════════
async function getWorkersStatus(env) {
  const workerNames = [
    "sheikha-ads-manager",
    "sheikha-ai",
    "sheikha-api-shield",
    "sheikha-dev-platform",
    "sheikha-durable-objects",
    "sheikha-edge-guardian",
    "sheikha-email-router",
    "sheikha-health-checker",
    "sheikha-logpush",
    "sheikha-mcp",
    "sheikha-media-worker",
    "sheikha-workflows",
  ];

  const results = await Promise.all(
    workerNames.map(async (name) => {
      try {
    const start = Date.now();
        // Try to fetch the worker's health endpoint
        const resp = await fetch(`https://${name}.sheikha.workers.dev/api/health`, {
          signal: AbortSignal.timeout(5000),
        });
        const elapsed = Date.now() - start;
        return {
          name,
          status: resp.ok ? "healthy" : "degraded",
          http_code: resp.status,
          latency_ms: elapsed,
          last_check: new Date().toISOString(),
        };
      } catch (e) {
        return {
          name,
          status: "offline",
          http_code: 0,
          latency_ms: 0,
          error: e.message,
          last_check: new Date().toISOString(),
        };
      }
    })
  );

  return results;
}

// ═══════════════════════════════════════════════════════════════
// Metrics
// ═══════════════════════════════════════════════════════════════
async function getMetrics(env) {
  const workers = await getWorkersStatus(env);
  return {
    timestamp: new Date().toISOString(),
    total_workers: workers.length,
    healthy: workers.filter(w => w.status === "healthy").length,
    degraded: workers.filter(w => w.status === "degraded").length,
    offline: workers.filter(w => w.status === "offline").length,
    avg_latency_ms: workers.length > 0
      ? Math.round(workers.reduce((sum, w) => sum + w.latency_ms, 0) / workers.length)
      : 0,
    uptime_percentage: Math.round((workers.filter(w => w.status === "healthy").length / workers.length) * 100),
  };
}

// ═══════════════════════════════════════════════════════════════
// Health Checks (cron)
// ═══════════════════════════════════════════════════════════════
async function runHealthChecks(env) {
  const results = await getWorkersStatus(env);
  // Store in KV for history
  if (env.SHEIKHA_KV) {
    await env.SHEIKHA_KV.put(
      `health:${Date.now()}`,
      JSON.stringify(results),
      { expirationTtl: 86400 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function jsonResponse(data, corsHeaders) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

// ═══════════════════════════════════════════════════════════════
// Dashboard HTML
// ═══════════════════════════════════════════════════════════════
function getDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🏛️ شيخة — المنصة السيادية للمراقبة</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background: #0a0e27;
  color: #e0e0e0;
  min-height: 100vh;
}
.header {
  background: linear-gradient(135deg, #1a1f3a, #2d1f4a);
  padding: 20px;
  text-align: center;
  border-bottom: 2px solid #4a3f6a;
}
.header h1 { font-size: 28px; color: #c9a84c; margin-bottom: 5px; }
.header p { color: #888; font-size: 14px; }
.header .governance { color: #4a9; font-size: 12px; margin-top: 5px; }
.container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}
.stat-card {
  background: #141833;
  border: 1px solid #2a2f4a;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.stat-card .value { font-size: 36px; font-weight: bold; color: #c9a84c; }
.stat-card .label { font-size: 14px; color: #888; margin-top: 5px; }
.stat-card.healthy .value { color: #4a9; }
.stat-card.offline .value { color: #e44; }
.stat-card.degraded .value { color: #fa0; }
.section {
  background: #141833;
  border: 1px solid #2a2f4a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}
.section h2 { color: #c9a84c; margin-bottom: 15px; font-size: 20px; }
.worker-list { display: grid; gap: 10px; }
.worker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #1a1f3a;
  border-radius: 8px;
  border-left: 4px solid #333;
}
.worker-item.healthy { border-left-color: #4a9; }
.worker-item.degraded { border-left-color: #fa0; }
.worker-item.offline { border-left-color: #e44; }
.worker-name { font-weight: bold; }
.worker-status { font-size: 13px; padding: 4px 10px; border-radius: 4px; }
.worker-status.healthy { background: #1a4a2a; color: #4a9; }
.worker-status.degraded { background: #4a3a1a; color: #fa0; }
.worker-status.offline { background: #4a1a1a; color: #e44; }
.worker-latency { font-size: 12px; color: #666; }
.refresh-btn {
  background: #c9a84c;
  color: #0a0e27;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}
.refresh-btn:hover { background: #d9b85c; }
.footer { text-align: center; padding: 20px; color: #555; font-size: 12px; }
#lastUpdate { color: #c9a84c; font-size: 12px; margin-top: 10px; }
</style>
</head>
<body>
<div class="header">
  <h1>🏛️ شيخة — المنصة السيادية للمراقبة</h1>
  <p>Sheikha Sovereign Monitoring Platform v1.0.0</p>
  <p class="governance">🛡️ BOUND_BY_QURAN_SUNNAH — مؤسسة سلمان الراجح (CR: 2051263653)</p>
</div>

<div class="container">
  <div style="text-align:center; margin-bottom:20px;">
    <button class="refresh-btn" onclick="loadData()">🔄 تحديث البيانات</button>
    <div id="lastUpdate"></div>
  </div>

  <div class="stats-grid" id="statsGrid">
    <div class="stat-card"><div class="value" id="statTotal">--</div><div class="label">إجمالي Workers</div></div>
    <div class="stat-card healthy"><div class="value" id="statHealthy">--</div><div class="label">✅ سليم</div></div>
    <div class="stat-card degraded"><div class="value" id="statDegraded">--</div><div class="label">⚠️ متدهور</div></div>
    <div class="stat-card offline"><div class="value" id="statOffline">--</div><div class="label">❌ غير متصل</div></div>
    <div class="stat-card"><div class="value" id="statLatency">--</div><div class="label">متوسط الاستجابة (ms)</div></div>
    <div class="stat-card healthy"><div class="value" id="statUptime">--%</div><div class="label">نسبة التشغيل</div></div>
  </div>

  <div class="section">
    <h2>📋 حالة Workers</h2>
    <div class="worker-list" id="workerList">
      <p style="color:#666;">جاري التحميل...</p>
    </div>
  </div>
</div>

<div class="footer">
  <p>منظومة شيخة السيادية — BOUND_BY_QURAN_SUNNAH 🛡️</p>
  <p>© 2026 مؤسسة سلمان أحمد بن سلمان الراجح للتجارة</p>
</div>

<script>
async function loadData() {
  try {
    const resp = await fetch('/api/status');
    const data = await resp.json();

    document.getElementById('statTotal').textContent = data.workers_total;
    document.getElementById('statHealthy').textContent = data.workers_healthy;
    document.getElementById('statDegraded').textContent =
      data.workers.filter(w => w.status === 'degraded').length;
    document.getElementById('statOffline').textContent =
      data.workers.filter(w => w.status === 'offline').length;

    const avgLatency = data.workers.length > 0
      ? Math.round(data.workers.reduce((s, w) => s + w.latency_ms, 0) / data.workers.length)
      : 0;
    document.getElementById('statLatency').textContent = avgLatency;

    const uptime = Math.round((data.workers_healthy / data.workers_total) * 100);
    document.getElementById('statUptime').textContent = uptime;

    const list = document.getElementById('workerList');
    list.innerHTML = data.workers.map(w => \`
      <div class="worker-item \${w.status}">
        <div>
          <div class="worker-name">\${w.name}</div>
          <div class="worker-latency">HTTP \${w.http_code} | \${w.latency_ms}ms</div>
        </div>
        <div class="worker-status \${w.status}">
          \${w.status === 'healthy' ? '✅ سليم' : w.status === 'degraded' ? '⚠️ متدهور' : '❌ غير متصل'}
        </div>
      </div>
    \`).join('');

    document.getElementById('lastUpdate').textContent = 'آخر تحديث: ' + new Date().toLocaleString('ar-SA');
  } catch (e) {
    document.getElementById('workerList').innerHTML = '<p style="color:#e44;">خطأ: ' + e.message + '</p>';
  }
}

loadData();
setInterval(loadData, 30000);
</script>
</body>
</html>`;
}
