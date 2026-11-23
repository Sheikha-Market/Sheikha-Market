import sqlite3
import hashlib
import uuid
import datetime
import pathlib
import sys

db_path = pathlib.Path("/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3")

if not db_path.exists():
    print(f"⚠️ لم يتم العثور على قاعدة البيانات في: {db_path}")
    sys.exit(0)

conn = sqlite3.connect(str(db_path))
c = conn.cursor()

# 1. فحص مخطط الجدول الفعلي
c.execute("PRAGMA table_info(digital_bills_of_lading);")
cols_info = c.fetchall()
existing_cols = [col[1] for col in cols_info]

bol_id = f"SHK-BOL-{uuid.uuid4().hex[:8].upper()}"
now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

# 2. تجهيز البيانات بأسماء الحقول الصريحة
data = {
    "bol_number": bol_id,
    "timestamp": now_iso,
    "exporter": "مجمع الجبيل الصناعي للمعادن",
    "importer": "شركة المقاولات التقنية المحدودة",
    "hs_code": "7403.11",
    "commodity": "قضبان النحاس النقي عالي التوصيل",
    "weight_kg": 25000.0,
    "origin": "SA",
    "destination": "SA",
    "value_sar": 350000.0,
    "doc_hash": hashlib.sha256(f"{bol_id}-{now_iso}".encode()).hexdigest(),
    "sharia_compliance": "PENDING_HUMAN_AND_AUTHORITY_REVIEW",
    "status": "DRAFT_TEST_RECORD"
}

# 3. إدراج مطابق للأعمدة الموجودة فقط
target_cols = [k for k in data.keys() if k in existing_cols]
placeholders = ", ".join(["?"] * len(target_cols))
cols_str = ", ".join(target_cols)
values = [data[k] for k in target_cols]

sql = f"INSERT OR REPLACE INTO digital_bills_of_lading ({cols_str}) VALUES ({placeholders})"
c.execute(sql, values)
conn.commit()
conn.close()

print(f"✓ تم إدراج البوليصة التجريبية بنجاح: {bol_id}")
print(f"✓ عدد الأعمدة المطابقة: {len(target_cols)}")
print(f"✓ الحالة القانونية: {data['status']}")
