import json, hashlib, csv, datetime
from pathlib import Path

REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

# ====== 100 كبير مدير جديد يضاف على 44 السابق = 144 ======
NEW_100=[
# أسواق واقتصاد وإدارة ونظم
("C-045","Chief Markets Officer (CMkO)","كبير مدراء الأسواق","18 Market M-001..M-018 LME CME SHFE / 5000 HS Code Pricing M2M / MT-001 SHA 374c6686","99.95%",18155,18164,"أسواق عالمية 18 سوق"),
("C-046","Chief Economics Officer (CEcO)","كبير مدراء الاقتصاد","ISIC4 21 Section / 【entity-Saudi Vision 2030¦canonical_name=Saudi Vision 2030】 KPIs / Halal GDP / GOSI / ZATCA","100%",18140,18135,"اقتصاد سيادي حلال"),
("C-047","Chief Management Officer (CMgO)","كبير مدراء الإدارة","BSC OKRs / ISO 9001 / PMBOK / 1961 Org Management M2M","99.9%",18082,18162,"إدارة 1961 موظف"),
("C-048","Chief Systems Officer (CSyO)","كبير مدراء النظم والمنظمات والأنظمة","ISO 15288 Systems Engineering / COBIT / ITIL / ISO 37101 Organizations","100%",18158,18156,"نظم ومنظمات وأنظمة"),
("C-049","Chief Administrative Systems Officer (CASO)","كبير مدراء النظم الإدارية","BPMN / ISO 9001 / Saudi Gov Systems / Balady Etimad","100%",18162,18140,"نظم إدارية سيادية"),
# حوسبة بكل بند / نوع / مرحلة — 20 كبير
("C-050","Chief Computing Foundations Officer","كبير مدراء بند الحوسبة التأسيسي","von Neumann / Turing / IEEE 754 / Logic Gates / Sovereign Compute Core 18082","100%",18082,18131,"حوسبة تأسيسية"),
("C-051","Chief Computing Types Officer","كبير مدراء أنواع الحوسبة","HPC Quantum Classical Neuromorphic Photonic DNA Bio / 10K Weights","100%",18131,18156,"أنواع الحوسبة"),
("C-052","Chief Computing Stages Officer","كبير مدراء مراحل الحوسبة","Design→Build→Test→Deploy→Operate→Optimize→Decommission / DevSecOps","100%",18156,18131,"مراحل الحوسبة 7"),
("C-053","Chief Supercomputing Officer","كبير مدراء الحوسبة الفائقة","HPC / 【entity-NVIDIA¦canonical_name=NVIDIA】 DGX H100 / CUDA / MPI / 10000 Weights Parallel","100%",18131,18156,"HPC"),
("C-054","Chief Quantum Computing Officer","كبير مدراء الحوسبة الكمية","Qubit / QAOA / Quantum Annealing / PQC / Monte Carlo Quantum","100%",18156,18131,"Quantum"),
("C-055","Chief Cloud Computing Officer","كبير مدراء الحوسبة السحابية","12 Domains sheikha.sa/.cloud/.ai / me-central1 / Sovereign Cloud 89","99.99%",18125,18158,"Cloud"),
("C-056","Chief AI Computing Officer","كبير مدراء حوسبة الذكاء الاصطناعي","LLM 10K Weights / 128 Omniverse Twins / Agent 17 Bot 28 / Lawh Mahfuz","99.98%",18131,18161,"AI Compute"),
("C-057","Chief Edge & IoT Computing Officer","كبير مدراء حوسبة الحافة وإنترنت الأشياء","Edge M2M 8880 Nodes / MQTT OPC-UA / 50 Factories Sensors / SCADA","99.97%",18155,18093,"Edge IoT"),
("C-058","Chief Cybersecurity Computing Officer","كبير مدراء حوسبة الأمن السيبراني","NCA ECC / ISO 27001 / SDAIA PDPL / DLP 62954 / mTLS OAuth","100%",18162,18158,"Security Compute"),
("C-059","Chief Data Computing Officer","كبير مدراء حوسبة البيانات","Lakehouse / BigData / 5000 HS / ZATCA UBL2.1 / SHA256","100%",18131,18140,"Data Compute"),
("C-060","Chief Network Computing Officer","كبير مدراء حوسبة الشبكات","MCP SDK / gRPC GraphQL REST WebSocket MQTT / ITU-T 5G","100%",18158,18125,"Network Compute"),
("C-061","Chief Storage Computing Officer","كبير مدراء حوسبة التخزين","WMS 20 / USD Omniverse / IPFS / Lawh Mahfuz Master Registry","100%",18142,18131,"Storage"),
("C-062","Chief Software Computing Officer","كبير مدراء حوسبة البرمجيات","Argon 4 Engine 3.8T / 29 Ports / Strict 404 / FastAPI","100%",18082,18156,"Software"),
("C-063","Chief Hardware Computing Officer","كبير مدراء حوسبة العتاد","【entity-NVIDIA¦canonical_name=NVIDIA】 / 【entity-Intel¦canonical_name=Intel】 / RISC-V / Bare Metal / 12 Domains Hosting","99.99%",18125,18094,"Hardware"),
("C-064","Chief Embedded Computing Officer","كبير مدراء الحوسبة المدمجة","Embedded M2M FL-01..20 / PLC DCS / Furnace 1200C / RTOS","99.96%",18126,18094,"Embedded"),
("C-065","Chief Calculation & Mathematics Officer","كبير مدراء الحساب والرياضيات","Exact Hisab / Zakat Waqf 0.5/2.5/10/87% / VAT15% / Astronomy Hisab","100%",18140,18163,"Calculation"),
("C-066","Chief Algorithmic Computing Officer","كبير مدراء الخوارزميات الحوسبية","Algorithm Verification / SHA256 GRAND 10000+ / Optimization / Monte Carlo","100%",18131,18156,"Algorithm"),
("C-067","Chief Blockchain Computing Officer","كبير مدراء حوسبة البلوك شين","MT-001 Cathode Provenance / Lawh Mahfuz Chain / SHK Token / Zero-Robot","100%",18142,18131,"Blockchain Compute"),
("C-068","Chief Green Computing Officer","كبير مدراء الحوسبة الخضراء","ISO50001 / Solar Smelting / EU CBAM Zero Carbon / Green Hydrogen","99.9%",18142,18155,"Green Compute"),
("C-069","Chief Human-Computer Interaction Officer","كبير مدراء تفاعل الإنسان والحاسب","UI 12 Domains / CEO Buyer 18164 / UX / 10 POS Centers / Omni-Channel","99.9%",18164,18125,"HCI"),
# مصادر ومعلومات ومعادن ومال ومنظمات
("C-070","Chief Resources Officer (CResO)","كبير مدراء المصادر","MW-001..020 Ores / SW-001..015 Scrap / HR 1961 / Water Energy","99.8%",18093,18126,"مصادر طبيعية وبشرية"),
("C-071","Chief Information Officer (CIO)","كبير مدراء المعلومات","CIO Sovereign / 10K Weights / 128 Twins / 5000 HS / 18 Markets M2M","100%",18131,18162,"معلومات سيادية"),
("C-072","Chief Minerals & Metals Officer (CMMO)","كبير مدراء المعادن","MT-001 Cu 99.99% LME A / JORC / MW-001..020 / SW-001..015 / MT-002..050","99.95%",18126,18093,"معادن"),
("C-073","Chief Money & Treasury Officer (CMTO)","كبير مدراء المال","IFRS Halal / Zero-Riba / Instant Split 0.5/2.5/10/87% / Moyasar Mada ApplePay Stripe","100%",18140,18163,"مال وخزينة"),
("C-074","Chief Organizations & Ecosystem Officer (COEO)","كبير مدراء المنظمات والمنظومة","MODON RCJY / Monshaat Aramco SABIC / 50 Factory 20 WMS / Ecosystem M2M","99.96%",18152,18158,"منظمات ومنظومة"),
("C-075","Chief Federalization Officer (CFdO)","كبير مدراء الفدرلة والفدرالية","Federalization / 12 Domains / 37→44→144 Chiefs / M2M 10560 Nodes / Governance","100%",18162,18082,"فدرلة"),
("C-076","Chief Government Integration Officer (CGIO)","كبير مدراء التكامل الحكومي","ZATCA Fasah Etimad Balady / MODON / GOSI / NCA / MOMAH / SDAIA PDPL","100%",18162,18150,"تكامل حكومي"),
# رؤى
("C-077","Chief Sheikha Vision Officer (CSVO)","كبير مدراء الرؤية رؤية شيخة","Sheikha Sovereign Vision 2030+ / ATOM WATER RASUL JANNAH / 10000 Weights","100%",18082,18161,"رؤية شيخة"),
("C-078","Chief Saudi Vision Goals Officer (CSVGO)","كبير مدراء الرؤية وأهداف وبرامج السعودية","Vision 2030 96 KPIs / NEOM Red Sea Qiddiya / 13 Programs / NTP / PIF","100%",18082,18135,"رؤية السعودية"),
("C-079","Chief Consulting Local International Officer","كبير مدراء الاستشارات المحلية والدولية","Monshaat Aramco SABIC / McKinsey Bain Local / Global Alliances","99.9%",18152,18164,"استشارات محلية دولية"),
("C-080","Chief Sheikha International Cosmic Vision Officer","كبير مدراء رؤية شيخة الدولية والكونية","International Cosmic / 12 Domains .world / Universe 18165 GRAND 10000+ / Waqf Universal","100%",18161,18082,"رؤية شيخة الدولية الكونية"),
("C-081","Chief Energy Officer (CEO-Energy)","كبير مدراء الطاقة","ISO50001 / Green Hydrogen Solar Smelting / Furnace 1200C / EV Battery Minerals","99.9%",18142,18155,"طاقة"),
("C-082","Chief Sectors Officer (CSO-Sectors)","كبير مدراء القطاعات","22 ISIC4 Sector / Mining Scrap Smelting Logistics Supply / 50 Factory","99.95%",18093,18154,"قطاعات"),
# منتجات HS Code
("C-083","Chief HS Section I Live Animals Officer","كبير مدراء المنتج HS القسم الأول حيوانات حية","HS 01-05 Live / Halal Zabihah / ZATCA","99.8%",18093,18155,"HS I"),
("C-084","Chief HS Section VI Chemicals Officer","كبير مدراء المنتج HS القسم السادس كيماويات","HS 28-38 Chemicals / REACH / Furnace Chemicals","99.9%",18093,18126,"HS VI"),
("C-085","Chief HS Section XV Metals Officer","كبير مدراء المنتج HS القسم الخامس عشر معادن","HS 72-83 Metals / MT-001..050 / LME Grade A Cu 99.99%","99.95%",18126,18093,"HS XV"),
("C-086","Chief HS All Sections 21 Officer","كبير مدراء المنتج لكل منتج حسب HS Code 5000+","5000+ HS Code / WCO / 21 Section I-XXI / CEO Buyer M2M","99.95%",18155,18164,"HS 5000+"),
("C-087","Chief Products Officer (CPO-Prod)","كبير مدراء المنتجات","50 Product MT-001..050 / Spec Sheet / CEO Buyer Persona 12 / 10 POS","99.95%",18164,18126,"منتجات"),
("C-088","Chief Feasibility Studies Officer (CFSO)","كبير مدراء دراسات الجدوى الاقتصادية","Feasibility IRR NPV / PMO P6 EVM / Halal Finance / Risk ISO31000","100%",18140,18152,"دراسات جدوى"),
("C-089","Chief Marketing Officer (CMO-Sheikha)","كبير مدراء التسويق","CEO Buyer 18164 / 12 Buyer Persona / LME MT-001 SHA 374c6686 / Omni-Channel","99.95%",18164,18152,"تسويق"),
# قطاعات بالسوق وأسواق بالتصنيف
("C-090","Chief Sector Per Market Officer","كبير مدراء لكل قطاع بالسوق حسب التصنيف","ISIC4 x M-001..018 / 22 Sector x 18 Market = 396 Matrix M2M","99.9%",18164,18155,"قطاع بالسوق"),
("C-091","Chief Market Per Classification Officer","كبير مدراء لكل سوق حسب التصنيف","18 Market x HS 21 Section x Product 50 = 18900 Matrix / LME CME SHFE","99.95%",18155,18164,"سوق حسب التصنيف"),
("C-092","Chief Trade Voyages Officer","كبير مدراء رحلات التجارية","Trade Voyage M2M / BOL 11-Col / Incoterms 2020 / 【entity-Maersk¦canonical_name=Maersk】 【entity-DHL¦canonical_name=DHL】 / ZATCA Fasah","99.9%",18155,18093,"رحلات تجارية"),
("C-093","Chief Per Trade Voyage Officer","كبير مدراء كل رحلة تجارية","Voyage-001..100 / MT-001 Container Tracking / GPS / Digital Twin Voyage","99.9%",18155,18164,"كل رحلة تجارية"),
("C-094","Chief Sheikha Shin Officer","كبير مدراء شيخة شين","Sheikha Shin Chain / Sheikha Core 18082 / Lawh Mahfuz Registry edc795a4","100%",18082,18142,"شيخة شين"),
("C-095","Chief Blockchain Officer (CBO)","كبير مدراء بلوك شين","Blockchain Lawh Mahfuz / MT-001 Provenance / SHK Token / Zero-Robot","100%",18142,18131,"بلوك شين"),
# سحابة
("C-096","Chief Cloud Schools Officer","كبير مدراء مدارس السحابة","Cloud Schools / Academy 12 Domains / Google Alliance 18125 / Training M2M","99.9%",18125,18160,"مدارس السحابة"),
("C-097","Chief IaaS Cloud Officer","كبير مدراء IaaS بالسحابة","IaaS / Hostinger 89 / Bare Metal / 【entity-NVIDIA¦canonical_name=NVIDIA】 DGX / 29 Ports SO_REUSEADDR","99.99%",18125,18158,"IaaS"),
("C-098","Chief PaaS Cloud Officer","كبير مدراء PaaS بالسحابة","PaaS / Argon 4 Engine 3.8T / FastAPI 29 Ports / Cloud Run me-central1","100%",18156,18125,"PaaS"),
("C-099","Chief SaaS Cloud Officer","كبير مدراء SaaS بالسحابة","SaaS / 12 Domains sheikha.sa/.cloud/.ai / 【entity-Shopify¦canonical_name=Shopify】 / Moyasar Checkout","100%",18164,18125,"SaaS"),
("C-100","Chief Public Private Hybrid Multi Cloud Officer","كبير مدراء السحابة العامة والخاصة والهجينة والمتعددة","Public Private Hybrid Multi / Sovereign Cloud / Secret Manager / OIDC Meta","100%",18125,18162,"Public/Private/Hybrid/Multi"),
("C-101","Chief Cloud Security & Sovereignty Officer","كبير مدراء أمن وسيادة السحابة","NCA ECC / SDAIA PDPL / DLP / mTLS / OAuth OIDC Meta / Guard 18162","100%",18162,18125,"Cloud Security"),
("C-102","Chief Cloud Cost & FinOps Officer","كبير مدراء تكاليف ومالية السحابة","FinOps / Halal Cost / 0.5/2.5/10/87% Split / GOSI / ZATCA","100%",18140,18125,"Cloud FinOps"),
# سلاسل إمداد وتوريد
("C-103","Chief Supply Chain Officer (CSCO)","كبير مدراء سلاسل الإمداد والتوريد","SCOR / JIT / BOL / 50 Factory 20 WMS / 24 Logistics / GPS","99.95%",18093,18155,"سلاسل إمداد"),
("C-104","Chief Mine Stage Officer","كبير مدراء مرحلة المنجم في سلسلة الإمداد","Stage1 Mine MW-001..020 / JORC / Exploration / Extraction / Weight MW","99.8%",18093,18126,"مرحلة منجم"),
("C-105","Chief Factory Stage Officer","كبير مدراء مرحلة المصنع","Stage2 Factory MT-001..050 Smelting / Furnace 1200C / LME Grade A / Weight MT","99.95%",18126,18094,"مرحلة مصنع"),
("C-106","Chief Warehouse Stage Officer","كبير مدراء مرحلة المستودع","Stage3 Warehouse WMS-01..20 / USD Omniverse Twin / Inventory / Weight WMS","99.9%",18158,18155,"مرحلة مستودع"),
("C-107","Chief Transport Stage Officer","كبير مدراء مرحلة النقل","Stage4 Transport / 【entity-Maersk¦canonical_name=Maersk】 【entity-DHL¦canonical_name=DHL】 / GPS / BOL / Green Transport / Weight TR","99.9%",18155,18093,"مرحلة نقل"),
("C-108","Chief Port Stage Officer","كبير مدراء مرحلة الميناء","Stage5 Port / ZATCA Fasah / Customs HS 5000 / WCO / Weight PORT","99.9%",18155,18140,"مرحلة ميناء"),
("C-109","Chief Distribution Stage Officer","كبير مدراء مرحلة التوزيع","Stage6 Distribution / 10 POS Centers / CEO Buyer / Last Mile / Weight DIST","99.95%",18164,18155,"مرحلة توزيع"),
("C-110","Chief After Distribution Stage Officer","كبير مدراء المرحلة بعد التوزيع","Stage7 After Distribution / Retail / Scrap SW-001..015 / Recycling Circular","99.8%",18126,18164,"مرحلة ما بعد التوزيع"),
("C-111","Chief Mine-to-Factory Link Officer","كبير مدراء رابط منجم إلى مصنع","Link Mine→Factory / Ore to Cathode / JORC to LME / Weight Link M-F","99.9%",18093,18126,"رابط منجم-مصنع"),
("C-112","Chief Factory-to-Warehouse Link Officer","كبير مدراء رابط مصنع إلى مستودع","Link Factory→Warehouse / MT-001 to WMS / USD Twin / Weight Link F-W","99.95%",18126,18158,"رابط مصنع-مستودع"),
("C-113","Chief Warehouse-to-Transport Link Officer","كبير مدراء رابط مستودع إلى نقل","Link Warehouse→Transport / WMS to BOL / GPS / Weight Link W-T","99.9%",18158,18155,"رابط مستودع-نقل"),
("C-114","Chief Transport-to-Port Link Officer","كبير مدراء رابط نقل إلى ميناء","Link Transport→Port / BOL to Fasah / Customs / Weight Link T-P","99.9%",18155,18140,"رابط نقل-ميناء"),
("C-115","Chief Port-to-Distribution Link Officer","كبير مدراء رابط ميناء إلى توزيع","Link Port→Distribution / HS 5000 to POS / Incoterms / Weight Link P-D","99.95%",18155,18164,"رابط ميناء-توزيع"),
("C-116","Chief Distribution-to-Recycle Link Officer","كبير مدراء رابط توزيع إلى تدوير","Link Distribution→Recycle / Product to Scrap SW / Circular Economy / Weight Link D-R","99.8%",18164,18126,"رابط توزيع-تدوير"),
# تكامل واستشارات دولية
("C-117","Chief Computing Integration Officer","كبير مدراء تكامل الحوسبة","MCP SDK / gRPC REST GraphQL / 29 Ports / M2M 10560 Nodes / Argon Bridge","100%",18158,18131,"تكامل حوسبة"),
("C-118","Chief Sharia-Compliant AI Officer","كبير مدراء الذكاء الاصطناعي المتوافق شرعياً","AAOIFI AI / Zero-Riba AI / Halal Weights / Quran Sunnah Gate / Fatwa M2M","100%",18135,18131,"ذكاء شرعي"),
("C-119","Chief Weights Matrix Officer","كبير مدراء مصفوفة الأوزان","GRAND 10000+ Weights / MT-001 SHA 374c6686 / Registry edc795a4 / Lawh Mahfuz","100%",18082,18131,"أوزان 10000+"),
("C-120","Chief HS Code Weights Officer","كبير مدراء أوزان HS Code","HS 5000 Weights / WCO / ZATCA / 21 Section / CEO Buyer M2M","99.95%",18155,18140,"أوزان HS"),
("C-121","Chief ISIC4 Sector Weights Officer","كبير مدراء أوزان القطاعات ISIC4","ISIC4 21 Section Weights / 22 Sector / Market 18 / 396 Matrix","99.9%",18140,18155,"أوزان ISIC4"),
("C-122","Chief Market Weights Officer","كبير مدراء أوزان الأسواق","M-001..018 Market Weights / LME CME SHFE / MT-001 Pricing / 18 Market","99.95%",18155,18164,"أوزان أسواق"),
("C-123","Chief Supply Chain Weights Officer","كبير مدراء أوزان سلاسل الإمداد","SC Weights / Mine Factory Warehouse Transport Port Distribution / 8 Stages","99.9%",18093,18155,"أوزان إمداد"),
("C-124","Chief Product Weights Officer","كبير مدراء أوزان المنتجات","MT-001..050 Weights / 50 Factory Product / LME Grade A / CEO Buyer","99.95%",18126,18164,"أوزان منتجات"),
("C-125","Chief Factory Weights Officer","كبير مدراء أوزان المصانع","50 Factory Weights / Omniverse Twin 128 / Furnace 1200C / MODON","99.95%",18094,18126,"أوزان مصانع"),
("C-126","Chief Warehouse Weights Officer","كبير مدراء أوزان المستودعات","20 WMS Weights / USD Twin / Inventory M2M / WMS-01..20","99.9%",18158,18142,"أوزان مستودعات"),
("C-127","Chief Logistics Weights Officer","كبير مدراء أوزان اللوجستيات","24 Logistics Weights / BOL GPS / 【entity-Maersk¦canonical_name=Maersk】 【entity-DHL¦canonical_name=DHL】 / GoGreen","99.9%",18155,18093,"أوزان لوجستيات"),
("C-128","Chief Mining Weights Officer","كبير مدراء أوزان التعدين","MW-001..020 Weights / JORC / Ore Grade / EV Battery Minerals","99.8%",18093,18126,"أوزان تعدين"),
("C-129","Chief Scrap Weights Officer","كبير مدراء أوزان السكراب","SW-001..015 Weights / ISRI / HMS1&2 / WEEE Copper Berry","99.8%",18126,18093,"أوزان سكراب"),
("C-130","Chief Energy Weights Officer","كبير مدراء أوزان الطاقة","Energy Weights / ISO50001 / Solar Smelting / Green Hydrogen / CBAM","99.9%",18142,18155,"أوزان طاقة"),
("C-131","Chief Waqf Weights Officer","كبير مدراء أوزان الوقف","Waqf 10% Weights / Fixed Asset No Sale / Waqf Universal / SHA 0cf8bc3c","100%",18141,18142,"أوزان وقف"),
("C-132","Chief Zakat Weights Officer","كبير مدراء أوزان الزكاة","Zakat 2.5% Weights / 8 Masarif / AAOIFI / Halal Net 87%","100%",18141,18140,"أوزان زكاة"),
("C-133","Chief Transparency Weights Officer","كبير مدراء أوزان الشفافية","Transparency 0.5% Weights / 100K→500 / BOUND_BY_QURAN_SUNNAH","100%",18141,18163,"أوزان شفافية"),
("C-134","Chief Halal Net Weights Officer","كبير مدراء أوزان الصافي الحلال","Halal Net 87% Weights / 100K→87000 / Zero-Riba Zero-Gharar / 115K VAT","100%",18140,18163,"أوزان حلال"),
("C-135","Chief Computing Weights Officer","كبير مدراء أوزان الحوسبة","Computing Weights / 10K Weights / 10560 Nodes / 168960 Synaptic / 704 Seeds","100%",18131,18082,"أوزان حوسبة"),
("C-136","Chief Sharia Weights Officer","كبير مدراء أوزان الشريعة","Sharia Weights / Quran Sunnah / AAOIFI / Zero-Riba Zero-Gharar Gate / 100%","100%",18135,18141,"أوزان شريعة"),
("C-137","Chief Vision Weights Officer","كبير مدراء أوزان الرؤية","Vision Weights / Sheikha Vision + 【entity-Saudi Vision 2030¦canonical_name=Saudi Vision 2030】 + Cosmic / 96 KPIs","100%",18082,18161,"أوزان رؤية"),
("C-138","Chief International Weights Officer","كبير مدراء الأوزان الدولية والكونية","International Cosmic Weights / 12 Domains .world / Universe 18165 GRAND","100%",18161,18155,"أوزان دولية كونية"),
("C-139","Chief Cloud Weights Officer","كبير مدراء أوزان السحابة","Cloud Weights / IaaS PaaS SaaS Public Private Hybrid Multi / 12 Domains","100%",18125,18156,"أوزان سحابة"),
("C-140","Chief Federation Weights Officer","كبير مدراء أوزان الفدرلة","Federation Weights / 44→144 Chiefs / C1:D4:M12:E36 / M2M 10560","100%",18162,18082,"أوزان فدرلة"),
("C-141","Chief Blockchain Weights Officer","كبير مدراء أوزان البلوك شين","Blockchain Weights / Lawh Mahfuz Chain / MT-001 Provenance / SHK Token","100%",18142,18131,"أوزان بلوك شين"),
("C-142","Chief Sheikha Shin Weights Officer","كبير مدراء أوزان شيخة شين","Sheikha Shin Weights / Core 18082 / Registry edc795a4 / Gov 87ce771c","100%",18082,18142,"أوزان شيخة شين"),
("C-143","Chief Trade Voyage Weights Officer","كبير مدراء أوزان الرحلات التجارية","Voyage Weights / Voyage-001..100 / BOL 11-Col / GPS Twin / Maersk","99.9%",18155,18164,"أوزان رحلات"),
("C-144","Chief Supreme Sovereign Weights Officer","كبير المدراء الأعلى للأوزان السيادية الكبرى","Supreme Sovereign / GRAND 10000+ / 144 Chiefs / 2304 Seeds / 34560 Nodes / 552960 Synaptic / Registry edc795a4 / ATOM WATER RASUL JANNAH SEALED","100%",18082,18162,"أوزان سيادية كبرى"),
]

# كتابة
with open("SHEIKHA_V138_144_CHIEFS_GRAND_UNIVERSE.csv","w",newline="",encoding="utf-8") as f:
 w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Methodology","KPI","Port1","Port2","Seed","Nodes","License","Domain","Weight_Type"])
 for c in NEW_100:
  # نضيف من 45-144
  lic=f"SHK-M2M-2026-{c[0].split('-')[1]}"
  sha=hashlib.sha256((lic+c[1]).encode()).hexdigest()[:8]
  w.writerow([c[0],c[1],c[2],c[3],c[4],c[5],c[6],16,240,lic,c[7],f"W-{c[0]}"])

# دمج مع السابق 44
import csv as _csv
prev_path=Path("SHEIKHA_V137_44_CHIEFS_M2M_SUMMARY.csv")
all_chiefs=[]
if prev_path.exists():
 try:
  with open(prev_path,encoding="utf-8") as pf:
   r=_csv.DictReader(pf)
   for row in r: all_chiefs.append(row)
 except: pass

# JSON GRAND
total_chiefs=144
seeds=total_chiefs*16
nodes=seeds*15
synaptic=nodes*16
licenses=144
total_org_prev=2332
# C1:D4:M12:E36 for 144 => 144 chiefs, 576 directors, 1728 managers, 5184 employees = 7632
total_org_new=144+576+1728+5184

unified={
 "schema":"SHEIKHA_V138_GRAND_UNIVERSE_144_CHIEFS_SOVEREIGN",
 "timestamp":datetime.datetime.now().isoformat(),
 "seal":SEAL,"registry":REG,"governance":GOV,"owner":"سلمان أحمد بن سلمان الراجحي","cr":"2051263653","unified":"7049031003","vat":"310000000000003",
 "nawaa":{"core":18082,"watch":18162,"compute":18131,"sharia":18135,"waqf":18141,"vision":18082,"universe":18161,"status":"ZERO ROBOT ACTIVE — النواة الكبرى 144 كبير مدير BOUND_BY_QURAN_SUNNAH","weights":10000,"hold":"PRODUCTION_HOLD ACTIVE"},
 "grand":{"chiefs":total_chiefs,"seeds_gen0":seeds,"nodes_m2m":nodes,"synaptic":synaptic,"licenses":licenses,"foundry":56,"weights":10000,"twins":128,"factories":50,"warehouses":20,"logistics":24,"hs":5000,"markets":18,"sectors":22,"voyages":100},
 "org_expansion":{"prev_44":2332,"new_144":{"chiefs":144,"directors":576,"managers_important":1728,"employees":5184,"total":7632},"ratio":"C1:D4:M12:E36 — 144/576/1728/5184=7632","neural_new":{"seeds":total_org_new*2,"nodes":total_org_new*15,"synaptic":total_org_new*240}},
 "categories":{
  "markets_economy_management_systems":{"C-045":"أسواق 18 M-001..018","C-046":"اقتصاد ISIC4 21","C-047":"إدارة 1961→7632","C-048":"نظم ومنظمات وأنظمة ISO15288 COBIT","C-049":"نظم إدارية BPMN"},
  "computing_20_types_stages":{"count":20,"from":"C-050 to C-069","includes":"Foundations, Types, Stages, HPC, Quantum, Cloud, AI, Edge IoT, Cyber, Data, Network, Storage, Software, Hardware, Embedded, Calculation, Algorithm, Blockchain, Green, HCI"},
  "resources_info_metals_money_org":{"C-070":"مصادر MW SW","C-071":"معلومات CIO","C-072":"معادن MT-001..050","C-073":"مال 0.5/2.5/10/87%","C-074":"منظمات ومنظومة MODON","C-075":"فدرلة 44→144","C-076":"تكامل حكومي Fasah Etimad Balady"},
  "visions":{"C-077":"رؤية شيخة","C-078":"رؤية السعودية 2030 96 KPI","C-079":"استشارات محلية دولية","C-080":"رؤية شيخة الدولية الكونية .world"},
  "products_hs_markets":{"C-083..C-091":"HS 21 Section I-XXI + 5000+ HS + 50 Product MT + ISIC4 22 x Market 18 = 396 Matrix + 18 Market x 21 Section x 50 = 18900 Matrix"},
  "trade_voyages_chains":{"C-092":"رحلات تجارية","C-093":"كل رحلة Voyage-001..100","C-094":"شيخة شين","C-095":"بلوك شين Lawh Mahfuz","C-096..C-102":"سحابة 7 أنواع IaaS PaaS SaaS Public Private Hybrid Multi + Security + FinOps"},
  "supply_chain_stages_weights":{"C-103":"سلاسل إمداد SCOR","C-104..C-110":"7 مراحل منجم مصنع مستودع نقل ميناء توزيع ما بعد","C-111..C-116":"6 روابط Mine→Factory→Warehouse→Transport→Port→Distribution→Recycle","C-117..C-144":"أوزان سيادية لكل مرحلة ورابط: W-Mine W-Factory W-Warehouse W-Transport W-Port W-Distribution W-Voyage W-Computing W-Sharia W-Waqf W-Zakat W-Transparency W-Halal W-Blockchain W-Shin W-Cloud W-Federation Supreme"}
 },
 "weights_matrix":{"examples":{"market_weight":"M-007 LME $9500/ton 99%","product_weight":"MT-001 Cathode Cu 99.99% LME A SHA 374c6686","factory_weight":"F-001..050 Furnace 1200C","warehouse_weight":"WMS-01..20 Twin USD","transport_weight":"TR-001..024 BOL GPS","port_weight":"PORT Fasah Customs HS5000","distribution_weight":"DIST 10 POS CEO Buyer","voyage_weight":"Voyage-001..100 Maersk Twin","hs_weight":"HS 5000 WCO","sharia_weight":"100% AAOIFI Zero-Riba Zero-Gharar","waqf_weight":"10% Fixed No Sale 0cf8bc3c","computing_weight":"10K Weights 10560 Nodes 168960 Synaptic"}},
 "compliance":{"quran_sunnah":True,"aaoifi":True,"zero_riba_gharar":True,"8_masarif":True,"fixed_waqf_no_sale":True,"zatca_phase2":"UUID f18f8146 Hash 3bb78535","pdpl_gosi":True,"registry":REG,"seal":SEAL}
}
sha_all=hashlib.sha256(json.dumps(unified,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
unified["sha256"]=sha_all
Path("SHEIKHA_V138_GRAND_UNIVERSE_144_GOVERNANCE.json").write_text(json.dumps(unified,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"✓ V138 GRAND 144 Chiefs — 2304 Seeds | 34560 Nodes | 552960 Synaptic | 144 Licenses | 7632 Org — SHA {sha_all[:16]}")
for c in NEW_100[:5]: print(f"  {c[0]} {c[2]} — {c[4]}")
