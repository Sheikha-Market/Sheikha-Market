// Kernel Memory
// نقطة إدارة الذاكرة للنواة

const memory = {};

function set(key, value) {
    memory[key] = value;
}

function get(key) {
    return memory[key];
}

function clear() {
    Object.keys(memory).forEach(k => delete memory[k]);
}

module.exports = { set, get, clear };
