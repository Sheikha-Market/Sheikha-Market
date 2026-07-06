'use strict';

function createArabicRegisterMachine() {
  return {
    PC: 0,
    SP: 0,
    REGISTERS: {
      ACC: null,
      SRC: null,
      DST: null,
      TMP: null
    },
    FLAGS: {
      ZERO: false,
      ERROR: false,
      EXECUTED: false
    },
    deterministic: true
  };
}

function writeArabicRegister(machine, register, value) {
  return {
    ...machine,
    REGISTERS: {
      ...machine.REGISTERS,
      [register]: value
    }
  };
}

function incrementProgramCounter(machine) {
  return {
    ...machine,
    PC: machine.PC + 1
  };
}

module.exports = {
  createArabicRegisterMachine,
  writeArabicRegister,
  incrementProgramCounter
};
