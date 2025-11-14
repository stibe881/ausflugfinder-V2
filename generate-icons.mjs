import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconsDir = './public/icons';

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG for a simple mountain/compass icon (for "Ausflug" meaning excursion/trip)
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3b82f6"/>
  <circle cx="256" cy="256" r="100" fill="none" stroke="white" stroke-width="8"/>
  <path d="M256 156 L320 340 L192 340 Z" fill="white"/>
  <circle cx="256" cy="256" r="16" fill="white"/>
  <path d="M256 200 L256 100" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M312 256 L412 256" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M300 212 L360 152" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M200 256 L100 256" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M212 300 L152 360" stroke="white" stroke-width="4" stroke-linecap="round"/>
</svg>
`;

const buffer = Buffer.from(svgIcon);

// Generate 192x192 icon
await sharp(buffer)
  .resize(192, 192, {
    fit: 'cover',
    position: 'center'
  })
  .png()
  .toFile(path.join(iconsDir, 'icon-192.png'));

console.log('✓ Generated icon-192.png');

// Generate 512x512 icon
await sharp(buffer)
  .resize(512, 512, {
    fit: 'cover',
    position: 'center'
  })
  .png()
  .toFile(path.join(iconsDir, 'icon-512.png'));

console.log('✓ Generated icon-512.png');

// Generate maskable versions (with padding for maskable icons)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3b82f6"/>
  <circle cx="256" cy="256" r="90" fill="none" stroke="white" stroke-width="8"/>
  <path d="M256 176 L310 330 L202 330 Z" fill="white"/>
  <circle cx="256" cy="256" r="14" fill="white"/>
  <path d="M256 210 L256 120" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M306 256 L396 256" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M292 218 L352 158" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M206 256 L116 256" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <path d="M220 294 L160 354" stroke="white" stroke-width="4" stroke-linecap="round"/>
</svg>
`;

const maskableBuffer = Buffer.from(maskableSvg);

// Generate 192x192 maskable icon
await sharp(maskableBuffer)
  .resize(192, 192, {
    fit: 'cover',
    position: 'center'
  })
  .png()
  .toFile(path.join(iconsDir, 'icon-192-maskable.png'));

console.log('✓ Generated icon-192-maskable.png');

// Generate 512x512 maskable icon
await sharp(maskableBuffer)
  .resize(512, 512, {
    fit: 'cover',
    position: 'center'
  })
  .png()
  .toFile(path.join(iconsDir, 'icon-512-maskable.png'));

console.log('✓ Generated icon-512-maskable.png');

// Generate new-trip.png (quick action icon)
const newTripSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#f59e0b"/>
  <g transform="translate(96, 96)">
    <circle cx="0" cy="0" r="60" fill="white"/>
    <path d="M0 -30 L30 30 L-30 30 Z" fill="#f59e0b"/>
    <circle cx="0" cy="0" r="8" fill="#f59e0b"/>
    <path d="M0 -15 L0 -40" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 0 L45 0" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 -14 L33 -33" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
`;

const newTripBuffer = Buffer.from(newTripSvg);

await sharp(newTripBuffer)
  .resize(192, 192, {
    fit: 'cover',
    position: 'center'
  })
  .png()
  .toFile(path.join(iconsDir, 'new-trip.png'));

console.log('✓ Generated new-trip.png');

console.log('\n✅ All PWA icons generated successfully!');
