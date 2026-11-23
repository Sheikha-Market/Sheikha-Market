import sqlite3
import json
import urllib.request
import ssl

print("================== 🕌 فحص نواة شيخة السيادية وبوالص الشحن (V64.2) ==================")

# 1. فحص قاعدة البيانات المحلية وبوالص الشحن المحقونة
db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"
try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT count(*) FROM digital_bills_of_lading")
    bol_count = c.fetchone()[0]
    c.execute("SELECT count(*) FROM digital_twin_products")
    twin_count = c.fetchone()[0]
    print(f"✓ قاعدة البيانات الجغرافية: متصلة بنجاح")
    print(f"✓ إجمالي بوالص الشحن الرقمية الموثقة: {bol_count} بوالص")
    print(f"✓ إجمالي التوائم الرقمية المسجلة: {twin_count} توائم صناعية ولوجستية")
    conn.close()
except Exception as e:
    print(f"⚠️ خطأ فحص قاعدة البيانات: {e}")

# 2. فحص المنفذ المحلي 18082
try:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen("http://127.0.0.1:18082/api/health", timeout=3) as resp:
        data = json.loads(resp.read().decode())
        print(f"✓ منفذ الحاوية المحلية 18082: مستقر (200 OK) | الأوزان: {data.get('weights')} | SHK: {data.get('shk')}")
except Exception as e:
    print(f"⚠️ منفذ 18082: {e}")

print("-----------------------------------------------------------------------------------")
print("🔒 الختم: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED")
print("⚖️ المالك: سلمان أحمد بن سلمان الراجح (س.ت: 2051263653 | موحد: 7049031003)")
print("===================================================================================")
