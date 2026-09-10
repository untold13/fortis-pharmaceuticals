const text = (name, label, extra = {}) => ({
  name,
  label,
  widget: "string",
  ...extra,
});
const paragraph = (name, label, extra = {}) => ({
  name,
  label,
  widget: "text",
  ...extra,
});
const terms = (name, label) => ({
  name,
  label,
  widget: "list",
  allow_add: true,
  field: text("value", label),
  min: 1,
});
const facets = (language) => ({
  name: "facets",
  label: language === "ka" ? "ფილტრები ქართულად" : "Filters in English",
  widget: "object",
  fields: [
    terms("specialty", "Medical specialty / სპეციალობა"),
    terms("use", "Use context / გამოყენების სფერო"),
    terms("system", "Body system / ორგანოთა სისტემა"),
  ],
});
const clinicalFields = (language) => [
  text(
    "name",
    language === "ka" ? "დასახელება ქართულად" : "Product name in English",
  ),
  text(
    "form",
    language === "ka" ? "წამლის ფორმა ქართულად" : "Dosage form in English",
    { default: language === "ka" ? "ტაბლეტი" : "Tablet" },
  ),
  text("packUnit", language === "ka" ? "შეფუთვის ერთეული" : "Pack unit", {
    default: language === "ka" ? "ტაბლეტი" : "tablets",
    hint: "Label after the quantity, e.g. capsules / კაფსულა.",
  }),
  text(
    "preparation",
    language === "ka" ? "მომზადება და მიღების გზა" : "Preparation and route",
    {
      default:
        language === "ka" ? "კომპოზიტური · პერორალური" : "Compounded · oral",
    },
  ),
  text(
    "category",
    language === "ka" ? "სამედიცინო მიმართულება" : "Area of care",
  ),
  text("tag", language === "ka" ? "მოკლე აღწერა" : "Short descriptive label"),
  paragraph(
    "context",
    language === "ka"
      ? "მოქმედი ნივთიერების კლინიკური კონტექსტი"
      : "Ingredient clinical context",
  ),
  paragraph(
    "caution",
    language === "ka"
      ? "კლინიკური სიფრთხილის საკითხები"
      : "Clinical considerations and cautions",
  ),
  paragraph(
    "note",
    language === "ka"
      ? "კონკრეტული ფორმულის შეზღუდვები"
      : "Formulation and evidence limitations",
  ),
  facets(language),
];
const sectionFields = (language) => ({
  name: language,
  label: language === "ka" ? "ქართული" : "English",
  widget: "object",
  fields: [
    text("title", "Section title / სათაური"),
    paragraph("body", "Body text / ტექსტი", {
      hint: "Separate paragraphs with a blank line.",
    }),
    text("imageAlt", "Image description / სურათის აღწერა", { required: false }),
  ],
});

export const adminConfig = {
  load_config_file: false,
  backend: {
    name: "github",
    repo: "untold13/fortis-pharmaceuticals",
    branch: "main",
    base_url: "https://fortis-pharmaceuticals.vercel.app",
    auth_endpoint: "api/cms-auth",
    site_domain: "fortis-pharmaceuticals.vercel.app",
    use_graphql: false,
  },
  logo_url: "/fortis-logo.jpeg",
  site_url: "https://fortis-pharmaceuticals.vercel.app",
  display_url: "https://fortis-pharmaceuticals.vercel.app",
  media_folder: "public/uploads",
  public_folder: "/uploads",
  slug: { encoding: "ascii", clean_accents: true, sanitize_replacement: "-" },
  editor: { preview: false },
  collections: [
    {
      name: "products",
      label: "Products / პრეპარატები",
      label_singular: "Product / პრეპარატი",
      folder: "content/products",
      extension: "json",
      format: "json",
      create: true,
      delete: true,
      identifier_field: "slug",
      slug: "{{slug}}",
      summary: "{{name}} · {{strength}} · {{pack}}",
      sortable_fields: ["order", "name"],
      view_filters: [
        {
          label: "Published / გამოქვეყნებული",
          field: "published",
          pattern: true,
        },
        { label: "Draft / მონახაზი", field: "published", pattern: false },
      ],
      fields: [
        text("slug", "Page address / გვერდის მისამართი", {
          pattern: [
            "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            "Use lowercase Latin letters, numbers and hyphens.",
          ],
          hint: "Unique permanent address, e.g. ingredient-25. Keep existing addresses unchanged.",
        }),
        {
          name: "published",
          label: "Visible on website / გამოჩნდეს ვებგვერდზე",
          widget: "boolean",
          default: false,
          hint: "Off keeps the record out of public pages and filters. Publish only professionally reviewed content.",
        },
        {
          name: "featured",
          label: "Featured on homepage / მთავარ გვერდზე",
          widget: "boolean",
          default: false,
        },
        {
          name: "order",
          label: "Display order / თანმიმდევრობა",
          widget: "number",
          value_type: "int",
          min: 1,
          default: 100,
        },
        text("strength", "Strength / დოზა", {
          hint: "Use mg, e.g. 25 mg or 30 mg / 25 mg. Georgian units are displayed automatically.",
        }),
        {
          name: "pack",
          label: "Pack quantity / რაოდენობა შეფუთვაში",
          widget: "number",
          value_type: "int",
          min: 1,
          default: 30,
        },
        {
          name: "image",
          label: "Product image / პროდუქტის სურათი",
          widget: "image",
          choose_url: false,
          allow_multiple: false,
          hint: "PNG, JPEG or WebP; original pixels are preserved. No actual patient information.",
        },
        ...clinicalFields("en"),
        {
          name: "ka",
          label: "ქართული კლინიკური ინფორმაცია",
          widget: "object",
          fields: clinicalFields("ka"),
        },
        {
          name: "refs",
          label: "Clinical references / კლინიკური წყაროები",
          widget: "relation",
          collection: "website",
          file: "sources",
          search_fields: ["sources.*.title", "sources.*.titleKa"],
          value_field: "sources.*.id",
          display_fields: ["sources.*.title"],
          multiple: true,
          min: 1,
          options_length: 50,
        },
      ],
    },
    {
      name: "website",
      label: "Website content / ვებგვერდის ტექსტი",
      files: [
        {
          name: "copy",
          label: "Existing text / არსებული ტექსტები",
          file: "content/copy.json",
          fields: [
            {
              name: "entries",
              label: "Text blocks / ტექსტები",
              widget: "list",
              allow_add: false,
              collapsed: true,
              summary: "{{fields.en}}",
              fields: [
                { name: "key", widget: "hidden" },
                paragraph("en", "English"),
                paragraph("ka", "ქართული"),
              ],
            },
          ],
        },
        {
          name: "sections",
          label: "Add content sections / ახალი სექციები",
          file: "content/home.json",
          fields: [
            {
              name: "sections",
              label: "Additional sections / დამატებითი სექციები",
              widget: "list",
              collapsed: true,
              summary: "{{fields.en.title}}",
              fields: [
                {
                  name: "published",
                  label: "Visible on website / გამოჩნდეს ვებგვერდზე",
                  widget: "boolean",
                  default: false,
                },
                {
                  name: "page",
                  label: "Destination page / გვერდი",
                  widget: "select",
                  options: [
                    { label: "Homepage / მთავარი", value: "/" },
                    { label: "About / ჩვენ შესახებ", value: "/about" },
                    {
                      label: "Compounding / კომპოზიტური ფარმაცია",
                      value: "/compounding",
                    },
                    { label: "Contact / კონტაქტი", value: "/contact" },
                    { label: "Products / პროდუქტები", value: "/products" },
                  ],
                  default: "/",
                },
                sectionFields("en"),
                sectionFields("ka"),
                {
                  name: "image",
                  label: "Optional image / სურათი",
                  widget: "image",
                  choose_url: false,
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: "sources",
          label: "Clinical references / კლინიკური წყაროები",
          file: "content/sources.json",
          fields: [
            {
              name: "sources",
              label: "Sources / წყაროები",
              widget: "list",
              collapsed: true,
              summary: "{{fields.id}} · {{fields.title}}",
              fields: [
                text("id", "Source ID / წყაროს კოდი", {
                  pattern: [
                    "^[a-z0-9_]+$",
                    "Lowercase letters, numbers and underscores.",
                  ],
                }),
                text("title", "English source title"),
                text("titleKa", "წყაროს სათაური ქართულად"),
                text("url", "Official source URL / ოფიციალური წყაროს ბმული", {
                  pattern: [
                    "^https://(www\\.accessdata\\.fda\\.gov|www\\.ema\\.europa\\.eu|jamanetwork\\.com|pmc\\.ncbi\\.nlm\\.nih\\.gov|www\\.fda\\.gov)/",
                    "Use an approved FDA, EMA, JAMA or original PMC journal source.",
                  ],
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
};
