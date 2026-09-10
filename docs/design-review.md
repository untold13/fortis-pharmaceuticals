# Fortis frontend design review

Applied skill: `/home/untold13/.codex/skills/design-taste-frontend/SKILL.md` from Leonxlnx/taste-skill.

## Design read

Professional compounding-pharmacy portfolio for patients and healthcare professionals. Calm, clear, credible and rooted in the supplied Fortis identity. Targeted visual refinement of the existing functional build, using native CSS and the existing React components, rather than adopting an unrelated vendor design system.

DESIGN_VARIANCE: 4. MOTION_INTENSITY: 1. VISUAL_DENSITY: 4.

User overrides: basic static hero; original product images unchanged; white/pale-gray visual direction, blue CTA and restrained green brand details; exactly four featured cards and ten independent catalog/detail pages. These override skill defaults on animation, generated imagery, dark mode and single-accent palettes. Existing Lucide family is retained under the skill's existing-dependency exception.

## Audit before refinement

- Brand: blue `#1766a4`, navy `#173346`, restrained green `#77985c`; DM Sans and Manrope; supplied bilingual logo. Existing 3-6px control/image radii were inconsistent.
- Architecture: `/`, `/compounding`, `/about`, `/products`, `/contact`, ten `/products/:slug` routes, `/editorial` and `/privacy`. Preserve these paths and navigation labels.
- Existing behavior: all product cards are links; local search and area-of-care filters; native expandable FAQ; no checkout or patient collection.
- Preserve: original packaging, readable clinical context and references, company content, accessible focus states, contact details.
- Retire: repeated decorative eyebrows/dots, oversized stacked hero typography, decorative hero signature and text strip, image-overlay category labels, diagram-like decorative laboratory panel, and inverted call-to-action section.
- SEO baseline: new unpublished site, route-specific titles generated at build; no existing ranking or URL migration. Improve description and social metadata without changing routes.

## Refinement plan

Self-host fonts with swap, increase navigation/body readability, shorten the hero text stack, give the unchanged bottle photograph a deliberate framed area, move category labels below product photos, use a consistent 4px radius, unify light surfaces, and simplify company sections. Clinical caveats remain readable and complete on detail pages rather than being shortened to a marketing word limit.

## Content and image exceptions

Original illustrations contain placeholder clinical label content; the user explicitly instructed that the images remain unchanged. Public captions and the editorial page distinguish illustrations from dispensing directions. No clinical directions are extracted into the site copy. No invented testimonials, partnerships, operating hours or laboratory photography.

## Final verification

- Production build and content checks pass: ten independent product pages, four featured products, and seventeen route documents plus a 404 page.
- Desktop and mobile layouts, catalog search/filter/reset, mobile navigation, product links, and image loading were checked in the browser. Final production preview reported no console errors.
- All ten original PNG files match their supplied sources. Delivery uses lossless WebP copies with verified identical decoded pixels. Cards defer image loading until near the viewport; detail pages preload their own product photo.
- Local Lighthouse mobile audit: performance 75, accessibility 100, best practices 100, SEO 100. Largest contentful paint was 7.7 seconds under simulated mobile throttling, with no blocking time. Full-resolution image preservation remains the principal loading tradeoff. These are local audit results, not measurements of a published deployment.

## Georgian and night-mode follow-up

The user requested Georgian and night mode, referencing Digital Wing's header controls. Live inspection confirmed an alternate-language KA/EN button and a compact day/night switch. Fortis follows this interaction pattern while retaining its own brand colors, static hero and original assets. This explicit follow-up supersedes the initial light-only direction above.

Translations cover navigation, every information and product page, catalog controls, clinical context, limitations, source labels, image alternatives, page titles and accessibility labels. A locally hosted Georgian font supports readable text. Both preferences persist across full-page navigation and return visits. Night mode changes interface colors while keeping image pixels and photographic backgrounds intact.

The production build and content checks pass. Automated browser checks passed 68 mobile combinations (17 routes in English/Georgian and light/dark), including loaded original image dimensions, persistent preferences, bilingual search, no-results/reset, filters retained across language changes, desktop overflow and absence of page errors.

An axe accessibility check found no WCAG A/AA violations on the Georgian homepage, catalog, minoxidil detail, about and contact pages in both themes after correcting text contrast. The homepage, catalog and naltrexone detail also fit a 320px viewport without horizontal overflow.

## September 10: premium Georgian landing and catalog refinement

Reading this as a premium Georgian compounding-pharmacy landing page for patients and healthcare professionals, using a calm medical aesthetic and the existing Fortis identity. Preserve mode: native React/CSS, DESIGN_VARIANCE 4, MOTION_INTENSITY 1, VISUAL_DENSITY 4. The user's specific requests authorize an original SVG bottle and landscape-switch motion; product originals and clinical boundaries remain protected. The installed Taste SKILL.md was compared to the requested GitHub repository and matches byte for byte.

Audit: retain the 17 routes, titles, company information, blue/green palette, self-hosted Georgian typography, English option, dark palette and clinical source links. Retire the hero photograph, padded product frames, background rectangles behind logos, generic sun/moon toggle, and single area-of-care filter. Georgian landing copy is written naturally around patient needs and the prescription.

Implemented an original static amber-bottle drawing; native SVG transparency masking of the unchanged source logo; full-frame 2:3 original photographs; and the inspected Dribbble landscape transition. No generic motion library or hero animation was introduced. Generated raster background removal failed alpha QA and was discarded. The SVG display treatment preserves source lettering without regenerated text.

The five independent filter dimensions support OR within each dimension and AND across dimensions/search, active-filter removal, reset and live results. All available forms truthfully remain tablets. Use contexts identify off-label research and reference-product boundaries. Low-dose naltrexone is not described as proven pain or autoimmune therapy; minoxidil 1.25 mg is classified under skin/hair context; the combination's reference weight-management context does not claim cardiovascular or diabetes efficacy. Source links and product-specific caveats remain intact.

Verification: production build/content checks pass; 68 route/language/theme browser combinations pass, including five-dimensional filtering, OR/AND combinations, bilingual search, reset, preferences, keyboard/reduced-motion switch, original image dimensions and unpadded frames. Axe reports no WCAG A/AA violations across five Georgian pages in both themes; 320px layouts fit. Desktop/mobile visual review includes both languages and themes with all card images loaded. All original PNGs and the logo JPEG remain unmodified.

Updated local Lighthouse mobile scores: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.1 seconds and CLS 0.02. These are local simulated measurements, not field performance. The SVG hero avoids downloading the original product photo above the fold.
