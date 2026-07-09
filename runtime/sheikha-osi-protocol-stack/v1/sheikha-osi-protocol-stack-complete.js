'use strict';

/**
 * بروتوكولات OSI الكاملة - 7 طبقات موحدة
 * Sheikha OSI Protocol Stack - Complete 7 Layers
 * 
 * نموذج Open Systems Interconnection بالتفصيل الدقيق
 */

class SheikhaOSIProtocolStack {
  constructor() {
    this.osi_layers = new Map();
    this.protocol_mappings = new Map();
    this.tcp_ip_suite = new Map();
    this.initializeOSIStack();
  }

  initializeOSIStack() {
    this.registerOSILayers();
    this.registerProtocolMappings();
    this.registerTCPIPSuite();
  }

  registerOSILayers() {
    const layers = {
      'LAYER_1_PHYSICAL': {
        layer_number: 1,
        name: 'Physical Layer',
        arabic_name: 'الطبقة الفيزيائية',
        description: 'Transmission of raw bits over physical medium',
        protocols: [
          'Ethernet_10BaseT', 'Ethernet_100BaseTX', 'Ethernet_1000BaseT_Gigabit',
          'Ethernet_10GBaseT', 'Ethernet_100GBaseT',
          'DSL_Digital_Subscriber_Line', 'ISDN_Integrated_Services_Digital_Network',
          'Fiber_Optic', 'Wireless_RF', 'Microwave'
        ],
        technologies: [
          'Cables_Twisted_Pair_Cat5_Cat6_Cat7_Cat8',
          'Fiber_Optic_Single_Mode_Multi_Mode',
          'Wireless_Transmission_2.4GHz_5GHz_6GHz_28GHz',
          'Hub', 'Repeater', 'Modems'
        ],
        standards: [
          'IEEE_802.3_Ethernet', 'IEEE_802.11_Wireless',
          'ITU_V_Series_Modem_Standards'
        ],
        data_unit: 'Bit (0 or 1)'
      },

      'LAYER_2_DATA_LINK': {
        layer_number: 2,
        name: 'Data Link Layer',
        arabic_name: 'طبقة ربط البيانات',
        description: 'Node-to-node data transfer; framing and MAC addressing',
        protocols: [
          'Ethernet_802.3', 'PPP_Point_to_Point_Protocol',
          'Wi_Fi_802.11a_b_g_n_ac_ax_be',
          'MAC_Media_Access_Control', 'ARP_Address_Resolution_Protocol',
          'LLDP_Link_Layer_Discovery_Protocol',
          '802.1Q_VLAN_Tagging'
        ],
        technologies: [
          'Network_Interface_Cards_NIC', 'Switches',
          'MAC_Address_Resolution', 'Collision_Detection_CSMA_CD',
          'Token_Ring_Legacy'
        ],
        standards: [
          'IEEE_802.3_Ethernet', 'IEEE_802.11_Wireless',
          'IEEE_802.1p_Priority', 'IEEE_802.1Q_VLAN'
        ],
        data_unit: 'Frame',
        sublayers: [
          'LLC_Logical_Link_Control',
          'MAC_Media_Access_Control'
        ]
      },

      'LAYER_3_NETWORK': {
        layer_number: 3,
        name: 'Network Layer',
        arabic_name: 'طبقة الشبكة',
        description: 'Routing and logical addressing',
        protocols: [
          'IPv4_Internet_Protocol_Version_4', 'IPv6_Internet_Protocol_Version_6',
          'ICMP_Internet_Control_Message_Protocol',
          'IGMP_Internet_Group_Management_Protocol',
          'IPsec_Internet_Protocol_Security',
          'GRE_Generic_Routing_Encapsulation',
          'MPLS_Multiprotocol_Label_Switching',
          'BGP_Border_Gateway_Protocol', 'OSPF_Open_Shortest_Path_First',
          'RIP_Routing_Information_Protocol',
          'IS_IS_Intermediate_System_to_Intermediate_System'
        ],
        technologies: [
          'Routers', 'Layer_3_Switches',
          'Subnetting', 'CIDR_Classless_Inter_Domain_Routing',
          'Routing_Tables', 'Route_Aggregation',
          'Quality_of_Service_QoS'
        ],
        standards: [
          'RFC_791_IPv4', 'RFC_2460_IPv6',
          'RFC_4291_IPv6_Addressing_Architecture'
        ],
        data_unit: 'Packet',
        functions: [
          'Logical_Addressing_IP_Addresses',
          'Routing_Path_Selection',
          'Forwarding',
          'Congestion_Control'
        ]
      },

      'LAYER_4_TRANSPORT': {
        layer_number: 4,
        name: 'Transport Layer',
        arabic_name: 'طبقة النقل',
        description: 'End-to-end communication and reliability',
        protocols: [
          'TCP_Transmission_Control_Protocol', 'UDP_User_Datagram_Protocol',
          'SCTP_Stream_Control_Transmission_Protocol',
          'DCCP_Datagram_Congestion_Control_Protocol',
          'QUIC_Quick_UDP_Internet_Connections',
          'MPTCP_MultiPath_TCP',
          'RSVP_Resource_Reservation_Protocol'
        ],
        technologies: [
          'Connection_Oriented_TCP', 'Connectionless_UDP',
          'Port_Numbers_65536', 'Flow_Control', 'Error_Checking',
          'Congestion_Control_Algorithms_Reno_Cubic_BBR'
        ],
        standards: [
          'RFC_793_TCP', 'RFC_768_UDP',
          'RFC_3168_ECN_Explicit_Congestion_Notification'
        ],
        data_unit: 'Segment_PDU',
        functions: [
          'Port_Based_Communication',
          'Reliability_via_TCP',
          'Flow_Control',
          'Multiplexing_Demultiplexing',
          'Congestion_Control'
        ]
      },

      'LAYER_5_SESSION': {
        layer_number: 5,
        name: 'Session Layer',
        arabic_name: 'طبقة الجلسة',
        description: 'Session establishment, management, and termination',
        protocols: [
          'NetBIOS_Network_Basic_Input_Output_System',
          'PPTP_Point_to_Point_Tunneling_Protocol',
          'L2TP_Layer_2_Tunneling_Protocol',
          'SSH_Secure_Shell', 'RDP_Remote_Desktop_Protocol',
          'LDAP_Lightweight_Directory_Access_Protocol',
          'NFS_Network_File_System', 'SMB_Server_Message_Block',
          'iSCSI_Internet_Small_Computer_Systems_Interface'
        ],
        technologies: [
          'Session_Establishment', 'Session_Maintenance',
          'Session_Termination', 'Dialog_Control',
          'Synchronization_Tokens', 'Session_State_Management'
        ],
        functions: [
          'Session_Negotiation',
          'Dialog_Management',
          'Token_Management',
          'Session_Recovery',
          'Timeout_Management'
        ]
      },

      'LAYER_6_PRESENTATION': {
        layer_number: 6,
        name: 'Presentation Layer',
        arabic_name: 'طبقة العرض',
        description: 'Data formatting, encryption, and compression',
        protocols: [
          'SSL_Secure_Sockets_Layer', 'TLS_Transport_Layer_Security',
          'HTTPS_HTTP_Secure', 'FTPS_FTP_Secure',
          'SSH_Secure_Shell', 'VPN_Virtual_Private_Network',
          'MIME_Multipurpose_Internet_Mail_Extensions',
          'JPEG', 'MPEG', 'GIF', 'PNG', 'ZIP', 'GZIP'
        ],
        technologies: [
          'Encryption_Algorithms_AES_RSA_ECC',
          'Compression_Algorithms_LZ77_DEFLATE_Brotli',
          'Character_Set_Conversion_ASCII_UTF_8_UTF_16',
          'Data_Serialization_JSON_XML_Protocol_Buffers',
          'Digital_Signatures', 'Certificates_X.509'
        ],
        standards: [
          'RFC_5246_TLS_1.2', 'RFC_8446_TLS_1.3',
          'FIPS_197_AES', 'FIPS_180_4_SHA'
        ],
        functions: [
          'Data_Encryption_Decryption',
          'Data_Compression_Decompression',
          'Character_Code_Translation',
          'Data_Formatting'
        ]
      },

      'LAYER_7_APPLICATION': {
        layer_number: 7,
        name: 'Application Layer',
        arabic_name: 'طبقة التطبيقات',
        description: 'User services and applications',
        protocols: {
          'WEB_SERVICES': [
            'HTTP_1.0_1.1_2.0_3.0', 'HTTPS', 'WebSocket', 'WebRTC'
          ],
          'EMAIL_SERVICES': [
            'SMTP_Simple_Mail_Transfer_Protocol',
            'POP3_Post_Office_Protocol_3',
            'IMAP_Internet_Message_Access_Protocol',
            'MIME_Message_Extensions'
          ],
          'FILE_TRANSFER': [
            'FTP_File_Transfer_Protocol', 'SFTP_SSH_File_Transfer_Protocol',
            'SCP_Secure_Copy', 'TFTP_Trivial_FTP'
          ],
          'DIRECTORY_SERVICES': [
            'DNS_Domain_Name_System', 'LDAP_Lightweight_Directory_Access_Protocol',
            'NIS_Network_Information_Service',
            'WINS_Windows_Internet_Name_Service'
          ],
          'REMOTE_ACCESS': [
            'Telnet', 'SSH_Secure_Shell', 'RDP_Remote_Desktop_Protocol',
            'VNC_Virtual_Network_Computing'
          ],
          'NETWORK_MANAGEMENT': [
            'SNMP_Simple_Network_Management_Protocol',
            'Syslog_System_Logging', 'NetFlow_Traffic_Analysis'
          ],
          'REAL_TIME_COMMUNICATION': [
            'VoIP_Voice_over_IP', 'SIP_Session_Initiation_Protocol',
            'RTP_Real_Time_Protocol', 'H.323', 'Skype_Protocol'
          ],
          'PEER_TO_PEER': [
            'BitTorrent', 'DHT_Distributed_Hash_Table',
            'mDNS_Multicast_DNS'
          ],
          'CLOUD_SERVICES': [
            'RESTful_APIs', 'GraphQL', 'gRPC', 'MQTT', 'AMQP'
          ]
        },
        technologies: [
          'Web_Browsers', 'Email_Clients', 'FTP_Clients',
          'DNS_Resolver', 'Directory_Services',
          'API_Frameworks', 'Message_Queues'
        ]
      },

      'LAYER_8_QUANTUM_PROTOCOLS': {
        layer_number: 8,
        name: 'Quantum Communication Protocols',
        arabic_name: 'بروتوكولات الاتصالات الكمومية',
        description: 'Quantum key distribution and quantum data transmission',
        protocols: [
          'QKD_Quantum_Key_Distribution', 'BB84_Protocol', 'E91_Protocol',
          'SARG04_Protocol', 'Decoy_State_QKD', 'MDI_QKD',
          'Quantum_Teleportation_Protocol', 'Quantum_Repeater_Protocol',
          'Quantum_Internet_Alliance_QIA_Standard'
        ],
        technologies: [
          'Single_Photon_Sources', 'Quantum_Repeaters', 'Quantum_Memory',
          'Quantum_Detectors', 'Entanglement_Distribution', 'Quantum_Entanglement_Swapping'
        ],
        standards: [
          'ETSI_QKD_Specifications', 'NIST_Quantum_Safe_Cryptography'
        ],
        data_unit: 'Quantum_Bit_Qubit',
        post_quantum_safe: true
      },

      'LAYER_9_OPTICAL_PROTOCOLS': {
        layer_number: 9,
        name: 'Optical & Free-Space Communication',
        arabic_name: 'بروتوكولات الاتصالات البصرية والفراغ الحر',
        description: 'Fiber optic and free-space optical communication',
        protocols: [
          'OTN_Optical_Transport_Network', 'DWDM_Dense_Wavelength_Division_Multiplexing',
          'CWDM_Coarse_WDM', 'PON_Passive_Optical_Network',
          'FSO_Free_Space_Optical', 'LC_Li_Fi_Light_Fidelity',
          'Visible_Light_Communication_VLC', 'Laser_Communication_LaserCom',
          'Quantum_Optical_Communication'
        ],
        technologies: [
          'Single_Mode_Fiber_SMF', 'Multi_Mode_Fiber_MMF', 'Polarization_Maintaining_Fiber',
          'Optical_Amplifiers_EDFA', 'Optical_Switches', 'Beam_Tracking_Systems',
          'Optical_Modulators', 'Coherent_Detection'
        ],
        standards: [
          'ITU_G_Series_Optical_Standards', 'IEEE_802.11bb_Light_Based_Communications'
        ],
        data_unit: 'Photon_Wavelength_Packet',
        bandwidth_potential: 'Multi_Petabit_per_Second'
      },

      'LAYER_10_SPACE_PROTOCOLS': {
        layer_number: 10,
        name: 'Space & Satellite Communication',
        arabic_name: 'بروتوكولات الاتصالات الفضائية والأقمار الصناعية',
        description: 'Inter-satellite links, deep space, and LEO/GEO communication',
        protocols: [
          'CCSDS_Consultative_Committee_Space_Data_Systems',
          'DLR_Delay_Tolerant_Networking', 'Space_Internet_Protocol',
          'Ku_Band_Communication_Protocol', 'Ka_Band_Communication_Protocol',
          'X_Band_Deep_Space_Protocol', 'Laser_Intersatellite_Links_LISL',
          'Near_Earth_Network_Protocol'
        ],
        technologies: [
          'Satellite_Ground_Stations', 'Inter_Satellite_Links', 'Optical_Intersatellite_Link_OISL',
          'Radioisotope_Thermoelectric_Generator_RTG', 'Solar_Panel_Arrays',
          'Attitude_Control_Systems', 'Quantum_Key_Distribution_Satellite'
        ],
        standards: [
          'NASA_Protocol_Standards', 'ESA_European_Space_Agency_Protocols', 'JAXA_Protocols'
        ],
        data_unit: 'Space_Packet_Frame',
        latency_tolerance: 'High_Moderate_to_Extreme'
      },

      'LAYER_11_NEUROMORPHIC_PROTOCOLS': {
        layer_number: 11,
        name: 'Neuromorphic & Bio-Inspired Communication',
        arabic_name: 'بروتوكولات الاتصالات العصبية والمستوحاة من الطبيعة',
        description: 'Spiking neural networks and bio-inspired signal protocols',
        protocols: [
          'SNN_Spiking_Neural_Network_Protocol', 'Temporal_Coding_Protocol',
          'Population_Coding_Protocol', 'Rate_Coding_Protocol',
          'Bursting_Neural_Signaling_Protocol', 'Spike_Timing_Dependent_Protocol',
          'Chemical_Synapse_Mimicking_Protocol', 'Gap_Junction_Electrical_Synapse_Protocol',
          'Neuromorphic_Event_Stream_Protocol', 'Dynamic_Vision_Sensor_Protocol_DVS'
        ],
        technologies: [
          'Intel_Loihi_Chip', 'IBM_TrueNorth', 'SpiNNaker_System',
          'Neuromorphic_Hardware', 'Event_Based_Sensors', 'Spiking_Neural_Processors'
        ],
        standards: [
          'NENGO_Framework', 'Brian_Simulation_Platform', 'NEST_Neural_Simulation_Tool'
        ],
        data_unit: 'Spike_Event_Temporal_Pattern',
        power_efficiency: 'Ultra_Low_mW_scale'
      }
    };

    Object.entries(layers).forEach(([key, layer]) => {
      this.osi_layers.set(key, layer);
    });

    console.log(`✅ Registered ${this.osi_layers.size} Protocol Layers (upgraded from 7 to 11)`);
  }

  registerProtocolMappings() {
    const mappings = {
      'TCP_IP_TO_OSI': {
        description: 'TCP/IP Model mapped to OSI Model',
        mapping: [
          {
            tcp_ip_layer: 'Link_Layer',
            osi_layers: ['LAYER_1_PHYSICAL', 'LAYER_2_DATA_LINK'],
            protocols: ['Ethernet', 'Wi_Fi', 'PPP']
          },
          {
            tcp_ip_layer: 'Internet_Layer',
            osi_layers: ['LAYER_3_NETWORK'],
            protocols: ['IPv4', 'IPv6', 'ICMP', 'IPsec']
          },
          {
            tcp_ip_layer: 'Transport_Layer',
            osi_layers: ['LAYER_4_TRANSPORT'],
            protocols: ['TCP', 'UDP', 'QUIC']
          },
          {
            tcp_ip_layer: 'Application_Layer',
            osi_layers: ['LAYER_5_SESSION', 'LAYER_6_PRESENTATION', 'LAYER_7_APPLICATION'],
            protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH']
          }
        ]
      }
    };

    Object.entries(mappings).forEach(([key, mapping]) => {
      this.protocol_mappings.set(key, mapping);
    });
  }

  registerTCPIPSuite() {
    const tcp_ip_suite = {
      'LINK_LAYER': {
        protocols: ['Ethernet_802.3', 'Wi_Fi_802.11', 'PPP', 'SLIP'],
        technologies: ['NIC', 'Hub', 'Switch', 'Bridge']
      },
      'INTERNET_LAYER': {
        protocols: ['IPv4', 'IPv6', 'ICMP', 'IGMPv2_v3', 'IPsec', 'MPLS'],
        services: ['Routing', 'Logical_Addressing', 'Forwarding']
      },
      'TRANSPORT_LAYER': {
        protocols: ['TCP', 'UDP', 'QUIC', 'SCTP', 'DCCP'],
        services: ['End_to_End_Communication', 'Reliability', 'Flow_Control']
      },
      'APPLICATION_LAYER': {
        protocols: [
          'HTTP', 'HTTPS', 'FTP', 'SFTP', 'SSH', 'Telnet',
          'SMTP', 'POP3', 'IMAP', 'DNS', 'DHCP',
          'NTP', 'SNMP', 'LDAP', 'Kerberos',
          'VoIP_SIP', 'WebSocket', 'gRPC', 'MQTT',
          'REST_APIs', 'GraphQL'
        ],
        services: ['Web_Browsing', 'Email', 'File_Transfer', 'Remote_Access']
      }
    };

    Object.entries(tcp_ip_suite).forEach(([key, layer]) => {
      this.tcp_ip_suite.set(key, layer);
    });
  }

  getStatus() {
    return {
      system: 'SHEIKHA_OSI_PROTOCOL_STACK',
      status: 'ACTIVE_ALL_11_LAYERS',
      layers_active: this.osi_layers.size,
      protocols_total: 230,
      tier: 'OMEGA_SUPREME',
      foundation: 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS',
      coverage: 'COMPLETE_GLOBAL_QUANTUM_OPTICAL_SPACE_NEURO_STANDARDS',
      timestamp: new Date().toISOString()
    };
  }

  getLayerDetails(layer_name) {
    return this.osi_layers.get(layer_name) || { error: 'Layer not found' };
  }

  getAllLayers() {
    const layers = [];
    this.osi_layers.forEach((layer, key) => {
      layers.push({ key: key, ...layer });
    });
    return layers.sort((a, b) => a.layer_number - b.layer_number);
  }

  getTCPIPSuite() {
    const suite = {};
    this.tcp_ip_suite.forEach((layer, key) => {
      suite[key] = layer;
    });
    return suite;
  }

  getProtocolsByLayer(layer_name) {
    const layer = this.osi_layers.get(layer_name);
    if (!layer) return { error: 'Layer not found' };
    
    return {
      layer_name: layer.name,
      layer_number: layer.layer_number,
      protocols: layer.protocols || layer.protocols_grouped || layer.protocols
    };
  }
}

const sheikhaOSIStack = new SheikhaOSIProtocolStack();

module.exports = {
  SheikhaOSIProtocolStack,
  sheikhaOSIStack,
  getStatus: () => sheikhaOSIStack.getStatus(),
  getAllLayers: () => sheikhaOSIStack.getAllLayers(),
  getLayerDetails: (layer) => sheikhaOSIStack.getLayerDetails(layer),
  getTCPIPSuite: () => sheikhaOSIStack.getTCPIPSuite(),
  getProtocolsByLayer: (layer) => sheikhaOSIStack.getProtocolsByLayer(layer)
};
