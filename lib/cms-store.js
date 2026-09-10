import { createSign } from "node:crypto";
import { REPO } from "./cms-auth.js";
let cached = null,
  pending = null;
export function storageConfigured() {
  return (
    /^\d+$/.test(process.env.CMS_GITHUB_APP_ID || "") &&
    /^\d+$/.test(process.env.CMS_GITHUB_INSTALLATION_ID || "") &&
    /^\d+$/.test(process.env.CMS_REPOSITORY_ID || "") &&
    !!process.env.CMS_GITHUB_PRIVATE_KEY_BASE64
  );
}
async function token() {
  if (cached?.expires > Date.now() + 60000) return cached.value;
  if (pending) return pending;
  pending = (async () => {
    if (!storageConfigured()) throw new Error("Storage is not configured.");
    const now = Math.floor(Date.now() / 1000),
      enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({ iat: now - 60, exp: now + 540, iss: process.env.CMS_GITHUB_APP_ID })}`;
    const signature = createSign("RSA-SHA256")
      .update(unsigned)
      .sign(Buffer.from(process.env.CMS_GITHUB_PRIVATE_KEY_BASE64, "base64"))
      .toString("base64url");
    const result = await request(
      `/app/installations/${process.env.CMS_GITHUB_INSTALLATION_ID}/access_tokens`,
      {
        method: "POST",
        body: JSON.stringify({
          repository_ids: [Number(process.env.CMS_REPOSITORY_ID)],
          permissions: { contents: "write" },
        }),
      },
      `${unsigned}.${signature}`,
    );
    if (!result.token) throw new Error("Storage authorization failed.");
    cached = { value: result.token, expires: Date.parse(result.expires_at) };
    return result.token;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}
async function request(path, options = {}, credential) {
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    redirect: "error",
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Fortis-Content-Editor",
      Authorization: `Bearer ${credential || (await token())}`,
    },
  });
  if (!response.ok) {
    const e = new Error(
      response.status === 409 || response.status === 422
        ? "Content changed while you were editing. Reload and try again."
        : "Content storage is temporarily unavailable.",
    );
    e.status = response.status === 409 || response.status === 422 ? 409 : 503;
    throw e;
  }
  return response.json();
}
const fileURL = (path) =>
  `/repos/${REPO}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
export async function readFile(path) {
  const file = await request(fileURL(path) + "?ref=main");
  return {
    path,
    sha: file.sha,
    data: JSON.parse(Buffer.from(file.content, "base64").toString("utf8")),
  };
}
export async function bootstrap() {
  const listing = await request(fileURL("content/products") + "?ref=main");
  const products = [];
  for (let i = 0; i < listing.length; i += 6)
    products.push(
      ...(await Promise.all(
        listing
          .slice(i, i + 6)
          .filter((f) => f.type === "file" && f.name.endsWith(".json"))
          .map((f) => readFile(f.path)),
      )),
    );
  const [copy, sections, sources] = await Promise.all(
    ["content/copy.json", "content/home.json", "content/sources.json"].map(
      readFile,
    ),
  );
  return { products, copy, sections, sources };
}
export async function writeFile(path, content, sha, user) {
  return request(fileURL(path), {
    method: "PUT",
    body: JSON.stringify({
      message: `Update ${path} by ${user}`,
      content: Buffer.from(content).toString("base64"),
      branch: "main",
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function imageExists(path) {
  try {
    const r = await request(fileURL("public" + path) + "?ref=main");
    return r.type === "file";
  } catch {
    return false;
  }
}
