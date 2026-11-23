import http.server
import socketserver

PORT = 18152

HTML = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>سوق شيخة السيادية ❖ التحالف التقني المشترك (Meta & Google)</title>
  <style>
    body { background: #040E0B; color: #D9E8E0; font-family: system-ui, sans-serif; margin: 0; padding: 24px; line-height: 1.8; }
    .header { background: #0A241D; border: 1px solid rgba(240,196,119,0.3); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .logos { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: bold; }
    .tag-shk { background: #F0C477; color: #040E0B; padding: 6px 14px; border-radius: 8px; }
    .tag-meta { background: #FFFFFF; color: #0064E0; padding: 6px 14px; border-radius: 8px; border: 1px solid #ddd; }
    .tag-goog { background: #FFFFFF; color: #4285F4; padding: 6px 14px; border-radius: 8px; border: 1px solid #ddd; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
    .card { background: #071D17; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
    .gold { color: #F0C477; font-weight: bold; }
    .teal { color: #34D399; font-weight: bold; }
    .blue { color: #6AAEFF; font-weight: bold; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; background: rgba(52,211,153,0.12); color: #34D399; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logos">
      <span class="tag-shk">🕌 سوق شيخة السيادية</span>
      <span style="color:#F0C477">✕</span>
      <span class="tag-meta">Meta</span>
      <span style="color:#F0C477">✕</span>
      <span class="tag-goog">Google</span>
    </div>
    <span class="badge">TRI-ALLIANCE SOVEREIGN HUB ACTIVE</span>
  </div>

  <div class="grid">
    <div class="card" style="border-top: 3px solid #F0C477;">
      <div class="gold">حوكمة شيخة كطبقة عليا حاكمة</div>
      <p style="font-size: 13px; color: #8DBFA3;">التدقيق الشرعي على المعاملات، حماية الأوزان (535 وزناً)، ونفي الربا والغرر في التجارة والحوسبة.</p>
      <div class="badge">Core: 18082 • Lawh Mahfuz edc795a4</div>
    </div>

    <div class="card" style="border-top: 3px solid #0064E0;">
      <div class="blue">تحالف Meta (إعمار الأرض والتجارة)</div>
      <p style="font-size: 13px; color: #8DBFA3;">تكامل المتاجر عبر Facebook وInstagram وWhatsApp مع كتالوج شيخة (18093) ودعم Llama 4.</p>
      <div class="badge">Portal: 18151 • Meta OAuth Ready</div>
    </div>

    <div class="card" style="border-top: 3px solid #4285F4;">
      <div style="color:#4285F4; font-weight:bold;">تحالف Google (الحوسبة المؤسسية والتنمية)</div>
      <p style="font-size: 13px; color: #8DBFA3;">معالجات Colab Pro+ (A100)، وخدمات Workspace Enterprise، وتطوير قطاع التجارة السحابية.</p>
      <div class="badge">Portal: 18150 • Annual Contract V91</div>
    </div>
  </div>
</body>
</html>"""

class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML.encode('utf-8'))
    def log_message(self, format, *args):
        pass

with ReusableServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.serve_forever()
