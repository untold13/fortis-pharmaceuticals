import React from "react";
import assets from "./generated-artwork.json";
import { usePreferences } from "./preferences";

// Both supplied logos retain their original lettering; the night SVG removes its gray matte.
export function BrandArtwork({ className, label }) {
  const { theme } = usePreferences();
  const night = theme === "dark";
  return (
    <img
      className={className}
      src={night ? assets.logoNight : assets.logo}
      width={night ? 1330 : 2206}
      height={night ? 440 : 713}
      alt={label || ""}
      aria-hidden={label ? undefined : true}
    />
  );
}
