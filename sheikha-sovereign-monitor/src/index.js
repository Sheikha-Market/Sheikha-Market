const ALLOWED_ORIGINS = new Set([
  "https://sheikha.top",
  "https://www.sheikha.top",
  "https://sheikha.market",
  "https://ads.sheikha.top",
  "https://sheikha-sovereign-monitor.market-a4e.workers.dev",
  "http://127.0.0.1:8090"
]);

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://sheikha.top";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Sheikha-Key",
    "Vary": "Origin"
  };
}

function isAuthorized(request, env) {
  const cfJwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (cfJwt && cfJwt.length > 20) return true;
  const authHeader = request.headers.get("Authorization") || "";
  const keyHeader = request.headers.get("X-Sheikha-Key") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : keyHeader.trim();
  return Boolean(env.SHEIKHA_ADMIN_TOKEN && token === env.SHEIKHA_ADMIN_TOKEN);
}

async function runHealthProbe(env) {
  const ts = new Date().toISOString();
  const record = {
    status: "healthy",
    timestamp: ts,
    governance: env.GOVERNANCE || "BOUND_BY_QURAN_SUNNAH",
    kv_bound: Boolean(env.SHEIKHA_KV),
    d1_bound: Boolean(env.UNIFIED_DB),
    retention_policy_days: 7
  };
  if (env.SHEIKHA_KV) {
    await env.SHEIKHA_KV.put("monitor:latest", JSON.stringify(record), { expirationTtl: 604800 });
    await env.SHEIKHA_KV.put(`monitor:log:${ts.slice(0, 16)}`, JSON.stringify(record), { expirationTtl: 604800 });
  }
  return record;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runHealthProbe(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // مسار فحص الصحة العام (محدود البيانات بدون كشف معلومات داخلية)
    if (url.pathname === "/api/health" || url.pathname === "/") {
      return Response.json({
        status: "healthy",
        service: "sheikha-sovereign-monitor",
        version: "3.0.0-hardened",
        governance: "BOUND_BY_QURAN_SUNNAH",
        timestamp: new Date().toISOString()
      }, { headers: cors });
    }

    // المسارات الإدارية وسجل المراقبة التاريخي في KV محمية بالمصادقة الإلزامية (P1)
    if (!isAuthorized(request, env)) {
      return Response.json({
        success: false,
        error: "401 Unauthorized: Sovereign Authentication Required (X-Sheikha-Key or Cloudflare Access JWT)"
      }, { status: 401, headers: cors });
    }

    if (url.pathname === "/api/admin/history" || url.pathname === "/api/admin/probe") {
      const latestProbe = await runHealthProbe(env);
      const list = env.SHEIKHA_KV ? await env.SHEIKHA_KV.list({ prefix: "monitor:log:", limit: 20 }) : { keys: [] };
      return Response.json({
        success: true,
        latest_probe: latestProbe,
        history_snapshots_count: list.keys.length,
        recent_keys: list.keys.map(k => k.name)
      }, { headers: cors });
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  }
};
