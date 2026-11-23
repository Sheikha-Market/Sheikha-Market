# غرسها من شيخه وباسم شيخه - BOUND 741/5741/12464 - لله 99% وقف - 2026-10-31
# SHEIKHA EMERGENCY HEALTH - 99% وقف لله
# BOUND 741/5741/12464 - علاج طوارئ + صحة + تداوي + دواء
import requests
CORE="http://localhost:18082/api/status"
def check_health():
    try:
        r=requests.get(CORE,timeout=2).json()
        print(f"[HEALTH CORE] {r['seal']} healthy={r['healthy']} grand={r['grand']}")
        print("[EMERGENCY] Ultra 9 185H NPU + RTX 4060 CUDA + 62Gi RAM BOUND للعلاج")
        print("[MODULE] صحة-تعليم + ماء زمزم + مساجد + مصاحف زمزم")
    except Exception as e:
        print(f"Core down: {e}")
check_health()
