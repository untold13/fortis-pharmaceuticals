import { ORIGIN, config, begin, headers, finish } from "../lib/cms-auth.js";
export default function handler(req, res) {
  headers(res);
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }
  try {
    const c = config(),
      session = begin(c.secret);
    const query = new URLSearchParams({
      client_id: c.clientId,
      redirect_uri: `${ORIGIN}/api/cms-callback`,
      state: session.state,
      code_challenge: session.challenge,
      code_challenge_method: "S256",
    });
    res.setHeader("Set-Cookie", session.cookie);
    res.setHeader(
      "Location",
      `https://github.com/login/oauth/authorize?${query}`,
    );
    res.statusCode = 302;
    res.end();
  } catch {
    finish(res, { message: "CMS sign-in is not available yet." }, false, 503);
  }
}
