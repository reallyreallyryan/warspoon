import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAW_DIR = path.resolve("_raw-images");
const OUT_DIR = path.join(RAW_DIR, "converted");
const SUPPORTED = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".tiff",
  ".tif",
  ".avif",
]);

async function collectFiles(dir) {
  let files = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) {
      if (fullPath === OUT_DIR) continue;
      files = files.concat(await collectFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED.has(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function convert(inputPath) {
  const rel = path.relative(RAW_DIR, inputPath);
  const dir = path.dirname(rel);
  const name = path.basename(rel, path.extname(rel)).toLowerCase() + ".webp";
  const outDir = path.join(OUT_DIR, dir);
  const outPath = path.join(outDir, name);

  await fs.mkdir(outDir, { recursive: true });

  const inputStat = await fs.stat(inputPath);

  await sharp(inputPath)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);

  const outputStat = await fs.stat(outPath);

  const saved = inputStat.size - outputStat.size;
  const pct = ((saved / inputStat.size) * 100).toFixed(1);
  console.log(
    `  ${rel} (${fmtSize(inputStat.size)}) -> converted/${dir === "." ? "" : dir + "/"}${name} (${fmtSize(outputStat.size)}) [${pct}% smaller]`,
  );

  return { inputSize: inputStat.size, outputSize: outputStat.size };
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  try {
    await fs.access(RAW_DIR);
  } catch {
    console.log(
      "_raw-images/ directory not found. Create it and add some images first.",
    );
    process.exit(0);
  }

  const files = await collectFiles(RAW_DIR);

  if (files.length === 0) {
    console.log("No images to convert.");
    process.exit(0);
  }

  console.log(`Found ${files.length} image(s) to convert.\n`);

  let converted = 0;
  let failed = 0;
  let totalInputSize = 0;
  let totalOutputSize = 0;

  for (const file of files) {
    try {
      const result = await convert(file);
      totalInputSize += result.inputSize;
      totalOutputSize += result.outputSize;
      converted++;
    } catch (err) {
      console.error(`  ERROR: ${path.relative(RAW_DIR, file)} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${converted} converted, ${failed} failed.`);
  if (converted > 0) {
    const saved = totalInputSize - totalOutputSize;
    console.log(
      `Total: ${fmtSize(totalInputSize)} -> ${fmtSize(totalOutputSize)} (saved ${fmtSize(saved)})`,
    );
  }
}

main();
