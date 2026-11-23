import http.server
import socketserver

PORT = 18150

HTML_PAGE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>شيخة ❖ Google — منصة التحليل المشترك وتطوير بنود التنمية V96</title>
  <style>
    body { background: #040E0B; color: #D9E8E0; font-family: system-ui, sans-serif; margin: 0; padding: 24px; line-height: 1.8; }
    .header { background: #0A241D; border: 1px solid rgba(240,196,119,0.3); border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
    .logos { display: flex; align-items: center; gap: 14px; font-size: 18px; font-weight: bold; }
    .shk-tag { background: #F0C477; color: #040E0B; padding: 6px 14px; border-radius: 8px; }
    .goog-tag { background: #FFFFFF; color: #4285F4; padding: 6px 14px; border-radius: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 20px; }
    .card { background: #071D17; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; }
    .gold { color: #F0C477; font-weight: bold; }
    .teal { color: #34D399; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { text-align: right; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    th { color: #F0C477; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logos">
      <span class="shk-tag">🕌 سوق شيخة السيادية</span>
      <span style="color: #F0C477;">❖</span>
      <span class="goog-tag">Google Enterprise</span>
    </div>
    <div style="font-size: 12px; color: #8DBFA3;">التحالف السنوي لتنمية التجارة الإلكترونية وإعمار الأرض V96</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="gold">التجارة الإلكترونية النزيهة</div>
      <p style="font-size: 12px; color: #8DBFA3;">تداول السلع الحقيقية والمعادن النقية بلا غرر وبأجور 0.5% شفافة.</p>
    </div>
    <div class="card">
      <div class="teal">الحوسبة الفائقة والتشغيل الذاتي</div>
      <p style="font-size: 12px; color: #8DBFA3;">ربط Colab Pro+ (A100) بمحرك الأوركسترا لضمان استقرار الشبكة 24/7.</p>
    </div>
    <div class="card">
      <div style="color: #5AB8FF; font-weight: bold;">الحوكمة والعمل الخيري</div>
      <p style="font-size: 12px; color: #8DBFA3;">أتمتة مخصص الزكاة (2.5%) والوقف التنموي المستدام (10%) لوجه الله تعالى.</p>
    </div>
  </div>

  <div class="card" style="margin-top: 20px;">
    <div class="gold">مصفوفة بنود ميثاق الشراكة السنوي (شيخة ❖ Google):</div>
    <table>
      <thead>
        <tr><th>البند</th><th>المضمون التعاقدي</th><th>الحالة</th></tr>
      </thead>
      <tbody>
        <tr><td>المدة والتجديد</td><td>سنة ميلادية كاملة تتجدد تلقائياً بالتراضي قبل 30 يوماً</td><td>معتمد سارٍ</td></tr>
        <tr><td>الهوية المشتركة</td><td>ظهور شعار شيخة وشعار Google معاً بشكل متكافئ وإلزامي</td><td>ملتزم به</td></tr>
        <tr><td>المناصحة وإعمار الأرض</td><td>الالتزام بالأمر بالمعروف والنهي عن المنكر والصدق المهني</td><td>BOUND_BY_QURAN</td></tr>
      </tbody>
    </table>
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
        self.wfile.write(HTML_PAGE.encode('utf-8'))
    def log_message(self, format, *args):
        pass

with ReusableServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.serve_forever()
