import { products } from "./products.js";

// Navigation metadata is grounded in each family's cited clinical context.
// These facets never assert an approved indication for a Fortis preparation.
const context = {
  ldn: {
    specialty: ["Pain medicine / research"],
    use: ["Pain research (off-label)"],
    system: ["Individualized / research context"],
  },
  naltrexone: {
    specialty: ["Addiction medicine"],
    use: [
      "Alcohol dependence (reference context)",
      "Opioid blockade (reference context)",
    ],
    system: ["Brain & nervous system"],
  },
  combination: {
    specialty: ["Obesity medicine"],
    use: ["Weight management (reference context)"],
    system: ["Weight regulation / metabolic context"],
  },
  bupropion: {
    specialty: ["Psychiatry"],
    use: ["Depression (reference context)"],
    system: ["Brain & nervous system"],
  },
  modafinil: {
    specialty: ["Sleep medicine"],
    use: ["Excessive sleepiness (reference context)"],
    system: ["Brain & nervous system"],
  },
  minoxidil: {
    specialty: ["Dermatology"],
    use: ["Hair loss (off-label)"],
    system: ["Skin & hair"],
  },
  lemborexant: {
    specialty: ["Sleep medicine"],
    use: ["Insomnia (reference context)"],
    system: ["Brain & nervous system"],
  },
};
export const catalogProducts = products.map((p) => ({
  ...p,
  facets: { ...context[p.family], strength: [p.strength], form: ["Tablet"] },
}));
export const facets = [
  { key: "strength", label: "Strength" },
  { key: "specialty", label: "Medical specialty" },
  { key: "use", label: "Use context" },
  { key: "system", label: "Body system" },
  { key: "form", label: "Form" },
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
