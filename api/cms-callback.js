import {
  ORIGIN,
  REPO,
  config,
  verify,
  headers,
  finish,
  githubJSON,
} from "../lib/cms-auth.js";
export default async function handler(req, res) {
  headers(res);
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }
  try {
    const c = config(),
      url = new URL(req.url, ORIGIN),
      state = url.searchParams.get("state"),
      code = url.searchParams.get("code");
    const verifier = verify(req.headers.cookie, state, c.secret);
    if (!code || url.searchParams.has("error"))
      throw new Error("Authorization declined.");
    const data = await githubJSON(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: c.clientId,
          client_secret: c.secret,
          code,
          code_verifier: verifier,
          redirect_uri: `${ORIGIN}/api/cms-callback`,
          repository_id: Number(c.repositoryId),
        }),
      },
    );
    if (typeof data.access_token !== "string" || data.error)
      throw new Error("Authorization failed.");
    const repo = await githubJSON(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${data.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Fortis-CMS",
      },
    });
    if (
      repo.full_name !== REPO ||
      String(repo.id) !== c.repositoryId ||
      repo.permissions?.push !== true
    )
      throw new Error("Repository write access is required.");
    finish(res, { token: data.access_token, provider: "github" }, true);
  } catch {
    finish(
      res,
      {
        message:
          "Sign-in was denied or expired. Only authorized Fortis repository editors may sign in.",
      },
      false,
      403,
    );
  }
}
