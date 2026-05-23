// lib/services/erp.js
// مبسط: واجهة ERP (Orders, Invoicing, Accounting) - نموذج تجريبي

class ERP {
    constructor() {
        this.orders = new Map();
        this.invoices = new Map();
    }

    createOrder(order) {
        // order: {id, buyer, items, total}
        this.orders.set(order.id, {...order, status:'created', createdAt: Date.now()});
        return this.orders.get(order.id);
    }

    getOrder(id) {
        return this.orders.get(id) || null;
    }

    createInvoice(orderId) {
        const order = this.getOrder(orderId);
        if(!order) throw new Error('Order not found');
        const invoice = {id: `inv-${orderId}`, orderId, total: order.total, issuedAt: Date.now(), paid:false};
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }

    payInvoice(invoiceId) {
        const inv = this.invoices.get(invoiceId);
        if(!inv) throw new Error('Invoice not found');
        inv.paid = true;
        inv.paidAt = Date.now();
        return inv;
    }
}

module.exports = ERP;
