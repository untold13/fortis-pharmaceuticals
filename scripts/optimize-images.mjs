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
    if (
      !(await sharp(source).raw().toBuffer()).equals(
        await sharp(target).raw().toBuffer(),
      )
    )
      throw new Error(`Pixel mismatch: ${source}`);
    console.log(`${source}: original preserved, lossless WebP verified`);
  }
}
await optimize("public/products");
await optimize("public/uploads");
