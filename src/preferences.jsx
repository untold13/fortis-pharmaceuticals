import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import georgian from "./ka.json";
import clinical from "./ka-products.json";
import { families, sources } from "./products";

const dictionary = { ...georgian, ...clinical.names };
for (const [key, fields] of Object.entries(clinical.families)) {
  for (const [field, translation] of Object.entries(fields))
    dictionary[families[key][field]] = translation;
}
for (const [key, translation] of Object.entries(clinical.sources))
  dictionary[sources[key].title] = translation;

const Preferences = createContext(null);
export function translate(value, language = "en") {
  if (language !== "ka" || typeof value !== "string") return value;
  const normalized = value.replace(/\s+/g, " ").trim();
  let translated = dictionary[normalized];
  if (!translated && /^\d/.test(normalized) && /\bmg\b/.test(normalized)) {
    translated = normalized.replace(/\bmg\b/g, "მგ");
  }
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
