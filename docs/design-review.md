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
