import { createHash, createHmac, randomBytes } from "node:crypto";
const LIFE = 8 * 60 * 60;
const COOKIE = "__Host-fortis-session";
export function redisConfigured() {
  return (
    /^https:\/\/[^/]+\.upstash\.io\/?$/.test(
      process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
    ) &&
    !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}
export async function redis(command) {
  if (!redisConfigured()) throw new Error("Session storage is not configured.");
  const response = await fetch(
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      body: JSON.stringify(command),
    },
  );
  if (!response.ok) throw new Error("Session storage unavailable.");
  const data = await response.json();
  if (data.error) throw new Error("Session storage unavailable.");
  return data.result;
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
const generation = (config) =>
  createHmac("sha256", config.secret).update(config.hash).digest("hex");
const cookieValue = (req) =>
  (req.headers.cookie || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);
export async function createSession(config) {
  const id = randomBytes(32).toString("base64url");
  await redis([
    "SET",
    `fortis:session:${digest(id)}`,
    JSON.stringify({ user: config.username, generation: generation(config) }),
    "EX",
    LIFE,
  ]);
  return `${COOKIE}=${id}; Path=/; Max-Age=${LIFE}; HttpOnly; Secure; SameSite=Strict`;
}
export async function getSession(req, config) {
  const id = cookieValue(req);
  if (!/^[A-Za-z0-9_-]{43}$/.test(id || "")) return null;
  const raw = await redis(["GET", `fortis:session:${digest(id)}`]);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data.user === config.username &&
      data.generation === generation(config)
      ? data
      : null;
  } catch {
    return null;
  }
}
export async function revokeSession(req) {
  const id = cookieValue(req);
  if (/^[A-Za-z0-9_-]{43}$/.test(id || ""))
    await redis(["DEL", `fortis:session:${digest(id)}`]);
}
export const clearCookie = () =>
  `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
export async function rateLimit(req, config) {
  // Vercel sets x-vercel-forwarded-for at its trusted edge. Fall back to one shared
  // bucket outside Vercel, never trust a client-controlled arbitrary X-Forwarded-For.
  const ip = String(req.headers["x-vercel-forwarded-for"] || "shared")
    .split(",")[0]
    .trim();
  const ipKey = createHmac("sha256", config.secret).update(ip).digest("hex");
  const script =
    "local a=redis.call('INCR',KEYS[1]); if a==1 then redis.call('EXPIRE',KEYS[1],60) end; local b=redis.call('INCR',KEYS[2]); if b==1 then redis.call('EXPIRE',KEYS[2],60) end; return {a,b}";
  const [perIP, total] = await redis([
    "EVAL",
    script,
    2,
    `fortis:login:${ipKey}`,
    "fortis:login:all",
  ]);
  return perIP <= 8 && total <= 40;
}
