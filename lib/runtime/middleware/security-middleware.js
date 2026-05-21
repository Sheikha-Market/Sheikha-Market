function sanitizeInput(obj) {
    if (typeof obj === 'string') {
        return obj
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeInput);
    }

    if (obj && typeof obj === 'object') {
        const clean = {};
        for (const key of Object.keys(obj)) {
            clean[key] = sanitizeInput(obj[key]);
        }
        return clean;
    }

    return obj;
}

function applySecurityMiddleware(config) {
    const {
        app,
        helmet,
        compression,
        rateLimit,
        cors,
        express
    } = config;

    if (helmet) {
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
                    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
                    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
                    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
                    connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:*', 'https://api.openai.com'],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: null
                }
            },
            hsts: false,
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: 'cross-origin' }
        }));
        console.log('✅ helmet مفعّل — ترويسات الحماية (بدون HSTS للبيئة المحلية)');
    }

    if (compression) {
        app.use(compression({
            level: 6,
            threshold: 1024,
            filter: (req, res) => {
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return compression.filter(req, res);
            }
        }));
        console.log('✅ compression مفعّل — ضغط الاستجابات');
    }

    const corsOptions = {
        origin: [
            'https://sheikha.top',
            'https://www.sheikha.top',
            'http://localhost:23000',
            'http://localhost:8080'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    };

    let generalLimiter;
    let authLimiter;
    let aiLimiter;

    if (rateLimit) {
        const runtimeLimiterBypassPaths = new Set([
            '/api/live',
            '/api/health',
            '/api/ready',
            '/api/version',
            '/api/runtime',
            '/api/sheikha-node/status',
            '/api/observability/summary'
        ]);

        const shouldBypassGeneralLimiter = (req) => {
            const requestPath = (req.originalUrl || req.url || '').split('?')[0];
            return runtimeLimiterBypassPaths.has(requestPath);
        };

        generalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 500,
            message: { success: false, message: 'تم تجاوز الحد المسموح من الطلبات. حاول بعد قليل.' },
            skip: shouldBypassGeneralLimiter,
            standardHeaders: true,
            legacyHeaders: false
        });

        authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: { success: false, message: 'محاولات دخول كثيرة. حاول بعد 15 دقيقة.' }
        });

        aiLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
            message: { success: false, message: 'تم تجاوز حد استخدام الذكاء الاصطناعي.' }
        });

        console.log('✅ rate-limit مفعّل — حماية من الإغراق');
    }

    app.use(cors(corsOptions));
    app.use(express.json({ limit: '10mb' }));

    app.use((req, res, next) => {
        if (req.body) {
            req.body = sanitizeInput(req.body);
        }
        if (req.query) {
            req.query = sanitizeInput(req.query);
        }
        if (req.params) {
            req.params = sanitizeInput(req.params);
        }
        next();
    });

    if (generalLimiter) {
        app.use('/api/', generalLimiter);
    }

    if (authLimiter) {
        app.use('/api/auth/login', authLimiter);
        app.use('/api/auth/register', authLimiter);
    }

    if (aiLimiter) {
        app.use('/api/ai/', aiLimiter);
        app.use('/api/sheikha-ai/', aiLimiter);
    }
}

module.exports = applySecurityMiddleware;