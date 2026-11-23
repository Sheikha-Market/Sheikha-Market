import http.server
import socketserver
import json
import urllib.parse

PORT = 18151

HTML_META_PORTAL = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>شيخة ❖ Meta — بوابة التكامل التقني وOAuth والحوسبة المزدوجة V97</title>
  <style>
    body { background: #040E0B; color: #D9E8E0; font-family: system-ui, sans-serif; margin: 0; padding: 24px; line-height: 1.8; }
    .header { background: #0A241D; border: 1px solid rgba(240,196,119,0.3); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .logos { display: flex; align-items: center; gap: 14px; font-size: 20px; font-weight: bold; }
    .tag-shk { background: #F0C477; color: #040E0B; padding: 6px 16px; border-radius: 8px; }
    .tag-meta { background: #FFFFFF; color: #0064E0; padding: 6px 16px; border-radius: 8px; border: 1px solid #DDD; }
    .btn-oauth { background: #0064E0; color: #FFF; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; }
    .btn-oauth:hover { background: #0052b8; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
    .card { background: #071D17; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
    .gold { color: #F0C477; font-weight: bold; }
    .blue { color: #0064E0; font-weight: bold; }
    .teal { color: #34D399; font-weight: bold; }
    .mono { font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logos">
      <span class="tag-shk">🕌 سوق شيخة السيادية</span>
      <span style="color: #F0C477;">✕</span>
      <span class="tag-meta">Meta</span>
    </div>
    <div>
      <a href="/auth/meta/login" class="btn-oauth">تسجيل الدخول عبر Meta Login for Business</a>
    </div>
  </div>

  <div class="grid">
    <div class="card" style="border-top: 3px solid #0064E0;">
      <div class="blue">الحوسبة أولاً في Meta (Llama 4)</div>
      <p style="font-size: 13px; color: #8DBFA3;">معالجة وفهم المحتوى وتصنيف التجارة الإلكترونية ومنع الغرر عبر خوارزميات الذكاء الاصطناعي التوليدي.</p>
      <div class="mono" style="font-size: 11px; color: #34D399;">Model: Llama 4 • Port: 18131 Active</div>
    </div>

    <div class="card" style="border-top: 3px solid #F0C477;">
      <div class="gold">الحوسبة ثانياً في شيخة السيادية</div>
      <p style="font-size: 13px; color: #8DBFA3;">التدقيق الشرعي على المعاملات، حوسبة الزكاة (2.5%)، والوقف (10%)، والأجور الشفافة (0.5%) لوجه الله تعالى.</p>
      <div class="mono" style="font-size: 11px; color: #F0C477;">Core Engine: 18082 • 535 Weights</div>
    </div>

    <div class="card" style="border-top: 3px solid #34D399;">
      <div class="teal">شبكة المستخدمين في Google و Meta</div>
      <p style="font-size: 13px; color: #8DBFA3;">إتاحة الكتالوج والمنتجات للمستخدمين عبر Facebook Shops و Instagram و WhatsApp ومحركات Google.</p>
      <div class="mono" style="font-size: 11px; color: #34D399;">Syndication: 18093 Catalogue Live</div>
    </div>
  </div>
</body>
</html>"""

class MetaOAuthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/auth/meta/login":
            # محاكاة مسار التفويض OAuth الآمن
            state_token = "SHEIKHA_edc795a4_V97"
            redirect_url = f"/auth/meta/callback?code=AUTH_CODE_SUCCESS&state={state_token}"
            self.send_response(302)
            self.send_header('Location', redirect_url)
            self.end_headers()
            return
        elif parsed.path == "/auth/meta/callback":
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            resp = """<html dir='rtl'><body style='background:#040E0B;color:#34D399;font-family:sans-serif;padding:30px;'>
            <h2>✓ تم التحقق والمصادقة بنجاح عبر Meta OAuth</h2>
            <p style='color:#D9E8E0;'>تم ربط الحساب باللوح المحفوظ لشيخة (535 وزناً) بالبصمة edc795a4...</p>
            <a href='/' style='color:#F0C477;'>العودة إلى المنصة المشتركة</a></body></html>"""
            self.wfile.write(resp.encode('utf-8'))
            return

        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML_META_PORTAL.encode('utf-8'))

    def log_message(self, format, *args):
        pass

class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableServer(("127.0.0.1", PORT), MetaOAuthHandler) as httpd:
    httpd.serve_forever()
