// Run locally during owner setup. Never logs credentials or authentication codes.
import http from "node:http";
import fs from "node:fs/promises";
import { randomBytes, createSign } from "node:crypto";
const dir = "/tmp/fortis-cms-setup",
  origin = "http://127.0.0.1:4175",
  site = "https://fortis-pharmaceuticals.vercel.app";
await fs.mkdir(dir, { recursive: true, mode: 0o700 });
let nonce;
try {
  nonce = (await fs.readFile(dir + "/registration-state", "utf8")).trim();
} catch {
  nonce = randomBytes(32).toString("hex");
  await fs.writeFile(dir + "/registration-state", nonce, { mode: 0o600 });
}
const manifest = {
  name: "Fortis Content Manager untold13",
  url: site,
  redirect_url: origin + "/setup/callback",
  hook_attributes: { url: site + "/api/cms-webhook", active: false },
  public: false,
  default_permissions: { contents: "write", metadata: "read" },
  default_events: [],
  request_oauth_on_install: false,
  description:
    "Private server-side content storage for the Fortis username and password editor.",
};
let app;
try {
  app = JSON.parse(await fs.readFile(dir + "/private-app.json", "utf8"));
} catch {}
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function jwt() {
  const now = Math.floor(Date.now() / 1000),
    enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url"),
    unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({ iat: now - 60, exp: now + 540, iss: app.id })}`;
  return (
    unsigned +
    "." +
    createSign("RSA-SHA256")
      .update(unsigned)
      .sign(app.pem)
      .toString("base64url")
  );
}
async function github(path, options = {}, token) {
  const r = await fetch("https://api.github.com" + path, {
    ...options,
    redirect: "error",
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
  });
  if (!r.ok) throw Error("GitHub setup request failed.");
  return r.json();
}
http
  .createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; form-action 'self' https://github.com; frame-ancestors 'none'; base-uri 'none'",
    );
    if (req.headers.host !== "127.0.0.1:4175") {
      res.writeHead(403);
      res.end("Open the local setup address.");
      return;
    }
    const u = new URL(req.url, origin);
    try {
      if (req.method === "GET" && u.pathname === "/setup/callback") {
        if (
          app ||
          u.searchParams.get("state") !== nonce ||
          !u.searchParams.get("code")
        ) {
          res.writeHead(400);
          res.end(
            "Registration verification failed. Open the local setup start page.",
          );
          return;
        }
        const created = await github(
          "/app-manifests/" +
            encodeURIComponent(u.searchParams.get("code")) +
            "/conversions",
          { method: "POST" },
        );
        if (!created.id || !created.pem || created.owner?.login !== "untold13")
          throw Error("Unexpected app registration.");
        app = {
          id: created.id,
          slug: created.slug,
          pem: created.pem,
          html_url: created.html_url,
        };
        await fs.writeFile(dir + "/private-app.json", JSON.stringify(app), {
          mode: 0o600,
        });
        await fs.writeFile(
          dir + "/app-info.json",
          JSON.stringify(
            {
              id: app.id,
              slug: app.slug,
              owner: "untold13",
              permissions: created.permissions,
            },
            null,
            2,
          ),
          { mode: 0o600 },
        );
        res.writeHead(303, { Location: "/" });
        res.end();
        return;
      }
      if (req.method === "POST" && u.pathname === "/finish") {
        if (req.headers.origin !== origin || !app) {
          res.writeHead(403);
          res.end("Open local setup first.");
          return;
        }
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 1000) throw Error("Invalid form.");
        }
        if (new URLSearchParams(body).get("state") !== nonce)
          throw Error("Invalid form.");
        const installations = await github("/app/installations", {}, jwt()),
          installation = installations.find(
            (i) => i.account?.login === "untold13",
          );
        if (!installation)
          throw Error("Install the App on the Fortis repository first.");
        const token = await github(
          `/app/installations/${installation.id}/access_tokens`,
          {
            method: "POST",
            body: JSON.stringify({ permissions: { contents: "write" } }),
          },
          jwt(),
        );
        const repositories = await github(
          "/installation/repositories",
          {},
          token.token,
        );
        if (
          repositories.total_count !== 1 ||
          repositories.repositories[0]?.full_name !==
            "untold13/fortis-pharmaceuticals"
        )
          throw Error(
            "Restrict the installation to the Fortis repository only.",
          );
        const repoID = repositories.repositories[0].id;
        await fs.writeFile(
          dir + "/production.env",
          `CMS_GITHUB_APP_ID=${app.id}\nCMS_GITHUB_PRIVATE_KEY_BASE64=${Buffer.from(app.pem).toString("base64")}\nCMS_GITHUB_INSTALLATION_ID=${installation.id}\nCMS_REPOSITORY_ID=${repoID}\n`,
          { mode: 0o600 },
        );
        res.end(
          "<h1>Fortis content storage is ready</h1><p>Server credentials were saved privately. No credentials are shown here.</p>",
        );
        return;
      }
      if (req.method !== "GET" || u.pathname !== "/") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.end(
        `<html><head><title>Fortis content storage setup</title></head><body><h1>Fortis content storage setup</h1>${app ? `<p>The private App is registered. Install it only on fortis-pharmaceuticals.</p><p><a href="${escape(app.html_url)}/installations/new">Install on the Fortis repository</a></p><form method="POST" action="/finish"><input type="hidden" name="state" value="${nonce}"><button>Verify installation and save server configuration</button></form>` : `<p>Create a private GitHub App owned by untold13 with repository contents read/write and metadata read. Editors will use their Fortis username and password.</p><form method="POST" action="https://github.com/settings/apps/new?state=${nonce}"><input type="hidden" name="manifest" value="${escape(JSON.stringify(manifest))}"><button>Register Fortis GitHub App</button></form>`}</body></html>`,
      );
    } catch {
      res.writeHead(400);
      res.end(
        '<h1>Setup is not complete</h1><p>Confirm the account and install the private App only on the Fortis repository, then return to the local setup page.</p><a href="/">Return to setup</a>',
      );
    }
  })
  .listen(4175, "127.0.0.1", () =>
    console.log("Private GitHub App setup ready at http://127.0.0.1:4175/"),
  );
