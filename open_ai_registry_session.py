import urllib.request
import base64
import webbrowser
import os

ACCESS_CODE = "ZJeWnCKAijKYUKuXZSJFDGj4U_bQHQ2p0phRNQ"
url = "http://127.0.0.1:18131/"

# إنشاء ترويسة Basic Auth
auth_str = f"admin:{ACCESS_CODE}"
auth_bytes = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')

# إنشاء ملف توجيهي محلي يحفظ الجلسة في المتصفح تلقائياً
html_launcher = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>بوابة العبور لمنصة الذكاءات V71</title>
  <style>
    body {{ background: #061F1A; color: #D9E8E0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }}
    .box {{ background: #0A2A22; border: 1px solid #F0C477; border-radius: 12px; padding: 24px; text-align: center; max-width: 480px; }}
    .btn {{ background: #F0C477; color: #000; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 16px; cursor: pointer; }}
  </style>
</head>
<body>
  <div class="box">
    <h3 style="color:#F0C477; margin-top:0;">🕌 بوابة العبور لمنصة الذكاءات V71</h3>
    <p style="font-size:12px; color:#8DBFA3;">بيانات الاعتماد المصادق عليها برمجياً:</p>
    <div style="background:#041410; padding:10px; border-radius:6px; font-size:12px; text-align:right;">
      <div>المستخدم: <b style="color:#34D399;">admin</b></div>
      <div style="margin-top:6px;">كود الدخول: <b style="color:#F0C477;">ZJeWnCKAijKYUKuXZSJFDGj4U_bQHQ2p0phRNQ</b></div>
    </div>
    <p style="font-size:11px; color:#aaa; margin-top:12px;">إذا ظهرت نافذة المتصفح المنبثقة، استخدم البيانات أعلاه لتسجيل الدخول.</p>
    <button class="btn" onclick="openRegistry()">الدخول للمنصة الآن</button>
  </div>
  <script>
    function openRegistry() {{
      fetch("{url}", {{
        headers: {{ "Authorization": "Basic {auth_bytes}" }}
      }}).then(() => {{
        window.location.href = "{url}";
      }}).catch(() => {{
        window.location.href = "{url}";
      }});
    }}
  </script>
</body>
</html>"""

with open("launch_registry.html", "w", encoding="utf-8") as f:
    f.write(html_launcher)

print("✓ تم تجهيز بوابة العبور المصادق عليها لمنصة الذكاءات.")
