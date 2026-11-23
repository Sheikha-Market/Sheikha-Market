import urllib.request, json

check_ports = [
    (18082, "النواة السيادية (Core Engine)"),
    (18162, "حارس الحوكمة واللوائح (Governance Watch C-29)"),
    (18094, "مختبر البناء والمعمارية (Construction & Arch C-33)"),
    (18154, "المشاريع والتوائم الرقمية (Projects & Twins C-26)"),
    (18159, "المقاولات والعقود والتراخيص (Contracting & EPC C-34)"),
    (18158, "العقارات والمدن الصناعية (Real Estate C-35)"),
    (18142, "الأصول الوقفية والإعمار (Assets C-32 & Imar C-19)")
]

print("================================================================================")
print("▶ فحص حي لتفعيل النواة والحوكمة والقطاعات الستة (V134 Live Verification)")
print("================================================================================")
for port, label in check_ports:
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/status", timeout=2) as r:
        data = json.loads(r.read().decode("utf-8"))
        fg = data.get("foundry_m2m_governance", {})
        print(f"✓ المنفذ {port} | {label:48s} | HTTP {r.status} | المدراء: {fg.get('chief_directorates')} | M2M: {fg.get('proliferated_m2m_total')} | التراخيص: {fg.get('licenses_and_certificates')}")
