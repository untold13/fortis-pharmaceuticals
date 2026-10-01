// Build disposable delivery assets; CMS uploads and product labels remain untouched.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
const directory = "public/optimized";
await fs.mkdir(directory, { recursive: true });
const manifest = { products: {} };
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex").slice(0, 12);
async function writeAsset(name, bytes, extension) {
  const url = `/optimized/${name}-${digest(bytes)}.${extension}`;
  await fs.writeFile(`public${url}`, bytes);
  return url;
}
const imageCache = new Map();
for (const file of await fs.readdir("content/products")) {
  if (!file.endsWith(".json")) continue;
  const product = JSON.parse(await fs.readFile(`content/products/${file}`, "utf8"));
  if (!product.published) continue;
  if (!imageCache.has(product.image)) {
    const bytes = await fs.readFile(path.join("public", product.image));
    const metadata = await sharp(bytes).metadata();
    const widths = [...new Set([320, 640, 960].map((w) => Math.min(w, metadata.width)))];
    const variants = [];
    for (const width of widths) {
      const output = await sharp(bytes).resize({ width, withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toBuffer();
      variants.push({ width, src: await writeAsset(`product-${digest(bytes)}-${width}`, output, "webp") });
    }
    imageCache.set(product.image, { image: (variants.find(v => v.width >= 640) || variants.at(-1)).src, imageSrcSet: variants.map(v => `${v.src} ${v.width}w`).join(", "), imageWidth: metadata.width, imageHeight: metadata.height });
  }
  manifest.products[product.slug] = imageCache.get(product.image);
}
manifest.logo = await writeAsset("fortis-logo", await sharp("public/fortis-logo.png").resize({ width: 600 }).webp({ quality: 92 }).toBuffer(), "webp");
manifest.logoNight = await writeAsset("fortis-logo-night", await fs.readFile("public/fortis-logo-night.svg"), "svg");
manifest.poster = await writeAsset("hemedis-poster", await sharp("public/hemedis-poster.png").resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer(), "webp");
manifest.model = await writeAsset("hemedis", await fs.readFile("public/hemedis-fast.glb").catch(() => fs.readFile("public/hemedis-c24-18.glb")), "glb");
manifest.lighting = await writeAsset("hemedis-lighting", await fs.readFile("public/hemedis-lighting-small.hdr").catch(() => fs.readFile("public/hemedis-lighting.hdr")), "hdr");
manifest.viewer = await writeAsset("model-viewer", await fs.readFile("public/model-viewer-4.3.1.min.js"), "js");
await fs.writeFile("src/generated-assets.json", JSON.stringify(manifest));
const { products: imageProducts, ...artwork } = manifest;
await fs.writeFile("src/generated-artwork.json", JSON.stringify(artwork));
console.log(`Generated responsive images for ${Object.keys(manifest.products).length} published products and versioned brand/3D assets.`);
