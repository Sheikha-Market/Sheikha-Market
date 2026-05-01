// examples/market-demo.js
// Demo: flow from order -> invoice -> reserve -> create shipment -> track

const ERP = require('../lib/services/erp');
const SCM = require('../lib/services/scm');
const Logistics = require('../lib/services/logistics');
const Tracking = require('../lib/services/tracking');

const erp = new ERP();
const scm = new SCM();
const logistics = new Logistics();
const tracking = new Tracking();

// seed inventory
scm.addSKU('GOLD-1KG', 20);

// create order
const order = erp.createOrder({id:'ord-1001', buyer:'buyer1', items:[{sku:'GOLD-1KG', qty:2}], total:120000});
console.log('Order created:', order);

// reserve SKU
try{
    scm.reserveSKU('GOLD-1KG', 2);
    console.log('Reserved 2 x GOLD-1KG');
}catch(e){ console.error('Reserve failed:', e.message); }

// invoice
const inv = erp.createInvoice(order.id);
console.log('Invoice issued:', inv);

// create shipment
const ship = logistics.createShipment({id:'sh-5001', orderId:order.id, from:'Riyadh', to:'Jeddah', carrier:'SheikhaLog'});
console.log('Shipment created:', ship);

// push tracking points
tracking.pushPosition(ship.id, 24.7136, 46.6753);
tracking.pushPosition(ship.id, 24.7743, 46.7386);
console.log('Tracking path:', tracking.getPath(ship.id));

console.log('Demo finished.');
