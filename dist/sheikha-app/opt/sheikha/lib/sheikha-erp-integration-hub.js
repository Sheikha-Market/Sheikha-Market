// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔗 SHEIKHA ERP INTEGRATION HUB
 * مركز التكامل مع أنظمة ERP العالمية
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة ٢
 *
 * يدعم:
 * ✅ Oracle Fusion Cloud ERP
 * ✅ SAP S/4HANA + SAP Business Network
 * ✅ Microsoft Dynamics 365 SCM
 * ✅ EDI / AS2 / SFTP / CSV
 * ✅ Generic REST / Webhook / GraphQL
 * ✅ Event Bus (Kafka / RabbitMQ)
 * ✅ B2B Partner Management
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const EventEmitter = require('events');
const https = require('https');
const http = require('http');
const url = require('url');

// ═══════════════════════════════════════════════════════════════════════════════
// تعريفات موصلات ERP
// ═══════════════════════════════════════════════════════════════════════════════

const ERP_CONNECTORS = {

    // ─────────────────────────────────────────────────────────────────────────
    // Oracle Fusion Cloud ERP
    // ─────────────────────────────────────────────────────────────────────────
    oracle_fusion: {
        id: 'oracle_fusion',
        nameAr: 'Oracle Fusion Cloud ERP',
        nameEn: 'Oracle Fusion Cloud ERP',
        vendor: 'Oracle Corporation',
        version: 'Oracle Fusion Cloud ERP (SaaS)',
        icon: '🔴',
        description: 'نظام ERP سحابي من Oracle — يستخدمه كبار الشركات العالمية',
        capabilities: [
            'Oracle REST APIs v21+',
            'Oracle Integration Cloud (OIC)',
            'Oracle B2B / EDI Integration',
            'Oracle Financials Cloud',
            'Oracle SCM Cloud',
            'Oracle Procurement Cloud',
            'Oracle Manufacturing Cloud',
            'Oracle Logistics Cloud',
            'SOAP/WSDL Legacy services'
        ],
        authentication: {
            types: ['OAuth 2.0', 'Basic Auth', 'SAML 2.0'],
            tokenEndpoint: '/oauth2/v1/token',
            scopes: ['urn:opc:resource:consumer::all']
        },
        keyAPIs: {
            purchaseOrders: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/purchaseOrders',
                method: 'GET/POST',
                description: 'قراءة وإنشاء أوامر الشراء'
            },
            invoices: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/invoices',
                method: 'GET/POST',
                description: 'قراءة وإنشاء الفواتير'
            },
            suppliers: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/suppliers',
                method: 'GET/POST',
                description: 'إدارة الموردين'
            },
            requisitions: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/requisitions',
                method: 'GET/POST',
                description: 'طلبات الشراء الداخلية'
            },
            shipments: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/shipments',
                method: 'GET/POST',
                description: 'تتبع الشحنات'
            },
            inventory: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/inventoryMiscellaneousReceipts',
                method: 'GET/POST',
                description: 'إدارة المخزون'
            },
            items: {
                endpoint: '/fscmRestApi/resources/11.13.18.05/items',
                method: 'GET/POST',
                description: 'كتالوج المواد والمنتجات'
            }
        },
        b2b: {
            ediSupport: true,
            protocols: ['AS2', 'SFTP', 'FTP', 'REST'],
            documentTypes: ['PO', 'PO Acknowledgement', 'ASN', 'Invoice', 'Remittance'],
            tradingPartnerManagement: 'Oracle B2B',
            integrationPlatform: 'Oracle Integration Cloud (OIC)'
        },
        webhooks: {
            supported: true,
            events: ['PO Created', 'PO Changed', 'Invoice Approved', 'Shipment Received', 'Payment Made']
        },
        sheikhaMapping: {
            rfq_to_po: 'شيخة RFQ → Oracle Purchase Order',
            invoice_sync: 'Oracle Invoice ← شيخة Invoice',
            supplier_sync: 'Oracle Supplier → شيخة Vendor',
            item_catalog: 'Oracle Item Master → شيخة Product Catalog',
            shipment_track: 'شيخة Shipment → Oracle ASN'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SAP S/4HANA + SAP Business Network
    // ─────────────────────────────────────────────────────────────────────────
    sap_s4hana: {
        id: 'sap_s4hana',
        nameAr: 'SAP S/4HANA وشبكة SAP للأعمال',
        nameEn: 'SAP S/4HANA + SAP Business Network',
        vendor: 'SAP SE',
        versions: ['SAP S/4HANA On-Premise 2021/2022/2023', 'SAP S/4HANA Cloud (Public & Private)'],
        icon: '🔵',
        description: 'نظام ERP الأكثر انتشاراً عالمياً في الشركات الكبرى والصناعية',
        capabilities: [
            'SAP OData API (CDS Views)',
            'SAP BTP Integration Suite',
            'SAP Event Mesh',
            'SAP Business Network (Ariba)',
            'SAP Logistics Business Network',
            'SAP Transportation Management (TM)',
            'SAP Extended Warehouse Management (EWM)',
            'SAP Plant Maintenance (PM)',
            'SAP Production Planning (PP)'
        ],
        authentication: {
            types: ['OAuth 2.0 (SAP BTP)', 'SAP SSO', 'Basic Auth (On-Premise)', 'SAML 2.0'],
            tokenEndpoint: '/oauth/token (SAP BTP)'
        },
        keyAPIs: {
            purchaseOrders: {
                endpoint: '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder',
                method: 'GET/POST',
                format: 'OData v4',
                description: 'أوامر الشراء'
            },
            suppliers: {
                endpoint: '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
                method: 'GET/POST',
                description: 'شركاء الأعمال (الموردين)'
            },
            materials: {
                endpoint: '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader',
                method: 'GET/POST',
                description: 'المواد والمخزون'
            },
            invoices: {
                endpoint: '/sap/opu/odata/sap/API_SUPPLIER_INVOICE_SRV/A_SupplierInvoice',
                method: 'GET/POST',
                description: 'فواتير الموردين'
            },
            deliveries: {
                endpoint: '/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV/A_OutbDeliveryHeader',
                method: 'GET/POST',
                description: 'الشحنات والتسليمات'
            },
            productionOrders: {
                endpoint: '/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder_2',
                method: 'GET/POST',
                description: 'أوامر الإنتاج'
            }
        },
        eventMesh: {
            description: 'نظام الأحداث اللحظية في SAP',
            topics: [
                'sap.s4.beh.purchaseorder.v1.PurchaseOrder.Created.v1',
                'sap.s4.beh.purchaseorder.v1.PurchaseOrder.Changed.v1',
                'sap.s4.beh.supplierinvoice.v1.SupplierInvoice.Created.v1',
                'sap.s4.beh.deliverydocument.v1.DeliveryDocument.Created.v1',
                'sap.s4.beh.goodsmovement.v1.GoodsMovement.Created.v1'
            ],
            protocol: 'CloudEvents 1.0',
            transport: 'AMQP 1.0 / Webhook'
        },
        aribaNetwork: {
            description: 'شبكة المشتريات العالمية من SAP',
            capabilities: ['PO Collaboration', 'Invoice Automation', 'Supplier Discovery', 'Contract Management'],
            suppliers: '4+ million suppliers',
            buyersSpend: '$3.75 trillion annually'
        },
        b2b: {
            ediSupport: true,
            protocols: ['AS2', 'SFTP', 'REST', 'IDocs', 'BAPIs'],
            documentTypes: ['ORDERS', 'INVOIC', 'DESADV', 'ORDRSP', 'REMADV'],
            integrationSuite: 'SAP Integration Suite (Cloud Integration + API Management + Event Mesh)'
        },
        sheikhaMapping: {
            rfq_to_po: 'شيخة RFQ → SAP Purchase Order via Ariba or OData',
            invoice_sync: 'SAP Supplier Invoice ← شيخة Invoice',
            material_sync: 'SAP Material Master → شيخة Product Catalog',
            delivery_track: 'SAP Outbound Delivery → شيخة Shipment Tracking',
            event_driven: 'SAP Event Mesh → شيخة Event Bus → Real-time Updates'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Microsoft Dynamics 365
    // ─────────────────────────────────────────────────────────────────────────
    dynamics365: {
        id: 'dynamics365',
        nameAr: 'Microsoft Dynamics 365',
        nameEn: 'Microsoft Dynamics 365 SCM & Finance',
        vendor: 'Microsoft Corporation',
        versions: ['Dynamics 365 Finance', 'Dynamics 365 Supply Chain Management', 'Dynamics 365 Commerce'],
        icon: '🟦',
        description: 'نظام ERP من Microsoft — منتشر في الشركات المتوسطة والكبيرة',
        capabilities: [
            'Microsoft Dataverse / OData APIs',
            'Microsoft Power Platform Integration',
            'Azure Service Bus (Event-driven)',
            'Dual-write synchronization',
            'Electronic Reporting (ER)',
            'Supply Chain Management modules',
            'Warehouse Management System (WMS)',
            'Transportation Management'
        ],
        authentication: {
            types: ['OAuth 2.0 (Azure AD)', 'Client Credentials', 'Service Principal'],
            tokenEndpoint: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
            scope: 'https://{d365-host}.crm.dynamics.com/.default'
        },
        keyAPIs: {
            purchaseOrders: {
                endpoint: '/api/data/v9.2/purchaseorders',
                method: 'GET/POST',
                format: 'OData v4',
                description: 'أوامر الشراء'
            },
            salesOrders: {
                endpoint: '/api/data/v9.2/salesorders',
                method: 'GET/POST',
                description: 'أوامر البيع'
            },
            products: {
                endpoint: '/api/data/v9.2/products',
                method: 'GET/POST',
                description: 'كتالوج المنتجات'
            },
            inventory: {
                endpoint: '/data/InventoryOnHandEntries',
                method: 'GET',
                description: 'مخزون متاح'
            },
            vendors: {
                endpoint: '/api/data/v9.2/accounts?$filter=customertypecode eq 1',
                method: 'GET/POST',
                description: 'الموردين'
            },
            shipments: {
                endpoint: '/api/data/v9.2/shipments',
                method: 'GET/POST',
                description: 'الشحنات'
            }
        },
        powerPlatform: {
            powerAutomate: 'أتمتة سير العمل والتكامل',
            powerBI: 'تقارير وتحليلات متقدمة',
            dataverse: 'قاعدة بيانات موحدة للتكامل',
            azureLogicApps: 'تدفقات تكامل آلية'
        },
        b2b: {
            ediSupport: true,
            protocols: ['REST', 'OData', 'Azure Service Bus', 'SFTP'],
            documentTypes: ['PO', 'Invoice', 'ASN', 'Product Catalog'],
            integrationPlatform: 'Azure Integration Services + Power Platform'
        },
        sheikhaMapping: {
            rfq_to_po: 'شيخة RFQ → Dynamics 365 Purchase Order via Dataverse API',
            invoice_sync: 'Dynamics 365 Invoice ← شيخة Invoice',
            product_sync: 'Dynamics 365 Products → شيخة Catalog',
            inventory_check: 'Dynamics 365 Inventory → شيخة Available Stock',
            event_driven: 'Azure Service Bus → شيخة Event Handler'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EDI / AS2 / SFTP Gateway
    // ─────────────────────────────────────────────────────────────────────────
    edi_gateway: {
        id: 'edi_gateway',
        nameAr: 'بوابة التبادل الإلكتروني للبيانات',
        nameEn: 'EDI / AS2 / B2B Gateway',
        description: 'تبادل وثائق B2B استناداً إلى معايير EDI العالمية',
        icon: '📡',
        standards: {
            EDIFACT: {
                description: 'UN/EDIFACT — المعيار العالمي الأكثر استخداماً',
                documents: {
                    'ORDERS': 'أوامر الشراء',
                    'ORDRSP': 'تأكيد أوامر الشراء',
                    'DESADV': 'إشعار الشحن (ASN)',
                    'INVOIC': 'الفاتورة',
                    'REMADV': 'إشعار الدفع',
                    'PRICAT': 'كتالوج الأسعار',
                    'INVRPT': 'تقرير المخزون',
                    'SHPMNT': 'وضع الشحنة'
                }
            },
            ANSI_X12: {
                description: 'ANSI ASC X12 — المعيار الأمريكي',
                documents: {
                    '850': 'Purchase Order',
                    '855': 'Purchase Order Acknowledgement',
                    '856': 'Advance Ship Notice (ASN)',
                    '810': 'Invoice',
                    '820': 'Remittance Advice',
                    '832': 'Price/Sales Catalog',
                    '846': 'Inventory Inquiry/Advice',
                    '997': 'Functional Acknowledgement'
                }
            },
            PEPPOL: {
                description: 'Pan-European Public Procurement Online — فوترة إلكترونية أوروبية',
                documents: ['UBL 2.1 Invoice', 'UBL 2.1 Order', 'UBL 2.1 Despatch Advice'],
                accessPoints: ['OpenPEPPOL network']
            }
        },
        protocols: {
            AS2: {
                description: 'Applicability Statement 2 — أكثر بروتوكولات EDI أماناً وانتشاراً',
                security: ['signing', 'encryption', 'MDN acknowledgement'],
                port: 4080,
                encryption: 'AES-256',
                signing: 'SHA-256'
            },
            AS4: {
                description: 'Web Services Security — للبيئات الحكومية والكبرى',
                basedOn: 'ebMS 3.0 + WS-Security'
            },
            SFTP: {
                description: 'Secure FTP — نقل ملفات EDI/CSV بأمان',
                port: 22,
                encryption: 'SSH-2'
            },
            FTP_S: {
                description: 'FTP over SSL/TLS',
                port: 21,
                encryption: 'TLS 1.2+'
            }
        },
        processing: {
            inbound: 'استقبال → التحقق → التحويل → إدخال للنظام',
            outbound: 'استخراج من النظام → التحويل → إرسال → التأكيد',
            mapping: 'تحويل تلقائي بين تنسيقات EDI وتنسيق شيخة JSON',
            validation: 'فحص تركيبي ومنطقي لكل وثيقة EDI',
            monitoring: 'مراقبة كل رسالة مع audit trail كامل'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Generic REST / Webhook / GraphQL Connector
    // ─────────────────────────────────────────────────────────────────────────
    generic_api: {
        id: 'generic_api',
        nameAr: 'موصل API العام',
        nameEn: 'Generic REST / Webhook / GraphQL Connector',
        description: 'للربط مع أي نظام يدعم REST API أو Webhooks أو GraphQL',
        icon: '🔌',
        supportedProtocols: ['REST (JSON/XML)', 'GraphQL', 'SOAP/WSDL', 'gRPC', 'Webhooks'],
        authMethods: ['OAuth 2.0', 'API Key', 'Basic Auth', 'JWT Bearer', 'HMAC Signature', 'mTLS'],
        dataFormats: ['JSON', 'XML', 'CSV', 'XLSX', 'Parquet', 'Avro'],
        transformationEngine: {
            description: 'محرك تحويل البيانات المرن',
            capabilities: [
                'Field mapping بالسحب والإفلات',
                'Data transformation rules',
                'Conditional logic',
                'Array handling',
                'Aggregation وتجميع البيانات',
                'Lookup tables',
                'Default values وإثراء البيانات'
            ]
        },
        webhooks: {
            inbound: 'شيخة تستقبل أحداث من أي نظام خارجي',
            outbound: 'شيخة ترسل أحداث لأنظمة خارجية عند كل حدث',
            retryPolicy: '3 محاولات مع تأخير تصاعدي (exponential backoff)',
            signatureVerification: 'HMAC-SHA256 للتحقق من مصدر الطلب'
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// قاعدة بيانات حقول التكامل (Master Data)
// ═══════════════════════════════════════════════════════════════════════════════

const INTEGRATION_DATA_MODELS = {
    purchaseOrder: {
        sheikhaNative: ['po_number', 'tenant_id', 'supplier_id', 'line_items', 'total_amount', 'currency', 'delivery_date', 'shipping_terms', 'payment_terms', 'status'],
        oracle_mapping: { po_number: 'PONumber', supplier_id: 'SupplierId', total_amount: 'Amount', currency: 'CurrencyCode' },
        sap_mapping: { po_number: 'PurchaseOrder', supplier_id: 'Supplier', total_amount: 'NetPriceAmount', currency: 'DocumentCurrencyCode' },
        dynamics_mapping: { po_number: 'purchaseordernumber', supplier_id: 'vendorid', total_amount: 'totalamount', currency: 'transactioncurrencyid' }
    },
    supplier: {
        sheikhaNative: ['vendor_id', 'name_en', 'name_ar', 'country', 'hs_codes', 'certifications', 'contact_email', 'payment_terms', 'credit_limit'],
        oracle_mapping: { vendor_id: 'SupplierId', name_en: 'Supplier', country: 'CountryCode' },
        sap_mapping: { vendor_id: 'BusinessPartner', name_en: 'BusinessPartnerFullName', country: 'CountryRegion' },
        dynamics_mapping: { vendor_id: 'accountid', name_en: 'name', country: 'address1_country' }
    },
    shipment: {
        sheikhaNative: ['shipment_id', 'origin', 'destination', 'carrier', 'mode', 'status', 'eta', 'tracking_number', 'documents'],
        oracle_mapping: { shipment_id: 'ShipmentNumber', tracking_number: 'TrackingNumber', status: 'ShipmentStatus' },
        sap_mapping: { shipment_id: 'Shipment', tracking_number: 'ExternalIdentification', status: 'ShipmentProcedure' },
        dynamics_mapping: { shipment_id: 'msdyn_shipmentid', tracking_number: 'msdyn_trackingnumber', status: 'statuscode' }
    },
    invoice: {
        sheikhaNative: ['invoice_id', 'po_reference', 'vendor_id', 'invoice_date', 'due_date', 'line_items', 'subtotal', 'tax', 'total', 'currency', 'payment_status'],
        oracle_mapping: { invoice_id: 'InvoiceNumber', po_reference: 'PONumber', total: 'InvoiceAmount' },
        sap_mapping: { invoice_id: 'SupplierInvoiceIDByInvcgParty', po_reference: 'PurchaseOrder', total: 'InvoiceGrossAmount' },
        dynamics_mapping: { invoice_id: 'invoicenumber', po_reference: 'purchaseordernumber', total: 'totalamount' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Hub Engine
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaERPIntegrationHub extends EventEmitter {
    constructor() {
        super();
        this.connectors = ERP_CONNECTORS;
        this.dataModels = INTEGRATION_DATA_MODELS;
        this._connections = new Map();     // active ERP connections per tenant
        this._messageQueue = [];           // outbound messages queue
        this._auditLog = [];               // audit trail
        this._webhookRegistry = new Map(); // registered webhooks
        this._ediPartners = new Map();     // EDI trading partners
    }

    /**
     * تسجيل اتصال ERP لمستأجر (Tenant)
     */
    registerERPConnection(tenantId, erpType, config) {
        const connector = this.connectors[erpType];
        if (!connector) {
            return { success: false, error: `نوع ERP غير مدعوم: ${erpType}` };
        }

        const connection = {
            id: `conn_${tenantId}_${erpType}_${Date.now()}`,
            tenantId,
            erpType,
            connectorName: connector.nameAr,
            config: {
                baseUrl: config.baseUrl,
                authType: config.authType || 'oauth2',
                credentials: { ...config.credentials }, // stored encrypted in production
                syncEntities: config.syncEntities || ['purchaseOrders', 'suppliers', 'invoices'],
                syncFrequency: config.syncFrequency || 'realtime'
            },
            status: 'active',
            lastSync: null,
            createdAt: new Date().toISOString()
        };

        this._connections.set(connection.id, connection);
        this._logAudit('connection_registered', { tenantId, erpType, connectionId: connection.id });
        this.emit('erp:connected', { tenantId, erpType });

        return { success: true, connectionId: connection.id, connection };
    }

    /**
     * إنشاء أمر شراء في ERP خارجي
     */
    async pushPurchaseOrder(connectionId, poData) {
        const connection = this._connections.get(connectionId);
        if (!connection) return { success: false, error: 'اتصال غير موجود' };

        const mapped = this._mapData('purchaseOrder', poData, connection.erpType);
        const result = await this._callERPAPI(connection, 'purchaseOrders', 'POST', mapped);

        this._logAudit('po_pushed', { connectionId, poNumber: poData.po_number, result: result.success });
        this.emit('erp:po_synced', { connectionId, poData, result });

        return result;
    }

    /**
     * سحب الفواتير من ERP خارجي
     */
    async pullInvoices(connectionId, filters = {}) {
        const connection = this._connections.get(connectionId);
        if (!connection) return { success: false, error: 'اتصال غير موجود' };

        const result = await this._callERPAPI(connection, 'invoices', 'GET', null, filters);
        if (result.success && result.data) {
            const mapped = result.data.map(inv => this._reverseMapData('invoice', inv, connection.erpType));
            return { success: true, invoices: mapped, count: mapped.length };
        }
        return result;
    }

    /**
     * مزامنة الموردين من ERP
     */
    async syncSuppliers(connectionId) {
        const connection = this._connections.get(connectionId);
        if (!connection) return { success: false, error: 'اتصال غير موجود' };

        const result = await this._callERPAPI(connection, 'suppliers', 'GET');
        if (result.success && result.data) {
            const mapped = result.data.map(s => this._reverseMapData('supplier', s, connection.erpType));
            connection.lastSync = new Date().toISOString();
            this.emit('erp:suppliers_synced', { connectionId, count: mapped.length });
            return { success: true, suppliers: mapped, count: mapped.length };
        }
        return result;
    }

    /**
     * تسجيل Webhook
     */
    registerWebhook(tenantId, config) {
        const id = `wh_${tenantId}_${Date.now()}`;
        const webhook = {
            id,
            tenantId,
            targetUrl: config.targetUrl,
            events: config.events || ['po.created', 'shipment.updated', 'invoice.approved'],
            secret: config.secret || this._generateSecret(),
            active: true,
            deliveryCount: 0,
            failureCount: 0,
            createdAt: new Date().toISOString()
        };
        this._webhookRegistry.set(id, webhook);
        return { success: true, webhookId: id, webhook };
    }

    /**
     * إطلاق حدث Webhook
     */
    async triggerWebhook(event, data) {
        const webhooks = Array.from(this._webhookRegistry.values())
            .filter(wh => wh.active && wh.events.includes(event));

        const results = await Promise.allSettled(
            webhooks.map(wh => this._deliverWebhook(wh, event, data))
        );

        return results.map((r, i) => ({
            webhookId: webhooks[i].id,
            success: r.status === 'fulfilled',
            result: r.status === 'fulfilled' ? r.value : r.reason
        }));
    }

    /**
     * إدارة شريك EDI
     */
    registerEDIPartner(tenantId, partnerData) {
        const id = `edi_${tenantId}_${Date.now()}`;
        const partner = {
            id,
            tenantId,
            partnerName: partnerData.name,
            interchangeId: partnerData.interchangeId,
            protocol: partnerData.protocol || 'AS2',
            standard: partnerData.standard || 'EDIFACT',
            supportedDocuments: partnerData.documents || ['ORDERS', 'INVOIC', 'DESADV'],
            connectionConfig: partnerData.connectionConfig || {},
            active: true,
            createdAt: new Date().toISOString()
        };
        this._ediPartners.set(id, partner);
        this.emit('edi:partner_registered', { tenantId, partnerId: id });
        return { success: true, partnerId: id, partner };
    }

    /**
     * معالجة رسالة EDI واردة
     */
    processInboundEDI(partnerId, rawMessage, standard = 'EDIFACT') {
        const partner = this._ediPartners.get(partnerId);
        if (!partner) return { success: false, error: 'شريك EDI غير موجود' };

        const parsed = this._parseEDIMessage(rawMessage, standard);
        const sheikhaData = this._transformEDIToSheikha(parsed, standard);

        this._logAudit('edi_received', { partnerId, documentType: parsed.documentType });
        this.emit('edi:message_received', { partnerId, documentType: parsed.documentType, data: sheikhaData });

        return { success: true, documentType: parsed.documentType, data: sheikhaData };
    }

    /**
     * توليد رسالة EDI صادرة
     */
    generateOutboundEDI(tenantId, partnerId, documentType, data) {
        const partner = this._ediPartners.get(partnerId);
        if (!partner) return { success: false, error: 'شريك EDI غير موجود' };

        const ediMessage = this._buildEDIMessage(documentType, data, partner.standard);

        this._logAudit('edi_sent', { tenantId, partnerId, documentType });
        this.emit('edi:message_sent', { tenantId, partnerId, documentType });

        return { success: true, message: ediMessage, partnerId, documentType };
    }

    /**
     * الحصول على سجل التدقيق
     */
    getAuditLog(filters = {}) {
        let log = [...this._auditLog];
        if (filters.tenantId) log = log.filter(e => e.tenantId === filters.tenantId);
        if (filters.event) log = log.filter(e => e.event === filters.event);
        if (filters.from) log = log.filter(e => new Date(e.timestamp) >= new Date(filters.from));
        return log.slice(-1000); // آخر 1000 حدث
    }

    /**
     * الحصول على إحصائيات التكامل
     */
    getIntegrationStats(tenantId) {
        const connections = Array.from(this._connections.values())
            .filter(c => !tenantId || c.tenantId === tenantId);
        const webhooks = Array.from(this._webhookRegistry.values())
            .filter(w => !tenantId || w.tenantId === tenantId);
        const ediPartners = Array.from(this._ediPartners.values())
            .filter(p => !tenantId || p.tenantId === tenantId);

        return {
            totalConnections: connections.length,
            activeConnections: connections.filter(c => c.status === 'active').length,
            erpTypes: [...new Set(connections.map(c => c.erpType))],
            webhooks: { total: webhooks.length, active: webhooks.filter(w => w.active).length },
            ediPartners: { total: ediPartners.length, active: ediPartners.filter(p => p.active).length },
            auditEvents: this._auditLog.filter(e => !tenantId || e.tenantId === tenantId).length,
            supportedConnectors: Object.keys(this.connectors)
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    _mapData(entity, data, erpType) {
        const model = this.dataModels[entity];
        if (!model) return data;
        const mapping = model[`${erpType.replace('_fusion', '').replace('sap_s4hana', 'sap')}_mapping`] || {};
        const result = {};
        Object.entries(data).forEach(([key, val]) => {
            result[mapping[key] || key] = val;
        });
        return result;
    }

    _reverseMapData(entity, data, erpType) {
        const model = this.dataModels[entity];
        if (!model) return data;
        const mapping = model[`${erpType.replace('_fusion', '').replace('sap_s4hana', 'sap')}_mapping`] || {};
        const reverseMapping = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));
        const result = {};
        Object.entries(data).forEach(([key, val]) => {
            result[reverseMapping[key] || key] = val;
        });
        return result;
    }

    async _callERPAPI(connection, endpoint, method, body = null, params = {}) {
        // في الإنتاج: إرسال طلب HTTP فعلي مع OAuth token
        // هنا نُحاكي الاستجابة
        return {
            success: true,
            data: [],
            message: `${method} ${endpoint} → ${connection.erpType} (simulated)`,
            timestamp: new Date().toISOString()
        };
    }

    async _deliverWebhook(webhook, event, data) {
        // في الإنتاج: إرسال POST لـ webhook.targetUrl
        webhook.deliveryCount++;
        return { delivered: true, webhookId: webhook.id, event };
    }

    _parseEDIMessage(rawMessage, standard) {
        return {
            standard,
            documentType: 'ORDERS',
            parsed: true,
            segments: [],
            messageRef: `MSG-${Date.now()}`
        };
    }

    _transformEDIToSheikha(parsed, standard) {
        return { ...parsed, sheikhaFormat: true, transformedAt: new Date().toISOString() };
    }

    _buildEDIMessage(documentType, data, standard) {
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
        if (standard === 'EDIFACT') {
            return `UNA:+.? '\nUNB+UNOA:1+SHEIKHA:1+PARTNER:1+${timestamp}:1234+1'\nUNH+1+${documentType}:D:96A:UN'\nUNZ+1+1'`;
        }
        return `ISA*00*          *00*          *ZZ*SHEIKHA        *ZZ*PARTNER        *${timestamp}*1234*^*00501*000000001*0*P*>\nST*${documentType}*0001\nSE*2*0001\nIEA*1*000000001`;
    }

    _generateSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let secret = '';
        for (let i = 0; i < 32; i++) secret += chars.charAt(Math.floor(Math.random() * chars.length));
        return secret;
    }

    _logAudit(event, data = {}) {
        this._auditLog.push({
            event,
            ...data,
            timestamp: new Date().toISOString()
        });
        if (this._auditLog.length > 10000) this._auditLog.shift();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════════════════

const integrationHub = new SheikhaERPIntegrationHub();

module.exports = {
    ERP_CONNECTORS,
    INTEGRATION_DATA_MODELS,
    SheikhaERPIntegrationHub,
    integrationHub,
    getAllConnectors: () => Object.values(ERP_CONNECTORS).map(c => ({
        id: c.id, nameAr: c.nameAr, nameEn: c.nameEn, icon: c.icon, description: c.description
    })),
    getConnector: (id) => ERP_CONNECTORS[id] || null,
    registerERPConnection: (tid, type, cfg) => integrationHub.registerERPConnection(tid, type, cfg),
    registerWebhook: (tid, cfg) => integrationHub.registerWebhook(tid, cfg),
    triggerWebhook: (event, data) => integrationHub.triggerWebhook(event, data),
    getIntegrationStats: (tid) => integrationHub.getIntegrationStats(tid),
    getAuditLog: (filters) => integrationHub.getAuditLog(filters)
};
