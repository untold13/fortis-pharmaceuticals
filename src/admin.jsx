import React, { useEffect, useState, useId } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/noto-sans-georgian";
import "./admin.css";
import { validateContent } from "../lib/cms-validation.js";
const clone = (value) => structuredClone(value);
async function api(action, body) {
  const response = await fetch(`/api/cms?action=${action}`, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) {
    const e = new Error(result.error || "Request failed.");
    e.status = response.status;
    throw e;
  }
  return result;
}
function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  ...props
}) {
  const Input = multiline ? "textarea" : "input",
    id = useId();
  return (
    <label className="admin-field">
      <span id={id}>{label}</span>
      <Input
        aria-labelledby={id}
        value={value ?? ""}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        type={multiline ? undefined : type}
        {...props}
      />
    </label>
  );
}
function Toggle({ label, value, onChange }) {
  return (
    <label className="admin-toggle">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
function Login({ onLogin, configured, sessionError }) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await api("login", { username, password });
      setPassword("");
      onLogin(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <img src="/fortis-logo.jpeg" alt="Fortis Pharmaceuticals" />
        <h1>Content editor</h1>
        <p>ვებგვერდის მართვა</p>
        {sessionError && (
          <p role="alert" className="admin-error">
            {sessionError}
          </p>
        )}
        {configured === false && (
          <p className="admin-notice">
            Your secure account setup is not complete yet.
            <br />
            ანგარიშის უსაფრთხო გამართვა ჯერ არ დასრულებულა.
          </p>
        )}
        <Field
          label="Username / მომხმარებელი"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          required
          autoFocus
        />
        <Field
          label="Password / პაროლი"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <button
          className="admin-primary"
          disabled={busy || configured === false}
        >
          {busy ? "Signing in…" : "Sign in / შესვლა"}
        </button>
        <a href="/">Back to website / ვებგვერდზე დაბრუნება</a>
      </form>
    </main>
  );
}
const languageFields = [
  ["name", "Name / დასახელება"],
  ["form", "Dosage form / წამლის ფორმა"],
  ["packUnit", "Pack unit / შეფუთვის ერთეული"],
  ["preparation", "Preparation and route / მომზადება და მიღების გზა"],
  ["category", "Medical area / მიმართულება"],
  ["tag", "Short description / მოკლე აღწერა"],
  ["context", "Clinical context / კლინიკური კონტექსტი"],
  ["caution", "Clinical considerations / სიფრთხილის საკითხები"],
  ["note", "Formulation notes / ფორმულის შეზღუდვები"],
];
const emptyProduct = () => ({
  slug: "",
  published: false,
  featured: false,
  order: 100,
  name: "",
  strength: "",
  pack: 30,
  form: "Tablet",
  packUnit: "tablets",
  preparation: "Compounded · oral",
  image: "",
  category: "",
  tag: "",
  context: "",
  caution: "",
  note: "",
  refs: [],
  facets: { specialty: [], use: [], system: [] },
  ka: {
    name: "",
    form: "ტაბლეტი",
    packUnit: "ტაბლეტი",
    preparation: "კომპოზიტური · პერორალური",
    category: "",
    tag: "",
    context: "",
    caution: "",
    note: "",
    facets: { specialty: [], use: [], system: [] },
  },
});
function ImageField({ value, onChange, onError }) {
  const [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(null);
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 3 * 1024 * 1024)
        throw new Error(
          "Choose an image smaller than 3 MB. / აირჩიეთ 3 MB-ზე მცირე სურათი.",
        );
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.readAsDataURL(file);
      });
      const result = await api("upload", { name: file.name, base64 });
      setPreview({
        path: result.image,
        src: `data:${file.type};base64,${base64}`,
      });
      onChange(result.image);
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }
  return (
    <div className="admin-image-field">
      {value && (
        <img
          src={preview?.path === value ? preview.src : value}
          alt="Current product or section image"
        />
      )}
      <label className="admin-upload">
        {busy
          ? "Uploading… / იტვირთება…"
          : "Upload original image / სურათის ატვირთვა"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={upload}
        />
      </label>
      <small>PNG, JPEG or WebP · up to 3 MB · originals stay unchanged</small>
    </div>
  );
}
function ProductEditor({ record, sources, onSave, onCancel, onError }) {
  const [data, setData] = useState(() => clone(record?.data || emptyProduct())),
    [language, setLanguage] = useState("en");
  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const localized = language === "en" ? data : data.ka;
  const updateLanguage = (key, value) =>
    setData((d) =>
      language === "en"
        ? { ...d, [key]: value }
        : { ...d, ka: { ...d.ka, [key]: value } },
    );
  const filters = localized.facets || {};
  return (
    <section className="admin-editor">
      <div className="admin-editor-title">
        <h2>
          {record
            ? "Edit product / რედაქტირება"
            : "New product / ახალი პრეპარატი"}
        </h2>
        <button onClick={onCancel}>Back / დაბრუნება</button>
      </div>
      <div className="admin-columns">
        <div>
          <Field
            label="Page address / გვერდის მისამართი"
            value={data.slug}
            onChange={(v) => update("slug", v)}
            disabled={!!record}
            placeholder="ingredient-25"
          />
          <p className="admin-hint">
            Lowercase Latin letters, numbers and hyphens. Existing addresses
            stay fixed.
          </p>
          <div className="admin-grid">
            <Field
              label="Strength / დოზა"
              value={data.strength}
              onChange={(v) => update("strength", v)}
              placeholder="25 mg / Not specified"
            />
            <Field
              label="Pack quantity / რაოდენობა"
              type="number"
              min={1}
              value={data.pack}
              onChange={(v) => update("pack", v)}
            />
            <Field
              label="Display order / თანმიმდევრობა"
              type="number"
              min={1}
              value={data.order}
              onChange={(v) => update("order", v)}
            />
          </div>
          <Toggle
            label="Published / გამოქვეყნებული"
            value={data.published}
            onChange={(v) => update("published", v)}
          />
          <Toggle
            label="Featured on homepage / მთავარ გვერდზე"
            value={data.featured}
            onChange={(v) => update("featured", v)}
          />
          <p className="admin-hint">
            Drafts stay outside public pages. Review both languages and clinical
            references before publishing.
          </p>
        </div>
        <ImageField
          value={data.image}
          onChange={(v) => update("image", v)}
          onError={onError}
        />
      </div>
      <div className="admin-language" aria-label="Content language">
        <button
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
        >
          English
        </button>
        <button
          aria-pressed={language === "ka"}
          onClick={() => setLanguage("ka")}
        >
          ქართული
        </button>
      </div>
      {languageFields.map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={localized[key]}
          onChange={(v) => updateLanguage(key, v)}
          multiline={["context", "caution", "note"].includes(key)}
        />
      ))}
      <h3>Catalog filters / კატალოგის ფილტრები</h3>
      <p className="admin-hint">
        One item per line. Match English and Georgian items in the same order.
      </p>
      {[
        ["specialty", "Medical specialty / სპეციალობა"],
        ["use", "Use context / გამოყენების სფერო"],
        ["system", "Body system / ორგანოთა სისტემა"],
      ].map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={(filters[key] || []).join("\n")}
          multiline
          onChange={(v) =>
            updateLanguage("facets", { ...filters, [key]: v.split("\n") })
          }
        />
      ))}
      <h3>Clinical references / კლინიკური წყაროები</h3>
      <div className="admin-reference-list">
        {sources.map((source) => (
          <Toggle
            key={source.id}
            label={language === "ka" ? source.titleKa : source.title}
            value={data.refs.includes(source.id)}
            onChange={(v) =>
              update(
                "refs",
                v
                  ? [...data.refs, source.id]
                  : data.refs.filter((id) => id !== source.id),
              )
            }
          />
        ))}
      </div>
      <div className="admin-save">
        <button
          className="admin-primary"
          onClick={() =>
            onSave({
              ...record,
              path: record?.path || `content/products/${data.slug}.json`,
              data,
            })
          }
        >
          Save product / შენახვა
        </button>
      </div>
    </section>
  );
}
function CopyEditor({ record, onSave }) {
  const [data, setData] = useState(() => clone(record.data)),
    [query, setQuery] = useState("");
  return (
    <section>
      <h2>Website text / ვებგვერდის ტექსტი</h2>
      <Field
        label="Find text / ტექსტის ძებნა"
        value={query}
        onChange={setQuery}
      />
      {data.entries
        .map((e, i) => ({ e, i }))
        .filter(({ e }) =>
          `${e.en} ${e.ka}`.toLowerCase().includes(query.toLowerCase()),
        )
        .map(({ e, i }) => (
          <details className="admin-text-block" key={e.key}>
            <summary>{e.ka || e.en}</summary>
            <Field
              label="English"
              multiline
              value={e.en}
              onChange={(v) =>
                setData((d) => ({
                  ...d,
                  entries: d.entries.map((x, j) =>
                    j === i ? { ...x, en: v } : x,
                  ),
                }))
              }
            />
            <Field
              label="ქართული"
              multiline
              value={e.ka}
              onChange={(v) =>
                setData((d) => ({
                  ...d,
                  entries: d.entries.map((x, j) =>
                    j === i ? { ...x, ka: v } : x,
                  ),
                }))
              }
            />
          </details>
        ))}
      <div className="admin-save">
        <button
          className="admin-primary"
          onClick={() => onSave({ ...record, data })}
        >
          Save website text / ტექსტის შენახვა
        </button>
      </div>
    </section>
  );
}
const emptySection = () => ({
  published: false,
  page: "/",
  en: { title: "", body: "", imageAlt: "" },
  ka: { title: "", body: "", imageAlt: "" },
  image: "",
});
function SectionsEditor({ record, onSave, onError }) {
  const [data, setData] = useState(() => clone(record.data));
  const update = (i, key, value) =>
    setData((d) => ({
      ...d,
      sections: d.sections.map((s, j) =>
        j === i ? { ...s, [key]: value } : s,
      ),
    }));
  return (
    <section>
      <h2>Additional sections / დამატებითი სექციები</h2>
      {data.sections.map((s, i) => (
        <article className="admin-section" key={i}>
          <div className="admin-editor-title">
            <h3>{s.ka.title || s.en.title || `Section ${i + 1}`}</h3>
            <button
              onClick={() =>
                setData((d) => ({
                  ...d,
                  sections: d.sections.filter((_, j) => j !== i),
                }))
              }
            >
              Remove / წაშლა
            </button>
          </div>
          <Toggle
            label="Published / გამოქვეყნებული"
            value={s.published}
            onChange={(v) => update(i, "published", v)}
          />
          <label className="admin-field">
            <span>Page / გვერდი</span>
            <select
              value={s.page}
              onChange={(e) => update(i, "page", e.target.value)}
            >
              {[
                ["/", "Homepage / მთავარი"],
                ["/about", "About / ჩვენ შესახებ"],
                ["/compounding", "Compounding / კომპოზიტური ფარმაცია"],
                ["/products", "Products / პრეპარატები"],
                ["/contact", "Contact / კონტაქტი"],
              ].map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-columns">
            {["en", "ka"].map((l) => (
              <div key={l}>
                <h4>{l === "en" ? "English" : "ქართული"}</h4>
                {[
                  ["title", "Title / სათაური"],
                  ["body", "Text / ტექსტი"],
                  ["imageAlt", "Image description / სურათის აღწერა"],
                ].map(([k, label]) => (
                  <Field
                    key={k}
                    label={label}
                    value={s[l][k]}
                    multiline={k === "body"}
                    onChange={(v) => update(i, l, { ...s[l], [k]: v })}
                  />
                ))}
              </div>
            ))}
          </div>
          <ImageField
            value={s.image}
            onChange={(v) => update(i, "image", v)}
            onError={onError}
          />
        </article>
      ))}
      <button
        onClick={() =>
          setData((d) => ({ ...d, sections: [...d.sections, emptySection()] }))
        }
      >
        Add section / სექციის დამატება
      </button>
      <div className="admin-save">
        <button
          className="admin-primary"
          onClick={() => onSave({ ...record, data })}
        >
          Save sections / სექციების შენახვა
        </button>
      </div>
    </section>
  );
}
function SourcesEditor({ record, onSave }) {
  const [data, setData] = useState(() => clone(record.data));
  const update = (i, k, v) =>
    setData((d) => ({
      ...d,
      sources: d.sources.map((s, j) => (j === i ? { ...s, [k]: v } : s)),
    }));
  return (
    <section>
      <h2>Clinical references / კლინიკური წყაროები</h2>
      <p>
        Keep existing source IDs unchanged. Use professionally reviewed primary
        sources.
      </p>
      {data.sources.map((s, i) => (
        <details className="admin-text-block" key={i}>
          <summary>
            {s.titleKa || s.title || "New reference / ახალი წყარო"}
          </summary>
          {[
            ["id", "Source ID / წყაროს კოდი"],
            ["title", "English title"],
            ["titleKa", "ქართული სათაური"],
            ["url", "Official URL / ოფიციალური ბმული"],
          ].map(([k, l]) => (
            <Field
              key={k}
              label={l}
              value={s[k]}
              onChange={(v) => update(i, k, v)}
              disabled={k === "id" && i < record.data.sources.length}
            />
          ))}
        </details>
      ))}
      <button
        onClick={() =>
          setData((d) => ({
            ...d,
            sources: [
              ...d.sources,
              { id: "", title: "", titleKa: "", url: "" },
            ],
          }))
        }
      >
        Add reference / წყაროს დამატება
      </button>
      <div className="admin-save">
        <button
          className="admin-primary"
          onClick={() => onSave({ ...record, data })}
        >
          Save references / წყაროების შენახვა
        </button>
      </div>
    </section>
  );
}
function Admin() {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [configured, setConfigured] = useState(true),
    [content, setContent] = useState(null),
    [tab, setTab] = useState("products"),
    [editing, setEditing] = useState(null),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    api("session")
      .then((s) => {
        setConfigured(s.configured);
        if (s.authenticated) setUser(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (user) load();
  }, [user]);
  async function load() {
    setBusy(true);
    setError("");
    try {
      setContent(await api("load"));
    } catch (e) {
      setError(e.message);
      if (e.status === 401) setUser(null);
    } finally {
      setBusy(false);
    }
  }
  async function save(record) {
    setError("");
    setMessage("");
    try {
      validateContent(
        record.path,
        record.data,
        content.sources.data.sources.map((s) => s.id),
      );
      setBusy(true);
      const result = await api("save", record);
      const saved = { ...record, sha: result.sha };
      setContent((c) =>
        record.path.startsWith("content/products/")
          ? {
              ...c,
              products: [
                ...c.products.filter((p) => p.path !== record.path),
                saved,
              ],
            }
          : {
              ...c,
              [record.path === "content/copy.json"
                ? "copy"
                : record.path === "content/home.json"
                  ? "sections"
                  : "sources"]: saved,
            },
      );
      if (record.path.startsWith("content/products/")) setEditing(saved);
      setMessage(
        "Saved permanently. The website updates after the deployment finishes. / ცვლილება შენახულია. ვებგვერდი განახლდება გამოქვეყნების დასრულების შემდეგ.",
      );
    } catch (e) {
      setError(e.message);
      if (e.status === 401) setUser(null);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api("logout", {});
      setUser(null);
      setContent(null);
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
  }
  if (checking)
    return (
      <main className="admin-loading">
        Opening your editor… / რედაქტორი იტვირთება…
      </main>
    );
  if (!user)
    return (
      <Login onLogin={setUser} configured={configured} sessionError={error} />
    );
  const sources = content?.sources.data.sources || [];
  return (
    <>
      <header className="admin-header">
        <img src="/fortis-logo.jpeg" alt="Fortis Pharmaceuticals" />
        <span>{user.username}</span>
        <a href="/" target="_blank" rel="noreferrer">
          View website / ვებგვერდი
        </a>
        <button onClick={logout}>Sign out / გასვლა</button>
      </header>
      <div className="admin-layout">
        <nav aria-label="Editor sections">
          {[
            ["products", "Products / პრეპარატები"],
            ["copy", "Website text / ტექსტები"],
            ["sections", "Add sections / სექციები"],
            ["sources", "References / წყაროები"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => {
                setTab(id);
                setEditing(null);
                setMessage("");
                setError("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <main className="admin-main">
          {error && (
            <p role="alert" className="admin-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="admin-success">
              {message}
            </p>
          )}
          {busy && <p role="status">Saving or loading… / მიმდინარეობს…</p>}
          <fieldset disabled={busy} className="admin-workspace">
            {content &&
              tab === "products" &&
              (editing ? (
                <ProductEditor
                  key={editing.path || "new"}
                  record={editing.path ? editing : null}
                  sources={sources}
                  onSave={save}
                  onCancel={() => setEditing(null)}
                  onError={setError}
                />
              ) : (
                <section>
                  <div className="admin-editor-title">
                    <h1>Products / პრეპარატები</h1>
                    <button
                      className="admin-primary"
                      onClick={() => setEditing({ new: true })}
                    >
                      Add product / დამატება
                    </button>
                  </div>
                  <Field
                    label="Find a product / პრეპარატის ძებნა"
                    value={query}
                    onChange={setQuery}
                  />
                  <div className="admin-product-list">
                    {[...content.products]
                      .sort(
                        (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999),
                      )
                      .filter((p) =>
                        `${p.data.name} ${p.data.ka?.name} ${p.data.strength}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((p) => (
                        <button key={p.path} onClick={() => setEditing(p)}>
                          <img src={p.data.image} alt="" loading="lazy" />
                          <span>
                            <strong>{p.data.ka?.name || p.data.name}</strong>
                            <small>
                              {p.data.name} · {p.data.strength} · {p.data.pack}{" "}
                              {p.data.packUnit}
                            </small>
                          </span>
                          <span className="admin-state">
                            {p.data.published
                              ? "Published / გამოქვეყნებული"
                              : "Draft / მონახაზი"}
                          </span>
                        </button>
                      ))}
                  </div>
                </section>
              ))}
            {content && tab === "copy" && (
              <CopyEditor record={content.copy} onSave={save} />
            )}{" "}
            {content && tab === "sections" && (
              <SectionsEditor
                record={content.sections}
                onSave={save}
                onError={setError}
              />
            )}{" "}
            {content && tab === "sources" && (
              <SourcesEditor record={content.sources} onSave={save} />
            )}
          </fieldset>
          {!content && !busy && (
            <button onClick={load}>Try again / ხელახლა</button>
          )}
        </main>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<Admin />);
