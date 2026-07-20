#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/hardware-compatibility/v1'
);
const REGISTRY_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-compatibility-registry-v1.json'
);
const REPORT_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-universal-hardware-compatibility-v1-report.json'
);
const MATRIX_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-qualification-matrix-v1.json'
);
const GRAPH_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-compatibility-graph-v1.json'
);
const ROADMAP_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-porting-roadmap-v1.json'
);
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/contracts/' +
    'sheikha-universal-hardware-compatibility-fabric-v1-contract.json'
);
const DRIVER_ABI_PATH = path.join(
  ROOT,
  'bare-metal/include/sheikha_driver_abi_v1.h'
);
const DRIVER_ABI_SMOKE_SOURCE_PATH = path.join(
  ROOT,
  'bare-metal/hal/sheikha_driver_abi_v1_smoke.c'
);
const DRIVER_ABI_SMOKE_REPORT_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-driver-abi-v1-smoke-report.json'
);
const HAL_CONTRACT_PATH = path.join(
  ROOT,
  'bare-metal/contracts/SHEIKHA-HAL-CONTRACT-V1.json'
);
const UEFI_REPORT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/uefi-integration/v1/' +
    'sheikha-uefi-integration-v1-report.json'
);
const UEFI_REGISTRY_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/uefi-integration/v1/' +
    'sheikha-uefi-capability-registry-v1.json'
);
const MSI_REPORT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1/' +
    'sheikha-v2-msi-usb-gpt-v1-report.json'
);
const SERIAL_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/evidence/' +
    'sheikha-v2-uefi-paging-runtime-phase2b-serial.log'
);
const EFI_ARTIFACT_PATH = path.join(
  ROOT,
  'bare-metal/images/v2/esp/EFI/BOOT/BOOTX64.EFI'
);
const MSI_IMAGE_PATH = path.join(
  ROOT,
  'bare-metal/images/v2/' +
    'sheikha-sovereign-bare-metal-v2-msi-usb-gpt-v1.img'
);
const HOST_PREFLIGHT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1/' +
    'sheikha-v2-host-hardware-preflight-v1.json'
);
const DESKTOP_REPORT_PATH = path.join(
  ROOT,
  'runtime/desktop-runtime/v4/sheikha-native-desktop-v4-report.json'
);
const DEB_REPORT_PATH = path.join(
  ROOT,
  'runtime/distribution/v6/sheikha-linux-deb-native-lifecycle-v6-report.json'
);
const SITE_SMOKE_PATH = path.join(
  ROOT,
  'runtime/site-operations/v1/sheikha-local-site-smoke-v1-report.json'
);

const QUALIFICATION_LEVELS = Object.freeze([
  {
    rank: 0,
    id: 'REGISTERED',
    requirement: 'Target identity, ownership, and risk classification.',
  },
  {
    rank: 1,
    id: 'CONTRACT_VERIFIED',
    requirement: 'Driver ABI, capability contract, and default-deny policy.',
  },
  {
    rank: 2,
    id: 'BUILD_VERIFIED',
    requirement: 'Architecture-specific artifact and binary inspection.',
  },
  {
    rank: 3,
    id: 'EMULATED_VERIFIED',
    requirement: 'Repeatable emulator boot or device-harness evidence.',
  },
  {
    rank: 4,
    id: 'NATIVE_VERIFIED',
    requirement: 'Native runner execution with bounded lifecycle evidence.',
  },
  {
    rank: 5,
    id: 'PHYSICAL_VERIFIED',
    requirement: 'Named physical board or machine test and recovery evidence.',
  },
  {
    rank: 6,
    id: 'SAFETY_CERTIFIED',
    requirement: 'Independent domain certification and approved safety case.',
  },
]);

const ARCHITECTURE_DEFINITIONS = Object.freeze([
  {
    id: 'x86_64',
    wordSize: 64,
    endian: 'little',
    firmwareAdapters: ['UEFI', 'ACPI'],
    domains: ['laptop', 'desktop', 'server', 'hpc', 'industrial'],
    blockers: ['PHYSICAL_MACHINE_MATRIX', 'NATIVE_DEVICE_DRIVERS'],
  },
  {
    id: 'aarch64',
    wordSize: 64,
    endian: 'little',
    firmwareAdapters: ['UEFI', 'ACPI', 'DEVICE_TREE'],
    domains: ['mobile', 'laptop', 'server', 'automotive', 'embedded', 'hpc'],
    blockers: [
      'ARCHITECTURE_ENTRY_PORT',
      'PAGE_TABLE_PORT',
      'INTERRUPT_CONTROLLER_DRIVER',
      'NATIVE_RUNNER',
    ],
  },
  {
    id: 'armv7-a',
    wordSize: 32,
    endian: 'little',
    firmwareAdapters: ['DEVICE_TREE', 'VENDOR_BOOT_CHAIN'],
    domains: ['embedded', 'industrial', 'legacy-mobile'],
    blockers: ['ARCHITECTURE_PORT', 'BOARD_SUPPORT_PACKAGE', 'NATIVE_RUNNER'],
  },
  {
    id: 'riscv64',
    wordSize: 64,
    endian: 'little',
    firmwareAdapters: ['SBI', 'UEFI', 'DEVICE_TREE'],
    domains: ['embedded', 'server', 'accelerator', 'custom-silicon'],
    blockers: ['ARCHITECTURE_PORT', 'SBI_ADAPTER', 'NATIVE_RUNNER'],
  },
  {
    id: 'ppc64le',
    wordSize: 64,
    endian: 'little',
    firmwareAdapters: ['OPEN_FIRMWARE', 'DEVICE_TREE'],
    domains: ['server', 'hpc'],
    blockers: ['ARCHITECTURE_PORT', 'FIRMWARE_ADAPTER', 'NATIVE_RUNNER'],
  },
  {
    id: 's390x',
    wordSize: 64,
    endian: 'big',
    firmwareAdapters: ['PLATFORM_BOOT_CONTRACT'],
    domains: ['mainframe', 'enterprise-server'],
    blockers: ['ARCHITECTURE_PORT', 'PLATFORM_ABI', 'NATIVE_RUNNER'],
  },
  {
    id: 'loongarch64',
    wordSize: 64,
    endian: 'little',
    firmwareAdapters: ['UEFI', 'ACPI'],
    domains: ['desktop', 'server'],
    blockers: ['ARCHITECTURE_PORT', 'TOOLCHAIN', 'NATIVE_RUNNER'],
  },
  {
    id: 'custom-fpga-asic',
    wordSize: null,
    endian: 'DESIGN_SPECIFIC',
    firmwareAdapters: ['BOARD_SUPPORT_PACKAGE'],
    domains: ['semiconductor', 'fpga', 'asic', 'accelerator'],
    blockers: [
      'ISA_SPECIFICATION',
      'HDL_OR_SILICON_TOOLCHAIN',
      'BOARD_SUPPORT_PACKAGE',
      'SILICON_VALIDATION',
    ],
  },
]);

const TARGET_DEFINITIONS = Object.freeze([
  {
    id: 'pc-laptop-desktop-x86_64',
    title: 'x86_64 UEFI laptops and desktops',
    domain: 'PERSONAL_COMPUTING',
    architectures: ['x86_64'],
    boot: ['UEFI', 'GPT', 'FAT32'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['firmware-uefi', 'bus-pcie', 'peripheral-usb', 'input-hid'],
    blockers: ['PHYSICAL_MACHINE_MATRIX', 'STORAGE_INPUT_NETWORK_DRIVERS'],
  },
  {
    id: 'pc-laptop-desktop-arm64',
    title: 'ARM64 laptops and desktops',
    domain: 'PERSONAL_COMPUTING',
    architectures: ['aarch64'],
    boot: ['UEFI_OR_VENDOR_BOOT_CHAIN'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['firmware-uefi', 'firmware-acpi', 'bus-pcie', 'peripheral-usb'],
    blockers: ['AARCH64_KERNEL_PORT', 'BOARD_SUPPORT_PACKAGE', 'NATIVE_RUNNER'],
  },
  {
    id: 'smartphone-tablet-open-arm64',
    title: 'ARM64 phones and tablets with an open boot path',
    domain: 'MOBILE',
    architectures: ['aarch64'],
    boot: ['VENDOR_BOOT_CHAIN', 'DEVICE_TREE'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['display-mipi-dsi', 'camera-mipi-csi', 'network-cellular', 'storage-sd-emmc'],
    blockers: ['VENDOR_BOOT_ADAPTER', 'MOBILE_SOC_BSP', 'TOUCH_POWER_RADIO_DRIVERS'],
  },
  {
    id: 'mobile-hosted-applications',
    title: 'Hosted mobile applications',
    domain: 'MOBILE',
    architectures: ['aarch64', 'armv7-a', 'x86_64'],
    boot: ['HOST_OPERATING_SYSTEM'],
    safetyClass: 'DATA_PATH',
    requiredConnectors: ['host-mobile-api'],
    blockers: ['ANDROID_NATIVE_RUNNER', 'IOS_NATIVE_RUNNER', 'STORE_SIGNING_NOT_AUTHORIZED'],
  },
  {
    id: 'datacenter-servers',
    title: 'Data-center servers',
    domain: 'DATACENTER',
    architectures: ['x86_64', 'aarch64', 'ppc64le'],
    boot: ['UEFI', 'NETWORK_OR_LOCAL_MEDIA'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['bus-pcie', 'storage-nvme', 'network-ethernet', 'security-tpm'],
    blockers: ['SERVER_HARDWARE_MATRIX', 'RAS_DRIVERS', 'SCALE_AND_RECOVERY_TESTS'],
  },
  {
    id: 'hpc-supercomputer-cluster',
    title: 'Heterogeneous HPC and supercomputer clusters',
    domain: 'HPC',
    architectures: ['x86_64', 'aarch64', 'ppc64le', 'riscv64'],
    boot: ['NODE_FIRMWARE', 'PROVISIONING_CONTROL_PLANE'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['hpc-rdma', 'hpc-message-passing', 'compute-gpu', 'storage-parallel'],
    blockers: ['INTERCONNECT_DRIVER', 'ACCELERATOR_RUNTIME', 'SCHEDULER_ADAPTER', 'SCALE_BENCHMARK'],
  },
  {
    id: 'automotive-safety-controller',
    title: 'Automotive safety controller',
    domain: 'AUTOMOTIVE',
    architectures: ['aarch64', 'armv7-a', 'riscv64', 'custom-fpga-asic'],
    boot: ['SIGNED_BOARD_BOOT_CHAIN'],
    safetyClass: 'LIFE_CRITICAL',
    requiredConnectors: ['automotive-can-fd', 'automotive-lin', 'automotive-ethernet', 'safety-watchdog'],
    blockers: ['REAL_TIME_KERNEL_PROFILE', 'LOCKSTEP_OR_SAFETY_MONITOR', 'INDEPENDENT_SAFETY_CASE'],
  },
  {
    id: 'automotive-infotainment',
    title: 'Automotive information and entertainment system',
    domain: 'AUTOMOTIVE',
    architectures: ['aarch64', 'x86_64'],
    boot: ['VENDOR_BOOT_CHAIN'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['display-mipi-dsi', 'audio-hda', 'automotive-ethernet', 'network-cellular'],
    blockers: ['VEHICLE_GATEWAY_ISOLATION', 'SOC_BSP', 'PHYSICAL_VEHICLE_TEST'],
  },
  {
    id: 'industrial-edge-controller',
    title: 'Industrial edge and machine controller',
    domain: 'INDUSTRIAL',
    architectures: ['x86_64', 'aarch64', 'armv7-a', 'riscv64'],
    boot: ['UEFI_OR_BOARD_BOOT_CHAIN'],
    safetyClass: 'PHYSICAL_ACTUATION',
    requiredConnectors: ['industrial-modbus', 'industrial-opcua', 'bus-gpio', 'sensor-iio'],
    blockers: ['DETERMINISTIC_RUNTIME', 'MACHINE_BSP', 'SITE_ACCEPTANCE', 'FUNCTIONAL_SAFETY_CASE'],
  },
  {
    id: 'factory-control-tower',
    title: 'Factory control tower and operations workstation',
    domain: 'INDUSTRIAL',
    architectures: ['x86_64', 'aarch64'],
    boot: ['HOST_OPERATING_SYSTEM_OR_UEFI'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['industrial-opcua', 'network-ethernet', 'storage-nvme'],
    blockers: ['SITE_PROTOCOL_PROFILE', 'REDUNDANCY_TEST', 'OPERATOR_ACCEPTANCE'],
  },
  {
    id: 'embedded-iot-controller',
    title: 'Embedded and IoT controller',
    domain: 'EMBEDDED',
    architectures: ['aarch64', 'armv7-a', 'riscv64', 'custom-fpga-asic'],
    boot: ['BOARD_SUPPORT_PACKAGE'],
    safetyClass: 'DATA_PATH',
    requiredConnectors: ['bus-i2c', 'bus-spi', 'bus-gpio', 'network-low-power'],
    blockers: ['BOARD_SUPPORT_PACKAGE', 'POWER_PROFILE', 'DEVICE_DRIVER_SET'],
  },
  {
    id: 'network-appliance',
    title: 'Network and communications appliance',
    domain: 'NETWORK',
    architectures: ['x86_64', 'aarch64', 'riscv64'],
    boot: ['UEFI_OR_BOARD_BOOT_CHAIN'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['network-ethernet', 'bus-pcie', 'security-tpm'],
    blockers: ['PACKET_IO_DRIVER', 'FAILOVER_TEST', 'NETWORK_SECURITY_QUALIFICATION'],
  },
  {
    id: 'mainframe-enterprise-system',
    title: 'Mainframe and enterprise architecture system',
    domain: 'ENTERPRISE_COMPUTE',
    architectures: ['s390x'],
    boot: ['PLATFORM_BOOT_CONTRACT'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['host-enterprise-api', 'storage-enterprise', 'network-ethernet'],
    blockers: ['S390X_PORT', 'NATIVE_RUNNER', 'PLATFORM_IO_ADAPTER'],
  },
  {
    id: 'fpga-asic-development-board',
    title: 'FPGA, ASIC, and custom semiconductor board',
    domain: 'SEMICONDUCTOR',
    architectures: ['custom-fpga-asic', 'riscv64'],
    boot: ['BOARD_SUPPORT_PACKAGE'],
    safetyClass: 'SYSTEM_CONTROL',
    requiredConnectors: ['debug-jtag-swd', 'bus-pcie', 'bus-spi', 'compute-fpga'],
    blockers: ['ISA_AND_REGISTER_SPEC', 'HDL_OR_SILICON_TOOLCHAIN', 'BOARD_AND_SILICON_VALIDATION'],
  },
  {
    id: 'cloud-virtual-machine-container',
    title: 'Cloud virtual machine and container runtime',
    domain: 'CLOUD',
    architectures: ['x86_64', 'aarch64', 'ppc64le', 's390x'],
    boot: ['HYPERVISOR_OR_HOST_RUNTIME'],
    safetyClass: 'DATA_PATH',
    requiredConnectors: ['host-posix-api', 'host-container-api', 'network-ethernet'],
    blockers: ['NATIVE_RUNNER_MATRIX', 'IMAGE_LIFECYCLE_TEST', 'CLOUD_IDENTITY_ADAPTER'],
  },
  {
    id: 'medical-instrument',
    title: 'Medical and life-critical instrument',
    domain: 'MEDICAL',
    architectures: ['x86_64', 'aarch64', 'armv7-a', 'custom-fpga-asic'],
    boot: ['VERIFIED_BOARD_BOOT_CHAIN'],
    safetyClass: 'LIFE_CRITICAL',
    requiredConnectors: ['sensor-iio', 'safety-watchdog', 'security-secure-element'],
    blockers: ['CLINICAL_SCOPE', 'INDEPENDENT_CERTIFICATION', 'FAIL_SAFE_HARDWARE', 'HUMAN_OVERSIGHT'],
  },
  {
    id: 'robotics-autonomous-machine',
    title: 'Robotics and autonomous machine platform',
    domain: 'ROBOTICS',
    architectures: ['x86_64', 'aarch64', 'riscv64', 'custom-fpga-asic'],
    boot: ['UEFI_OR_BOARD_BOOT_CHAIN'],
    safetyClass: 'PHYSICAL_ACTUATION',
    requiredConnectors: ['sensor-iio', 'bus-gpio', 'compute-npu', 'safety-watchdog'],
    blockers: ['REAL_TIME_CONTROL', 'SAFE_STOP', 'PHYSICAL_TEST_CELL', 'HUMAN_APPROVAL_GATE'],
  },
]);

const TARGET_ARABIC_TITLES = Object.freeze({
  'pc-laptop-desktop-x86_64': 'حواسيب ولابتوبات x86_64 بنمط UEFI',
  'pc-laptop-desktop-arm64': 'حواسيب ولابتوبات ARM64',
  'smartphone-tablet-open-arm64': 'جوالات وأجهزة لوحية ARM64 بمسار إقلاع مفتوح',
  'mobile-hosted-applications': 'تطبيقات الجوال المستضافة',
  'datacenter-servers': 'خوادم مراكز البيانات',
  'hpc-supercomputer-cluster': 'عناقيد الحوسبة الضخمة والفائقة',
  'automotive-safety-controller': 'متحكم سلامة للسيارات',
  'automotive-infotainment': 'نظام معلومات وترفيه للسيارات',
  'industrial-edge-controller': 'متحكم صناعي طرفي وآلات',
  'factory-control-tower': 'برج تحكم المصنع ومحطة العمليات',
  'embedded-iot-controller': 'متحكم مضمن وإنترنت الأشياء',
  'network-appliance': 'جهاز شبكات واتصالات',
  'mainframe-enterprise-system': 'نظام مؤسسي وحاسب مركزي',
  'fpga-asic-development-board': 'لوحة FPGA أو ASIC أو شبه موصل مخصص',
  'cloud-virtual-machine-container': 'آلة افتراضية وحاوية سحابية',
  'medical-instrument': 'جهاز طبي أو حرج للحياة',
  'robotics-autonomous-machine': 'منصة روبوتات وآلات ذاتية',
});

const CONNECTOR_DEFINITIONS = Object.freeze([
  ['firmware-uefi', 'UEFI firmware ABI', 'FIRMWARE', 'firmware-uefi', 'SYSTEM_CONTROL'],
  ['firmware-acpi', 'ACPI platform discovery', 'FIRMWARE', 'firmware-acpi', 'SYSTEM_CONTROL'],
  ['firmware-device-tree', 'Device Tree discovery', 'FIRMWARE', 'firmware-device-tree', 'SYSTEM_CONTROL'],
  ['firmware-sbi', 'Supervisor binary interface', 'FIRMWARE', 'firmware-sbi', 'SYSTEM_CONTROL'],
  ['firmware-device-path', 'UEFI device path', 'FIRMWARE', 'firmware-device-path', 'OBSERVATION'],
  ['bus-pcie', 'PCI Express device bus', 'BUS', 'bus-pcie', 'SYSTEM_CONTROL'],
  ['bus-cxl', 'Coherent memory and accelerator bus', 'BUS', 'bus-coherent-memory', 'SYSTEM_CONTROL'],
  ['peripheral-usb', 'USB host and device classes', 'PERIPHERAL', 'bus-usb', 'DATA_PATH'],
  ['peripheral-usb-c', 'Reversible connector and alternate modes', 'PERIPHERAL', 'bus-usb-c', 'SYSTEM_CONTROL'],
  ['bus-i2c', 'Two-wire peripheral bus', 'BUS', 'bus-i2c', 'PHYSICAL_ACTUATION'],
  ['bus-spi', 'Synchronous serial peripheral bus', 'BUS', 'bus-spi', 'PHYSICAL_ACTUATION'],
  ['bus-uart-16550', '16550-compatible serial UART', 'BUS', 'serial-uart', 'OBSERVATION'],
  ['bus-gpio', 'General-purpose digital input and output', 'BUS', 'gpio', 'PHYSICAL_ACTUATION'],
  ['debug-jtag-swd', 'Boundary scan and hardware debug', 'DEBUG', 'hardware-debug', 'SYSTEM_CONTROL'],
  ['storage-nvme', 'PCIe nonvolatile block storage', 'STORAGE', 'storage-nvme', 'SYSTEM_CONTROL'],
  ['storage-sata', 'Serial block storage', 'STORAGE', 'storage-sata', 'SYSTEM_CONTROL'],
  ['storage-sas', 'Enterprise serial block storage', 'STORAGE', 'storage-sas', 'SYSTEM_CONTROL'],
  ['storage-sd-emmc', 'Embedded and removable flash storage', 'STORAGE', 'storage-mmc', 'SYSTEM_CONTROL'],
  ['storage-uefi-block-io', 'UEFI block I/O transport', 'STORAGE', 'storage-uefi-block', 'DATA_PATH'],
  ['storage-gpt', 'GUID partition layout', 'STORAGE', 'storage-partition', 'DATA_PATH'],
  ['storage-fat32', 'FAT32 EFI system partition', 'STORAGE', 'storage-fat', 'DATA_PATH'],
  ['storage-parallel', 'Parallel distributed storage', 'STORAGE', 'storage-parallel', 'SYSTEM_CONTROL'],
  ['storage-enterprise', 'Enterprise channel storage', 'STORAGE', 'storage-enterprise', 'SYSTEM_CONTROL'],
  ['network-ethernet', 'Wired packet network', 'NETWORK', 'network-ethernet', 'DATA_PATH'],
  ['network-wifi', 'Wireless local-area network', 'NETWORK', 'network-wifi', 'DATA_PATH'],
  ['network-bluetooth', 'Short-range personal-area radio', 'NETWORK', 'network-bluetooth', 'DATA_PATH'],
  ['network-cellular', 'Cellular radio and modem interface', 'NETWORK', 'network-cellular', 'DATA_PATH'],
  ['network-satellite', 'Satellite communications interface', 'NETWORK', 'network-satellite', 'DATA_PATH'],
  ['network-low-power', 'Low-power mesh radio', 'NETWORK', 'network-low-power', 'DATA_PATH'],
  ['automotive-can-fd', 'Automotive controller-area data bus', 'AUTOMOTIVE', 'automotive-can', 'PHYSICAL_ACTUATION'],
  ['automotive-lin', 'Low-speed automotive sensor bus', 'AUTOMOTIVE', 'automotive-lin', 'PHYSICAL_ACTUATION'],
  ['automotive-flexray', 'Deterministic automotive bus', 'AUTOMOTIVE', 'automotive-deterministic', 'PHYSICAL_ACTUATION'],
  ['automotive-ethernet', 'Automotive packet network', 'AUTOMOTIVE', 'automotive-ethernet', 'PHYSICAL_ACTUATION'],
  ['industrial-modbus', 'Industrial register transport', 'INDUSTRIAL', 'industrial-register', 'PHYSICAL_ACTUATION'],
  ['industrial-opcua', 'Industrial information model transport', 'INDUSTRIAL', 'industrial-information', 'PHYSICAL_ACTUATION'],
  ['industrial-deterministic-ethernet', 'Deterministic industrial Ethernet', 'INDUSTRIAL', 'industrial-realtime-network', 'PHYSICAL_ACTUATION'],
  ['display-uefi-gop', 'UEFI graphics output discovery', 'DISPLAY', 'display-uefi-gop', 'OBSERVATION'],
  ['display-hdmi-dp', 'Digital external display link', 'DISPLAY', 'display-digital', 'DATA_PATH'],
  ['display-mipi-dsi', 'Mobile display serial link', 'DISPLAY', 'display-mobile', 'DATA_PATH'],
  ['camera-mipi-csi', 'Camera serial sensor link', 'SENSOR', 'camera-mobile', 'DATA_PATH'],
  ['audio-hda', 'Digital host audio', 'AUDIO', 'audio-digital', 'DATA_PATH'],
  ['input-hid', 'Keyboard, pointer, touch, and control input', 'INPUT', 'input-hid', 'DATA_PATH'],
  ['sensor-iio', 'Governed sensor input', 'SENSOR', 'sensor-input', 'PHYSICAL_ACTUATION'],
  ['compute-gpu', 'Parallel graphics and compute accelerator', 'ACCELERATOR', 'accelerator-gpu', 'SYSTEM_CONTROL'],
  ['compute-npu', 'Tensor and neural processing accelerator', 'ACCELERATOR', 'accelerator-npu', 'SYSTEM_CONTROL'],
  ['compute-fpga', 'Reconfigurable logic accelerator', 'ACCELERATOR', 'accelerator-fpga', 'SYSTEM_CONTROL'],
  ['hpc-rdma', 'Remote direct memory transport', 'HPC', 'hpc-rdma', 'SYSTEM_CONTROL'],
  ['hpc-message-passing', 'Distributed message-passing transport', 'HPC', 'hpc-message', 'DATA_PATH'],
  ['memory-coherent-interconnect', 'Coherent processor-memory interconnect', 'MEMORY', 'memory-coherent', 'SYSTEM_CONTROL'],
  ['security-tpm', 'Measured-boot security processor', 'SECURITY', 'security-measured-boot', 'SYSTEM_CONTROL'],
  ['security-secure-element', 'Secure element and hardware key boundary', 'SECURITY', 'security-element', 'SYSTEM_CONTROL'],
  ['safety-watchdog', 'Independent bounded watchdog', 'SAFETY', 'safety-watchdog', 'LIFE_CRITICAL'],
  ['host-posix-api', 'Hosted POSIX runtime adapter', 'HOST_API', 'host-posix', 'DATA_PATH'],
  ['host-container-api', 'Container runtime adapter', 'HOST_API', 'host-container', 'SYSTEM_CONTROL'],
  ['host-mobile-api', 'Mobile application runtime adapter', 'HOST_API', 'host-mobile', 'DATA_PATH'],
  ['host-enterprise-api', 'Enterprise platform runtime adapter', 'HOST_API', 'host-enterprise', 'DATA_PATH'],
]);

const OPERATING_ENVIRONMENT_DEFINITIONS = Object.freeze([
  ['sheikha-bare-metal-x86_64', 'Sheikha native x86_64 UEFI seed', ['x86_64'], 'BARE_METAL'],
  ['linux-x86_64-hosted-runtime', 'Linux x86_64 hosted runtime', ['x86_64'], 'HOSTED_OS'],
  ['linux-arm64-hosted-runtime', 'Linux ARM64 hosted runtime', ['aarch64'], 'HOSTED_OS'],
  ['windows-hosted-runtime', 'Windows hosted runtime', ['x86_64', 'aarch64'], 'HOSTED_OS'],
  ['macos-hosted-runtime', 'macOS hosted runtime', ['x86_64', 'aarch64'], 'HOSTED_OS'],
  ['android-hosted-runtime', 'Android hosted runtime', ['aarch64', 'armv7-a', 'x86_64'], 'MOBILE_OS'],
  ['ios-hosted-runtime', 'iOS and iPadOS hosted runtime', ['aarch64'], 'MOBILE_OS'],
  ['web-pwa-runtime', 'Standards-based web and PWA runtime', ['ANY_WITH_BROWSER'], 'WEB'],
  ['container-cloud-runtime', 'Container and cloud runtime', ['x86_64', 'aarch64', 'ppc64le', 's390x'], 'CLOUD'],
  ['posix-rtos-runtime', 'POSIX-like real-time operating environment', ['x86_64', 'aarch64', 'armv7-a', 'riscv64'], 'RTOS'],
]);

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function sha256(filePath) {
  try {
    return require('node:crypto')
      .createHash('sha256')
      .update(fs.readFileSync(filePath))
      .digest('hex');
  } catch {
    return null;
  }
}

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function evidence(filePath, claim, verified, extra = {}) {
  return {
    path: relative(filePath),
    claim,
    exists: fs.existsSync(filePath),
    verified: Boolean(verified && fs.existsSync(filePath)),
    ...extra,
  };
}

function loadState() {
  const uefi = readJson(UEFI_REPORT_PATH, {});
  const uefiRegistry = readJson(UEFI_REGISTRY_PATH, {});
  const msi = readJson(MSI_REPORT_PATH, {});
  const desktop = readJson(DESKTOP_REPORT_PATH, {});
  const deb = readJson(DEB_REPORT_PATH, {});
  const siteSmoke = readJson(SITE_SMOKE_PATH, {});
  const driverAbiSmoke = readJson(DRIVER_ABI_SMOKE_REPORT_PATH, {});
  const serial = readText(SERIAL_PATH);
  const driverAbi = readText(DRIVER_ABI_PATH);
  const driverAbiSourceShapeVerified = [
    'SHEIKHA_DRIVER_ABI_V1',
    'SHEIKHA_DRIVER_HIGH_IMPACT_MASK',
    'sheikha_driver_request_allowed',
    'human_approval_present',
    'firmware_write_authorized',
  ].every((token) => driverAbi.includes(token));
  const driverAbiSmokeVerified =
    driverAbiSmoke.status === 'PASSED' &&
    driverAbiSmoke.marker === 'SHEIKHA_DRIVER_ABI_V1_SMOKE_OK' &&
    driverAbiSmoke.header?.sha256 === sha256(DRIVER_ABI_PATH) &&
    driverAbiSmoke.source?.sha256 === sha256(DRIVER_ABI_SMOKE_SOURCE_PATH);
  const desktopArtifactPath = desktop.artifact?.path
    ? path.join(ROOT, desktop.artifact.path)
    : null;
  const debArtifactPath = deb.artifacts?.candidate?.path || null;

  return {
    uefi,
    uefiRegistry,
    msi,
    desktop,
    deb,
    siteSmoke,
    serial,
    driverAbi,
    driverAbiSourceShapeVerified,
    driverAbiSmokeVerified,
    driverAbiVerified:
      driverAbiSourceShapeVerified && driverAbiSmokeVerified,
    uefiVerified:
      uefi.status === 'ACTIVE_WITH_VERIFIED_FOUNDATION_SUBSETS' &&
      uefi.coverage?.qemuVerifiedSubsets >= 1,
    msiQemuVerified:
      msi.qemuBootVerified === true &&
      msi.imageStructurallyVerified === true,
    serialVerified:
      serial.includes('SHEIKHA_BARE_METAL_BOOT_OK') &&
      serial.includes('SHEIKHA_UEFI_SYSTEM_TABLE_VALIDATED'),
    siteRuntimeVerified:
      siteSmoke.status === 'LOCAL_SITE_SMOKE_PASSED' &&
      siteSmoke.health?.passed === true,
    desktopHistoricalVerified:
      desktop.status === 'NATIVE_VERIFIED' &&
      desktop.nativeLaunchVerified === true,
    desktopArtifactPresent:
      Boolean(desktopArtifactPath && fs.existsSync(desktopArtifactPath)),
    debHistoricalVerified:
      deb.status === 'DEB_NATIVE_LIFECYCLE_VERIFIED' &&
      deb.nativeVerified === true,
    debArtifactPresent:
      Boolean(debArtifactPath && fs.existsSync(debArtifactPath)),
  };
}

function buildArchitectures(state) {
  return ARCHITECTURE_DEFINITIONS.map((architecture) => {
    if (architecture.id !== 'x86_64') {
      return {
        ...architecture,
        qualification: 'REGISTERED',
        status: 'REGISTERED_PORT_REQUIRED',
        currentArtifactAvailable: false,
        evidence: [],
      };
    }
    const verified = state.uefiVerified && state.msiQemuVerified;
    return {
      ...architecture,
      qualification: verified ? 'EMULATED_VERIFIED' : 'BUILD_VERIFIED',
      status: verified
        ? 'X86_64_UEFI_QEMU_BOOT_VERIFIED_PHYSICAL_PENDING'
        : 'X86_64_BUILD_EVIDENCE_PENDING',
      currentArtifactAvailable:
        fs.existsSync(EFI_ARTIFACT_PATH) && fs.existsSync(MSI_IMAGE_PATH),
      evidence: [
        evidence(UEFI_REPORT_PATH, 'UEFI x86_64 integration', state.uefiVerified),
        evidence(MSI_REPORT_PATH, 'GPT/FAT32 QEMU boot', state.msiQemuVerified),
        evidence(EFI_ARTIFACT_PATH, 'Current PE32+ x86_64 EFI artifact', true),
        evidence(MSI_IMAGE_PATH, 'Current MSI trial image', true),
      ],
    };
  });
}

function buildTargets(state) {
  return TARGET_DEFINITIONS.map((target) => {
    const x86Personal = target.id === 'pc-laptop-desktop-x86_64';
    const verified = x86Personal && state.uefiVerified && state.msiQemuVerified;
    return {
      ...target,
      titleAr: TARGET_ARABIC_TITLES[target.id],
      qualification: verified ? 'EMULATED_VERIFIED' : 'REGISTERED',
      status: verified
        ? 'EMULATED_BOOT_VERIFIED_PHYSICAL_AND_DRIVER_MATRIX_PENDING'
        : 'REGISTERED_PORT_AND_QUALIFICATION_REQUIRED',
      runnableOnPhysicalTargetToday: false,
      physicalVerifiedMachineCount: 0,
      safetyCertified: false,
      defaultAuthorization: 'DENY',
      evidence: verified
        ? [
          evidence(MSI_REPORT_PATH, 'x86_64 UEFI QEMU target evidence', true),
          evidence(HOST_PREFLIGHT_PATH, 'Current host preflight only', true, {
            scope: 'PRECHECK_NOT_PHYSICAL_BOOT',
          }),
        ]
        : [],
    };
  });
}

function connectorOverride(id, state) {
  const uefiEvidence = [
    evidence(UEFI_REPORT_PATH, 'UEFI verified subset', state.uefiVerified),
    evidence(UEFI_REGISTRY_PATH, 'UEFI capability evidence registry', state.uefiVerified),
  ];
  const overrides = {
    'firmware-uefi': {
      qualification: 'EMULATED_VERIFIED',
      status: 'EMULATED_BOOT_ABI_SUBSET_VERIFIED',
      operationalSubset: true,
      evidence: uefiEvidence,
      boundary: 'Boot-time subset only; firmware mutation remains denied.',
    },
    'firmware-device-path': {
      qualification: 'EMULATED_VERIFIED',
      status: 'EMULATED_READ_ONLY_DISCOVERY_VERIFIED',
      operationalSubset: true,
      evidence: uefiEvidence,
      boundary: 'Read-only first-node validation; no controller mutation.',
    },
    'bus-uart-16550': {
      qualification: 'EMULATED_VERIFIED',
      status: 'EMULATED_BOUNDED_OUTPUT_VERIFIED',
      operationalSubset: true,
      evidence: [
        evidence(HAL_CONTRACT_PATH, 'x86_64 UART contract', state.serialVerified),
        evidence(SERIAL_PATH, 'Native kernel serial output', state.serialVerified),
      ],
      boundary: 'COM1 output only; generic UART discovery and input are not implemented.',
    },
    'storage-uefi-block-io': {
      qualification: 'EMULATED_VERIFIED',
      status: 'FIRMWARE_BOOT_TRANSPORT_VERIFIED',
      operationalSubset: false,
      evidence: [
        evidence(MSI_REPORT_PATH, 'Firmware-loaded boot media', state.msiQemuVerified),
      ],
      boundary: 'The native kernel has no post-boot block driver and performs no writes.',
    },
    'storage-gpt': {
      qualification: 'EMULATED_VERIFIED',
      status: 'BUILD_AND_EMULATED_BOOT_VERIFIED',
      operationalSubset: true,
      evidence: [
        evidence(MSI_REPORT_PATH, 'GPT structure and QEMU boot', state.msiQemuVerified),
      ],
      boundary: 'Image-build and firmware-read path only; physical media write denied.',
    },
    'storage-fat32': {
      qualification: 'EMULATED_VERIFIED',
      status: 'BUILD_AND_EMULATED_BOOT_VERIFIED',
      operationalSubset: true,
      evidence: [
        evidence(MSI_REPORT_PATH, 'FAT32 EFI system partition', state.msiQemuVerified),
      ],
      boundary: 'Boot filesystem image only; no native filesystem driver.',
    },
    'display-uefi-gop': {
      qualification: 'EMULATED_VERIFIED',
      status: 'EMULATED_DISCOVERY_VERIFIED',
      operationalSubset: false,
      evidence: uefiEvidence,
      boundary: 'Discovery and boot-status rendering only; no native framebuffer driver.',
    },
  };
  return overrides[id] || null;
}

function buildConnectors(state) {
  return CONNECTOR_DEFINITIONS.map((definition) => {
    const [id, title, category, driverClass, safetyClass] = definition;
    const override = connectorOverride(id, state);
    return {
      id,
      title,
      category,
      driverClass,
      safetyClass,
      qualification: override?.qualification || 'REGISTERED',
      status: override?.status || 'REGISTERED_DEFAULT_DENY',
      operationalSubset: override?.operationalSubset === true,
      defaultAuthorization: 'DENY',
      highImpact:
        ['SYSTEM_CONTROL', 'PHYSICAL_ACTUATION', 'LIFE_CRITICAL']
          .includes(safetyClass),
      writeRequiresHumanApproval: true,
      evidence: override?.evidence || [],
      boundary: override?.boundary ||
        'No device access until an architecture driver, harness, and target evidence exist.',
      nextRequirements: override
        ? ['PHYSICAL_TARGET_EVIDENCE', 'RECOVERY_TEST']
        : [
          'DRIVER_IMPLEMENTATION',
          'DEVICE_HARNESS',
          'NATIVE_TARGET_EVIDENCE',
          'RECOVERY_TEST',
        ],
    };
  });
}

function buildOperatingEnvironments(state) {
  return OPERATING_ENVIRONMENT_DEFINITIONS.map((definition) => {
    const [id, title, architectures, mode] = definition;
    const base = {
      id,
      title,
      architectures,
      mode,
      qualification: 'REGISTERED',
      status: 'REGISTERED_NATIVE_RUNNER_REQUIRED',
      currentArtifactAvailable: false,
      nativeHardwareDriverSupportImplied: false,
      evidence: [],
      blockers: ['PLATFORM_ADAPTER', 'NATIVE_RUNNER', 'LIFECYCLE_TEST'],
    };

    if (id === 'sheikha-bare-metal-x86_64' &&
        state.uefiVerified && state.msiQemuVerified) {
      return {
        ...base,
        qualification: 'EMULATED_VERIFIED',
        status: 'CURRENT_EMULATED_BOOT_ARTIFACT_VERIFIED',
        currentArtifactAvailable: true,
        evidence: [
          evidence(EFI_ARTIFACT_PATH, 'Current EFI application', true),
          evidence(MSI_REPORT_PATH, 'QEMU boot lifecycle', true),
        ],
        blockers: ['PHYSICAL_MACHINE_BOOT', 'GENERAL_DEVICE_DRIVER_SET'],
      };
    }

    if (id === 'linux-x86_64-hosted-runtime') {
      const current = state.siteRuntimeVerified;
      return {
        ...base,
        qualification: current ? 'NATIVE_VERIFIED' : 'REGISTERED',
        status: current
          ? 'CURRENT_LOCAL_HOSTED_RUNTIME_VERIFIED'
          : 'LOCAL_RUNTIME_EVIDENCE_PENDING',
        currentArtifactAvailable: current,
        evidence: [
          evidence(SITE_SMOKE_PATH, 'Local Linux runtime smoke', current),
          evidence(
            DESKTOP_REPORT_PATH,
            'Historical Linux desktop native verification',
            state.desktopHistoricalVerified,
            { currentArtifactAvailable: state.desktopArtifactPresent }
          ),
          evidence(
            DEB_REPORT_PATH,
            'Historical Linux package lifecycle verification',
            state.debHistoricalVerified,
            { currentArtifactAvailable: state.debArtifactPresent }
          ),
        ],
        blockers: [
          'HISTORICAL_DESKTOP_ARTIFACT_NOT_PRESENT',
          'HISTORICAL_DEB_ARTIFACT_NOT_PRESENT',
          'PHYSICAL_DEVICE_DRIVER_SUPPORT_NOT_IMPLIED',
        ],
      };
    }

    if (id === 'web-pwa-runtime' && state.siteRuntimeVerified) {
      return {
        ...base,
        qualification: 'NATIVE_VERIFIED',
        status: 'LOCAL_BROWSER_RUNTIME_VERIFIED',
        currentArtifactAvailable: true,
        evidence: [
          evidence(SITE_SMOKE_PATH, 'Local web routes and chat smoke', true),
        ],
        blockers: ['REMOTE_BROWSER_MATRIX', 'OFFLINE_PWA_LIFECYCLE'],
      };
    }

    return base;
  });
}

function buildRoadmap() {
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_HARDWARE_PORTING_ROADMAP_V1',
    status: 'ACTIVE_GATED_ROADMAP',
    rule: 'Each phase closes only with architecture-specific artifacts and execution evidence.',
    phases: [
      {
        id: 'H0',
        title: 'Portable Driver ABI and qualification gate',
        status: 'ACTIVE_CONTRACT_VERIFIED',
        deliverables: ['DRIVER_ABI_V1', 'CAPABILITY_GATE', 'EVIDENCE_REGISTRY'],
      },
      {
        id: 'H1',
        title: 'x86_64 physical computer foundation',
        status: 'EMULATED_VERIFIED_PHYSICAL_PENDING',
        deliverables: [
          'READ_ONLY_ACPI_AND_PCI_DISCOVERY',
          'NATIVE_FRAMEBUFFER',
          'HID_INPUT',
          'READ_ONLY_NVME',
          'NAMED_MSI_PHYSICAL_BOOT',
        ],
      },
      {
        id: 'H2',
        title: 'ARM64 architecture and board support',
        status: 'REGISTERED',
        deliverables: ['AARCH64_ENTRY', 'PAGE_TABLES', 'GIC', 'UART', 'DEVICE_TREE_OR_ACPI', 'QEMU_BOOT'],
      },
      {
        id: 'H3',
        title: 'RISC-V and open board support',
        status: 'REGISTERED',
        deliverables: ['RISCV64_ENTRY', 'SBI', 'PAGE_TABLES', 'INTERRUPTS', 'DEVICE_TREE', 'QEMU_BOOT'],
      },
      {
        id: 'H4',
        title: 'General device subsystem',
        status: 'REGISTERED',
        deliverables: ['PCI_ENUMERATION', 'USB_HOST', 'BLOCK_IO', 'FILESYSTEM', 'NETWORK', 'POWER_RECOVERY'],
      },
      {
        id: 'H5',
        title: 'Hosted operating-system adapters',
        status: 'LINUX_LOCAL_VERIFIED_OTHER_RUNNERS_PENDING',
        deliverables: ['LINUX_RELEASE_REBUILD', 'WINDOWS_RUNNER', 'MACOS_RUNNER', 'ANDROID_RUNNER', 'IOS_RUNNER'],
      },
      {
        id: 'H6',
        title: 'HPC, cloud, and heterogeneous acceleration',
        status: 'REGISTERED',
        deliverables: ['RDMA', 'MESSAGE_PASSING', 'ACCELERATOR_ADAPTERS', 'SCHEDULER', 'SCALE_BENCHMARK', 'RECOVERY'],
      },
      {
        id: 'H7',
        title: 'Industrial, automotive, robotics, and medical safety',
        status: 'REGISTERED_EXTERNAL_SAFETY_CASE_REQUIRED',
        deliverables: ['REAL_TIME_PROFILE', 'FAIL_SAFE_CONTROL', 'PHYSICAL_TEST_CELL', 'INDEPENDENT_CERTIFICATION', 'SITE_ACCEPTANCE'],
      },
      {
        id: 'H8',
        title: 'Custom semiconductor and FPGA enablement',
        status: 'REGISTERED_SILICON_PROGRAM_REQUIRED',
        deliverables: ['ISA_CONTRACT', 'HDL_TOOLCHAIN', 'BSP', 'SIMULATION', 'BOARD_BRINGUP', 'SILICON_VALIDATION'],
      },
    ],
  };
}

function buildRegistry(state = loadState()) {
  const architectures = buildArchitectures(state);
  const targets = buildTargets(state);
  const connectors = buildConnectors(state);
  const operatingEnvironments = buildOperatingEnvironments(state);
  const currentVerifiedConnectors = connectors.filter(
    (item) => item.qualification === 'EMULATED_VERIFIED'
  );
  const currentNativeEnvironments = operatingEnvironments.filter(
    (item) => item.qualification === 'NATIVE_VERIFIED' &&
      item.currentArtifactAvailable
  );

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UNIVERSAL_HARDWARE_COMPATIBILITY_REGISTRY_V1',
    generatedAt: new Date().toISOString(),
    status: 'ACTIVE_PORTABILITY_AND_QUALIFICATION_FABRIC',
    scope: 'OPEN_ENDED_ARCHITECTURE_PLATFORM_CONNECTOR_AND_RUNTIME_CATALOG',
    qualificationLevels: QUALIFICATION_LEVELS,
    architectures,
    targets,
    connectors,
    operatingEnvironments,
    counts: {
      architectures: architectures.length,
      targetClasses: targets.length,
      connectors: connectors.length,
      operatingEnvironments: operatingEnvironments.length,
      emulatedVerifiedArchitectures: architectures.filter(
        (item) => item.qualification === 'EMULATED_VERIFIED'
      ).length,
      emulatedVerifiedConnectors: currentVerifiedConnectors.length,
      currentNativeVerifiedEnvironments: currentNativeEnvironments.length,
      physicalVerifiedTargets: targets.filter(
        (item) => item.qualification === 'PHYSICAL_VERIFIED'
      ).length,
      safetyCertifiedTargets: targets.filter(
        (item) => item.qualification === 'SAFETY_CERTIFIED'
      ).length,
      defaultDenyConnectors: connectors.filter(
        (item) => item.defaultAuthorization === 'DENY'
      ).length,
    },
    claimBoundary: {
      portabilityFrameworkActive: true,
      runnableEverywhereToday: false,
      universalHardwareSupportClaimed: false,
      allDriversImplementedClaimed: false,
      allOperatingSystemsNativeVerifiedClaimed: false,
      physicalHardwareVerified: false,
      automotiveSafetyCertified: false,
      industrialSafetyCertified: false,
      semiconductorValidated: false,
      openEndedHardwareUniverse: true,
      statement:
        'The registry defines one governed porting and qualification path. It does not convert untested targets into support claims.',
    },
  };
}

function buildQualificationMatrix(registry) {
  const records = [
    ...registry.architectures.map((item) => ({
      id: `architecture:${item.id}`,
      kind: 'ARCHITECTURE',
      qualification: item.qualification,
      status: item.status,
      currentArtifactAvailable: item.currentArtifactAvailable,
      evidence: item.evidence,
      blockers: item.blockers,
    })),
    ...registry.targets.map((item) => ({
      id: `target:${item.id}`,
      kind: 'TARGET',
      qualification: item.qualification,
      status: item.status,
      physicalVerifiedMachineCount: item.physicalVerifiedMachineCount,
      safetyCertified: item.safetyCertified,
      evidence: item.evidence,
      blockers: item.blockers,
    })),
    ...registry.operatingEnvironments.map((item) => ({
      id: `environment:${item.id}`,
      kind: 'OPERATING_ENVIRONMENT',
      qualification: item.qualification,
      status: item.status,
      currentArtifactAvailable: item.currentArtifactAvailable,
      evidence: item.evidence,
      blockers: item.blockers,
    })),
  ];
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_HARDWARE_QUALIFICATION_MATRIX_V1',
    generatedAt: registry.generatedAt,
    status: 'ACTIVE_EVIDENCE_GATED',
    levels: QUALIFICATION_LEVELS,
    records,
    summary: {
      total: records.length,
      registered: records.filter((item) => item.qualification === 'REGISTERED').length,
      emulatedVerified: records.filter((item) => item.qualification === 'EMULATED_VERIFIED').length,
      nativeVerified: records.filter((item) => item.qualification === 'NATIVE_VERIFIED').length,
      physicalVerified: records.filter((item) => item.qualification === 'PHYSICAL_VERIFIED').length,
      safetyCertified: records.filter((item) => item.qualification === 'SAFETY_CERTIFIED').length,
    },
  };
}

function buildGraph(registry) {
  const nodes = [
    { id: 'governance-gate', type: 'GOVERNANCE' },
    { id: 'driver-abi-v1', type: 'DRIVER_ABI' },
    { id: 'qualification-gate', type: 'QUALIFICATION' },
    ...registry.architectures.map((item) => ({ id: `arch:${item.id}`, type: 'ARCHITECTURE' })),
    ...registry.targets.map((item) => ({ id: `target:${item.id}`, type: 'TARGET' })),
    ...registry.connectors.map((item) => ({ id: `connector:${item.id}`, type: 'CONNECTOR' })),
    ...registry.operatingEnvironments.map((item) => ({ id: `environment:${item.id}`, type: 'OPERATING_ENVIRONMENT' })),
  ];
  const edges = [
    { from: 'governance-gate', to: 'driver-abi-v1', type: 'GOVERNS' },
    { from: 'driver-abi-v1', to: 'qualification-gate', type: 'REQUIRES_EVIDENCE_FROM' },
  ];
  for (const target of registry.targets) {
    for (const architecture of target.architectures) {
      edges.push({
        from: `target:${target.id}`,
        to: `arch:${architecture}`,
        type: 'TARGETS',
      });
    }
    for (const connector of target.requiredConnectors) {
      edges.push({
        from: `target:${target.id}`,
        to: `connector:${connector}`,
        type: 'REQUIRES',
      });
    }
  }
  for (const environment of registry.operatingEnvironments) {
    for (const architecture of environment.architectures) {
      if (architecture === 'ANY_WITH_BROWSER') continue;
      edges.push({
        from: `environment:${environment.id}`,
        to: `arch:${architecture}`,
        type: 'RUNS_ON_AFTER_QUALIFICATION',
      });
    }
  }
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_HARDWARE_COMPATIBILITY_GRAPH_V1',
    generatedAt: registry.generatedAt,
    status: 'ACTIVE',
    nodes,
    edges,
    counts: { nodes: nodes.length, edges: edges.length },
  };
}

function generate() {
  const state = loadState();
  const registry = buildRegistry(state);
  const matrix = buildQualificationMatrix(registry);
  const graph = buildGraph(registry);
  const roadmap = buildRoadmap();
  const contract = readJson(CONTRACT_PATH, {});
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UNIVERSAL_HARDWARE_COMPATIBILITY_FABRIC_V1',
    generatedAt: registry.generatedAt,
    status: state.driverAbiVerified && state.uefiVerified
      ? 'ACTIVE_WITH_VERIFIED_X86_64_FOUNDATION'
      : 'BLOCKED_FOUNDATION_EVIDENCE_PENDING',
    driverAbi: {
      path: relative(DRIVER_ABI_PATH),
      sourceVerified: state.driverAbiSourceShapeVerified,
      smokeVerified: state.driverAbiSmokeVerified,
      smokeEvidence: relative(DRIVER_ABI_SMOKE_REPORT_PATH),
      defaultAuthorization: contract.defaultAuthorization || 'DENY',
      unrestrictedDeviceAccess: false,
    },
    coverage: registry.counts,
    activeFoundation: {
      x86_64UefiQemuBoot: state.uefiVerified && state.msiQemuVerified,
      boundedSerialOutput: state.serialVerified,
      localHostedRuntime: state.siteRuntimeVerified,
      currentEfiArtifact: fs.existsSync(EFI_ARTIFACT_PATH),
      currentMsiImage: fs.existsSync(MSI_IMAGE_PATH),
    },
    historicalEvidence: {
      linuxDesktopNativeVerified: state.desktopHistoricalVerified,
      linuxDesktopArtifactPresentNow: state.desktopArtifactPresent,
      linuxDebLifecycleVerified: state.debHistoricalVerified,
      linuxDebArtifactPresentNow: state.debArtifactPresent,
    },
    controls: {
      defaultAuthorization: 'DENY',
      humanApprovalForHighImpact: true,
      aiMayAutonomouslyMutateFirmware: false,
      aiMayAutonomouslyControlVehiclesOrMachines: false,
      physicalMediaWriteAuthorized: false,
      externalNetworkDuringVerifiedBareMetalBoot: false,
      independentSafetyCertificationRequired: true,
    },
    claimBoundary: registry.claimBoundary,
    outputs: {
      registry: relative(REGISTRY_PATH),
      qualificationMatrix: relative(MATRIX_PATH),
      architectureGraph: relative(GRAPH_PATH),
      roadmap: relative(ROADMAP_PATH),
      contract: relative(CONTRACT_PATH),
    },
    nextExecutableGates: [
      'NAMED_MSI_PHYSICAL_BOOT_READ_ONLY',
      'X86_64_ACPI_AND_PCI_READ_ONLY_DISCOVERY',
      'NATIVE_FRAMEBUFFER_AND_HID',
      'READ_ONLY_BLOCK_DRIVER',
      'AARCH64_QEMU_BOOT_ARTIFACT',
    ],
  };

  writeJson(REGISTRY_PATH, registry);
  writeJson(MATRIX_PATH, matrix);
  writeJson(GRAPH_PATH, graph);
  writeJson(ROADMAP_PATH, roadmap);
  writeJson(REPORT_PATH, report);
  return { registry, matrix, graph, roadmap, report };
}

if (require.main === module) {
  const result = generate();
  console.log(JSON.stringify({
    system: result.report.system,
    status: result.report.status,
    coverage: result.report.coverage,
    runnableEverywhereToday:
      result.report.claimBoundary.runnableEverywhereToday,
    nextExecutableGates: result.report.nextExecutableGates,
    output: result.report.outputs,
  }, null, 2));
}

module.exports = {
  ARCHITECTURE_DEFINITIONS,
  CONNECTOR_DEFINITIONS,
  OPERATING_ENVIRONMENT_DEFINITIONS,
  QUALIFICATION_LEVELS,
  TARGET_DEFINITIONS,
  TARGET_ARABIC_TITLES,
  buildArchitectures,
  buildConnectors,
  buildGraph,
  buildOperatingEnvironments,
  buildQualificationMatrix,
  buildRegistry,
  buildRoadmap,
  generate,
  loadState,
};
