import http from "node:http";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../lib/cms-auth.js";
const origin = "http://127.0.0.1:4176",
  csrf = randomBytes(32).toString("base64url");
const directory = "/tmp/fortis-cms-setup";
let finished = false,
  submitting = false;
await fs.mkdir(directory, { recursive: true, mode: 0o700 });
await fs.chmod(directory, 0o700);
const shell = (body) =>
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Set FortisAdmin password</title><style>body{font:17px/1.7 Arial,sans-serif;color:#173346;background:#f3f6f8;max-width:480px;padding:36px 24px;margin:8vh auto}form{background:white;padding:28px;border:1px solid #dbe3e8;border-radius:10px}label,input{display:block;width:100%;box-sizing:border-box}input{margin:8px 0 20px;padding:12px;font:inherit;border:1px solid #9aacb8;border-radius:5px}button{background:#1766a4;color:white;border:0;border-radius:5px;padding:14px 20px;font:inherit;width:100%}small{display:block;color:#526b7c}h1{font-size:25px}</style><body>${body}<script nonce="${csrf}">const form=document.querySelector("form");if(form)form.addEventListener("submit",async event=>{event.preventDefault();const button=form.querySelector("button");button.disabled=true;try{const response=await fetch("/set-password",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","X-Fortis-Setup":"${csrf}"},body:new URLSearchParams(new FormData(form))});if(response.ok){form.reset();location.replace("/");}else{const html=await response.text();const parsed=new DOMParser().parseFromString(html,"text/html");const text=parsed.querySelector("[role=alert]")?.textContent||"Please reload this setup page and try again.";document.querySelector("#setup-error").textContent=text;}}catch{document.querySelector("#setup-error").textContent="Cannot reach the setup service. Please reopen this page.";}finally{button.disabled=false;}});</script></body></html>`;
const form = (message) =>
  shell(
    `<h1>Set your FortisAdmin password</h1><p>This private page runs only on your computer. Your password is hashed here and is never saved as plain text.</p>${message ? '<p role="alert">' + message + "</p>" : ""}<p id="setup-error" role="alert"></p><form method="post" action="/set-password"><input type="hidden" name="csrf" value="${csrf}"><label>Username<input value="FortisAdmin" readonly autocomplete="username"></label><label>New password<input type="password" name="password" required minlength="14" maxlength="256" autocomplete="new-password"></label><label>Confirm password<input type="password" name="confirm" required minlength="14" maxlength="256" autocomplete="new-password"></label><small>Use at least 14 characters. A password manager can create and save it for you.</small><p><button>Set password</button></p></form>`,
  );
http
  .createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Security-Policy",
      `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${csrf}'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`,
    );
    if (req.headers.host !== "127.0.0.1:4176") {
      res.writeHead(403);
      return res.end();
    }
    if (req.method === "GET" && req.url === "/set-password") {
      res.writeHead(303, { Location: "/" });
      return res.end();
    }
    if (req.method === "GET" && req.url === "/") {
      return res.end(
        finished
          ? shell(
              "<h1>Password saved securely.</h1><p>The one-time setup is complete. The editor will be available after the server configuration is deployed.</p>",
            )
          : form(""),
      );
    }
    if (
      req.method !== "POST" ||
      req.url !== "/set-password" ||
      req.headers.origin !== origin ||
      finished ||
      submitting
    ) {
      console.log(
        "Setup request rejected:",
        JSON.stringify({
          method: req.method,
          path: req.url,
          host: req.headers.host,
          origin: req.headers.origin || "absent",
          finished,
          submitting,
        }),
      );
      res.writeHead(403);
      return res.end(
        shell(
          '<p role="alert">Please reopen the setup page and submit the form once.</p>',
        ),
      );
    }
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 4096) {
        res.writeHead(413);
        res.end();
        req.destroy();
        return;
      }
    }
    const data = new URLSearchParams(raw);
    if (data.get("csrf") !== csrf || req.headers["x-fortis-setup"] !== csrf) {
      console.log("Setup rejected: expired form verification.");
      res.writeHead(403);
      return res.end(
        shell(
          '<p role="alert">This setup page has expired. Reload the page and try again.</p>',
        ),
      );
    }
    if (data.get("password") !== data.get("confirm")) {
      res.writeHead(400);
      return res.end(form("The two passwords do not match. Please try again."));
    }
    submitting = true;
    try {
      const hash = await hashPassword(data.get("password"));
      const secret = randomBytes(48).toString("base64url");
      await fs.writeFile(
        directory + "/account.env",
        `CMS_ADMIN_USERNAME=FortisAdmin\nCMS_PASSWORD_HASH=${hash}\nCMS_SESSION_SECRET=${secret}\n`,
        { mode: 0o600 },
      );
      finished = true;
      res.writeHead(303, { Location: "/" });
      res.end();
      console.log(
        "FortisAdmin password hash saved securely. Plaintext password was not stored.",
      );
    } catch {
      res.writeHead(400);
      res.end(form("Use a password of 14 to 256 characters."));
    } finally {
      submitting = false;
    }
  })
  .listen(4176, "127.0.0.1", () =>
    console.log(
      "Private FortisAdmin password setup ready at http://127.0.0.1:4176/",
    ),
  );
