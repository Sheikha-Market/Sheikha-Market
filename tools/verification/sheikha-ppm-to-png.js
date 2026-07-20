#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  typeBuffer.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(
    crc32(Buffer.concat([typeBuffer, data])),
    8 + data.length
  );
  return output;
}

function readToken(buffer, state) {
  while (state.offset < buffer.length) {
    const byte = buffer[state.offset];
    if (byte === 0x23) {
      while (
        state.offset < buffer.length &&
        buffer[state.offset] !== 0x0a
      ) {
        state.offset += 1;
      }
    } else if (byte <= 0x20) {
      state.offset += 1;
    } else {
      break;
    }
  }
  const start = state.offset;
  while (
    state.offset < buffer.length &&
    buffer[state.offset] > 0x20
  ) {
    state.offset += 1;
  }
  return buffer.subarray(start, state.offset).toString('ascii');
}

function convertPpmToPng(inputPath, outputPath) {
  const ppm = fs.readFileSync(inputPath);
  const state = { offset: 0 };
  const magic = readToken(ppm, state);
  const width = Number.parseInt(readToken(ppm, state), 10);
  const height = Number.parseInt(readToken(ppm, state), 10);
  const maximum = Number.parseInt(readToken(ppm, state), 10);
  if (magic !== 'P6' || maximum !== 255 || width <= 0 || height <= 0) {
    throw new Error('Unsupported PPM format');
  }
  if (ppm[state.offset] === 0x0d && ppm[state.offset + 1] === 0x0a) {
    state.offset += 2;
  } else if (ppm[state.offset] <= 0x20) {
    state.offset += 1;
  }
  const pixels = ppm.subarray(state.offset);
  if (pixels.length !== width * height * 3) {
    throw new Error('PPM pixel length does not match its dimensions');
  }

  const scanlines = Buffer.alloc((width * 3 + 1) * height);
  for (let row = 0; row < height; row += 1) {
    const target = row * (width * 3 + 1);
    scanlines[target] = 0;
    pixels.copy(
      scanlines,
      target + 1,
      row * width * 3,
      (row + 1) * width * 3
    );
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const png = Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, png);
  return { width, height, bytes: png.length };
}

if (require.main === module) {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    throw new Error('Usage: sheikha-ppm-to-png.js <input.ppm> <output.png>');
  }
  process.stdout.write(`${JSON.stringify(
    convertPpmToPng(inputPath, outputPath),
    null,
    2
  )}\n`);
}

module.exports = { convertPpmToPng, crc32 };
