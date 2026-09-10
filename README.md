# Fortis Pharmaceuticals

Company and compounding portfolio website built directly in the saved Fortis project. React + Vite; static hosting on Vercel. No checkout, patient collection, database or fake admin persistence.

## Run and verify

```sh
npm ci
npm run dev
npm run build
npm run check
npm run preview
```

Local preview: http://127.0.0.1:4173. Production build is `dist/`. A route document is generated for every product and information page, so direct URLs work on a static host. The host should serve `404.html` for missing routes.

## Edit or upload products

1. Put a pharmacy-approved product image in `public/products/`. Use a descriptive unique filename; never include actual patient or prescriber data in a public image.
2. Edit `src/products.js`. Add one product object per strength, with a unique `slug`, `name`, `strength`, numeric tablet `pack`, and a valid `family`. Upload the original `/products/{slug}.png`; the build generates and serves a lossless WebP copy with identical decoded pixels. Do not group strengths or add selectors.
3. Clinical context, cautions, formulation limits and references live in `families` and `sources` in the same file. The selected substantive medical sources are FDA, EMA, JAMA Dermatology and Pain Reports; PMC is used as an access mirror for the original Pain Reports article.
4. Have the pharmacy review formulation/release characteristics, local authorization, copy and labeling. Reference-product approval never implies Fortis approval or equivalence.
5. Select exactly four records with `featured: true` for the homepage. Update the exact-count check intentionally if the catalog grows beyond ten products.
6. Run `npm run build && npm run check`, inspect the changed product route and mobile catalog, then commit and push. If Vercel Git integration is connected, its production branch deploys automatically.

The first build deliberately uses the user's ten original images unchanged, as explicitly requested. Images are illustrative packaging, not prescription instructions; this is stated on catalog/detail pages and `/editorial`. No generated label edits are used. Source files are not altered. A build script converts PNGs to lossless WebP and verifies identical decoded pixels; off-screen card images load near the viewport.

## Deploy

The project is published at https://fortis-pharmaceuticals.vercel.app from https://github.com/untold13/fortis-pharmaceuticals. Vercel automatically deploys the main branch using the Vite preset: build `npm run build`, output `dist`. No environment variables are required. Alternatively, with an authenticated CLI, run `vercel --prod` in this folder. Do not point this project at the separate Fortis Library site.

## Hero and accessibility

The homepage uses an original static SVG sketch of an amber medicine bottle (`src/bottle-art.jsx`). Product photographs are reserved for the catalog and detail pages. There is no 3D scene, scroll animation or sticky scroll sequence, following the user's final design correction. All cards are standard links with independent routes; navigation, filters, search and FAQ are keyboard accessible. Reduced-motion preferences disable decorative transitions.

## Content boundaries

English and Georgian interfaces are available through the KA/EN header button. The adjacent day/night switch changes the appearance. Both choices persist in this browser across routes and return visits; first visits use English and light mode. The original Georgian brand/founding copy is preserved. Company laboratory and permit information is attributed to the company. GPP process started is not GPP certification. No fabricated laboratory photos, metrics, partners, opening hours or email address are used. Fonts, including Noto Sans Georgian, are hosted with the site and fall back to Arial if unavailable.

## Language and appearance maintenance

Interface translations are in `src/ka.json`; Georgian ingredient context, clinical cautions, formulation limits, product names and source labels are in `src/ka-products.json`. Keep both languages synchronized when changing the original English content. Clinical translations preserve the same reference-product and off-label distinctions and require the same ongoing pharmacy review as the English copy. Product images and source URLs remain unchanged in either language or theme.

`src/preferences.jsx` manages the controls and saved preferences. `src/preferences.css` defines the dark palette and Georgian layout adjustments. The page head restores choices before rendering to avoid a light-theme flash. Browser storage failure does not prevent controls from working.

Run `node scripts/check-preferences.mjs` with a Playwright Chromium installation to check all routes in both languages and themes. `FORTIS_TEST_URL` can select a preview or production URL; `FORTIS_CHROME_PATH` can select an existing compatible browser executable.

## Visual assets and catalog facets

`src/brand-art.jsx` renders the original `public/fortis-logo.jpeg` through a native SVG chroma mask. The neutral source background becomes transparent while the original Georgian/English lettering and symbol remain the source artwork. The original JPEG is archived unchanged. A generated raster extraction was rejected because it contained a painted checkerboard; no generated logo is used.

`src/theme-art.jsx` and `src/refinements.css` implement the user-requested landscape switch after visual inspection of [Lior Ullert’s reference](https://dribbble.com/shots/15942486-Light-Dark-Mode-Toggle): rolling hills and a tree, sun/clouds changing to crescent/stars, and a white thumb moving left/day to right/night. It uses a native accessible switch, browser persistence, and immediate state changes with reduced motion.

`src/catalog-model.js` provides separate multiselect strength, medical-specialty, use-context, body-system and form dimensions. Selected values combine with OR within a dimension and AND across dimensions and search. Each group uses native details and labeled checkboxes; active filters can be removed individually, and reset clears all filters/search. All ten current preparations are tablets. New families need reviewed navigation metadata here as well as clinical content in `src/products.js` and Georgian translations. Filters describe reference or research contexts and do not confer approved indications on compounded products.

Every card uses its source photo’s 2:3 ratio with no CSS padding, cropping, stretching or blended color treatment. Inherent photographic backgrounds stay unchanged in both themes.
