// Build actual page markup and route-specific data, then hydrate it in the browser.
import fs from "node:fs/promises";
import { products, sources } from "../src/products.js";
import { render } from "../.ssr/entry-server.js";
const template = await fs.readFile("dist/index.html", "utf8");
const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const summaryKeys = ["slug", "name", "strength", "pack", "packUnit", "form", "preparation", "category", "tag", "facets", "featured", "image", "imageSrcSet", "imageWidth", "imageHeight"];
const summary = p => Object.fromEntries(summaryKeys.map(key => [key, p[key]]));
const pages = [
  ["", "ფორტის ფარმაცეუტიკალსი — პერსონალური ფარმაცია თბილისში"],
  ["compounding", "პერსონალური ფარმაცია"], ["about", "ჩვენი ისტორია და ლაბორატორია"],
  ["products", "პრეპარატების კატალოგი"], ["partners", "პარტნიორები"],
  ["contact", "კონტაქტი"], ["editorial", "ინფორმაცია და წყაროები"], ["privacy", "კონფიდენციალურობა"],
  ...products.map(p => [`products/${p.slug}`, `${p.name} ${p.strength} - ${p.pack} ${p.packUnit}`]),
  ["404", "გვერდი ვერ მოიძებნა"],
];
for (const [route, title] of pages) {
  const product = products.find(p => route === `products/${p.slug}`);
  const data = {
    path: `/${route}`,
    products: product ? [product] : route === "products" ? products.map(summary) : route === "" ? products.filter(p => p.featured).map(summary) : [],
    sources: product ? Object.fromEntries(product.refs.map(key => [key, sources[key]])) : {},
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const markup = render(data);
  let html = template.replace(/<title>.*?<\/title>/, `<title>${escapeHTML(title)}${route ? " | ფორტის ფარმაცეუტიკალსი" : ""}</title>`)
    .replace('<div id="root"></div>', `<div id="root">${markup}</div><script id="page-data" type="application/json">${json}</script>`);
  // Discover the Georgian text font before the render-blocking stylesheet finishes.
  const assets = await fs.readdir("dist/assets");
  const font = assets.find(name => /^noto-sans-georgian-georgian-.*\.woff2$/.test(name));
  if (font) html = html.replace("</head>", `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin /></head>`);
  const file = route === "404" ? "dist/404.html" : route ? `dist/${route}/index.html` : "dist/index.html";
  if (route && route !== "404") await fs.mkdir(`dist/${route}`, { recursive: true });
  await fs.writeFile(file, html);
}
await fs.writeFile("dist/robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n");
console.log(`Pre-rendered ${pages.length} pages with visible content and route-specific data.`);
