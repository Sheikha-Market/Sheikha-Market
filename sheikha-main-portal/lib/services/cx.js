// lib/services/cx.js
// مبسط: إدارة تجربة العملاء (tickets, feedback)

class CX {
    constructor() {
        this.tickets = new Map();
        this.counter = 1;
    }

    createTicket({customerId, type, message}){
        const id = `t-${this.counter++}`;
        const t = {id, customerId, type, message, status:'open', createdAt:Date.now()};
        this.tickets.set(id, t);
        return t;
    }

    closeTicket(id) {
        const t = this.tickets.get(id);
        if(!t) throw new Error('Ticket not found');
        t.status = 'closed';
        t.closedAt = Date.now();
        return t;
    }
}

module.exports = CX;
