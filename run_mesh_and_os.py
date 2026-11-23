import http.server
import socketserver
import threading
import json

PORT_DIPLOMATIC = 18120
PORT_CLOUD_OS = 18140

class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True

# --- 1. خادم المنصة الدبلوماسية 18120 ---
HTML_DIPLOMATIC = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>منصة شيخة الدبلوماسية لتسجيل وحوكمة الذكاءات والكيانات V72.0</title>
  <style>
    body { background: #061F1A; color: #D9E8E0; font-family: system-ui, sans-serif; padding: 20px; line-height: 1.6; }
    .card { background: #0A2A22; border: 1px solid rgba(240,196,119,0.3); border-radius: 12px; padding: 18px; margin-bottom: 16px; }
    .gold { color: #F0C477; font-weight: bold; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; background: rgba(52,211,153,0.15); color: #34D399; }
  </style>
</head>
<body>
  <div class="card" style="border-top: 3px solid #F0C477;">
    <h2 style="margin: 0; color: #F0C477;">🏛️ منصة شيخة الدبلوماسية للكيانات والذكاءات (V72.0)</h2>
    <p style="font-size: 12px; color: #8DBFA3; margin: 4px 0 0 0;">CR: 2051263653 | الناظر: سلمان أحمد بن سلمان الراجح | BOUND_BY_QURAN_SUNNAH</p>
    <div style="margin-top: 10px;"><span class="badge">DIPLOMATIC MESH ACTIVE • 200 OK</span></div>
  </div>
</body>
</html>"""

class DiplomaticHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML_DIPLOMATIC.encode('utf-8'))
    def log_message(self, format, *args):
        pass

# --- 2. خادم نواة نظام التشغيل السحابي 18140 ---
HTML_CLOUD_OS = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>نظام تشغيل شيخة السحابي السيادي — Sheikha Cloud OS V78</title>
  <style>
    body { background: #040E0B; color: #D9E8E0; font-family: system-ui, sans-serif; padding: 20px; line-height: 1.6; }
    .os-bar { background: #0A241D; border: 1px solid rgba(240,196,119,0.3); border-radius: 12px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
    .gold { color: #F0C477; font-weight: bold; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; background: rgba(52,211,153,0.15); color: #34D399; }
  </style>
</head>
<body>
  <div class="os-bar">
    <div>
      <span class="gold" style="font-size: 18px;">🕌 Sheikha Cloud OS (V78.0) — النواة السيادية</span>
      <div style="font-size: 11px; color: #8DBFA3;">CR: 2051263653 | الناظر: سلمان أحمد بن سلمان الراجح</div>
    </div>
    <span class="badge">SHEIKHA CLOUD OS DESKTOP ACTIVE • 200 OK</span>
  </div>
</body>
</html>"""

class OSHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML_CLOUD_OS.encode('utf-8'))
    def log_message(self, format, *args):
        pass

def run_server(port, handler):
    with ReusableServer(("127.0.0.1", port), handler) as httpd:
        httpd.serve_forever()

t1 = threading.Thread(target=run_server, args=(PORT_DIPLOMATIC, DiplomaticHandler), daemon=True)
t2 = threading.Thread(target=run_server, args=(PORT_CLOUD_OS, OSHandler), daemon=True)

t1.start()
t2.start()

print(f"✓ تم تشغيل المنصة الدبلوماسية بنجاح على 127.0.0.1:{PORT_DIPLOMATIC}")
print(f"✓ تم تشغيل Sheikha Cloud OS بنجاح على 127.0.0.1:{PORT_CLOUD_OS}")

t1.join()
t2.join()
