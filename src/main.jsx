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
  ["/", "მთავარი"],
  ["/compounding", "კომპოზიტური ფარმაცია"],
  ["/about", "ჩვენ შესახებ / ლაბორატორია"],
  ["/products", "პროდუქტები"],
  ["/contact", "კონტაქტი"],
];
const A = ({ children, ...props }) => <a {...props}>{children}</a>;
const Icon = ({ type: Type, ...p }) => (
  <Type size={20} strokeWidth={1.5} aria-hidden="true" {...p} />
);
function Brand() {
  const { t } = usePreferences();
  return (
    <A href="/" className="brand" aria-label={t("ფორტის ფარმაცევტიკალსის მთავარი გვერდი")}>
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
  const { t, theme, setTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Brand />
        <nav
          id="main-navigation"
          aria-label={t("მთავარი ნავიგაცია")}
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
          {t("დარეკეთ აფთიაქში ")}
          <Icon type={Phone} />
        </A>
        <div className="preferences-controls">
          <button
            className="theme-switch"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label={t("ღამის რეჟიმი")}
            title={t(
              theme === "dark" ? "დღის რეჟიმზე გადასვლა" : "ღამის რეჟიმზე გადასვლა",
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
          aria-label={t(open ? "მენიუს დახურვა" : "მენიუს გახსნა")}
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
            {t("ინდივიდუალური საჭიროებები.")}
            <br />
            {t("ყურადღებით მომზადებული მედიკამენტები.")}
          </p>
        </div>
        <div>
          <small>{t("გაიგეთ მეტი")}</small>
          {nav.slice(1, 4).map(([h, n]) => (
            <A key={h} href={h}>
              {t(n)}
            </A>
          ))}
        </div>
        <div>
          <small>{t("გვიპოვეთ")}</small>
          <A href="/contact">
            {t("გივი ჟვანიას ქუჩა 9")}
            <br />
            {t("თბილისი, საქართველო")}
          </A>
          <A href="tel:+995322053191">+995 32 205 31 91</A>
        </div>
        <div>
          <small>{t("პროფესიონალებისთვის")}</small>
          <A href="https://fortislibrary.com" target="_blank" rel="noreferrer">
            {t("ფორტის ბიბლიოთეკა ")}
            <Icon type={ArrowUpRight} />
          </A>
          <A href="/editorial">{t("ინფორმაცია და წყაროები")}</A>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>
          © {new Date().getFullYear()}
          {t(" ფორტის ფარმაცევტიკალს")}
        </span>
        <span>
          {t(
            "ინდივიდუალურად მომზადებული პრეპარატის გამოყენება სპეციალისტის შეფასებას საჭიროებს.",
          )}
        </span>
        <A href="/privacy">{t("კონფიდენციალურობა")}</A>
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
      alt={`${t(p.name)} ${t(p.strength)}, ${p.pack} ${t(p.packUnit)} - ${t("მოწოდებული შეფუთვის ილუსტრაცია")}`}
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
          <Eyebrow>{t("ფორტის კომპოზიტური აფთიაქი")}</Eyebrow>
          <h1>
            {t("სიზუსტით")}
            <br />
            {t("მომზადებული.")}
          </h1>
          <p>
            {t(
              "თბილისში ვამზადებთ მედიკამენტებს, თითოეული პაციენტის საჭიროებისა და ექიმის დანიშნულების მიხედვით.",
            )}
          </p>
          <div className="hero-actions">
            <Button href="/products">{t("პრეპარატების ნახვა")}</Button>
            <A href="/compounding" className="text-link">
              {t("ჩვენი მიდგომა ")}
              <Icon type={ArrowRight} />
            </A>
          </div>
        </div>
        <div className="hero-artwork">
          <BottleArtwork label={t("ფორტისის ქარვისფერი ფლაკონის გრაფიკული ესკიზი")} />
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
        {t("მედიკამენტი, მორგებული")}
        <br />
        {t("ინდივიდუალურ საჭიროებებს.")}
      </h2>
      <div className="approach-content">
        <div>
          <p className="lead">
            {t(
              "როდესაც სტანდარტული პრეპარატი პაციენტის საჭიროებებს ვერ პასუხობს, განიხილება ინდივიდუალური მომზადების შესაძლებლობა.",
            )}
          </p>
          <p>
            {t(
              "ფორტისი მედიკამენტებს ადგილზე ამზადებს, აშშ-დან და ევროპიდან მიღებული აქტიური ფარმაცევტული ინგრედიენტებით. თითოეულ ფორმულას ექიმი და ფარმაცევტი ერთობლივად აფასებენ.",
            )}
          </p>
          <A href="/compounding" className="text-link">
            {t("კომპოზიტური ფარმაციის შესახებ ")}
            <Icon type={ArrowUpRight} />
          </A>
        </div>
        <div className="approach-items">
          {[
            [
              SlidersHorizontal,
              "ინდივიდუალური ფორმულები",
              "მომზადება დანიშნულებისა და პაციენტის საჭიროებების მიხედვით.",
            ],
            [
              FlaskConical,
              "ყურადღება თითოეულ ეტაპზე",
              "მცირე პარტიებით მუშაობა და ყურადღება თითოეული ეტაპის მიმართ.",
            ],
            [
              ShieldCheck,
              "ხარისხზე ზრუნვა",
              "მომზადების პროცესის დოკუმენტირება და ფარმაცევტის პროფესიული შეფასება.",
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
            <h2>{t("შერჩეული პრეპარატები.")}</h2>
          </div>
          <Button href="/products" secondary>
            {t("ყველა პროდუქტის ნახვა")}
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
            "შეფუთვა საილუსტრაციოა. დაიცავით თქვენი დანიშნულება და ფარმაცევტის მითითებები. პროდუქტის შესახებ ინფორმაცია თვითმკურნალობის რეკომენდაცია არ არის.",
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
        <h2>{t("ყველაფერი დანიშნულებით იწყება.")}</h2>
        <p>
          {t(
            "ინდივიდუალური მედიკამენტის მომზადებამდე მნიშვნელოვანია პაციენტის საჭიროებების გააზრება. ეს საკითხები თქვენს ექიმსა და ფორტისის ფარმაცევტთან ერთად განიხილეთ.",
          )}
        </p>
      </div>
      <dl className="preparation-guide-topics">
        <div>
          <dt>{t("დოზა და ფორმულა")}</dt>
          <dd>
            {t(
              "მოქმედი ნივთიერება, დოზა და წამლის ფორმა დანიშნულებას უნდა შეესაბამებოდეს. მნიშვნელოვანია ნივთიერების გამოთავისუფლების თავისებურებებიც. ერთი და იმავე ნივთიერების შემცველი პრეპარატები ყოველთვის ურთიერთჩანაცვლებადი არ არის.",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("შემადგენლობა და ინდივიდუალური საჭიროებები")}</dt>
          <dd>
            {t(
              "მომზადებამდე აცნობეთ ფარმაცევტს ალერგიის, დამხმარე ნივთიერებების აუტანლობისა და ფორმულის მიმართ სხვა მოთხოვნების შესახებ. კომპანიის ინფორმაციით, ფორტისი მედიკამენტებს თბილისში ამზადებს, აშშ-დან და ევროპიდან მიღებული აქტიური ნივთიერებებით.",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("მითითებები მედიკამენტის მიღებისას")}</dt>
          <dd>
            {t(
              "ფარმაცევტთან გადაამოწმეთ მიღების წესი, შენახვის პირობები და გამოყენების საბოლოო ვადა. ვებგვერდის ინფორმაცია და შეფუთვის ილუსტრაციები თქვენს დანიშნულებას ვერ ჩაანაცვლებს.",
            )}
          </dd>
        </div>
      </dl>
      <A href="/compounding" className="text-link">
        {t("როგორ მზადდება ინდივიდუალური მედიკამენტი")}
        <Icon type={ArrowRight} />
      </A>
    </section>
  );
}
function LabTeaser() {
  const { t } = usePreferences();
  return (
    <section className="section wrap company-overview">
      <Eyebrow>{t("ჩვენი ისტორია და ლაბორატორია")}</Eyebrow>
      <h2>
        {t("მზადდება საქართველოში.")}
        <br />
        {t("ზრუნვით, ყოველ ეტაპზე.")}
      </h2>
      <div className="company-overview-body">
        <p>
          {t(
            "ფორტისი პაციენტებისა და ჯანდაცვის სპეციალისტების საჭიროებების საპასუხოდ შეიქმნა. თბილისში მედიკამენტებს მაგისტრალური და ოფიცინალური რეცეპტებით ვამზადებთ და განსაკუთრებულ ყურადღებას მომზადებისა და შენახვის პირობებს ვუთმობთ.",
          )}
        </p>
        <div>
          <h3>{t("გაიცანით ფორტისი")}</h3>
          <p>
            {t(
              "გაეცანით ჩვენი შექმნის იდეას, ლაბორატორიის მუშაობის პრინციპებსა და პროფესიული თანამშრომლობის ხედვას.",
            )}
          </p>
          <A href="/about" className="text-link">
            {t("ჩვენი ისტორია და ლაბორატორია ")}
            <Icon type={ArrowUpRight} />
          </A>
        </div>
      </div>
      <BrandArtwork
        className="company-brand"
        label="ფორტის ფარმაცევტიკალსი / კომპოზიტური აფთიაქი"
      />
    </section>
  );
}
function ExtraContent() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  return extraSections
    .filter((s) => s.published && (s.page || "/") === path)
    .map((s, i) => {
      return (
        <section className="section wrap added-content" key={i}>
          <h2>{s.title}</h2>
          <div>
            {s.body.split(/\n\s*\n/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
          {s.image && (
            <img
              src={s.image}
              alt={s.imageAlt || s.title}
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
            {t("გაქვთ კითხვა")}
            <br />
            {t("ინდივიდუალურ მომზადებაზე?")}
          </h2>
        </div>
        <Button href="/contact">{t("დაუკავშირდით ფორტისს")}</Button>
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
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  return (
    <>
      <PageIntro
        eyebrow={t("ფორტის პროდუქტები")}
        title={
          <>
            {t("ინდივიდუალური პრეპარატები.")}
            <br />
            <em>{t("გასაგები ინფორმაცია.")}</em>
          </>
        }
        description={t(
          "მოძებნეთ პრეპარატი მოქმედი ნივთიერებით, დოზით ან სამედიცინო მიმართულებით. გაეცანით მის შესახებ ინფორმაციასა და წყაროებს, შემდეგ კი განიხილეთ თქვენს ექიმთან.",
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
              placeholder={t("დასახელება ან დოზა")}
              aria-label={t("პროდუქტების ძიება")}
            />
            {q && (
              <button onClick={() => setQ("")} aria-label={t("ძიების გასუფთავება")}>
                <Icon type={X} />
              </button>
            )}
          </label>
          <p>{t("თითოეულ ფილტრში შეგიძლიათ რამდენიმე ვარიანტი მონიშნოთ.")}</p>
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
                      "მოცემულია გამოქვეყნებული პრეპარატების შესაბამისი ფორმები.",
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
            {t(" პრეპარატი")} <span> / {products.length}</span>
          </p>
          {(active.length > 0 || q) && (
            <button className="reset-filters" onClick={reset}>
              {t("ფილტრების გასუფთავება")}
              <Icon type={X} />
            </button>
          )}
        </div>
        {active.length > 0 && (
          <div className="active-filters" aria-label={t("არჩეული ფილტრები")}>
            {active.map((f) => (
              <button
                key={f.key + f.value}
                onClick={() => toggle(f.key, f.value)}
                aria-label={`${t("ფილტრის მოხსნა")}: ${t(f.label)}: ${t(f.value)}`}
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
            "ფილტრები მოქმედი ნივთიერების რეფერენსულ პრეპარატებს ან კვლევით გამოყენებას აღწერს და ფორტისის პრეპარატების დამტკიცებულ ჩვენებებს არ განსაზღვრავს. არარეგისტრირებული ჩვენებები მონიშნულია. კვლევების შედეგები და კონკრეტული ფორმულის შეზღუდვები პროდუქტის გვერდზეა განმარტებული.",
          )}
        </p>
        <div className="product-grid">
          {shown.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </div>
        {!shown.length && (
          <div className="empty">
            <h2>{t("პრეპარატი ვერ მოიძებნა.")}</h2>
            <p>{t("სცადეთ სხვა მოქმედი ნივთიერება ან გაასუფთავეთ ფილტრები.")}</p>
          </div>
        )}
        <p className="quiet-note">
          {t(
            "შეფუთვა საილუსტრაციოა. დაიცავით თქვენი დანიშნულება და ფარმაცევტის მითითებები. ხელმისაწვდომობა და ფორმულის დეტალები გადაამოწმეთ ფორტისთან.",
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
    ["დასახელება და შემადგენლობა", "nameComposition"],
    ["ფარმაკოლოგიური თვისებები და მოქმედების მექანიზმი", "pharmacology"],
    ["გამოყენების ჩვენებები", "indications"],
    ["დოზირება და მიღების წესი", "dosageAdministration"],
    ["გვერდითი მოვლენები", "sideEffects"],
    ["უკუჩვენებები", "contraindications"],
    ["განსაკუთრებული მითითებები", "warningsPrecautions"],
    ["შენახვის პირობები", "storageConditions"],
    ["მწარმოებელი", "manufacturer"],
  ];
  return (
    <>
      <div className="wrap breadcrumb">
        <A href="/products">{t("პროდუქტები")}</A>
        <span>/</span>
        <span>
          {t(p.name)} · {t(p.strength)}
        </span>
      </div>
      <section className="wrap product-detail">
        <div className="detail-visual">
          <img
            src={p.image}
            alt={`${t(p.name)} ${t(p.strength)}, ${p.pack} ${t(p.packUnit)} - ${t("მოწოდებული შეფუთვის ილუსტრაცია")}`}
            width={p.imageWidth}
            height={p.imageHeight}
          />
          <p>
            {t(
              "შეფუთვა საილუსტრაციოა. დაიცავით თქვენი დანიშნულება და ფარმაცევტის მითითებები.",
            )}
          </p>
        </div>
        <div className="detail-copy">
          <Eyebrow>{t(p.category)}</Eyebrow>
          <h1>{t(p.name)}</h1>
          <div className="detail-strength">{t(p.strength)}</div>
          <div className="specs">
            <div>
              <small>{t("შეფუთვა")}</small>
              <strong>
                {p.pack} {t(p.packUnit)}
              </strong>
            </div>
            <div>
              <small>{t("პრეპარატის ფორმა")}</small>
              <strong>{t(p.preparation)}</strong>
            </div>
          </div>
          <span className="tag">{t(p.tag)}</span>
          <div className="product-narrative">
            {information.map(([label, key], index) => {
              const Heading = index === 0 ? "h2" : "h3";
              const value = p[key]?.trim();
              return (
                <section
                  className={`medicine-section ${key === "indications" ? "clinical-note" : ""}`}
                  key={key}
                >
                  <Heading>{t(label)}</Heading>
                  <p>{value || t("მითითებული არ არის")}</p>
                </section>
              );
            })}
          </div>
          <Button href="/contact">{t("იკითხეთ ამ პრეპარატის შესახებ")}</Button>
          <p className="detail-small">
            {t(
              "პრეპარატის შერჩევა, მიღების წესი, დამხმარე ნივთიერებები, გამოთავისუფლების მახასიათებლები და მომზადების შემდეგ გამოყენების საბოლოო ვადა უნდა დააზუსტოთ მკურნალ ექიმთან და გამცემ ფარმაცევტთან.",
            )}
          </p>
        </div>
      </section>
      <section className="wrap references">
        <div>
          <Eyebrow>{t("გაეცანით მტკიცებულებებს")}</Eyebrow>
          <h2>{t("წყაროები და კონტექსტი.")}</h2>
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
              "წყაროები აღწერს მოქმედ ნივთიერებებს ან რეფერენსულ მედიკამენტებს და არ ნიშნავს ფორტისის მიერ მომზადებული პრეპარატების FDA-ს ან EMA-ს მიერ დამტკიცებას. საარქივო ინსტრუქციები შესაძლოა უახლეს ინფორმაციას არ ასახავდეს. ეს მიმოხილვა არ წარმოადგენს უსაფრთხოების სრულ სახელმძღვანელოს ან დანიშნულების რეკომენდაციას.",
            )}
          </p>
          <A href="/editorial" className="text-link">
            {t("როგორ წარმოვადგენთ პროდუქტის ინფორმაციას ")}
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
    "რა არის კომპოზიტური ფარმაცია?",
    "კომპოზიტური ფარმაცია განსაზღვრული ფორმულით მედიკამენტის მომზადებას გულისხმობს. მაგისტრალური პრეპარატი ინდივიდუალური დანიშნულების მიხედვით მზადდება, ხოლო ოფიცინალური პრეპარატი აღიარებულ ფარმაკოპეულ ფორმულას ეყრდნობა, მოქმედი ადგილობრივი მოთხოვნების შესაბამისად.",
  ],
  [
    "როდის შეიძლება განიხილებოდეს ინდივიდუალური მომზადება?",
    "ექიმმა შეიძლება გამოავლინოს კონკრეტული დოზის, წამლის ფორმის ან დამხმარე ნივთიერების აუტანლობასთან დაკავშირებული საჭიროება. ფარმაცევტი აფასებს, რისი მომზადებაა მიზანშეწონილი. ინდივიდუალური მომზადება ავტომატურად არ ნიშნავს, რომ მედიკამენტი უფრო უსაფრთხო ან ეფექტურია.",
  ],
  [
    "როგორ განვიხილო პრეპარატის მომზადება?",
    "პრაქტიკული მოთხოვნების განსახილველად დაუკავშირდით აფთიაქს. მიზანშეწონილობას, ფორმულასა და მიღების წესს ექიმი და ფარმაცევტი განსაზღვრავენ. ამ ვებგვერდის საფუძველზე არ დაიწყოთ და არ შეცვალოთ მედიკამენტის მიღება.",
  ],
  [
    "შესაძლებელია ვებგვერდიდან შეკვეთა?",
    "ეს ვებგვერდი საინფორმაციო კატალოგია. ხელმისაწვდომობის, დანიშნულებისა და მომზადების მოთხოვნების დასაზუსტებლად დაუკავშირდით ფორტისს. ვებგვერდიდან ონლაინ შეძენა არ ხდება.",
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
        eyebrow={t("კომპოზიტური ფარმაციის ხელოვნება და მეცნიერება")}
        title={
          <>
            {t("მომზადებული საჭიროებისთვის.")}
            <br />
            <em>{t("პაციენტზე ორიენტირებული.")}</em>
          </>
        }
        description={t(
          "გააზრებული მიდგომა, როდესაც პაციენტის ფარმაცევტული საჭიროებები ინდივიდუალურად მომზადებულ პრეპარატს მოითხოვს.",
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
          <h2>{t("ყველაფერი დანიშნულებით იწყება.")}</h2>
          <p>
            {t(
              "პაციენტების საჭიროებები შეიძლება განსხვავდებოდეს დოზის, ფორმულის, დამხმარე ნივთიერებების ამტანობისა თუ თანმხლები მდგომარეობების მიხედვით. კომპოზიტური ფარმაცია ამ საჭიროებების განხილვაში ექიმსა და ფარმაცევტს აერთიანებს.",
            )}
          </p>
          <p>
            {t(
              "კომპანიის ინფორმაციით, ფორტისი აქტიურ ფარმაცევტულ ინგრედიენტებს აშშ-დან და ევროპიდან იღებს და მედიკამენტებს თბილისში ამზადებს. თითოეული მოთხოვნა პრეპარატის მიზანშეწონილობისა და მომზადების შესაძლებლობის პროფესიულ შეფასებას საჭიროებს.",
            )}
          </p>
          <div className="steps">
            {[
              [
                "01",
                "საჭიროების გააზრება",
                "დანიშნულებისა და ინდივიდუალური ფორმულის მოთხოვნების განხილვა.",
              ],
              [
                "02",
                "მომზადების შეფასება",
                "ინგრედიენტების, ფორმულის, მოპყრობის წესებისა და პრაქტიკული შეზღუდვების შეფასება.",
              ],
              [
                "03",
                "მომზადება და შემოწმება",
                "მედიკამენტის მომზადება, დოკუმენტირება და გაცემამდე შემოწმება.",
              ],
              [
                "04",
                "გასაგები მითითებები",
                "მიღების კონკრეტული წესის, შენახვის პირობებისა და მომზადების შემდეგ გამოყენების საბოლოო ვადის დაზუსტება ფარმაცევტთან.",
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
          <h2>{t("პასუხები თქვენს კითხვებზე.")}</h2>
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
        eyebrow={t("ფორტისის შესახებ")}
        title={
          <>
            {t("შექმნილია თბილისში.")}
            <br />
            <em>{t("ინდივიდუალური ზრუნვისთვის.")}</em>
          </>
        }
        description={t(
          "კომპოზიტური აფთიაქი, რომელიც პაციენტის, ექიმისა და ფარმაცევტის თანამშრომლობას ეფუძნება.",
        )}
      />
      <section className="wrap editorial-layout">
        <aside>
          <Eyebrow>{t("ჩვენი მიზანი")}</Eyebrow>
          <h2>
            {t("ინდივიდუალური მიდგომა")}
            <br />
            {t("მედიკამენტის მომზადებასთან.")}
          </h2>
          <p className="georgian">
            ფორტის ფარმაცევტიკალს
            <br />
            კომპოზიტური ფარმაცია
          </p>
        </aside>
        <article>
          <h2>{t("ჩვენი ისტორია")}</h2>
          <p>
            {t(
              "ფორტისი პაციენტების საჭიროებების საპასუხოდ შეიქმნა. ჩვენი მიზანია მაგისტრალური და ოფიცინალური მედიკამენტების მომზადება ევროპული და ამერიკული კომპოზიტური აფთიაქების გამოცდილების გათვალისწინებით.",
            )}
          </p>
          <p>
            {t(
              "კომპანიის ხედვა ჯანდაცვის სპეციალისტებთან თანამშრომლობასაც მოიცავს, რათა ხელი შეუწყოს მკურნალობის უწყვეტობას როგორც სტაციონარში, ისე გაწერის შემდეგ.",
            )}
          </p>
          <blockquote lang="ka">
            მომხმარებლების ინტერესების გათვალისწინებით გადავწყვიტეთ გაგვეხსნა
            აფთიაქი, რომელიც ევროპული და ამერიკული ანალოგების მსგავსად შეძლებდა
            მედიკამენტების დამზადებას მაგისტრალური და ოფიცინალური რეცეპტის
            საფუძველზე.
          </blockquote>
          <h2 id="laboratory">{t("ლაბორატორიის შესახებ")}</h2>
          <p>
            {t(
              "ფორტისის ინფორმაციით, ლაბორატორია აღჭურვილია მცირე პარტიებით მომზადებისთვის. გათვალისწინებულია კლიმატის კონტროლი, სტერილიზაცია და ავტოკლავირება, ასევე ცალკე სტერილური და არასტერილური სამუშაო ზონები.",
            )}
          </p>
          <div className="quality-grid">
            {[
              [
                FlaskConical,
                "მომზადება",
                "მცირე პარტიებისთვის განკუთვნილი ფარმაცევტული აღჭურვილობა და განსაზღვრული მომზადების პროცესები.",
              ],
              [
                Microscope,
                "სამუშაო გარემო",
                "ყურადღება ჰიგიენის, მომზადების გარემოსა და მოპყრობის წესების მიმართ.",
              ],
              [
                ShieldCheck,
                "შემოწმება",
                "მომზადებისა და შენახვის ეტაპების შემოწმება, კომპანიის ინფორმაციით, აკრედიტებულ ლაბორატორიებში ტესტირებით.",
              ],
            ].map(([I, h, b]) => (
              <div key={h}>
                <Icon type={I} size={30} />
                <h3>{t(h)}</h3>
                <p>{t(b)}</p>
              </div>
            ))}
          </div>
          <h2>{t("პრაქტიკა და დოკუმენტაცია")}</h2>
          <p>
            {t("კომპანია უთითებს ნებართვას ")}
            <strong>{t("სფსრს N00036")}</strong>
            {t(
              " ოფიცინალური და მაგისტრალური რეცეპტებით მედიკამენტების მომზადებისა და რეალიზაციისთვის.",
            )}
          </p>
          <p>
            <strong>
              {t(
                "დაწყებულია კარგი სააფთიაქო პრაქტიკის (GPP) სერტიფიცირების პროცესი.",
              )}
            </strong>{" "}
            {t("ამ ვებგვერდზე ფორტისი არ არის წარმოდგენილი როგორც GPP-სერტიფიცირებული აფთიაქი.")}
          </p>
          <p className="quiet-note">
            {t(
              "კომპანიისა და ლაბორატორიის აღწერა ფორტისის მიერ მოწოდებულ ინფორმაციას ეფუძნება. იგი არ წარმოადგენს დამოუკიდებელ აუდიტს ან სერტიფიცირების დადასტურებას.",
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
        eyebrow={t("დაუკავშირდით ფორტისს")}
        title={
          <>
            {t("დავიწყოთ საუბრით.")}
            <br />
            <em>{t("ვიპოვოთ ინდივიდუალური მიდგომა.")}</em>
          </>
        }
        description={t(
          "მომზადების, პროდუქტის ხელმისაწვდომობისა და პროფესიული თანამშრომლობის საკითხებზე დაუკავშირდით აფთიაქს.",
        )}
      />
      <section className="wrap contact-layout">
        <div>
          <A className="contact-option" href="tel:+995322053191">
            <Icon type={Phone} size={30} />
            <div>
              <small>{t("დარეკეთ აფთიაქში")}</small>
              <h2>+995 32 205 31 91</h2>
              <span>
                {t("ესაუბრეთ ჩვენს გუნდს ")}
                <Icon type={ArrowUpRight} />
              </span>
            </div>
          </A>
          <div className="contact-option">
            <Icon type={MapPin} size={30} />
            <div>
              <small>{t("გვეწვიეთ ფორტისში")}</small>
              <h2>{t("გივი ჟვანიას ქუჩა 9")}</h2>
              <p>{t("თბილისი, საქართველო")}</p>
              <A
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=9+Givi+Zhvania+Street+Tbilisi"
                target="_blank"
                rel="noreferrer"
              >
                {t("მარშრუტის ნახვა ")}
                <Icon type={ArrowUpRight} />
              </A>
            </div>
          </div>
          <p className="quiet-note">
            {t(
              "ვიზიტამდე დარეკეთ სამუშაო საათებისა და ხელმისაწვდომობის დასაზუსტებლად.",
            )}
          </p>
        </div>
        <div className="contact-panel">
          <Eyebrow>{t("პაციენტებისა და პროფესიონალებისთვის")}</Eyebrow>
          <h2>
            {t("ერთად განვიხილოთ")}
            <br />
            {t("თქვენი საჭიროებები.")}
          </h2>
          <p>
            {t(
              "ჩვენი გუნდი აგიხსნით მომზადების მოთხოვნებს და დაგეხმარებათ, განსაზღვროთ, რა საკითხები უნდა განიხილოთ თქვენს ექიმთან.",
            )}
          </p>
          <ul>
            <li>{t("კითხვები ინდივიდუალური ფორმულის შესახებ")}</li>
            <li>{t("კითხვები აქტიურ და დამხმარე ნივთიერებებზე")}</li>
            <li>{t("პროდუქტებისა და დოზების ხელმისაწვდომობა")}</li>
            <li>{t("პროფესიული თანამშრომლობა")}</li>
          </ul>
          <div className="contact-resource">
            <Icon type={BookOpen} />
            <A
              href="https://fortislibrary.com"
              target="_blank"
              rel="noreferrer"
            >
              {t("ფორტის ბიბლიოთეკის ნახვა ")}
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
        eyebrow={t("ინფორმაცია და წყაროები")}
        title={t("გასაგები კონტექსტი. მკაფიო ფარგლები.")}
      />
      <article className="wrap text-page">
        <h2>{t("სამედიცინო წყაროების შერჩევის პრინციპი")}</h2>
        <p>
          {t(
            "მოქმედი ნივთიერებების შესახებ ინფორმაცია ოთხ შერჩეულ ორგანიზაციასა და გამოცემას ეყრდნობა: FDA, EMA, JAMA Dermatology და Pain Reports. ორიგინალი სტატიები შესაძლოა ხელმისაწვდომი იყოს PubMed Central-ის მეშვეობითაც. წყაროების ბმულები თითოეული პროდუქტის გვერდზეა მითითებული.",
          )}
        </p>
        <h2>{t("მოქმედი ნივთიერება და მომზადებული პრეპარატი განსხვავდება")}</h2>
        <p>
          {t(
            "რეფერენსული მედიკამენტის დამტკიცება ან კვლევის შედეგი არ ადასტურებს ფორტისის კონკრეტული პრეპარატის დამტკიცებას, ეკვივალენტობას, ბიოშეღწევადობას, უსაფრთხოებას ან ეფექტურობას. მნიშვნელოვანია დოზა, დამხმარე ნივთიერებები, გამოთავისუფლების პროფილი და მომზადების მეთოდი. პროდუქტის კატეგორიები ძიების გასამარტივებლად გამოიყენება.",
          )}
        </p>
        <h2>{t("შეფუთვა და დანიშნულება")}</h2>
        <p>
          {t(
            "პროდუქტის სურათები ფორტისის მიერ მოწოდებული ორიგინალი ილუსტრაციებია და არა გაცემისას გასაყოლებელი ინსტრუქციები. იხელმძღვანელეთ მხოლოდ თქვენი დანიშნულებისთვის ექიმისა და ფარმაცევტის მიერ გაცემული მითითებებით. საილუსტრაციო შეფუთვაზე მოცემული ტექსტით არ განსაზღვროთ მკურნალობა, შენახვის პირობები ან გამოყენების საბოლოო ვადა.",
          )}
        </p>
        <h2>{t("ინფორმაციის განახლება")}</h2>
        <p>
          {t(
            "წყაროების ბმულები შემოწმებულია 2026 წლის 10 სექტემბერს. ეს მოკლე საგანმანათლებლო მიმოხილვაა და არა დანიშნულებისთვის საჭირო სრული ინფორმაცია. FDA-ს საარქივო დოკუმენტებს მითითებული აქვს წელი; ისინი შესაძლოა უახლესი დამტკიცებული ინსტრუქციები არ იყოს. ინფორმაციის განახლებისას კლინიკური ტექსტი აფთიაქის პროფესიულ გადამოწმებას საჭიროებს.",
          )}
        </p>
        <h2>{t("ინფორმაცია კომპანიის შესახებ")}</h2>
        <p>
          {t(
            "კომპანიის ისტორია, ნებართვის დეტალები და ლაბორატორიის აღწერა მოწოდებულია ფორტისის მიერ. ისინი წარმოდგენილია როგორც კომპანიის ინფორმაცია და არა დამოუკიდებლად გადამოწმებული მარეგულირებელი დასკვნები.",
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
        eyebrow={t("კონფიდენციალურობა")}
        title={t("მარტივი საინფორმაციო ვებგვერდი.")}
      />
      <article className="wrap text-page">
        <p>
          {t(
            "ვებგვერდს არ აქვს ონლაინ გადახდა, პაციენტის რეგისტრაცია ან პაციენტის მონაცემების ფორმა. იგი არ გთხოვთ რეცეპტების ან სამედიცინო ჩანაწერების ატვირთვას.",
          )}
        </p>
        <p>
          {t(
            "ვებგვერდს არ აქვს დამატებული სარეკლამო თვალთვალის ან ანალიტიკის სკრიპტები. ჰოსტინგის მომწოდებლებმა საიტის მუშაობისა და უსაფრთხოებისთვის შეიძლება დაამუშაონ წვდომის ტექნიკური ჩანაწერები. გარე ბმულებს, მათ შორის რუკებსა და სამეცნიერო გამოცემებს, საკუთარი კონფიდენციალურობის პოლიტიკა აქვს.",
          )}
        </p>
        <p>
          {t(
            "ფერის რეჟიმის არჩევანი მხოლოდ ამ ბრაუზერში ინახება, რათა დაბრუნებისას იგივე პარამეტრი დაგხვდეთ. ამ პარამეტრებში ჯანმრთელობის შესახებ ინფორმაცია არ ინახება.",
          )}
        </p>
        <p>
          {t("აფთიაქთან დასაკავშირებლად დარეკეთ:")}{" "}
          <A href="tel:+995322053191">+995 32 205 31 91</A>
          {t(
            ". ჯანმრთელობასთან დაკავშირებული კონფიდენციალური ინფორმაცია განიხილეთ აფთიაქთან შეთანხმებული შესაბამისი არხით.",
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
  let title = "მედიკამენტების ინდივიდუალური მომზადება თბილისში";
  if (path === "/") page = <Home />;
  else if (path === "/products") {
    page = <Catalog />;
    title = "პროდუქტების კატალოგი";
  } else if (path === "/compounding") {
    page = <Compounding />;
    title = "კომპოზიტური ფარმაცია";
  } else if (path === "/about") {
    page = <About />;
    title = "ჩვენი ისტორია და ლაბორატორია";
  } else if (path === "/contact") {
    page = <Contact />;
    title = "კონტაქტი";
  } else if (path === "/editorial") {
    page = <Editorial />;
    title = "ინფორმაცია და წყაროები";
  } else if (path === "/privacy") {
    page = <Privacy />;
    title = "კონფიდენციალურობა";
  } else {
    const p = products.find((p) => path === `/products/${p.slug}`);
    if (p) {
      page = <Product p={p} />;
      title = `${t(p.name)} ${t(p.strength)}`;
    } else {
      page = (
        <div className="wrap not-found">
          <h1>{t("გვერდი ვერ მოიძებნა.")}</h1>
          <Button href="/products">{t("პროდუქტების ნახვა")}</Button>
        </div>
      );
      title = "გვერდი ვერ მოიძებნა";
    }
  }
  useEffect(() => {
    document.title = `${t(title)} | ${t("ფორტის ფარმაცევტიკალს")}`;
  }, [title, t]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("შინაარსზე გადასვლა")}
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
