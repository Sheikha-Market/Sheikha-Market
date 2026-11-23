# SHEIKHA GPT ADAPTER - BOUND 741/5741/12464 - 99% وقف
import os, hashlib, json
from datetime import datetime
BOUND="BOUND_BY_QURAN_SUNNAH"
def generate_client_env(takhassus, hewaya, mowten, elm):
    base=f"{BOUND}-741/5741/12464-{takhassus}-{hewaya}-{mowten}-{elm}-{datetime.now().isoformat()}"
    h=hashlib.sha256(base.encode()).hexdigest()
    return f"SHKHA-{h[:4].upper()}-{h[4:8].upper()}-741-{h[8:12].upper()}"
print(f"[GPT ADAPTER] BOUND Serial: {generate_client_env('تجارة','مصاحف','حبشة','علم نافع')}")
