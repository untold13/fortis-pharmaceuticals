// Filter labels supplied in ფილტრი.docx. Keep wording and order intact.
export const filterDefinitions = [
  {
    "key": "specialty",
    "label": "სამედიცინო სპეციალობა",
    "groups": [
      {
        "label": "",
        "options": [
          "ალგოლოგია (ტკივილის მედიცინა)",
          "ალერგოლოგია",
          "ანგიოლოგია / სისხლძარღვთა ქირურგია",
          "ანდროლოგია",
          "ბარიატრია",
          "გასტროენტეროლოგია",
          "გერიატრია",
          "გინეკოლოგია / მეანობა",
          "დერმატოლოგია",
          "ენდოკრინოლოგია",
          "თერაპია / ოჯახის მედიცინა / საოჯახო მედიცინა",
          "იმუნოლოგია",
          "ინტიმური ჰიგიენა",
          "ინფექციური დაავადებები",
          "კარდიოლოგია",
          "კოსმეტოლოგია",
          "მიკოლოგია",
          "მცირე ქირურგია",
          "ნარკოლოგია",
          "ნევროლოგია",
          "ნეიროქირურგია",
          "ნუტრიციოლოგია",
          "ონკოლოგია",
          "ორთოპედია / ტრავმატოლოგია",
          "ოტო-რინო-ლარინგოლოგია (ყელ-ყურ-ცხვირი)",
          "ოფთალმოლოგია",
          "პედიატრია",
          "პედიატრიული დერმატოლოგია",
          "პროქტოლოგია",
          "რევმატოლოგია",
          "სექსოლოგია",
          "სპორტული მედიცინა",
          "სტომატოლოგია",
          "ტრიქოლოგია",
          "უროლოგია",
          "ფლებოლოგია",
          "ფსიქიატრია",
          "ფსიქოთერაპია",
          "ქირურგია",
          "ძილის მედიცინა",
          "ჰემატოლოგია",
          "ჰიგიენა"
        ]
      }
    ]
  }
];

export const filterOptions = Object.fromEntries(
  filterDefinitions.map((f) => [f.key, f.groups.flatMap((g) => g.options)]),
);

const previousLabels = {
  "specialty": {
    "თერაპია": [
      "თერაპია / ოჯახის მედიცინა / საოჯახო მედიცინა"
    ],
    "გინეკოლოგია": [
      "გინეკოლოგია / მეანობა"
    ]
  }
};

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
