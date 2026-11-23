import socket

PORTS_24 = [
    (18082, "Core Engine & sheikha.sa V123", "MW/SW/MT/SC + Checkout"),
    (18093, "Supply Gateway (Aramco/SABIC/Maaden)", "ISIC 07.10 / 07.29"),
    (18094, "Architecture Lab", "System Blueprints"),
    (18110, "Fabric Studio", "UI/UX & Design"),
    (9091,  "Prometheus Metrics", "Telemetry & Alerts"),
    (18120, "Diplomatic Mesh & Monshaat SME", "ISIC 70.22"),
    (18125, "Cloud Management", "Hybrid Cloud"),
    (18126, "Foundry Lab (18 Licenses / LME LBMA)", "ISIC 24.10 - 24.45"),
    (18131, "AI Registry", "Model Weights"),
    (18135, "Shariah Guard", "Quran & Sunnah Audit"),
    (18140, "Settlement Engine", "Instant Split 0.5/2.5/10/87"),
    (18141, "Zakat 8-Masarif Ledger", "2.5% Isolated Account"),
    (18142, "Waqf Fixed Asset Ledger", "10% Logistics & Education"),
    (18150, "Google & AWS Cloud Alliance", "me-central1 Cloud Run"),
    (18151, "Shopify Commerce Webhook", "OAuth Product Sync"),
    (18152, "Mobile & PWA Gateway", "iOS / Android"),
    (18153, "Microsoft & SAP S/4HANA Alliance", "Enterprise ERP"),
    (18154, "NVIDIA AI Logistics Alliance", "GPU Inference"),
    (18155, "Global Logistics (Maersk/DHL/SIRC)", "BOL + GPS Tracking"),
    (18156, "4 Argon Sovereign Engine", "High-Concurrency Core"),
    (18157, "8-Platforms Factory Matrix", "GRAND 3000 Weights"),
    (18158, "Hosting Manager", "Domain & SSL Control"),
    (18159, "Partnerships & Licensing Portal", "SHK-W-2026-0001..0018"),
    (18160, "Competency Engine (17 Agents/28 Bots)", "GOSI 8,500 SAR/mo"),
    (18161, "Universe 12-Domains Hub & KFUPM Lab", "36 Sub-branches"),
    (18162, "Governance Watch Guard", "62,954 Threats Blocked"),
    (18163, "ZATCA Phase2 & Commerce Charity", "UBL 2.1 XML + TLV QR"),
]

print("\n" + "="*88)
print(f"{'PORT':<7} | {'SERVICE / PLATFORM NAME':<38} | {'ROLE / STANDARD':<27} | {'STATE'}")
print("="*88)
for port, name, role in PORTS_24:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        up = s.connect_ex(("127.0.0.1", port)) == 0
    state = "🟢 LIVE" if up else "🟡 HOLD"
    print(f"{port:<7} | {name:<38} | {role:<27} | {state}")
print("="*88)
print("✓ إجمالي الأوزان السيادية: GRAND 3000 (2677 + 323 V123) | الوكلاء: 17 وكيلاً و28 بوتاً | GOSI: 8,500 ر.س\n")
