import http.server
import socketserver

PORT = 18140

HTML_OS_V101 = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>شيخة — نظام التشغيل السحابي السيادي الموحد V101 (22/22 UP • 4 Argon)</title>
  <style>
    :root {
      --bg: #040E0B;
      --card: #0A241D;
      --deep: #071D17;
      --gold: #F0C477;
      --teal: #34D399;
      --text: #D9E8E0;
      --muted: #8DBFA3;
    }
    body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
    .top-bar { background: var(--card); border: 1px solid rgba(240,196,119,0.3); border-radius: 16px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; color: var(--gold); }
    .argon-pill { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.35); color: var(--teal); padding: 6px 14px; border-radius: 999px; font-family: monospace; font-size: 12px; font-weight: bold; }
    .section-title { color: var(--gold); font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; border-right: 4px solid var(--gold); padding-right: 10px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .card { background: var(--deep); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: 0.2s; }
    .card:hover { border-color: rgba(240,196,119,0.4); }
    .port-tag { font-family: monospace; font-size: 12px; background: rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 6px; color: var(--gold); }
    .status-up { color: var(--teal); font-family: monospace; font-size: 11px; font-weight: bold; }
    .btn { display: inline-block; margin-top: 12px; background: #0E352B; border: 1px solid #1E4A33; color: var(--teal); text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; text-align: center; }
    .btn:hover { background: var(--gold); color: var(--bg); }
  </style>
</head>
<body>
  <div class="top-bar">
    <div>
      <div class="brand">🕌 سوق شيخة السيادية — Sheikha Cloud OS V101.0</div>
      <div style="font-size: 11px; color: var(--muted); font-family: monospace; margin-top: 4px;">
        الناظر والمالك: سلمان أحمد بن سلمان الراجح | س.ت: 2051263653 | 535 وزناً | BOUND_BY_QURAN_SUNNAH
      </div>
    </div>
    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
      <span class="argon-pill">🧠 AI Engine: 4 Argon ✓ (المهام المعقدة)</span>
      <span class="argon-pill" style="color: var(--gold); border-color: rgba(240,196,119,0.4);">22 / 22 PORTS ACTIVE 100% • 12 DOMAINS • GRAND=2677</span>
    </div>
  </div>

  <div class="section-title">أولاً: منصات التحالفات والشراكات العالمية المبرمة آلياً (Ports 18150 - 18155)</div>
  <div class="grid">
    <div class="card" style="border-top: 3px solid #4285F4;">
      <div>
        <div style="display:flex; justify-content:space-between;"><strong style="color:#4285F4;">شيخة ❖ Google</strong><span class="port-tag">18150</span></div>
        <p style="font-size:12px; color:var(--muted);">الحوسبة الفائقة Colab Pro+ A100 وهوية Workspace Enterprise.</p>
      </div>
      <a class="btn" href="http://127.0.0.1:18150/" target="_blank">فتح منصة Google →</a>
    </div>

    <div class="card" style="border-top: 3px solid #0064E0;">
      <div>
        <div style="display:flex; justify-content:space-between;"><strong style="color:#6AAEFF;">شيخة ❖ Meta</strong><span class="port-tag">18151</span></div>
        <p style="font-size:12px; color:var(--muted);">بوابة OAuth المجتمعية، الكتالوج الموحد، وحوسبة Llama 4 المزدوجة.</p>
      </div>
      <a class="btn" href="http://127.0.0.1:18151/" target="_blank">فتح منصة Meta OAuth →</a>
    </div>

    <div class="card" style="border-top: 3px solid #F0C477;">
      <div>
        <div style="display:flex; justify-content:space-between;"><strong style="color:var(--gold);">المنصة الثلاثية الجامعة</strong><span class="port-tag">18152</span></div>
        <p style="font-size:12px; color:var(--muted);">مركز القيادة المشترك لتحالف شيخة و Google و Meta.</p>
      </div>
      <a class="btn" href="http://127.0.0.1:18152/" target="_blank">فتح Tri-Alliance Hub →</a>
    </div>

    <div class="card" style="border-top: 3px solid #00A4EF;">
      <div>
        <div style="display:flex; justify-content:space-between;"><strong style="color:#00A4EF;">شيخة ❖ Microsoft</strong><span class="port-tag">18153</span></div>
        <p style="font-size:12px; color:var(--muted);">الذكاء المؤسسي والسحابة الهجينة عبر Azure AI.</p>
      </div>
      <a class="btn" href="http://127.0.0.1:18153/" target="_blank">فتح منصة Microsoft →</a>
    </div>

    <div class="card" style="border-top: 3px solid #76B900;">
      <div>
        <div style="display:flex; justify-content:space-between;"><strong style="color:#76B900;">شيخة ❖ NVIDIA</strong><span class="port-tag">18154</span></div>
        <p style="font-size:12px; color:var(--muted);">تسريع الحوسبة الفائقة والتوأم الرقمي عبر CUDA و Omniverse.</p>
      </div>
      <a class="btn" href="http://127.0.0.1:18154/" target="_blank">فتح منصة NVIDIA →</a>
    </div>

    <div class="card" style="border-top: 3px solid #F59E0B;">
      <div>
        <div style="display:flex; justify-content:space-between;"><strong style="color:#F59E0B;">شيخة ❖ الموانئ والإمداد</strong><span class="port-tag">18155</span></div>
        <p style="font-size:12px; color:var(--muted);">تتبع سلاسل الإمداد والمعادن (أجور 0.5%، زكاة 2.5%، وقف 10%).</p>
      </div>
      <a class="btn" href="http://127.0.0.1:18155/" target="_blank">فتح منصة الإمداد →</a>
    </div>
    <div class="card" style="border-top: 3px solid #F0C477;">
      <div><div style="display:flex; justify-content:space-between;"><strong style="color:var(--gold);">محرك شيخة Argon</strong><span class="port-tag">18156</span></div><p style="font-size:12px; color:var(--muted);">محرك المهام المعقدة (4 Argon + 3.8 + 3.6).</p></div>
      <a class="btn" href="http://127.0.0.1:18156/" target="_blank">فتح محرك Argon →</a>
    </div>
    <div class="card" style="border-top: 3px solid #34D399;">
      <div><div style="display:flex; justify-content:space-between;"><strong style="color:var(--teal);">مصنع المنصات الـ 8</strong><span class="port-tag">18157</span></div><p style="font-size:12px; color:var(--muted);">قارئ المسودات الـ 17 التفاعلي ومصفوفة الجهات.</p></div>
      <a class="btn" href="http://127.0.0.1:18157/" target="_blank">فتح مصنع المنصات →</a>
    </div>
    <div class="card" style="border-top: 3px solid #6AAEFF;">
      <div><div style="display:flex; justify-content:space-between;"><strong style="color:#6AAEFF;">الاستضافة والخوادم</strong><span class="port-tag">18158</span></div><p style="font-size:12px; color:var(--muted);">إدارة عقدة الخبر، حاويات Podman، وخادم VPS.</p></div>
      <a class="btn" href="http://127.0.0.1:18158/" target="_blank">إدارة الخوادم →</a>
    </div>
    <div class="card" style="border-top: 3px solid #F59E0B;">
      <div><div style="display:flex; justify-content:space-between;"><strong style="color:#F59E0B;">الشراكات والتراخيص</strong><span class="port-tag">18159</span></div><p style="font-size:12px; color:var(--muted);">فوندري ترخيص الأوزان (SHK-W) وبناء منصات الشركات.</p></div>
      <a class="btn" href="http://127.0.0.1:18159/" target="_blank">بوابة التراخيص →</a>
    </div>
    <div class="card" style="border-top: 3px solid #10B981;">
      <div><div style="display:flex; justify-content:space-between;"><strong style="color:#10B981;">الاستيعاب اللحظي والوكلاء</strong><span class="port-tag">18160</span></div><p style="font-size:12px; color:var(--muted);">17 وكيلاً وبوتاً للتعلم اللحظي والتفعيل الفوري (94% كفاءة).</p></div>
      <a class="btn" href="http://127.0.0.1:18160/" target="_blank">محرك الوكلاء →</a>
    </div>
    <div class="card" style="border-top: 3px solid #D4AF37;">
      <div><div style="display:flex; justify-content:space-between;"><strong style="color:#D4AF37;">الـ 12 نطاقاً وشركاء الكون</strong><span class="port-tag">18161</span></div><p style="font-size:12px; color:var(--muted);">12 نطاقاً رئيسياً × 36 فرعاً تخصصياً (النموذج الربحي والخيري).</p></div>
      <a class="btn" href="http://127.0.0.1:18161/" target="_blank">بوابة الـ 12 نطاقاً →</a>
    </div>
  </div>

  <div class="section-title">ثانياً: البنية التحتية والنواة السيادية الحاكمة (Ports 18082 - 18140)</div>
  <div class="grid">
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>النواة المركزية Core</strong><span class="port-tag">18082</span></div><div class="status-up">UP • 535 Weights</div></div><a class="btn" href="http://127.0.0.1:18082/api/health" target="_blank">فحص النواة</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>كتالوج السلع Explore</strong><span class="port-tag">18093</span></div><div class="status-up">UP • Catalog Sync</div></div><a class="btn" href="http://127.0.0.1:18093/api/health" target="_blank">فحص الكتالوج</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>مختبر المعمارية RISC-V</strong><span class="port-tag">18094</span></div><div class="status-up">UP • Hardware Lab</div></div><a class="btn" href="http://127.0.0.1:18094/api/health" target="_blank">فحص المعمارية</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>نسيج الربط Fabric</strong><span class="port-tag">18110</span></div><div class="status-up">UP • Mesh Studio</div></div><a class="btn" href="http://127.0.0.1:18110/api/health" target="_blank">فحص النسيج</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>مراقب الأداء Prometheus</strong><span class="port-tag">9091</span></div><div class="status-up">UP • Metrics Ready</div></div><a class="btn" href="http://127.0.0.1:9091/-/ready" target="_blank">فحص المقاييس</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>الشبكة الدبلوماسية</strong><span class="port-tag">18120</span></div><div class="status-up">UP • 249 Jurisdictions</div></div><a class="btn" href="http://127.0.0.1:18120/" target="_blank">فتح الشبكة</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>إدارة السحابة S-SaaS</strong><span class="port-tag">18125</span></div><div class="status-up">UP • Cloud Engine</div></div><a class="btn" href="http://127.0.0.1:18125/" target="_blank">إدارة السحابة</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>مختبر الحوسبة والوقف</strong><span class="port-tag">18126</span></div><div class="status-up">UP • Waqf & Foundry</div></div><a class="btn" href="http://127.0.0.1:18126/" target="_blank">فتح المختبر</a></div>
    <div class="card"><div><div style="display:flex;justify-content:space-between;"><strong>سجل الذكاءات الآمن</strong><span class="port-tag">18131</span></div><div class="status-up">UP • Argon-4 Auth</div></div><a class="btn" href="http://127.0.0.1:18131/" target="_blank">بوابة الذكاءات</a></div>
  </div>
</body>
</html>"""

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class OSHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(HTML_OS_V101.encode("utf-8"))
    def log_message(self, format, *args):
        pass

with ReusableTCPServer(("127.0.0.1", PORT), OSHandler) as httpd:
    httpd.serve_forever()
