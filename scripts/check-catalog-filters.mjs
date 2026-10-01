import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { products } from '../src/products.js';
import { facets, emptyFilters, filterProducts, catalogProducts } from '../src/catalog-model.js';
import { filterDefinitions, filterOptions, resolveFilterSelections } from '../src/filter-options.js';
import { validateContent } from '../lib/cms-validation.js';

assert.deepEqual(filterDefinitions.map(f=>[f.key,filterOptions[f.key].length]), [['specialty',42]]);
assert.deepEqual(facets.map(f=>f.key), ['specialty']);
assert.deepEqual(emptyFilters(), {specialty:[]});
assert.equal(new Set(filterOptions.specialty).size,42);
assert.deepEqual(facets[0].options,filterOptions.specialty);
assert.deepEqual(resolveFilterSelections('specialty',['ნევროლოგია / იმუნოლოგია / რევმატოლოგია / ფსიქიატრია']).selected,['იმუნოლოგია','ნევროლოგია','რევმატოლოგია','ფსიქიატრია']);
assert.equal(filterProducts('',emptyFilters()).length,products.length);
const selected={specialty:['ნევროლოგია','ფსიქიატრია']};
assert.deepEqual(filterProducts('',selected).map(p=>p.slug),catalogProducts.filter(p=>p.facets.specialty.some(v=>selected.specialty.includes(v))).map(p=>p.slug));
assert.deepEqual(filterProducts('75 მგ',selected).map(p=>p.slug),catalogProducts.filter(p=>p.strength==='75 მგ'&&p.facets.specialty.some(v=>selected.specialty.includes(v))).map(p=>p.slug));
assert.equal(filterProducts('არარსებული-პროდუქტი',emptyFilters()).length,0);
const sources=JSON.parse(readFileSync('content/sources.json')).sources.map(s=>s.id);
for(const name of readdirSync('content/products').filter(n=>n.endsWith('.json'))) {
 const p=JSON.parse(readFileSync(`content/products/${name}`));
 assert.deepEqual(Object.keys(p.facets),['specialty']);
 validateContent(`content/products/${name}`,p,sources);
}
const p=JSON.parse(readFileSync('content/products/lemborexant-5.json'));
assert.throws(()=>validateContent(`content/products/${p.slug}.json`,{...p,facets:{specialty:[]}},sources));
assert.throws(()=>validateContent(`content/products/${p.slug}.json`,{...p,facets:{...p.facets,use:['obsolete']}},sources));
console.log('PASS: specialty-only filters, 42 preserved options, legacy matching, multi-select, search/reset, all product records and CMS validation.');
