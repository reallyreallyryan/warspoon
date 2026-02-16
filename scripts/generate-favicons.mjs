import sharp from 'sharp';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE = resolve(ROOT, '_raw-images/warspoon-initial-logo.png');
const PUBLIC = resolve(ROOT, 'public');

// Parchment background color from the site theme
const PARCHMENT = { r: 240, g: 235, b: 221, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function generateSquarePng(size, outputName, bg = WHITE) {
  const output = resolve(PUBLIC, outputName);
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: bg })
    .png()
    .toFile(output);
  console.log(`  ${outputName} (${size}x${size})`);
}

async function generateOgImage() {
  const width = 1200;
  const height = 630;
  const logoHeight = 400;

  const logo = await sharp(SOURCE)
    .resize({ height: logoHeight, fit: 'inside' })
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();

  const left = Math.round((width - logoMeta.width) / 2);
  const top = Math.round((height - logoMeta.height) / 2);

  const output = resolve(PUBLIC, 'og-default.png');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: PARCHMENT,
    },
  })
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(output);

  console.log(`  og-default.png (${width}x${height})`);
}

async function generateIco() {
  // Generate individual PNGs for ICO sizes
  const sizes = [16, 32, 48];
  const tmpFiles = [];

  for (const size of sizes) {
    const tmp = resolve(PUBLIC, `_tmp-ico-${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: WHITE })
      .png()
      .toFile(tmp);
    tmpFiles.push(tmp);
  }

  const output = resolve(PUBLIC, 'favicon.ico');
  execSync(`magick ${tmpFiles.join(' ')} ${output}`);

  // Clean up temp files
  for (const f of tmpFiles) {
    execSync(`rm ${f}`);
  }
  console.log('  favicon.ico (16+32+48 multi-size)');
}

async function main() {
  console.log('Generating favicons from warspoon-initial-logo.png...\n');

  await generateSquarePng(16, 'favicon-16x16.png');
  await generateSquarePng(32, 'favicon-32x32.png');
  await generateSquarePng(180, 'apple-touch-icon.png');
  await generateSquarePng(192, 'icon-192.png');
  await generateSquarePng(512, 'icon-512.png');
  await generateIco();
  await generateOgImage();

  console.log('\nDone! All favicon assets written to public/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
