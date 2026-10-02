// Directions currently approved by the user.
export const filterDefinitions = [
  {
    "key": "specialty",
    "label": "მიმართულება",
    "groups": [
      {
        "label": "",
        "options": [
          "ალერგოლოგია",
          "გასტროენტეროლოგია"
        ]
      }
    ]
  }
];

export const filterOptions = Object.fromEntries(
  filterDefinitions.map((f) => [f.key, f.groups.flatMap((g) => g.options)]),
);

const previousLabels = {};

export function resolveFilterSelections(key, values = []) {
  const allowed = filterOptions[key] || [];
  const selected = new Set();
  const unmatched = [];
  for (const original of values) {
    const value = original.trim();
    const parts = allowed.includes(value) || previousLabels[key]?.[value]
      ? [value]
      : key === "specialty" ? value.split(/\s*[,/]\s*/) : [value];
    for (const part of parts) {
      const matches = allowed.includes(part) ? [part] : previousLabels[key]?.[part];
      if (matches) matches.forEach((v) => selected.add(v));
      else if (part) unmatched.push(part);
    }
  }
  return { selected: allowed.filter((v) => selected.has(v)), unmatched: [...new Set(unmatched)] };
}
