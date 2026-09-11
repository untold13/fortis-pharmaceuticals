import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { siteCopy } from "./generated-content";
const dictionary = Object.fromEntries(
  siteCopy.map((entry) => [entry.key, entry.value]),
);

const Preferences = createContext(null);
export function translate(value) {
  if (typeof value !== "string") return value;
  const normalized = value.replace(/\s+/g, " ").trim();
  let translated = dictionary[normalized];
  if (!translated && /^\d/.test(normalized) && /\bmg\b/.test(normalized))
    translated = normalized.replace(/\bmg\b/g, "მგ");
  if (!translated) return value;
  return `${/^\s/.test(value) ? " " : ""}${translated}${/\s$/.test(value) ? " " : ""}`;
}

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  useEffect(() => {
    document.documentElement.lang = "ka";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#14243b" : "#fcfaf7");
    try {
      localStorage.setItem("fortis-theme", theme);
    } catch {
      /* Controls still work when browser storage is unavailable. */
    }
  }, [theme]);
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      t: translate,
    }),
    [theme],
  );
  return <Preferences.Provider value={value}>{children}</Preferences.Provider>;
}

export function usePreferences() {
  return useContext(Preferences);
}
