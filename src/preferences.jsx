import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products, sources } from "./products";
import { siteCopy } from "./generated-content";
const dictionary = Object.fromEntries(
  siteCopy.map((e) => [e.key, { en: e.en, ka: e.ka }]),
);
for (const p of products) {
  for (const key of [
    "name",
    "category",
    "tag",
    "context",
    "caution",
    "note",
    "form",
    "packUnit",
    "preparation",
  ])
    if (p.ka?.[key]) dictionary[p[key]] = { en: p[key], ka: p.ka[key] };
  for (const key of ["specialty", "use", "system"])
    p.facets[key].forEach((value, i) => {
      dictionary[value] = { en: value, ka: p.ka.facets[key][i] };
    });
}
for (const source of Object.values(sources))
  dictionary[source.title] = { en: source.title, ka: source.titleKa };

const Preferences = createContext(null);
export function translate(value, language = "en") {
  if (typeof value !== "string") return value;
  const normalized = value.replace(/\s+/g, " ").trim();
  let translated = dictionary[normalized]?.[language];
  if (
    !translated &&
    language === "ka" &&
    /^\d/.test(normalized) &&
    /\bmg\b/.test(normalized)
  )
    translated = normalized.replace(/\bmg\b/g, "მგ");
  if (!translated) return value;
  return `${/^\s/.test(value) ? " " : ""}${translated}${/\s$/.test(value) ? " " : ""}`;
}

export function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() =>
    document.documentElement.lang === "ka" ? "ka" : "en",
  );
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111e27" : "#ffffff");
    try {
      localStorage.setItem("fortis-language", language);
      localStorage.setItem("fortis-theme", theme);
    } catch {
      /* Controls still work when browser storage is unavailable. */
    }
  }, [language, theme]);
  const value = useMemo(
    () => ({
      language,
      theme,
      setLanguage,
      setTheme,
      t: (text) => translate(text, language),
    }),
    [language, theme],
  );
  return <Preferences.Provider value={value}>{children}</Preferences.Provider>;
}

export function usePreferences() {
  return useContext(Preferences);
}
