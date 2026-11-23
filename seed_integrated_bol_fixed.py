import sqlite3
import hashlib
import json
import uuid
import datetime

db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"

conn = sqlite3.connect(db_path)
c = conn.cursor()

# فحص أسماء الأعمدة في الجدول الحالي
c.execute("PRAGMA table_info(digital_bills_of_lading)")
columns_info = c.fetchall()
col_names = [col[1] for col in columns_info]

bol_id = f"SHK-BOL-{uuid.uuid4().hex[:8].upper()}"
now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

# بيانات البوليصة بالضوابط القانونية الاختبارية الصريحة
data = {
    "bol_number": bol_id,
    "timestamp": now_iso,
    "exporter": "مجمع الجبيل الصناعي للمعادن",
    "importer": "شركة المقاولات التقنية المحدودة",
    "hs_code": "7403.11",
    "commodity": "قضبان النحاس النقي عالي التوصيل",
    "weight_kg": 25000.0,
    "doc_hash": hashlib.sha256(f"{bol_id}-{now_iso}".encode()).hexdigest(),
    "sharia_compliance": "PENDING_HUMAN_AND_AUTHORITY_REVIEW",
    "status": "DRAFT_TEST_RECORD"
}

# إدراج مع تحديد أسماء الأعمدة المطابقة فقط
insert_cols = [k for k in data.keys() if k in col_names]
placeholders = ", ".join(["?"] * len(insert_cols))
cols_str = ", ".join(insert_cols)
values = [data[k] for k in insert_cols]

c.execute(f"INSERT OR REPLACE INTO digital_bills_of_lading ({cols_str}) VALUES ({placeholders})", values)
conn.commit()
conn.close()

print(f"✓ تم إدراج مسودة بوليصة الشحن بنجاح: {bol_id}")
print(f"✓ الحالة الحوكمية: {data['status']} | الختم: {data['sharia_compliance']}")
