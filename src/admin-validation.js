const imagePath = (value) =>
  /^\/(products|uploads)\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp)$/i.test(
    value || "",
  ) && !value.includes("..");
const fail = (message) => {
  throw new Error(message);
};
export function validateEntry(data, sourceIds) {
  if (data.slug && data.published) {
    if (!imagePath(data.image))
      fail(
        "Choose a PNG, JPEG or WebP image from Products or Uploads. / აირჩიეთ PNG, JPEG ან WebP სურათი.",
      );
    for (const key of ["specialty", "use", "system"])
      if (
        !data.facets?.[key]?.length ||
        data.facets[key].length !== data.ka?.facets?.[key]?.length
      )
        fail(
          `English and Georgian ${key} lists must contain the same number of items, in matching order. / ინგლისური და ქართული ფილტრების რაოდენობა და თანმიმდევრობა უნდა ემთხვეოდეს.`,
        );
    if (!data.refs?.length || data.refs.some((id) => !sourceIds.includes(id)))
      fail(
        "Select valid clinical references. Save new sources first, then choose them here. / აირჩიეთ კლინიკური წყაროები; ახალი წყარო ჯერ შეინახეთ.",
      );
  }
  for (const section of data.sections || [])
    if (section.published && section.image && !imagePath(section.image))
      fail(
        "Section images must be PNG, JPEG or WebP uploads. / სექციის სურათი უნდა იყოს PNG, JPEG ან WebP.",
      );
  for (const key of ["entries", "sources"])
    if (data[key]) {
      const ids = data[key].map((e) => e[key === "entries" ? "key" : "id"]);
      if (new Set(ids).size !== ids.length)
        fail(
          `Duplicate ${key} identifiers. Each must be unique. / თითოეული კოდი უნიკალური უნდა იყოს.`,
        );
    }
}
export async function preSave({ entry }) {
  const data = entry.get("data").toJS();
  let ids = [];
  if (data.slug && data.published) {
    // Public, current repository data. No credentials or patient data are sent.
    const response = await fetch(
      "https://api.github.com/repos/untold13/fortis-pharmaceuticals/contents/content/sources.json?ref=main",
      {
        headers: { Accept: "application/vnd.github.raw+json" },
        cache: "no-store",
      },
    );
    if (!response.ok)
      fail(
        "Cannot check current clinical sources. Please try saving again. / წყაროების შემოწმება ვერ მოხერხდა. სცადეთ ხელახლა.",
      );
    ids = (await response.json()).sources.map((s) => s.id);
  }
  validateEntry(data, ids);
}
