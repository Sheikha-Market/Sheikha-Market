/**
 * SHEIKHA SOVEREIGN AI GATEWAY v1.0.0
 * بوابة تشغيل أي نموذج ذكاء اصطناعي
 * BOUND_BY_QURAN_SUNNAH
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ═══════════════════════════════════════════════════════════════
    // Routes
    // ═══════════════════════════════════════════════════════════════

    if (path === "/" || path === "/dashboard") {
      return new Response(getAIDashboard(), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    }

    if (path === "/api/models") {
      return jsonResponse(getAvailableModels(), corsHeaders);
    }

    if (path === "/api/run" && request.method === "POST") {
      return await handleRun(request, env, corsHeaders);
    }

    if (path === "/api/chat" && request.method === "POST") {
      return await handleChat(request, env, corsHeaders);
    }

    if (path === "/api/health") {
      return jsonResponse({
        status: "healthy",
        platform: "Sheikha Sovereign AI Gateway v1.0.0",
        governance: "BOUND_BY_QURAN_SUNNAH",
        timestamp: new Date().toISOString(),
      }, corsHeaders);
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};

// ═══════════════════════════════════════════════════════════════
// Run any model via Workers AI
// ═══════════════════════════════════════════════════════════════
async function handleRun(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { model, input, gateway_id } = body;

    if (!model) {
      return jsonResponse({ error: "model is required" }, corsHeaders, 400);
    }

    if (!env.AI) {
      return jsonResponse({ error: "AI binding not configured" }, corsHeaders, 500);
    }

    const options = {};
    if (gateway_id) {
      options.gateway = { id: gateway_id };
    }

    const response = await env.AI.run(model, input, options);

    return jsonResponse({
      success: true,
      model,
      response,
      timestamp: new Date().toISOString(),
    }, corsHeaders);
  } catch (e) {
    return jsonResponse({
      success: false,
      error: e.message,
      timestamp: new Date().toISOString(),
    }, corsHeaders, 500);
  }
}

// ═══════════════════════════════════════════════════════════════
// Chat endpoint — messages format
// ═══════════════════════════════════════════════════════════════
async function handleChat(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { messages, model, system_prompt } = body;

    const targetModel = model || "@cf/meta/llama-3.1-8b-instruct-fast";

    if (!messages || !Array.isArray(messages)) {
      return jsonResponse({ error: "messages array is required" }, corsHeaders, 400);
    }

    // Add system prompt if provided
    let fullMessages = [...messages];
    if (system_prompt) {
      fullMessages = [{ role: "system", content: system_prompt }, ...messages];
    }

    if (!env.AI) {
      return jsonResponse({ error: "AI binding not configured" }, corsHeaders, 500);
    }

    const response = await env.AI.run(targetModel, {
      messages: fullMessages,
    }, {
      gateway: { id: "default" },
    });

    return jsonResponse({
      success: true,
      model: targetModel,
      response: response.response || response,
      timestamp: new Date().toISOString(),
    }, corsHeaders);
  } catch (e) {
    return jsonResponse({
      success: false,
      error: e.message,
      timestamp: new Date().toISOString(),
    }, corsHeaders, 500);
  }
}

// ═══════════════════════════════════════════════════════════════
// Available models
// ═══════════════════════════════════════════════════════════════
function getAvailableModels() {
  return {
    text_generation: [
      { id: "@cf/meta/llama-3.1-8b-instruct-fast", name: "Llama 3.1 8B Fast", type: "chat" },
      { id: "@cf/meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B", type: "chat" },
      { id: "@cf/qwen/qwen2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", type: "code" },
      { id: "@cf/google/gemma-4-26b-a4b-it", name: "Gemma 4 26B", type: "chat" },
      { id: "@cf/deepseek/deepseek-v4-flash", name: "DeepSeek V4 Flash", type: "chat" },
    ],
    text_embedding: [
      { id: "@cf/baai/bge-large-en-v1.5", name: "BGE Large English", type: "embedding" },
      { id: "@cf/multilingual/e5-large", name: "Multilingual E5 Large", type: "embedding" },
    ],
    image_generation: [
      { id: "@cf/black-forest-labs/flux-1-schnell", name: "FLUX.1 Schnell", type: "image" },
    ],
    text_to_speech: [
      { id: "@cf/myshell-ai/melotts", name: "MeloTTS", type: "audio" },
    ],
    third_party: [
      { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini (via Gateway)", type: "chat" },
      { id: "openai/gpt-4o", name: "GPT-4o (via Gateway)", type: "chat" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4 (via Gateway)", type: "chat" },
    ],
    custom_weights: {
      name: "sheikha-sovereign-llm-v1",
      base: "Qwen/Qwen2.5-1.5B",
      adapter: "R2://sheikha-ads-storage/weights/sheikha-lora-production-1.5b/",
      params: "36,929,536",
      size: "141 MB",
      sha256: "1155d3cf4398930274baa6a51dabc6aadbea78bed9bb4bc02f9507f73de7ce9f",
      governance: "BOUND_BY_QURAN_SUNNAH",
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

function getAIDashboard() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🧠 شيخة — بوابة الذكاء الاصطناعي السيادية</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0a0e27; color: #e0e0e0; }
.header { background: linear-gradient(135deg, #1a1f3a, #2d1f4a); padding: 20px; text-align: center; border-bottom: 2px solid #4a3f6a; }
.header h1 { font-size: 28px; color: #c9a84c; }
.header p { color: #888; font-size: 14px; }
.container { max-width: 900px; margin: 20px auto; padding: 0 20px; }
.card { background: #141833; border: 1px solid #2a2f4a; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.card h2 { color: #c9a84c; margin-bottom: 15px; }
textarea, select, input { width: 100%; background: #1a1f3a; border: 1px solid #2a2f4a; color: #e0e0e0; padding: 10px; border-radius: 8px; font-family: inherit; }
textarea { min-height: 100px; resize: vertical; }
button { background: #c9a84c; color: #0a0e27; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }
button:hover { background: #d9b85c; }
.response { background: #1a1f3a; padding: 15px; border-radius: 8px; margin-top: 15px; white-space: pre-wrap; min-height: 50px; }
.model-select { margin-bottom: 10px; }
label { display: block; margin-bottom: 5px; color: #888; }
</style>
</head>
<body>
<div class="header">
  <h1>🧠 شيخة — بوابة الذكاء الاصطناعي السيادية</h1>
  <p>Sheikha Sovereign AI Gateway v1.0.0 — BOUND_BY_QURAN_SUNNAH 🛡️</p>
</div>
<div class="container">
  <div class="card">
    <h2>💬 محادثة مع النماذج</h2>
    <div class="model-select">
      <label>النموذج:</label>
      <select id="modelSelect">
        <option value="@cf/meta/llama-3.1-8b-instruct-fast">Llama 3.1 8B Fast</option>
        <option value="@cf/meta/llama-3.3-70b-instruct">Llama 3.3 70B</option>
        <option value="@cf/qwen/qwen2.5-coder-32b-instruct">Qwen 2.5 Coder 32B</option>
        <option value="@cf/google/gemma-4-26b-a4b-it">Gemma 4 26B</option>
      </select>
    </div>
    <div>
      <label>الرسالة:</label>
      <textarea id="chatInput" placeholder="اكتب سؤالك هنا..."></textarea>
    </div>
    <button onclick="sendChat()">إرسال</button>
    <div class="response" id="chatResponse">الاستجابة ستظهر هنا...</div>
  </div>
  <div class="card">
    <h2>📋 النماذج المتاحة</h2>
    <div id="modelsList">جاري التحميل...</div>
  </div>
</div>
<script>
async function sendChat() {
  const model = document.getElementById('modelSelect').value;
  const input = document.getElementById('chatInput').value;
  const resp = document.getElementById('chatResponse');
  resp.textContent = '⏳ جاري المعالجة...';
  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: input }],
        system_prompt: 'أنت شيخة، المساعد السيادي. تجيب بلغة عربية فصيحة. BOUND_BY_QURAN_SUNNAH'
      })
    });
    const data = await r.json();
    resp.textContent = data.success ? data.response : 'خطأ: ' + data.error;
  } catch(e) { resp.textContent = 'خطأ: ' + e.message; }
}
async function loadModels() {
  const r = await fetch('/api/models');
  const data = await r.json();
  const list = document.getElementById('modelsList');
  let html = '<h3>النص:</h3><ul>';
  data.text_generation.forEach(m => html += '<li>' + m.name + ' — <code>' + m.id + '</code></li>');
  html += '</ul><h3>التضمين:</h3><ul>';
  data.text_embedding.forEach(m => html += '<li>' + m.name + '</li>');
  html += '</ul><h3>الأوزان المملوكة:</h3><ul>';
  html += '<li>' + data.custom_weights.name + ' — ' + data.custom_weights.base + ' — ' + data.custom_weights.size + '</li>';
  html += '</ul>';
  list.innerHTML = html;
}
loadModels();
</script>
</body>
</html>`;
}
