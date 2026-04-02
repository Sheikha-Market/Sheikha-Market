/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — محرك WebSocket للأسعار اللحظية
 * "بث أسعار المعادن والسكراب لحظةً بلحظة — عدل وشفافية"
 *
 * ﴿وَإِذَا قُلْتُمْ فَاعْدِلُوا﴾ — الأنعام:152
 * «نهى عن الغرر» — الأسعار المكشوفة تحمي من الغرر
 *
 * الهيكل:
 *   §1  CHANNEL_CONFIG         — قنوات البث
 *   §2  MessageFactory         — بناء الرسائل الإسلامية
 *   §3  PriceBuffer            — مخزن الأسعار الدائر
 *   §4  SheikhaWSClient        — اتصال عميل WebSocket
 *   §5  SheikhaWSServer        — خادم WebSocket (Node.js http)
 *   §6  SheikhaWebSocketEngine — المحرك الرئيسي
 *   §7  التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ══════════════════════════════════════════════════════════════════════════════
// §1 — CHANNEL_CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const WS_CHANNELS = {
    METALS_PRICES:  'metals-prices',   // أسعار معادن رئيسية (Cu, Fe, Al, Au…)
    SCRAP_PRICES:   'scrap-prices',    // أسعار سكراب (HMS1/2, Birch, Candy…)
    ALERTS:         'price-alerts',    // تنبيهات ارتفاع/هبوط > 3%
    SIGNALS:        'trade-signals',   // إشارات البيع والشراء (للمعرفة فقط)
    RFQ:            'rfq-updates',     // تحديثات طلبات الأسعار
    SHARIA:         'sharia-notices',  // إشعارات شرعية
    SYSTEM:         'system-status',   // حالة النظام والنبض
};

// أسعار افتراضية عند بدء التشغيل (تُحدَّث من marketIntelEngine)
const DEFAULT_PRICES = {
    Cu:    { name: 'نحاس',      price: 9200,  unit: 'USD/ton', category: 'metals' },
    Fe:    { name: 'حديد',      price: 420,   unit: 'USD/ton', category: 'metals' },
    Al:    { name: 'ألومنيوم',  price: 2350,  unit: 'USD/ton', category: 'metals' },
    Zn:    { name: 'زنك',       price: 2900,  unit: 'USD/ton', category: 'metals' },
    Pb:    { name: 'رصاص',      price: 2050,  unit: 'USD/ton', category: 'metals' },
    Ni:    { name: 'نيكل',      price: 16500, unit: 'USD/ton', category: 'metals' },
    Au:    { name: 'ذهب',       price: 2380,  unit: 'USD/oz',  category: 'metals' },
    Ag:    { name: 'فضة',       price: 29.5,  unit: 'USD/oz',  category: 'metals' },
    HMS1:  { name: 'حديد ثقيل #1', price: 490,unit: 'USD/ton', category: 'scrap' },
    HMS2:  { name: 'حديد ثقيل #2', price: 420,unit: 'USD/ton', category: 'scrap' },
    BIRCH: { name: 'نحاس Birch',price: 9.50, unit: 'USD/kg',  category: 'scrap' },
    CANDY: { name: 'نحاس Candy',price: 9.10, unit: 'USD/kg',  category: 'scrap' },
    TWITCH:{ name: 'ألوم Twitch',price: 1.38, unit: 'USD/kg', category: 'scrap' },
    ZORBA: { name: 'مختلط Zorba',price: 1.80, unit: 'USD/kg', category: 'scrap' },
};

const BROADCAST_INTERVALS = {
    prices:  5000,   // كل 5 ثوان — أسعار المعادن
    signals: 30000,  // كل 30 ثانية — إشارات التداول
    system:  60000,  // كل دقيقة — نبض النظام
};

// ══════════════════════════════════════════════════════════════════════════════
// §2 — MessageFactory
//      بناء رسائل WebSocket بتنسيق إسلامي موحد
// ══════════════════════════════════════════════════════════════════════════════

class MessageFactory {
    static header() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            platform:  'SHEIKHA — منظومة المعادن الإسلامية',
            principle: '﴿وَإِذَا قُلْتُمْ فَاعْدِلُوا﴾',
            t:         Date.now(),
        };
    }

    static priceUpdate(symbol, data, prevPrice) {
        const change    = prevPrice ? ((data.price - prevPrice) / prevPrice) * 100 : 0;
        const direction = change > 0.1 ? '↑' : change < -0.1 ? '↓' : '→';
        return {
            type:      'PRICE_UPDATE',
            channel:   data.category === 'scrap' ? WS_CHANNELS.SCRAP_PRICES : WS_CHANNELS.METALS_PRICES,
            ...MessageFactory.header(),
            payload: {
                symbol,
                nameAr:    data.name,
                price:     data.price,
                unit:      data.unit,
                changePct: +change.toFixed(3),
                direction,
                category:  data.category,
            },
        };
    }

    static alert(symbol, changePct, price, type = 'SPIKE') {
        return {
            type:    'PRICE_ALERT',
            channel: WS_CHANNELS.ALERTS,
            ...MessageFactory.header(),
            payload: {
                symbol, price, changePct, type,
                severity:    Math.abs(changePct) > 5 ? 'عالي' : 'متوسط',
                islamicNote: '«اتقوا الله وقولوا قولاً سديداً» — تنبيه فقط',
                disclaimer:  '⚠️ للمعلومة — ليس توصية',
            },
        };
    }

    static signal(symbol, signal, price) {
        return {
            type:    'TRADE_SIGNAL',
            channel: WS_CHANNELS.SIGNALS,
            ...MessageFactory.header(),
            payload: {
                symbol, signal, price,
                islamicNote: '«المعرفة نور» — الإشارة للمعرفة فقط لا للمضاربة',
                disclaimer:  '⚠️ للمعرفة — ليس توصية استثمارية',
            },
        };
    }

    static systemPulse(stats) {
        return {
            type:    'SYSTEM_PULSE',
            channel: WS_CHANNELS.SYSTEM,
            ...MessageFactory.header(),
            payload: { ...stats, quran: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾' },
        };
    }

    static welcome(clientId) {
        return {
            type:    'WELCOME',
            channel: WS_CHANNELS.SYSTEM,
            ...MessageFactory.header(),
            payload: {
                clientId,
                message:  'أهلاً بك في سوق شيخة للمعادن الإسلامية',
                channels: Object.values(WS_CHANNELS),
                version:  '1.0.0',
            },
        };
    }

    static encode(msg) {
        try { return JSON.stringify(msg); } catch { return '{}'; }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §3 — PriceBuffer
//      مخزن أسعار دوّار — يحتفظ بآخر 50 دقيقة (600 تحديث)
// ══════════════════════════════════════════════════════════════════════════════

class PriceBuffer {
    constructor(size = 600) {
        this.size    = size;
        this.data    = new Map();
        this.current = { ...DEFAULT_PRICES };
    }

    update(symbol, price) {
        const prev = this.current[symbol]?.price;
        if (!this.current[symbol]) return null;
        this.current[symbol] = { ...this.current[symbol], price };
        if (!this.data.has(symbol)) this.data.set(symbol, []);
        const hist = this.data.get(symbol);
        hist.push({ price, t: Date.now() });
        if (hist.length > this.size) hist.shift();
        return prev;
    }

    // إدخال أسعار من محرك marketIntelEngine
    injectFromMarketEngine(marketEngine) {
        if (!marketEngine?.isInitialized) return 0;
        let count = 0;
        try {
            const all = marketEngine.priceEngine?.getAllPrices?.() || {};
            for (const [sym, val] of Object.entries(all)) {
                if (this.current[sym]) {
                    this.update(sym, val.price || val.close || this.current[sym].price);
                    count++;
                }
            }
        } catch { /* silent */ }
        return count;
    }

    getPrice(symbol)    { return this.current[symbol]?.price || null; }
    getHistory(symbol)  { return this.data.get(symbol) || []; }
    getAllCurrent()      { return { ...this.current }; }
    getSnapshot()       {
        return Object.entries(this.current).map(([sym, d]) => ({
            symbol: sym, ...d, history: (this.data.get(sym) || []).slice(-5),
        }));
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §4 — SheikhaWSClient
//      تمثيل كل اتصال عميل
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaWSClient {
    constructor(socket, id) {
        this.socket      = socket;
        this.id          = id;
        this.connectedAt = Date.now();
        this.subscriptions = new Set(Object.values(WS_CHANNELS)); // كل القنوات افتراضياً
        this.messageCount  = 0;
        this.alive         = true;
    }

    send(msg) {
        try {
            if (!this.alive) return false;
            const data = typeof msg === 'string' ? msg : MessageFactory.encode(msg);
            // WebSocket frame encoding (بدون ws package — native)
            const payload = Buffer.from(data, 'utf8');
            const len     = payload.length;
            let header;
            if (len < 126) {
                header = Buffer.alloc(2);
                header[0] = 0x81; // FIN + text
                header[1] = len;
            } else if (len < 65536) {
                header = Buffer.alloc(4);
                header[0] = 0x81;
                header[1] = 126;
                header.writeUInt16BE(len, 2);
            } else {
                header = Buffer.alloc(10);
                header[0] = 0x81;
                header[1] = 127;
                header.writeBigUInt64BE(BigInt(len), 2);
            }
            this.socket.write(Buffer.concat([header, payload]));
            this.messageCount++;
            return true;
        } catch { this.alive = false; return false; }
    }

    subscribeTo(channel) { this.subscriptions.add(channel); }
    unsubscribeFrom(channel) { this.subscriptions.delete(channel); }
    isSubscribed(channel) { return this.subscriptions.has(channel); }

    close() {
        this.alive = false;
        try { this.socket.destroy(); } catch { /* silent */ }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §5 — SheikhaWSServer
//      خادم WebSocket يعمل على HTTP upgrade (بدون ws module خارجي)
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaWSServer extends EventEmitter {
    constructor() {
        super();
        this.clients = new Map(); // clientId → SheikhaWSClient
        this.totalConnections = 0;
    }

    // ربط بخادم HTTP موجود
    attach(httpServer) {
        httpServer.on('upgrade', (req, socket, head) => this._handleUpgrade(req, socket, head));
        return this;
    }

    _handleUpgrade(req, socket, head) {
        // التحقق من طلب WebSocket
        const key = req.headers['sec-websocket-key'];
        if (!key || req.headers.upgrade?.toLowerCase() !== 'websocket') {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.destroy();
            return;
        }

        // فقط مسار /ws/prices أو /ws
        const url = req.url || '';
        if (!url.startsWith('/ws')) {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.destroy();
            return;
        }

        // حساب الـ accept key (WebSocket handshake)
        const acceptKey = crypto
            .createHash('sha1')
            .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
            .digest('base64');

        socket.write([
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${acceptKey}`,
            '\r\n',
        ].join('\r\n'));

        // إنشاء عميل جديد
        const clientId = crypto.randomBytes(8).toString('hex');
        const client   = new SheikhaWSClient(socket, clientId);
        this.clients.set(clientId, client);
        this.totalConnections++;

        // إرسال رسالة ترحيب
        client.send(MessageFactory.welcome(clientId));
        this.emit('connection', clientId);

        // استقبال الرسائل الواردة
        socket.on('data', buf => this._parseFrame(client, buf));
        socket.on('close', () => this._removeClient(clientId));
        socket.on('error', () => this._removeClient(clientId));
    }

    // فك تشفير WebSocket frame
    _parseFrame(client, buf) {
        try {
            if (buf.length < 2) return;
            const opcode = buf[0] & 0x0f;
            if (opcode === 8) { this._removeClient(client.id); return; } // close
            const masked  = (buf[1] & 0x80) !== 0;
            let   lenByte = buf[1] & 0x7f;
            let   offset  = 2;
            if (lenByte === 126) { offset += 2; }
            else if (lenByte === 127) { offset += 8; }
            if (masked) {
                const mask    = buf.slice(offset, offset + 4); offset += 4;
                const payload = buf.slice(offset);
                const decoded = Buffer.alloc(payload.length);
                for (let i = 0; i < payload.length; i++) decoded[i] = payload[i] ^ mask[i % 4];
                try {
                    const msg = JSON.parse(decoded.toString('utf8'));
                    this._handleClientMessage(client, msg);
                } catch { /* invalid JSON */ }
            }
        } catch { /* invalid frame */ }
    }

    _handleClientMessage(client, msg) {
        if (msg.action === 'subscribe'   && msg.channel) client.subscribeTo(msg.channel);
        if (msg.action === 'unsubscribe' && msg.channel) client.unsubscribeFrom(msg.channel);
        if (msg.action === 'ping') client.send({ type: 'PONG', t: Date.now(), bism: 'بسم الله' });
        this.emit('message', client.id, msg);
    }

    _removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) { client.close(); this.clients.delete(clientId); }
        this.emit('disconnection', clientId);
    }

    // بث لجميع المتصلين المشتركين في قناة
    broadcast(channel, msg) {
        let sent = 0;
        for (const client of this.clients.values()) {
            if (client.alive && client.isSubscribed(channel)) {
                if (client.send(msg)) sent++;
                else this._removeClient(client.id);
            }
        }
        return sent;
    }

    getStats() {
        return {
            connected:      this.clients.size,
            totalEver:      this.totalConnections,
            alive:          [...this.clients.values()].filter(c => c.alive).length,
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §6 — SheikhaWebSocketEngine
//      المحرك الرئيسي — يربط كل المكونات معاً
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaWebSocketEngine extends EventEmitter {
    constructor() {
        super();
        this.version       = '1.0.0';
        this.bism          = 'بسم الله الرحمن الرحيم';
        this.wsServer      = new SheikhaWSServer();
        this.priceBuffer   = new PriceBuffer();
        this.isInitialized = false;
        this.intervals     = [];
        this.broadcastCount= 0;
        this.marketEngine  = null; // سيُحقن من server.js
    }

    async initialize(httpServer, marketEngineRef) {
        this.marketEngine = marketEngineRef;

        // ربط بالخادم
        this.wsServer.attach(httpServer);

        // بدء دورات البث
        this._startPriceBroadcast();
        this._startSignalBroadcast();
        this._startSystemPulse();

        this.isInitialized = true;
        console.log(`✅ [ACTIVE] sheikha-websocket-live-prices.js — WebSocket بث لحظي على /ws`);
        return this;
    }

    // تفعيل مستقل بدون ربط WebSocket (عند وجود خادم WS سابق)
    async initStandalone(marketEngineRef) {
        this.marketEngine = marketEngineRef;

        // بدء دورات البث اللحظي في الذاكرة
        this._startPriceBroadcast();
        this._startSignalBroadcast();
        this._startSystemPulse();

        this.isInitialized = true;
        console.log(`✅ [ACTIVE] sheikha-websocket-live-prices.js — بث اللحظي مستقل (standalone) يعمل`);
        return this;
    }

    // حقن محرك السوق لاحقاً
    setMarketEngine(engine) { this.marketEngine = engine; }

    // دورة البث: أسعار كل 5 ثوان
    _startPriceBroadcast() {
        const tick = () => {
            // تحديث من محرك السوق إن وجد
            if (this.marketEngine) this.priceBuffer.injectFromMarketEngine(this.marketEngine);

            // تطبيق تغيير عشوائي طفيف لمحاكاة السوق الحي
            const prices = this.priceBuffer.getAllCurrent();
            for (const [sym, data] of Object.entries(prices)) {
                // تحريك السعر ±0.2% عشوائياً
                const drift = 1 + (Math.random() - 0.5) * 0.004;
                const newPrice = +(data.price * drift).toFixed(data.unit.includes('/oz') ? 2 : (data.price < 100 ? 4 : 1));
                const prevPrice = this.priceBuffer.update(sym, newPrice);

                const msg = MessageFactory.priceUpdate(sym, { ...data, price: newPrice }, prevPrice);

                // بث للقناة المناسبة
                this.wsServer.broadcast(msg.channel, msg);
                this.broadcastCount++;

                // تنبيه إذا تجاوز التغيير 3%
                if (prevPrice && Math.abs((newPrice - prevPrice) / prevPrice * 100) > 3) {
                    const alertMsg = MessageFactory.alert(sym, (newPrice - prevPrice) / prevPrice * 100, newPrice);
                    this.wsServer.broadcast(WS_CHANNELS.ALERTS, alertMsg);
                }
            }
        };
        const id = setInterval(tick, BROADCAST_INTERVALS.prices);
        this.intervals.push(id);
    }

    // دورة إشارات التداول كل 30 ثانية
    _startSignalBroadcast() {
        const tick = () => {
            const prices = this.priceBuffer.getAllCurrent();
            const symbols = ['Cu', 'Al', 'Fe', 'Au', 'HMS1'];
            for (const sym of symbols) {
                if (!prices[sym]) continue;
                const hist = this.priceBuffer.getHistory(sym);
                if (hist.length < 7) continue;
                // حساب  SMA7 بسيط
                const sma7 = hist.slice(-7).reduce((s, v) => s + v.price, 0) / 7;
                const cur  = prices[sym].price;
                const signal = cur > sma7 * 1.005 ? 'تجاوز المتوسط ▲ — للمعرفة فقط' : cur < sma7 * 0.995 ? 'دون المتوسط ▼ — للمعرفة فقط' : 'قرب المتوسط — للمعرفة فقط';
                this.wsServer.broadcast(WS_CHANNELS.SIGNALS, MessageFactory.signal(sym, signal, cur));
            }
        };
        const id = setInterval(tick, BROADCAST_INTERVALS.signals);
        this.intervals.push(id);
    }

    // نبض النظام كل دقيقة
    _startSystemPulse() {
        const tick = () => {
            const stats = {
                ...this.wsServer.getStats(),
                broadcastCount: this.broadcastCount,
                symbols:        Object.keys(this.priceBuffer.getAllCurrent()).length,
                uptime:         Math.floor(process.uptime()),
            };
            this.wsServer.broadcast(WS_CHANNELS.SYSTEM, MessageFactory.systemPulse(stats));
        };
        const id = setInterval(tick, BROADCAST_INTERVALS.system);
        this.intervals.push(id);
    }

    destroy() {
        this.intervals.forEach(id => clearInterval(id));
        this.intervals = [];
        this.isInitialized = false;
    }

    getPriceSnapshot()  { return this.priceBuffer.getSnapshot(); }
    getStatus() {
        return {
            system:         'SHEIKHA WebSocket Live Prices',
            version:        this.version,
            bism:           this.bism,
            isInitialized:  this.isInitialized,
            wsEndpoint:     'ws://[host]/ws',
            channels:       Object.values(WS_CHANNELS),
            clients:        this.wsServer.getStats(),
            broadcastCount: this.broadcastCount,
            priceSymbols:   Object.keys(this.priceBuffer.getAllCurrent()),
            intervals:      { prices: BROADCAST_INTERVALS.prices, signals: BROADCAST_INTERVALS.signals },
            islamicPrinciple: '﴿وَإِذَا قُلْتُمْ فَاعْدِلُوا﴾',
            timestamp:      new Date().toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §7 — التصدير
// ══════════════════════════════════════════════════════════════════════════════

const engineInstance = new SheikhaWebSocketEngine();

module.exports = {
    SheikhaWebSocketEngine,
    SheikhaWSServer,
    PriceBuffer,
    MessageFactory,
    WS_CHANNELS,
    BROADCAST_INTERVALS,
    DEFAULT_PRICES,
    engine:       engineInstance,
    async init(httpServer, marketEngine) { return await engineInstance.initialize(httpServer, marketEngine); },
    async initStandalone(marketEngine)   { return await engineInstance.initStandalone(marketEngine); },
    getStatus()   { return engineInstance.getStatus(); },
    version:      '1.0.0',
    bism:         'بسم الله الرحمن الرحيم',
};
