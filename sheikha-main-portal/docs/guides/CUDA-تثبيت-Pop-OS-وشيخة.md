# تثبيت CUDA Toolkit على Pop!_OS — دليل شيخة
## حل تعارضات التبعيات ورقمنة بالكتاب والسنة

---

## بسم الله الرحمن الرحيم

> **"ولا تقف ما ليس لك به علم"** — الإسراء: 36
>
> **"إن الله يحب إذا عمل أحدكم عملاً أن يتقنه"** — حديث شريف

---

## 1. تحليل المشكلة

الخطأ يشير إلى:
- **تعارض:** `libnvidia-compute` و `libnvidia-compute-580` يعارضان حزم `libcuda-*` قديمة
- **تبعية:** `libssl3t64` غير قابلة للتثبيت
- **إصدار:** النظام يحاول ترقية من 510 إلى 590 — قد لا يتوافق مع Pop!_OS الحالي
- **nvidia-prime:** تعارض مع `nvidia-driver` (Pop!_OS يستخدم نظام خاص)

---

## 2. الحلول الموصى بها

### 2.1 الخيار أ: استخدام CUDA عبر pip (لا يحتاج تثبيت نظامي)

**الأفضل لشيخة — للتحليل والتنبؤ فقط:**

```bash
# في venv
pip install torch --index-url https://download.pytorch.org/whl/cu121
# أو cu118 حسب إصدار driver
```

- **لا يحتاج:** `cuda-drivers` أو `cuda-toolkit` من apt
- **يعمل مع:** Driver 525+ (تحقق: `nvidia-smi`)
- **المرجع:** العلق:1-5 — اقرأ

### 2.2 الخيار ب: تثبيت CUDA Toolkit من مستودع NVIDIA الرسمي

**إذا احتجت CUDA Toolkit كامل:**

```bash
# 1. إزالة الحزم المتعارضة (إن وُجدت)
sudo apt remove --purge libcuda-* 2>/dev/null

# 2. إضافة مستودع NVIDIA CUDA (Ubuntu 22.04)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb

# 3. تثبيت CUDA Toolkit فقط (بدون drivers — استخدم drivers Pop!_OS)
sudo apt update
sudo apt install -y cuda-toolkit-12-1
```

**ملاحظة:** على Pop!_OS لا تستخدم `nvidia-driver` من Ubuntu — استخدم drivers Pop!_OS:
- `sudo apt install system76-driver-nvidia` (إن وُجد)
- أو من إعدادات Pop!_OS: Settings → About → Graphics

### 2.3 الخيار ج: تثبيت drivers متوافقة مع Pop!_OS

```bash
# التحقق من الإصدار الحالي
nvidia-smi

# إن كان يعمل — لا تحتاج ترقية. استخدم PyTorch مع CUDA عبر pip
# إن لم يعمل — استخدم إعدادات Pop!_OS أو:
sudo apt update
sudo apt install -y nvidia-driver-535  # إصدار مستقر لـ Ubuntu 22.04
```

---

## 3. التحقق من الجاهزية

```bash
# 1. التحقق من Driver
nvidia-smi

# 2. التحقق من PyTorch + CUDA (بعد pip install)
python3 -c "import torch; print('CUDA:', torch.cuda.is_available()); print('Version:', torch.version.cuda)"
```

---

## 4. توصية شيخة

| الحاجة | الحل | المرجع |
|--------|------|--------|
| **نماذج تسعير، تحليل** | PyTorch + CUDA عبر pip | العلق:1-5 |
| **استدلال سحابي** | NVIDIA NIM API — لا يحتاج GPU محلي | البقرة:282 |
| **CUDA Toolkit كامل** | من مستودع NVIDIA — بعد حل التعارضات | الإتقان |

---

## 5. إن استمرت المشكلة

1. **لا ترقّ drivers** — إن `nvidia-smi` يعمل، استخدم الإصدار الحالي
2. **استخدم Docker** — حاوية جاهزة: `nvidia/cuda:12.1.0-runtime-ubuntu22.04`
3. **استخدم NVIDIA NIM** — استدلال سحابي عبر API — لا يحتاج تثبيت محلي

---

*دليل تثبيت CUDA — منظومة شيخة — مرقمن بالكتاب والسنة*
