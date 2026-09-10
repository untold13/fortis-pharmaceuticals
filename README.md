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

Use the authenticated GitHub account to create a repository (suggested name `fortis-pharmaceuticals`) and push this folder. Import that repository into Vercel using the Vite preset: build `npm run build`, output `dist`. No environment variables are required. Alternatively, with an authenticated CLI, run `vercel --prod` in this folder. Do not point this project at the separate Fortis Library site.

## Hero and accessibility

The homepage uses a simple static hero with the original supplied bottle image. There is no 3D scene, scroll animation or sticky scroll sequence, following the user's final design correction. All cards are standard links with independent routes; navigation, filters, search and FAQ are keyboard accessible. Reduced-motion preferences disable decorative transitions.

## Content boundaries

English interface; supplied Georgian brand/founding copy is preserved. No unreviewed full Georgian UI translation is presented as approved. Company laboratory and permit information is attributed to the company. GPP process started is not GPP certification. No fabricated laboratory photos, metrics, partners, opening hours or email address are used. Fonts are hosted with the site and fall back to Arial if unavailable.
