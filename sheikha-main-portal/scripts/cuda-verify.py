#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
شيخة — التحقق من CUDA و PyTorch
Sheikha CUDA Verification — مرقمن بالكتاب والسنة
المرجع: العلق:1-5 — اقرأ وربك الأكرم
"""
import json
import sys

def main():
    out = {
        "cuda_available": False,
        "torch_version": None,
        "cuda_version": None,
        "device_name": None,
        "device_count": 0,
        "error": None
    }
    try:
        import torch
        out["torch_version"] = torch.__version__
        out["cuda_available"] = torch.cuda.is_available()
        if out["cuda_available"]:
            out["cuda_version"] = torch.version.cuda or "bundled"
            out["device_count"] = torch.cuda.device_count()
            if out["device_count"] > 0:
                out["device_name"] = torch.cuda.get_device_name(0)
    except ImportError as e:
        out["error"] = "torch غير مثبت — pip install torch --index-url https://download.pytorch.org/whl/cu121"
    except Exception as e:
        out["error"] = str(e)
    print(json.dumps(out, ensure_ascii=False))
    sys.exit(0 if out["cuda_available"] else 1)

if __name__ == "__main__":
    main()
