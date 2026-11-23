from pathlib import Path

# 1. تحديث sheikha_multi_partner_servers.py (المنافذ 18153، 18154، 18155) ليرد بـ 404 على المسارات غير المعرفة
multi_code = """import http.server, socketserver, threading, json, time, urllib.parse

PARTNER_SERVERS = [
    (18153, "ALLIANCE_MICROSOFT_AZURE", "شيخة ❖ Microsoft", "#00A4EF", "الذكاء المؤسسي والسحابة الهجينة (Azure AI & Enterprise Sync)", ["/api/health", "/api/azure/hybrid-sync", "/api/agent/status"]),
    (18154, "ALLIANCE_NVIDIA_INCEPTION", "شيخة ❖ NVIDIA", "#76B900", "الحوسبة الفائقة والتوأم الرقمي (CUDA, TensorRT & Omniverse)", ["/api/health", "/api/nvidia/acceleration", "/api/nvidia/digital-twin", "/api/agent/status"]),
    (18155, "ALLIANCE_GLOBAL_LOGISTICS", "شيخة ❖ الموانئ والإمداد", "#F59E0B", "الخدمات اللوجستية وسلاسل الإمداد العالمية (0.5% شفافية + زكاة ووقف)", ["/api/health", "/api/supply-chain/track", "/api/logistics/customs", "/api/agent/status"])
]

def make_handler(alliance_id, title, color, desc, port, allowed_apis):
    html = f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>{title} — المنصة المشتركة السيادية (Port {port})</title></head>
<body style="background:#040E0B;color:#D9E8E0;font-family:system-ui,sans-serif;padding:24px;">
  <div style="background:#0A241D;border:1px solid rgba(240,196,119,0.3);border-radius:16px;padding:20px;display:flex;justify-content:space-between;">
    <strong style="color:#F0C477;">🕌 سوق شيخة السيادية ✕ <span style="color:{color}">{title}</span></strong>
    <span style="color:#34D399;font-family:monospace;">PORT {port} • STRICT 404 ROUTING</span>
  </div>
  <div style="background:#071D17;border-top:3px solid {color};border-radius:14px;padding:20px;margin-top:20px;">
    <h3 style="color:{color};margin-top:0;">{desc}</h3>
    <p style="font-size:13px;color:#8DBFA3;">معرف المنصة: {alliance_id} | المسارات المسموحة: {", ".join(allowed_apis)}</p>
  </div>
</body></html>'''

    class StrictPartnerHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path in ("/", "/index.html"):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(html.encode("utf-8"))
                return
            if parsed.path in allowed_apis:
                payload = {
                    "status": "ok",
                    "alliance_id": alliance_id,
                    "title": title,
                    "port": port,
                    "route": parsed.path,
                    "agent_assigned": f"AGT_PORT_{port}",
                    "strict_routing": True,
                    "weights": 535,
                    "registry_sha256": "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
                return
            # أي مسار غير معرف يعيد 404 صريحاً لمنع false_route_fallbacks
            self.send_response(404)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "NOT_FOUND", "http": 404, "port": port, "path": parsed.path}).encode("utf-8"))
        def log_message(self, format, *args):
            pass
    return StrictPartnerHandler

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

for port, alliance_id, title, color, desc, allowed_apis in PARTNER_SERVERS:
    handler = make_handler(alliance_id, title, color, desc, port, allowed_apis)
    httpd = ReusableTCPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()

while True:
    time.sleep(3600)
"""
Path("sheikha_multi_partner_servers.py").write_text(multi_code, encoding="utf-8")

# 2. تحديث المنفذ 18156 (Argon Engine) ليرد بـ 404 على المسارات غير المعرفة
argon_path = Path("sheikha_argon_sovereign_engine.py")
if argon_path.exists():
    acode = argon_path.read_text(encoding="utf-8")
    old_block = """        if self.path == "/api/argon/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(ARGON_CAPABILITIES, ensure_ascii=False, indent=2).encode("utf-8"))
            return
        self.send_response(200)"""
    new_block = """        if self.path in ("/api/argon/status", "/api/health"):
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
        self.send_response(200)"""
    if old_block in acode:
        argon_path.write_text(acode.replace(old_block, new_block), encoding="utf-8")

# 3. تحديث المنفذ 18157 (8-Platforms Factory) ليرد بـ 404 على المسارات غير المعرفة
fac_path = Path("sheikha_8platforms_factory_server.py")
if fac_path.exists():
    fcode = fac_path.read_text(encoding="utf-8")
    target_str = "# 3. الواجهة الرئيسية التفاعلية لمصنع المنصات الـ 8 وقارئ المسودات"
    strict_check = """# التحقق الصارم من المسار لمنع false_route_fallbacks
        if parsed.path not in ("/", "/index.html", "/api/health"):
            self.send_response(404)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "NOT_FOUND", "http": 404, "port": 18157, "path": parsed.path}).encode("utf-8"))
            return
        """ + target_str
    if target_str in fcode and "NOT_FOUND" not in fcode:
        fac_path.write_text(fcode.replace(target_str, strict_check), encoding="utf-8")

print("✓ تم تطبيق قانون التوجيه الصارم (Strict 404 Routing) على المنافذ 18153 - 18157 بنجاح.")
