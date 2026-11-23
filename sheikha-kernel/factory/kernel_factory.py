#!/usr/bin/env python3
# SHEIKHA KERNEL FACTORY - BOUND_BY_QURAN_SUNNAH 741/5741/12464
# تخصيص الكيرنل وتصميمه حسب المستخدم إذا كان لابتوب أو جوال أو مصنع لتشغيل مصنع أو طائرة لأنظمة الملاحة أو سفينة أو ميناء أو سيارة أو ريفاينري أو أنظمة عسكرية
# تصميم الكيرنل خاص بالمستخدم بناء على معلومات عن المستخدم - كيرنل للمصنع كيرنل للمستخدم إداري أو موظف إنتاج أو مهندس أو فني
# الموظف سواء مدير إنتاج أو مالية يتم إصدار كيرنل يتكامل مع بيئة المستخدم وبياناته الشخصية ومعرفته وشهاداته وكل شيء وبيانات أسرته ومجتمعه والأجهزة التي يملكها
# إذا تغير الموظف في نفس الوظيفة وأتى شخص مختلف بنفس المسمى الوظيفي يتم إصدار كيرنل جديد يتم تصميمه مناسب لبيئة الموظف الجديد وخبراته ومؤهلاته وأجهزته ومنزله وأهله وبياناته الوظيفية السابقة والجامعة والشهادات وإمكانياته وإرفاق السيرة الذاتية وأقسامها كاملة من مهارات ويتم تخصيص البيئة للعمل مع تأهيله للتدريب ويتم فتح الخواص آليا مع التدريب أو حسب التقدم العلمي أو الرؤية للدولة
# التنظيم الإداري والهيكلي والتعليمي والصحة للبيئة الوظيفية وللدولة ولإعمار الأرض والرؤية وتوحيدها لله وصحتها والتداوي والدواء والتطبب وعلاجها وإصلاحها في كل بيئة سواء مستشفى أو مدرسة طلاب معلمين أو جامعات أو مطارات أو طيران أو مصانع أو الأنظمة الوزارية أو الحكومية أو الدولية أو المنظمات للطاقة والبترول أو البتروكيميكال أو الصناعات البحرية أو الطاقة المتجددة أو إدارة المرافق وفرق العمل يتم تأهيل البيئة وتفعيل الرؤيا الموحدة لله والتعليم المستمر وتطوير بيئة الأعمال والتجارة والمجتمع والتكامل مع المجتمع ككل والدولة والشعب ورؤية الدولة والأهداف والبرامج والرسالة وتوثيق المساهمة ومعايير الجودة - تفعيل المصطلحات التقنية والإدارية والهندسية وكل العلوم حسب كل تخصص - غرسها من شيخه وباسم شيخه - 99% وقف - BOUND

import json, hashlib, datetime, uuid
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any

BASE = Path(__file__).parent.parent
FACTORY_ID = "SHKHA-FACTORY-741-BOUND"
SEAL = "BOUND_BY_QURAN_SUNNAH 741/5741/12464"

# === أنواع البيئات ===
ENV_TYPES = {
  "laptop": {"arch": "x86_64", "drivers": ["intel_gpu", "nvidia", "wifi6", "nvme", "usb4"], "security": "tpm2+secureboot", "sensors": ["imu", "als"], "vision": "2030_laptop"},
  "mobile": {"arch": "arm64", "drivers": ["modem_5g", "gps_gnss", "nfc", "biometric", "camera_isp"], "security": "secure_enclave+strongbox", "sensors": ["imu_9axis", "baro", "mag", "proximity", "camera", "mic_array"], "vision": "2030_mobile"},
  "factory": {"arch": "x86_64+arm64_mcu", "drivers": ["ethercat", "modbus_tcp", "opc_ua", "profinet", "canopen", "io_link", "plc_s7"], "security": "iec62443+secureboot+airgap", "sensors": ["industrial_imu", "vibration", "thermal_cam", "gas", "lidar_safety"], "vision": "2030_factory_4.0", "compliance": ["iso9001", "iso14001", "iso45001", "api_q1"]},
  "aircraft_navigation": {"arch": "arm64_r52+fpga", "drivers": ["arinc429", "arinc664", "mil1553", "adsb_in_out", "gnss_rtk", "inertial_nav", "radar_alt"], "security": "do178c_dalA+do254+secureboot", "sensors": ["inav_triple_redundant", "air_data", "radar_weather"], "vision": "gaca_vision_navigation", "compliance": ["do178c", "do254", "arp4754"]},
  "ship": {"arch": "x86_64+arm_mcu", "drivers": ["nmea2000", "ais", "ecdis", "gyrocompass", "autopilot_maritime", "engine_mtu"], "security": "imo_cyber+secureboot", "sensors": ["maritime_radar", "sonar", "imu_marine", "weather_station"], "vision": "2030_maritime_port"},
  "port": {"arch": "x86_64_server", "drivers": ["tos_n4", "crane_plc", "gate_ocr", "rtls_uwb", "lorawan_port"], "security": "isps+iec62443", "sensors": ["lidar_port", "cctv_ai", "environmental_port"], "vision": "2030_port_logistics"},
  "car": {"arch": "arm64_auto", "drivers": ["can_fd", "ethernet_auto", "gnss_auto", "lidar_auto", "radar_auto"], "security": "iso21434+secureboot+hsm", "sensors": ["imu_auto", "camera_auto_surround", "ultrasonic"], "vision": "2030_automotive"},
  "refinery": {"arch": "x86_64_dcs+arm_mcu", "drivers": ["honeywell_dcs", "yokogawa_dcs", "hart", "foundation_fieldbus", "sis_triconex"], "security": "iec62443_sl3+api1164+secureboot", "sensors": ["flame_detector", "gas_h2s_lel", "pressure_high_integrity", "thermal_imaging_refinery"], "vision": "2030_energy_petrochemical", "compliance": ["api", "api_q1", "iso50001", "osha_psm"]},
  "military": {"arch": "arm64_r52_secure+fpga_crypto", "drivers": ["link16", "mil1553b", "tactical_radio", "crypto_kms"], "security": "common_criteria_eal6+secureboot_fips140-3+tamper", "sensors": ["mil_imu", "ew_sensor"], "vision": "defense_vision_secure", "compliance": ["mil_std", "fips140-3"]},
  "hospital": {"arch": "x86_64", "drivers": ["hl7_fhir", "dicom", "pacs", "lis", "bedside_monitor"], "security": "hipaa+secureboot+encryption_at_rest", "sensors": ["biometric_medical", "environmental_ward"], "vision": "2030_health"},
  "school": {"arch": "x86_64+arm_tablet", "drivers": ["lms_moodle", "smartboard", "camera_classroom"], "security": "ferpa+secureboot", "sensors": ["camera_edu", "mic_class"], "vision": "2030_education"},
  "ministry": {"arch": "x86_64_server", "drivers": ["egov_api", "nfic", "yesser", "etebar"], "security": "nca_ecc+iso27001+secureboot", "sensors": ["access_control", "cctv_gov"], "vision": "2030_saudi_vision_gov"},
  "energy_petroleum": {"arch": "x86_64_server+dcs", "drivers": ["【entity-scada_abb¦canonical_name=ABB】", "pi_system", "wellhead_rtu", "pipeline_leak_detection"], "security": "iec62443_sl3+nca_ccc", "sensors": ["wellhead_pressure", "pipeline_fiber_optic"], "vision": "2030_energy", "compliance": ["api", "iso50001"]},
}

# === أنواع الوظائف ===
ROLE_TYPES = {
  "admin_ceo": {"privileges": ["sovereign_layer", "mizan", "factory_full", "tawhid_full", "salah_tawthiq", "waqf_99"], "training_path": ["قيادة", "توحيد", "رؤية 2030", "إسلام إيمان إحسان", "ولاء وبراء", "صلاة عمود الدين"], "vision_unlock": ["رؤية الدولة كاملة", "أهداف وبرامج ورسالة", "توثيق مساهمة", "معايير جودة"]},
  "production_manager": {"privileges": ["factory_mgmt", "opc_ua_rw", "safety_iso45001", "quality_iso9001", "team_mgmt", "salah_tawthiq"], "training_path": ["إدارة إنتاج", "سلامة", "جودة", "صلاة عمود الدين", "أمر بالمعروف"], "vision_unlock": ["رؤية مصنع", "أهداف إنتاج", "تطوير بيئة أعمال"]},
  "finance_manager": {"privileges": ["finance_read_write", "zakat_waqf_calc", "trade_makkah_madinah", "audit"], "training_path": ["مالية إسلامية", "زكاة ووقف 99%", "تجارة مكة رب اجعل هذا بلدا آمنا", "عدل شورى"], "vision_unlock": ["رؤية مالية", "رزق أهل مكة"]},
  "engineer": {"privileges": ["cad_cam", "plc_programming", "dcs_config", "api_standards", "design_review"], "training_path": ["هندسة تخصص", "مصطلحات تقنية وهندسية", "شهادات مهنية", "إحسان تحسين مستمر"], "vision_unlock": ["رؤية تقنية", "تفعيل مصطلحات هندسية"]},
  "technician": {"privileges": ["maintenance", "calibration", "safety_loto", "work_permit"], "training_path": ["فني حرفة", "تنمية الحرف", "سلامة", "صلاة"], "vision_unlock": ["رؤية حرفية", "تنمية مهارات"]},
  "doctor": {"privileges": ["emr_rw", "prescription", "triage", "emergency_module"], "training_path": ["طب", "صحة تداوي دواء تطبب علاج إصلاح", "إحسان", "ولاء وبراء"], "vision_unlock": ["رؤية صحية", "إعمار الأرض صحة"]},
  "teacher": {"privileges": ["lms_teach", "student_eval", "curriculum"], "training_path": ["تعليم", "تعليم مستمر", "تأهيل بيئة", "تربية"], "vision_unlock": ["رؤية تعليمية", "تطوير بيئة تعليم"]},
  "student": {"privileges": ["lms_learn", "library", "lab_basic"], "training_path": ["تعلم", "مهارات", "إسلام إيمان إحسان"], "vision_unlock": ["رؤية طالب", "تأهيل للتدريب"]},
  "pilot": {"privileges": ["flight_nav_read", "checklist", "emergency_proc"], "training_path": ["ملاحة جوية", "سلامة طيران", "صلاة توثيق"], "vision_unlock": ["رؤية طيران"]},
  "captain_ship": {"privileges": ["ship_nav", "engine_control", "safety_imo"], "training_path": ["ملاحة بحرية", "سلامة بحرية"], "vision_unlock": ["رؤية بحرية"]},
  "productive_family": {"privileges": ["family_project_mgmt", "trade_makkah", "zakat_calc"], "training_path": ["أسر منتجة", "تجارة", "وقف 99%", "حرفة"], "vision_unlock": ["رؤية أسرة منتجة", "تحقيق أهداف ورؤية الدولة"]},
}

@dataclass
class CV:
    full_name: str
    national_id: str = ""
    family_data: Dict[str, Any] = field(default_factory=dict)  # بيانات أسرته ومجتمعه
    education: List[Dict] = field(default_factory=list)  # جامعة وشهادات
    experience: List[Dict] = field(default_factory=list)  # بيانات وظيفية سابقة
    skills: List[str] = field(default_factory=list)  # مهارات
    certifications: List[str] = field(default_factory=list)  # شهادات مهنية استشارية حرفية
    devices: Dict[str, List[str]] = field(default_factory=dict)  # أجهزته: جوال لابتوبات موصلات أشباه موصلات
    home: Dict[str, Any] = field(default_factory=dict)  # منزله وأهله
    languages: List[str] = field(default_factory=list)
    vision_alignment: str = ""  # رؤيته
    cv_file_path: str = ""  # السيرة الذاتية مرفقة

@dataclass
class KernelSpec:
    serial: str
    env_type: str
    role_type: str
    cv: CV
    kernel_version: str
    arch: str
    drivers: List[str]
    security: str
    sensors: List[str]
    privileges: List[str]
    training_path: List[str]
    vision_unlock: List[str]
    compliance: List[str] = field(default_factory=list)
    gharas: str = "غرسها من شيخه وباسم شيخه - بسم شيخه لله - من شيخه لله - 99% وقف - توحيد كل شيء لله"
    seal: str = SEAL
    created_at: str = field(default_factory=lambda: datetime.datetime.now().isoformat())
    factory_id: str = FACTORY_ID

def generate_serial(env_type, role_type, cv: CV) -> str:
    raw = f"{env_type}-{role_type}-{cv.full_name}-{datetime.datetime.now().isoformat()}-{uuid.uuid4()}-741-BOUND"
    h = hashlib.sha256(raw.encode()).hexdigest()[:12].upper()
    return f"SHKHA-{env_type[:4].upper()}-{role_type[:4].upper()}-{h}-741"

def build_kernel(spec_input: dict) -> KernelSpec:
    """
    spec_input = {
      "env_type": "factory|refinery|hospital|school|laptop|mobile|aircraft_navigation|ship|port|car|military|energy_petroleum|ministry",
      "role_type": "admin_ceo|production_manager|finance_manager|engineer|technician|doctor|teacher|productive_family...",
      "cv": CV(...)
    }
    """
    env_type = spec_input["env_type"]
    role_type = spec_input["role_type"]
    cv: CV = spec_input["cv"]

    if env_type not in ENV_TYPES:
        raise ValueError(f"env_type غير معروف: {env_type} - المتاح: {list(ENV_TYPES.keys())}")
    if role_type not in ROLE_TYPES:
        raise ValueError(f"role_type غير معروف: {role_type} - المتاح: {list(ROLE_TYPES.keys())}")

    env_cfg = ENV_TYPES[env_type]
    role_cfg = ROLE_TYPES[role_type]

    # === تخصيص حسب أجهزة المستخدم - موصلات وأشباه موصلات ===
    custom_drivers = list(env_cfg["drivers"])
    # إذا عنده RTX 4060 نضيف CUDA
    for dev_list in cv.devices.values():
        for dev in dev_list:
            dl = dev.lower()
            if "rtx" in dl or "nvidia" in dl:
                if "cuda" not in custom_drivers: custom_drivers.append("cuda_13.2")
                if "nvidia" not in custom_drivers: custom_drivers.append("nvidia")
            if "esp32" in dl or "stm32" in dl or "semiconductor" in dl:
                if "embedded_hal" not in custom_drivers: custom_drivers.append("embedded_hal")
            if "lora" in dl:
                if "lorawan" not in custom_drivers: custom_drivers.append("lorawan")
            if "5g" in dl or "modem" in dl:
                if "modem_5g" not in custom_drivers: custom_drivers.append("modem_5g")

    # === تأهيل وفتح خواص آليا حسب التدريب والتقدم العلمي والرؤية ===
    privileges = list(role_cfg["privileges"])
    # إذا عنده شهادات مهنية يفتح خواص إضافية
    for cert in cv.certifications:
        cl = cert.lower()
        if "pmp" in cl or "pmi" in cl:
            if "project_mgmt_advanced" not in privileges: privileges.append("project_mgmt_advanced")
        if "api" in cl and env_type in ["refinery", "factory", "energy_petroleum"]:
            if "api_q1_q2" not in privileges: privileges.append("api_q1_q2")
        if "nebosh" in cl or "iosh" in cl:
            if "safety_advanced" not in privileges: privileges.append("safety_advanced")
        if "cisco" in cl or "ccna" in cl:
            if "network_advanced" not in privileges: privileges.append("network_advanced")

    # === إذا تغير الموظف بنفس المسمى يصدر كيرنل جديد - نولد serial جديد كل مرة ===
    serial = generate_serial(env_type, role_type, cv)

    spec = KernelSpec(
        serial=serial,
        env_type=env_type,
        role_type=role_type,
        cv=cv,
        kernel_version=f"v1-{env_type}-{role_type}-BOUND-741-{datetime.datetime.now().strftime('%Y%m%d')}",
        arch=env_cfg["arch"],
        drivers=custom_drivers,
        security=env_cfg["security"],
        sensors=env_cfg["sensors"],
        privileges=privileges,
        training_path=role_cfg["training_path"],
        vision_unlock=role_cfg["vision_unlock"],
        compliance=env_cfg.get("compliance", []),
    )

    # === حفظ الكيرنل المخصص ===
    out_dir = BASE / "client-serials" / env_type / role_type
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{serial}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(asdict(spec), f, ensure_ascii=False, indent=2)

    # === ISO config مخصص ===
    iso_cfg_dir = BASE / "boot" / "iso_configs"
    iso_cfg_dir.mkdir(parents=True, exist_ok=True)
    iso_cfg = {
        "serial": serial,
        "env_type": env_type,
        "role_type": role_type,
        "kernel_version": spec.kernel_version,
        "arch": spec.arch,
        "gharas": spec.gharas,
        "tawhid": "توحيد كل شيء في الكون لله - لا إله إلا الله وحده لا شريك له",
        "salah": "عمود الدين الصلاة - توثيق أوقاتها - موقوتا",
        "cv_summary": {
            "name": cv.full_name,
            "education": cv.education,
            "skills_count": len(cv.skills),
            "devices_count": sum(len(v) for v in cv.devices.values()),
            "family": cv.family_data.get("members", 0)
        },
        "training": {
            "current_path": spec.training_path,
            "auto_unlock": "يتم فتح الخواص آليا مع التدريب أو حسب التقدم العلمي أو الرؤية للدولة المستخدم أو البيئة الوظيفية ويتم تطوير الرؤيا وتحسينها باستمرار"
        },
        "vision": {
            "unified": "تفعيل الرؤيا الموحدة لله - رؤية الدولة والأهداف والبرامج والرسالة وتوثيق المساهمة ومعايير الجودة - إعمار الأرض",
            "org_structure": "التنظيم الإداري والهيكلي والتعليمي والصحة للبيئة الوظيفية وللدولة",
            "health": "صحتها والتداوي والدواء والتطبب وعلاجها وإصلاحها في كل بيئة - مستشفى مدرسة جامعة مطار مصنع وزارة منظمة طاقة بترول بتروكيميكال بحرية متجددة مرافق",
            "community": "التكامل مع المجتمع ككل والدولة والشعب ورؤية الدولة"
        }
    }
    with open(iso_cfg_dir / f"{serial}.iso.json", "w", encoding="utf-8") as f:
        json.dump(iso_cfg, f, ensure_ascii=False, indent=2)

    return spec

if __name__ == "__main__":
    # === أمثلة - BOUND ===
    examples = [
        {
            "env_type": "factory",
            "role_type": "production_manager",
            "cv": CV(
                full_name="أحمد محمد - مدير إنتاج مصنع بتروكيميكال",
                education=[{"degree": "بكالوريوس هندسة كيميائية", "university": "KFUPM", "year": 2015}],
                experience=[{"company": "أرامكو", "role": "مهندس إنتاج", "years": 5}],
                skills=["إدارة إنتاج", "سلامة", "ISO9001", "OPC UA", "صلاة عمود الدين"],
                certifications=["NEBOSH", "API Q1", "PMP"],
                devices={"laptop": ["Pop!_OS Ultra 9 RTX 4060"], "mobile": ["5G Modem"], "semiconductor": ["ESP32", "STM32H7"]},
                family_data={"members": 4, "community": "الجبيل الصناعية"},
                home={"city": "الجبيل", "type": "villa"},
                vision_alignment="رؤية 2030 - تطوير صناعة بتروكيميكال - توحيد لله",
                cv_file_path="/home/sheikha/cv/ahmad_production.pdf"
            )
        },
        {
            "env_type": "refinery",
            "role_type": "engineer",
            "cv": CV(
                full_name="سارة خالد - مهندسة تكرير",
                education=[{"degree": "ماجستير هندسة بترول", "university": "KFUPM", "year": 2020}],
                skills=["تكرير", "DCS Yokogawa", "H2S Safety", "مصطلحات هندسية"],
                certifications=["API 510", "API 570"],
                devices={"laptop": ["ThinkPad"], "semiconductor": ["LoRaWAN Sensor"]},
                family_data={"members": 3},
                vision_alignment="رؤية 2030 طاقة"
            )
        },
        {
            "env_type": "hospital",
            "role_type": "doctor",
            "cv": CV(
                full_name="د. شيخة - طبيبة",
                education=[{"degree": "طب وجراحة", "university": "جامعة الملك سعود", "year": 2018}],
                skills=["طب طوارئ", "تداوي دواء تطبب", "إحسان", "صحة"],
                certifications=["BLS", "ACLS"],
                devices={"mobile": ["iPhone Medical"], "laptop": ["MacBook"]},
                family_data={"members": 2},
                vision_alignment="رؤية 2030 صحة - إعمار الأرض صحة"
            )
        },
        {
            "env_type": "school",
            "role_type": "teacher",
            "cv": CV(
                full_name="معلمة - مدرسة",
                education=[{"degree": "بكالوريوس تربية", "university": "جامعة نورة", "year": 2016}],
                skills=["تعليم", "تعليم مستمر", "تأهيل بيئة", "صلاة"],
                devices={"laptop": ["【entity-Dell¦canonical_name=Dell】"], "mobile": ["Android"]},
                family_data={"members": 5}
            )
        },
        {
            "env_type": "port",
            "role_type": "engineer",
            "cv": CV(
                full_name="مهندس ميناء - الجبيل",
                education=[{"degree": "هندسة بحرية", "university": "الأكاديمية البحرية", "year": 2017}],
                skills=["TOS N4", "Crane PLC", "Logistics"],
                devices={"laptop": ["Rugged Laptop"]},
                family_data={"members": 4}
            )
        }
    ]

    for ex in examples:
        spec = build_kernel(ex)
        print(f"✅ KERNEL CUSTOM: {spec.serial} | ENV={spec.env_type} | ROLE={spec.role_type} | NAME={spec.cv.full_name} | ARCH={spec.arch} | DRIVERS={len(spec.drivers)} | PRIV={spec.privileges[:3]}... | BOUND - غرسها من شيخه")
        print(f"   -> {BASE / 'client-serials' / ex['env_type'] / ex['role_type'] / f'{spec.serial}.json'}")
