import csv, json, hashlib, datetime
from pathlib import Path
REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"
NEW_3=[
("C-96","Chief E-Commerce Officer (CECO)","كبير مدراء التجارة الإلكترونية","10 POS Centers Moyasar Apple Pay STC Pay ZATCA UBL2.1 UUID f18f8146 BOL 11-Col 4-Ledgers 0.5/2.5/10/87% VAT15% 5000 HS MT-001 SHA 374c6686 18 Markets","100%",18163,18152,"W-ECOM-01..08","SHK-M2M-2026-0096"),
("C-97","Chief E-Marketing Officer (CEMO)","كبير مدراء التسويق الإلكتروني","100 Marketers SEO 8-Platforms Factory 18157 Universe 12-Domains 18161 Social Content Studio Analytics 10K Weights 128 Twins Halal Zero Gharar","99.96%",18152,18161,"W-EMKT-01..08","SHK-M2M-2026-0097"),
("C-98","Chief Identity Officer (CIDO)","كبير مدراء الهوية","Brand Identity Logo Registry edc795a4 12 Domains sheikha.sa Waqf Fixed No Sale SHA 0cf8bc3c Gold #d4af37 Green #00ff88 Dark #070c17 IBM Plex Arabic Lawh Mahfuz 535","100%",18152,18159,"W-ID-01..08","SHK-M2M-2026-0098"),
]
W_ECOM=[("W-ECOM-01","E-Com Platform 10 POS","وزن منصة التجارة 10 POS"),("W-ECOM-02","Payment Moyasar","وزن الدفع Moyasar Apple Pay"),("W-ECOM-03","ZATCA UBL2.1","وزن الفوترة ZATCA"),("W-ECOM-04","Settlement Waqf","وزن التسوية والوقف"),("W-ECOM-05","Logistics 24","وزن لوجستيات التجارة"),("W-ECOM-06","Pricing 5000 HS","وزن تسعير 5000 HS"),("W-ECOM-07","Markets 18","وزن الأسواق 18"),("W-ECOM-08","CX PWA","وزن تجربة العميل")]
W_EMKT=[("W-EMKT-01","Content Studio","وزن محتوى"),("W-EMKT-02","8-Platforms","وزن المنصات"),("W-EMKT-03","SEO","وزن SEO"),("W-EMKT-04","Social","وزن سوشيال"),("W-EMKT-05","Performance","وزن الأداء"),("W-EMKT-06","Email Automation","وزن البريد"),("W-EMKT-07","Branding Waqf","وزن العلامة وقف"),("W-EMKT-08","Analytics","وزن التحليل")]
W_ID=[("W-ID-01","Visual Identity","وزن الهوية البصرية"),("W-ID-02","Domain 12","وزن هوية النطاق 12"),("W-ID-03","Waqf Fixed","وزن هوية الوقف"),("W-ID-04","Licenses 279","وزن هوية الشهادات"),("W-ID-05","Colors Fonts","وزن الألوان والخطوط"),("W-ID-06","Voice Message","وزن الصوت والرسالة"),("W-ID-07","Product 5000 HS","وزن هوية المنتج"),("W-ID-08","Factory 50","وزن هوية المصنع")]
total=223;seeds=total*16;nodes=seeds*15;syn= nodes*16;org=total+total*4+total*12+total*36
print(f"✓ V144 {total}+5000= {total+5000} — {seeds} Seeds | {nodes} Nodes | {syn} Synaptic | {org} Org")
for c in NEW_3: print(f"  {c[0]} {c[2]} — {c[6]}")
