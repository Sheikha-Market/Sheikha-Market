'use strict';

// A local observation contract, not a network protocol or a safety controller.
(function (root) {
  const METRICS = Object.freeze({
    temperature: {unit: 'Cel', min: -273.15, max: 100000, units: {Cel: [1, 0], K: [1, -273.15], '[degF]': [5 / 9, -160 / 9]}},
    humidity: {unit: '%RH', min: 0, max: 100, units: {'%RH': [1, 0]}},
    pressure: {unit: 'kPa', min: 0, max: 1e9, units: {Pa: [0.001, 0], kPa: [1, 0], bar: [100, 0]}},
    power: {unit: 'kW', min: 0, max: 1e9, units: {W: [0.001, 0], kW: [1, 0]}},
    irradiance: {unit: 'W/m2', min: 0, max: 1e9, units: {'W/m2': [1, 0]}},
  });
  const DOMAINS = ['environment', 'industrial', 'home', 'space'];
  const STATUS = {
    MISSING: ['لا توجد قراءة', 'No reading'], INVALID: ['قراءة غير صالحة', 'Invalid reading'],
    STALE: ['قراءة قديمة', 'Stale reading'], UNCERTAIN: ['تحتاج تحققًا', 'Needs verification'],
    UNCALIBRATED: ['معايرة غير مؤكدة', 'Calibration unconfirmed'],
    ABOVE: ['أعلى من المرجع', 'Above reference'], BELOW: ['أقل من المرجع', 'Below reference'],
    WITHIN: ['ضمن المرجع', 'Within reference'],
  };
  const fail = code => { throw new Error(code); };
  const clone = value => JSON.parse(JSON.stringify(value));
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value);
  function exact(value, fields) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).length !== fields.length || fields.some(k => !Object.hasOwn(value, k))) fail('FIELDS_DENIED');
  }
  function time(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)) fail('TIMESTAMP_INVALID');
    const n = Date.parse(value);
    if (!Number.isFinite(n) || new Date(n).toISOString() !== value) fail('TIMESTAMP_INVALID');
    return n;
  }
  function normalize(metric, value, unit, uncertainty) {
    if (typeof metric !== 'string' || !Object.hasOwn(METRICS, metric)) fail('UNIT_NOT_ALLOWED_FOR_METRIC');
    const m = METRICS[metric];
    if (typeof unit !== 'string' || !Object.hasOwn(m.units, unit)) fail('UNIT_NOT_ALLOWED_FOR_METRIC');
    if (!finite(value) || Math.abs(value) > 1e12 || !(uncertainty === null || finite(uncertainty) && uncertainty >= 0 && uncertainty <= 1e12)) fail('NUMERIC_VALUE_INVALID');
    const [scale, offset] = m.units[unit];
    const normalized = value * scale + offset;
    if (!finite(normalized) || normalized < m.min - 1e-9 || normalized > m.max) fail('VALUE_OUTSIDE_PHYSICAL_DOMAIN');
    return {value: Math.max(m.min, normalized), unit: m.unit, uncertainty: uncertainty === null ? null : uncertainty * Math.abs(scale)};
  }
  function validateConfig(config) {
    exact(config, ['schemaVersion', 'tenantId', 'sources', 'referencePolicy', 'physicalActuationAllowed', 'realTransportConfigured']);
    if (config.schemaVersion !== 1 || !id(config.tenantId) || config.physicalActuationAllowed !== false || config.realTransportConfigured !== false || config.referencePolicy !== 'ILLUSTRATIVE_ENGINEERING_RANGES_NOT_SAFETY_LIMITS') fail('CONFIG_BOUNDARY_DENIED');
    if (!Array.isArray(config.sources) || !config.sources.length || config.sources.length > 32) fail('SOURCE_COUNT_INVALID');
    const seen = new Set();
    for (const s of config.sources) {
      exact(s, ['id', 'labelAr', 'labelEn', 'domain', 'metric', 'maxAgeSeconds', 'referenceMin', 'referenceMax']);
      if (!id(s.id) || seen.has(s.id) || !DOMAINS.includes(s.domain) || typeof s.metric !== 'string' || !Object.hasOwn(METRICS, s.metric)) fail('SOURCE_CONFIG_INVALID');
      if (![s.labelAr, s.labelEn].every(v => typeof v === 'string' && v.length > 0 && v.length <= 100 && !/[<>\x00-\x1f]/.test(v))) fail('SOURCE_LABEL_INVALID');
      if (!Number.isInteger(s.maxAgeSeconds) || s.maxAgeSeconds < 1 || s.maxAgeSeconds > 86400 || !finite(s.referenceMin) || !finite(s.referenceMax) || s.referenceMin > s.referenceMax || s.referenceMin < METRICS[s.metric].min || s.referenceMax > METRICS[s.metric].max) fail('REFERENCE_RANGE_INVALID');
      seen.add(s.id);
    }
    return clone(config);
  }

  function classify(source, reading, now) {
    if (!reading) return {status: 'MISSING', issues: ['MISSING'], ageSeconds: null, comparison: null};
    const ageSeconds = Math.max(0, (now - time(reading.observedAt)) / 1000);
    const issues = [];
    if (reading.quality === 'INVALID') issues.push('INVALID');
    if (ageSeconds > source.maxAgeSeconds) issues.push('STALE');
    if (reading.quality === 'SUSPECT' || reading.normalized.uncertainty === null) issues.push('UNCERTAIN');
    if (reading.calibration !== 'CURRENT') issues.push('UNCALIBRATED');
    const {value, uncertainty} = reading.normalized;
    if (uncertainty !== null && uncertainty > 0 && [source.referenceMin, source.referenceMax].some(v => value - uncertainty <= v && value + uncertainty >= v) && !issues.includes('UNCERTAIN')) issues.push('UNCERTAIN');
    const comparison = value > source.referenceMax ? 'ABOVE' : value < source.referenceMin ? 'BELOW' : 'WITHIN';
    return {status: issues[0] || comparison, issues, ageSeconds, comparison: issues.length ? null : comparison};
  }

  class SensoryHub {
    #config; #readings; #audit; #now; #origin;
    constructor(config, context) {
      this.#config = validateConfig(config);
      exact(context, ['tenantId', 'origin']);
      if (context.tenantId !== this.#config.tenantId || !['SYNTHETIC', 'IMPORTED_UNVERIFIED'].includes(context.origin)) fail('CONTEXT_DENIED');
      this.#origin = context.origin;
      this.#readings = new Map(this.#config.sources.map(s => [s.id, []]));
      this.#audit = [];
      this.#now = 0;
    }
    #clock(now) {
      if (!Number.isSafeInteger(now) || now < this.#now || now < 0 || now > 8640000000000000) fail('CLOCK_INVALID');
      return now;
    }
    ingest(batch, now = Date.now()) {
      this.#clock(now);
      exact(batch, ['schemaVersion', 'tenantId', 'observations']);
      if (batch.schemaVersion !== 1 || batch.tenantId !== this.#config.tenantId) fail('TENANT_OR_SCHEMA_DENIED');
      if (!Array.isArray(batch.observations) || !batch.observations.length || batch.observations.length > 500) fail('BATCH_SIZE_INVALID');
      // Stage the whole transaction so one invalid record cannot partially advance sequences.
      const staged = new Map([...this.#readings].map(([key, records]) => [key, records.slice()]));
      for (const observation of batch.observations) {
        exact(observation, ['sourceId', 'sequence', 'observedAt', 'value', 'unit', 'quality', 'calibration', 'uncertainty']);
        const source = this.#config.sources.find(s => s.id === observation.sourceId);
        if (!source) fail('SOURCE_NOT_REGISTERED');
        if (!Number.isSafeInteger(observation.sequence) || observation.sequence < 0) fail('SEQUENCE_INVALID');
        if (!['VALID', 'SUSPECT', 'INVALID'].includes(observation.quality) || !['CURRENT', 'EXPIRED', 'UNKNOWN'].includes(observation.calibration)) fail('QUALITY_DECLARATION_INVALID');
        const at = time(observation.observedAt);
        if (at > now) fail('FUTURE_READING_DENIED');
        const records = staged.get(source.id);
        const previous = records.at(-1);
        if (previous && (observation.sequence <= previous.sequence || at < time(previous.observedAt))) fail('REPLAY_OR_REORDER_DENIED');
        const normalized = normalize(source.metric, observation.value, observation.unit, observation.uncertainty);
        records.push({...clone(observation), normalized});
        if (records.length > 120) records.shift();
      }
      this.#readings = staged;
      this.#now = now;
      this.#audit.push({event: 'BATCH_ACCEPTED', at: new Date(now).toISOString(), records: batch.observations.length, origin: this.#origin, authenticatedDevice: false});
      if (this.#audit.length > 100) this.#audit.shift();
      return this.snapshot(now);
    }
    snapshot(now = Date.now()) {
      this.#clock(now); this.#now = now;
      const sources = this.#config.sources.map(s => {
        const history = this.#readings.get(s.id);
        const latest = history.at(-1) || null;
        return {...clone(s), canonicalUnit: METRICS[s.metric].unit, latest: clone(latest), history: clone(history), ...classify(s, latest, now)};
      });
      return {
        schema: 'SHEIKHA_SENSORY_SNAPSHOT_V1', evaluatedAt: new Date(now).toISOString(),
        tenantId: this.#config.tenantId, origin: this.#origin, sources,
        audit: clone(this.#audit), referencePolicy: this.#config.referencePolicy,
        authenticatedDevice: false, calibrationIndependentlyVerified: false,
        realTransportConfigured: false, physicalCommandSent: false, externalRequests: 0,
        medicalInterpretationProvided: false, productionApproved: false,
      };
    }
    sendPhysicalCommand() { fail('PHYSICAL_ACTUATION_DISABLED'); }
  }

  function narrative(source, language = 'ar') {
    const en = language === 'en';
    const label = en ? source.labelEn : source.labelAr;
    if (!source.latest) return en ? `${label}: no reading received. Missing data is not zero.` : `${label}: لم تصل قراءة. غياب البيانات لا يعني أن القيمة صفر.`;
    const reading = source.latest;
    const n = new Intl.NumberFormat(en ? 'en' : 'ar', {maximumFractionDigits: 3});
    const value = `${n.format(reading.normalized.value)} ${reading.normalized.unit}`;
    const reason = source.issues.length ? source.issues.map(s => STATUS[s][en ? 1 : 0]).join(en ? ', ' : '، ') : STATUS[source.status][en ? 1 : 0];
    return en ? `${label}: ${value}. ${reason}. Source and calibration are declared, not independently verified. Reference ranges are not safety limits.`
      : `${label}: \u2066${value}\u2069. ${reason}. المصدر والمعايرة معلنان ولم يتحقق منهما مستقلًا. النطاق المرجعي ليس حدًا للسلامة.`;
  }
  function demoBatch(config, now = Date.now()) {
    const c = validateConfig(config);
    const observations = [];
    const values = [28, 72, 340, 42, 2.4, 850];
    c.sources.forEach((s, index) => {
      // One channel is deliberately missing; another is stale. These are labeled test data.
      if (index === 5) return;
      for (let sequence = 0; sequence < 24; sequence++) {
        const value = (values[index] ?? 10) + Math.sin(sequence / 4) * ((values[index] ?? 10) / 35);
        observations.push({sourceId: s.id, sequence, observedAt: new Date(now - (23 - sequence) * 5000 - (index === 3 ? 180000 : 0)).toISOString(), value, unit: METRICS[s.metric].unit,
          quality: 'VALID', calibration: index === 4 ? 'UNKNOWN' : 'CURRENT', uncertainty: index === 4 ? null : 0.2});
      }
    });
    return {schemaVersion: 1, tenantId: c.tenantId, observations};
  }
  const api = {SensoryHub, validateConfig, normalize, narrative, demoBatch, STATUS, DOMAINS};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SheikhaSensory = api;
})(globalThis);
