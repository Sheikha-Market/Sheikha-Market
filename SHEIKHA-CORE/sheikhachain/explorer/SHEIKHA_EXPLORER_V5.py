# -*- coding: utf-8 -*-
import json, hashlib, time
from pathlib import Path

reg_path = Path("blockchain/registry.json")
registry = json.loads(reg_path.read_text(encoding='utf-8'))

# حساب إجمالي SHK Rewards الحقيقي
total_shk = 0
for code, entry in registry.items():
    total_shk += entry.get("shk_reward", 0)

print(f"====================================================================")
print(f"💰 TOTAL SHK REWARDS - كل SHK مربوط بـ HS + SBC + Body Twin")
print(f"====================================================================")
print(f"Total Weights: {len(registry)}")
print(f"Total SHK Rewards: {total_shk:,} SHK")
print(f"Average per weight: {total_shk//len(registry):,} SHK")

# بناء Explorer JSON - كل SHK مربوط
explorer_data = {
    "chain_name": "Sheikha Chain V5 - شيخة شين",
    "owner": "CR2051263653 - سلمان أحمد بن سلمان الراجحي - 7049031003",
    "seal": "BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED",
    "creed": "لا إله إلا الله محمد رسول الله",
    "total_blocks": len(registry) + 1,
    "total_weights": len(registry),
    "total_shk_rewards": total_shk,
    "total_supply": "1,000,000,000 SHK",
    "genesis_hash": hashlib.sha256(b"SHEIKHA GENESIS CR2051263653").hexdigest(),
    "integration": {
        "HS_Code": "كل SHK = منتج حقيقي HS 01-99 - مثلا SHK 1000 = 1 طن حديد HS 72 أو 1 لوح بلاط HS 68",
        "SBC_303": "كل SHK = بناء حقيقي SBC 303 - 14 بند - بلاط HS 68 + خرسانة HS 25 + حديد HS 72 + دهان HS 32 - إعمار",
        "Body_Twin": "كل SHK = جهد بشري - عرق جبين - 206 عظمة 600 عضلة - وقل اعملوا فسيرى الله عملكم - جهد داخل وخارج"
    },
    "blocks": []
}

for idx, (code, entry) in enumerate(registry.items()):
    block = {
        "index": idx + 1,
        "code": code,
        "title": entry.get("title",""),
        "weight_hash": entry.get("weight_hash") or entry.get("hash"),
        "shk_reward": entry.get("shk_reward",0),
        "hs_chapter": entry.get("hs_chapters","ALL 99"),
        "sbc": entry.get("sbc","SBC 303"),
        "body_twin_effort": f"{entry.get('shk_reward',0)//1000} ساعة عمل - {entry.get('shk_reward',0)//100} عضلة",
        "triple_entry": entry.get("triple_entry", {}),
        "owner": "CR2051263653",
        "seal": "BOUND_BY_QURAN_SUNNAH",
        "explorer_url": f"https://sheikha-marketplace.web.app/explorer/{code}",
        "amoy_url": f"https://amoy.polygonscan.com/tx/0x{(entry.get('hash','')[:64])}"
    }
    explorer_data["blocks"].append(block)

# حفظ
Path("sheikhachain/explorer/SHEIKHA_EXPLORER_V5_LEDGER.json").write_text(json.dumps(explorer_data, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"\n✅ EXPLORER BUILT - Blocks: {len(explorer_data['blocks'])}")
print(f"✅ Total SHK Rewards: {total_shk:,} SHK - كل SHK = HS + SBC + Body Twin")
print(f"✅ Genesis: {explorer_data['genesis_hash'][:16]}...")

# بناء صفحة HTML Explorer
html = f"""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>شيخة شين إكسبلورر - {len(registry)} وزن</title>
<style>
body{{font-family:Cairo,sans-serif;background:#0a0a0a;color:#FFD700;padding:20px}}
.card{{border:1px solid #FFD700;border-radius:12px;padding:16px;margin:12px;background:#111}}
.hash{{font-family:monospace;color:#0f0}} .shk{{color:#FFD700;font-weight:bold}}
</style></head>
<body>
<h1>🕌 شيخة شين - {len(registry)} وزن - {total_shk:,} SHK</h1>
<h2>كل SHK = HS Code (منتج حقيقي) + SBC 303 (بناء حقيقي) + Body Twin (جهد بشري)</h2>
<p>المالك CR2051263653 - 7049031003 - BOUND_BY_QURAN_SUNNAH</p>
<div id="blocks"></div>
<script>
const data = {json.dumps(explorer_data, ensure_ascii=False)};
document.getElementById('blocks').innerHTML = data.blocks.slice(0,20).map(b=>`
<div class="card">
<h3>${{b.code}} - <span class="shk">${{b.shk_reward}} SHK</span></h3>
<p>${{b.title}}</p>
<p class="hash">Hash: ${{b.weight_hash?.slice(0,24)}}...</p>
<p>HS: ${{b.hs_chapter}} | SBC: ${{b.sbc}} | جهد: ${{b.body_twin_effort}}</p>
<p>Triple: ${{JSON.stringify(b.triple_entry).slice(0,80)}}...</p>
</div>`).join('') + `<p>... و ${{data.blocks.length-20}} وزن آخر</p>`;
</script>
</body></html>
"""
Path("sheikhachain/explorer/index.html").write_text(html, encoding='utf-8')
print(f"✅ Explorer HTML built - sheikhachain/explorer/index.html")
