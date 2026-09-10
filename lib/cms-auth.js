import {
  randomBytes,
  timingSafeEqual,
  scrypt as scryptCallback,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const ORIGIN = "https://fortis-pharmaceuticals.vercel.app";
export const REPO = "untold13/fortis-pharmaceuticals";
export function account() {
  const username = process.env.CMS_ADMIN_USERNAME,
    hash = process.env.CMS_PASSWORD_HASH,
    secret = process.env.CMS_SESSION_SECRET;
  if (
    !username ||
    !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash || "") ||
    !secret ||
    secret.length < 43
  )
    throw new Error("Editor setup is incomplete.");
  return { username, hash, secret };
}
export async function hashPassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 14 ||
    password.length > 256
  )
    throw new Error("Use a password of 14 to 256 characters.");
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  });
  return `scrypt$${salt}$${key.toString("hex")}`;
}
export async function checkPassword(username, password, config = account()) {
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    password.length > 256
  )
    return false;
  const [, salt, expected] = config.hash.split("$");
  const actual = await scrypt(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  });
  return (
    timingSafeEqual(actual, Buffer.from(expected, "hex")) &&
    username === config.username
  );
}
export function sameOrigin(req) {
  return (
    req.headers.origin === ORIGIN &&
    /^application\/json(?:;|$)/i.test(req.headers["content-type"] || "")
  );
}
export function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.end(JSON.stringify(data));
}
