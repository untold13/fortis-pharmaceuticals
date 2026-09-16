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
import { pageCopy as copy } from "./page-copy";
import "./page-copy.css";
const nav = [
  ["/", "მთავარი"],
  ["/compounding", "პერსონალური ფარმაცია"],
  ["/about", "ჩვენ შესახებ"],
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
  const { t } = usePreferences();
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
      <button type="button" className="contact-nav pharmacy-call-trigger" aria-label="დაგვირეკეთ" aria-haspopup="dialog" aria-controls="pharmacy-call" onClick={open}>
        <span>დაგვირეკეთ</span><Icon type={Phone} />
      </button>
      <dialog ref={dialog} id="pharmacy-call" className="pharmacy-call" aria-labelledby="pharmacy-call-title" aria-describedby="pharmacy-call-description" onKeyDown={keepFocusInside} onCancel={(event) => { event.preventDefault(); close(); }} onClose={restoreScroll} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="pharmacy-call-layout">
          <button type="button" className="pharmacy-call-close" aria-label="ფანჯრის დახურვა" onClick={close} autoFocus><Icon type={X} /></button>
          <div className="pharmacy-call-aside">
            <span className="pharmacy-call-icon"><Icon type={Phone} size={24} /></span>
            <h2 id="pharmacy-call-title">{t("დამატებითი ინფორმაციისთვის დაგვიკავშირდით")}</h2>
          </div>
          <div className="pharmacy-call-main">
            <p id="pharmacy-call-description">{t(copy.contact.paragraphs[0])}</p>
            <div className="pharmacy-call-number">032 2 05 31 91</div>
            <p className="pharmacy-call-hours">ყოველდღე · 10:00–20:00</p>
            <div className="pharmacy-call-location"><Icon type={MapPin} /><span>გივი ჟვანიას ქუჩა 9<br />თბილისი, საქართველო</span></div>
            <a className="pharmacy-call-action" href="tel:+995322053191" aria-label="დარეკვა: 032 2 05 31 91">{t("დაგვირეკეთ")} <Icon type={ArrowUpRight} /></a>
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
    <footer className="approved-footer">
      <div className="footer-top wrap">
        <div>
          <Brand />
          <p>{t(copy.brand)}</p>
          <p>{t(copy.shared.footer)}</p>
          <p className="pharmacopoeia-note">{t(copy.pharmacopoeiaLabel)}</p>
        </div>
        <div>
          <small>{t("გაიგეთ მეტი")}</small>
          <A href="/compounding">{t("პერსონალური ფარმაცია")}</A>
          <A href="/about">{t("ჩვენ შესახებ")}</A>
          <A href="/editorial">{t("ინფორმაცია და წყაროები")}</A>
          <A href="/privacy">{t("კონფიდენციალურობა")}</A>
        </div>
        <div>
          <small>{t("კონტაქტი")}</small>
          <A href="/contact">{t(copy.contact.address)}</A>
          <p>{t("სამუშაო საათები")}<br />{t("ყოველდღე, 10:00–20:00")}</p>
          <A href="tel:+995322053191">032 2 05 31 91</A>
        </div>
        <div>
          <small>{t("პროფესიონალებისთვის")}</small>
          <A href="https://fortislibrary.com" target="_blank" rel="noreferrer">
            {t(copy.shared.library)}<Icon type={ArrowUpRight} />
          </A>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>© {new Date().getFullYear()} {t(copy.brand)}. {t("ყველა უფლება დაცულია.")}</span>
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
function CopyParagraphs({ paragraphs }) {
  const { t } = usePreferences();
  return paragraphs.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>);
}
function CopyBlocks({ blocks, heading: Heading = "h2" }) {
  const { t } = usePreferences();
  return blocks.map((block) => (
    <section className="copy-block" key={block.title}>
      <Heading>{t(block.title)}</Heading>
      <CopyParagraphs paragraphs={block.paragraphs} />
    </section>
  ));
}
function PharmacopoeiaNote() {
  const { t } = usePreferences();
  return <p className="pharmacopoeia-note">{t(copy.pharmacopoeiaNote)}</p>;
}
function Hero() {
  const { t } = usePreferences();
  return (
    <section className="simple-hero approved-hero">
      <div className="wrap simple-hero-grid">
        <div className="hero-copy">
          <Eyebrow>{t(copy.hero.eyebrow)}</Eyebrow>
          <h1>{t(copy.hero.title)}<span className="hero-subtitle">{t(copy.hero.subtitle)}</span></h1>
          <CopyParagraphs paragraphs={copy.hero.paragraphs} />
          <p className="pharmacopoeia-note">{t(copy.pharmacopoeiaLabel)}</p>
          <div className="hero-actions">
            <Button href="/products">{t(copy.hero.primary)}</Button>
            <A href="/compounding" className="text-link">{t(copy.hero.secondary)}<Icon type={ArrowRight} /></A>
          </div>
        </div>
        <div className="hero-artwork">
          <BottleArtwork label={t("ფორტის ფარმაცეუტიკალსის ქარვისფერი ფლაკონის გრაფიკული ესკიზი")} />
        </div>
      </div>
    </section>
  );
}
function Approach() {
  const { t } = usePreferences();
  return (
    <section className="section wrap approved-benefits" id="approach">
      <div className="approved-intro">
        <h2>{t(copy.benefits.title)}</h2>
        <CopyParagraphs paragraphs={copy.benefits.paragraphs} />
        <PharmacopoeiaNote />
      </div>
      <div className="approved-copy-grid"><CopyBlocks blocks={copy.benefits.blocks} heading="h3" /></div>
      <A href="/compounding" className="text-link">{t(copy.benefits.button)}<Icon type={ArrowUpRight} /></A>
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
    <section className="section wrap preparation-guide approved-process" id="preparation">
      <div className="approved-intro">
        <h2>{t(copy.process.title)}</h2>
        <CopyParagraphs paragraphs={copy.process.paragraphs} />
      </div>
      <ol className="approved-process-list">
        {copy.process.blocks.map((block, index) => (
          <li key={block.title}>
            <span className="process-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{t(block.title)}</h3><CopyParagraphs paragraphs={block.paragraphs} /></div>
          </li>
        ))}
      </ol>
      <A href="/contact" className="text-link">{t(copy.contactButton)}<Icon type={ArrowRight} /></A>
    </section>
  );
}
function LabTeaser() {
  const { t } = usePreferences();
  return (
    <section className="section wrap company-overview approved-company">
      <Eyebrow>{t("ჩვენ შესახებ")}</Eyebrow>
      <h2>{t(copy.about.title)}</h2>
      <div className="company-overview-body">
        <div><CopyParagraphs paragraphs={copy.about.paragraphs} /><PharmacopoeiaNote /></div>
        <div>
          <h3>{t("ლაბორატორია და ხარისხი")}</h3>
          <p>{t(copy.laboratory.paragraphs[0])}</p>
          <A href="/about#laboratory" className="text-link">{t(copy.about.button)}<Icon type={ArrowUpRight} /></A>
        </div>
      </div>
      <BrandArtwork className="company-brand" label={t("ფორტის ფარმაცეუტიკალსი / ქომფაუნდინგის აფთიაქი")} />
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
    <section className="contact-band approved-contact-band">
      <div className="wrap">
        <div><h2>{t(copy.shared.title)}</h2><p>{t(copy.shared.description)}</p></div>
        <Button href="/contact">{t(copy.contactButton)}</Button>
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
      <div className="approved-page-intro"><PageIntro eyebrow="პერსონალური ფარმაცია" title={t(copy.compounding.title)} /></div>
      <div className="wrap editorial-layout approved-editorial">
        <aside><Eyebrow>{t("პერსონალური ფარმაცია")}</Eyebrow><PharmacopoeiaNote /><Icon type={FlaskConical} size={64} /></aside>
        <article>
          <CopyParagraphs paragraphs={copy.compounding.paragraphs} />
          <h2>{t(copy.compounding.faqTitle)}</h2>
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
      <div className="approved-page-intro"><PageIntro eyebrow="ჩვენ შესახებ" title={t(copy.about.title)} /></div>
      <section className="wrap editorial-layout approved-editorial">
        <aside><Eyebrow>{t("პერსონალური ფარმაცია")}</Eyebrow><PharmacopoeiaNote /><BrandArtwork className="company-brand" /></aside>
        <article>
          <CopyParagraphs paragraphs={copy.about.paragraphs} />
          <CopyBlocks blocks={copy.about.blocks} />
          <A href="#laboratory" className="text-link">{t(copy.about.button)}<Icon type={ArrowRight} /></A>
        </article>
      </section>
      <section className="wrap editorial-layout approved-editorial approved-laboratory" id="laboratory">
        <aside><Eyebrow>{t("ლაბორატორია და ხარისხი")}</Eyebrow><Icon type={Microscope} size={64} /></aside>
        <article>
          <h2>{t(copy.laboratory.title)}</h2>
          <CopyParagraphs paragraphs={copy.laboratory.paragraphs} />
          <CopyBlocks blocks={copy.laboratory.blocks} heading="h3" />
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
      <div className="approved-page-intro"><PageIntro eyebrow="კონტაქტი" title={t(copy.contact.title)} description={copy.contact.paragraphs[0]} /></div>
      <section className="wrap contact-layout approved-contact">
        <div>
          <p>{t(copy.contact.paragraphs[1])}</p>
          <A className="contact-option" href="tel:+995322053191">
            <Icon type={Phone} size={30} />
            <div><small>{t("ტელეფონი")}</small><h2>032 2 05 31 91</h2><span>{t("დაგვირეკეთ")}<Icon type={ArrowUpRight} /></span></div>
          </A>
          <div className="contact-option">
            <Icon type={MapPin} size={30} />
            <div>
              <h2>{t("სად მდებარეობს აფთიაქი?")}</h2>
              <p>{t(copy.contact.address)}<br />{t(copy.contact.formerAddress)}</p>
              <A className="text-link" href="https://www.google.com/maps/search/?api=1&query=9+Givi+Zhvania+Street+Tbilisi" target="_blank" rel="noreferrer">{t("ნახეთ რუკაზე")}<Icon type={ArrowUpRight} /></A>
            </div>
          </div>
          <div className="contact-option"><div><h2>{t("სამუშაო საათები")}</h2><p>{t(copy.contact.hours)}</p></div></div>
        </div>
        <div className="contact-panel">
          <h2>{t(copy.contact.patientsTitle)}</h2>
          <p>{t(copy.contact.patientsIntro)}</p>
          <ul>{copy.contact.patientTopics.map((topic) => <li key={topic}>{t(topic)}</li>)}</ul>
          <h2>{t(copy.contact.professionalsTitle)}</h2>
          <CopyParagraphs paragraphs={copy.contact.professionals} />
          <div className="contact-resource"><Icon type={BookOpen} /><A href="https://fortislibrary.com" target="_blank" rel="noreferrer">{t(copy.shared.library)}<Icon type={ArrowUpRight} /></A></div>
        </div>
      </section>
    </>
  );
}
function Editorial() {
  const { t } = usePreferences();
  return (
    <>
      <div className="approved-page-intro"><PageIntro eyebrow="ინფორმაცია და წყაროები" title={t(copy.editorial.title)} /></div>
      <article className="wrap text-page approved-text-page">
        <CopyParagraphs paragraphs={copy.editorial.paragraphs} />
        <PharmacopoeiaNote />
        <CopyBlocks blocks={copy.editorial.blocks} />
      </article>
    </>
  );
}
function Privacy() {
  const { t } = usePreferences();
  return (
    <>
      <div className="approved-page-intro"><PageIntro eyebrow="კონფიდენციალურობა" title={t(copy.privacy.title)} /></div>
      <article className="wrap text-page approved-text-page">
        <CopyParagraphs paragraphs={copy.privacy.paragraphs} />
        <CopyBlocks blocks={copy.privacy.blocks} />
        <A href="tel:+995322053191" className="text-link">{t("დაგვირეკეთ")}<Icon type={Phone} /></A>
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
