import http.server, socketserver
PORT = 18151
HTML = """<!DOCTYPE html><html lang="ar" dir="rtl"><head><【entity-meta¦canonical_name=Meta】 charset="UTF-8"><title>شيخة ❖ 【entity-Meta¦canonical_name=Meta】 - الشراكة المجتمعية لإعمار الأرض V83</title>
<style>body{background:#040E0B;color:#D9E8E0;font-family:system-ui;padding:24px;line-height:1.7}
.header{background:#0A241D;border:1px solid rgba(240,196,119,0.3);border-radius:16px;padding:24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px}
.sheikha-tag{background:#F0C477;color:#040E0B;padding:6px 16px;border-radius:8px;font-weight:bold}
.【entity-meta¦canonical_name=Meta】-tag{background:#fff;color:#0064E0;padding:6px 16px;border-radius:8px;font-weight:bold;border:1px solid #ddd}
.badge{background:rgba(52,211,153,0.12);color:#34D399;padding:4px 12px;border-radius:9999px;font-size:11px;border:1px solid rgba(52,211,153,0.3)}
.card{background:#071D17;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;margin-top:16px}
.gold{color:#F0C477;font-weight:bold}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:20px}
</style></head><body>
<div class="header"><div style="display:flex;align-items:center;gap:16px;font-size:20px;font-weight:bold"><span class="sheikha-tag">🕌 سوق شيخة السيادية</span><span style="color:#F0C477">✕</span><span class="meta-tag">Meta</span></div><div><span class="badge">COMMUNITY ALLIANCE ACTIVE V83</span></div></div>
<div class="grid">
<div class="card"><h3 class="gold">إعمار الأرض</h3><p>【entity-Facebook¦canonical_name=Facebook】 Shops + 【entity-Instagram¦canonical_name=Instagram】 Shopping + 【entity-WhatsApp¦canonical_name=WhatsApp】 Catalog ↔ كتالوج شيخة 18093</p></div>
<div class="card"><h3 class="gold">التنمية المستدامة</h3><p>زكاة 2.5% + وقف 10% + 0.5% شفافة - Lawh Mahfuz 535 وزن edc795a4</p></div>
<div class="card"><h3 class="gold">الرفع المشترك</h3><p>Joint Mutual Lift - منتجات شيخة في 【entity-Meta Commerce¦canonical_name=Meta】</p></div>
<div class="card"><h3 class="gold">التعاون التقني</h3><p>Llama 4 + Sheikha Core ZERO ROBOT 535 + 【entity-Meta AI Studio¦canonical_name=Meta】</p></div>
</div>
<div class="card"><h3 class="gold">📊 لوحة المراقبة المشتركة 12/12</h3><p>18082 Core 535 UP | 18120 Diplomatic | 18125 S-SaaS | 18126 SHEIKHAaaS | 18140 Cloud OS | 18150 Google | 18151 【entity-Meta¦canonical_name=Meta】 (هذا المنفذ)</p><p style="font-family:monospace;font-size:11px;color:#8DBFA3">BOUND_BY_QURAN_SUNNAH - CR 2051263653 - 675d4b3c...</p></div>
</body></html>"""
class H(http.server.SimpleHTTPRequestHandler):
 def do_GET(self): self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8'); self.end_headers(); self.wfile.write(HTML.encode())
 def log_message(self,*a): pass
class R(socketserver.TCPServer): allow_reuse_address=True
with R(("127.0.0.1",PORT),H) as httpd: print(f"Sheikha x 【entity-Meta¦canonical_name=Meta】 on {PORT}"); httpd.serve_forever()
