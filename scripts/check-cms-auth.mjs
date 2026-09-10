import assert from "node:assert/strict";
import { begin, verify, ORIGIN } from "../lib/cms-auth.js";
import start from "../api/cms-auth.js";
import callback from "../api/cms-callback.js";
const secret = "test-only-secret",
  session = begin(secret);
assert.ok(verify(session.cookie, session.state, secret));
assert.throws(() => verify(session.cookie, "bad", secret));
assert.throws(() => verify(session.cookie, session.state, "wrong"));
assert.throws(() => verify("", session.state, secret));
assert.match(session.cookie, /HttpOnly; Secure; SameSite=Lax/);
const response = () => ({
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v;
  },
  end(body) {
    this.body = body;
  },
});
const env = { ...process.env };
try {
  delete process.env.CMS_GITHUB_CLIENT_ID;
  delete process.env.CMS_GITHUB_CLIENT_SECRET;
  delete process.env.CMS_REPOSITORY_ID;
  let res = response();
  start({ method: "GET" }, res);
  assert.equal(res.statusCode, 503);
  process.env.CMS_GITHUB_CLIENT_ID = "test";
  process.env.CMS_GITHUB_CLIENT_SECRET = secret;
  process.env.CMS_REPOSITORY_ID = "123";
  res = response();
  start({ method: "GET" }, res);
  assert.equal(res.statusCode, 302);
  const location = new URL(res.headers.Location);
  assert.equal(location.origin, "https://github.com");
  assert.equal(
    location.searchParams.get("redirect_uri"),
    `${ORIGIN}/api/cms-callback`,
  );
  assert.equal(location.searchParams.get("code_challenge_method"), "S256");
  assert.equal(location.searchParams.has("scope"), false);
  const fetchOriginal = globalThis.fetch;
  try {
    globalThis.fetch = () => {
      throw new Error("Invalid state must never reach network");
    };
    res = response();
    await callback(
      {
        method: "GET",
        url: "/api/cms-callback?state=wrong&code=x",
        headers: { cookie: session.cookie },
      },
      res,
    );
    assert.equal(res.statusCode, 403);
    for (const allowed of [false, true]) {
      let calls = 0;
      globalThis.fetch = async (url, options) => {
        calls++;
        if (calls === 1) {
          const payload = JSON.parse(options.body);
          assert.equal(payload.repository_id, 123);
          assert.ok(payload.code_verifier);
          return {
            ok: true,
            json: async () => ({ access_token: "test-only-token" }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            id: 123,
            full_name: "untold13/fortis-pharmaceuticals",
            permissions: { push: allowed },
          }),
        };
      };
      res = response();
      await callback(
        {
          method: "GET",
          url: `/api/cms-callback?state=${session.state}&code=x`,
          headers: { cookie: session.cookie },
        },
        res,
      );
      assert.equal(res.statusCode, allowed ? 200 : 403);
      assert.equal(res.body.includes("test-only-token"), allowed);
      assert.equal(res.headers["Cache-Control"], "no-store");
      assert.match(
        res.headers["Content-Security-Policy"],
        /default-src 'none'/,
      );
      assert.equal(res.body.includes("postMessage("), true);
      assert.ok(!res.body.includes('postMessage(message,"*")'));
    }
  } finally {
    globalThis.fetch = fetchOriginal;
  }
} finally {
  process.env = env;
}
console.log(
  "PASS: signed state, PKCE, fail-closed configuration, method restrictions, fixed callback, restricted repository token exchange, write-access enforcement and secure response headers.",
);
