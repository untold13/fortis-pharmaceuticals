import { products } from "./products.js";
import { normalizeProducts, filterProducts as filter } from "./catalog-filter.js";
export { facets, emptyFilters } from "./catalog-filter.js";
export const catalogProducts = normalizeProducts(products);
export const filterProducts = (query, selected, translate) => filter(query, selected, translate, catalogProducts);
