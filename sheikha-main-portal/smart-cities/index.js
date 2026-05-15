/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║        SHEIKHA Smart Cities Runtime — نطاق المدن الذكية                     ║
 * ║           SHEIKHA Sovereign Cognitive Infrastructure                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * نطاق المدن الذكية يشمل:
 *   - عقد البنية الذكية (smart infrastructure nodes)
 *   - إدارة المناطق الحضرية (urban zones)
 *   - حساسات وتتبع (IoT sensors)
 *   - خدمات المدينة (city services)
 *   - التقارير التشغيلية الحضرية
 *
 * @module smart-cities/index
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

const DOMAIN_IDENTITY = {
    name: 'SHEIKHA Smart Cities Runtime',
    domain: 'smart-cities',
    fabric: 'Smart Cities Fabric',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(32);

/** @type {Map<string, object>} */
const _zones = new Map();
/** @type {Map<string, object>} */
const _sensors = new Map();
/** @type {Map<string, object>} */
const _services = new Map();

function registerZone(zoneId, profile) {
    _zones.set(zoneId, { ...profile, zoneId, status: 'active', registeredAt: new Date().toISOString() });
    _bus.emit('zone:registered', { zoneId });
}

function registerSensor(sensorId, zoneId, type) {
    _sensors.set(sensorId, { sensorId, zoneId, type, status: 'online', lastReading: null, registeredAt: new Date().toISOString() });
    _bus.emit('sensor:registered', { sensorId, zoneId, type });
}

function recordReading(sensorId, value, unit = '') {
    const sensor = _sensors.get(sensorId);
    if (!sensor) return null;
    sensor.lastReading = { value, unit, at: new Date().toISOString() };
    _bus.emit('sensor:reading', { sensorId, value, unit });
    return sensor.lastReading;
}

function registerCityService(serviceId, profile) {
    _services.set(serviceId, { ...profile, serviceId, status: 'active', registeredAt: new Date().toISOString() });
    _bus.emit('city-service:registered', { serviceId });
}

function cityHealthReport() {
    const onlineSensors = [..._sensors.values()].filter(s => s.status === 'online').length;
    const report = {
        domain: DOMAIN_IDENTITY.name,
        zones: _zones.size,
        sensors: { total: _sensors.size, online: onlineSensors },
        services: _services.size,
        generatedAt: new Date().toISOString(),
    };
    _bus.emit('city:health', report);
    return report;
}

function status() {
    return {
        ...DOMAIN_IDENTITY,
        zones: _zones.size,
        sensors: _sensors.size,
        cityServices: _services.size,
    };
}

function start() {
    DOMAIN_IDENTITY.startedAt = new Date().toISOString();
    console.log(`[SHEIKHA-SMART-CITIES] ✅ نطاق المدن الذكية جاهز`);
    _bus.emit('domain:ready', { identity: DOMAIN_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }

module.exports = {
    start,
    registerZone,
    registerSensor,
    recordReading,
    registerCityService,
    cityHealthReport,
    status,
    on,
    DOMAIN_IDENTITY,
};
