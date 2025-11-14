import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconDir = './public/icons/cluster';

// Ensure directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
  console.log(`Created directory: ${iconDir}`);
}

// Define cluster icons
const icons = [
  { name: 'cluster-small', size: 40, color: '#f59e0b' },   // amber
  { name: 'cluster-medium', size: 50, color: '#ef4444' },  // red
  { name: 'cluster-large', size: 60, color: '#7c3aed' },   // violet
];

async function generateIcon(name, size, color) {
  try {
    // Create SVG string
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.5"/>
      </svg>
    `;

    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // Save PNG file
    const filePath = path.join(iconDir, `${name}.png`);
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`✓ Generated: ${filePath} (${size}x${size}px, ${color})`);

    return filePath;
  } catch (error) {
    console.error(`✗ Failed to generate ${name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Generating cluster icons...\n');

  try {
    for (const icon of icons) {
      await generateIcon(icon.name, icon.size, icon.color);
    }
    console.log('\n✓ All cluster icons generated successfully!');
  } catch (error) {
    console.error('\n✗ Error generating icons:', error);
    process.exit(1);
  }
}

main();
