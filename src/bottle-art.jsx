import React from "react";

// Original vector drawing; understated motion is isolated to the bottle and cap.
export function BottleArtwork({ label }) {
  return (
    <svg
      className="bottle-art"
      viewBox="0 0 440 500"
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern
          id="bottle-hatching"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(28)"
        >
          <path d="M1 0V9" stroke="#8e551e" strokeWidth="0.7" opacity=".27" />
        </pattern>
      </defs>
      <g className="bottle-float">
        <g
          transform="rotate(-7 220 250)"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M162 113 L161 150 C158 172 127 179 119 201 C111 218 112 245 112 268 L113 414 Q111 442 141 445 Q219 453 298 445 Q325 442 324 416 L324 235 Q325 209 314 194 C301 177 277 173 276 150 L276 113Z"
            fill="#d69a46"
            fillOpacity=".24"
            stroke="#96622b"
            strokeWidth="2.4"
          />
          <path
            d="M130 214 C135 196 169 181 174 156 L174 123 L263 123 L263 157 Q266 184 294 197 Q310 209 310 236 L311 415 Q312 432 294 434 Q219 442 139 434 Q126 432 125 417L125 233"
            fill="#c48531"
            fillOpacity=".22"
          />
          <path
            d="M123 212 Q125 190 155 181 Q173 168 173 144 L174 118 L159 118 L160 151 Q158 174 132 187 Q115 198 116 234 L117 414 Q117 438 139 440 L151 441 Q132 432 133 414L130 222"
            fill="url(#bottle-hatching)"
          />
          <path
            d="M280 168 Q287 183 307 191 Q321 204 319 231 L319 417 Q320 439 295 441 L281 442 Q305 426 304 410 L305 222 Q304 199 287 190"
            fill="url(#bottle-hatching)"
          />
          <path
            d="M123 214 Q125 195 151 184 M119 237L120 392 M122 405L122 418 Q122 434 141 436 M297 187Q318 200 317 218 M316 247L317 400 M151 447Q219 454 289 447"
            fill="none"
            stroke="#8d5524"
            strokeWidth="1"
            opacity=".6"
          />
          <path
            d="M146 228 Q145 209 165 197 M142 244L142 275 M286 212Q295 220 295 236 M142 397L142 418 Q147 425 160 425"
            fill="none"
            stroke="#fff4d4"
            strokeWidth="5"
            opacity=".8"
          />
          <path
            d="M121 261 Q219 270 317 260 L317 375 Q221 387 120 375Z"
            className="bottle-label"
            stroke="#8d704a"
            strokeWidth="1.2"
          />
          <path
            d="M129 269 Q221 277 307 268 M129 367Q222 376 308 367"
            fill="none"
            stroke="#a78f68"
            strokeWidth=".65"
          />
          <g
            transform="translate(189 278) scale(.45)"
            fill="none"
            strokeWidth="6"
          >
            <path
              d="M75 27C33 25 5 34 5 43C12 59 67 64 93 52L111 14M111 14C136 4 104-10 99 5Q99 12 111 14L71 51M122 32Q141 43 131 73"
              stroke="#2884a1"
            />
            <path
              d="M131 73Q107 123 65 117Q21 109 7 66Q39 78 62 74"
              stroke="#7ea252"
            />
          </g>
          <text
            x="220"
            y="348"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="24"
            letterSpacing="5"
            fill="#2b647b"
          >
            FORTIS
          </text>
          <path
            d="M162 145Q220 151 276 144 M165 152Q219 158 274 151"
            fill="none"
            stroke="#94602d"
            strokeWidth="1.5"
          />
          <g className="bottle-cap-motion">
            <path
              d="M156 93 Q218 82 282 92 L283 128 Q220 139 156 129Z"
              className="bottle-cap"
              strokeWidth="2.3"
            />
            <path
              d="M155 94Q219 105 282 94 M158 123Q220 133 279 123"
              fill="none"
              className="bottle-cap-line"
              strokeWidth="1"
            />
            {Array.from({ length: 20 }, (_, i) => (
              <path
                key={i}
                d={`M${163 + i * 5.8} 102 l0 19`}
                className="bottle-cap-line"
                strokeWidth={i % 3 === 0 ? 1.2 : 0.7}
                fill="none"
              />
            ))}
            <path
              d="M167 92Q220 85 270 92"
              fill="none"
              className="bottle-cap-line"
              strokeWidth=".8"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
