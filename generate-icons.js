const fs = require('fs');
const path = require('path');

// Create a simple PNG file (1x1 pixel, then we'll scale conceptually)
// This creates a minimal valid PNG with the Campaign Star colors
function createPNG(size) {
    // PNG signature
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR chunk
    const width = size;
    const height = size;
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8);  // bit depth
    ihdrData.writeUInt8(2, 9);  // color type (RGB)
    ihdrData.writeUInt8(0, 10); // compression
    ihdrData.writeUInt8(0, 11); // filter
    ihdrData.writeUInt8(0, 12); // interlace
    
    const ihdr = createChunk('IHDR', ihdrData);
    
    // Create image data (solid color)
    const bytesPerPixel = 3; // RGB
    const rowBytes = width * bytesPerPixel + 1; // +1 for filter byte
    const imageData = Buffer.alloc(height * rowBytes);
    
    // Fill with Campaign Star green color (#00d09c = 0, 208, 156)
    for (let y = 0; y < height; y++) {
        imageData.writeUInt8(0, y * rowBytes); // Filter byte
        for (let x = 0; x < width; x++) {
            const offset = y * rowBytes + 1 + x * bytesPerPixel;
            imageData.writeUInt8(0, offset);     // R
            imageData.writeUInt8(208, offset + 1); // G
            imageData.writeUInt8(156, offset + 2); // B
        }
    }
    
    // Compress the data (we'll use uncompressed for simplicity)
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(imageData);
    const idat = createChunk('IDAT', compressed);
    
    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    
    // Calculate CRC
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(calculateCRC(crcData), 0);
    
    return Buffer.concat([length, typeBuffer, data, crc]);
}

function calculateCRC(buffer) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
        }
    }
    return crc ^ 0xFFFFFFFF;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
const sizes = [192, 256, 384, 512];
sizes.forEach(size => {
    const png = createPNG(size);
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), png);
    console.log(`Created icon-${size}.png`);
});

// Create maskable icon (same as 512 for now)
const maskablePng = createPNG(512);
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512.png'), maskablePng);
console.log('Created maskable-icon-512.png');

console.log('All icons generated successfully!');
