import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { products, sources } from "../src/products.js";
assert.equal(
  products.length,
  10,
  "Catalog must contain exactly ten independent preparations",
);
assert.equal(
  new Set(products.map((p) => p.slug)).size,
  10,
  "Every product must have a unique route",
);
assert.equal(
  products.filter((p) => p.featured).length,
  4,
  "Homepage must feature four products",
);
const allowed = new Set([
  "www.accessdata.fda.gov",
  "www.ema.europa.eu",
  "jamanetwork.com",
  "pmc.ncbi.nlm.nih.gov",
]);
for (const p of products) {
  assert.ok(existsSync(`public${p.image}`), `Missing image for ${p.slug}`);
  assert.ok(p.strength && p.name && p.pack && p.context && p.caution && p.note);
  for (const r of p.refs) {
    assert.ok(sources[r], `Missing source ${r}`);
    assert.ok(allowed.has(new URL(sources[r].url).hostname));
  }
}
if (existsSync("dist"))
  for (const p of products) {
    const h = readFileSync(`dist/products/${p.slug}/index.html`, "utf8");
    assert.ok(h.includes(p.name), `Missing route metadata ${p.slug}`);
  }
console.log(
  "PASS: 10 unique product pages, 4 featured products, 10 original images, complete clinical notes and allowed reference domains.",
);
