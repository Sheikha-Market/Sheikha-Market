import json
import hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")

# قراءة الملف الأحدث الأكثر شمولاً
if p1.exists() and p2.exists():
    d1 = json.loads(p1.read_text(encoding="utf-8"))
    d2 = json.loads(p2.read_text(encoding="utf-8"))
    
    # دمج كامل الأوزان لضمان بقاء كل وزن موثق دون نقص
    d1.update(d2)
    merged_content = json.dumps(d1, ensure_ascii=False, indent=2)
    
    p1.write_text(merged_content, encoding="utf-8")
    p2.write_text(merged_content, encoding="utf-8")
    
    h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
    h2 = hashlib.sha256(p2.read_bytes()).hexdigest()
    
    print(f"✓ تم توحيد سجل اللوح المحفوظ المركزي مع المرآة بنجاح")
    print(f"✓ إجمالي الأوزان المسجلة: {len(d1)}")
    print(f"✓ تطابق البصمة SHA-256: {h1 == h2} | Hash: {h1}")
else:
    print("⚠️ أحد المسارات غير موجود محلياً.")
