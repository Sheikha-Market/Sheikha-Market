'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const { SheikhaDigitalRobot, runScenario } = require('../core/robotics/sheikha-digital-robot-v1');
const language = require('../core/robotics/sheikha-robot-language-v1.cjs');
test('Sheikha source activates a finite digital simulation', () => {
  const result = language.activateDigitalRobot();
  assert.equal(result.status, 'LOCAL_DIGITAL_SIMULATION_VERIFIED');
  assert.equal(result.simulation.state, 'COMPLETE');
  assert.equal(result.simulation.physicalCommandSent, false);
});
test('emergency stop latches and prevents further movement', () => {
  const robot = new SheikhaDigitalRobot(); robot.begin('warehouse-inspection'); robot.heartbeat(); robot.tick();
  robot.emergencyStop(); const before = robot.status().position;
  robot.heartbeat(); robot.tick(); assert.deepEqual(robot.status().position, before);
  assert.equal(robot.state, 'ESTOP_LATCHED'); assert.throws(() => robot.begin('reception'), /ROBOT_NOT_READY/);
});
test('expired simulated heartbeat prevents movement', () => {
  const robot = new SheikhaDigitalRobot(); robot.begin('warehouse-inspection');
  for (let i = 0; i < 5; ++i) robot.tick();
  const position = robot.status().position; robot.tick();
  assert.equal(robot.state, 'FAULT_LATCHED'); assert.deepEqual(robot.status().position, position);
});
test('obstacle and invalid sensor values latch a fault', () => {
  for (const distance of [0.1, NaN, -1]) {
    const robot = new SheikhaDigitalRobot(); robot.begin('warehouse-inspection');
    robot.tick({ obstacleDistance: distance }); assert.equal(robot.state, 'FAULT_LATCHED');
    assert.deepEqual(robot.status().position, { x: 1, y: 1 });
  }
});
test('physical adapter cannot be activated by simulation or client approval', () => {
  const robot = new SheikhaDigitalRobot(); assert.throws(() => robot.sendPhysicalCommand({ humanApproved: true }), /PHYSICAL_DRIVER_NOT_CONFIGURED/);
  assert.equal(language.hardwareIntegrationPlan().physicalActuationAllowed, false);
});
test('unknown missions are rejected and local scenarios remain bounded', () => {
  assert.throws(() => runScenario('firmware-flash'), /MISSION_NOT_ADMITTED/);
  for (const mission of ['warehouse-inspection', 'stationary-sort', 'reception']) {
    const result = runScenario(mission); assert.equal(result.success, true); assert.ok(result.tick <= 64);
  }
});
