import { createHmac, timingSafeEqual } from "node:crypto";

const LIFE = 8 * 60 * 60;
const COOKIE = "__Host-fortis-session";
const attempts = new Map();

const generation = (config) =>
  createHmac("sha256", config.secret)
    .update(config.hash)
    .digest("base64url");

const cookieValue = (req) =>
  (req.headers.cookie || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);

const signature = (payload, config) =>
  createHmac("sha256", config.secret).update(payload).digest("base64url");

export function createSession(config, now = Math.floor(Date.now() / 1000)) {
  const payload = Buffer.from(
    JSON.stringify({
      user: config.username,
      generation: generation(config),
      expires: now + LIFE,
    }),
  ).toString("base64url");
  return `${COOKIE}=${payload}.${signature(payload, config)}; Path=/; Max-Age=${LIFE}; HttpOnly; Secure; SameSite=Strict`;
}

export function getSession(req, config, now = Math.floor(Date.now() / 1000)) {
  const value = cookieValue(req);
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(value || "")) return null;
  const separator = value.lastIndexOf("."),
    payload = value.slice(0, separator),
    supplied = Buffer.from(value.slice(separator + 1), "base64url"),
    expected = Buffer.from(signature(payload, config), "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected))
    return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.user === config.username &&
      data.generation === generation(config) &&
      Number.isInteger(data.expires) &&
      data.expires > now
      ? data
      : null;
  } catch {
    return null;
  }
}

export const clearCookie = () =>
  `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export function rateLimit(req, config, now = Date.now()) {
  // A warm server instance keeps a short per-IP attempt window. The account also
  // requires a long password, and failed password checks remain expensive through scrypt.
  const ip = String(req.headers["x-vercel-forwarded-for"] || "shared")
      .split(",")[0]
      .trim(),
    key = createHmac("sha256", config.secret).update(ip).digest("hex"),
    current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 8;
}

export function resetRateLimitsForTest() {
  attempts.clear();
}
