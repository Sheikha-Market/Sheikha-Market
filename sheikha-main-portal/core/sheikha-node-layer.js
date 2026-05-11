'use strict';

const VERSION = '1.0.0';
const DEFAULT_MAIN_PORT = parseInt(process.env.PORT || '8080', 10);
const DEFAULT_COPILOT_PORT = parseInt(process.env.COPILOT_SERVER_PORT || '3091', 10);
const DEFAULT_META_PORT = parseInt(process.env.META_BACKGROUND_PORT || '8085', 10);

let _rootNCNLayer = null;
try {
    _rootNCNLayer = require('./sheikha-root-ncn-layer');
} catch (err) {
    console.warn('[SHEIKHA-NODE] ⚠️  لم يُعثر على طبقة ROOT NCN:', err.message);
}

const LAYER_ID = {
    name:       'Sheikha Node Layer',
    nameAr:     'طبقة شيخة نود',
    version:    VERSION,
    layer:      'sheikha-node',
    runtime:    'node',
    position:   'Sheikha OS → Node.js Runtime → [SHEIKHA-NODE] → Guardian',
    startedAt:  null,
    bismillah:  'بسم الله الرحمن الرحيم',
    tawheed:    'لا إله إلا الله محمد رسول الله',
    quranRef:   '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤',
};

let _ready = false;

function getNetworkMetric(layerStatus, propName, fallbackValue = 0) {
    return layerStatus?.network?.[propName] ?? layerStatus?.[propName] ?? fallbackValue;
}

function getBackgroundServers() {
    return [
        {
            key: 'sheikha-copilot',
            name: 'Sheikha Copilot MCP',
            mode: 'background',
            managedBy: 'pm2',
            configured: true,
            activation: 'pm2-ready',
            port: DEFAULT_COPILOT_PORT,
            script: './scripts/sheikha-copilot-server.js',
        },
        {
            key: 'sheikha-meta-background',
            name: 'Sheikha Meta Background',
            mode: 'background',
            managedBy: 'pm2',
            configured: true,
            activation: 'pm2-ready',
            port: DEFAULT_META_PORT,
            script: './scripts/sheikha-meta-background.js',
        }
    ];
}

function getRootNeuralCellNetworkStatus() {
    if (!_rootNCNLayer || typeof _rootNCNLayer.status !== 'function') {
        return {
            active: false,
            configured: false,
            message: 'طبقة الشبكة العصبية الجذرية غير متاحة'
        };
    }

    const layerStatus = _rootNCNLayer.status();
    return {
        active: !!layerStatus.ready,
        configured: true,
        layer: layerStatus.layer,
        name: layerStatus.name,
        nameAr: layerStatus.nameAr,
        cells: getNetworkMetric(layerStatus, 'cells'),
        layers: getNetworkMetric(layerStatus, 'layersCount', getNetworkMetric(layerStatus, 'layers')),
        embedDim: getNetworkMetric(layerStatus, 'embedDim'),
        position: layerStatus.position,
    };
}

function status() {
    const backgroundServers = getBackgroundServers();
    return {
        ...LAYER_ID,
        ready: _ready,
        runtimeInfo: {
            node: process.version,
            pid: process.pid,
            platform: process.platform,
            arch: process.arch,
        },
        apiServer: {
            key: 'sheikha-api',
            mode: 'foreground',
            active: true,
            port: DEFAULT_MAIN_PORT,
            pid: process.pid,
        },
        backgroundServers,
        rootNeuralCellNetwork: getRootNeuralCellNetworkStatus(),
    };
}

async function init() {
    if (_ready) return status();

    LAYER_ID.startedAt = new Date().toISOString();
    _ready = true;

    console.log('[SHEIKHA-NODE] 🟢 طبقة شيخة نود مُفعَّلة فوق Node.js');
    console.log(`[SHEIKHA-NODE]    • Node.js Runtime : ${process.version}`);
    console.log(`[SHEIKHA-NODE]    • API Server      : ${DEFAULT_MAIN_PORT}`);
    console.log(`[SHEIKHA-NODE]    • Background      : ${getBackgroundServers().map(s => `${s.key}:${s.port}`).join(' | ')}`);
    console.log(`[SHEIKHA-NODE]    • Root NCN        : ${getRootNeuralCellNetworkStatus().configured ? 'مربوطة ✅' : 'غير متاحة'}`);

    return status();
}

module.exports = {
    LAYER_ID,
    init,
    status,
    getBackgroundServers,
    getRootNeuralCellNetworkStatus,
    DEFAULT_COPILOT_PORT,
    DEFAULT_META_PORT,
};
