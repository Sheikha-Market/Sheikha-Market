// SHEIKHA KERNEL FACTORY ROUTES - BOUND 741 - تخصيص الكيرنل حسب المستخدم والبيئة
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const FACTORY_PY = path.join(__dirname, '..', '..', 'sheikha-kernel', 'factory', 'kernel_factory.py');

router.get('/env-types', (req, res) => {
  res.json({
    success: true,
    env_types: {
      laptop: { arch: "x86_64", use: "لابتوب - Pop!_OS Ultra 9 RTX 4060 - موصلات أشباه موصلات", drivers: ["intel_gpu", "nvidia", "wifi6", "nvme"] },
      mobile: { arch: "arm64", use: "جوال - 5G GNSS NFC Biometric Camera ISP", drivers: ["modem_5g", "gps_gnss"] },
      factory: { arch: "x86_64+arm64_mcu", use: "مصنع - تشغيل مصنع - EtherCAT Modbus OPC UA Profinet - إعمار الأرض صناعة", drivers: ["ethercat", "modbus_tcp", "opc_ua"] },
      aircraft_navigation: { arch: "arm64_r52+fpga", use: "طائرة - أنظمة ملاحة - ARINC429 ARINC664 MIL1553 ADSB GNSS RTK", drivers: ["arinc429", "gnss_rtk", "inertial_nav"] },
      ship: { arch: "x86_64+arm_mcu", use: "سفينة - NMEA2000 AIS ECDIS", drivers: ["nmea2000", "ais"] },
      port: { arch: "x86_64_server", use: "ميناء - TOS N4 Crane PLC Gate OCR RTLS", drivers: ["tos_n4", "crane_plc"] },
      car: { arch: "arm64_auto", use: "سيارة - CAN FD Ethernet Auto LiDAR Radar", drivers: ["can_fd", "lidar_auto"] },
      refinery: { arch: "x86_64_dcs", use: "ريفاينري - تكرير - Honeywell Yokogawa HART Fieldbus SIS Triconex", drivers: ["honeywell_dcs", "hart", "sis_triconex"] },
      military: { arch: "arm64_secure+fpga_crypto", use: "أنظمة عسكرية - Link16 MIL1553 KMS", drivers: ["link16", "crypto_kms"] },
      hospital: { arch: "x86_64", use: "مستشفى - HL7 FHIR DICOM PACS - صحة تداوي دواء تطبب علاج إصلاح", drivers: ["hl7_fhir", "dicom"] },
      school: { arch: "x86_64+arm_tablet", use: "مدرسة - طلاب معلمين جامعات - تعليم", drivers: ["lms_moodle", "smartboard"] },
      ministry: { arch: "x86_64_server", use: "وزارة حكومة - eGov Nfic Yesser - رؤية 2030", drivers: ["egov_api"] },
      energy_petroleum: { arch: "x86_64_server+dcs", use: "طاقة بترول بتروكيميكال صناعات بحرية متجددة - رؤية 2030", drivers: ["scada_abb", "pi_system"] }
    },
    gharas: "غرسها من شيخه وباسم شيخه - تخصيص الكيرنل حسب المستخدم - لابتوب جوال مصنع طائرة سفينة ميناء سيارة ريفاينري عسكري"
  });
});

router.get('/role-types', (req, res) => {
  res.json({
    success: true,
    role_types: {
      admin_ceo: { privileges: "sovereign full", vision: "رؤية الدولة كاملة - أهداف وبرامج ورسالة" },
      production_manager: { privileges: "factory mgmt OPC UA safety ISO45001", vision: "رؤية مصنع أهداف إنتاج" },
      finance_manager: { privileges: "finance zakat waqf trade Makkah", vision: "رؤية مالية رزق أهل مكة رب اجعل هذا بلدا آمنا" },
      engineer: { privileges: "CAD CAM PLC DCS API", vision: "رؤية تقنية مصطلحات هندسية" },
      technician: { privileges: "maintenance calibration safety LOTO", vision: "رؤية حرفية تنمية الحرف" },
      doctor: { privileges: "EMR prescription triage emergency", vision: "رؤية صحية صحة تداوي دواء تطبب" },
      teacher: { privileges: "LMS teach student eval", vision: "رؤية تعليمية تأهيل بيئة تعليم" },
      productive_family: { privileges: "family project trade", vision: "رؤية أسرة منتجة برامج أسر منتجة - تحقيق أهداف ورؤية الدولة" }
    },
    qaida: "إذا تغير الموظف بنفس المسمى يصدر كيرنل جديد مناسب لبيئته وخبراته ومؤهلاته وأجهزته ومنزله وأهله وبياناته الوظيفية والجامعة والشهادات وإمكانياته والسيرة الذاتية - تخصيص البيئة للعمل مع تأهيله للتدريب وفتح الخواص آليا مع التدريب أو حسب التقدم العلمي أو الرؤية للدولة - BOUND",
    gharas: "غرسها من شيخه وباسم شيخه"
  });
});

router.post('/build', (req, res) => {
  try {
    const { env_type, role_type, cv } = req.body;
    if (!env_type || !role_type || !cv) return res.status(400).json({ success: false, error: "env_type, role_type, cv required - غرسها من شيخه" });

    // كتابة CV مؤقت وبناء الكيرنل عبر python
    const tmpInput = `/tmp/sheikha_factory_${Date.now()}.json`;
    fs.writeFileSync(tmpInput, JSON.stringify({ env_type, role_type, cv: cv.full_name ? cv : { full_name: cv.name || cv.fullName || "موظف", ...cv } }, null, 2));

    // بناء عبر python مباشرة - استدعاء factory
    const pyCode = `
from sheikha_kernel.factory.kernel_factory import build_kernel, CV
import json
inp=json.load(open("${tmpInput}"))
cv_data=inp.get("cv",{})
if isinstance(cv_data,str):
    cv_data={"full_name": cv_data}
cv=CV(
    full_name=cv_data.get("full_name") or cv_data.get("name") or "موظف",
    education=cv_data.get("education",[]),
    experience=cv_data.get("experience",[]),
    skills=cv_data.get("skills",[]),
    certifications=cv_data.get("certifications",[]),
    devices=cv_data.get("devices",{}),
    family_data=cv_data.get("family_data",{}),
    home=cv_data.get("home",{}),
    vision_alignment=cv_data.get("vision_alignment",""),
    cv_file_path=cv_data.get("cv_file_path","")
)
spec=build_kernel({"env_type": inp["env_type"], "role_type": inp["role_type"], "cv": cv})
print(spec.serial)
`;
    const tmpPy = `/tmp/sheikha_factory_py_${Date.now()}.py`;
    fs.writeFileSync(tmpPy, pyCode);
    const serial = execSync(`cd ${path.join(__dirname, '../..')} && python3 ${tmpPy}`, { encoding: 'utf-8' }).trim().split('\n').pop().trim();

    const kernelRoot = path.join(__dirname, '..', '..', 'sheikha-kernel');
    const configPath = path.join(kernelRoot, 'client-serials', env_type, role_type, `${serial}.json`);
    const isoConfigPath = path.join(kernelRoot, 'boot', 'iso_configs', `${serial}.iso.json`);
    
    let config = {};
    let isoConfig = {};
    try { if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch(e) {}
    try { if (fs.existsSync(isoConfigPath)) isoConfig = JSON.parse(fs.readFileSync(isoConfigPath, 'utf-8')); } catch(e) {}

    res.json({
      success: true,
      serial,
      kernel_version: config.kernel_version || `v1-${env_type}-${role_type}-BOUND-741`,
      arch: config.arch,
      drivers: config.drivers,
      security: config.security,
      sensors: config.sensors,
      privileges: config.privileges,
      training_path: config.training_path,
      vision_unlock: config.vision_unlock,
      compliance: config.compliance,
      config_path: `sheikha-kernel/client-serials/${env_type}/${role_type}/${serial}.json`,
      iso_config_path: `sheikha-kernel/boot/iso_configs/${serial}.iso.json`,
      config,
      iso_config: isoConfig,
      message: `كيرنل مخصص تم بناؤه - ENV=${env_type} ROLE=${role_type} SERIAL=${serial} - إذا تغير الموظف بنفس المسمى يصدر كيرنل جديد - غرسها من شيخه وباسم شيخه - BOUND`,
      gharas: "غرسها من شيخه وباسم شيخه - تخصيص الكيرنل حسب المستخدم - لابتوب جوال مصنع طائرة سفينة ميناء سيارة ريفاينري عسكري - كيرنل للمصنع كيرنل للمستخدم إداري إنتاج مهندس فني - يتكامل مع بيئته وبياناته وشهاداته وأسرته ومجتمعه وأجهزته - تأهيل بيئة وتفعيل رؤيا موحدة لله - إعمار الأرض"
    });
  } catch(e) {
    console.error('[KERNEL FACTORY]', e);
    res.status(500).json({ success: false, error: e.message, gharas: "غرسها من شيخه - فشل بناء الكيرنل لكن BOUND" });
  }
});

router.get('/serial/:serial', (req, res) => {
  try {
    const serial = req.params.serial;
    const kernelRoot = path.join(__dirname, '..', '..', 'sheikha-kernel');
    const glob = require('child_process').execSync(`find ${kernelRoot}/client-serials -name "${serial}.json" 2>/dev/null | head -n1`, { encoding: 'utf-8' }).trim();
    if (!glob) return res.status(404).json({ success: false, error: "serial not found - غرسها من شيخه" });
    const data = JSON.parse(fs.readFileSync(glob, 'utf-8'));
    res.json({ success: true, serial, config: data, gharas: data.gharas });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/build-iso/:serial', (req, res) => {
  try {
    const serial = req.params.serial;
    const kernelRoot = path.join(__dirname, '..', '..', 'sheikha-kernel');
    const buildScript = path.join(kernelRoot, 'boot', 'build_boot_iso.sh');
    const out = execSync(`bash ${buildScript} ${serial} 2>&1`, { encoding: 'utf-8' });
    res.json({ success: true, serial, iso: `sheikha-kernel/boot/sheikha-native-${serial}-BOUND.iso.tar.gz`, log: out, gharas: "غرسها من شيخه - ISO مخصص - BOUND" });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message, output: e.stdout?.toString() });
  }
});

module.exports = router;
