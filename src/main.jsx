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
import { EquipmentArtwork } from "./equipment-art";
import { ThemeArtwork } from "./theme-art";
import { facets, emptyFilters, filterProducts } from "./catalog-model";
import { pageCopy as copy } from "./page-copy";
import { Partners } from "./partners";
const nav = [
  ["/", "მთავარი"],
  ["/compounding", "ქომფაუნდინგი"],
  ["/about", "ჩვენ შესახებ"],
  ["/products", "პროდუქტები"],
  ["/partners", "პარტნიორები"],
  ["/contact", "კონტაქტი"],
];
const A = ({ children, ...props }) => <a {...props}>{children}</a>;
const Icon = ({ type: Type, ...p }) => (
  <Type size={20} strokeWidth={1.5} aria-hidden="true" {...p} />
);
function Brand() {
  const { t } = usePreferences();
  return (
    <A href="/" className="brand" aria-label={t("ფორტის ფარმაცეუტიკალსის მთავარი გვერდი")}>
      <BrandArtwork className="brand-logo" />
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
        <PharmacyCall />
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
function PharmacyCall() {
  const dialog = useRef(null);
  const closeTimer = useRef(null);
  const previousOverflow = useRef(null);
  const restoreScroll = () => {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  };
  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    restoreScroll();
  }, []);
  const open = () => {
    clearTimeout(closeTimer.current);
    dialog.current.classList.remove("is-closing");
    previousOverflow.current = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    if (dialog.current.classList.contains("is-closing")) return;
    const finish = () => {
      dialog.current.close();
      dialog.current.classList.remove("is-closing");
      restoreScroll();
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else {
      dialog.current.classList.add("is-closing");
      closeTimer.current = setTimeout(finish, 180);
    }
  };
  const keepFocusInside = (event) => {
    if (event.key !== "Tab") return;
    const first = dialog.current.querySelector("button");
    const last = dialog.current.querySelector("a");
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return (
    <>
      <button type="button" className="contact-nav pharmacy-call-trigger" aria-label="დარეკეთ აფთიაქში" aria-haspopup="dialog" aria-controls="pharmacy-call" onClick={open}>
        <span>დარეკეთ აფთიაქში</span><Icon type={Phone} />
      </button>
      <dialog ref={dialog} id="pharmacy-call" className="pharmacy-call" aria-labelledby="pharmacy-call-title" aria-describedby="pharmacy-call-description" onKeyDown={keepFocusInside} onCancel={(event) => { event.preventDefault(); close(); }} onClose={restoreScroll} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="pharmacy-call-layout">
          <button type="button" className="pharmacy-call-close" aria-label="ფანჯრის დახურვა" onClick={close} autoFocus><Icon type={X} /></button>
          <div className="pharmacy-call-aside">
            <span className="pharmacy-call-icon"><Icon type={Phone} size={24} /></span>
            <h2 id="pharmacy-call-title">დავიწყოთ საუბრით.</h2>
          </div>
          <div className="pharmacy-call-main">
            <p id="pharmacy-call-description">ჩვენი გუნდი თქვენს კითხვებს უპასუხებს.</p>
            <div className="pharmacy-call-number">032 2 05 31 91</div>
            <p className="pharmacy-call-hours">ყოველდღე · 10:00–20:00</p>
            <div className="pharmacy-call-location"><Icon type={MapPin} /><span>გივი ჟვანიას ქუჩა 9<br />თბილისი, საქართველო</span></div>
            <a className="pharmacy-call-action" href="tel:+995322053191" aria-label="დარეკვა: 032 2 05 31 91">დარეკვა <Icon type={ArrowUpRight} /></a>
          </div>
        </div>
      </dialog>
    </>
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
            {t("ქომფაუნდინგის აფთიაქი.")}
          </p>
        </div>
        <div>
          <small>{t("გაიგეთ მეტი")}</small>
          {nav.filter(([h]) => h !== "/" && h !== "/contact").map(([h, n]) => (
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
          <A href="tel:+995322053191">032 2 05 31 91</A>
        </div>
        <div>
          <small>{t("პროფესიონალებისთვის")}</small>
          <A href="https://fortislibrary.com" target="_blank" rel="noreferrer">
            {t("ფორტის ფარმაცეუტიკალსის ბიბლიოთეკა ")}
            <Icon type={ArrowUpRight} />
          </A>
          <A href="/editorial">{t("ინფორმაცია და წყაროები")}</A>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>
          © {new Date().getFullYear()}
          {t(" ფორტის ფარმაცეუტიკალსი")}
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
    <section className="simple-hero equipment-hero">
      <div className="wrap simple-hero-grid">
        <div className="hero-copy">
          <Eyebrow>{t("ქომფაუნდ აფთიაქი")}</Eyebrow>
          <h1>
            {t("თქვენთვის")}
            <br />
            {t("მომზადებული.")}
          </h1>
          <p>
            {t(
              "ინდივიდუალურად მომზადებული მედიკამენტები თბილისში, ექიმის დანიშნულებით.",
            )}
          </p>
          <div className="hero-actions">
            <Button href="/products">{t("გაეცანით პრეპარატებს")}</Button>
            <A href="/compounding" className="text-link">
              {t("ჩვენი მიდგომა ")}
              <Icon type={ArrowRight} />
            </A>
          </div>
        </div>
        <div className="hero-artwork">
          <EquipmentArtwork />
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
        {t("ინდივიდუალური საჭიროება.")}
        <br />
        {t("პერსონალური მიდგომა.")}
      </h2>
      <div className="approach-content">
        <div>
          <p className="lead">
            {t(
              "პაციენტს შესაძლოა განსხვავებული დოზა, წამლის ფორმა ან შემადგენლობა სჭირდებოდეს. პერსონალური ფარმაცია ამ საჭიროებებს ითვალისწინებს.",
            )}
          </p>
          <p>
            {t(
              "ფორტის ფარმაცეუტიკალსში თითოეულ ფორმულას ექიმის დანიშნულებისა და ფარმაცევტის შეფასების საფუძველზე ვამზადებთ.",
            )}
          </p>
          <A href="/compounding" className="text-link">
            {t("პერსონალური ფარმაციის შესახებ ")}
            <Icon type={ArrowUpRight} />
          </A>
        </div>
        <div className="approach-items">
          {[
            [
              SlidersHorizontal,
              "ინდივიდუალური დოზა",
              "მომზადება ექიმის მიერ განსაზღვრული დოზით.",
            ],
            [
              FlaskConical,
              "შესაფერისი წამლის ფორმა",
              "ფორმის შერჩევა მიღების თავისებურებების გათვალისწინებით.",
            ],
            [
              ShieldCheck,
              "შერჩეული შემადგენლობა",
              "ინგრედიენტების შეფასება პაციენტის საჭიროებების მიხედვით.",
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
            "ფარმაცევტი განიხილავს დანიშნულებას, განსაზღვრავს ფორმულას და აზუსტებს მომზადების დეტალებს.",
          )}
        </p>
      </div>
      <dl className="preparation-guide-topics">
        <div>
          <dt>{t("დანიშნულება და ფორმულა")}</dt>
          <dd>
            {t(
              "ექიმი და ფარმაცევტი განსაზღვრავენ მოქმედ ნივთიერებას, დოზას, წამლის ფორმასა და საჭირო რაოდენობას.",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("მომზადება და შემოწმება")}</dt>
          <dd>
            {t(
              "მედიკამენტი მზადდება ლაბორატორიაში. გაცემამდე მოწმდება დანიშნულებასთან შესაბამისობა, შეფუთვა და ეტიკეტი.",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("გაცემისა და გამოყენების შესახებ")}</dt>
          <dd>
            {t(
              "ფარმაცევტი განმარტავს მიღების წესს, შენახვის პირობებსა და გამოყენების ვადას.",
            )}
          </dd>
        </div>
      </dl>
      <A href="/compounding" className="text-link">
        {t("მომზადების ეტაპები")}
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
        {t("მზადდება თბილისში.")}
        <br />
        {t("თქვენი საჭიროებისთვის.")}
      </h2>
      <div className="company-overview-body">
        <p>
          {t(
            "ფორტის ფარმაცეუტიკალსი პაციენტებისა და ექიმების საჭიროებების საპასუხოდ შეიქმნა. ჩვენი მიმართულებაა პერსონალური ფარმაცია.",
          )}
        </p>
        <div>
          <h3>{t("ჩვენი ლაბორატორია")}</h3>
          <p>
            {t(
              "მედიკამენტებს ადგილზე ვამზადებთ. აქტიური ფარმაცევტული ნივთიერებები შემოგვაქვს ევროპიდან და ამერიკიდან.",
            )}
          </p>
          <A href="/about" className="text-link">
            {t("გაიგეთ მეტი ჩვენ შესახებ ")}
            <Icon type={ArrowUpRight} />
          </A>
        </div>
      </div>
      <BrandArtwork
        className="company-brand"
        label="ფორტის ფარმაცეუტიკალსი / ქომფაუნდინგის აფთიაქი"
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
        <Button href="/contact">{t("დაგვიკავშირდით")}</Button>
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
                {(f.groups || [{ label: "", options: f.options }]).map((group) => (
                  <div className="facet-option-group" key={group.label}>
                    {group.label && <h4>{t(group.label)}</h4>}
                    {group.options.map((value) => (
                      <label key={value}>
                        <input
                          type="checkbox"
                          checked={selected[f.key].includes(value)}
                          onChange={() => toggle(f.key, value)}
                        />
                        <span>{t(value)}</span>
                      </label>
                    ))}
                  </div>
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
const questions = copy.compounding.questions;
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
        eyebrow={t("ქომფაუნდინგის აფთიაქი")}
        title={
          <>
            {t("თქვენი საჭიროებით.")}
            <br />
            <em>{t("ექიმის დანიშნულებით.")}</em>
          </>
        }
        description={t(
          "პერსონალური ფარმაცია: ინდივიდუალურად მომზადებული მედიკამენტები შესაბამისი დოზით, ფორმითა და შემადგენლობით.",
        )}
      />
      <div className="wrap editorial-layout">
        <aside>
          <span className="georgian">მაგისტრალური რეცეპტი</span>
          <div className="aside-icon">
            <Icon type={FlaskConical} size={84} />
          </div>
        </aside>
        <article>
          <h2>{t("დანიშნულებიდან მედიკამენტამდე.")}</h2>
          <p>
            {t(
              "როდესაც მზა პრეპარატი საჭირო დოზით ან ფორმით ხელმისაწვდომი არ არის, ექიმი და ფარმაცევტი ინდივიდუალური მომზადების შესაძლებლობას განიხილავენ.",
            )}
          </p>
          <p>
            {t(
              "ფორტის ფარმაცეუტიკალსში მედიკამენტები ადგილზე მზადდება, ევროპიდან და ამერიკიდან მიღებული აქტიური ნივთიერებებით.",
            )}
          </p>
          <div className="steps">
            {[
              [
                "01",
                "დანიშნულების განხილვა",
                "ფარმაცევტი ეცნობა დანიშნულებას და პაციენტის საჭიროებებს. დეტალები საჭიროებისამებრ ზუსტდება ექიმთან.",
              ],
              [
                "02",
                "ფორმულის განსაზღვრა",
                "განისაზღვრება შემადგენლობა, მომზადების მეთოდი, შენახვის პირობები და მომზადების დრო.",
              ],
              [
                "03",
                "მომზადება ლაბორატორიაში",
                "ინგრედიენტები ზუსტად იზომება და მუშავდება განსაზღვრული ფორმულისა და ტექნოლოგიური პროცესის მიხედვით.",
              ],
              [
                "04",
                "შემოწმება და შეფუთვა",
                "მოწმდება დანიშნულებასთან შესაბამისობა, რაოდენობა, შეფუთვა და ეტიკეტის ინფორმაცია.",
              ],
              [
                "05",
                "გაცემისა და გამოყენების შესახებ",
                "ფარმაცევტი განმარტავს მიღების წესს, შენახვის პირობებსა და გამოყენების ვადას.",
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
          <h2>{t("ხშირად დასმული კითხვები.")}</h2>
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
        eyebrow={t("ჩვენ შესახებ")}
        title={
          <>
            {t("შექმნილია თბილისში.")}
            <br />
            <em>{t("თქვენი საჭიროებისთვის.")}</em>
          </>
        }
        description={t(
          "ფორტის ფარმაცეუტიკალსი: ქომფაუნდინგის აფთიაქი, რომელიც პაციენტის, ექიმისა და ფარმაცევტის თანამშრომლობას ეფუძნება.",
        )}
      />
      <section className="wrap editorial-layout">
        <aside>
          <Eyebrow>{t("ჩვენი მიზანი")}</Eyebrow>
          <h2>
            {t("ინდივიდუალურად")}
            <br />
            {t("მომზადებული მედიკამენტები.")}
          </h2>
          <p className="georgian">
            {t("ფორტის ფარმაცეუტიკალსი")}
            <br />
            {t("ქომფაუნდინგის აფთიაქი")}
          </p>
        </aside>
        <article>
          <h2>{t("ჩვენი შექმნის იდეა")}</h2>
          <p>
            {t(
              "ფორტის ფარმაცეუტიკალსი პაციენტებისა და ექიმების საჭიროებების საპასუხოდ შეიქმნა. მედიკამენტებს ვამზადებთ მაგისტრალური და ოფიცინალური რეცეპტებით, ევროპული და ამერიკული ქომფაუნდინგის გამოცდილების გათვალისწინებით.",
            )}
          </p>
          <p>
            {t(
              "ჩვენი მიზანია, დავეხმაროთ პაციენტს, რომელსაც განსხვავებული დოზა, წამლის ფორმა ან შემადგენლობა სჭირდება. მომზადების შესაძლებლობას ექიმსა და ფარმაცევტთან ერთად განვიხილავთ.",
            )}
          </p>
          <blockquote lang="ka">{t("პერსონალური ფარმაცია. ინდივიდუალურად მომზადებული მედიკამენტები თქვენი საჭიროებისთვის.")}</blockquote>
          <h2 id="laboratory">{t("ჩვენი ლაბორატორია")}</h2>
          <p>
            {t(
              "მედიკამენტები ადგილზე მზადდება. სამუშაო გარემო, აღჭურვილობა და მომზადების მეთოდი შეირჩევა კონკრეტული ფორმულისა და წამლის ფორმის შესაბამისად.",
            )}
          </p>
          <div className="quality-grid">
            {[
              [
                FlaskConical,
                "მომზადება",
                "ინგრედიენტების ზუსტი გაზომვა და განსაზღვრული ფორმულით მომზადება.",
              ],
              [
                Microscope,
                "სამუშაო გარემო",
                "ჰიგიენისა და შესაბამისი სამუშაო პირობების დაცვა.",
              ],
              [
                ShieldCheck,
                "შემოწმება",
                "დანიშნულებასთან შესაბამისობის, შეფუთვისა და ეტიკეტის გადამოწმება.",
              ],
            ].map(([I, h, b]) => (
              <div key={h}>
                <Icon type={I} size={30} />
                <h3>{t(h)}</h3>
                <p>{t(b)}</p>
              </div>
            ))}
          </div>
          <p>{t("ინდივიდუალური ფორმულა განიხილება ექიმის დანიშნულებასთან ერთად. მომზადების პროცესი და გაცემისთვის საჭირო ინფორმაცია დოკუმენტირდება.")}</p>
          <p className="quiet-note">
            {t(
              "შენახვის პირობები და გამოყენების ვადა განისაზღვრება კონკრეტული ფორმულისთვის.",
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
        eyebrow={t("დაგვიკავშირდით")}
        title={
          <>
            {t("დავიწყოთ საუბრით.")}
            <br />
            <em>{t("განვიხილოთ თქვენი საჭიროება.")}</em>
          </>
        }
        description={t(
          "მომზადების, ხელმისაწვდომობისა და პროფესიული თანამშრომლობის შესახებ ინფორმაციისთვის დაუკავშირდით ჩვენს გუნდს.",
        )}
      />
      <section className="wrap contact-layout">
        <div>
          <A className="contact-option" href="tel:+995322053191">
            <Icon type={Phone} size={30} />
            <div>
              <small>{t("დარეკეთ აფთიაქში")}</small>
              <h2>032 2 05 31 91</h2>
              <span>
                {t("ესაუბრეთ ჩვენს გუნდს ")}
                <Icon type={ArrowUpRight} />
              </span>
            </div>
          </A>
          <div className="contact-option">
            <Icon type={MapPin} size={30} />
            <div>
              <small>{t("გვეწვიეთ აფთიაქში")}</small>
              <h2>{t("გივი ჟვანიას ქუჩა 9")}</h2>
              <p>{t("თბილისი, საქართველო. ყოფილი ლუბლიანას ქუჩა №31.")}</p>
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
              "სამუშაო საათები: ყოველდღე, 10:00–20:00, შაბათ-კვირის ჩათვლით.",
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
              "ფარმაცევტი განიხილავს თქვენს დანიშნულებას და აგიხსნით მომზადების შესაძლებლობასა და შემდეგ ნაბიჯებს.",
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
              {t("ფორტის ფარმაცეუტიკალსის ბიბლიოთეკა ")}
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
        title={t("ინფორმაცია და მისი გამოყენება.")}
      />
      <article className="wrap text-page">
        <h2>{t("სამედიცინო წყაროები")}</h2>
        <p>
          {t(
            "მოქმედი ნივთიერებების შესახებ ინფორმაციისთვის ვიყენებთ FDA-ს, EMA-ს, JAMA Dermatology-სა და Pain Reports-ის მასალებს. სადაც წყარო მითითებულია, ბმულზე გაეცნობით ორიგინალ დოკუმენტს ან კვლევას.",
          )}
        </p>
        <h2>{t("ინდივიდუალური ფორმულის მნიშვნელობა")}</h2>
        <p>
          {t(
            "კვლევის შედეგი ან სხვა პრეპარატის დამტკიცება ავტომატურად არ ადასტურებს ინდივიდუალურად მომზადებული ფორმულის იმავე ეფექტურობას, უსაფრთხოებას, დამტკიცებას ან ურთიერთჩანაცვლებადობას. მნიშვნელობა აქვს დოზას, ფორმას, შემადგენლობასა და მომზადების მეთოდს.",
          )}
        </p>
        <h2>{t("შეფუთვის გამოსახულებები")}</h2>
        <p>
          {t(
            "შეფუთვის გამოსახულებები საილუსტრაციოა. მიღების, შენახვისა და გამოყენების ვადის შესახებ იხელმძღვანელეთ თქვენთვის გაცემული ეტიკეტითა და ექიმის ან ფარმაცევტის მითითებებით.",
          )}
        </p>
        <h2>{t("ინფორმაციის განახლება")}</h2>
        <p>
          {t(
            "წყაროს გაცნობისას გაითვალისწინეთ თარიღი და ვერსია. საარქივო დოკუმენტი შესაძლოა უახლეს ინფორმაციას არ ასახავდეს. კლინიკური ტექსტის განახლება პროფესიულ გადამოწმებას საჭიროებს.",
          )}
        </p>
        <h2>{t("ინფორმაცია კომპანიის შესახებ")}</h2>
        <p>
          {t(
            "აფთიაქის ისტორიისა და ლაბორატორიის შესახებ მასალები წარმოდგენილია ფორტის ფარმაცეუტიკალსის მიერ. ეს აღწერა დამოუკიდებელ აუდიტს ან სერტიფიცირების დადასტურებას არ წარმოადგენს.",
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
        title={t("თქვენი მონაცემების შესახებ.")}
      />
      <article className="wrap text-page">
        <p>
          {t(
            "ვებსაიტი საინფორმაციოა. მას არ აქვს ონლაინ გადახდა, პაციენტის რეგისტრაცია, მონაცემების ფორმა ან სამედიცინო ჩანაწერების ატვირთვის ფუნქცია.",
          )}
        </p>
        <p>
          {t(
            "ვებსაიტზე არ არის სარეკლამო თვალთვალის ან ანალიტიკის სკრიპტები. ჰოსტინგის მომწოდებელმა მუშაობისა და უსაფრთხოებისთვის შეიძლება დაამუშაოს ტექნიკური ჩანაწერები. გარე რესურსებზე მოქმედებს მათი კონფიდენციალურობის პოლიტიკა.",
          )}
        </p>
        <p>
          {t(
            "არჩეული ფერის რეჟიმი მხოლოდ თქვენს ბრაუზერში ინახება. ეს პარამეტრი ჯანმრთელობის შესახებ ინფორმაციას არ შეიცავს.",
          )}
        </p>
        <p>
          {t("აფთიაქთან დასაკავშირებლად დარეკეთ:")}{" "}
          <A href="tel:+995322053191">032 2 05 31 91</A>
          {t(
            ". კონფიდენციალური ინფორმაციის გაზიარების გზა წინასწარ შეათანხმეთ ჩვენს გუნდთან.",
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
    title = "პერსონალური ფარმაცია";
  } else if (path === "/about") {
    page = <About />;
    title = "ჩვენი ისტორია და ლაბორატორია";
  } else if (path === "/contact") {
    page = <Contact />;
    title = "კონტაქტი";
  } else if (path === "/partners") {
    page = <Partners />;
    title = "პარტნიორები";
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
    document.title = `${t(title)} | ${t(copy.brand)}`;
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
