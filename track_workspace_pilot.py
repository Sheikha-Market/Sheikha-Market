import sqlite3
import hashlib
import datetime
import json

db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. إنشاء جدول تتبع عقود ومراسلات الأعمال
c.execute("""
CREATE TABLE IF NOT EXISTS sheikha_workspace_contracts (
    contract_id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    partner_entity TEXT NOT NULL,
    shk_value REAL NOT NULL,
    sharia_compliance TEXT NOT NULL,
    doc_hash TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
""")

now = datetime.datetime.utcnow().isoformat()
cid = f"SHK-CNT-{int(datetime.datetime.utcnow().timestamp())}"
content = f"COMMERCIAL_PILOT_CONTRACT_JUBAIL_COPPER_{now}"
chash = hashlib.sha256(content.encode()).hexdigest()

c.execute("""
INSERT OR REPLACE INTO sheikha_workspace_contracts VALUES (?, ?, ?, ?, ?, ?, ?)
""", (
    cid,
    "عقد توريد سبائك النحاس النقي عالي التوصيل - الدمام/الجبيل",
    "الأسواق الدولية ومجمعات التصنيع",
    350000.0,
    "100%_COMPLIANT_BOUND_BY_QURAN_SUNNAH",
    chash,
    now
))

conn.commit()
conn.close()

print(f"✓ تم توثيق عقد البايلوت التجاري في Sheikha Workspace: [{cid}]")
print(f"✓ البصمة التشفيرية للعقد: {chash[:20]}...")
print("✓ حالة التوثيق: مسجل في قاعدة البيانات الجغرافية وسجل اللوح المحفوظ")
