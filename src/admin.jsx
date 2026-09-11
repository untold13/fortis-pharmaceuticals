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
        <img src="/fortis-logo.jpeg" alt="ფორტის ფარმაცევტიკალსი" />
        <h1>შიგთავსის რედაქტორი</h1>
        <p>ვებგვერდის მართვა</p>
        {sessionError && (
          <p role="alert" className="admin-error">
            {sessionError}
          </p>
        )}
        {configured === false && (
          <p className="admin-notice">
            ანგარიშის უსაფრთხო გამართვა ჯერ არ დასრულებულა.
          </p>
        )}
        <Field
          label="მომხმარებელი"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          required
          autoFocus
        />
        <Field
          label="პაროლი"
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
          {busy ? "მიმდინარეობს შესვლა…" : "შესვლა"}
        </button>
        <a href="/">ვებგვერდზე დაბრუნება</a>
      </form>
    </main>
  );
}
const productInformationFields = [
  ["name", "დასახელება"],
  ["form", "წამლის ფორმა"],
  ["preparation", "მომზადება და მიღების გზა"],
  ["category", "მიმართულება"],
  ["tag", "მოკლე აღწერა"],
  ["nameComposition", "დასახელება და შემადგენლობა"],
  [
    "pharmacology",
    "ფარმაკოლოგიური თვისებები და მოქმედების მექანიზმი",
  ],
  ["indications", "გამოყენების ჩვენებები"],
  [
    "dosageAdministration",
    "დოზირება და მიღების წესი",
  ],
  ["sideEffects", "გვერდითი მოვლენები"],
  ["contraindications", "უკუჩვენებები"],
  [
    "warningsPrecautions",
    "განსაკუთრებული მითითებები",
  ],
  ["storageConditions", "შენახვის პირობები"],
  ["manufacturer", "მწარმოებელი"],
];
const longProductFields = new Set(productInformationFields.slice(5).map(([key]) => key));
const emptyProduct = () => ({
  slug: "",
  published: false,
  featured: false,
  order: 100,
  name: "",
  strength: "",
  pack: 30,
  form: "ტაბლეტი",
  packUnit: "ტაბლეტი",
  preparation: "კომპოზიტური · პერორალური",
  image: "",
  category: "",
  tag: "",
  nameComposition: "",
  pharmacology: "",
  indications: "",
  dosageAdministration: "",
  sideEffects: "",
  contraindications: "",
  warningsPrecautions: "",
  storageConditions: "",
  manufacturer: "",
  refs: [],
  facets: { specialty: [], use: [], system: [] },
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
          "აირჩიეთ 3 MB-ზე მცირე სურათი.",
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
          alt="პროდუქტის ან სექციის მიმდინარე სურათი"
        />
      )}
      <label className="admin-upload">
        {busy
          ? "იტვირთება…"
          : "სურათის ატვირთვა"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={upload}
        />
      </label>
      <small>PNG, JPEG ან WebP · მაქსიმუმ 3 MB</small>
    </div>
  );
}
function ProductEditor({ record, sources, onSave, onCancel, onError }) {
  const [data, setData] = useState(() => clone(record?.data || emptyProduct()));
  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const filters = data.facets || {};
  return (
    <section className="admin-editor">
      <div className="admin-editor-title">
        <h2>
          {record ? "პრეპარატის რედაქტირება" : "ახალი პრეპარატი"}
        </h2>
        <button onClick={onCancel}>დაბრუნება</button>
      </div>
      <div className="admin-columns">
        <div>
          <Field
            label="გვერდის მისამართი"
            value={data.slug}
            onChange={(v) => update("slug", v)}
            disabled={!!record}
            placeholder="ingredient-25"
          />
          <p className="admin-hint">
            გამოიყენეთ პატარა ლათინური ასოები, ციფრები და დეფისი. არსებული
            მისამართი უცვლელი რჩება.
          </p>
          <div className="admin-grid">
            <Field
              label="დოზა"
              value={data.strength}
              onChange={(v) => update("strength", v)}
              placeholder="25 მგ ან მითითებული არ არის"
            />
            <Field
              label="რაოდენობა"
              type="number"
              min={1}
              value={data.pack}
              onChange={(v) => update("pack", v)}
            />
            <Field
              label="თანმიმდევრობა"
              type="number"
              min={1}
              value={data.order}
              onChange={(v) => update("order", v)}
            />
          </div>
          <Field
            label="შეფუთვის ერთეული"
            value={data.packUnit}
            onChange={(v) => update("packUnit", v)}
          />
          <Toggle
            label="გამოქვეყნებული"
            value={data.published}
            onChange={(v) => update("published", v)}
          />
          <Toggle
            label="მთავარ გვერდზე გამოჩენა"
            value={data.featured}
            onChange={(v) => update("featured", v)}
          />
          <p className="admin-hint">
            მონახაზი საჯარო ვებგვერდზე არ გამოჩნდება. ყველა ველი შეავსეთ
            ქართულად.
          </p>
        </div>
        <ImageField
          value={data.image}
          onChange={(v) => update("image", v)}
          onError={onError}
        />
      </div>
      <h3>პროდუქტის ინფორმაცია</h3>
      {productInformationFields.map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={data[key]}
          onChange={(v) => update(key, v)}
          multiline={longProductFields.has(key)}
        />
      ))}
      <h3>კატალოგის ფილტრები</h3>
      <p className="admin-hint">
        თითოეული მნიშვნელობა ჩაწერეთ ცალკე ხაზზე.
      </p>
      {[
        ["specialty", "სამედიცინო სპეციალობა"],
        ["use", "გამოყენების სფერო"],
        ["system", "ორგანოთა სისტემა"],
      ].map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={(filters[key] || []).join("\n")}
          multiline
          onChange={(v) =>
            update("facets", { ...filters, [key]: v.split("\n") })
          }
        />
      ))}
      <h3>კლინიკური წყაროები</h3>
      <div className="admin-reference-list">
        {sources.map((source) => (
          <Toggle
            key={source.id}
            label={source.title}
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
          პრეპარატის შენახვა
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
      <h2>ვებგვერდის ტექსტი</h2>
      <Field
        label="ტექსტის ძებნა"
        value={query}
        onChange={setQuery}
      />
      {data.entries
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => e.value.toLowerCase().includes(query.toLowerCase()))
        .map(({ e, i }) => (
          <details className="admin-text-block" key={e.key}>
            <summary>{e.value}</summary>
            <Field
              label="ქართული ტექსტი"
              multiline
              value={e.value}
              onChange={(v) =>
                setData((d) => ({
                  ...d,
                  entries: d.entries.map((x, j) =>
                    j === i ? { ...x, value: v } : x,
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
          ტექსტის შენახვა
        </button>
      </div>
    </section>
  );
}
const emptySection = () => ({
  published: false,
  page: "/",
  title: "",
  body: "",
  imageAlt: "",
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
      <h2>დამატებითი სექციები</h2>
      {data.sections.map((s, i) => (
        <article className="admin-section" key={i}>
          <div className="admin-editor-title">
            <h3>{s.title || `სექცია ${i + 1}`}</h3>
            <button
              onClick={() =>
                setData((d) => ({
                  ...d,
                  sections: d.sections.filter((_, j) => j !== i),
                }))
              }
            >
              წაშლა
            </button>
          </div>
          <Toggle
            label="გამოქვეყნებული"
            value={s.published}
            onChange={(v) => update(i, "published", v)}
          />
          <label className="admin-field">
            <span>გვერდი</span>
            <select
              value={s.page}
              onChange={(e) => update(i, "page", e.target.value)}
            >
              {[
                ["/", "მთავარი"],
                ["/about", "ჩვენ შესახებ"],
                ["/compounding", "კომპოზიტური ფარმაცია"],
                ["/products", "პრეპარატები"],
                ["/contact", "კონტაქტი"],
              ].map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {[
            ["title", "სათაური"],
            ["body", "ტექსტი"],
            ["imageAlt", "სურათის აღწერა"],
          ].map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={s[key]}
              multiline={key === "body"}
              onChange={(value) => update(i, key, value)}
            />
          ))}
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
        სექციის დამატება
      </button>
      <div className="admin-save">
        <button
          className="admin-primary"
          onClick={() => onSave({ ...record, data })}
        >
          სექციების შენახვა
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
      <h2>კლინიკური წყაროები</h2>
      <p>
        არსებული წყაროს კოდი უცვლელი დატოვეთ. გამოიყენეთ პროფესიულად
        გადამოწმებული პირველადი წყაროები.
      </p>
      {data.sources.map((s, i) => (
        <details className="admin-text-block" key={i}>
          <summary>{s.title || "ახალი წყარო"}</summary>
          {[
            ["id", "წყაროს კოდი"],
            ["title", "ქართული სათაური"],
            ["url", "ოფიციალური ბმული"],
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
              { id: "", title: "", url: "" },
            ],
          }))
        }
      >
        წყაროს დამატება
      </button>
      <div className="admin-save">
        <button
          className="admin-primary"
          onClick={() => onSave({ ...record, data })}
        >
          წყაროების შენახვა
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
        "ცვლილება შენახულია. ვებგვერდი განახლდება გამოქვეყნების დასრულების შემდეგ.",
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
      <main className="admin-loading">რედაქტორი იტვირთება…</main>
    );
  if (!user)
    return (
      <Login onLogin={setUser} configured={configured} sessionError={error} />
    );
  const sources = content?.sources.data.sources || [];
  return (
    <>
      <header className="admin-header">
        <img src="/fortis-logo.jpeg" alt="ფორტის ფარმაცევტიკალსი" />
        <span>{user.username}</span>
        <a href="/" target="_blank" rel="noreferrer">
          ვებგვერდის ნახვა
        </a>
        <button onClick={logout}>გასვლა</button>
      </header>
      <div className="admin-layout">
        <nav aria-label="რედაქტორის განყოფილებები">
          {[
            ["products", "პრეპარატები"],
            ["copy", "ვებგვერდის ტექსტები"],
            ["sections", "დამატებითი სექციები"],
            ["sources", "წყაროები"],
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
          {busy && <p role="status">მიმდინარეობს…</p>}
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
                    <h1>პრეპარატები</h1>
                    <button
                      className="admin-primary"
                      onClick={() => setEditing({ new: true })}
                    >
                      პრეპარატის დამატება
                    </button>
                  </div>
                  <Field
                    label="პრეპარატის ძებნა"
                    value={query}
                    onChange={setQuery}
                  />
                  <div className="admin-product-list">
                    {[...content.products]
                      .sort(
                        (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999),
                      )
                      .filter((p) =>
                        `${p.data.name} ${p.data.strength}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((p) => (
                        <button key={p.path} onClick={() => setEditing(p)}>
                          <img src={p.data.image} alt="" loading="lazy" />
                          <span>
                            <strong>{p.data.name}</strong>
                            <small>
                              {p.data.strength} · {p.data.pack} {p.data.packUnit}
                            </small>
                          </span>
                          <span className="admin-state">
                            {p.data.published
                              ? "გამოქვეყნებული"
                              : "მონახაზი"}
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
            <button onClick={load}>ხელახლა ცდა</button>
          )}
        </main>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<Admin />);
