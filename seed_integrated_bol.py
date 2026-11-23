import sqlite3
import uuid
import datetime

db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"

conn = sqlite3.connect(db_path)
c = conn.cursor()

# إسقاط الجدول القديم لمنع أي تعارض في الأعمدة
c.execute("DROP TABLE IF EXISTS digital_bills_of_lading;")

# إعادة إنشاء الجدول بالهيكل السليم
c.execute("""
CREATE TABLE IF NOT EXISTS digital_bills_of_lading (
    bol_number TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    exporter TEXT NOT NULL,
    importer TEXT NOT NULL,
    commodity TEXT NOT NULL,
    hs_code TEXT NOT NULL
);
""")

# بذر البيانات المتطابقة تماماً بـ 6 قيم
c.execute("INSERT OR REPLACE INTO digital_bills_of_lading VALUES (?, ?, ?, ?, ?, ?)", (
    f"SHK-BOL-{str(uuid.uuid4())[:8].upper()}",
    datetime.datetime.utcnow().isoformat(),
    "مجمع الجبيل الصناعي للمعادن (السعودية)",
    "شركة المقاولات التقنية المحدودة (دولي)",
    "قضبان النحاس النقي عالي التوصيل",
    "7403.11"
))

conn.commit()
conn.close()
print("✅ [BOL] تم إسقاط الجدول القديم المتعارض وإعادة تأسيس بوالص الشحن بنجاح تام!")
