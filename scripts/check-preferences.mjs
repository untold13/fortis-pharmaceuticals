import assert from "node:assert/strict";
import { chromium } from "playwright";
import { products } from "../src/products.js";
import fs from "node:fs";

const copy = JSON.parse(fs.readFileSync("content/copy.json", "utf8"));
const text = (value) => copy.entries.find(entry => entry.key === value)?.value || value;

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
  ...products.map((product) => `/products/${product.slug}`),
];
const productFieldLabels = [
  "დასახელება და შემადგენლობა",
  "ფარმაკოლოგიური თვისებები და მოქმედების მექანიზმი",
  "გამოყენების ჩვენებები",
  "დოზირება და მიღების წესი",
  "გვერდითი მოვლენები",
  "უკუჩვენებები",
  "განსაკუთრებული მითითებები",
  "შენახვის პირობები",
  "მწარმოებელი",
];
const errors = [];
let checked = 0;

try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.getByRole("heading", { level: 1 }).waitFor();
    assert.equal(await page.locator(".language-button").count(), 0);
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
      assert.equal(state.language, "ka", path);
      assert.equal(state.theme, theme, path);
      assert.equal(state.overflow, false, `${theme}${path} overflows`);
      const localizedProduct = products.find(
        (product) => path === `/products/${product.slug}`,
      );
      if (localizedProduct)
        assert.equal(state.heading, localizedProduct.name, path);
      else assert.match(state.heading, /[ა-ჰ]/, path);
      assert.match(state.title, /ფორტის/, path);

      if (path === "/") {
        assert.equal(await page.locator(".hero-artwork .bottle-art").count(), 1);
        assert.equal(await page.locator(".simple-hero img").count(), 0);
        assert.equal(
          await page
            .locator(".bottle-float")
            .evaluate((element) => getComputedStyle(element).animationName),
          "fortis-bottle-float",
        );
        assert.equal(await page.locator(".hero-motion-control").count(), 0);
        const animation = await page.locator(".bottle-float").evaluate((element) => ({
          duration: getComputedStyle(element).animationDuration,
          iterations: getComputedStyle(element).animationIterationCount,
        }));
        assert.equal(animation.duration, "4.5s");
        assert.equal(animation.iterations, "1");
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(
          await page
            .locator(".bottle-float")
            .evaluate((element) => getComputedStyle(element).animationName),
          "none",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }

      if (localizedProduct) {
        await page.waitForFunction(
          (source) =>
            [...document.images].some(
              (image) =>
                image.getAttribute("src") === source &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          localizedProduct.image,
        );
        assert.deepEqual(
          await page.locator(".medicine-section h2, .medicine-section h3").allTextContents(),
          productFieldLabels,
          `${path} product fields`,
        );
        assert.equal(await page.locator(".product-information-grid").count(), 0);
      }
      checked++;
    }

    await page.goto(base + "/products");
    await page.getByRole("textbox").fill("მინოქსიდილი");
    await page.waitForFunction(
      () => document.querySelectorAll(".product-card").length === 1,
    );
    assert.match(
      await page.locator(".product-card").getAttribute("href"),
      /minoxidil/,
    );
    await page.getByRole("textbox").fill("არარსებული-პროდუქტი");
    assert.equal(await page.locator(".product-card").count(), 0);
    await page
      .getByRole("button", { name: "ფილტრების გასუფთავება", exact: true })
      .click();
    assert.equal(await page.locator(".product-card").count(), products.length);

    const select = async (key, value) => {
      const group = page.locator(`[data-facet="${key}"]`);
      if ((await group.getAttribute("open")) === null)
        await group.locator("summary").click();
      await group.getByRole("checkbox", { name: text(value), exact: true }).check();
    };
    const count = async (expected) => {
      await page.waitForFunction(
        (value) => document.querySelectorAll(".product-card").length === value,
        expected,
      );
      assert.equal(await page.locator(".product-card").count(), expected);
    };
    await select("specialty", "ძილის მედიცინა");
    await count(4);
    await select("specialty", "დერმატოლოგია");
    await count(5);
    await select("system", "კანი და თმა");
    await count(1);
    await select("strength", "1.25 მგ");
    await count(1);
    await select("form", "ტაბლეტი");
    await count(1);
    await select("use", "თმის ცვენა (არარეგისტრირებული ჩვენება)");
    await count(1);
    assert.equal(await page.locator(".active-filters button").count(), 6);
    await page
      .getByRole("button", { name: "ფილტრების გასუფთავება", exact: true })
      .click();
    await count(products.length);

    await page.setViewportSize({ width: 320, height: 800 });
    await page.locator('[data-facet="use"] summary').click();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      "Open filters fit a 320px screen",
    );
    await page.locator('[data-facet="use"] summary').press("Escape");
    assert.equal(await page.locator('[data-facet="use"]').getAttribute("open"), null);
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
        .evaluate((element) => getComputedStyle(element).transitionDuration),
      "0s",
    );

    for (const card of await page.locator(".product-card").all()) {
      await card.scrollIntoViewIfNeeded();
      const image = card.locator(".product-image img");
      await image.waitFor({ state: "visible" });
      await image.evaluate((element) => element.decode());
      const size = await image.evaluate((element) => ({
        width: element.clientWidth,
        height: element.clientHeight,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
        parentWidth: element.parentElement.clientWidth,
        parentHeight: element.parentElement.clientHeight,
      }));
      assert.ok(size.naturalWidth > 0 && size.naturalHeight > 0);
      assert.equal(size.width, size.parentWidth);
      assert.equal(size.height, size.parentHeight);
      assert.ok(
        Math.abs(
          size.width / size.height - size.naturalWidth / size.naturalHeight,
        ) < 0.01,
      );
    }

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(base);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${checked} Georgian route/theme combinations, Georgian-only navigation, restored editorial product fields, filters, theme switch, full-frame photos and no page errors.`,
  );
} finally {
  await browser.close();
}
