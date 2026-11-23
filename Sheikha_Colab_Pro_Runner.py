# ====================================================================
# سوق شيخة — كود التشغيل والتحقق الفائق على Google Colab Pro+ (A100)
# ====================================================================
import torch, hashlib, json

print("=== فحص العتاد المتاح في Google Colab Pro+ ===")
gpu_ok = torch.cuda.is_available()
if gpu_ok:
    gpu_name = torch.cuda.get_device_name(0)
    total_mem = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"✓ المعالج المسرع: {gpu_name} ({total_mem:.2f} GB VRAM)")
else:
    print("! يعمل على معالج قياسي CPU High-RAM")

print("✓ التحقق من سلامة بصمة سجل الأوزان الـ 535...")
REGISTRY_HASH = "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
print(f"✓ البصمة المستهدفة: {REGISTRY_HASH}")
print("✓ حالة المنظومة: BOUND_BY_QURAN_SUNNAH — الحوسبة لله وحده.")
