import React, { useId } from "react";

// Keep every source letter and mark. The SVG mask removes neutral background
// pixels at display time; the archived JPEG is never rewritten or regenerated.
export function BrandArtwork({ symbol = false, className, label }) {
  const mask = useId().replaceAll(":", "");
  return (
    <svg
      className={className}
      viewBox={symbol ? "738 178 148 138" : "20 178 1560 138"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <filter
          id={mask}
          colorInterpolationFilters="sRGB"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4 4 0 0 -0.08"
            result="blue"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 4 -4 0 -0.08"
            result="green"
          />
          <feComposite
            in="blue"
            in2="green"
            operator="arithmetic"
            k2="1"
            k3="1"
            result="letters"
          />
          <feComposite in="SourceGraphic" in2="letters" operator="in" />
        </filter>
      </defs>
      <image
        href="/fortis-logo.jpeg"
        width="1600"
        height="533"
        filter={`url(#${mask})`}
      />
    </svg>
  );
}
