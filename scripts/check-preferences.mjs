import assert from "node:assert/strict";
import { chromium } from "playwright";
import { products } from "../src/products.js";

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
        if (product || path === "/") {
          const source = product?.image || products[0].image;
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
      await page
        .getByRole("button", {
          name: language === "ka" ? "ძილის მედიცინა" : "Sleep medicine",
          exact: true,
        })
        .click();
      assert.equal(await page.locator(".product-card").count(), 4);
      await page
        .getByRole("button", {
          name: language === "ka" ? "Switch to English" : "ქართული ენის არჩევა",
          exact: true,
        })
        .click();
      assert.equal(
        await page.locator(".product-card").count(),
        4,
        "Language switch preserves filtering",
      );
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
    `PASS: ${checked} mobile route/language/theme combinations, saved preferences, original image dimensions, both-language search, filters, desktop overflow and no page errors.`,
  );
} finally {
  await browser.close();
}
