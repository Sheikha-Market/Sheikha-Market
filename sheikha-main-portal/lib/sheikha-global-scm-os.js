// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 SHEIKHA GLOBAL SUPPLY CHAIN OS (SGSC-OS)
 * نظام تشغيل سلاسل الإمداد العالمي — الموحّد الأكبر
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال ٦٠
 * "لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ" — قريش ١-٢
 *
 * الهيكل:
 * Layer 1: Experience Layer   — بوابات العملاء والوكلاء والموردين
 * Layer 2: Operations Layer   — الطلبات والعقود والشحنات والفواتير
 * Layer 3: Integration Layer  — Oracle / SAP / Dynamics / EDI / API
 * Layer 4: Intelligence Layer — AI توصيات، تحليلات، مخاطر
 * Layer 5: Governance Layer   — صلاحيات، امتثال، تدقيق
 *
 * الأسواق المُغطاة:
 * ✅ التعدين والمناجم
 * ✅ المصاهر والمعالجة
 * ✅ التصنيع
 * ✅ السكراب وإعادة التدوير
 * ✅ المعادن الأساسية والثمينة والنادرة
 * ✅ اللوجستيات (2PL → 5PL → 360PL → 3DPL)
 * ✅ الطاقة والكيماويات والبناء والزراعة
 * ✅ ERP تكامل عالمي
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// استيراد طبقات النظام
// ═══════════════════════════════════════════════════════════════════════════════
let globalMarketsEngine, plStackEngine, erpIntegrationHub, aiSCMIntelligence;

try {
    globalMarketsEngine = require('./sheikha-global-markets-engine');
    console.log('✅ [SGSC-OS] Global Markets Engine — محمّل');
} catch (e) { console.warn('⚠️ [SGSC-OS] globalMarketsEngine:', e.message); }

try {
    plStackEngine = require('./sheikha-pl-stack-engine');
    console.log('✅ [SGSC-OS] PL Stack Engine — محمّل');
} catch (e) { console.warn('⚠️ [SGSC-OS] plStackEngine:', e.message); }

try {
    erpIntegrationHub = require('./sheikha-erp-integration-hub');
    console.log('✅ [SGSC-OS] ERP Integration Hub — محمّل');
} catch (e) { console.warn('⚠️ [SGSC-OS] erpIntegrationHub:', e.message); }

try {
    aiSCMIntelligence = require('./sheikha-ai-scm-intelligence');
    console.log('✅ [SGSC-OS] AI SCM Intelligence — محمّل');
} catch (e) { console.warn('⚠️ [SGSC-OS] aiSCMIntelligence:', e.message); }

// ═══════════════════════════════════════════════════════════════════════════════
// تعريف المناطق الجغرافية وشبكة الموانئ
// ═══════════════════════════════════════════════════════════════════════════════

const GLOBAL_NETWORK = {
    regions: {
        MENA: {
            nameAr: 'الشرق الأوسط وشمال أفريقيا',
            nameEn: 'Middle East & North Africa',
            countries: ['SA', 'UAE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'EG', 'IQ', 'IR', 'YE', 'LY', 'TN', 'DZ', 'MA', 'SD'],
            majorPorts: ['Jebel Ali (UAE)', 'King Abdulaziz (SA)', 'Salalah (OM)', 'Sohar (OM)', 'Dammam (SA)', 'Port Said (EG)', 'Aqaba (JO)'],
            hubs: ['Dubai', 'Riyadh', 'Abu Dhabi', 'Cairo', 'Casablanca'],
            freeZones: ['JAFZA (Dubai)', 'KAEC (KSA)', 'Khalifa Port FZ (UAE)', 'DAFZA (Dubai)', 'Hamriyah FZ (Sharjah)']
        },
        ASIA: {
            nameAr: 'آسيا والمحيط الهادئ',
            nameEn: 'Asia-Pacific',
            countries: ['CN', 'JP', 'KR', 'IN', 'SG', 'MY', 'TH', 'VN', 'ID', 'PH', 'AU', 'NZ', 'PK', 'BD'],
            majorPorts: ['Shanghai', 'Singapore', 'Ningbo', 'Shenzhen', 'Busan', 'Hong Kong', 'Port Klang', 'Laem Chabang', 'Colombo'],
            hubs: ['Shanghai', 'Singapore', 'Hong Kong', 'Tokyo', 'Mumbai', 'Sydney']
        },
        EUROPE: {
            nameAr: 'أوروبا',
            nameEn: 'Europe',
            countries: ['DE', 'FR', 'GB', 'NL', 'BE', 'IT', 'ES', 'PL', 'TR', 'SE', 'NO', 'FI', 'CH', 'AT'],
            majorPorts: ['Rotterdam', 'Antwerp', 'Hamburg', 'Marseille', 'Genoa', 'Piraeus', 'Valencia', 'Barcelona'],
            hubs: ['Rotterdam', 'Antwerp', 'Hamburg', 'London', 'Paris', 'Frankfurt']
        },
        AMERICAS: {
            nameAr: 'الأمريكتان',
            nameEn: 'Americas',
            countries: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
            majorPorts: ['Los Angeles', 'Long Beach', 'New York', 'Houston', 'Santos (Brazil)', 'Callao (Peru)', 'Manzanillo (Mexico)'],
            hubs: ['New York', 'Chicago', 'Los Angeles', 'Houston', 'São Paulo', 'Santiago']
        },
        AFRICA: {
            nameAr: 'أفريقيا جنوب الصحراء',
            nameEn: 'Sub-Saharan Africa',
            countries: ['ZA', 'NG', 'GH', 'KE', 'ET', 'TZ', 'ZM', 'CD', 'CI', 'SN'],
            majorPorts: ['Durban (SA)', 'Cape Town (SA)', 'Lagos (NG)', 'Mombasa (KE)', 'Dar es Salaam (TZ)', 'Abidjan (CI)'],
            hubs: ['Johannesburg', 'Lagos', 'Nairobi', 'Accra', 'Dar es Salaam']
        },
        CIS: {
            nameAr: 'رابطة الدول المستقلة وروسيا',
            nameEn: 'CIS & Russia',
            countries: ['RU', 'KZ', 'UZ', 'AZ', 'UA', 'GE', 'AM'],
            majorPorts: ['Novorossiysk (RU)', 'Vladivostok (RU)', 'Aktau (KZ)'],
            hubs: ['Moscow', 'Almaty', 'Baku', 'Tashkent']
        }
    },
    tradingBlocs: {
        GCC: { members: ['SA', 'UAE', 'QA', 'KW', 'BH', 'OM'], freeTradeArea: true },
        RCEP: { members: ['CN', 'JP', 'KR', 'AU', 'NZ', 'ASEAN'], freeTradeArea: true },
        EU: { members: ['EU27'], customsUnion: true },
        CPTPP: { members: ['CA', 'AU', 'JP', 'NZ', 'SG', 'MX', 'VN', 'PE', 'CL', 'MY', 'BN'], freeTradeArea: true },
        AfCFTA: { members: ['54 African countries'], freeTradeArea: true }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// نظام إدارة المستأجرين (Multi-Tenant)
// ═══════════════════════════════════════════════════════════════════════════════

const TENANT_ROLES = {
    super_admin:       { nameAr: 'مدير النظام العام',         permissions: ['*'] },
    gov_authority:     { nameAr: 'جهة حكومية / هيئة تنظيمية', permissions: ['view_all', 'approve', 'audit', 'report'] },
    factory:           { nameAr: 'مصنع / منجم / مصهرة',        permissions: ['orders', 'production', 'inventory', 'logistics', 'rfq'] },
    buyer:             { nameAr: 'مشتري / مستورد',              permissions: ['rfq', 'orders', 'payments', 'tracking'] },
    supplier:          { nameAr: 'مورد / منتج',                 permissions: ['catalog', 'quotes', 'orders', 'invoicing', 'logistics'] },
    agent:             { nameAr: 'وكيل / سمسار',               permissions: ['rfq', 'orders', 'commission_view', 'customer_portfolio'] },
    logistics_provider:{ nameAr: 'مزود خدمة لوجستية',          permissions: ['shipments', 'tracking', 'docs', 'invoicing'] },
    finance:           { nameAr: 'مدير مالي',                   permissions: ['invoices', 'payments', 'reports', 'zakat'] },
    auditor:           { nameAr: 'مراجع / مدقق',               permissions: ['view_only', 'audit_trail', 'compliance_reports'] },
    viewer:            { nameAr: 'مشاهد / تقارير فقط',          permissions: ['view_only', 'reports'] }
};

// ═══════════════════════════════════════════════════════════════════════════════
// لوحات التحكم المتخصصة (Specialized Portals)
// ═══════════════════════════════════════════════════════════════════════════════

const SPECIALIZED_PORTALS = {
    control_tower: {
        id: 'control_tower',
        nameAr: 'برج التحكم العالمي',
        nameEn: 'Global Supply Chain Control Tower',
        icon: '🗼',
        description: 'رؤية 360° لكل سلسلة الإمداد — طلبات، شحنات، مخزون، موردين، فواتير',
        url: '/control-tower',
        targetRoles: ['super_admin', 'gov_authority', 'factory'],
        widgets: ['live_shipments_map', 'orders_pipeline', 'risk_alerts', 'kpi_dashboard', 'ai_insights'],
        realtime: true
    },
    mining_portal: {
        id: 'mining_portal',
        nameAr: 'بوابة التعدين والمصاهر',
        nameEn: 'Mining & Smelting Portal',
        icon: '⛏️',
        url: '/portal/mining',
        targetRoles: ['factory', 'buyer', 'super_admin'],
        widgets: ['production_tracker', 'ore_inventory', 'processing_costs', 'shipments', 'market_prices'],
        markets: ['mining_smelting', 'base_metals', 'precious_metals', 'rare_critical_minerals']
    },
    scrap_portal: {
        id: 'scrap_portal',
        nameAr: 'بوابة السكراب وإعادة التدوير',
        nameEn: 'Scrap & Recycling Portal',
        icon: '♻️',
        url: '/portal/scrap',
        targetRoles: ['buyer', 'supplier', 'agent'],
        widgets: ['scrap_classifier', 'price_tracker', 'grading_tool', 'buyer_network', 'export_docs'],
        markets: ['scrap_recycled']
    },
    logistics_portal: {
        id: 'logistics_portal',
        nameAr: 'بوابة اللوجستيات والنقل',
        nameEn: 'Logistics & Transport Portal',
        icon: '🚢',
        url: '/portal/logistics',
        targetRoles: ['logistics_provider', 'factory', 'buyer', 'supplier'],
        widgets: ['shipment_booking', 'carrier_marketplace', 'rate_comparison', 'live_tracking', 'docs_management'],
        plServices: ['2PL', '3PL', '4PL', '5PL', '360PL', '3DPL']
    },
    buyer_portal: {
        id: 'buyer_portal',
        nameAr: 'بوابة المشتري',
        nameEn: 'Buyer Portal',
        icon: '🛒',
        url: '/portal/buyer',
        targetRoles: ['buyer'],
        widgets: ['rfq_center', 'order_tracking', 'supplier_evaluation', 'price_comparison', 'payment_status'],
        markets: 'all'
    },
    supplier_portal: {
        id: 'supplier_portal',
        nameAr: 'بوابة المورد',
        nameEn: 'Supplier Portal',
        icon: '📦',
        url: '/portal/supplier',
        targetRoles: ['supplier'],
        widgets: ['catalog_manager', 'rfq_responses', 'order_management', 'shipping_management', 'invoice_center'],
        markets: 'all'
    },
    agent_portal: {
        id: 'agent_portal',
        nameAr: 'بوابة الوكيل',
        nameEn: 'Agent & Broker Portal',
        icon: '🤝',
        url: '/portal/agent',
        targetRoles: ['agent'],
        widgets: ['client_portfolio', 'deal_pipeline', 'commission_tracker', 'market_intel', 'rfq_management'],
        markets: 'all'
    },
    gov_portal: {
        id: 'gov_portal',
        nameAr: 'بوابة الحكومة والهيئات',
        nameEn: 'Government & Regulatory Portal',
        icon: '🏛️',
        url: '/portal/government',
        targetRoles: ['gov_authority'],
        widgets: ['trade_statistics', 'hs_code_analytics', 'compliance_monitor', 'tariff_calculator', 'national_trade_flows'],
        markets: 'all'
    },
    finance_portal: {
        id: 'finance_portal',
        nameAr: 'بوابة المالية والتقارير',
        nameEn: 'Finance & Reports Portal',
        icon: '💹',
        url: '/portal/finance',
        targetRoles: ['finance', 'super_admin'],
        widgets: ['revenue_dashboard', 'payment_aging', 'invoice_management', 'zakat_calculator', 'financial_kpis']
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SGSC-OS Main Engine
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaGlobalSCMOS extends EventEmitter {
    constructor() {
        super();
        this.version = '1.0.0';
        this.name = 'SHEIKHA Global Supply Chain OS (SGSC-OS)';
        this.status = 'operational';
        this.startTime = new Date();

        this.network = GLOBAL_NETWORK;
        this.tenantRoles = TENANT_ROLES;
        this.portals = SPECIALIZED_PORTALS;

        // Subsystems
        this.marketsEngine = globalMarketsEngine;
        this.plEngine = plStackEngine;
        this.erpHub = erpIntegrationHub;
        this.aiEngine = aiSCMIntelligence;

        // Runtime data
        this._tenants = new Map();
        this._rfqs = new Map();
        this._orders = new Map();
        this._shipments = new Map();
        this._contracts = new Map();
        this._notifications = new Map();

        console.log('🌍 [SGSC-OS] نظام تشغيل سلاسل الإمداد العالمي — مُشغَّل');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // إدارة المستأجرين (Tenants)
    // ─────────────────────────────────────────────────────────────────────────

    registerTenant(data) {
        const tenantId = `TNT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const tenant = {
            id: tenantId,
            companyName: data.companyName,
            companyNameAr: data.companyNameAr,
            type: data.type || 'buyer',       // factory, buyer, supplier, agent, etc.
            country: data.country,
            region: data.region || this._detectRegion(data.country),
            industry: data.industry,           // metals, scrap, logistics, energy, etc.
            erpSystem: data.erpSystem || null, // oracle, sap, dynamics, none
            users: [],
            erpConnections: [],
            marketAccess: data.marketAccess || ['base_metals', 'scrap_recycled', 'logistics_services'],
            plLevel: data.plLevel || '3PL',
            status: 'active',
            subscription: data.subscription || 'basic',
            contacts: data.contacts || {},
            hsCodes: data.hsCodes || [],       // HS Codes ذات صلة
            createdAt: new Date().toISOString()
        };
        this._tenants.set(tenantId, tenant);
        this.emit('tenant:registered', tenant);
        return { success: true, tenantId, tenant };
    }

    getTenant(tenantId) {
        return this._tenants.get(tenantId) || null;
    }

    getAllTenants() {
        return Array.from(this._tenants.values());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // إدارة RFQ (طلبات عروض الأسعار)
    // ─────────────────────────────────────────────────────────────────────────

    createRFQ(data) {
        const rfqId = `RFQ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const rfq = {
            id: rfqId,
            tenantId: data.tenantId,
            type: data.type || 'purchase', // purchase | logistics | service
            title: data.title,
            marketId: data.marketId,
            product: data.product,
            hs_code: data.hs_code,
            quantity: data.quantity,
            unit: data.unit || 'MT',
            specifications: data.specifications || {},
            origin: data.origin,
            destination: data.destination,
            deliveryDate: data.deliveryDate,
            incoterm: data.incoterm || 'CIF',
            paymentTerms: data.paymentTerms || 'LC 90 days',
            validUntil: data.validUntil,
            status: 'open',
            responses: [],
            aiRecommendations: null,
            createdAt: new Date().toISOString()
        };

        // ذكاء اصطناعي: توصية الموردين فوراً
        if (this.aiEngine) {
            try {
                rfq.aiRecommendations = this.aiEngine.recommendSuppliers({
                    product: rfq.product,
                    quantity: rfq.quantity,
                    deliveryDate: rfq.deliveryDate,
                    origin: rfq.origin,
                    destination: rfq.destination
                });
            } catch (e) { /* continue without AI */ }
        }

        this._rfqs.set(rfqId, rfq);
        this.emit('rfq:created', rfq);
        return rfq;
    }

    getRFQ(rfqId) {
        return this._rfqs.get(rfqId) || null;
    }

    respondToRFQ(rfqId, supplierData) {
        const rfq = this._rfqs.get(rfqId);
        if (!rfq) return { success: false, error: 'RFQ غير موجود' };

        const response = {
            responseId: `RSP-${Date.now()}`,
            supplierId: supplierData.supplierId,
            supplierName: supplierData.supplierName,
            unitPrice: supplierData.unitPrice,
            currency: supplierData.currency || 'USD',
            totalAmount: (supplierData.unitPrice * rfq.quantity).toFixed(2),
            deliveryDays: supplierData.deliveryDays,
            incoterm: supplierData.incoterm || rfq.incoterm,
            paymentTerms: supplierData.paymentTerms || rfq.paymentTerms,
            validUntil: supplierData.validUntil,
            notes: supplierData.notes || '',
            documents: supplierData.documents || [],
            submittedAt: new Date().toISOString()
        };

        rfq.responses.push(response);
        this.emit('rfq:response_received', { rfqId, response });
        return { success: true, response };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // إدارة الطلبات (Orders)
    // ─────────────────────────────────────────────────────────────────────────

    createOrder(data) {
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const order = {
            id: orderId,
            tenantId: data.tenantId,
            rfqId: data.rfqId || null,
            type: data.type || 'purchase', // purchase | sales | transfer
            buyerId: data.buyerId,
            supplierId: data.supplierId,
            lineItems: data.lineItems || [],
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            total: data.total || 0,
            currency: data.currency || 'USD',
            incoterm: data.incoterm || 'CIF',
            paymentTerms: data.paymentTerms,
            deliveryAddress: data.deliveryAddress,
            requestedDelivery: data.requestedDelivery,
            status: 'confirmed',
            approvals: [],
            shipmentId: null,
            invoiceId: null,
            timeline: [
                { event: 'order_created', timestamp: new Date().toISOString(), actor: data.tenantId }
            ],
            erpSync: { oracle: null, sap: null, dynamics: null },
            createdAt: new Date().toISOString()
        };

        this._orders.set(orderId, order);
        this.emit('order:created', order);

        // مزامنة مع ERP إن وُجد اتصال
        if (this.erpHub && data.erpConnectionId) {
            this.erpHub.pushPurchaseOrder(data.erpConnectionId, order).then(result => {
                order.erpSync[result.erpType] = result.externalId || 'synced';
            }).catch(() => {});
        }

        return order;
    }

    getOrder(orderId) {
        return this._orders.get(orderId) || null;
    }

    updateOrderStatus(orderId, status, actorId, note = '') {
        const order = this._orders.get(orderId);
        if (!order) return { error: 'طلب غير موجود' };
        order.status = status;
        order.timeline.push({ event: status, timestamp: new Date().toISOString(), actor: actorId, note });
        this.emit('order:status_updated', { orderId, status, actorId });
        return order;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // إدارة الشحنات (Shipments)
    // ─────────────────────────────────────────────────────────────────────────

    createShipment(data) {
        const shipmentId = `SHP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const shipment = {
            id: shipmentId,
            orderId: data.orderId,
            tenantId: data.tenantId,
            plType: data.plType || '3PL',
            mode: data.mode || 'sea',  // sea, air, road, rail, multimodal
            origin: data.origin,
            destination: data.destination,
            carrier: data.carrier,
            vessel: data.vessel || null,
            containerNumbers: data.containerNumbers || [],
            blNumber: data.blNumber || null,
            etd: data.etd, // Estimated Time of Departure
            eta: data.eta, // Estimated Time of Arrival
            atd: null,     // Actual Time of Departure
            ata: null,     // Actual Time of Arrival
            commodity: data.commodity,
            grossWeight: data.grossWeight,
            volume: data.volume,
            status: 'booked',
            documents: data.documents || [],
            milestones: [
                { milestone: 'booked', timestamp: new Date().toISOString(), location: data.origin }
            ],
            cost: data.cost || null,
            tracking: { lat: null, lon: null, lastUpdate: null },
            alerts: [],
            createdAt: new Date().toISOString()
        };

        this._shipments.set(shipmentId, shipment);
        this.emit('shipment:created', shipment);

        // أحكام الذكاء الاصطناعي: توقع ETA
        if (this.aiEngine) {
            try {
                const route = this.aiEngine.optimizeRoute({
                    origin: shipment.origin,
                    destination: shipment.destination,
                    commodity: shipment.commodity,
                    quantity_mt: shipment.grossWeight
                });
                shipment.routeOptimization = route;
            } catch (e) {}
        }

        return shipment;
    }

    updateShipmentMilestone(shipmentId, milestone, location, note = '') {
        const shipment = this._shipments.get(shipmentId);
        if (!shipment) return { error: 'شحنة غير موجودة' };
        shipment.status = milestone;
        shipment.milestones.push({ milestone, timestamp: new Date().toISOString(), location, note });
        if (milestone === 'departed') shipment.atd = new Date().toISOString();
        if (milestone === 'delivered') shipment.ata = new Date().toISOString();
        this.emit('shipment:milestone', { shipmentId, milestone, location });
        return shipment;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Control Tower — لوحة التحكم الكاملة
    // ─────────────────────────────────────────────────────────────────────────

    getControlTowerDashboard(tenantId) {
        const tenant = this._tenants.get(tenantId);
        const allOrders = Array.from(this._orders.values()).filter(o => !tenantId || o.tenantId === tenantId);
        const allShipments = Array.from(this._shipments.values()).filter(s => !tenantId || s.tenantId === tenantId);
        const allRFQs = Array.from(this._rfqs.values()).filter(r => !tenantId || r.tenantId === tenantId);

        const shipmentsByStatus = allShipments.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {});

        const ordersByStatus = allOrders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});

        return {
            timestamp: new Date().toISOString(),
            tenant: tenant ? { id: tenantId, name: tenant.companyName, type: tenant.type } : null,
            summary: {
                activeOrders: allOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length,
                activeShipments: allShipments.filter(s => !['delivered', 'cancelled'].includes(s.status)).length,
                openRFQs: allRFQs.filter(r => r.status === 'open').length,
                totalOrders: allOrders.length,
                totalShipments: allShipments.length,
                totalRFQs: allRFQs.length
            },
            shipments: {
                byStatus: shipmentsByStatus,
                inTransit: allShipments.filter(s => s.status === 'in_transit').map(s => ({
                    id: s.id, origin: s.origin, destination: s.destination,
                    eta: s.eta, commodity: s.commodity, carrier: s.carrier
                }))
            },
            orders: {
                byStatus: ordersByStatus,
                pending: allOrders.filter(o => o.status === 'confirmed').map(o => ({
                    id: o.id, total: o.total, currency: o.currency,
                    requestedDelivery: o.requestedDelivery
                }))
            },
            rfqs: {
                open: allRFQs.filter(r => r.status === 'open').map(r => ({
                    id: r.id, product: r.product, quantity: r.quantity,
                    responsesCount: r.responses.length
                }))
            },
            systemHealth: {
                marketsEngine: globalMarketsEngine ? 'online' : 'offline',
                plEngine: plStackEngine ? 'online' : 'offline',
                erpHub: erpIntegrationHub ? 'online' : 'offline',
                aiEngine: aiSCMIntelligence ? 'online' : 'offline'
            },
            portals: Object.values(this.portals).map(p => ({
                id: p.id, nameAr: p.nameAr, url: p.url, icon: p.icon
            })),
            globalNetwork: {
                regions: Object.keys(this.network.regions).length,
                tradingBlocs: Object.keys(this.network.tradingBlocs).length
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API Gateway — الواجهة الرئيسية
    // ─────────────────────────────────────────────────────────────────────────

    getSystemStatus() {
        const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
        return {
            name: this.name,
            version: this.version,
            status: this.status,
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
            layers: {
                markets: globalMarketsEngine ? '✅ online' : '❌ offline',
                logistics: plStackEngine ? '✅ online' : '❌ offline',
                erp_integration: erpIntegrationHub ? '✅ online' : '❌ offline',
                ai_intelligence: aiSCMIntelligence ? '✅ online' : '❌ offline'
            },
            stats: {
                tenants: this._tenants.size,
                rfqs: this._rfqs.size,
                orders: this._orders.size,
                shipments: this._shipments.size
            },
            markets: globalMarketsEngine ? globalMarketsEngine.getAllMarkets().length : 0,
            portals: Object.keys(this.portals).length,
            regions: Object.keys(this.network.regions).length
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────

    _detectRegion(countryCode) {
        for (const [regionId, region] of Object.entries(this.network.regions)) {
            if (region.countries.includes(countryCode)) return regionId;
        }
        return 'GLOBAL';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton + Export
// ═══════════════════════════════════════════════════════════════════════════════

const sgscOS = new SheikhaGlobalSCMOS();

module.exports = {
    SheikhaGlobalSCMOS,
    GLOBAL_NETWORK,
    TENANT_ROLES,
    SPECIALIZED_PORTALS,
    sgscOS,

    // Public API
    getSystemStatus: () => sgscOS.getSystemStatus(),
    registerTenant: (data) => sgscOS.registerTenant(data),
    getTenant: (id) => sgscOS.getTenant(id),
    getAllTenants: () => sgscOS.getAllTenants(),
    createRFQ: (data) => sgscOS.createRFQ(data),
    respondToRFQ: (rfqId, data) => sgscOS.respondToRFQ(rfqId, data),
    createOrder: (data) => sgscOS.createOrder(data),
    getOrder: (id) => sgscOS.getOrder(id),
    updateOrderStatus: (id, status, actor, note) => sgscOS.updateOrderStatus(id, status, actor, note),
    createShipment: (data) => sgscOS.createShipment(data),
    updateShipmentMilestone: (id, milestone, location, note) => sgscOS.updateShipmentMilestone(id, milestone, location, note),
    getControlTowerDashboard: (tenantId) => sgscOS.getControlTowerDashboard(tenantId),
    getPortals: () => Object.values(SPECIALIZED_PORTALS),
    getRegions: () => GLOBAL_NETWORK.regions,
    getTenantRoles: () => TENANT_ROLES
};
