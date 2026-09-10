import React from "react";

// Landscape and thumb choreography based on the user's Lior Ullert reference.
// Decorative SVG stays inside a native, keyboard-operable switch button.
export function ThemeArtwork() {
  return (
    <span className="theme-landscape" aria-hidden="true">
      <svg viewBox="0 0 100 48" focusable="false">
        <g className="landscape-day">
          <circle cx="56" cy="34" r="11" fill="#ffe792" />
          <path
            d="M13 13q0-4 4-4q2-5 6-2q5-1 5 4h-15M52 12q0-3 3-3q1-4 5-2q3-1 4 3H52"
            fill="#e2eafa"
            opacity=".8"
          />
        </g>
        <g className="landscape-night" fill="#eff6ff">
          <path d="M29 10a8 8 0 1 0 7 12a8 8 0 0 1-7-12" />
          <circle cx="13" cy="21" r=".9" />
          <circle cx="44" cy="9" r=".9" />
          <circle cx="53" cy="18" r=".7" />
          <circle cx="64" cy="7" r="1" />
          <circle cx="77" cy="22" r=".8" />
          <circle cx="91" cy="13" r=".8" />
        </g>
        <path
          className="landscape-far"
          d="M0 37Q16 25 31 34Q51 24 67 34Q84 28 100 38V48H0Z"
        />
        <g className="landscape-tree">
          <path
            d="M65 0H101V15Q95 23 87 19Q76 25 70 17Q60 16 65 8Z"
            fill="#90c59a"
          />
          <path d="M65 0Q68 14 81 11Q88 21 96 8L101 0" fill="#77b586" />
          <path
            d="M82 0L83 16Q83 26 78 35L89 38Q84 25 87 16L97 9M86 15L86 2M84 19L74 10L72 4M82 13L77 9"
            fill="#a88960"
            stroke="#a88960"
            strokeWidth="1.5"
          />
        </g>
        <path
          className="landscape-mid"
          d="M0 38Q26 27 54 39Q76 30 100 39V48H0Z"
        />
        <path
          className="landscape-near"
          d="M0 43Q28 33 53 43Q80 45 100 39V48H0Z"
        />
        <path
          className="landscape-shrub"
          d="M20 36q2-5 5-3q3-4 6 1l5 3ZM56 39q2-4 5-2q3-3 5 2Z"
        />
      </svg>
      <span className="theme-thumb" />
    </span>
  );
}
