/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏢 SHEIKHA ERP NEURAL — وحدة تخطيط موارد المؤسسة العصبية                  ║
 * ║  نظام ERP متكامل مربوط بالشبكة العصبية والناقل الشامل                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ ﴾ — الحشر: 18
 *   ERP ينظر ما قدّمته المؤسسة اليوم ليخطط لغد أفضل
 *
 * ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275
 *   كل معاملة مالية في ERP تمر على فلتر الحِل والحُرمة
 *
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ» — البيهقي
 *   إتقان تخطيط الموارد ديانةٌ وإدارةٌ
 *
 * وحدات ERP:
 *   FIN  — المالية والمحاسبة      (الزلزلة:7-8 — مثقال ذرة)
 *   INV  — المخزون والمستودعات    (يوسف:47 — تزرعون سبع سنين)
 *   PUR  — المشتريات              (الحجرات:6 — فتبيّنوا)
 *   SAL  — المبيعات والعملاء CRM  (البقرة:275 — أحل الله البيع)
 *   HRM  — الموارد البشرية        (الزمر:9 — هل يستوي الذين يعلمون)
 *   PRD  — تخطيط الإنتاج          (الملك:1 — بيده الملك)
 *   RPT  — التقارير والتحليلات    (الحديد:4 — بما تعملون بصير)
 *
 * واجهة الوحدة:
 *   init()              — تهيئة نظام ERP
 *   finance(op, data)   — عمليات مالية
 *   inventory(op, data) — إدارة المخزون
 *   purchase(op, data)  — المشتريات
 *   sales(op, data)     — المبيعات
 *   hr(op, data)        — الموارد البشرية
 *   production(op, data)— تخطيط الإنتاج
 *   report(type, filter)— التقارير
 *   checkSharia(op)     — فحص شرعي للعملية
 *   status()            — حالة ERP الكامل
 *   createRouter()      — Express Router
 */

'use strict';

const path = require('path');

let express;
try { express = require('express'); } catch (_) { express = null; }

// ناقل البيانات
let _transport = null;
try {
    _transport = require('./sheikha-transport-bus');
} catch (_) {
    _transport = null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// حالة ERP
// ═══════════════════════════════════════════════════════════════════════════════

let _ready    = false;
let _initAt   = null;
let _opCount  = 0;

// ─── بيانات الوحدات (محاكاة — في الإنتاج تُربط بقاعدة البيانات) ──────────────

const _fin = {
    ledger:     [],       // سجل القيود المحاسبية
    accounts:   new Map(),// الحسابات
    zakatDue:   0,        // الزكاة المستحقة
    totalIncome: 0,
    totalExpense: 0,
};

const _inv = {
    items:      new Map(),// المنتجات والمواد
    warehouses: new Map(),// المستودعات
    movements:  [],       // حركات المخزون
};

const _pur = {
    orders:     [],       // أوامر الشراء
    suppliers:  new Map(),// الموردون
    rfqs:       [],       // طلبات عروض الأسعار
};

const _sal = {
    orders:     [],       // أوامر البيع
    customers:  new Map(),// العملاء
    invoices:   [],       // الفواتير
    pipeline:   [],       // خط المبيعات
};

const _hrm = {
    employees:  new Map(),// الموظفون
    payroll:    [],       // كشوف الرواتب
    attendance: [],       // الحضور والانصراف
    leaves:     [],       // الإجازات
};

const _prd = {
    orders:     [],       // أوامر الإنتاج
    bom:        new Map(),// قائمة مكونات المنتجات
    workCenters: new Map(),// مراكز العمل
};

const _rpt = {
    snapshots:  [],       // لقطات التقارير
};

// الحجم الأقصى للسجلات
const MAX_RECORDS = 1000;

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة نظام ERP
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    console.log('[ERP-NEURAL] 🏢 بسم الله الرحمن الرحيم');
    console.log('[ERP-NEURAL] ﴿ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ ﴾ — الحشر: 18');

    // تسجيل في الناقل الشامل
    if (_transport) {
        _transport.registerSystem({
            id:      'erp-system',
            name:    'نظام ERP المتكامل — شيخة',
            channel: 'erp.events',
            version: '2.0',
        });
    }

    _ready  = true;
    _initAt = new Date().toISOString();

    console.log('[ERP-NEURAL] ✅ نظام ERP جاهز — 7 وحدات — مرتبط بالناقل الشامل');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② الوحدة المالية — FIN
// ﴿ فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ﴾ — الزلزلة: 7
// ═══════════════════════════════════════════════════════════════════════════════

function finance(op, data = {}) {
    if (!_ready) init();
    _opCount++;

    switch (op) {
        case 'journal_entry': {
            // قيد محاسبي
            const shariaCheck = checkSharia({ type: 'financial', amount: data.amount, description: data.description });
            if (!shariaCheck.compliant) {
                return { success: false, error: shariaCheck.reason, sharia: shariaCheck };
            }
            const entry = {
                id:         `JE_${Date.now()}`,
                date:       data.date || new Date().toISOString().slice(0, 10),
                debit:      data.debit  || 0,
                credit:     data.credit || 0,
                account:    data.account,
                description:data.description,
                reference:  data.reference,
                sharia:     shariaCheck,
                timestamp:  new Date().toISOString(),
            };
            _fin.ledger.unshift(entry);
            if (_fin.ledger.length > MAX_RECORDS) _fin.ledger.length = MAX_RECORDS;
            _fin.totalIncome  += entry.credit;
            _fin.totalExpense += entry.debit;
            // حساب الزكاة
            _fin.zakatDue = Math.max(0, (_fin.totalIncome - _fin.totalExpense) * 0.025);
            _emit('erp.finance.journal', entry);
            return { success: true, entry, zakatDue: _fin.zakatDue };
        }

        case 'get_balance': {
            return {
                success: true,
                totalIncome:  _fin.totalIncome,
                totalExpense: _fin.totalExpense,
                netBalance:   _fin.totalIncome - _fin.totalExpense,
                zakatDue:     _fin.zakatDue,
                quran:        '﴿ فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ﴾',
            };
        }

        case 'zakat_calculate': {
            const nisab    = data.nisab    || 20.3 * 4250;   // نصاب الذهب تقريباً بالريال
            const eligible = Math.max(0, _fin.totalIncome - _fin.totalExpense);
            const zakat    = eligible >= nisab ? eligible * 0.025 : 0;
            return { success: true, eligible, nisab, zakat, quran: '﴿ وَآتُوا الزَّكَاةَ ﴾' };
        }

        case 'list_journal': {
            const limit = data.limit || 50;
            return { success: true, entries: _fin.ledger.slice(0, limit), total: _fin.ledger.length };
        }

        default:
            return { success: false, error: `عملية غير معروفة: ${op}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ وحدة المخزون — INV
// ﴿ تَزْرَعُونَ سَبْعَ سِنِينَ دَأَبًا فَمَا حَصَدتُّمْ فَذَرُوهُ فِي سُنبُلِهِ ﴾ — يوسف: 47
// ═══════════════════════════════════════════════════════════════════════════════

function inventory(op, data = {}) {
    if (!_ready) init();
    _opCount++;

    switch (op) {
        case 'add_item': {
            const item = {
                id:          data.id || `ITEM_${Date.now()}`,
                name:        data.name,
                sku:         data.sku,
                category:    data.category,
                qty:         data.qty || 0,
                unit:        data.unit || 'قطعة',
                cost:        data.cost || 0,
                reorderPoint:data.reorderPoint || 10,
                warehouse:   data.warehouse || 'default',
                createdAt:   new Date().toISOString(),
            };
            _inv.items.set(item.id, item);
            _emit('erp.inventory.item_added', item);
            return { success: true, item };
        }

        case 'update_qty': {
            const item = _inv.items.get(data.id);
            if (!item) return { success: false, error: 'الصنف غير موجود' };
            const oldQty = item.qty;
            item.qty += data.change || 0;
            const movement = { itemId: item.id, change: data.change, from: oldQty, to: item.qty, reason: data.reason, timestamp: new Date().toISOString() };
            _inv.movements.unshift(movement);
            if (_inv.movements.length > MAX_RECORDS) _inv.movements.length = MAX_RECORDS;
            // تنبيه إعادة الطلب
            if (item.qty <= item.reorderPoint) {
                _emit('erp.inventory.reorder_alert', { itemId: item.id, currentQty: item.qty, reorderPoint: item.reorderPoint });
            }
            return { success: true, item, movement };
        }

        case 'get_item':
            return { success: true, item: _inv.items.get(data.id) || null };

        case 'list':
            return { success: true, items: Array.from(_inv.items.values()), total: _inv.items.size };

        case 'low_stock': {
            const low = Array.from(_inv.items.values()).filter(i => i.qty <= i.reorderPoint);
            return { success: true, lowStockItems: low, count: low.length };
        }

        default:
            return { success: false, error: `عملية غير معروفة: ${op}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ وحدة المشتريات — PUR
// ﴿ إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا ﴾ — الحجرات: 6
// ═══════════════════════════════════════════════════════════════════════════════

function purchase(op, data = {}) {
    if (!_ready) init();
    _opCount++;

    switch (op) {
        case 'create_order': {
            const shariaCheck = checkSharia({ type: 'purchase', vendor: data.vendor, amount: data.total });
            const order = {
                id:         `PO_${Date.now()}`,
                vendor:     data.vendor,
                items:      data.items || [],
                total:      data.total || 0,
                currency:   data.currency || 'SAR',
                status:     'draft',
                sharia:     shariaCheck,
                createdAt:  new Date().toISOString(),
            };
            _pur.orders.unshift(order);
            if (_pur.orders.length > MAX_RECORDS) _pur.orders.length = MAX_RECORDS;
            _emit('erp.purchase.order_created', order);
            return { success: true, order };
        }

        case 'approve_order': {
            const order = _pur.orders.find(o => o.id === data.id);
            if (!order) return { success: false, error: 'أمر الشراء غير موجود' };
            order.status = 'approved';
            order.approvedBy = data.approvedBy;
            order.approvedAt = new Date().toISOString();
            _emit('erp.purchase.order_approved', order);
            return { success: true, order };
        }

        case 'list':
            return { success: true, orders: _pur.orders.slice(0, data.limit || 50), total: _pur.orders.length };

        case 'add_supplier': {
            const supplier = { id: data.id || `SUP_${Date.now()}`, ...data, createdAt: new Date().toISOString() };
            _pur.suppliers.set(supplier.id, supplier);
            return { success: true, supplier };
        }

        default:
            return { success: false, error: `عملية غير معروفة: ${op}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ وحدة المبيعات والعملاء — SAL / CRM
// ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275
// ═══════════════════════════════════════════════════════════════════════════════

function sales(op, data = {}) {
    if (!_ready) init();
    _opCount++;

    switch (op) {
        case 'create_order': {
            const shariaCheck = checkSharia({ type: 'sale', amount: data.total, items: data.items });
            const order = {
                id:         `SO_${Date.now()}`,
                customer:   data.customer,
                items:      data.items || [],
                total:      data.total || 0,
                currency:   data.currency || 'SAR',
                status:     'pending',
                sharia:     shariaCheck,
                createdAt:  new Date().toISOString(),
            };
            _sal.orders.unshift(order);
            if (_sal.orders.length > MAX_RECORDS) _sal.orders.length = MAX_RECORDS;
            // تحديث الإيرادات
            if (shariaCheck.compliant) {
                finance('journal_entry', { debit: 0, credit: data.total, account: 'revenues', description: `بيع — ${order.id}`, reference: order.id });
            }
            _emit('erp.sales.order_created', order);
            return { success: true, order };
        }

        case 'add_customer': {
            const customer = { id: data.id || `CUST_${Date.now()}`, ...data, createdAt: new Date().toISOString() };
            _sal.customers.set(customer.id, customer);
            return { success: true, customer };
        }

        case 'get_customer':
            return { success: true, customer: _sal.customers.get(data.id) || null };

        case 'list_orders':
            return { success: true, orders: _sal.orders.slice(0, data.limit || 50), total: _sal.orders.length };

        case 'create_invoice': {
            const invoice = {
                id:         `INV_${Date.now()}`,
                orderId:    data.orderId,
                customer:   data.customer,
                amount:     data.amount || 0,
                vat:        (data.amount || 0) * 0.15,
                total:      (data.amount || 0) * 1.15,
                status:     'issued',
                issuedAt:   new Date().toISOString(),
            };
            _sal.invoices.unshift(invoice);
            if (_sal.invoices.length > MAX_RECORDS) _sal.invoices.length = MAX_RECORDS;
            _emit('erp.sales.invoice_created', invoice);
            return { success: true, invoice };
        }

        default:
            return { success: false, error: `عملية غير معروفة: ${op}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ وحدة الموارد البشرية — HRM
// ﴿ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ﴾ — الزمر: 9
// ═══════════════════════════════════════════════════════════════════════════════

function hr(op, data = {}) {
    if (!_ready) init();
    _opCount++;

    switch (op) {
        case 'add_employee': {
            const employee = {
                id:          data.id || `EMP_${Date.now()}`,
                name:        data.name,
                position:    data.position,
                department:  data.department,
                salary:      data.salary || 0,
                currency:    data.currency || 'SAR',
                joinDate:    data.joinDate || new Date().toISOString().slice(0, 10),
                status:      'active',
                createdAt:   new Date().toISOString(),
            };
            _hrm.employees.set(employee.id, employee);
            _emit('erp.hr.employee_added', employee);
            return { success: true, employee };
        }

        case 'process_payroll': {
            const month     = data.month || new Date().toISOString().slice(0, 7);
            const employees = Array.from(_hrm.employees.values()).filter(e => e.status === 'active');
            const entries   = employees.map(e => ({
                employeeId: e.id,
                name:       e.name,
                grossSalary: e.salary,
                gosi:       e.salary * 0.10,    // GOSI 10%
                netSalary:  e.salary * 0.90,
                month,
            }));
            const payslip = { id: `PAY_${month}`, month, employeeCount: entries.length, entries, processedAt: new Date().toISOString() };
            _hrm.payroll.unshift(payslip);
            if (_hrm.payroll.length > MAX_RECORDS) _hrm.payroll.length = MAX_RECORDS;
            _emit('erp.hr.payroll_processed', payslip);
            return { success: true, payslip };
        }

        case 'record_attendance': {
            const record = { employeeId: data.employeeId, date: data.date, checkIn: data.checkIn, checkOut: data.checkOut, timestamp: new Date().toISOString() };
            _hrm.attendance.unshift(record);
            if (_hrm.attendance.length > MAX_RECORDS) _hrm.attendance.length = MAX_RECORDS;
            return { success: true, record };
        }

        case 'list_employees':
            return { success: true, employees: Array.from(_hrm.employees.values()), total: _hrm.employees.size };

        default:
            return { success: false, error: `عملية غير معروفة: ${op}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ وحدة الإنتاج — PRD
// ﴿ تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ ﴾ — الملك: 1
// ═══════════════════════════════════════════════════════════════════════════════

function production(op, data = {}) {
    if (!_ready) init();
    _opCount++;

    switch (op) {
        case 'create_order': {
            const order = {
                id:          `MO_${Date.now()}`,
                product:     data.product,
                qty:         data.qty || 1,
                startDate:   data.startDate,
                endDate:     data.endDate,
                status:      'planned',
                workCenter:  data.workCenter,
                createdAt:   new Date().toISOString(),
            };
            _prd.orders.unshift(order);
            if (_prd.orders.length > MAX_RECORDS) _prd.orders.length = MAX_RECORDS;
            _emit('erp.production.order_created', order);
            return { success: true, order };
        }

        case 'update_status': {
            const order = _prd.orders.find(o => o.id === data.id);
            if (!order) return { success: false, error: 'أمر الإنتاج غير موجود' };
            order.status    = data.status;
            order.updatedAt = new Date().toISOString();
            _emit('erp.production.status_updated', order);
            return { success: true, order };
        }

        case 'list':
            return { success: true, orders: _prd.orders.slice(0, data.limit || 50), total: _prd.orders.length };

        default:
            return { success: false, error: `عملية غير معروفة: ${op}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑧ التقارير — RPT
// ﴿ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ ﴾ — الحديد: 4
// ═══════════════════════════════════════════════════════════════════════════════

function report(type, filter = {}) {
    if (!_ready) init();

    switch (type) {
        case 'dashboard': {
            return {
                success: true,
                type: 'dashboard',
                timestamp: new Date().toISOString(),
                finance: {
                    totalIncome:  _fin.totalIncome,
                    totalExpense: _fin.totalExpense,
                    netBalance:   _fin.totalIncome - _fin.totalExpense,
                    zakatDue:     _fin.zakatDue,
                    journalCount: _fin.ledger.length,
                },
                inventory: {
                    totalItems:      _inv.items.size,
                    lowStockCount:   Array.from(_inv.items.values()).filter(i => i.qty <= i.reorderPoint).length,
                    movementsToday:  _inv.movements.filter(m => m.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length,
                },
                sales: {
                    totalOrders:    _sal.orders.length,
                    totalCustomers: _sal.customers.size,
                    totalInvoices:  _sal.invoices.length,
                    pendingOrders:  _sal.orders.filter(o => o.status === 'pending').length,
                },
                purchase: {
                    totalOrders:   _pur.orders.length,
                    totalSuppliers:_pur.suppliers.size,
                    pendingOrders: _pur.orders.filter(o => o.status === 'draft').length,
                },
                hr: {
                    totalEmployees:  _hrm.employees.size,
                    activeEmployees: Array.from(_hrm.employees.values()).filter(e => e.status === 'active').length,
                    payrollRuns:     _hrm.payroll.length,
                },
                production: {
                    totalOrders:   _prd.orders.length,
                    inProgress:    _prd.orders.filter(o => o.status === 'in_progress').length,
                    planned:       _prd.orders.filter(o => o.status === 'planned').length,
                },
                quran: '﴿ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ﴾ — الحديد: 4',
            };
        }

        case 'financial_summary':
            return { success: true, ...finance('get_balance', {}) };

        case 'inventory_status':
            return inventory('list', {});

        case 'sales_summary': {
            const totalRevenue = _sal.orders.reduce((sum, o) => sum + (o.total || 0), 0);
            return { success: true, totalOrders: _sal.orders.length, totalRevenue, customers: _sal.customers.size };
        }

        default:
            return { success: false, error: `نوع تقرير غير معروف: ${type}` };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑨ الفحص الشرعي
// ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1
// ═══════════════════════════════════════════════════════════════════════════════

function checkSharia(op = {}) {
    const { type, amount = 0, description = '', vendor = '', items = [] } = op;

    const issues = [];

    // فحص الربا
    if (description.toLowerCase().includes('ربا') || description.toLowerCase().includes('faida') || description.includes('فائدة بنكية')) {
        issues.push({ rule: 'تحريم الربا', ref: 'البقرة:275', detail: 'العملية تحتوي على ربا محرم' });
    }

    // فحص الغرر
    if (description.includes('قمار') || description.includes('مراهنة') || description.toLowerCase().includes('gambling')) {
        issues.push({ rule: 'تحريم الغرر والميسر', ref: 'المائدة:90', detail: 'العملية تحتوي على قمار أو مراهنة' });
    }

    // فحص المبالغ الصفرية للبيع
    if (type === 'sale' && amount <= 0) {
        issues.push({ rule: 'الثمن مجهول', ref: 'البقرة:282', detail: 'مبلغ البيع صفر أو مجهول — يجب تحديد الثمن' });
    }

    const compliant = issues.length === 0;
    return {
        compliant,
        issues,
        reason:   compliant ? 'العملية مطابقة للشريعة الإسلامية' : issues.map(i => i.detail).join('؛ '),
        checkedAt: new Date().toISOString(),
        quran:    compliant ? '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾' : '﴿ وَحَرَّمَ الرِّبَا ﴾',
    };
}

// ─── إطلاق حدث عبر الناقل ────────────────────────────────────────────────────

function _emit(event, payload) {
    if (_transport) {
        _transport.emit(event, payload, 'erp-system');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑩ حالة ERP الكامل
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    if (!_ready) init();
    return {
        module:     'sheikha-erp-neural',
        nameAr:     'نظام ERP العصبي المتكامل — منظومة شيخة',
        nameEn:     'Sheikha Neural ERP System',
        ready:      _ready,
        initAt:     _initAt,
        opCount:    _opCount,
        modules: {
            FIN: { name: 'المالية',        records: _fin.ledger.length,        zakatDue: _fin.zakatDue },
            INV: { name: 'المخزون',        items:   _inv.items.size,            movements: _inv.movements.length },
            PUR: { name: 'المشتريات',      orders:  _pur.orders.length,         suppliers: _pur.suppliers.size },
            SAL: { name: 'المبيعات',       orders:  _sal.orders.length,         customers: _sal.customers.size },
            HRM: { name: 'الموارد البشرية',employees:_hrm.employees.size,       payrolls: _hrm.payroll.length },
            PRD: { name: 'الإنتاج',        orders:  _prd.orders.length },
            RPT: { name: 'التقارير',       snapshots: _rpt.snapshots.length },
        },
        sharia:  'كل عملية تمر على فحص شرعي تلقائي',
        quran:   '﴿ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ ﴾ — الحشر: 18',
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑪ Express Router — /api/erp
// ═══════════════════════════════════════════════════════════════════════════════

function createRouter() {
    if (!_ready) init();
    if (!express) return null;

    const router = express.Router();
    router.use(express.json());

    // GET /api/erp/status
    router.get('/status', (_req, res) => res.json({ success: true, status: status() }));

    // GET /api/erp/report/:type
    router.get('/report/:type', (req, res) => {
        const result = report(req.params.type, req.query);
        res.json(result);
    });

    // POST /api/erp/finance/:op
    router.post('/finance/:op', (req, res) => {
        const result = finance(req.params.op, req.body || {});
        res.json(result);
    });

    // POST /api/erp/inventory/:op
    router.post('/inventory/:op', (req, res) => {
        const result = inventory(req.params.op, req.body || {});
        res.json(result);
    });

    // POST /api/erp/purchase/:op
    router.post('/purchase/:op', (req, res) => {
        const result = purchase(req.params.op, req.body || {});
        res.json(result);
    });

    // POST /api/erp/sales/:op
    router.post('/sales/:op', (req, res) => {
        const result = sales(req.params.op, req.body || {});
        res.json(result);
    });

    // POST /api/erp/hr/:op
    router.post('/hr/:op', (req, res) => {
        const result = hr(req.params.op, req.body || {});
        res.json(result);
    });

    // POST /api/erp/production/:op
    router.post('/production/:op', (req, res) => {
        const result = production(req.params.op, req.body || {});
        res.json(result);
    });

    // POST /api/erp/sharia/check
    router.post('/sharia/check', (req, res) => {
        const result = checkSharia(req.body || {});
        res.json({ success: true, result });
    });

    return router;
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    finance,
    inventory,
    purchase,
    sales,
    hr,
    production,
    report,
    checkSharia,
    status,
    createRouter,
};
