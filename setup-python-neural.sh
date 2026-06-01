#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# شيخة — إعداد بيئة Python الكاملة مع شبكة الخلايا العصبية الجذرية
# Sheikha — Python + Neural Network Environment Setup
# ═══════════════════════════════════════════════════════════════════
set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="${WORKSPACE_DIR}/.venv"

echo "═══════════════════════════════════════════════════"
echo "  شيخة — إعداد بيئة Python + الشبكة العصبية الجذرية"
echo "═══════════════════════════════════════════════════"

# ─── 1. Create virtual environment ───────────────────────────────
if [ ! -d "${VENV_DIR}" ]; then
    echo "▶ إنشاء بيئة Python الافتراضية في .venv ..."
    python3 -m venv "${VENV_DIR}"
fi

# ─── 2. Activate ─────────────────────────────────────────────────
source "${VENV_DIR}/bin/activate"
echo "✔ البيئة الافتراضية مفعّلة: $(python --version)"

# ─── 3. Upgrade pip ──────────────────────────────────────────────
echo "▶ تحديث pip ..."
pip install --upgrade pip setuptools wheel

# ─── 4. Install requirements ─────────────────────────────────────
echo "▶ تثبيت المتطلبات (requirements.txt) ..."
pip install --no-cache-dir -r "${WORKSPACE_DIR}/requirements.txt"

# ─── 5. Register Jupyter kernel ──────────────────────────────────
echo "▶ تسجيل Jupyter kernel ..."
python -m ipykernel install --user --name sheikha-venv --display-name "🕌 Sheikha Python (venv)"

# ─── 6. Download NLTK data ───────────────────────────────────────
echo "▶ تحميل بيانات NLTK الأساسية ..."
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True)" || true

# ─── 7. Verify PyTorch ───────────────────────────────────────────
echo "▶ التحقق من PyTorch ..."
python -c "import torch; print(f'  PyTorch: {torch.__version__} | CUDA: {torch.cuda.is_available()}')" || echo "  PyTorch غير متوفر — تشغيل بوضع CPU"

# ─── 8. Verify TensorFlow ────────────────────────────────────────
echo "▶ التحقق من TensorFlow ..."
python -c "import tensorflow as tf; print(f'  TensorFlow: {tf.__version__} | GPUs: {len(tf.config.list_physical_devices(\"GPU\"))}')" || echo "  TensorFlow غير متوفر — تشغيل بوضع CPU"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ اكتمل الإعداد!"
echo "  البيئة الافتراضية: ${VENV_DIR}/bin/python"
echo "  لتفعيل البيئة يدوياً: source .venv/bin/activate"
echo "═══════════════════════════════════════════════════"
