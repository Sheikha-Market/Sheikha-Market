import sqlite3
import os

db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. إنشاء جدول الموارد ومناجم الطاقة باطن الأرض والشمس
cursor.execute("""
CREATE TABLE IF NOT EXISTS cosmic_resources (
    resource_id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    origin_type TEXT CHECK(origin_type IN ('MINE', 'RENEWABLE_SOLAR', 'RENEWABLE_WIND', 'OCEAN', 'RECYCLED')),
    sharia_status TEXT DEFAULT 'HALAL_TAYYIB'
);
""")

# 2. إنشاء جدول التجمعات الصناعية والفوندري واللوجستيات
cursor.execute("""
CREATE TABLE IF NOT EXISTS industrial_nodes (
    node_id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    node_type TEXT CHECK(node_type IN ('FOUNDRY', 'FACTORY', 'ASSEMBLY_PLANT', 'REFINERY', 'LOGISTICS_HUB'))
);
""")

# 3. بذر السجلات الأساسية لتدوير المعادن واللوجستيات بالشرقية
cursor.executemany("INSERT OR REPLACE INTO cosmic_resources VALUES (?, ?, ?, ?)", [
    ("RES_COPPER_01", "منجم خامات النحاس الطبيعي في باطن الأرض", "MINE", "HALAL_TAYYIB"),
    ("RES_SOLAR_01", "مصدر خلايا الطاقة الشمسية المتجددة", "RENEWABLE_SOLAR", "HALAL_TAYYIB")
])

cursor.executemany("INSERT OR REPLACE INTO industrial_nodes VALUES (?, ?, ?)", [
    ("NODE_DAMMAM_FOUNDRY", "مجمع صهر وتكرير المعادن بالدمام", "FOUNDRY"),
    ("NODE_JUBAIL_LOGISTICS", "ميناء تداول وتصدير التجمعات الصناعية بالجبيل", "LOGISTICS_HUB")
])

conn.commit()
conn.close()
print("✅ تم تأسيس وبذر قاعدة التوائم الرقمية وسلاسل الإمداد الموثقة لشيخة بنجاح!")
