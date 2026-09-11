import { products } from "./products.js";

// Separate dimensions come from reviewed, Georgian CMS product records.
export const catalogProducts = products.map((p) => ({
  ...p,
  facets: { ...p.facets, strength: [p.strength], form: [p.form] },
}));
export const facets = [
  { key: "strength", label: "დოზა" },
  { key: "specialty", label: "სპეციალობა" },
  { key: "use", label: "გამოყენების სფერო" },
  { key: "system", label: "ორგანოთა სისტემა" },
  { key: "form", label: "ფორმა" },
].map((f) => ({
  ...f,
  options: [...new Set(catalogProducts.flatMap((p) => p.facets[f.key]))].sort(
    (a, b) =>
      f.key === "strength" ? parseFloat(a) - parseFloat(b) : a.localeCompare(b),
  ),
}));
export const emptyFilters = () =>
  Object.fromEntries(facets.map((f) => [f.key, []]));
export function filterProducts(query, selected, translate = (s) => s) {
  const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return catalogProducts.filter((p) => {
    const terms = [
      p.name,
      p.strength,
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
