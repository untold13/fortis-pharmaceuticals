// Static route documents support direct product links, SEO metadata and a real 404.
import fs from "node:fs/promises";
import { products } from "../src/products.js";
const template = await fs.readFile("dist/index.html", "utf8");
const withoutHeroPreload = template.replace(
  /<link\b[^>]*rel="preload"[^>]*as="image"[^>]*>/g,
  "",
);
const escapeHTML = (text) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pages = [
  ["compounding", "ინდივიდუალური კომპოზიტური ფარმაცია"],
  ["about", "ჩვენი ისტორია და ლაბორატორია"],
  ["products", "პრეპარატების კატალოგი"],
  ["contact", "დაუკავშირდით ფორტისს თბილისში"],
  ["editorial", "ინფორმაცია და წყაროები"],
  ["privacy", "კონფიდენციალურობა"],
  ...products.map((p) => [
    `products/${p.slug}`,
    `${p.name} ${p.strength} - ${p.pack} ${p.packUnit}`,
  ]),
];
for (const [route, title] of pages) {
  const product = products.find((p) => route === `products/${p.slug}`);
  const pageTemplate = product
    ? withoutHeroPreload.replace(
        "</head>",
        `<link rel="preload" as="image" href="${product.image}" fetchpriority="high" /></head>`,
      )
    : withoutHeroPreload;
  await fs.mkdir(`dist/${route}`, { recursive: true });
  await fs.writeFile(
    `dist/${route}/index.html`,
    pageTemplate.replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHTML(title)} | ფორტის ფარმაცევტიკალსი</title>`,
    ),
  );
}
await fs.writeFile(
  "dist/404.html",
  withoutHeroPreload.replace(
    /<title>.*?<\/title>/,
    "<title>გვერდი ვერ მოიძებნა | ფორტის ფარმაცევტიკალსი</title>",
  ),
);
await fs.writeFile(
  "dist/robots.txt",
  "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n",
);
console.log(`Generated ${pages.length + 1} route documents and 404 page.`);
