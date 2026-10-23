'use strict';
/* Pure browser/Node simulation. All distances and speeds are arbitrary simulation units. */
class SheikhaDigitalRobot {
  constructor() {
    this.state = 'IDLE'; this.position = { x: 1, y: 1 }; this.target = null;
    this.clock = 0; this.lastHeartbeat = 0; this.estop = false; this.audit = [];
  }
  record(event) { this.audit.push({ event, tick: this.clock, state: this.state }); if (this.audit.length > 200) this.audit.shift(); }
  status() { return { mode: 'SIMULATION_ONLY', state: this.state, position: { ...this.position },
    target: this.target ? { ...this.target } : null, estop: this.estop, tick: this.clock, physicalCommandSent: false }; }
  plan(mission) {
    if (!['warehouse-inspection', 'stationary-sort', 'reception'].includes(mission)) throw new Error('MISSION_NOT_ADMITTED');
    return { mission, mode: 'SIMULATION_ONLY', steps: mission === 'warehouse-inspection' ? ['OBSERVE', 'MOVE_IN_SIMULATION', 'INSPECT', 'REPORT'] : ['OBSERVE', 'PLAN', 'REPORT'],
      physicalActuationAllowed: false, hardwareConnection: 'UNKNOWN' };
  }
  begin(mission) {
    const plan = this.plan(mission);
    if (this.estop || !['IDLE', 'COMPLETE'].includes(this.state)) throw new Error('ROBOT_NOT_READY');
    this.target = mission === 'warehouse-inspection' ? { x: 8, y: 8 } : { ...this.position };
    this.state = 'SIMULATING'; this.lastHeartbeat = this.clock; this.record('MISSION_STARTED'); return plan;
  }
  heartbeat() { this.lastHeartbeat = this.clock; }
  emergencyStop() { this.estop = true; this.state = 'ESTOP_LATCHED'; this.record('ESTOP_LATCHED'); }
  resetSimulation() { this.estop = false; this.state = 'IDLE'; this.target = null; this.lastHeartbeat = this.clock; this.record('LOCAL_SIMULATION_RESET'); }
  tick(sensors = {}) {
    this.clock++;
    if (this.estop || this.state !== 'SIMULATING') return this.status();
    if (this.clock - this.lastHeartbeat > 5) { this.state = 'FAULT_LATCHED'; this.record('HEARTBEAT_EXPIRED'); return this.status(); }
    const obstacleDistance = sensors.obstacleDistance ?? 10;
    if (!Number.isFinite(obstacleDistance) || obstacleDistance < 0 || obstacleDistance < 0.5) {
      this.state = 'FAULT_LATCHED'; this.record('OBSTACLE_OR_SENSOR_FAULT'); return this.status();
    }
    const dx = this.target.x - this.position.x, dy = this.target.y - this.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.000001) { this.state = 'COMPLETE'; this.record('MISSION_COMPLETE'); return this.status(); }
    const step = Math.min(distance, 0.25);
    const next = { x: this.position.x + dx / distance * step, y: this.position.y + dy / distance * step };
    if (![next.x, next.y].every(v => Number.isFinite(v) && v >= 0 && v <= 10)) {
      this.state = 'FAULT_LATCHED'; this.record('WORKSPACE_LIMIT'); return this.status();
    }
    this.position = next; this.record('SIMULATION_STEP'); return this.status();
  }
  sendPhysicalCommand() { throw new Error('PHYSICAL_DRIVER_NOT_CONFIGURED'); }
}
function runScenario(mission = 'warehouse-inspection') {
  const robot = new SheikhaDigitalRobot(); robot.begin(mission);
  for (let i = 0; i < 64 && robot.state === 'SIMULATING'; ++i) { robot.heartbeat(); robot.tick(); }
  return { success: robot.state === 'COMPLETE', ...robot.status(), trace: robot.audit };
}
if (typeof module !== 'undefined' && module.exports) module.exports = { SheikhaDigitalRobot, runScenario };
else globalThis.SheikhaRobotics = { SheikhaDigitalRobot, runScenario };
