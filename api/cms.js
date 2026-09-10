import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { account, checkPassword, sameOrigin, reply } from "../lib/cms-auth.js";
import {
  redisConfigured,
  createSession,
  getSession,
  revokeSession,
  clearCookie,
  rateLimit,
} from "../lib/cms-sessions.js";
import {
  storageConfigured,
  bootstrap,
  readFile,
  writeFile,
  imageExists,
} from "../lib/cms-store.js";
import { validateContent, allowedContentPath } from "../lib/cms-validation.js";
export default async function handler(req, res) {
  const action = new URL(
    req.url,
    "https://fortis-pharmaceuticals.vercel.app",
  ).searchParams.get("action");
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return reply(res, 405, { error: "Method not allowed." });
  }
  if (req.method === "POST" && !sameOrigin(req))
    return reply(res, 403, {
      error: "Open the editor on the official Fortis website.",
    });
  try {
    if (action === "logout" && req.method === "POST") {
      await revokeSession(req);
      res.setHeader("Set-Cookie", clearCookie());
      return reply(res, 200, { ok: true });
    }
    let config;
    try {
      config = account();
      if (!storageConfigured() || !redisConfigured()) throw new Error();
    } catch {
      return reply(res, action === "session" ? 200 : 503, {
        authenticated: false,
        configured: false,
        error: "The editor is awaiting secure account setup.",
      });
    }
    if (action === "login" && req.method === "POST") {
      if (!(await rateLimit(req, config))) {
        res.setHeader("Retry-After", "60");
        return reply(res, 429, {
          error: "Too many sign-in attempts. Please wait a minute.",
        });
      }
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || !(await checkPassword(body.username, body.password, config)))
        return reply(res, 401, {
          error: "The username or password is incorrect.",
        });
      res.setHeader("Set-Cookie", await createSession(config));
      return reply(res, 200, {
        authenticated: true,
        username: config.username,
      });
    }
    const current = await getSession(req, config);
    if (action === "session" && req.method === "GET")
      return reply(res, 200, {
        authenticated: !!current,
        configured: true,
        ...(current ? { username: current.user } : {}),
      });
    if (!current)
      return reply(res, 401, {
        error: "Your session has ended. Please sign in.",
      });
    if (action === "load" && req.method === "GET")
      return reply(res, 200, await bootstrap());
    if (req.method !== "POST")
      return reply(res, 400, { error: "Unknown editor action." });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (action === "save") {
      if (!body || !allowedContentPath(body.path))
        return reply(res, 403, {
          error: "This file is outside the editable content.",
        });
      if (body.path === "content/sources.json")
        validateContent(body.path, body.data);
      const sources =
        body.path === "content/sources.json"
          ? body.data
          : (await readFile("content/sources.json")).data;
      validateContent(
        body.path,
        body.data,
        sources.sources.map((s) => s.id),
      );
      const images = body.path.startsWith("content/products/")
        ? body.data.published
          ? [body.data.image]
          : []
        : body.path === "content/home.json"
          ? body.data.sections
              .filter((s) => s.published && s.image)
              .map((s) => s.image)
          : [];
      for (const image of images)
        if (!(await imageExists(image)))
          return reply(res, 400, {
            error:
              "Upload and save the selected image before publishing this content.",
          });
      if (body.path === "content/sources.json") {
        const live = await bootstrap(),
          ids = body.data.sources.map((s) => s.id);
        if (
          live.products.some(
            (p) =>
              p.data.published && p.data.refs.some((id) => !ids.includes(id)),
          )
        )
          return reply(res, 400, {
            error:
              "A published product still uses a reference you removed. Keep its existing ID.",
          });
      }
      if (body.path === "content/copy.json") {
        const original = await readFile(body.path);
        if (
          JSON.stringify(original.data.entries.map((e) => e.key).sort()) !==
          JSON.stringify(body.data.entries.map((e) => e.key).sort())
        )
          return reply(res, 400, {
            error:
              "Keep existing text identifiers. Use Additional sections to add content.",
          });
      }
      const result = await writeFile(
        body.path,
        JSON.stringify(body.data, null, 2) + "\n",
        body.sha,
        current.user,
      );
      return reply(res, 200, {
        sha: result.content.sha,
        commit: result.commit.sha,
      });
    }
    if (action === "upload") {
      if (
        !body ||
        typeof body.base64 !== "string" ||
        body.base64.length > 4200000 ||
        !/^[a-zA-Z0-9+/]*={0,2}$/.test(body.base64)
      )
        return reply(res, 400, { error: "Use an image smaller than 3 MB." });
      const bytes = Buffer.from(body.base64, "base64");
      if (!bytes.length || bytes.length > 3 * 1024 * 1024)
        return reply(res, 400, { error: "Use an image smaller than 3 MB." });
      let metadata;
      try {
        metadata = await sharp(bytes, {
          limitInputPixels: 50000000,
        }).metadata();
      } catch {
        return reply(res, 400, {
          error: "Choose a valid PNG, JPEG or WebP image.",
        });
      }
      const extension = { png: "png", jpeg: "jpg", webp: "webp" }[
        metadata.format
      ];
      if (!extension || !metadata.width || !metadata.height)
        return reply(res, 400, {
          error: "Choose a valid PNG, JPEG or WebP image.",
        });
      const name =
        String(body.name || "image")
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 70) || "image";
      const path = `public/uploads/${name}-${randomBytes(6).toString("hex")}.${extension}`;
      const result = await writeFile(path, bytes, null, current.user);
      return reply(res, 200, {
        image: path.replace(/^public/, ""),
        sha: result.content.sha,
        commit: result.commit.sha,
        width: metadata.width,
        height: metadata.height,
      });
    }
    return reply(res, 400, { error: "Unknown editor action." });
  } catch (error) {
    if (error instanceof SyntaxError)
      return reply(res, 400, { error: "Invalid JSON request." });
    return reply(res, error.status || 503, {
      error: error.status
        ? error.message
        : "The editor could not complete this request. Please try again.",
    });
  }
}
