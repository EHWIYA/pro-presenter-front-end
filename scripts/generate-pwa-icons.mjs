import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#1a1a2e"/>
  <text x="256" y="300" font-family="system-ui,sans-serif" font-size="200" font-weight="700" fill="#5b8def" text-anchor="middle">P</text>
</svg>
`;

async function writePng(size, name) {
  const buffer = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(path.join(outDir, name), buffer);
  console.log(`wrote ${name} (${size}x${size})`);
}

await mkdir(outDir, { recursive: true });
await writePng(192, 'icon-192.png');
await writePng(512, 'icon-512.png');
console.log('PWA icons generated in public/icons/');
