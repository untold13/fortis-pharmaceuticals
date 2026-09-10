import assert from "node:assert/strict";
import { chromium } from "playwright";
import { products } from "../src/products.js";
import { facets } from "../src/catalog-model.js";
import fs from "node:fs";
const ka = JSON.parse(
  fs.readFileSync(new URL("../src/ka.json", import.meta.url)),
);
const clinicalKa = JSON.parse(
  fs.readFileSync(new URL("../src/ka-products.json", import.meta.url)),
);
Object.assign(
  ka,
  ...Object.values(clinicalKa.families).map((f) => ({
    [f.category]: f.category,
  })),
);
ka["Sleep medicine"] = clinicalKa.families.lemborexant.category;
ka["Dermatology"] = clinicalKa.families.minoxidil.category;
const text = (s, language) =>
  language === "ka" ? ka[s] || s.replace(/\bmg\b/g, "მგ") : s;

const base = process.env.FORTIS_TEST_URL || "http://127.0.0.1:4174";
const browser = await chromium.launch({
  ...(process.env.FORTIS_CHROME_PATH
    ? { executablePath: process.env.FORTIS_CHROME_PATH }
    : {}),
  args: ["--no-sandbox"],
});
const paths = [
  "/",
  "/products",
  "/about",
  "/compounding",
  "/contact",
  "/editorial",
  "/privacy",
  ...products.map((p) => `/products/${p.slug}`),
];
const errors = [];
let checked = 0;
try {
  for (const language of ["en", "ka"]) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByRole("heading", { level: 1 }).waitFor();
      if (language === "ka")
        await page
          .getByRole("button", { name: "ქართული ენის არჩევა", exact: true })
          .click();
      if (theme === "dark") await page.getByRole("switch").click();
      for (const path of paths) {
        await page.goto(base + path);
        await page.getByRole("heading", { level: 1 }).waitFor();
        const state = await page.evaluate(() => ({
          language: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth > innerWidth,
          title: document.title,
          heading: document.querySelector("h1").textContent,
        }));
        assert.equal(state.language, language, path);
        assert.equal(state.theme, theme, path);
        assert.equal(
          state.overflow,
          false,
          `${language}/${theme}${path} overflows`,
        );
        if (language === "ka") {
          assert.match(state.heading, /[ა-ჰ]/, path);
          assert.match(state.title, /ფორტის/, path);
        }
        const product = products.find((p) => path === `/products/${p.slug}`);
        if (path === "/") {
          assert.equal(
            await page.locator(".hero-artwork .bottle-art").count(),
            1,
          );
          assert.equal(await page.locator(".simple-hero img").count(), 0);
          assert.equal(
            await page
              .locator(".simple-hero")
              .evaluate((e) => e.getAnimations({ subtree: true }).length),
            0,
          );
        }
        if (product) {
          const source = product.image;
          await page.waitForFunction(
            (src) =>
              [...document.images].some(
                (i) =>
                  i.getAttribute("src") === src &&
                  i.complete &&
                  i.naturalWidth === 1024,
              ),
            source,
          );
        }
        checked++;
      }
      await page.goto(base + "/products");
      await page
        .getByRole("textbox")
        .fill(language === "ka" ? "მინოქსიდილი" : "Minoxidil");
      await page.waitForFunction(
        () => document.querySelectorAll(".product-card").length === 1,
      );
      assert.match(
        await page.locator(".product-card").getAttribute("href"),
        /minoxidil/,
      );
      await page.getByRole("textbox").fill("not-a-product");
      assert.equal(await page.locator(".product-card").count(), 0);
      await page
        .getByRole("button", {
          name: language === "ka" ? "ფილტრების გასუფთავება" : "Reset filters",
          exact: true,
        })
        .click();
      assert.equal(await page.locator(".product-card").count(), 10);
      const select = async (key, value) => {
        const group = page.locator(`[data-facet="${key}"]`);
        if (
          !(await group.getAttribute("open")) &&
          (await group.getAttribute("open")) !== ""
        )
          await group.locator("summary").click();
        await group
          .getByRole("checkbox", { name: text(value, language), exact: true })
          .check();
      };
      const count = async (n) =>
        assert.equal(await page.locator(".product-card").count(), n);
      await select("specialty", "Sleep medicine");
      await count(4);
      await select("specialty", "Dermatology");
      await count(5); // OR within specialty.
      await select("system", "Skin & hair");
      await count(1); // AND across dimensions.
      await select("strength", "1.25 mg");
      await count(1);
      await select("form", "Tablet");
      await count(1);
      await select("use", "Hair loss (off-label)");
      await count(1);
      await page.getByRole("textbox").fill("lemborexant");
      await count(0);
      await page.getByRole("textbox").fill("");
      await count(1);
      // Keep all five selections on language change.
      await page
        .getByRole("button", {
          name: language === "ka" ? "Switch to English" : "ქართული ენის არჩევა",
          exact: true,
        })
        .click();
      await count(1);
      assert.equal(await page.locator(".active-filters button").count(), 6);
      const other = language === "ka" ? "en" : "ka";
      await page
        .getByRole("button", {
          name: text("Reset filters", other),
          exact: true,
        })
        .click();
      await count(10);
      await page.setViewportSize({ width: 320, height: 800 });
      await page.locator('[data-facet="use"] summary').click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        "Open filters fit a 320px screen",
      );
      await page.locator('[data-facet="use"] summary').press("Escape");
      assert.equal(
        await page.locator('[data-facet="use"]').getAttribute("open"),
        null,
      );
      await page.getByRole("switch").focus();
      await page.getByRole("switch").press("Space");
      assert.equal(
        await page.getByRole("switch").getAttribute("aria-checked"),
        String(theme !== "dark"),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await page
          .locator(".theme-thumb")
          .evaluate((e) => getComputedStyle(e).transitionDuration),
        "0s",
      );
      // Each photo matches its 2:3 frame; never crop or letterbox the source.
      for (const card of await page.locator(".product-card").all()) {
        await card.scrollIntoViewIfNeeded();
        const img = card.locator(".product-image img");
        await img.waitFor({ state: "visible" });
        await img.evaluate((e) => e.decode());
        const size = await img.evaluate((e) => ({
          w: e.clientWidth,
          h: e.clientHeight,
          nw: e.naturalWidth,
          nh: e.naturalHeight,
          pw: e.parentElement.clientWidth,
          ph: e.parentElement.clientHeight,
        }));
        assert.equal(size.nw, 1024);
        assert.equal(size.nh, 1536);
        assert.equal(size.w, size.pw);
        assert.equal(size.h, size.ph);
        assert.ok(Math.abs(size.w / size.h - 2 / 3) < 0.01);
      }
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(base);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${checked} mobile route/language/theme combinations, saved preferences, original image dimensions, both-language search, five-dimensional AND/OR filters, reset, keyboard/reduced-motion switch, full-frame photos, desktop overflow and no page errors.`,
  );
} finally {
  await browser.close();
}
