import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { validateContent } from "../lib/cms-validation.js";
const read = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const sourceData = await read("content/sources.json");
validateContent("content/sources.json", sourceData);
const sourceIDs = sourceData.sources.map((s) => s.id);
const sources = Object.fromEntries(
  sourceData.sources.map(({ id, ...s }) => [id, s]),
);
const copy = await read("content/copy.json"),
  home = await read("content/home.json");
validateContent("content/copy.json", copy);
validateContent("content/home.json", home);
const records = [];
for (const file of (await fs.readdir("content/products")).filter((f) =>
  f.endsWith(".json"),
)) {
  const contentPath = `content/products/${file}`,
    p = await read(contentPath);
  try {
    validateContent(contentPath, p, sourceIDs);
  } catch (error) {
    throw new Error(`${contentPath}: ${error.message}`);
  }
  if (!p.published) continue;
  const meta = await sharp(path.join("public", p.image)).metadata();
  p.imageWidth = meta.width;
  p.imageHeight = meta.height;
  p.originalImage = p.image;
  p.image = p.image.replace(/\.(png|jpe?g)$/i, ".webp");
  records.push(p);
}
records.sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.slug.localeCompare(b.slug),
);
for (const section of home.sections.filter((s) => s.published))
  if (section.image) await sharp(path.join("public", section.image)).metadata();
await fs.writeFile(
  "src/generated-content.js",
  `// Generated from authenticated CMS content. Do not edit.\nexport const records=${JSON.stringify(records)};\nexport const sourceRecords=${JSON.stringify(sources)};\nexport const siteCopy=${JSON.stringify(copy.entries)};\nexport const extraSections=${JSON.stringify(home.sections.filter((s) => s.published))};\n`,
);
console.log(
  `Generated ${records.length} published products and Georgian site content.`,
);
