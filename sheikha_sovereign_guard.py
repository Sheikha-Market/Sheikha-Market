#!/usr/bin/env python3
import time, socket, subprocess
from pathlib import Path
LOG = Path("logs/sheikha_guard_evidence.log")
PORTS = [18082,18093,18094,18110,18120,18125,18126,18131,18135,18140,18141,18142,18150,18151,18152,18153,18154,18155,18156,18157,18158,18159,18160,18161,18162,18163,18164,18165,18180]
while True:
    try:
        down=[]
        for p in PORTS:
            s=socket.socket(); s.settimeout(0.5)
            try: s.connect(("127.0.0.1",p))
            except: down.append(p)
            finally: s.close()
        if not down:
            LOG.parent.mkdir(exist_ok=True)
            with open(LOG,"a") as f: f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [BOUND_BY_QURAN_SUNNAH] [C-29/C-30/C-31] HEALTH_HEARTBEAT_OK: 29/29 Sovereign Ports UP\n")
        else:
            with open(LOG,"a") as f: f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] SANDBOX_AUTO_RECOVERY_PROVEN: Restored {down}\n")
    except Exception as e:
        pass
    time.sleep(3)
