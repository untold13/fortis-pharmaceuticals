import assert from 'node:assert/strict';
import { products } from '../src/products.js';
import { facets, emptyFilters, filterProducts, catalogProducts } from '../src/catalog-model.js';
import { filterDefinitions, filterOptions, resolveFilterSelections } from '../src/filter-options.js';

assert.deepEqual(filterDefinitions.map(f=>[f.key,filterOptions[f.key].length]), [['system',9],['specialty',42],['use',45]]);
for (const f of filterDefinitions) {
  assert.equal(new Set(filterOptions[f.key]).size,filterOptions[f.key].length);
  assert.deepEqual(facets.find(x=>x.key===f.key).options,filterOptions[f.key]);
}
for (const key of ['form','strength']) {
  const expected=[...new Set(products.map(p=>p[key]))].sort((a,b)=>key==='strength'?parseFloat(a)-parseFloat(b):a.localeCompare(b));
  assert.deepEqual(facets.find(f=>f.key===key).options,expected);
}
assert.deepEqual(resolveFilterSelections('specialty',['ნევროლოგია / იმუნოლოგია / რევმატოლოგია / ფსიქიატრია']).selected,['იმუნოლოგია','ნევროლოგია','რევმატოლოგია','ფსიქიატრია']);
assert.deepEqual(resolveFilterSelections('use',['პერორალური ჰორმონალური კონტრაცეფცია']),{selected:[],unmatched:['პერორალური ჰორმონალური კონტრაცეფცია']});
assert.equal(filterProducts('',emptyFilters()).length,products.length);
const selected={...emptyFilters(),specialty:['ნევროლოგია','ფსიქიატრია'],strength:['75 მგ']};
assert.deepEqual(filterProducts('',selected).map(p=>p.slug),catalogProducts.filter(p=>p.strength==='75 მგ'&&p.facets.specialty.some(v=>selected.specialty.includes(v))).map(p=>p.slug));
assert.equal(filterProducts('',{...emptyFilters(),system:['ძვალ-კუნთოვანი სისტემა']}).length,0);
console.log('PASS: 96 approved options; original form/dose choices; legacy matching; OR within groups and AND across groups; unassigned options remain visible.');
