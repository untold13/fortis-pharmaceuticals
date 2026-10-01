import { filterDefinitions, resolveFilterSelections } from "./filter-options.js";

// Medical specialties come from reviewed, Georgian CMS product records.
export const normalizeProducts = (products) => products.map((p) => ({
  ...p,
  facets: {
    ...Object.fromEntries(filterDefinitions.map((f) => [
      f.key, resolveFilterSelections(f.key, p.facets[f.key]).selected,
    ])),
  },
}));
export const facets = filterDefinitions.map((definition) => ({
  ...definition,
  options: definition.groups.flatMap((group) => group.options),
}));
export const emptyFilters = () =>
  Object.fromEntries(facets.map((f) => [f.key, []]));
export function filterProducts(query, selected, translate = (s) => s, catalogProducts = []) {
  const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return catalogProducts.filter((p) => {
    const terms = [
      p.name,
      p.strength,
      p.form,
      p.category,
      p.tag,
      ...Object.values(p.facets).flat(),
    ];
    const searchable = [...terms, ...terms.map(translate)]
      .join(" ")
      .toLocaleLowerCase();
    return (
      tokens.every((token) => searchable.includes(token)) &&
      facets.every(
        (f) =>
          !selected[f.key]?.length ||
          selected[f.key].some((value) => p.facets[f.key].includes(value)),
      )
    );
  });
}
