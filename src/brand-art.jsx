import React from "react";

// The supplied full logo retains its original lettering and transparent background.
export function BrandArtwork({ className, label }) {
  return (
    <img
      className={className}
      src="/fortis-logo.png"
      width="2206"
      height="713"
      alt={label || ""}
      aria-hidden={label ? undefined : true}
    />
  );
}
