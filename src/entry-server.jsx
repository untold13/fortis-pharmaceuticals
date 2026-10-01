import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./app";
import { PreferencesProvider } from "./preferences";
import { PageDataProvider } from "./page-data";
export function render(data) {
  return renderToString(<PageDataProvider value={data}><PreferencesProvider><App /></PreferencesProvider></PageDataProvider>);
}
