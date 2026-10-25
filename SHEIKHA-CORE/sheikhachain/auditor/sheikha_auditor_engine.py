import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
REG=ROOT/"blockchain"/"registry.json"
d=json.loads(REG.read_text(encoding='utf-8'))
weights=d['weights'] if isinstance(d,dict) and 'weights' in d else list(d.values())
print(f"🔎 AUDITOR V52.1: {len(weights)} weights | SHK {sum(w.get('shk_reward',0) for w in weights):,} | BOUND_BY_QURAN_SUNNAH")
