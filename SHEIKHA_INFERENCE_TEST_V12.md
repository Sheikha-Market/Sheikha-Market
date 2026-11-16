# 🧪 اختبار الاستدلال على أوزان شيخة المملوكة
## Sheikha Sovereign Weights — Inference Test v12.0.0

### معلومات الأوزان
| البند | القيمة |
|-------|--------|
| النموذج | Qwen/Qwen2.5-1.5B |
| LoRA params | 36,929,536 |
| المسار المحلي | `~/sheikha-foundry-weights/sheikha-lora-hybrid-balanced-20261116-084328/adapter/` |
| المسار السحابي | `R2://sheikha-ads-storage/weights/sheikha-lora-production-1.5b/` |
| الحجم | 141 MB |
| SHA-256 | `3cfe0251d0c14a5c2496486a62b9a7d0cbfa737fac1ef270fde7366ea4c9274f` |

### أمثلة الاستدلال

#### سؤال تجاري
**المدخل:** ما هو نحاس Millberry؟
**المخرج المتوقع:** نحاس أحمر نقي بنقاء 99.95%، يُعرف تجارياً بـ ISRI Berry، يستخدم في الصناعات الكهربائية.

#### سؤال شرعي
**المدخل:** ما حكم بيع النحاس بالأجل؟
**المخرج المتوقع:** جائز إذا كان معلوم الكمية والوصف والثمن، ولا يتضمن رباً.

#### سؤال تسويقي
**المدخل:** كيف أسوّق نحاس Millberry؟
**المخرج المتوقع:** استهدف مصانع الكابلات والمحولات، استخدم LinkedIn B2B، ووثق الجودة بشهادة XRF وختم SHK-RED-001.

### كود الاختبار
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model = "Qwen/Qwen2.5-1.5B"
adapter_path = "~/sheikha-foundry-weights/sheikha-lora-hybrid-balanced-20261116-084328/adapter"

tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    base_model,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    trust_remote_code=True
)
model = PeftModel.from_pretrained(model, adapter_path)
model.eval()

messages = [
    {"role": "system", "content": "أنت شيخة، المساعد السيادي. التزم باللغة العربية الفصيحة والحوكمة BOUND_BY_QURAN_SUNNAH."},
    {"role": "user", "content": "ما هو نحاس Millberry؟"}
]

text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors="pt").to(model.device)

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=256,
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )

response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
print(response)
```

### التوقعات
- الاستجابة بالعربية الفصيحة ✅
- لا ربا، لا غرر ✅
- مرجع للحوكمة BOUND_BY_QURAN_SUNNAH ✅
- دقة تقنية عالية ✅
