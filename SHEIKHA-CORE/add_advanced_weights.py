import json, hashlib, datetime

REGISTRY = "blockchain/registry.json"
with open(REGISTRY) as f:
    data = json.load(f)

existing = len(data.get("weights", []))
print(f"Existing weights: {existing}")

# تعريف الأوزان الجديدة
new_weights = []

# 1. لغة شيخة البرمجية - 10 أوزان
sheikha_lang = [
    ("sheikha-lang-compiler-core", "مترجم لغة شيخة الأساسي - Sheikha Lang Compiler", 80000, "HS 8524 Software", "SBC Compiler", "206 bones typing"),
    ("sheikha-lang-lexer-parser", "المحلل اللغوي والنحوي للغة شيخة", 60000, "HS 8524 Lexer", "SBC Parser", "600 muscles logic"),
    ("sheikha-lang-quranic-syntax", "قواعد نحوية قرآنية - كتابة كود بالعربية", 90000, "HS 8524 Quranic", "SBC Syntax", "86B neurons arabic"),
    ("sheikha-lang-halal-runtime", "بيئة تشغيل حلال - لا ربا لا غرر", 75000, "HS 8524 Halal", "SBC Runtime", "100k heartbeats halal"),
    ("sheikha-lang-sharia-type-system", "نظام أنواع شرعي - Sharia Type System", 70000, "HS 8524 Types", "SBC Types", "206 bones sharia"),
    ("sheikha-lang-ast-quranic", "شجرة البنية القرآنية AST", 65000, "HS 8524 AST", "SBC AST", "600 muscles structure"),
    ("sheikha-lang-ide-vscode", "بيئة تطوير متكاملة للغة شيخة VSCode", 55000, "HS 8524 IDE", "SBC IDE", "86B neurons IDE"),
    ("sheikha-lang-package-manager", "مدير حزم شيخة - Sheikha Package Manager", 50000, "HS 8524 Packages", "SBC Packages", "100k heartbeats package"),
    ("sheikha-lang-stdlib-islamic", "المكتبة القياسية الإسلامية", 85000, "HS 8524 StdLib", "SBC Library", "206 bones library"),
    ("sheikha-lang-docs-arabic", "توثيق عربي كامل للغة شيخة", 40000, "HS 4901 Docs", "SBC Docs", "600 muscles docs"),
]

# 2. البرمجة بكل اللغات - 15 وزن
all_langs = [
    ("prog-python-advanced", "بايثون متقدم - AI/ML", 70000, "HS 8524 Python", "SBC AI", "86B neurons python"),
    ("prog-rust-systems", "رست - أنظمة آمنة", 80000, "HS 8524 Rust", "SBC Systems", "206 bones rust"),
    ("prog-go-cloud", "جو - حوسبة سحابية", 65000, "HS 8524 Go", "SBC Cloud", "600 muscles go"),
    ("prog-typescript-fullstack", "تايبسكريبت - فول ستاك", 60000, "HS 8524 TS", "SBC Fullstack", "86B neurons TS"),
    ("prog-c-cpp-embedded", "C/C++ - أنظمة مدمجة", 85000, "HS 8524 C++", "SBC Embedded", "100k heartbeats embedded"),
    ("prog-solidity-blockchain", "سوليديتي - بلوك تشين", 90000, "HS 8524 Solidity", "SBC Blockchain", "206 bones solidity"),
    ("prog-swift-kotlin-mobile", "سويفت وكوتلن - موبايل", 55000, "HS 8524 Mobile", "SBC Mobile", "600 muscles mobile"),
    ("prog-java-enterprise", "جافا - مؤسسات", 60000, "HS 8524 Java", "SBC Enterprise", "86B neurons java"),
    ("prog-sql-nosql-data", "قواعد بيانات متقدمة", 70000, "HS 8524 DB", "SBC Data", "100k heartbeats data"),
    ("prog-wasm-edge", "WebAssembly - حواف", 75000, "HS 8524 WASM", "SBC Edge", "206 bones wasm"),
    ("prog-assembly-optimization", "أسمبلي - تحسين قصوى", 80000, "HS 8524 ASM", "SBC Optimization", "600 muscles asm"),
    ("prog-haskell-functional", "هاسكل - برمجة وظيفية", 65000, "HS 8524 Haskell", "SBC Functional", "86B neurons functional"),
    ("prog-cuda-gpu", "كودا - GPU", 85000, "HS 8524 CUDA", "SBC GPU", "100k heartbeats GPU"),
    ("prog-verilog-hardware", "فيريلوج - عتاد", 80000, "HS 8524 Verilog", "SBC Hardware", "206 bones hardware"),
    ("prog-all-langs-polyglot", "بوليجلوت - كل اللغات", 100000, "HS 8524 Polyglot", "SBC Polyglot", "600 muscles polyglot"),
]

# 3. الحوسبة المتقدمة - 10 أوزان
advanced_compute = [
    ("compute-quantum-supremacy", "حوسبة كمية - تفوق كمي", 150000, "HS 8471 Quantum", "SBC Quantum", "86B neurons quantum"),
    ("compute-supercomputer-hpc", "حاسوب فائق HPC - Exascale", 120000, "HS 8471 HPC", "SBC HPC", "206 bones HPC"),
    ("compute-neuromorphic-brain", "حوسبة عصبية - محاكاة دماغ", 130000, "HS 8471 Neuromorphic", "SBC Brain", "86B neurons brain"),
    ("compute-photonic-light", "حوسبة ضوئية - بالضوء", 110000, "HS 8471 Photonic", "SBC Photonic", "600 muscles light"),
    ("compute-dna-biological", "حوسبة حيوية DNA", 100000, "HS 8471 DNA", "SBC BioCompute", "100k heartbeats DNA"),
    ("compute-edge-fog", "حوسبة حافة وضباب", 70000, "HS 8471 Edge", "SBC Edge", "206 bones edge"),
    ("compute-confidential-tee", "حوسبة سرية TEE", 80000, "HS 8471 TEE", "SBC Confidential", "600 muscles confidential"),
    ("compute-serverless-faas", "بدون خادم FaaS", 60000, "HS 8471 FaaS", "SBC Serverless", "86B neurons faas"),
    ("compute-distributed-grid", "حوسبة موزعة Grid", 75000, "HS 8471 Grid", "SBC Distributed", "100k heartbeats grid"),
    ("compute-ai-supercluster", "عنقود ذكاء خارق", 140000, "HS 8471 AI Cluster", "SBC Supercluster", "206 bones supercluster"),
]

# 4. الهندسة المتقدمة - 10 أوزان
advanced_eng = [
    ("eng-aerospace-orbital", "هندسة فضائية مدارية", 130000, "HS 8802 Aerospace", "SBC Orbital", "600 muscles aerospace"),
    ("eng-nano-molecular", "هندسة نانوية جزيئية", 120000, "HS 8541 Nano", "SBC Nano", "86B neurons nano"),
    ("eng-robotics-humanoid", "روبوتات شبيهة بالإنسان", 110000, "HS 8479 Humanoid", "SBC Humanoid", "206 bones humanoid"),
    ("eng-biomedical-bionic", "هندسة طبية حيوية - أطراف صناعية", 100000, "HS 9021 Bionic", "SBC Bionic", "100k heartbeats bionic"),
    ("eng-nuclear-fusion", "هندسة اندماج نووي", 150000, "HS 8401 Fusion", "SBC Fusion", "600 muscles fusion"),
    ("eng-civil-smartcity", "هندسة مدنية مدينة ذكية 【entity-NEOM¦canonical_name=NEOM】", 90000, "HS 7308 SmartCity", "SBC SmartCity", "206 bones smartcity"),
    ("eng-materials-metamaterials", "مواد خارقة Metamaterials", 85000, "HS 3921 Metamaterials", "SBC Materials", "86B neurons materials"),
    ("eng-optical-lidar", "هندسة بصرية ليدار", 70000, "HS 9013 Lidar", "SBC Optical", "600 muscles optical"),
    ("eng-acoustic-quantum", "هندسة صوتية كمية", 65000, "HS 8518 Acoustic", "SBC Acoustic", "100k heartbeats acoustic"),
    ("eng-genetic-crispr", "هندسة وراثية كريسبر", 110000, "HS 3822 CRISPR", "SBC Genetic", "206 bones genetic"),
]

# 5. الإدارة المتقدمة - 10 أوزان
advanced_mgmt = [
    ("mgmt-agile-scrum-sovereign", "إدارة رشيقة سيادية", 60000, "HS 8524 Agile", "SBC Agile", "86B neurons agile"),
    ("mgmt-okrs-kpi-quantum", "أهداف كمية OKRs كمية", 55000, "HS 8524 OKR", "SBC OKR", "600 muscles okr"),
    ("mgmt-supply-chain-ai", "سلسلة إمداد بالذكاء", 80000, "HS 8428 Supply", "SBC SupplyChain", "206 bones supply"),
    ("mgmt-finance-defi-halal", "مالية لامركزية حلال DeFi", 90000, "HS 8470 DeFi", "SBC HalalFi", "100k heartbeats halalfi"),
    ("mgmt-hr-talent-neural", "موارد بشرية عصبية", 50000, "HS 8524 HR", "SBC HR", "86B neurons HR"),
    ("mgmt-risk-quantum", "إدارة مخاطر كمية", 70000, "HS 8524 Risk", "SBC Risk", "600 muscles risk"),
    ("mgmt-product-exponential", "إدارة منتج أسية", 75000, "HS 8524 Product", "SBC Product", "206 bones product"),
    ("mgmt-operations-sre", "تشغيل SRE موثوقية", 65000, "HS 8524 SRE", "SBC SRE", "100k heartbeats SRE"),
    ("mgmt-strategy-neom", "استراتيجية نيوم 2030", 100000, "HS 8524 Strategy", "SBC Strategy", "86B neurons strategy"),
    ("mgmt-governance-quranic", "حوكمة قرآنية - BOUND_BY_QURAN_SUNNAH", 120000, "HS 8524 Governance", "SBC Governance", "206 bones governance"),
]

all_new = sheikha_lang + all_langs + advanced_compute + advanced_eng + advanced_mgmt

for idx, (id_, name, shk, hs, sbc, body) in enumerate(all_new, start=existing+1):
    h = hashlib.sha256(f"{id_}{idx}{datetime.datetime.utcnow()}".encode()).hexdigest()
    w = {
        "id": id_,
        "index": idx,
        "name": name,
        "weight_hash": h,
        "shk_reward": shk,
        "hs_chapter": hs,
        "sbc_clause": sbc,
        "body_twin_effort": body,
        "created_at": datetime.datetime.utcnow().isoformat()+"Z",
        "seal": "BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED",
        "amoy_bridge": {"ready": True, "chain": "Polygon Amoy", "contract": "WeightRegistry"}
    }
    data["weights"].append(w)
    new_weights.append(w)
    print(f"Added {idx}: {name} - {shk} SHK")

total_shk = sum(w["shk_reward"] for w in data["weights"])
data["total_weights"] = len(data["weights"])
data["total_shk_rewards"] = total_shk
data["last_update"] = datetime.datetime.utcnow().isoformat()+"Z"

with open(REGISTRY, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n✅ Total weights: {data['total_weights']}")
print(f"✅ Total SHK: {total_shk}")
