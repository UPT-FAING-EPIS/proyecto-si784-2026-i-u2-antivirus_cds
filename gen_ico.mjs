import sharp from 'sharp';
import fs from 'fs';

// Generate proper ICO from the PNG
async function createIco() {
  const inputPath = 'public/icon.png';
  
  // Generate multiple sizes for a proper ICO
  const sizes = [16, 32, 48, 64, 128, 256];
  const buffers = [];

  for (const size of sizes) {
    const buf = await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    buffers.push({ size, data: buf });
  }

  // Build ICO file format
  const numImages = buffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + (dirEntrySize * numImages);

  // Calculate total size
  let currentOffset = dataOffset;
  const entries = buffers.map(({ size, data }) => {
    const entry = { size, data, offset: currentOffset };
    currentOffset += data.length;
    return entry;
  });

  const totalSize = currentOffset;
  const ico = Buffer.alloc(totalSize);

  // ICO Header
  ico.writeUInt16LE(0, 0);      // Reserved
  ico.writeUInt16LE(1, 2);      // Type: 1 = ICO
  ico.writeUInt16LE(numImages, 4); // Number of images

  // Directory entries
  entries.forEach((entry, i) => {
    const pos = headerSize + (i * dirEntrySize);
    ico.writeUInt8(entry.size >= 256 ? 0 : entry.size, pos);     // Width
    ico.writeUInt8(entry.size >= 256 ? 0 : entry.size, pos + 1); // Height
    ico.writeUInt8(0, pos + 2);           // Color palette
    ico.writeUInt8(0, pos + 3);           // Reserved
    ico.writeUInt16LE(1, pos + 4);        // Color planes
    ico.writeUInt16LE(32, pos + 6);       // Bits per pixel
    ico.writeUInt32LE(entry.data.length, pos + 8);  // Size of image data
    ico.writeUInt32LE(entry.offset, pos + 12);      // Offset to image data
  });

  // Image data
  entries.forEach(entry => {
    entry.data.copy(ico, entry.offset);
  });

  fs.writeFileSync('public/icon.ico', ico);
  console.log(`ICO created: ${totalSize} bytes with ${numImages} sizes`);
}

createIco().catch(console.error);
