'use strict';

const {
  SheikhaUnifiedStudioKernel,
  KERNEL_SUBSYSTEMS,
  STUDIO_COMMANDS,
  STUDIO_EVENTS,
  RESOURCE_TYPES
} = require('../runtime/sheikha-studio/kernel/sheikha-unified-studio-kernel');

test('activates unified Sheikha Studio kernel', () => {
  const kernel = new SheikhaUnifiedStudioKernel();
  const status = kernel.getStatus();

  expect(status.status).toBe('ACTIVE_UNIFIED_STUDIO_KERNEL');
  expect(status.layerRank).toBe('ABOVE_STUDIO_RUNTIME_WORKBENCH');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.subsystems).toHaveLength(KERNEL_SUBSYSTEMS.length);
  expect(status.commandBus.commands).toEqual(STUDIO_COMMANDS);
  expect(status.eventBus.events).toEqual(STUDIO_EVENTS);
  expect(status.resourceManager.resources).toHaveLength(RESOURCE_TYPES.length);

  expect(status.session.status).toBe('STUDIO_SESSION_READY');
  expect(status.boundaries.allSubsystemsGoverned).toBe(true);
  expect(status.boundaries.allResourcesMeasured).toBe(true);
});

test('dispatches governed command and emits governed event', () => {
  const kernel = new SheikhaUnifiedStudioKernel();

  const command = kernel.dispatchCommand('build', { project: 'sheikha-main-portal' });
  const event = kernel.emitEvent('BuildStarted', { project: 'sheikha-main-portal' });

  expect(command.status).toBe('COMMAND_DISPATCHED');
  expect(command.lifecycle).toContain('write-master-log');
  expect(command.boundaries.noUngovernedCommand).toBe(true);

  expect(event.status).toBe('EVENT_EMITTED');
  expect(event.subscribers).toContain('inspector-runtime');
});

test('measures governed studio resources', () => {
  const kernel = new SheikhaUnifiedStudioKernel();
  const resource = kernel.measureResource('memory');

  expect(resource.status).toBe('RESOURCE_MEASURED');
  expect(resource.measurable).toBe(true);
  expect(resource.evidenceRequired).toBe(true);
});

test('rejects unsupported kernel items', () => {
  const kernel = new SheikhaUnifiedStudioKernel();

  expect(() => kernel.activateSubsystem('unknown-subsystem'))
    .toThrow('Unsupported Sheikha Studio kernel subsystem');

  expect(() => kernel.dispatchCommand('unknown-command'))
    .toThrow('Unsupported Sheikha Studio command');

  expect(() => kernel.emitEvent('UnknownEvent'))
    .toThrow('Unsupported Sheikha Studio event');

  expect(() => kernel.measureResource('unknown-resource'))
    .toThrow('Unsupported Sheikha Studio resource');
});
