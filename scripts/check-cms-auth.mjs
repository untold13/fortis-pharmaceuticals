import assert from "node:assert/strict";
import { generateKeyPairSync, createHash, verify } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import handler from "../api/cms.js";
import { hashPassword, account, ORIGIN, REPO } from "../lib/cms-auth.js";
import {
  getSession,
  rateLimit,
  resetRateLimitsForTest,
} from "../lib/cms-sessions.js";
import { validateContent } from "../lib/cms-validation.js";
// Deterministic external-service doubles. Never read the private setup account.
const env = { ...process.env },
  originalFetch = globalThis.fetch;
const files = new Map();
let commits = 0,
  tokenRequests = 0;
const hash = (b) => createHash("sha256").update(b).digest("hex");
const put = (path, data) => {
  const content = Buffer.isBuffer(data)
    ? data
    : Buffer.from(JSON.stringify(data));
  files.set(path, { content, sha: hash(content) });
};
for (const name of readdirSync("content/products"))
  if (name.endsWith(".json"))
    put(
      `content/products/${name}`,
      JSON.parse(readFileSync(`content/products/${name}`)),
    );
for (const name of ["copy", "home", "sources"])
  put(`content/${name}.json`, JSON.parse(readFileSync(`content/${name}.json`)));
const product = JSON.parse(readFileSync("content/products/psk-90.json"));
put("public" + product.image, readFileSync("public" + product.image));
const result = (data, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => data,
});
const keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const password = "Test-only-passphrase-1234";
try {
  Object.assign(process.env, {
    CMS_ADMIN_USERNAME: "FortisAdmin",
    CMS_PASSWORD_HASH: await hashPassword(password),
    CMS_SESSION_SECRET: "a".repeat(64),
    CMS_GITHUB_APP_ID: "123",
    CMS_GITHUB_INSTALLATION_ID: "456",
    CMS_REPOSITORY_ID: "789",
    CMS_GITHUB_PRIVATE_KEY_BASE64: Buffer.from(
      keyPair.privateKey.export({ type: "pkcs8", format: "pem" }),
    ).toString("base64"),
  });
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).origin, "https://api.github.com");
    if (url.endsWith("/app/installations/456/access_tokens")) {
      tokenRequests++;
      const payload = JSON.parse(options.body);
      assert.deepEqual(payload, {
        repository_ids: [789],
        permissions: { contents: "write" },
      });
      const jwt = options.headers.Authorization.slice(7),
        parts = jwt.split(".");
      assert.ok(
        verify(
          "RSA-SHA256",
          Buffer.from(parts.slice(0, 2).join(".")),
          keyPair.publicKey,
          Buffer.from(parts[2], "base64url"),
        ),
      );
      return result({
        token: "test-only-github",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      });
    }
    assert.equal(options.headers.Authorization, "Bearer test-only-github");
    const prefix = `/repos/${REPO}/contents/`,
      pathname = decodeURIComponent(new URL(url).pathname);
    assert.ok(pathname.startsWith(prefix));
    const path = pathname.slice(prefix.length);
    if (options.method === "PUT") {
      const body = JSON.parse(options.body),
        existing = files.get(path);
      assert.equal(body.branch, "main");
      if (existing?.sha !== body.sha) return result({}, 409);
      put(path, Buffer.from(body.content, "base64"));
      commits++;
      return result({
        content: { sha: files.get(path).sha },
        commit: { sha: `commit-${commits}` },
      });
    }
    if (path === "content/products")
      return result(
        [...files.keys()]
          .filter((p) => p.startsWith(path + "/"))
          .map((p) => ({ type: "file", name: p.split("/").at(-1), path: p })),
      );
    const file = files.get(path);
    return file
      ? result({
          type: "file",
          sha: file.sha,
          content: file.content.toString("base64"),
        })
      : result({}, 404);
  };
  const call = async (action, body, cookie = "", extra = {}) => {
    const response = {
      headers: {},
      setHeader(k, v) {
        this.headers[k] = v;
      },
      end(s) {
        this.data = JSON.parse(s);
      },
    };
    await handler(
      {
        url: `/api/cms?action=${action}`,
        method: body === undefined ? "GET" : "POST",
        headers: {
          origin: ORIGIN,
          "content-type": "application/json",
          cookie,
          ...extra,
        },
        body,
      },
      response,
    );
    assert.equal(response.headers["Cache-Control"], "no-store");
    return response;
  };
  assert.equal((await call("load")).statusCode, 401);
  assert.equal(
    (await call("save", { path: "content/copy.json" })).statusCode,
    401,
  );
  assert.equal(
    (
      await call(
        "login",
        { username: "FortisAdmin", password },
        {},
        { origin: "https://attacker.example" },
      )
    ).statusCode,
    403,
  );
  assert.equal(
    (await call("login", { username: "FortisAdmin", password: "wrong" }))
      .statusCode,
    401,
  );
  let r = await call("login", { username: "FortisAdmin", password });
  assert.equal(r.statusCode, 200);
  const cookie = r.headers["Set-Cookie"].split(";")[0];
  assert.match(r.headers["Set-Cookie"], /HttpOnly; Secure; SameSite=Strict/);
  assert.ok(!JSON.stringify(r.data).includes(password));
  assert.equal(
    (await call("session", undefined, cookie)).data.authenticated,
    true,
  );
  const loaded = await call("load", undefined, cookie);
  assert.equal(loaded.data.products.length, 29);
  assert.equal(tokenRequests, 1);
  assert.equal(
    (await call("save", { path: "package.json", data: {} }, cookie)).statusCode,
    403,
  );
  assert.equal(
    (await call("save", { path: {}, data: {} }, cookie)).statusCode,
    403,
  );
  for (const data of [
    { sections: null },
    { sections: [null] },
    { sections: [{ published: true, page: "/", title: {}, body: "" }] },
  ])
    assert.equal(
      (await call("save", { path: "content/home.json", data }, cookie))
        .statusCode,
      400,
    );
  assert.equal((await call("save", "{", cookie)).statusCode, 400);
  for (const data of [
    { sources: [null] },
    {
      sources: [
        { id: "x", title: 2, url: "https://www.fda.gov/x" },
      ],
    },
  ])
    assert.equal(
      (await call("save", { path: "content/sources.json", data }, cookie))
        .statusCode,
      400,
    );
  const path = "content/products/psk-90.json",
    before = files.get(path).sha,
    changed = {
      ...product,
      manufacturer: "სატესტო მწარმოებელი",
    };
  r = await call("save", { path, sha: before, data: changed }, cookie);
  assert.equal(r.statusCode, 200);
  assert.notEqual(r.data.sha, before);
  const savedProduct = (await call("load", undefined, cookie)).data.products.find(
    (p) => p.path === path,
  ).data;
  assert.equal(savedProduct.manufacturer, "სატესტო მწარმოებელი");
  assert.equal(
    (await call("save", { path, sha: before, data: product }, cookie))
      .statusCode,
    409,
  );
  assert.equal(
    (
      await call(
        "save",
        {
          path,
          sha: r.data.sha,
          data: { ...product, image: "/uploads/missing.png" },
        },
        cookie,
      )
    ).statusCode,
    400,
  );
  const sourceRecord = loaded.data.sources;
  assert.equal(
    (
      await call(
        "save",
        {
          ...sourceRecord,
          data: {
            sources: sourceRecord.data.sources.filter(
              (s) => s.id !== "supplement_background",
            ),
          },
        },
        cookie,
      )
    ).statusCode,
    400,
  );
  const copy = loaded.data.copy;
  assert.equal(
    (
      await call(
        "save",
        { ...copy, data: { entries: copy.data.entries.slice(1) } },
        cookie,
      )
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await call(
        "upload",
        { name: "fake.png", base64: Buffer.from("<svg/>").toString("base64") },
        cookie,
      )
    ).statusCode,
    400,
  );
  const bytes = readFileSync("public" + product.image);
  r = await call(
    "upload",
    { name: "original.png", base64: bytes.toString("base64") },
    cookie,
  );
  assert.equal(r.statusCode, 200);
  assert.ok(files.get("public" + r.data.image).content.equals(bytes));
  const draft = { ...product, slug: "new-draft", published: false };
  assert.equal(
    (
      await call(
        "save",
        { path: "content/products/new-draft.json", data: draft },
        cookie,
      )
    ).statusCode,
    200,
  );
  assert.throws(
    () => validateContent(path, JSON.parse('{"__proto__":{}}')),
    (e) => e.status === 400,
  );
  assert.throws(
    () => validateContent(path, { ...product, context: "obsolete" }),
    (e) => e.status === 400,
  );
  const logout = await call("logout", {}, cookie);
  assert.equal(logout.statusCode, 200);
  assert.match(logout.headers["Set-Cookie"], /Max-Age=0/);
  assert.equal(
    (await call("session")).data.authenticated,
    false,
  );
  assert.equal(
    (await call("save", { path, data: product })).statusCode,
    401,
  );
  r = await call("login", { username: "FortisAdmin", password });
  const second = r.headers["Set-Cookie"].split(";")[0];
  process.env.CMS_SESSION_SECRET = "b".repeat(64);
  assert.equal(
    await getSession({ headers: { cookie: second } }, account()),
    null,
  );
  process.env.CMS_SESSION_SECRET = "a".repeat(64);
  process.env.CMS_PASSWORD_HASH = await hashPassword(
    "Another-test-passphrase-1234",
  );
  assert.equal(
    await getSession({ headers: { cookie: second } }, account()),
    null,
  );
  assert.equal(
    getSession(
      { headers: { cookie: second } },
      account(),
      Math.floor(Date.now() / 1000) + 28801,
    ),
    null,
  );
  resetRateLimitsForTest();
  const config = account();
  const attempts = Array.from({ length: 9 }, () =>
    rateLimit({ headers: { "x-vercel-forwarded-for": "192.0.2.1" } }, config),
  );
  assert.equal(attempts.filter(Boolean).length, 8);
  delete process.env.CMS_GITHUB_INSTALLATION_ID;
  assert.equal((await call("session")).data.configured, false);
  assert.equal(
    (await call("login", { username: "FortisAdmin", password })).statusCode,
    503,
  );
  console.log(
    "PASS: custom password login, fixed-origin protection, restricted GitHub App token, durable save/reload via service double, conflicts, source protection, original upload bytes, draft save, malformed requests, logout cookie clearing, rotation, expiry, per-IP rate limits and fail-closed setup. GitHub is mocked; production setup still required.",
  );
} finally {
  process.env = env;
  globalThis.fetch = originalFetch;
}
