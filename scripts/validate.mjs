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
  assert.ok(p.strength && p.name && p.pack && p.form && p.preparation);
  for (const key of [
    "nameComposition",
    "pharmacology",
    "indications",
    "dosageAdministration",
    "sideEffects",
    "contraindications",
    "warningsPrecautions",
    "storageConditions",
    "manufacturer",
  ]) {
    assert.equal(typeof p[key], "string", `Missing ${key} for ${p.slug}`);
  }
  for (const removed of ["context", "caution", "note", "infoOverview", "infoUse", "infoStorage"])
    assert.equal(removed in p, false, `Obsolete ${removed} remains on ${p.slug}`);
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
  `PASS: ${products.length} unique Georgian product pages, original images, editable product-information fields and allowed reference domains.`,
);
