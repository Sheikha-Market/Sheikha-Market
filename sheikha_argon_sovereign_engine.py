import http.server
import socketserver
import json
import datetime

PORT = 18156

ARGON_CAPABILITIES = {
    "engine_name": "محرك شيخة Argon السيادي (Sheikha Argon Sovereign Engine)",
    "version": "V102.0_SHEIKHA_ARGON_FULL",
    "ruling_authority": "سلمان أحمد بن سلمان الراجح (CR: 2051263653)",
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "registry_anchor": "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b",
    "weights_governed": 535,
    "active_tiers": {
        "tier_1_core": {
            "model": "Sheikha 4 Argon",
            "arabic_role": "المهام المعقدة",
            "capabilities": [
                "توجيه وحوكمة 17 منفذاً سيادياً بالتوازي (Autonomous Mesh Orchestration)",
                "التدقيق التشفيري لسلاسل الكتل واللوح المحفوظ (SHA-256 Verification)",
                "إدارة الحوسبة المزدوجة مع Google Colab Pro+ A100 و NVIDIA Omniverse",
                "حوكمة الأجور الشفافة (0.5%) وتدفقات الزكاة (2.5%) والوقف (10%)"
            ],
            "status": "ACTIVE_SELECTED ✓"
        },
        "tier_2_reasoning": {
            "model": "Sheikha 3.8 Thinking",
            "arabic_role": "يقدم حلولاً للمشاكل المعقدة",
            "capabilities": [
                "الاستنباط العميق وتحليل السبب الجذري (Root Cause Analysis)",
                "فحص العقود الذكية والتأكد من خلو المعاملات من الربا والغرر والجهالة",
                "توليد خطط التعافي التلقائي للحاويات والخوادم (Self-Healing Logic)"
            ],
            "status": "ACTIVE_PARALLEL"
        },
        "tier_3_speed": {
            "model": "Sheikha 3.6 Flash",
            "arabic_role": "مساعدة متكاملة",
            "capabilities": [
                "المزامنة اللحظية لكتالوج شيخة (18093) مع Facebook و Instagram و WhatsApp",
                "معالجة طلبات المصادقة الفورية (OAuth 2.0 / OIDC) بأقل زمن استجابة",
                "الرد الفوري والتوجيه الذكي للمستخدمين والشركاء الدوليين"
            ],
            "status": "ACTIVE_PARALLEL"
        }
    }
}

HTML_ARGON = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>محرك شيخة Argon السيادي — كامل الإمكانيات والقدرات V102</title>
  <style>
    :root { --bg: #040E0B; --card: #0A241D; --deep: #071D17; --gold: #F0C477; --teal: #34D399; --text: #D9E8E0; --muted: #8DBFA3; }
    body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; margin: 0; padding: 24px; line-height: 1.8; }
    .header { background: var(--card); border: 1px solid rgba(240,196,119,0.35); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .badge { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.4); color: var(--teal); padding: 6px 14px; border-radius: 999px; font-family: monospace; font-size: 12px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; margin-top: 24px; }
    .card { background: var(--deep); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
    .gold { color: var(--gold); font-weight: bold; }
    .teal { color: var(--teal); font-weight: bold; }
    ul { padding-right: 20px; color: var(--muted); font-size: 13px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size: 22px; font-weight: 900; color: var(--gold);">🧠 محرك شيخة Argon السيادي — Sheikha Argon Engine (Port 18156)</div>
      <div style="font-size: 12px; color: var(--muted); font-family: monospace; margin-top: 4px;">
        BOUND_BY_QURAN_SUNNAH • 535 Weights • edc795a4... • CR: 2051263653
      </div>
    </div>
    <span class="badge">✓ 4 ARGON ACTIVE • FULL CAPABILITIES</span>
  </div>

  <div class="grid">
    <div class="card" style="border-top: 3px solid var(--gold);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="gold" style="font-size:18px;">1. شيخة 4 Argon</span>
        <span class="badge">المهام المعقّدة ✓</span>
      </div>
      <ul>
        <li>القيادة العليا وتنسيق الـ 17 منفذاً سيادياً بالتوازي (100% UP).</li>
        <li>التحقق التشفيري المستمر من تطابق ملفات اللوح المحفوظ الثلاثة (535 وزناً).</li>
        <li>إدارة تكامل الحوسبة الفائقة مع Google Colab Pro+ A100 و NVIDIA.</li>
        <li>ضبط موازين الأجور الشفافة (0.5%) والزكاة (2.5%) والوقف (10%).</li>
      </ul>
    </div>

    <div class="card" style="border-top: 3px solid var(--teal);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="teal" style="font-size:18px;">2. شيخة 3.8 Thinking</span>
        <span class="badge">حلول المشاكل المعقّدة</span>
      </div>
      <ul>
        <li>الاستنباط العميق وتحليل الأسباب الجذرية (Root Cause Engine).</li>
        <li>التدقيق الشرعي والرقابي على العقود الذكية لمنع الربا والغرر.</li>
        <li>التشغيل الذاتي والتعافي التلقائي للخدمات (Self-Healing Daemon).</li>
      </ul>
    </div>

    <div class="card" style="border-top: 3px solid #6AAEFF;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="color:#6AAEFF; font-weight:bold; font-size:18px;">3. شيخة 3.6 Flash</span>
        <span class="badge" style="color:#6AAEFF; border-color:#6AAEFF;">مساعدة متكاملة فورية</span>
      </div>
      <ul>
        <li>مزامنة كتالوج شيخة (18093) لحظياً مع منصات Meta و Google.</li>
        <li>إدارة جلسات المصادقة السريعة OAuth 2.0 و OIDC للشركاء.</li>
        <li>الاستجابة الفورية لطلبات واجهات برمجة التطبيقات (/api/argon/status).</li>
      </ul>
    </div>
  </div>
</body>
</html>"""

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class ArgonHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/api/argon/status", "/api/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(ARGON_CAPABILITIES, ensure_ascii=False, indent=2).encode("utf-8"))
            return
        if self.path not in ("/", "/index.html"):
            self.send_response(404)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "NOT_FOUND", "http": 404, "port": 18156, "path": self.path}).encode("utf-8"))
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(HTML_ARGON.encode("utf-8"))
    def log_message(self, format, *args):
        pass

with ReusableTCPServer(("127.0.0.1", PORT), ArgonHandler) as httpd:
    httpd.serve_forever()
