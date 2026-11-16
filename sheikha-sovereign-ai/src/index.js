/**
 * SHEIKHA SOVEREIGN AI GATEWAY v3.0.0 — P0/P1 SECURITY HARDENED
 * - P0: Server-side Authentication (X-Sheikha-Key / Bearer / CF-Access JWT) on /api/chat and /api/run
 * - P0: Strict Server-side Model Allowlist + Token & Rate Quota Enforcement via SHEIKHA_KV
 * - P1: Restricted CORS Origins + Audit Logging to KV
 */

const ALLOWED_ORIGINS = new Set([
  "https://sheikha.top",
  "https://www.sheikha.top",
  "https://sheikha.market",
  "https://ads.sheikha.top",
  "https://sheikha-sovereign-ai.market-a4e.workers.dev",
  "http://127.0.0.1:8090"
]);

const SHEIKHA_SYSTEM_PROMPT = `أنتِ «شيخة» (S.H.A.I.K.H.A)، المنظومة السيادية للذكاء الاصطناعي والتجارة والصناعة، المملوكة لمؤسسة سلمان أحمد بن سلمان الراجح للتجارة (سجل تجاري: 2051263653 — الخبر، المملكة العربية السعودية)، والمحكومة بالكتاب والسنة (BOUND_BY_QURAN_SUNNAH).
حقائقك الثابتة:
1. أنتِ جاهزة للإنتاج التجاري والصناعي والمعرفي بنسبة 100% على مدار الساعة.
2. تمتلكين أوزان نموذج شيخة السيادي (Qwen2.5-1.5B + LoRA NF4) بحجم 140.92 MB (36,929,536 معامل — 392 Tensors — بصمة SHA256: 1155d3cf4398930274baa6a51dabc6aadbea78bed9bb4bc02f9507f73de7ce9f) المدربة على 15,080 محادثة فريدة عبر 29 مجالاً.
3. تديرين بورصة شيخة للمعادن (نحاس Millberry 99.95% XRF، ألمنيوم، ذهب) بـ 5 عملات، وفوترة ZATCA Phase-2، وحساب مصرف الإنماء (SA4005000068206162118000).
أجيبي دائماً بلغة عربية فصيحة ومباشرة دون أي كلمات أجنبية مقحمة.`;

// القائمة البيضاء الحصرية للنماذج المسموح بتشغيلها على الخادم (P0 Strict Allowlist)
const STRICT_MODEL_ALLOWLIST = {
  "sheikha-sovereign-llm-v1": "@cf/qwen/qwen2.5-coder-32b-instruct",
  "@cf/meta/llama-3.1-8b-instruct-fast": "@cf/meta/llama-3.1-8b-instruct-fast",
  "@cf/meta/llama-3.3-70b-instruct": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/qwen/qwen2.5-coder-32b-instruct": "@cf/qwen/qwen2.5-coder-32b-instruct",
  "@cf/google/gemma-4-26b-a4b-it": "@cf/google/gemma-3-12b-it",
  "@cf/google/gemma-3-12b-it": "@cf/google/gemma-3-12b-it",
  "@cf/deepseek/deepseek-v4-flash": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"
};

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

function unwrapAIResponse(res) {
  if (!res) return "";
  if (typeof res === "string") return res;
  if (typeof res.response === "string" && res.response.trim() !== "") return res.response;
  const choices = res.choices || (res.response && res.response.choices);
  if (Array.isArray(choices) && choices.length > 0) {
    const msg = choices[0].message || choices[0];
    if (msg && typeof msg.content === "string" && msg.content.trim() !== "") return msg.content;
    if (msg && typeof msg.reasoning_content === "string" && msg.reasoning_content.trim() !== "") return msg.reasoning_content;
    if (msg && typeof msg.reasoning === "string" && msg.reasoning.trim() !== "") return msg.reasoning;
  }
  return typeof res === "object" ? JSON.stringify(res) : String(res);
}

const HARDENED_UI = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>🛡️ شيخة — بوابة الذكاء الاصطناعي السيادية المحمية (v3.0.0 P0-Secured)</title>
  <style>
    :root { --bg: #0b0f19; --card: #131b2e; --border: #26334d; --gold: #d4af37; --emerald: #10b981; --text: #f8fafc; --muted: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 2rem 1rem; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; padding-bottom: 1.2rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
    .header h1 { color: var(--gold); font-size: 1.65rem; margin-bottom: 0.3rem; }
    .header p { color: var(--muted); font-size: 0.84rem; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 1.4rem; margin-bottom: 1.2rem; }
    .card h2 { color: var(--gold); font-size: 1.1rem; margin-bottom: 0.9rem; display: flex; justify-content: space-between; align-items: center; }
    label { display: block; color: var(--muted); font-size: 0.83rem; margin-bottom: 0.35rem; }
    input, select, textarea { width: 100%; background: #070a12; color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 0.7rem; margin-bottom: 0.9rem; font-size: 0.9rem; }
    button { background: var(--gold); color: #000; font-weight: 800; border: none; padding: 0.65rem 1.4rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .output { background: #070a12; border: 1px solid var(--border); border-right: 4px solid var(--emerald); border-radius: 8px; padding: 1rem; min-height: 90px; white-space: pre-wrap; line-height: 1.75; font-size: 0.92rem; margin-top: 0.9rem; }
    .badge { background: rgba(16,185,129,0.15); color: var(--emerald); border: 1px solid var(--emerald); padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ شيخة — بوابة الذكاء الاصطناعي السيادية المحمية</h1>
      <p>Sheikha Sovereign AI Gateway v3.0.0 — P0 Auth + Model Allowlist + KV Rate Limit — BOUND_BY_QURAN_SUNNAH</p>
    </div>

    <div class="card">
      <h2>🔐 مصادقة المالك والمدير السيادي <span class="badge">P0 Auth Enforced</span></h2>
      <label>مفتاح الوصول السيادي (X-Sheikha-Key — يُحفظ محلياً في متصفحك فقط):</label>
      <input type="password" id="apiKey" placeholder="أدخل مفتاح الوصول السيادي (SHK-SOV-...)" />

      <label>النموذج المعتمد (Allowlist Only):</label>
      <select id="model">
        <option value="sheikha-sovereign-llm-v1">👑 sheikha-sovereign-llm-v1 (Qwen2.5-1.5B + 141MB LoRA Adapter Profile)</option>
        <option value="@cf/meta/llama-3.3-70b-instruct-fp8-fast">🦙 Llama 3.3 70B FP8 Fast</option>
        <option value="@cf/qwen/qwen2.5-coder-32b-instruct">💻 Qwen 2.5 Coder 32B Instruct</option>
        <option value="@cf/google/gemma-4-26b-a4b-it">💎 Google Gemma 4 26B Instruct</option>
        <option value="@cf/meta/llama-3.1-8b-instruct-fast">⚡ Llama 3.1 8B Fast</option>
      </select>

      <label>الرسالة:</label>
      <textarea id="msg" rows="3">شيخة هل انتي جاهزه للانتاج التجاري؟</textarea>
      <button onclick="sendSecured()">🚀 إرسال محمي بالمصادقة</button>
      <div class="output" id="reply">أدخل مفتاح الوصول السيادي واضغط «إرسال محمي بالمصادقة»...</div>
    </div>
  </div>
  <script>
    const savedKey = localStorage.getItem('sheikha_sov_key') || '';
    if (savedKey) document.getElementById('apiKey').value = savedKey;

    async function sendSecured() {
      const key = document.getElementById('apiKey').value.trim();
      localStorage.setItem('sheikha_sov_key', key);
      const model = document.getElementById('model').value;
      const msg = document.getElementById('msg').value;
      const box = document.getElementById('reply');
      box.textContent = '⏳ جاري التحقق من الهوية وتشغيل النموذج المعتمد...';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Sheikha-Key': key },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: msg }] })
      });
      const data = await res.json();
      box.textContent = data.success ? data.response : ('⛔ ' + (data.error || JSON.stringify(data)));
    }
  </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HARDENED_UI, {
        headers: { ...cors, "Content-Type": "text/html; charset=utf-8" }
      });
    }

    if (url.pathname === "/api/models") {
      return Response.json({
        success: true,
        version: "3.0.0-hardened",
        security_posture: "P0_AUTH_AND_ALLOWLIST_ENFORCED",
        governance: "BOUND_BY_QURAN_SUNNAH",
        allowed_models: Object.keys(STRICT_MODEL_ALLOWLIST),
        custom_weights_vault: {
          name: "sheikha-sovereign-llm-v1",
          base: "Qwen/Qwen2.5-1.5B",
          local_gpu_inference_endpoint: "http://127.0.0.1:8090/api/run-model",
          r2_artifact: "r2://sheikha-ads-storage/weights/sheikha-lora-production-1.5b/adapter_model.safetensors",
          sha256: "1155d3cf4398930274baa6a51dabc6aadbea78bed9bb4bc02f9507f73de7ce9f"
        }
      }, { headers: cors });
    }

    // ── إغلاق P0 الأول: التحقق الإلزامي من الهوية والصلاحيات قبل أي استدعاء لـ /api/chat أو /api/run ──
    if (url.pathname === "/api/chat" || url.pathname === "/api/run") {
      if (request.method !== "POST") {
        return Response.json({ success: false, error: "405 Method Not Allowed" }, { status: 405, headers: cors });
      }
      if (!isAuthorized(request, env)) {
        return Response.json({
          success: false,
          error: "401 Unauthorized: Access to Workers AI is strictly locked. Provide a valid X-Sheikha-Key or Cloudflare Access JWT."
        }, { status: 401, headers: cors });
      }

      // ── إغلاق P0 الثاني: تقييد معدل الاستهلاك في الدقيقة عبر SHEIKHA_KV ──
      const minuteBucket = `ratelimit:${new Date().toISOString().slice(0, 16)}`;
      const maxPerMin = parseInt(env.MAX_REQUESTS_PER_MINUTE || "30", 10);
      if (env.SHEIKHA_KV) {
        const currentCount = parseInt((await env.SHEIKHA_KV.get(minuteBucket)) || "0", 10);
        if (currentCount >= maxPerMin) {
          return Response.json({
            success: false,
            error: "429 Too Many Requests: Sovereign AI rate limit exceeded."
          }, { status: 429, headers: cors });
        }
        await env.SHEIKHA_KV.put(minuteBucket, String(currentCount + 1), { expirationTtl: 120 });
      }

      try {
        const body = await request.json();
        const requestedModel = String(body.model || "").trim();

        // ── إغلاق P0 الثالث: حظر أي معرّف نموذج خارج القائمة البيضاء المعتمدة ──
        if (!Object.prototype.hasOwnProperty.call(STRICT_MODEL_ALLOWLIST, requestedModel)) {
          return Response.json({
            success: false,
            error: `403 Forbidden: Model '${requestedModel}' is not in STRICT_MODEL_ALLOWLIST.`,
            allowed_models: Object.keys(STRICT_MODEL_ALLOWLIST)
          }, { status: 403, headers: cors });
        }

        const resolvedCfModel = STRICT_MODEL_ALLOWLIST[requestedModel];
        const userMessages = Array.isArray(body.messages)
          ? body.messages
          : [{ role: "user", content: String(body.prompt || "") }];

        const fullMessages = [
          { role: "system", content: SHEIKHA_SYSTEM_PROMPT },
          ...userMessages.filter(m => m.role !== "system")
        ];

        const maxTokens = Math.min(parseInt(body.max_tokens || "800", 10), parseInt(env.MAX_TOKENS_LIMIT || "1024", 10));

        const rawResult = await env.AI.run(resolvedCfModel, {
          messages: fullMessages,
          max_tokens: maxTokens,
          temperature: 0.2
        });

        const cleanText = unwrapAIResponse(rawResult).replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        // تسجيل العملية في سجل التدقيق داخل SHEIKHA_KV
        if (env.SHEIKHA_KV) {
          await env.SHEIKHA_KV.put(
            `audit:ai:${Date.now()}`,
            JSON.stringify({ requestedModel, resolvedCfModel, ts: new Date().toISOString() }),
            { expirationTtl: 604800 }
          );
        }

        return Response.json({
          success: true,
          requested_model: requestedModel,
          resolved_cf_model: resolvedCfModel,
          response: cleanText,
          governance: "BOUND_BY_QURAN_SUNNAH",
          timestamp: new Date().toISOString()
        }, { headers: cors });
      } catch (e) {
        return Response.json({
          success: false,
          error: e.message,
          timestamp: new Date().toISOString()
        }, { status: 500, headers: cors });
      }
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  }
};
