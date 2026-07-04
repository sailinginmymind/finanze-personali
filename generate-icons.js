import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const outputDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    const borderRadius = size * 0.15; // equivale a rounded-xl (12px su 80px ≈ 15%)
    const fontSize = size * 0.5;

    // SVG del logo: sfondo gradiente amber-400 → amber-600, F nera, angoli arrotondati
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FBBF24"/>   <!-- amber-400 -->
            <stop offset="100%" stop-color="#D97706"/> <!-- amber-600 -->
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${size}" height="${size}" rx="${borderRadius}" ry="${borderRadius}" fill="url(#grad)"/>
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
              font-family="Plus Jakarta Sans, sans-serif" font-weight="bold"
              font-size="${fontSize}px" fill="#060b14">F</text>
      </svg>`;

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `pwa-${size}x${size}.png`));

    console.log(`✅ Creata pwa-${size}x${size}.png`);
  }
  console.log('🎉 Icone generate in public/');
}

generateIcons().catch(console.error);