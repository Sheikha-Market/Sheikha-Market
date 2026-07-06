'use strict';

const fs = require('fs');
const path = require('path');

function eventsPath() {
  const dir = path.join(process.cwd(), 'runtime', 'master-log');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'events.json');
}

function _readEvents() {
  const p = eventsPath();
  try {
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

function _writeEvents(events) {
  const p = eventsPath();
  fs.writeFileSync(p, JSON.stringify(events, null, 2), 'utf8');
  return p;
}

function writeMasterLog(entry = {}) {
  const events = _readEvents();
  const now = new Date().toISOString();
  const event = Object.assign(
    {
      eventId: `ml-${Date.now()}`,
      timestamp: now,
      source: entry.source || 'SHEIKHA_RECOVERY_HEALTH',
      actor: entry.actor || 'system',
      type: entry.type || 'governance-decision',
      severity: entry.severity || 'LOW',
      scope: entry.scope || 'runtime',
      message: entry.message || 'no message',
      evidenceRef: entry.evidenceRef || null,
      governanceRef: entry.governanceRef || null,
      correlationId: entry.correlationId || null,
      retentionClass: entry.retentionClass || 'standard-audit',
      sensitive: !!entry.sensitive,
      decision: entry.decision || null
    },
    entry
  );

  events.push(event);
  _writeEvents(events);

  return {
    success: true,
    eventId: event.eventId,
    path: eventsPath(),
    storedAt: now
  };
}

module.exports = {
  writeMasterLog,
  _readEvents,
  _writeEvents
};
