import {
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
export const ORIGIN = "https://fortis-pharmaceuticals.vercel.app";
export const REPO = "untold13/fortis-pharmaceuticals";
const COOKIE = "__Host-fortis-cms";
export function config() {
  const {
    CMS_GITHUB_CLIENT_ID: clientId,
    CMS_GITHUB_CLIENT_SECRET: secret,
    CMS_REPOSITORY_ID: repositoryId,
  } = process.env;
  if (!clientId || !secret || !/^\d+$/.test(repositoryId || ""))
    throw new Error("CMS sign-in has not been configured.");
  return { clientId, secret, repositoryId };
}
const mac = (value, secret) =>
  createHmac("sha256", secret).update(value).digest("base64url");
export function begin(secret) {
  const state = randomBytes(32).toString("base64url"),
    verifier = randomBytes(48).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ state, verifier, expires: Date.now() + 600000 }),
  ).toString("base64url");
  return {
    state,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
    cookie: `${COOKIE}=${payload}.${mac(payload, secret)}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
  };
}
export function verify(cookie, state, secret) {
  const raw = (cookie || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw || typeof state !== "string")
    throw new Error("Invalid sign-in state. Please try again.");
  const [payload, signature, ...extra] = raw.split("."),
    expected = mac(payload, secret);
  if (
    extra.length ||
    !signature ||
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    throw new Error("Invalid sign-in state. Please try again.");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (
    data.state !== state ||
    data.expires < Date.now() ||
    data.expires > Date.now() + 600000 ||
    !data.verifier
  )
    throw new Error("Expired sign-in. Please try again.");
  return data.verifier;
}
export function headers(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
}
export function finish(res, data, success = false, status = 200) {
  headers(res);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  );
  const nonce = randomBytes(24).toString("base64url");
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`,
  );
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const message = JSON.stringify(
    `authorization:github:${success ? "success" : "error"}:${JSON.stringify(data)}`,
  ).replace(/</g, "\\u003c");
  res.statusCode = status;
  res.end(
    `<!doctype html><html lang="en"><meta charset="utf-8"><title>Fortis sign-in</title><body><p>${success ? "Sign-in complete. You can return to the editor." : "Sign-in could not be completed. Return to the editor and try again."}</p><script nonce="${nonce}">const origin=${JSON.stringify(ORIGIN)};if(window.opener){const done=e=>{if(e.origin!==origin||e.source!==window.opener||e.data!=='authorizing:github')return;window.removeEventListener('message',done);window.opener.postMessage(${message},origin);};window.addEventListener('message',done);window.opener.postMessage('authorizing:github',origin);}</script></body></html>`,
  );
}
export async function githubJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("GitHub sign-in failed.");
  return response.json();
}
