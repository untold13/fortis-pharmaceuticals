export const allowedSourceHosts = new Set([
  "www.accessdata.fda.gov",
  "www.ema.europa.eu",
  "jamanetwork.com",
  "pmc.ncbi.nlm.nih.gov",
  "www.fda.gov",
  "precision.fda.gov",
]);
export const isImagePath = (s) =>
  typeof s === "string" &&
  /^\/(products|uploads)\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp)$/i.test(s) &&
  !s.includes("..");
export const allowedContentPath = (p) =>
  typeof p === "string" &&
  (/^content\/products\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(p) ||
    ["content/copy.json", "content/home.json", "content/sources.json"].includes(
      p,
    ));
const plain = (v) =>
  v !== null &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.getPrototypeOf(v) === Object.prototype;
const keys = (o, allowed) => {
  if (!plain(o) || Object.keys(o).some((k) => !allowed.includes(k)))
    fail("Unexpected content fields.");
};
const fail = (s) => {
  const e = new Error(s);
  e.status = 400;
  throw e;
};
export function validateContent(path, data, sourceIDs = []) {
  const inspect = (v, depth = 0) => {
    if (depth > 15) fail("Content nesting is too deep.");
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        if (["__proto__", "prototype", "constructor"].includes(k))
          fail("Invalid content key.");
        inspect(v[k], depth + 1);
      }
    }
  };
  inspect(data);
  if (
    !allowedContentPath(path) ||
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  )
    fail("Invalid content destination.");
  if (JSON.stringify(data).length > 500000) fail("Content is too large.");
  if (path.startsWith("content/products/")) {
    keys(data, [
      "name",
      "category",
      "tag",
      "context",
      "caution",
      "note",
      "refs",
      "slug",
      "strength",
      "pack",
      "form",
      "image",
      "featured",
      "published",
      "order",
      "facets",
      "ka",
      "packUnit",
      "preparation",
      "infoOverview",
      "infoUse",
      "infoStorage",
    ]);
    if (data.ka)
      keys(data.ka, [
        "name",
        "category",
        "tag",
        "context",
        "caution",
        "note",
        "form",
        "facets",
        "packUnit",
        "preparation",
        "infoOverview",
        "infoUse",
        "infoStorage",
      ]);
    for (const facets of [data.facets, data.ka?.facets])
      if (facets) keys(facets, ["specialty", "use", "system"]);
    if (path !== `content/products/${data.slug}.json`)
      fail("Keep the product page address unchanged.");
    if (typeof data.published !== "boolean")
      fail("Choose draft or published status.");
    for (const key of [
      "name",
      "strength",
      "form",
      "packUnit",
      "preparation",
      "image",
      "category",
      "tag",
      "context",
      "caution",
      "note",
      "infoOverview",
      "infoUse",
      "infoStorage",
    ])
      if (data[key] !== undefined && typeof data[key] !== "string")
        fail("Product text must be plain text.");
    if (
      (data.featured !== undefined && typeof data.featured !== "boolean") ||
      (data.order !== undefined && !Number.isFinite(data.order))
    )
      fail("Choose a valid display order and featured status.");
    if (!plain(data.ka) || !Array.isArray(data.refs))
      fail("Include Georgian content and a reference list.");
    for (const value of Object.values(data.ka))
      if (value !== data.ka.facets && typeof value !== "string")
        fail("Georgian product text must be plain text.");
    for (const facets of [data.facets, data.ka.facets])
      for (const key of ["specialty", "use", "system"])
        if (
          !Array.isArray(facets?.[key]) ||
          facets[key].some((v) => typeof v !== "string")
        )
          fail("Catalog filters must be text lists.");
    const informationFields = ["infoOverview", "infoUse", "infoStorage"];
    if (
      informationFields.some((key) => data[key] || data.ka?.[key]) &&
      informationFields.some(
        (key) =>
          typeof data[key] !== "string" ||
          !data[key].trim() ||
          typeof data.ka?.[key] !== "string" ||
          !data.ka[key].trim(),
      )
    )
      fail("Complete all product information fields in both languages.");
    if (!data.published) return;
    if (!Number.isInteger(data.pack) || data.pack < 1)
      fail("Pack quantity must be a positive whole number.");
    if (!isImagePath(data.image)) fail("Choose a PNG, JPEG or WebP image.");
    for (const language of ["en", "ka"])
      for (const key of [
        "name",
        "form",
        "packUnit",
        "preparation",
        "category",
        "tag",
        "context",
        "caution",
        "note",
      ])
        if (
          typeof (language === "en" ? data : data.ka)?.[key] !== "string" ||
          !(language === "en" ? data : data.ka)[key].trim()
        )
          fail(`Complete ${language.toUpperCase()} ${key}.`);
    if (typeof data.strength !== "string" || !data.strength.trim())
      fail("Enter the strength or “Not specified”.");
    for (const key of ["specialty", "use", "system"])
      if (
        !Array.isArray(data.facets?.[key]) ||
        !data.facets[key].length ||
        data.facets[key].some((s) => typeof s !== "string" || !s.trim()) ||
        !Array.isArray(data.ka?.facets?.[key]) ||
        data.facets[key].length !== data.ka.facets[key].length ||
        data.ka.facets[key].some((s) => typeof s !== "string" || !s.trim())
      )
        fail(
          `English and Georgian ${key} lists must match in length and order.`,
        );
    if (
      !Array.isArray(data.refs) ||
      !data.refs.length ||
      data.refs.some((id) => !sourceIDs.includes(id))
    )
      fail("Select valid clinical references before publishing.");
  }
  if (path === "content/copy.json") {
    keys(data, ["entries"]);
    if (
      !Array.isArray(data.entries) ||
      new Set(data.entries.map((e) => e?.key)).size !== data.entries.length
    )
      fail("Website text identifiers must be unique.");
    for (const e of data.entries) {
      keys(e, ["key", "en", "ka"]);
      if (["key", "en", "ka"].some((k) => typeof e[k] !== "string"))
        fail("Complete both languages for each text.");
    }
  }
  if (path === "content/home.json") {
    keys(data, ["sections"]);
    if (!Array.isArray(data.sections)) fail("Sections must be a list.");
    for (const s of data.sections) {
      keys(s, ["published", "page", "en", "ka", "image"]);
      for (const l of ["en", "ka"]) keys(s[l], ["title", "body", "imageAlt"]);
      if (typeof s.published !== "boolean")
        fail("Choose draft or published section status.");
      for (const l of ["en", "ka"])
        for (const value of Object.values(s[l]))
          if (typeof value !== "string")
            fail("Section content must be plain text.");
      if (!s.published) continue;
      if (
        !["/", "/about", "/compounding", "/contact", "/products"].includes(
          s.page,
        )
      )
        fail("Select a valid destination page.");
      for (const l of ["en", "ka"])
        for (const k of ["title", "body"])
          if (typeof s[l]?.[k] !== "string" || !s[l][k].trim())
            fail("Complete both languages for each section.");
      if (s.image && !isImagePath(s.image))
        fail("Choose a PNG, JPEG or WebP section image.");
    }
  }
  if (path === "content/sources.json") {
    keys(data, ["sources"]);
    if (
      !Array.isArray(data.sources) ||
      new Set(data.sources.map((s) => s?.id)).size !== data.sources.length
    )
      fail("Source identifiers must be unique.");
    for (const s of data.sources) {
      keys(s, ["id", "title", "titleKa", "url"]);
      let url;
      try {
        url = new URL(s.url);
      } catch {
        fail("Enter a valid source URL.");
      }
      if (
        ["id", "title", "titleKa", "url"].some(
          (k) => typeof s[k] !== "string",
        ) ||
        !/^[a-z0-9_]+$/.test(s.id) ||
        !s.title?.trim() ||
        !s.titleKa?.trim() ||
        url.protocol !== "https:" ||
        !allowedSourceHosts.has(url.hostname)
      )
        fail(
          "Use a complete FDA, EMA, JAMA or original PMC journal reference.",
        );
    }
  }
}
