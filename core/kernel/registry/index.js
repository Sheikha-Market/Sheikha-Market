// Kernel Unified Registry
// نقطة الدخول الرسمية لتسجيل واسترجاع العناصر التشغيلية

const registry = {
    routes: {},
    engines: {},
    blueprints: {},
};

function register(type, name, ref) {
    if (!registry[type]) throw new Error('نوع غير مدعوم');
    if (registry[type][name]) throw new Error('العنصر مسجل مسبقاً');
    registry[type][name] = ref;
}

function get(type, name) {
    if (!registry[type]) throw new Error('نوع غير مدعوم');
    return registry[type][name];
}

function list(type) {
    if (!registry[type]) throw new Error('نوع غير مدعوم');
    return Object.keys(registry[type]);
}

module.exports = { register, get, list };
