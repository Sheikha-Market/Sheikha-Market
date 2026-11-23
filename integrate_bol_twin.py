import sqlite3
import json
import uuid
import datetime

db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. إنشاء جدول بوالص الشحن الرقمية المربوط بالأسواق والتوائم
cursor.execute("""
CREATE TABLE IF NOT EXISTS digital_bills_of_lading (
    bol_number TEXT PRIMARY KEY,
    hs_code TEXT NOT NULL,
    commodity TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    exporter TEXT NOT NULL,
    importer TEXT NOT NULL,
    customs_status TEXT NOT NULL,
    compliance_seal TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    twin_product_uuid TEXT,
    blockchain_hash TEXT
);
""")

# 2. إنشاء وتوثيق بوليصة شحن ذكية فورية
bol_id = f"SHK-BOL-{str(uuid.uuid4())[:8].upper()}"
twin_id = str(uuid.uuid4())
now = datetime.datetime.utcnow().isoformat()
b_hash = "0x" + uuid.uuid4().hex + uuid.uuid4().hex

cursor.execute("""
INSERT OR REPLACE INTO digital_bills_of_lading VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    bol_id,
    "7403.11",
    "قضبان النحاس النقي عالي التوصيل (الجبيل/الدمام)",
    25000.0,
    "مجمع الجبيل الصناعي للمعادن (السعودية)",
    "شركة المقاولات التقنية الدولية (مستورد معتمد)",
    "CUSTOMS_CLEARED_BY_SHEIKHA_AI",
    "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    now,
    twin_id,
    b_hash
))

# 3. حقن التوأم الرقمي المربوط بالبوليصة في digital_twin_products
cursor.execute("""
CREATE TABLE IF NOT EXISTS digital_twin_products (
    product_uuid TEXT PRIMARY KEY,
    hs_code TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    resource_source_id TEXT,
    current_node_id TEXT,
    lifecycle_history TEXT
);
""")

cursor.execute("""
INSERT OR REPLACE INTO digital_twin_products VALUES (?, ?, ?, ?, ?, ?)
""", (
    twin_id,
    "7403.11",
    "قضبان النحاس النقي عالي التوصيل",
    "RES_COPPER_01",
    "NODE_JUBAIL_LOGISTICS",
    json.dumps([{"phase": "BOL_ISSUED", "bol": bol_id, "hash": b_hash, "time": now}], ensure_ascii=False)
))

conn.commit()
conn.close()

print(f"✅ تم دمج بوليصة الشحن [{bol_id}] بنجاح مع التوأم الرقمي [{twin_id}] وحفظها في قاعدة البيانات!")
