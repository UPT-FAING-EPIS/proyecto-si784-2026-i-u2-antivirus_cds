// Genera un archivo ICO válido que contiene el PNG original como imagen de 256x256
import fs from 'fs';

const pngData = fs.readFileSync('public/icon.png');

// ICO Header: 6 bytes
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);      // Reserved
header.writeUInt16LE(1, 2);      // Type: 1 = ICO
header.writeUInt16LE(1, 4);      // Number of images: 1

// Directory Entry: 16 bytes
const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(0, 0);       // Width: 0 = 256
dirEntry.writeUInt8(0, 1);       // Height: 0 = 256
dirEntry.writeUInt8(0, 2);       // Color palette
dirEntry.writeUInt8(0, 3);       // Reserved
dirEntry.writeUInt16LE(1, 4);    // Color planes
dirEntry.writeUInt16LE(32, 6);   // Bits per pixel
dirEntry.writeUInt32LE(pngData.length, 8);  // Size of image data
dirEntry.writeUInt32LE(22, 12);  // Offset to image data (6 + 16 = 22)

const ico = Buffer.concat([header, dirEntry, pngData]);
fs.writeFileSync('public/icon.ico', ico);
console.log(`ICO created: ${ico.length} bytes`);
