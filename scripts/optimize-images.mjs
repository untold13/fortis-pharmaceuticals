// Lossless delivery copies. Uploaded originals remain byte-for-byte intact.
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
async function optimize(directory) {
  for (const item of await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  )) {
    const source = path.join(directory, item.name);
    if (item.isDirectory()) {
      await optimize(source);
      continue;
    }
    if (!/\.(png|jpe?g)$/i.test(item.name)) continue;
    const target = source.replace(/\.(png|jpe?g)$/i, ".webp");
    const srcStat = await stat(source),
      outStat = await stat(target).catch(() => null);
    if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) continue;
    await sharp(source).webp({ lossless: true, effort: 4 }).toFile(target);
    const original = await sharp(source).ensureAlpha().raw().toBuffer();
    const converted = await sharp(target).ensureAlpha().raw().toBuffer();
    if (original.length !== converted.length)
      throw new Error(`Pixel mismatch: ${source}`);
    for (let i = 0; i < original.length; i += 4) {
      // Lossless WebP may discard RGB values beneath fully transparent pixels.
      // Alpha and every visible color channel must still match exactly.
      if (
        original[i + 3] !== converted[i + 3] ||
        (original[i + 3] !== 0 &&
          (original[i] !== converted[i] ||
            original[i + 1] !== converted[i + 1] ||
            original[i + 2] !== converted[i + 2]))
      )
        throw new Error(`Pixel mismatch: ${source}`);
    }
    console.log(`${source}: original preserved, lossless WebP verified`);
  }
}
await optimize("public/products");
await optimize("public/uploads");
