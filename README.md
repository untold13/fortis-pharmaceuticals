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

The editor uses a custom FortisAdmin username/password sign-in and is absent from public navigation. It has noindex headers. No GitHub sign-in is shown to editors. Passwords are scrypt hashes; the local `node scripts/setup-admin-account.mjs` helper lets the owner set a password privately and writes only its hash and a generated session secret to a mode-600 temporary environment file. Never commit credentials or prefix them with VITE.

Required server environment: `CMS_ADMIN_USERNAME`, `CMS_PASSWORD_HASH`, `CMS_SESSION_SECRET`, `CMS_GITHUB_APP_ID`, `CMS_GITHUB_PRIVATE_KEY_BASE64`, `CMS_GITHUB_INSTALLATION_ID`, and `CMS_REPOSITORY_ID`. Install the private GitHub App only on `untold13/fortis-pharmaceuticals`; its server-side installation tokens are restricted to that repository with contents-write permission. Missing configuration fails closed.

Sessions use signed HttpOnly, Secure, SameSite=Strict cookies and expire after eight hours. Rotating the password hash or session secret invalidates previous sessions. Sign-in attempts are limited per IP on each active server instance, while the password itself is protected with deliberately expensive scrypt verification. All writes require the fixed production origin and JSON content type. Credentials never enter the browser bundle or responses.

A successful save creates a main-branch commit and triggers the connected Vercel deployment. Website changes appear after that deployment succeeds; use GitHub history to restore earlier content. Saves use the current content SHA to reject overwriting concurrent changes. The editor, server and build share content validation; publishing requires both languages, valid reference IDs and an existing image. Removing a reference used by published products is blocked.

- **Products:** create or edit English and Georgian details, strength, pack quantity/unit, dosage form, preparation route, original image, filters and reference IDs. Turn “Published” off to retain a draft outside all public routes and filters. Product addresses are permanent; do not rename existing slugs. Use the same item order for corresponding English/Georgian filter lists.
- **Website content:** edit existing bilingual text or add bilingual sections to the homepage, about, compounding, contact or catalog pages. Plain text fields keep public rendering safe.
- **References:** maintain verified primary-source titles, URLs and IDs. Clinical fields require professional review before publication.
- **Images:** upload PNG, JPEG or WebP through the image upload field (maximum 3 MB). Originals are committed unchanged under `public/uploads`. Build-time lossless WebP conversion verifies identical decoded pixels. No image regeneration or label alterations occur.

CMS records live in `content/products/*.json`, existing text in `content/copy.json`, added sections in `content/home.json`, and primary references in `content/sources.json`. Generated `src/generated-content.js` is excluded from Git. The catalog, filter options, counts, image dimensions and routes derive from published records, so future additions do not need source code changes. Current catalog: 29 separate preparations, with the original four featured records.

## Design and accessibility

Taste frontend skill guides the preserved Fortis blue/green branding, self-hosted Georgian typography and clean clinical layout. The header and hero fill the first screen where content fits. The original amber-bottle SVG has a visible bottle lift and cap turn that finishes in 4.5 seconds, with no pause control and no motion under reduced-motion settings. Original product imagery and the source logo remain unchanged. The logo's SVG display mask makes its background transparent without recreating lettering.

English/Georgian and day/night preferences persist. The landscape theme switch follows the user-selected Dribbble reference. Five catalog filter dimensions combine OR within a group and AND between groups, with keyboard controls, visible active filters, and reset/search states. All current product photos remain fully visible at their original aspect ratios.

## Verification

`node scripts/check-preferences.mjs` exercises every public route in both languages and themes, mobile overflow, original image loading, search/filter logic, keyboard controls, finite hero motion and reduced motion. Set `FORTIS_TEST_URL` for production and `FORTIS_CHROME_PATH` for a local Chromium executable. `scripts/check-cms-auth.mjs` exercises password login, fixed-origin checks, restricted installation tokens, save/reload, SHA conflicts, image byte preservation, source protection, malformed input, logout, credential rotation, expiry and rate limits using a deterministic GitHub double. Real editor save/publish persistence must also be checked after the App and Vercel setup. Mock tests do not verify deployed services.
