'use strict';

/**
 * طبقة الفصل والتجريد من الهاردوير — النسخة العليا
 * Sheikha Hardware Abstraction Layer (HAL) — OMEGA SUPREME
 *
 * تجريد موحد لجميع مكونات الهاردوير: كلاسيكي + كمومي + عصبي + حيوي + فضائي
 * Foundation: QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS
 */

class SheikhaHardwareAbstractionLayer {
  constructor() {
    this.hardware_devices = new Map();
    this.device_drivers = new Map();
    this.interrupts = new Map();
    this.memory_map = new Map();
    this.io_ports = new Map();
    this.initializeHAL();
  }

  initializeHAL() {
    // ── الطبقات الكلاسيكية ──
    this.registerCPUAbstraction();
    this.registerMemoryAbstraction();
    this.registerStorageAbstraction();
    this.registerIOAbstraction();
    this.registerPeripheralAbstraction();
    this.registerPowerManagementAbstraction();
    this.registerThermalAbstraction();
    // ── الطبقات المتقدمة ──
    this.registerNetworkHardware();
    this.registerGPUAcceleratorHardware();
    this.registerQuantumHardware();
    this.registerNeuromorphicHardware();
    this.registerBCIHardware();
    this.registerARVRXRHardware();
    this.registerAutomotiveHardware();
    this.registerSpaceGradeHardware();
    this.registerIndustrialHardware();
    this.registerBiometricHardware();
    this.registerSecurityHardware();
    this.registerDisplayHardware();
    this.registerAudioHardware();
    this.registerCommunicationHardware();
    this.registerMedicalHardware();
    this.registerEdgeIoTHardware();
    console.log(`✅ HAL OMEGA — ${this.hardware_devices.size} hardware abstractions registered`);
  }

  registerCPUAbstraction() {
    const cpu_hal = {
      'CPU_CONTROL': {
        operations: [
          'get_cpu_count',
          'get_core_count',
          'get_thread_count',
          'get_clock_speed',
          'get_cpu_features',
          'enable_virtualization',
          'get_cpu_temperature'
        ],
        registers: [
          'EAX', 'EBX', 'ECX', 'EDX', 'ESI', 'EDI', 'EBP', 'ESP',
          'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'
        ],
        interrupts: [
          'SYSCALL', 'SYSRET', 'INT', 'IRET',
          'CPUID', 'RDMSR', 'WRMSR'
        ]
      },
      'CACHE_CONTROL': {
        l1_cache: '32_KB_per_core',
        l2_cache: '256_KB_per_core',
        l3_cache: '2_16_MB_shared',
        operations: [
          'flush_cache',
          'invalidate_cache_line',
          'prefetch',
          'cache_barriers'
        ]
      },
      'CPU_SCALING': {
        pstate_driver: 'Intel_P_State_or_AMD_Ryzen_Master',
        frequencies: 'Adaptive_3.0_5.8_GHz',
        operations: [
          'set_frequency',
          'get_available_frequencies',
          'enable_turbo_boost',
          'enable_power_saving'
        ]
      }
    };

    Object.entries(cpu_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`CPU_${key}`, hal);
    });
  }

  registerMemoryAbstraction() {
    const memory_hal = {
      'RAM_CONTROL': {
        types: ['DDR5', 'DDR4', 'LPDDR5', 'HBM'],
        capacity: '8_GB_to_512_GB',
        speed: '4800_MHz_to_7200_MHz',
        operations: [
          'allocate_memory',
          'deallocate_memory',
          'set_page_permissions',
          'flush_tlb',
          'get_memory_info'
        ]
      },
      'VIRTUAL_MEMORY': {
        paging: 'Enabled',
        page_size: '4_KB_or_2_MB_or_1_GB',
        operations: [
          'create_virtual_address_space',
          'map_physical_to_virtual',
          'unmap_virtual_address',
          'page_fault_handling',
          'swap_memory_to_disk'
        ]
      },
      'PROTECTED_MEMORY': {
        features: [
          'DEP_Data_Execution_Prevention',
          'ASLR_Address_Space_Layout_Randomization',
          'Stack_Canaries',
          'Control_Flow_Guard_CFG',
          'Intel_MPX_Memory_Protection_Extensions'
        ]
      },
      'CACHE_COHERENCY': {
        protocol: 'MESI_MOESI_or_Dragon',
        operations: [
          'maintain_cache_coherency',
          'handle_cache_misses',
          'memory_barriers_mb_rmb_wmb'
        ]
      }
    };

    Object.entries(memory_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`MEMORY_${key}`, hal);
    });
  }

  registerStorageAbstraction() {
    const storage_hal = {
      'NVMe_SSD': {
        interface: 'PCIe_5.0_16x',
        speed: '14_GB_s',
        operations: [
          'read_sector',
          'write_sector',
          'erase_block',
          'TRIM_command',
          'format_drive'
        ],
        nvme_features: [
          'Atomic_Operations',
          'Command_Effects_Log',
          'Endurance_Groups',
          'Namespaces'
        ]
      },
      'SATA_SSD': {
        interface: 'SATA_3.0',
        speed: '550_MB_s',
        operations: [
          'read_sector',
          'write_sector',
          'erase_block'
        ]
      },
      'HDD_MECHANICAL': {
        interface: 'SATA_3.0_or_SAS',
        speed: '7200_RPM_15000_RPM',
        operations: [
          'seek_head',
          'read_sector',
          'write_sector',
          'spin_down',
          'spin_up'
        ]
      },
      'BLOCK_DEVICE_ABSTRACTION': {
        operations: [
          'open_device',
          'close_device',
          'read_blocks',
          'write_blocks',
          'get_device_info',
          'ioctl_commands'
        ]
      }
    };

    Object.entries(storage_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`STORAGE_${key}`, hal);
    });
  }

  registerIOAbstraction() {
    const io_hal = {
      'USB': {
        versions: ['USB_2.0_480_Mbps', 'USB_3.0_5_Gbps', 'USB_3.1_10_Gbps', 'USB_4_40_Gbps'],
        device_classes: [
          'Human_Interface_Device_HID',
          'Mass_Storage_Device',
          'Audio_Device',
          'Video_Device',
          'Wireless_Controller'
        ],
        operations: [
          'enumerate_devices',
          'send_command',
          'receive_data',
          'set_configuration',
          'get_descriptor'
        ]
      },
      'SERIAL_PORTS': {
        protocols: ['RS232', 'RS485'],
        operations: [
          'open_port',
          'set_baud_rate',
          'send_byte',
          'receive_byte',
          'set_parity'
        ]
      },
      'GPIO': {
        operations: [
          'set_pin_mode_input_output',
          'read_pin',
          'write_pin',
          'set_interrupt'
        ]
      },
      'I2C_SPI': {
        protocols: ['I2C_400_Kbps', 'SPI_100_MHz'],
        operations: [
          'read_register',
          'write_register',
          'burst_transfer',
          'address_device'
        ]
      }
    };

    Object.entries(io_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`IO_${key}`, hal);
    });
  }

  registerPeripheralAbstraction() {
    const peripheral_hal = {
      'DISPLAY': {
        interfaces: ['HDMI_2.1', 'DisplayPort_2.1', 'USB_C', 'Thunderbolt'],
        operations: [
          'enumerate_displays',
          'set_resolution',
          'set_refresh_rate',
          'set_color_depth',
          'enable_output'
        ]
      },
      'AUDIO': {
        codecs: ['PCM', 'AC97', 'HDA_High_Definition_Audio', 'USB_Audio'],
        operations: [
          'play_audio',
          'record_audio',
          'set_volume',
          'set_sample_rate',
          'mute_unmute'
        ]
      },
      'KEYBOARD_MOUSE': {
        protocols: ['PS2', 'USB', 'Wireless_2.4GHz', 'Bluetooth'],
        operations: [
          'read_keypress',
          'read_mouse_movement',
          'set_led_status',
          'set_polling_rate'
        ]
      },
      'NETWORK': {
        interfaces: ['Ethernet', 'Wi_Fi', 'Cellular', 'Satellite'],
        operations: [
          'send_packet',
          'receive_packet',
          'configure_interface',
          'get_interface_stats',
          'enable_offloading'
        ]
      },
      'CAMERA': {
        formats: ['USB_Video_Class_UVC', 'CSI_MIPI'],
        operations: [
          'start_capture',
          'stop_capture',
          'set_resolution',
          'set_framerate',
          'get_frame'
        ]
      }
    };

    Object.entries(peripheral_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`PERIPHERAL_${key}`, hal);
    });
  }

  registerPowerManagementAbstraction() {
    const power_hal = {
      'POWER_STATES': {
        states: [
          'S0_Working',
          'S1_Sleeping_CPU_Off',
          'S2_Deep_Sleep',
          'S3_Suspend_to_RAM',
          'S4_Suspend_to_Disk',
          'S5_Shutdown'
        ],
        operations: [
          'set_power_state',
          'wake_from_sleep',
          'hibernate',
          'resume'
        ]
      },
      'POWER_DELIVERY': {
        monitoring: [
          'Voltage_Rails_12V_5V_3.3V',
          'Current_Draw',
          'Power_Consumption_Watts',
          'Power_Supply_Status'
        ]
      },
      'BATTERY_MANAGEMENT': {
        operations: [
          'get_battery_level',
          'get_time_remaining',
          'get_charging_status',
          'enable_power_saving'
        ]
      }
    };

    Object.entries(power_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`POWER_${key}`, hal);
    });
  }

  registerThermalAbstraction() {
    const thermal_hal = {
      'THERMAL_MONITORING': {
        sensors: [
          'CPU_Sensor', 'GPU_Sensor', 'VRM_Sensor',
          'Chipset_Sensor', 'Ambient_Sensor'
        ],
        operations: [
          'read_temperature',
          'set_thermal_zone',
          'get_thermal_threshold',
          'trigger_throttling'
        ]
      },
      'FAN_CONTROL': {
        control_modes: [
          'Manual_Control',
          'Automatic_Temperature_Curve',
          'Smart_Curves'
        ],
        operations: [
          'set_fan_speed',
          'get_fan_rpm',
          'enable_auto_mode',
          'set_curve_profile'
        ]
      }
    };

    Object.entries(thermal_hal).forEach(([key, hal]) => {
      this.hardware_devices.set(`THERMAL_${key}`, hal);
    });
  }

  // ════════════════════════════════════════════════════════
  //  NEW ADVANCED HARDWARE LAYERS — طبقات الهاردوير المتقدمة
  // ════════════════════════════════════════════════════════

  registerNetworkHardware() {
    const net = {
      'NIC_STANDARD':      { speeds: ['1G','10G','25G','100G','400G'], protocols: ['Ethernet','TCP/IP','RDMA'], offload: ['TSO','GRO','RSS'] },
      'SMARTNIC_DPU':      { vendors: ['NVIDIA_BlueField3','Marvell_Octeon','Intel_IPU'], cores: 16, acceleration: ['Crypto','Compression','RegEx','AI_Inference'] },
      'INFINIBAND_HBA':    { speeds: ['NDR_400Gbps','HDR_200Gbps'], protocol: 'RDMA_over_InfiniBand', latency_ns: 600 },
      'ROCE_ADAPTER':      { version: 'RoCEv2', speeds: ['100G','400G'], latency_ns: 2000, use: 'AI_Training_Cluster' },
      'WIFI7_MODULE':      { standard: 'IEEE_802.11be', bands: ['2.4GHz','5GHz','6GHz'], max_throughput_gbps: 46, features: ['MLO','4096QAM'] },
      'CELLULAR_5G_6G':    { generations: ['5G_NR','5G_SA','6G_planned'], speeds: ['5G_10Gbps','6G_1Tbps'], latency_ms: [1, 0.1] },
      'SATELLITE_MODEM':   { constellations: ['Starlink','OneWeb','Amazon_Kuiper'], speeds_mbps: [200, 1000], latency_ms: [20, 600] },
    };
    Object.entries(net).forEach(([k,v]) => this.hardware_devices.set(`NETWORK_${k}`, v));
  }

  registerGPUAcceleratorHardware() {
    const gpu = {
      'NVIDIA_H200_SXM':    { vram_hbm3e_tb: 1.1, bandwidth_tbps: 3.35, tflops_fp8: 3958, nvlink: '900Gbps', use: 'LLM_Training' },
      'NVIDIA_GB200_NVL72': { gpus: 36, grace_cpus: 36, nvlink_bandwidth_tbps: 130, total_hbm3e_tb: 13.5, use: 'Mega_Cluster' },
      'AMD_MI325X':         { vram_hbm3_gb: 288, bandwidth_tbps: 5.3, tflops_fp8: 2600, infinity_fabric: true },
      'GOOGLE_TPU_V5P':     { tflops_bf16: 459, hbm_gb: 95, ici_bandwidth_gbps: 4800, use: 'Google_Gemini_Training' },
      'GROQ_LPU_GEN2':      { tokens_per_sec: 1000000, architecture: 'Tensor_Streaming_Processor', latency_first_token_ms: 1 },
      'INTEL_GAUDI3':       { tflops_bf16: 1835, hbm_gb: 128, built_in_rdma: true, ports_400g: 24 },
      'CEREBRAS_CS3':       { wafer_scale: true, cores: 900000, weight_gb: 44, architecture: 'WSE3_Wafer_Scale_Engine' },
      'TENSTORRENT_N300':   { architecture: 'Wormhole', cores: 80, pcie5: true, use: 'Inference_Edge' },
    };
    Object.entries(gpu).forEach(([k,v]) => this.hardware_devices.set(`GPU_ACCEL_${k}`, v));
  }

  registerQuantumHardware() {
    const qhw = {
      'QPU_SUPERCONDUCTING': { vendors: ['IBM_Heron','Google_Sycamore2','Rigetti'], qubits: [133, 1000, 79], coherence_time_ms: 0.5, gate_fidelity: 0.9995 },
      'QPU_ION_TRAP':        { vendors: ['IonQ_Forte','Quantinuum_H2'], qubits: [36, 56], coherence_time_s: 600, gate_fidelity: 0.9999 },
      'QPU_PHOTONIC':        { vendors: ['PsiQuantum','QuiX_Quantum'], qubits: '1M_planned', architecture: 'Photonic_chip', temperature_K: 'Room_Temp' },
      'QUANTUM_MEMORY':      { type: 'Rare_Earth_Crystal', storage_time_s: 3600, fidelity: 0.999 },
      'QUANTUM_SENSOR':      { types: ['Gravimeter','Magnetometer','Atomic_Clock'], precision: 'sub_femtotesla' },
      'QUANTUM_REPEATER':    { use: 'Quantum_Network', range_km: 600, entanglement_rate_pairs_s: 1000 },
      'QUANTUM_RNG':         { type: 'QRNG_Photon_Based', throughput_gbps: 16, nist_certified: true },
    };
    Object.entries(qhw).forEach(([k,v]) => this.hardware_devices.set(`QUANTUM_${k}`, v));
  }

  registerNeuromorphicHardware() {
    const neuro = {
      'INTEL_LOIHI3':      { neurons: 1000000, synapses: 120000000, power_mw: 100, learning: 'on_chip_STDP', architecture: 'Neuromorphic_Mesh' },
      'IBM_TRUENORTH2':    { neurons: 4096000, cores: 4096, power_mw: 70, use: 'Pattern_Recognition_Ultra_Low_Power' },
      'BRAINSCA_LES2':     { neurons: 512000, physical_model: 'Analog_VLSI', use: 'Neuroscience_Emulation' },
      'AKIDA_2':           { vendor: 'BrainChip', architecture: 'Temporal_Event_based', edge_ai: true, power_mw: 25 },
      'SNN_ACCELERATOR':   { architecture: 'Spiking_Neural_Network', events_per_sec: 1000000000, energy_per_spike_pj: 10 },
    };
    Object.entries(neuro).forEach(([k,v]) => this.hardware_devices.set(`NEUROMORPHIC_${k}`, v));
  }

  registerBCIHardware() {
    const bci = {
      'EEG_HEADSET':        { channels: 256, sample_rate_khz: 10, wireless: true, resolution_bit: 24, use: 'Brain_Computer_Interface' },
      'ECOG_IMPLANT':       { electrodes: 4096, bandwidth_khz: 30, wireless_protocol: 'Near_Field', use: 'Medical_BCI_Epilepsy' },
      'NEURALINK_N2_STYLE': { electrodes: 4096, threads: 1024, wireless: true, bandwidth_mbps: 1, use: 'Cortical_Interface' },
      'EMG_SENSOR':         { channels: 32, sample_rate_khz: 20, use: 'Prosthetics_HCI' },
      'FMRI_INTERFACE':     { resolution_mm: 0.5, temporal_resolution_ms: 100, use: 'Brain_Imaging_AI' },
    };
    Object.entries(bci).forEach(([k,v]) => this.hardware_devices.set(`BCI_${k}`, v));
  }

  registerARVRXRHardware() {
    const xr = {
      'VR_HEADSET_PRO':   { resolution_ppd: 70, refresh_hz: 120, tracking: '6DoF_Inside_Out', compute: 'Standalone_ARM_GPU', use: 'Immersive_VR' },
      'AR_GLASSES':       { display: 'Waveguide_MicroLED', fov_deg: 70, compute: 'Qualcomm_AR2', use: 'Spatial_Computing' },
      'HOLOGRAPHIC_DISP': { technology: 'LCoS_Hologram', resolution: '8K_per_eye', depth_planes: 64, use: 'Medical_Engineering_Viz' },
      'HAPTIC_SUIT':      { actuators: 2000, precision_mm: 1, use: 'Full_Body_Haptic_Feedback' },
      'EYE_TRACKER':      { gaze_accuracy_deg: 0.5, sample_rate_hz: 200, pupil_dilation: true },
      'SPATIAL_AUDIO':    { channels: 64, head_tracking: true, ambisonics: 'Higher_Order', use: 'Immersive_3D_Sound' },
    };
    Object.entries(xr).forEach(([k,v]) => this.hardware_devices.set(`XR_${k}`, v));
  }

  registerAutomotiveHardware() {
    const auto = {
      'LIDAR_SOLID_STATE': { range_m: 300, resolution_pts_s: 1200000, wavelength_nm: 905, channels: 128, use: 'Autonomous_Driving_L4' },
      'RADAR_4D':          { range_m: 250, resolution_cm: 4, doppler: true, frequency_ghz: 77, use: 'All_Weather_Detection' },
      'CAMERA_ARRAY_HDR':  { cameras: 12, resolution_mp: 8, hdr_stops: 120, night_vision: true },
      'V2X_MODULE':        { protocols: ['DSRC_802.11p','C_V2X_5G'], range_m: 1000, latency_ms: 2 },
      'CAN_FD_GATEWAY':    { protocol: 'CAN_FD_5Mbps', nodes: 200, use: 'Vehicle_Internal_Network' },
      'AUTOMOTIVE_ECU':    { arch: 'AUTOSAR_Classic_Adaptive', safety: 'ASIL_D', rtos: 'QNX_INTEGRITY' },
    };
    Object.entries(auto).forEach(([k,v]) => this.hardware_devices.set(`AUTO_${k}`, v));
  }

  registerSpaceGradeHardware() {
    const space = {
      'RAD_HARD_CPU':       { vendor: 'Cobham_Gaisler', model: 'LEON5_SPARC_V8', rad_tolerance_krad: 1000, use: 'Satellite_Spacecraft' },
      'RAD_HARD_FPGA':      { vendor: 'Microchip', model: 'RTG4', tolerance: 'SEL_immune', use: 'Deep_Space' },
      'STAR_TRACKER':       { accuracy_arcsec: 2, update_rate_hz: 4, use: 'Spacecraft_Attitude_Determination' },
      'DEEP_SPACE_COMM':    { protocol: 'CCSDS_Space_Data_Link', bands: ['X','Ka','Optical'], use: 'Interplanetary_Communication' },
      'POWER_MEO_GEO':      { solar_cells: 'Triple_Junction_30pct', battery: 'Li_Ion_Space_Grade', use: 'Satellite_Power' },
      'SPACE_AI_UNIT':      { processor: 'Radiation_Hardened_AI', tflops: 10, power_w: 20, use: 'On_Board_Autonomous_AI' },
    };
    Object.entries(space).forEach(([k,v]) => this.hardware_devices.set(`SPACE_${k}`, v));
  }

  registerIndustrialHardware() {
    const ind = {
      'PLC_IEC61131':   { standards: ['IEC_61131-3'], protocols: ['Profibus','Profinet','EtherNet/IP','OPC_UA'], use: 'Factory_Automation' },
      'SCADA_RTU':      { protocol: 'DNP3_Modbus_IEC104', wireless: 'WirelessHART', use: 'Industrial_Control_SCADA' },
      'ROBOT_CONTROLLER': { dof: 7, control_hz: 1000, protocols: ['ROS2','OPC_UA','EtherCAT'], safety: 'ISO_10218' },
      'INDUSTRIAL_EDGE': { cpu: 'Atom_Xeon', realtime_os: 'VxWorks_ROS2', io: ['Digital','Analog','Serial','Industrial_Eth'] },
      'VISION_SYSTEM':  { cameras: 4, fps: 1000, ai_inference: 'Edge_TPU', use: 'Quality_Inspection' },
    };
    Object.entries(ind).forEach(([k,v]) => this.hardware_devices.set(`INDUSTRIAL_${k}`, v));
  }

  registerBiometricHardware() {
    const bio = {
      'FINGERPRINT_ULTRASONIC': { vendor: 'Qualcomm_3D_Sonic', false_accept_rate: '1_in_50000', use: 'Authentication' },
      'IRIS_SCANNER':            { wavelength: 'NIR_850nm', resolution_megapixel: 3, fal: '1_in_1200000' },
      'FACE_3D_DEPTH':           { depth_sensor: 'Structured_Light_ToF', ir_projector: true, spoof_resistant: true },
      'VEIN_RECOGNITION':        { modality: 'Near_Infrared_Palm_Vein', unique_patterns: '5_million_per_person' },
      'VOICE_BIOMETRIC':         { neural_model: 'Speaker_Verification_Transformer', far: '0.01pct' },
      'GAIT_RECOGNITION':        { sensors: ['IMU','Camera','Pressure_Mat'], accuracy_pct: 98 },
    };
    Object.entries(bio).forEach(([k,v]) => this.hardware_devices.set(`BIOMETRIC_${k}`, v));
  }

  registerSecurityHardware() {
    const sec = {
      'HSM_LUNA':      { vendor: 'Thales_Luna_Network_HSM', fips: '140-3_Level_3', operations_per_sec: 20000, use: 'Key_Management_PKI' },
      'TPM_20':        { standard: 'TCG_TPM_2.0', algorithms: ['RSA','ECC','AES','SHA'], use: 'Platform_Integrity' },
      'FTPM_QUALCOMM': { integrated: 'SoC_Secure_Enclave', use: 'Mobile_IoT_Trust_Anchor' },
      'SMARTCARD_HSM': { standard: 'ISO_7816', crypto: ['RSA4096','ECC_P521'], use: 'PKI_Authentication' },
      'SECURE_ENCLAVE': { technology: 'ARM_TrustZone_Intel_TDX_AMD_SEV', memory_encryption: true },
      'POST_QUANTUM_HSM': { algorithms: ['Kyber','Dilithium','SPHINCS+'], nist_approved: true, use: 'Future_Proof_Key_Mgmt' },
    };
    Object.entries(sec).forEach(([k,v]) => this.hardware_devices.set(`SECURITY_${k}`, v));
  }

  registerDisplayHardware() {
    const disp = {
      'OLED_8K_PRO':        { resolution: '7680x4320', refresh_hz: 240, hdr: 'HDR10+_Dolby_Vision', contrast: '1M:1', use: 'Pro_Display' },
      'MICROLED_WALL':      { pixel_pitch_mm: 0.4, brightness_nits: 5000, modular: true, use: 'Broadcast_Command_Center' },
      'QLED_MINI_LED':      { backlight_zones: 4096, peak_brightness: 4000, gamut_pct_adobe_rgb: 140 },
      'HOLOGRAPHIC_3D':     { technology: 'Light_Field_Display', viewing_angle_deg: 180, depth_planes: 'Continuous' },
      'E_INK_COLOR':        { resolution_dpi: 300, colors: '50000', power: 'Ultra_Low_Bistable', use: 'E_Paper_Signage' },
      'TRANSPARENT_OLED':   { transparency_pct: 45, use: 'AR_Overlay_Window' },
    };
    Object.entries(disp).forEach(([k,v]) => this.hardware_devices.set(`DISPLAY_${k}`, v));
  }

  registerAudioHardware() {
    const audio = {
      'PROFESSIONAL_ADC':  { bit_depth: 32, sample_rate_khz: 384, dynamic_range_db: 140, inputs: 128, standard: 'AES67_Dante' },
      'SPATIAL_PROCESSOR': { architecture: 'Dolby_Atmos_DTS_X_Auro_3D', object_audio: true, channels: '9.1.6', use: 'Cinema_Studio' },
      'NOISE_CANCELLATION': { type: 'Hybrid_ANC_AI', reduction_db: 40, latency_ms: 0.5, ai_powered: true },
      'VOICE_AI_CHIP':     { vendor: 'Syntiant_NDP', wake_word_accuracy_pct: 99.5, power_mw: 0.5, use: 'Always_On_Voice' },
      'ULTRASOUND_ARRAY':  { transducers: 1024, frequency_mhz: 15, use: 'Medical_Imaging_Haptics' },
    };
    Object.entries(audio).forEach(([k,v]) => this.hardware_devices.set(`AUDIO_${k}`, v));
  }

  registerCommunicationHardware() {
    const comm = {
      'WIFI7_AP':           { standard: '802.11be', bands: 3, throughput_gbps: 46, features: ['MLO','4K_QAM','320MHz'] },
      'BLUETOOTH6':         { version: '6.0', throughput_mbps: 48, range_m: 400, features: ['Channel_Sounding','UWB_Coexist'] },
      'UWB_MODULE':         { standard: 'IEEE_802.15.4z', accuracy_cm: 10, use: 'Indoor_Positioning_Secure_Access' },
      'ZIGBEE_THREAD_CHIP': { standards: ['Zigbee_3.0','Thread_1.3','Matter'], power: 'Ultra_Low', mesh_nodes: 65000 },
      'LORA_MODULE':        { standard: 'LoRaWAN_1.1', range_km: 15, power_mw: 10, use: 'IoT_Smart_City' },
      'FIBER_OPTICAL':      { speeds: ['100G','400G','800G','1.6T'], modulation: 'DP_64QAM', use: 'Data_Center_Backbone' },
      'SATELLITE_LINK':     { constellations: ['Starlink_V2','OneWeb_Gen2'], throughput_gbps: 40, use: 'Anywhere_Connectivity' },
    };
    Object.entries(comm).forEach(([k,v]) => this.hardware_devices.set(`COMM_${k}`, v));
  }

  registerMedicalHardware() {
    const med = {
      'MRI_INTERFACE':      { field_tesla: 7, resolution_mm: 0.1, ai_reconstruction: true, use: 'Medical_Imaging' },
      'CT_SCANNER':         { slices: 640, rotation_time_s: 0.2, dose_reduction_pct: 80, ai_recon: 'Deep_Learning' },
      'WEARABLE_ECG':       { leads: 12, sample_rate_khz: 1, arrhythmia_ai: true, continuous: true },
      'CONTINUOUS_GLUCOSE': { method: 'Optical_NIRS', accuracy_pct: 99.5, no_calibration: true },
      'PATIENT_MONITOR':    { vitals: ['ECG','SpO2','BP','Temp','RR','EEG'], ai_alert: true, connectivity: 'HL7_FHIR' },
      'SURGICAL_ROBOT_IF':  { dof: 7, tremor_filter: true, haptic_feedback: true, precision_mm: 0.1 },
    };
    Object.entries(med).forEach(([k,v]) => this.hardware_devices.set(`MEDICAL_${k}`, v));
  }

  registerEdgeIoTHardware() {
    const iot = {
      'RASPBERRY_PI5_HAL':  { cpu: 'ARM_Cortex_A76', ram_gb: 8, ai_hat: 'NPU_13TOPS', gpio: 40, use: 'Edge_AI_Prototype' },
      'NVIDIA_JETSON_ORIN': { tflops_ai: 275, cpu_cores: 12, ram_gb: 64, use: 'Autonomous_Robots_Edge_AI' },
      'CORAL_TPU_EDGE':     { tops: 4, power_mw: 2000, use: 'Ultra_Low_Power_AI_Inference' },
      'MICROCONTROLLER_AI': { family: 'STM32_Arduino_ESP32', flash_mb: 8, ram_kb: 512, ai_framework: 'TFLite_Micro' },
      'SMART_SENSOR_FUSION': { sensors: ['IMU','Barometer','Magnetometer','Gas','UV','Light'], ai_on_chip: true },
      'FOG_NODE':           { cpu_cores: 32, ram_gb: 256, storage_nvme_tb: 4, protocols: ['MQTT','CoAP','OPC_UA'] },
    };
    Object.entries(iot).forEach(([k,v]) => this.hardware_devices.set(`EDGE_IOT_${k}`, v));
  }

  getStatus() {
    return {
      system: 'SHEIKHA_HARDWARE_ABSTRACTION_LAYER',
      tier: 'OMEGA_SUPREME',
      foundation: 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS',
      status: 'ACTIVE',
      hardware_categories: this.hardware_devices.size,
      abstraction_layers: [
        'CPU_Virtualization', 'Memory_Management', 'Storage_Abstraction',
        'IO_Abstraction', 'Peripheral_Abstraction', 'Power_Management',
        'Thermal_Management', 'Network_Hardware', 'GPU_AI_Accelerators',
        'Quantum_Hardware', 'Neuromorphic_Hardware', 'BCI_Hardware',
        'AR_VR_XR_Hardware', 'Automotive_Hardware', 'Space_Hardware',
        'Industrial_Hardware', 'Biometric_Hardware', 'Security_Hardware',
        'Display_Hardware', 'Audio_Hardware', 'Communication_Hardware',
        'Medical_Hardware', 'Edge_IoT_Hardware'
      ],
      timestamp: new Date().toISOString()
    };
  }

  getAllHardwareDevices() {
    const devices = [];
    this.hardware_devices.forEach((device, key) => {
      devices.push({ device_key: key, ...device });
    });
    return devices;
  }

  getDeviceCategory(category) {
    const filtered = [];
    this.hardware_devices.forEach((device, key) => {
      if (key.startsWith(category)) {
        filtered.push({ device_key: key, ...device });
      }
    });
    return filtered;
  }
}

const sheikhaHAL = new SheikhaHardwareAbstractionLayer();

module.exports = {
  SheikhaHardwareAbstractionLayer,
  sheikhaHAL,
  getStatus: () => sheikhaHAL.getStatus(),
  getAllHardwareDevices: () => sheikhaHAL.getAllHardwareDevices(),
  getDeviceCategory: (category) => sheikhaHAL.getDeviceCategory(category)
};
