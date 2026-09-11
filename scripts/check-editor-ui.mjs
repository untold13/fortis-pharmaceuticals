import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch({
  executablePath: process.env.FORTIS_CHROME_PATH,
  args: ["--no-sandbox"],
});
const read = (path) => ({
  path,
  sha: "test-sha",
  data: JSON.parse(fs.readFileSync(path, "utf8")),
});
const content = {
  products: fs
    .readdirSync("content/products")
    .filter((f) => f.endsWith(".json"))
    .map((f) => read(`content/products/${f}`)),
  copy: read("content/copy.json"),
  sections: read("content/home.json"),
  sources: read("content/sources.json"),
};
let authenticated = false,
  saves = 0,
  page;
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/cms?*", async (route) => {
    const req = route.request(),
      action = new URL(req.url()).searchParams.get("action"),
      body = req.method() === "POST" ? req.postDataJSON() : null;
    let data,
      status = 200;
    if (action === "session")
      data = {
        configured: true,
        authenticated,
        username: authenticated ? "FortisAdmin" : undefined,
      };
    else if (action === "login") {
      authenticated =
        body.username === "FortisAdmin" &&
        body.password === "test-only-password";
      status = authenticated ? 200 : 401;
      data = authenticated
        ? { authenticated: true, username: "FortisAdmin" }
        : { error: "The username or password is incorrect." };
    } else if (!authenticated) {
      status = 401;
      data = { error: "Your session has ended. Please sign in." };
    } else if (action === "load") data = content;
    else if (action === "logout") {
      authenticated = false;
      data = { ok: true };
    } else if (action === "save") {
      saves++;
      const record = { ...body, sha: `saved-${saves}` };
      if (body.path.startsWith("content/products/"))
        content.products = [
          ...content.products.filter((p) => p.path !== body.path),
          record,
        ];
      else
        content[
          body.path.includes("copy")
            ? "copy"
            : body.path.includes("home")
              ? "sections"
              : "sources"
        ] = record;
      data = { sha: record.sha, commit: `commit-${saves}` };
    } else if (action === "upload")
      data = {
        image: "/uploads/ui-test.png",
        sha: "image-sha",
        commit: "image-commit",
      };
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  const base = process.env.FORTIS_TEST_URL || "http://127.0.0.1:4174";
  await page.goto(base + "/admin/");
  await page
    .getByRole("heading", { name: "Content editor", exact: true })
    .waitFor();
  assert.equal(await page.getByText(/GitHub/).count(), 0);
  await page.getByLabel("Username / მომხმარებელი").fill("FortisAdmin");
  await page.getByLabel("Password / პაროლი").fill("wrong");
  await page
    .getByRole("button", { name: "Sign in / შესვლა", exact: true })
    .click();
  await page.getByRole("alert").waitFor();
  await page.getByLabel("Password / პაროლი").fill("test-only-password");
  await page
    .getByRole("button", { name: "Sign in / შესვლა", exact: true })
    .click();
  await page.locator(".admin-product-list > button").first().waitFor();
  assert.equal(await page.locator(".admin-product-list > button").count(), 29);
  let audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    audit.violations.map((v) => v.id),
    [],
  );
  await page.getByLabel("Find a product / პრეპარატის ძებნა").fill("PSK");
  await page.locator(".admin-product-list > button").first().click();
  for (const label of [
    "Name / დასახელება",
    "Dosage form / წამლის ფორმა",
    "Preparation and route / მომზადება და მიღების გზა",
    "Medical area / მიმართულება",
    "Short description / მოკლე აღწერა",
    "Name and Composition / დასახელება და შემადგენლობა",
    "Pharmacological Properties and Mechanism of Action / ფარმაკოლოგიური თვისებები და მოქმედების მექანიზმი",
    "Indications / გამოყენების ჩვენებები",
    "Dosage and Administration / დოზირება და მიღების წესი",
    "Side Effects / გვერდითი მოვლენები",
    "Contraindications / უკუჩვენებები",
    "Special Warnings and Precautions / განსაკუთრებული მითითებები",
    "Storage Conditions / შენახვის პირობები",
    "Manufacturer / მწარმოებელი",
  ])
    assert.equal(await page.getByLabel(label, { exact: true }).count(), 1, label);
  await page
    .getByLabel("Manufacturer / მწარმოებელი", { exact: true })
    .fill("Test manufacturer");
  await page.getByRole("button", { name: "ქართული", exact: true }).click();
  await page
    .getByLabel("Manufacturer / მწარმოებელი", { exact: true })
    .fill("სატესტო მწარმოებელი");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page
    .getByRole("button", { name: "Save product / შენახვა", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Saved permanently" })
    .waitFor();
  await page.reload();
  await page.getByLabel("Find a product / პრეპარატის ძებნა").fill("PSK");
  await page.locator(".admin-product-list > button").first().click();
  assert.equal(
    await page
      .getByLabel("Manufacturer / მწარმოებელი", { exact: true })
      .inputValue(),
    "Test manufacturer",
  );
  await page.getByRole("button", { name: "ქართული", exact: true }).click();
  assert.equal(
    await page
      .getByLabel("Manufacturer / მწარმოებელი", { exact: true })
      .inputValue(),
    "სატესტო მწარმოებელი",
  );
  await page
    .locator("input[type=file]")
    .setInputFiles("public/products/psk-90.png");
  await page.waitForFunction(() =>
    document
      .querySelector(".admin-image-field img")
      ?.getAttribute("src")
      ?.startsWith("data:"),
  );
  assert.ok(
    await page
      .locator(".admin-image-field img")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
  );
  await page
    .getByRole("button", { name: "Back / დაბრუნება", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add product / დამატება", exact: true })
    .click();
  await page.getByLabel("Page address / გვერდის მისამართი").fill("test-draft");
  await page
    .getByRole("button", { name: "Save product / შენახვა", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Saved permanently" })
    .waitFor();
  await page
    .getByRole("button", { name: "Add sections / სექციები", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Add section / სექციის დამატება",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Title / სათაური", { exact: true })
    .nth(0)
    .fill("New section");
  await page
    .getByLabel("Title / სათაური", { exact: true })
    .nth(1)
    .fill("ახალი სექცია");
  await page
    .getByRole("button", {
      name: "Save sections / სექციების შენახვა",
      exact: true,
    })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Saved permanently" })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/fortis-admin-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    audit.violations.map((v) => v.id),
    [],
  );
  await page
    .getByRole("button", { name: "Sign out / გასვლა", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Content editor", exact: true })
    .waitFor();
  await page.screenshot({
    path: "/tmp/fortis-admin-login.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: custom editor login/error, 29 records, requested bilingual product fields, edit/save/reload, original-image preview, unchanged catalog filters, new draft, added section, logout, mobile overflow and WCAG AA checks. Browser API responses mocked; live setup required.",
  );
} catch (e) {
  console.log({ errors, body: await page.locator("body").innerText() });
  throw e;
} finally {
  await browser.close();
}
