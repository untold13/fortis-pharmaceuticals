# Fortis Pharmaceuticals

Bilingual Georgian/English compounding pharmacy website, built in the saved Fortis project using React and Vite. Production: https://fortis-pharmaceuticals.vercel.app

## Development

```sh
npm ci
npm run dev
npm run build
npm run check
node scripts/check-cms-auth.mjs
```

Prebuild validates CMS content and creates lossless delivery images. Every published product gets an independent static route. The public site contains no checkout or patient data collection.

## Content editor

Direct address: https://fortis-pharmaceuticals.vercel.app/admin/

The editor is intentionally absent from public navigation, has noindex headers, and uses Decap CMS with GitHub-backed durable content. Authorized GitHub accounts require write access to `untold13/fortis-pharmaceuticals`. The private GitHub App must be installed on this repository only. Vercel server environment requires `CMS_GITHUB_CLIENT_ID`, `CMS_GITHUB_CLIENT_SECRET`, and `CMS_REPOSITORY_ID`; never prefix these with VITE or commit values. Missing configuration fails closed.

OAuth endpoints use a signed, ten-minute HttpOnly/Secure state cookie, PKCE, a fixed production callback and origin, repository-restricted token exchange, and a repository write-access check. GitHub user tokens expire; sign in again when necessary. No public write endpoint or shared admin password exists. Decap uses the signed-in editor's GitHub permission to commit changes. A successful save creates a main-branch commit and triggers the connected Vercel deployment. Website changes appear after that deployment succeeds; use GitHub history to restore earlier content.

- **Products:** create or edit English and Georgian details, strength, pack quantity/unit, dosage form, preparation route, original image, filters and reference IDs. Turn “Visible on website” off to retain a draft outside all public routes and filters. Product addresses are permanent; do not rename existing slugs. Use the same item order for corresponding English/Georgian filter lists.
- **Website content:** edit existing bilingual text or add bilingual sections to the homepage, about, compounding, contact or catalog pages. Plain text fields keep public rendering safe.
- **References:** maintain verified primary-source titles, URLs and IDs. Clinical fields require professional review before publication.
- **Images:** upload PNG, JPEG or WebP through the media library. Originals are committed unchanged under `public/uploads`. Build-time lossless WebP conversion verifies identical decoded pixels. No image regeneration or label alterations occur.

CMS records live in `content/products/*.json`, existing text in `content/copy.json`, added sections in `content/home.json`, and primary references in `content/sources.json`. Generated `src/generated-content.js` is excluded from Git. The catalog, filter options, counts, image dimensions and routes derive from published records, so future additions do not need source code changes. Current catalog: twenty separate preparations, with the original four featured records.

## Design and accessibility

Taste frontend skill guides the preserved Fortis blue/green branding, self-hosted Georgian typography and clean clinical layout. The header and hero fill the first screen where content fits. The original amber-bottle SVG has a subtle eight-second float/cap turn, a pause control, and no motion under reduced-motion settings. Original product imagery and the source logo remain unchanged. The logo's SVG display mask makes its background transparent without recreating lettering.

English/Georgian and day/night preferences persist. The landscape theme switch follows the user-selected Dribbble reference. Five catalog filter dimensions combine OR within a group and AND between groups, with keyboard controls, visible active filters, and reset/search states. All current product photos remain fully visible at their original aspect ratios.

## Verification

`node scripts/check-preferences.mjs` exercises every public route in both languages and themes, mobile overflow, original image loading, search/filter logic, keyboard controls, hero pause and reduced motion. Set `FORTIS_TEST_URL` for production and `FORTIS_CHROME_PATH` for a local Chromium executable. `scripts/check-cms-auth.mjs` checks signed state, PKCE setup, restricted repository exchange, denied permissions and fail-closed configuration. Real editor save/publish persistence must also be checked after GitHub App installation and Vercel environment setup.
