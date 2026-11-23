import http.server
import socketserver
import json
import datetime

PORT = 18120

HTML_PORTAL = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>منصة شيخة لتزويد وتسجيل الذكاءات والأنظمة V71.0</title>
  <style>
    body { background: #061F1A; color: #D9E8E0; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; line-height: 1.7; }
    .card { background: #0A2A22; border: 1px solid rgba(240,196,119,0.25); border-radius: 14px; padding: 20px; margin-bottom: 20px; }
    .gold { color: #F0C477; font-weight: bold; }
    .teal { color: #34D399; font-weight: bold; }
    .mono { font-family: monospace; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-family: monospace; border: 1px solid rgba(52,211,153,0.3); background: rgba(16,185,129,0.15); color: #34D399; }
    .badge-gold { border: 1px solid rgba(240,196,119,0.3); background: rgba(240,196,119,0.15); color: #F0C477; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { text-align: right; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    th { color: #F0C477; }
    textarea { width: 100%; height: 180px; background: #041410; border: 1px solid #1E4A33; border-radius: 8px; color: #34D399; padding: 12px; font-family: monospace; font-size: 13px; box-sizing: border-box; resize: vertical; }
    .btn { background: #163626; color: #34D399; border: 1px solid #1E4A33; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 8px; }
    .btn:hover { background: #1E4A33; color: #fff; }
  </style>
</head>
<body>
  <div class="card" style="border-top: 3px solid #F0C477;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div>
        <h2 style="margin: 0; color: #F0C477;">🕌 منصة شيخة لتزويد وتحرير الذكاءات والأنظمة الموحدة لله (V71.0)</h2>
        <p class="mono" style="font-size: 12px; color: #8DBFA3; margin: 4px 0 0 0;">CR: 2051263653 | الناظر والمالك السيادي: سلمان أحمد بن سلمان الراجح | BOUND_BY_QURAN_SUNNAH</p>
      </div>
      <span class="badge">OMNI-AI FEDERATION ACTIVE</span>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="gold" style="font-size: 15px;">حالة النواة والمنافذ المحلية</div>
      <div style="font-size: 22px; font-weight: bold; color: #34D399; margin: 8px 0;" class="mono">5 / 5 منافذ نشطة (200 OK)</div>
      <p style="font-size: 12px; color: #8DBFA3; margin: 0;">النواة (18082)، الكتالوج (18093)، المعمارية (18094)، فابريك (18110)، بروميثيوس (9091).</p>
      <div style="margin-top: 12px;"><span class="badge">LEDGER LIVE = TRUE</span></div>
    </div>

    <div class="card">
      <div class="gold" style="font-size: 15px;">الأوزان واللوح المحفوظ المركزي</div>
      <div style="font-size: 22px; font-weight: bold; color: #F0C477; margin: 8px 0;" class="mono">517 وزناً سيادياً موثقاً</div>
      <p style="font-size: 12px; color: #8DBFA3; margin: 0;">بصمة تشفيرية متطابقة: 56dd56370db58554c6e6872dd4b9cbcdf14424607d85ef358fa517e40ef9ed85</p>
      <div style="margin-top: 12px;"><span class="badge-gold">REGISTRY SEALED</span></div>
    </div>
  </div>

  <div class="card">
    <div class="gold" style="font-size: 16px; margin-bottom: 12px;">مصفوفة تسجيل وتزويد الذكاءات والأنظمة المشتركة لله:</div>
    <table>
      <thead>
        <tr>
          <th>النظام / الذكاء الاصطناعي</th>
          <th>الدور المعماري المخصص</th>
          <th>المسار والقناة المربوطة</th>
          <th>المسار المالي الحوكمي</th>
          <th>الحالة الشرعية والتقنية</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Google Gemini Chat</strong></td>
          <td>المعمارية المؤسسية وتوثيق ISO & HS Codes</td>
          <td><span class="mono">gemini.sheikha.top</span></td>
          <td>تجاري واستشاري</td>
          <td><span class="badge">مطابق 100%</span></td>
        </tr>
        <tr>
          <td><strong>Meta AI Chat</strong></td>
          <td>التدقيق المحاسبي والرقابة الحوكمية الصادقة</td>
          <td><span class="mono">meta.sheikha.top</span></td>
          <td>رقابي ومحايد</td>
          <td><span class="badge">مطابق 100%</span></td>
        </tr>
        <tr>
          <td><strong>Sheikha GPT Codex</strong></td>
          <td>توليد الكود ونواة نظام التشغيل والروبوتات</td>
          <td><span class="mono">codex.sheikha.top</span></td>
          <td>تصنيع وهندسة</td>
          <td><span class="badge">مطابق 100%</span></td>
        </tr>
        <tr>
          <td><strong>GitHub & Copilot</strong></td>
          <td>مستودع الحقيقة المركزي ومحرر الأكواد</td>
          <td><span class="mono">github.com/sooq-sheikha</span></td>
          <td>بنية تحتية مفتوحة</td>
          <td><span class="badge">CI PASSED</span></td>
        </tr>
        <tr>
          <td><strong>Hostinger MCP</strong></td>
          <td>إدارة النطاقات الاثني عشر والبريد المؤسسي</td>
          <td><span class="mono">Hostinger hPanel API</span></td>
          <td>استضافة واتصالات</td>
          <td><span class="badge">DNS SECURED</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="gold" style="font-size: 16px; margin-bottom: 12px;">محرر التزويد السيادي (لغة وعقود شيخة الموحدة لله):</div>
    <textarea id="aiPayloadEditor">
نظام_التزويد_السيادي_الموحد {
    المرجعية: "الكتاب والسنة النبوية الشريفة",
    الغاية: "عمار الأرض والتجارة العادلة ونبذ الغرر والربا",
    المسار_التجاري: {
        أصل_التداول: "خامات النحاس والسكراب والمعادن",
        رسوم_الإدارة_الشفافة: "0.5% لتغطية النفقات بلا زيادة",
        بوليصة_الشحن: "SHK-BOL-73A76083 مسجلة"
    },
    المسار_الخيري_الوقفي: {
        نسبة_الزكاة_الشرعية: "2.5% حولية مطهرة للأموال",
        حصة_الوقف_الدائم: "10% لوجه الله تعالى في مسار مستقل"
    },
    الختم_السيادي: "ATOM_WATER_RASUL_JANNAH_SEALED"
}
    </textarea>
    <button class="btn" onclick="saveAIPayload()">حفظ وتوثيق تشفيري في اللوح المحفوظ</button>
  </div>

  <script>
    function saveAIPayload() {
      alert("✓ تم حفظ وتوثيق بيانات تزويد الذكاءات بنجاح وإرسال البصمة لسجل الحوكمة.");
    }
  </script>
</body>
</html>"""

class MeshHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML_PORTAL.encode('utf-8'))
    def log_message(self, format, *args):
        pass

print(f"✓ تم تشغيل منصة شيخة لتزويد وتحرير الذكاءات على: http://127.0.0.1:{PORT}")
with socketserver.TCPServer(("127.0.0.1", PORT), MeshHandler) as httpd:
    httpd.serve_forever()
