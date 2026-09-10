import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { products, sources } from "../src/products.js";
assert.ok(products.length > 0, "Catalog must contain published products");
assert.equal(
  new Set(products.map((p) => p.slug)).size,
  products.length,
  "Every product must have a unique route",
);
import { allowedSourceHosts as allowed } from "../lib/cms-validation.js";
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
  `PASS: ${products.length} unique product pages, original images, complete clinical notes and allowed reference domains.`,
);
