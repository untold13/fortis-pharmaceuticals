// Lossless format conversion only: original PNGs stay untouched.
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
for (const name of await readdir("public/products")) {
  if (!name.endsWith(".png")) continue;
  const source = `public/products/${name}`;
  const target = source.replace(/\.png$/, ".webp");
  const srcStat = await stat(source);
  const outStat = await stat(target).catch(() => null);
  if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) continue;
  await sharp(source).webp({ lossless: true, effort: 4 }).toFile(target);
  const original = await sharp(source).raw().toBuffer();
  const encoded = await sharp(target).raw().toBuffer();
  if (!original.equals(encoded)) throw new Error(`Pixel mismatch: ${name}`);
  console.log(`${name}: lossless WebP, identical decoded pixels`);
}
