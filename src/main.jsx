import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./app";
import { PreferencesProvider } from "./preferences";
import { PageDataProvider } from "./page-data";
const path = location.pathname.replace(/\/$/, "") || "/";
const embedded = document.getElementById("page-data");
// The dev server serves the same CMS records; production embeds only this route's data.
const data = embedded ? JSON.parse(embedded.textContent) : import.meta.env.DEV
  ? await import("./products.js").then(({ products, sources }) => ({ products, sources, path }))
  : { products: [], sources: {}, path };
data.path = path;
const app = <PageDataProvider value={data}><PreferencesProvider><App /></PreferencesProvider></PageDataProvider>;
const container = document.getElementById("root");
if (import.meta.hot?.data.root) import.meta.hot.data.root.render(app);
else if (container.hasChildNodes()) hydrateRoot(container, app);
else {
  const root = createRoot(container);
  if (import.meta.hot) import.meta.hot.data.root = root;
  root.render(app);
}
