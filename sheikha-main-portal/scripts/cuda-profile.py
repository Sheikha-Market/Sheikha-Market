#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
شيخة — تشغيل kernel CUDA صغير لأغراض Nsight Compute
"""
import json
import sys


def main():
    out = {
        'cuda_available': False,
        'torch_version': None,
        'cuda_version': None,
        'device_name': None,
        'kernel_launch': False,
        'error': None,
    }

    try:
        import torch

        out['torch_version'] = torch.__version__
        out['cuda_available'] = torch.cuda.is_available()
        if not out['cuda_available']:
            print(json.dumps(out, ensure_ascii=False))
            return 1

        out['cuda_version'] = torch.version.cuda or 'bundled'
        out['device_name'] = torch.cuda.get_device_name(0)

        # تشغيل kernel بسيط ومضمون عبر ضرب مصفوفتين على GPU.
        left = torch.randn((1024, 1024), device='cuda', dtype=torch.float32)
        right = torch.randn((1024, 1024), device='cuda', dtype=torch.float32)
        result = torch.matmul(left, right)
        torch.cuda.synchronize()

        out['kernel_launch'] = bool(result.is_cuda)
        print(json.dumps(out, ensure_ascii=False))
        return 0
    except ImportError:
        out['error'] = 'torch غير مثبت — pip install torch --index-url https://download.pytorch.org/whl/cu121'
    except Exception as error:
        out['error'] = str(error)

    print(json.dumps(out, ensure_ascii=False))
    return 1


if __name__ == '__main__':
    sys.exit(main())