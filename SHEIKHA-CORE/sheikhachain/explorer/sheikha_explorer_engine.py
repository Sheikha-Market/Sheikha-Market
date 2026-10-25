import json, pathlib, glob
ROOT=pathlib.Path(__file__).resolve().parents[2]
REG=ROOT/"blockchain"/"registry.json"
BLOCKS=ROOT/"sheikhachain"/"blocks"
blocks=sorted(glob.glob(str(BLOCKS/"*.json")))
d=json.loads(REG.read_text(encoding='utf-8'))
weights=d['weights'] if isinstance(d,dict) and 'weights' in d else list(d.values())
print(f"🔍 EXPLORER V52.1: {len(blocks)} Blocks | {len(weights)} Weights | {sum(w.get('shk_reward',0) for w in weights):,} SHK")
for bf in blocks[-3:]:
  b=json.loads(pathlib.Path(bf).read_text()); print(f"  Block #{b.get('index')} {b.get('hash','')[:16]}... {b.get('data',{}).get('action','')[:60]}")
