import { usePreferences, PreferencesProvider } from "./preferences";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Menu,
  X,
  Phone,
  MapPin,
  Search,
  FlaskConical,
  Microscope,
  ShieldCheck,
  SlidersHorizontal,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { products, sources } from "./products";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "@fontsource-variable/noto-sans-georgian";
import "./style.css";
import "./preferences.css";
import "./refinements.css";
import { extraSections } from "./generated-content";
import { BrandArtwork } from "./brand-art";
import { BottleArtwork } from "./bottle-art";
import { ThemeArtwork } from "./theme-art";
import { facets, emptyFilters, filterProducts } from "./catalog-model";
const nav = [
  ["/", "Home"],
  ["/compounding", "Compounding"],
  ["/about", "About / Laboratory"],
  ["/products", "Products"],
  ["/contact", "Contact"],
];
const A = ({ children, ...props }) => <a {...props}>{children}</a>;
const Icon = ({ type: Type, ...p }) => (
  <Type size={20} strokeWidth={1.5} aria-hidden="true" {...p} />
);
function Brand() {
  const { t } = usePreferences();
  return (
    <A href="/" className="brand" aria-label={t("Fortis Pharmaceuticals home")}>
      <span className="brand-icon">
        <BrandArtwork symbol />
      </span>
      <span>
        <strong>FORTIS</strong>
        <small>PHARMACEUTICALS</small>
      </span>
    </A>
  );
}
function Header() {
  const { t, language, setLanguage, theme, setTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Brand />
        <nav
          id="main-navigation"
          aria-label={t("Main navigation")}
          className={open ? "nav open" : "nav"}
        >
          {nav.map(([url, name]) => (
            <A
              key={url}
              href={url}
              aria-current={location.pathname === url ? "page" : undefined}
            >
              {t(name)}
            </A>
          ))}
        </nav>
        <A href="tel:+995322053191" className="contact-nav">
          {t("Call pharmacy ")}
          <Icon type={Phone} />
        </A>
        <div className="preferences-controls">
          <button
            className="language-button"
            onClick={() => setLanguage(language === "en" ? "ka" : "en")}
            aria-label={
              language === "en" ? "ქართული ენის არჩევა" : "Switch to English"
            }
            title={
              language === "en" ? "ქართული ენის არჩევა" : "Switch to English"
            }
            lang={language === "en" ? "ka" : "en"}
          >
            {language === "en" ? "KA" : "EN"}
          </button>
          <button
            className="theme-switch"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label={t("Night mode")}
            title={t(
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
            )}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <ThemeArtwork />
          </button>
        </div>
        <button
          aria-controls="main-navigation"
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label={t(open ? "Close menu" : "Open menu")}
          aria-expanded={open}
        >
          <Icon type={open ? X : Menu} />
        </button>
      </div>
    </header>
  );
}
function Button({ children, href, secondary = false }) {
  return (
    <A className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
      <Icon type={ArrowUpRight} />
    </A>
  );
}
function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}
function Footer() {
  const { t } = usePreferences();
  return (
    <footer>
      <div className="footer-top wrap">
        <div>
          <Brand />
          <p>
            {t("Individual needs.")}
            <br />
            {t("Thoughtful preparation.")}
          </p>
        </div>
        <div>
          <small>{t("DISCOVER")}</small>
          {nav.slice(1, 4).map(([h, n]) => (
            <A key={h} href={h}>
              {t(n)}
            </A>
          ))}
        </div>
        <div>
          <small>{t("FIND US")}</small>
          <A href="/contact">
            {t("9 Givi Zhvania Street")}
            <br />
            {t("Tbilisi, Georgia")}
          </A>
          <A href="tel:+995322053191">+995 32 205 31 91</A>
        </div>
        <div>
          <small>{t("FOR PROFESSIONALS")}</small>
          <A href="https://fortislibrary.com" target="_blank" rel="noreferrer">
            {t("Fortis Library ")}
            <Icon type={ArrowUpRight} />
          </A>
          <A href="/editorial">{t("Information & references")}</A>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>
          © {new Date().getFullYear()}
          {t(" Fortis Pharmaceuticals")}
        </span>
        <span>
          {t(
            "Compounded preparations require individual professional assessment.",
          )}
        </span>
        <A href="/privacy">{t("Privacy")}</A>
      </div>
    </footer>
  );
}
function DeferredProductImage({ p }) {
  const { t } = usePreferences();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
      },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <img
      ref={ref}
      src={visible ? p.image : undefined}
      alt={`${t(p.name)} ${t(p.strength)}, ${p.pack} ${t(p.packUnit)} - ${t("supplied packaging illustration")}`}
      width={p.imageWidth}
      height={p.imageHeight}
      decoding="async"
      style={
        visible
          ? undefined
          : {
              visibility: "hidden",
            }
      }
    />
  );
}
function Card({ p }) {
  const { t } = usePreferences();
  return (
    <A href={`/products/${p.slug}`} className="product-card">
      <div
        className="product-image"
        style={{ aspectRatio: `${p.imageWidth} / ${p.imageHeight}` }}
      >
        <DeferredProductImage p={p} />
        <span className="round-arrow">
          <Icon type={ArrowUpRight} />
        </span>
      </div>
      <div className="product-card-bottom">
        <span className="product-category">{t(p.category)}</span>
        <h3>{t(p.name)}</h3>
        <div>
          <strong>{t(p.strength)}</strong>
          <span>
            {p.pack} {t(p.packUnit)}
          </span>
        </div>
      </div>
    </A>
  );
}
function Hero() {
  const { t } = usePreferences();
  return (
    <section className="simple-hero">
      <div className="wrap simple-hero-grid">
        <div className="hero-copy">
          <Eyebrow>{t("FORTIS COMPOUNDING PHARMACY")}</Eyebrow>
          <h1>
            {t("Precision")}
            <br />
            {t("compounding.")}
          </h1>
          <p>
            {t(
              "Prepared in Tbilisi. Individual medicines, carefully compounded around the needs of each patient.",
            )}
          </p>
          <div className="hero-actions">
            <Button href="/products">{t("Explore medicines")}</Button>
            <A href="/compounding" className="text-link">
              {t("Our approach ")}
              <Icon type={ArrowRight} />
            </A>
          </div>
        </div>
        <div className="hero-artwork">
          <BottleArtwork label={t("Hand-drawn amber Fortis medicine bottle")} />
        </div>
      </div>
    </section>
  );
}
function Approach() {
  const { t } = usePreferences();
  return (
    <section className="section wrap approach" id="approach">
      <h2>
        {t("Medicine shaped around")}
        <br />
        {t("individual needs.")}
      </h2>
      <div className="approach-content">
        <div>
          <p className="lead">
            {t(
              "When a standard preparation does not meet an individual’s needs, compounding opens a conversation.",
            )}
          </p>
          <p>
            {t(
              "Fortis prepares medicines locally, using active pharmaceutical ingredients sourced from the US and Europe. The prescriber and pharmacist assess each formulation together.",
            )}
          </p>
          <A href="/compounding" className="text-link">
            {t("Discover compounding ")}
            <Icon type={ArrowUpRight} />
          </A>
        </div>
        <div className="approach-items">
          {[
            [
              SlidersHorizontal,
              "Individual formulations",
              "Preparation shaped around the prescription and the person.",
            ],
            [
              FlaskConical,
              "Purposeful preparation",
              "Small-batch work, with attention to each stage.",
            ],
            [
              ShieldCheck,
              "A focus on quality",
              "Considered processes, documentation and professional review.",
            ],
          ].map(([I, h, b]) => (
            <div key={h}>
              <Icon type={I} size={26} />
              <div>
                <h3>{t(h)}</h3>
                <p>{t(b)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Featured() {
  const { t } = usePreferences();
  return (
    <section className="section featured">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <h2>{t("Featured preparations.")}</h2>
          </div>
          <Button href="/products" secondary>
            {t("View all products")}
          </Button>
        </div>
        <div className="product-grid featured-grid">
          {products
            .filter((p) => p.featured)
            .map((p) => (
              <Card key={p.slug} p={p} />
            ))}
        </div>
        <p className="quiet-note">
          {t(
            "Illustrative packaging. Follow your prescription and pharmacist’s instructions. Product information is not a recommendation for self-treatment.",
          )}
        </p>
      </div>
    </section>
  );
}
function PreparationGuide() {
  const { t } = usePreferences();
  return (
    <section className="section wrap preparation-guide">
      <div className="preparation-guide-intro">
        <h2>{t("The prescription is just the beginning.")}</h2>
        <p>
          {t(
            "An individual preparation starts with a clear understanding of the patient’s needs. These are the details to discuss with your prescriber and the Fortis pharmacist.",
          )}
        </p>
      </div>
      <dl className="preparation-guide-topics">
        <div>
          <dt>{t("Strength and formulation")}</dt>
          <dd>
            {t(
              "The ingredient, strength and dosage form need to match the prescription. Release characteristics matter; preparations with similar ingredient names are not automatically interchangeable.",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("Ingredients and individual needs")}</dt>
          <dd>
            {t(
              "Discuss allergies, excipient tolerance and any formulation requirements before preparation. Fortis describes sourcing active pharmaceutical ingredients from the US and Europe for local compounding in Tbilisi.",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("Guidance at dispensing")}</dt>
          <dd>
            {t(
              "Confirm your own directions, storage conditions and beyond-use date with the pharmacist. The information and packaging illustrations on this website do not replace your prescription.",
            )}
          </dd>
        </div>
      </dl>
      <A href="/compounding" className="text-link">
        {t("How individual preparation works")}
        <Icon type={ArrowRight} />
      </A>
    </section>
  );
}
function LabTeaser() {
  const { t } = usePreferences();
  return (
    <section className="section wrap company-overview">
      <Eyebrow>{t("OUR STORY & LABORATORY")}</Eyebrow>
      <h2>
        {t("Prepared locally.")}
        <br />
        {t("With care at every stage.")}
      </h2>
      <div className="company-overview-body">
        <p>
          {t(
            "Fortis was founded around the needs of patients and healthcare professionals. Our pharmacy brings magistral and officinal compounding to Tbilisi, with attention to preparation, handling and storage.",
          )}
        </p>
        <div>
          <h3>{t("Inside Fortis")}</h3>
          <p>
            {t(
              "Learn about our founding vision, laboratory approach and commitment to professional collaboration.",
            )}
          </p>
          <A href="/about" className="text-link">
            {t("Our story & laboratory ")}
            <Icon type={ArrowUpRight} />
          </A>
        </div>
      </div>
      <BrandArtwork
        className="company-brand"
        label={t(
          "Fortis Pharmaceuticals / Compounding Pharmacy, in Georgian and English",
        )}
      />
    </section>
  );
}
function ExtraContent() {
  const { language } = usePreferences();
  const path = location.pathname.replace(/\/$/, "") || "/";
  return extraSections
    .filter((s) => s.published && (s.page || "/") === path)
    .map((s, i) => {
      const copy = s[language] || s.en;
      return (
        <section className="section wrap added-content" key={i}>
          <h2>{copy.title}</h2>
          <div>
            {copy.body.split(/\n\s*\n/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
          {s.image && (
            <img
              src={s.image}
              alt={copy.imageAlt || copy.title}
              loading="lazy"
            />
          )}
        </section>
      );
    });
}
function ContactBand() {
  const { t } = usePreferences();
  return (
    <section className="contact-band">
      <div className="wrap">
        <div>
          <h2>
            {t("A question about")}
            <br />
            {t("individual preparation?")}
          </h2>
        </div>
        <Button href="/contact">{t("Talk to Fortis")}</Button>
      </div>
    </section>
  );
}
function Home() {
  return (
    <>
      <Hero />
      <Approach />
      <Featured />
      <PreparationGuide />
      <LabTeaser />
      <ExtraContent />
      <ContactBand />
    </>
  );
}
function PageIntro({ eyebrow, title, description }) {
  const { t } = usePreferences();
  return (
    <div className="page-intro wrap">
      <Eyebrow>{t(eyebrow)}</Eyebrow>
      <h1>{t(title)}</h1>
      {description && <p>{t(description)}</p>}
    </div>
  );
}
function Catalog() {
  const { t } = usePreferences();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(emptyFilters);
  const filterRef = useRef(null);
  const shown = filterProducts(q, selected, t);
  const active = facets.flatMap((f) =>
    selected[f.key].map((value) => ({ ...f, value })),
  );
  const toggle = (key, value) =>
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  const reset = () => {
    setQ("");
    setSelected(emptyFilters());
  };
  useEffect(() => {
    const close = (e) => {
      if (!filterRef.current?.contains(e.target))
        filterRef.current
          ?.querySelectorAll("details[open]")
          .forEach((d) => (d.open = false));
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <>
      <PageIntro
        eyebrow={t("THE FORTIS PORTFOLIO")}
        title={
          <>
            {t("Individual preparations.")}
            <br />
            <em>{t("Clearly presented.")}</em>
          </>
        }
        description={t(
          "Find a preparation by ingredient, strength, specialty or use context. Read its individual information and references before discussing it with your prescriber.",
        )}
      />
      <section className="wrap catalog">
        <div className="catalog-search-row">
          <label className="search">
            <Icon type={Search} />
            <input
              id="product-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search name or strength")}
              aria-label={t("Search products")}
            />
            {q && (
              <button onClick={() => setQ("")} aria-label={t("Clear search")}>
                <Icon type={X} />
              </button>
            )}
          </label>
          <p>{t("Choose more than one option in each filter.")}</p>
        </div>
        <div className="catalog-facets" ref={filterRef}>
          {facets.map((f) => (
            <details
              className="catalog-facet"
              key={f.key}
              data-facet={f.key}
              onToggle={(e) => {
                if (e.currentTarget.open)
                  filterRef.current
                    .querySelectorAll("details[open]")
                    .forEach((d) => {
                      if (d !== e.currentTarget) d.open = false;
                    });
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.open = false;
                  e.currentTarget.querySelector("summary").focus();
                }
              }}
            >
              <summary>
                <span>{t(f.label)}</span>
                {selected[f.key].length > 0 && <b>{selected[f.key].length}</b>}
                <Icon type={ChevronDown} />
              </summary>
              <fieldset className="facet-options">
                <legend className="sr-only">{t(f.label)}</legend>
                {f.options.map((value) => (
                  <label key={value}>
                    <input
                      type="checkbox"
                      checked={selected[f.key].includes(value)}
                      onChange={() => toggle(f.key, value)}
                    />
                    <span>{t(value)}</span>
                  </label>
                ))}
                {f.key === "form" && (
                  <p>
                    {t(
                      "Available forms reflect the currently published preparations.",
                    )}
                  </p>
                )}
              </fieldset>
            </details>
          ))}
        </div>
        <div className="catalog-results-bar">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{shown.length}</strong>
            {t(" preparations")} <span> / {products.length}</span>
          </p>
          {(active.length > 0 || q) && (
            <button className="reset-filters" onClick={reset}>
              {t("Reset filters")}
              <Icon type={X} />
            </button>
          )}
        </div>
        {active.length > 0 && (
          <div className="active-filters" aria-label={t("Active filters")}>
            {active.map((f) => (
              <button
                key={f.key + f.value}
                onClick={() => toggle(f.key, f.value)}
                aria-label={`${t("Remove filter")}: ${t(f.label)}: ${t(f.value)}`}
              >
                <span>
                  <small>{t(f.label)}:</small> {t(f.value)}
                </span>
                <Icon type={X} />
              </button>
            ))}
          </div>
        )}
        <p className="filter-note">
          {t(
            "Filters describe ingredient reference or research contexts, not approved indications for Fortis preparations. Off-label uses are marked; study results and formulation limits remain on each product page.",
          )}
        </p>
        <div className="product-grid">
          {shown.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </div>
        {!shown.length && (
          <div className="empty">
            <h2>{t("No preparations found.")}</h2>
            <p>{t("Try another ingredient or reset the filters.")}</p>
          </div>
        )}
        <p className="quiet-note">
          {t(
            "Illustrative packaging. Follow your prescription and pharmacist’s instructions. Availability and formulation details should be confirmed with Fortis.",
          )}
        </p>
      </section>
      <ContactBand />
    </>
  );
}
function Product({ p }) {
  const { t } = usePreferences();
  const information = [
    ["Name", p.name],
    ["Dosage form", p.form],
    ["Preparation and route", p.preparation],
    ["Medical area", p.category],
    ["Short description", p.tag],
    ["Name and Composition", p.nameComposition],
    ["Pharmacological Properties and Mechanism of Action", p.pharmacology],
    ["Indications", p.indications],
    ["Dosage and Administration", p.dosageAdministration],
    ["Side Effects", p.sideEffects],
    ["Contraindications", p.contraindications],
    ["Special Warnings and Precautions", p.warningsPrecautions],
    ["Storage Conditions", p.storageConditions],
    ["Manufacturer", p.manufacturer],
  ];
  return (
    <>
      <div className="wrap breadcrumb">
        <A href="/products">{t("Products")}</A>
        <span>/</span>
        <span>
          {t(p.name)} · {t(p.strength)}
        </span>
      </div>
      <section className="wrap product-detail">
        <div className="detail-visual">
          <img
            src={p.image}
            alt={`${t(p.name)} ${t(p.strength)}, ${p.pack} ${t(p.packUnit)} - ${t("supplied packaging illustration")}`}
            width={p.imageWidth}
            height={p.imageHeight}
          />
          <p>
            {t(
              "Illustrative packaging. Follow your prescription and pharmacist’s instructions.",
            )}
          </p>
        </div>
        <div className="detail-copy">
          <Eyebrow>{t(p.category)}</Eyebrow>
          <h1>{t(p.name)}</h1>
          <div className="detail-strength">{t(p.strength)}</div>
          <div className="specs">
            <div>
              <small>{t("PACK SIZE")}</small>
              <strong>
                {p.pack} {t(p.packUnit)}
              </strong>
            </div>
            <div>
              <small>{t("PREPARATION")}</small>
              <strong>{t(p.preparation)}</strong>
            </div>
          </div>
          <Button href="/contact">{t("Ask about this preparation")}</Button>
          <p className="detail-small">
            {t(
              "Selection, directions, excipients, release characteristics and beyond-use date must be confirmed by the prescribing clinician and dispensing pharmacist.",
            )}
          </p>
        </div>
      </section>
      <section id="product-information" className="wrap product-information">
        <div className="product-information-heading">
          <h2>{t("Product information")}</h2>
        </div>
        <div className="product-information-grid">
          {information.map(([label, value]) => (
            <article key={label}>
              <small>{t(label)}</small>
              <p>{value?.trim() ? t(value) : t("Not specified")}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="wrap references">
        <div>
          <Eyebrow>{t("READ THE EVIDENCE")}</Eyebrow>
          <h2>{t("Sources & perspective.")}</h2>
        </div>
        <div>
          {p.refs.map((key) => (
            <A
              href={sources[key].url}
              key={key}
              target="_blank"
              rel="noreferrer"
            >
              {t(sources[key].title)}
              <Icon type={ArrowUpRight} />
            </A>
          ))}
          <p>
            {t(
              "These references describe ingredients or reference medicines, not FDA or EMA approval of Fortis compounded preparations. Archived labels may not reflect the latest labeling. This overview is not a complete safety guide or prescribing advice.",
            )}
          </p>
          <A href="/editorial" className="text-link">
            {t("How we present product information ")}
            <Icon type={ArrowRight} />
          </A>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
const questions = [
  [
    "What is pharmaceutical compounding?",
    "Compounding is the preparation of a medicine to a defined formulation. Magistral preparations respond to an individual prescription; officinal preparations follow a recognized pharmacopoeial formula, subject to the applicable local framework.",
  ],
  [
    "When might a tailored preparation be considered?",
    "A prescriber may identify a need related to a particular strength, dosage form or an excipient intolerance. The pharmacist assesses what can appropriately be prepared. Compounding does not automatically make a medicine safer or more effective.",
  ],
  [
    "How do I discuss a preparation?",
    "Contact the pharmacy to discuss practical requirements. Your prescriber and pharmacist determine suitability, formulation and instructions. Do not change or start a medicine based on this website.",
  ],
  [
    "Can I order through this website?",
    "This website is an information portfolio. Contact Fortis to confirm availability and the prescription and preparation requirements. There is no online checkout.",
  ],
];
function FAQ() {
  const { t } = usePreferences();
  return (
    <div className="faq">
      {questions.map(([q, a]) => (
        <details key={q}>
          <summary>
            {t(q)}
            <Icon type={Plus} />
          </summary>
          <p>{t(a)}</p>
        </details>
      ))}
    </div>
  );
}
function Compounding() {
  const { t } = usePreferences();
  return (
    <>
      <PageIntro
        eyebrow={t("THE ART & SCIENCE OF COMPOUNDING")}
        title={
          <>
            {t("Prepared with purpose.")}
            <br />
            <em>{t("Centered on the individual.")}</em>
          </>
        }
        description={t(
          "A considered response when an individual’s pharmaceutical needs call for a tailored preparation.",
        )}
      />
      <div className="wrap editorial-layout">
        <aside>
          <span className="georgian">მაგისტრალური რეცეპტი</span>
          <p>აქტუალური, ინდივიდუალური, ეფექტური</p>
          <div className="aside-icon">
            <Icon type={FlaskConical} size={84} />
          </div>
        </aside>
        <article>
          <h2>{t("A prescription is the starting point.")}</h2>
          <p>
            {t(
              "People may have different requirements relating to strength, formulation, excipient tolerance or coexisting conditions. Compounding brings the prescriber and pharmacist into a conversation about those requirements.",
            )}
          </p>
          <p>
            {t(
              "Fortis’s company account describes sourcing active pharmaceutical ingredients from the US and Europe and preparing medicines locally in Tbilisi. Each requested preparation requires a professional assessment of suitability and feasibility.",
            )}
          </p>
          <div className="steps">
            {[
              [
                "01",
                "Understand the need",
                "Discuss the prescription and the individual formulation requirements.",
              ],
              [
                "02",
                "Consider the preparation",
                "Assess ingredients, formulation, handling and practical limitations.",
              ],
              [
                "03",
                "Prepare & review",
                "Prepare, document and review the medicine before dispensing.",
              ],
              [
                "04",
                "Provide clear guidance",
                "Confirm the specific directions, storage and beyond-use date with the pharmacist.",
              ],
            ].map(([n, h, p]) => (
              <div key={n}>
                <span>{t(n)}</span>
                <div>
                  <h3>{t(h)}</h3>
                  <p>{t(p)}</p>
                </div>
              </div>
            ))}
          </div>
          <h2>{t("Questions, answered.")}</h2>
          <FAQ />
        </article>
      </div>
      <ContactBand />
    </>
  );
}
function About() {
  const { t } = usePreferences();
  return (
    <>
      <PageIntro
        eyebrow={t("ABOUT FORTIS")}
        title={
          <>
            {t("Rooted in Tbilisi.")}
            <br />
            <em>{t("Focused on individual care.")}</em>
          </>
        }
        description={t(
          "A compounding pharmacy built around the relationship between patients, prescribers and pharmacists.",
        )}
      />
      <section className="wrap editorial-layout">
        <aside>
          <Eyebrow>{t("OUR REASON FOR BEING")}</Eyebrow>
          <h2>
            {t("A personal approach")}
            <br />
            {t("to preparation.")}
          </h2>
          <p className="georgian">
            ფორტის ფარმაცევტიკალს
            <br />
            კომპოზიტური ფარმაცია
          </p>
        </aside>
        <article>
          <h2>{t("Our story")}</h2>
          <p>
            {t(
              "Fortis was founded in response to patients’ needs, with the aim of preparing magistral and officinal medicines in a model inspired by European and American compounding pharmacies.",
            )}
          </p>
          <p>
            {t(
              "The company’s founding vision also includes collaboration with healthcare professionals to support continuity of treatment in hospital and after discharge.",
            )}
          </p>
          <blockquote lang="ka">
            მომხმარებლების ინტერესების გათვალისწინებით გადავწყვიტეთ გაგვეხსნა
            აფთიაქი, რომელიც ევროპული და ამერიკული ანალოგების მსგავსად შეძლებდა
            მედიკამენტების დამზადებას მაგისტრალური და ოფიცინალური რეცეპტის
            საფუძველზე.
          </blockquote>
          <h2 id="laboratory">{t("Inside the laboratory")}</h2>
          <p>
            {t(
              "Fortis describes a laboratory equipped for small-batch preparation, with climate control, sterilization and autoclaving, and separate sterile and nonsterile working zones.",
            )}
          </p>
          <div className="quality-grid">
            {[
              [
                FlaskConical,
                "Preparation",
                "Small-batch pharmaceutical equipment and defined preparation processes.",
              ],
              [
                Microscope,
                "Environment",
                "Attention to hygiene, the preparation environment and handling.",
              ],
              [
                ShieldCheck,
                "Review",
                "Checks across preparation and storage, with testing in accredited laboratories as described by the company.",
              ],
            ].map(([I, h, b]) => (
              <div key={h}>
                <Icon type={I} size={30} />
                <h3>{t(h)}</h3>
                <p>{t(b)}</p>
              </div>
            ))}
          </div>
          <h2>{t("Practice & documentation")}</h2>
          <p>
            {t("The company reports permit ")}
            <strong>{t("სფსრს N00036")}</strong>
            {t(
              " for preparation and sale under officinal and magistral prescriptions.",
            )}
          </p>
          <p>
            <strong>
              {t(
                "The Good Pharmacy Practice (GPP) certification process has started.",
              )}
            </strong>{" "}
            {t("Fortis is not presented on this website as GPP certified.")}
          </p>
          <p className="quiet-note">
            {t(
              "Company and laboratory descriptions are based on information supplied by Fortis. They are not an independent audit or verification of certification.",
            )}
          </p>
        </article>
      </section>
      <ContactBand />
    </>
  );
}
function Contact() {
  const { t } = usePreferences();
  return (
    <>
      <PageIntro
        eyebrow={t("CONTACT FORTIS")}
        title={
          <>
            {t("A conversation.")}
            <br />
            <em>{t("A more individual approach.")}</em>
          </>
        }
        description={t(
          "For preparation questions, product availability or professional enquiries, speak with the pharmacy.",
        )}
      />
      <section className="wrap contact-layout">
        <div>
          <A className="contact-option" href="tel:+995322053191">
            <Icon type={Phone} size={30} />
            <div>
              <small>{t("CALL THE PHARMACY")}</small>
              <h2>+995 32 205 31 91</h2>
              <span>
                {t("Speak with our team ")}
                <Icon type={ArrowUpRight} />
              </span>
            </div>
          </A>
          <div className="contact-option">
            <Icon type={MapPin} size={30} />
            <div>
              <small>{t("VISIT FORTIS")}</small>
              <h2>{t("9 Givi Zhvania Street")}</h2>
              <p>{t("Tbilisi, Georgia")}</p>
              <A
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=9+Givi+Zhvania+Street+Tbilisi"
                target="_blank"
                rel="noreferrer"
              >
                {t("Open directions ")}
                <Icon type={ArrowUpRight} />
              </A>
            </div>
          </div>
          <p className="quiet-note">
            {t(
              "Please call before visiting to confirm opening hours and availability.",
            )}
          </p>
        </div>
        <div className="contact-panel">
          <Eyebrow>{t("FOR PATIENTS & PROFESSIONALS")}</Eyebrow>
          <h2>
            {t("Let’s discuss")}
            <br />
            {t("what’s needed.")}
          </h2>
          <p>
            {t(
              "Our team can explain preparation requirements and help you identify what to discuss with your prescriber.",
            )}
          </p>
          <ul>
            <li>{t("Individual formulation enquiries")}</li>
            <li>{t("Ingredient and excipient questions")}</li>
            <li>{t("Product and strength availability")}</li>
            <li>{t("Professional collaboration")}</li>
          </ul>
          <div className="contact-resource">
            <Icon type={BookOpen} />
            <A
              href="https://fortislibrary.com"
              target="_blank"
              rel="noreferrer"
            >
              {t("Explore Fortis Library ")}
              <Icon type={ArrowUpRight} />
            </A>
          </div>
        </div>
      </section>
    </>
  );
}
function Editorial() {
  const { t } = usePreferences();
  return (
    <>
      <PageIntro
        eyebrow={t("INFORMATION & REFERENCES")}
        title={t("Clear context. Defined limits.")}
      />
      <article className="wrap text-page">
        <h2>{t("Our medical source policy")}</h2>
        <p>
          {t(
            "Ingredient context uses four selected authorities and publications: FDA, EMA, JAMA Dermatology and Pain Reports. Original journal articles may be accessed through PubMed Central. References are linked on each product page.",
          )}
        </p>
        <h2>{t("Ingredients and preparations are different")}</h2>
        <p>
          {t(
            "A reference medicine’s approval or study result does not establish the approval, equivalence, bioavailability, safety or efficacy of a particular Fortis compounded preparation. Strength, excipients, release profile and preparation method can matter. Product categories are navigation aids.",
          )}
        </p>
        <h2>{t("Packaging and prescribing")}</h2>
        <p>
          {t(
            "Product images are the original illustrations supplied by Fortis. They are not dispensing instructions. Follow only the directions issued for your own prescription by your clinician and pharmacist; do not use text shown in illustrative packaging to determine treatment, storage or beyond-use dates.",
          )}
        </p>
        <h2>{t("Editorial status")}</h2>
        <p>
          {t(
            "Source links checked September 10, 2026. This is a concise educational overview, not comprehensive prescribing information. Archived FDA documents are identified by year and may not be the latest approved labels. Clinical copy requires the pharmacy’s professional review as part of ongoing content maintenance.",
          )}
        </p>
        <h2>{t("Company information")}</h2>
        <p>
          {t(
            "Company background, permit details and laboratory descriptions were supplied by Fortis and are presented as company information, not independently verified regulatory findings.",
          )}
        </p>
      </article>
    </>
  );
}
function Privacy() {
  const { t } = usePreferences();
  return (
    <>
      <PageIntro
        eyebrow={t("PRIVACY")}
        title={t("A simple information website.")}
      />
      <article className="wrap text-page">
        <p>
          {t(
            "This website has no checkout, patient registration or patient-information form. It does not ask you to upload prescriptions or health records.",
          )}
        </p>
        <p>
          {t(
            "No advertising trackers or analytics scripts are added by this website. Hosting providers may process technical access logs to operate and secure the site. External links, including maps and reference publications, are governed by their own privacy policies.",
          )}
        </p>
        <p>
          {t(
            "Your language and appearance choices are saved only in this browser so they remain selected when you return. No health information is stored in these preferences.",
          )}
        </p>
        <p>
          {t("For pharmacy enquiries, call")}{" "}
          <A href="tel:+995322053191">+995 32 205 31 91</A>
          {t(
            ". Discuss sensitive health information through an appropriate channel agreed with the pharmacy.",
          )}
        </p>
      </article>
    </>
  );
}
function App() {
  const { t } = usePreferences();
  const path = location.pathname.replace(/\/$/, "") || "/";
  let page;
  let title = "Precision compounding in Tbilisi";
  if (path === "/") page = <Home />;
  else if (path === "/products") {
    page = <Catalog />;
    title = "Product portfolio";
  } else if (path === "/compounding") {
    page = <Compounding />;
    title = "Compounding";
  } else if (path === "/about") {
    page = <About />;
    title = "Our story & laboratory";
  } else if (path === "/contact") {
    page = <Contact />;
    title = "Contact";
  } else if (path === "/editorial") {
    page = <Editorial />;
    title = "Information & references";
  } else if (path === "/privacy") {
    page = <Privacy />;
    title = "Privacy";
  } else {
    const p = products.find((p) => path === `/products/${p.slug}`);
    if (p) {
      page = <Product p={p} />;
      title = `${t(p.name)} ${t(p.strength)}`;
    } else {
      page = (
        <div className="wrap not-found">
          <h1>{t("Page not found.")}</h1>
          <Button href="/products">{t("Explore the portfolio")}</Button>
        </div>
      );
      title = "Page not found";
    }
  }
  useEffect(() => {
    document.title = `${t(title)} | ${t("Fortis Pharmaceuticals")}`;
  }, [title, t]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content")}
      </a>
      <Header />
      <main id="main">
        {page}
        {path !== "/" && <ExtraContent />}
      </main>
      <Footer />
    </>
  );
}
const root =
  import.meta.hot?.data.root || createRoot(document.getElementById("root"));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(
  <PreferencesProvider>
    <App />
  </PreferencesProvider>,
);
