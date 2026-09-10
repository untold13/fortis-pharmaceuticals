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
} from "lucide-react";
import { products, sources } from "./products";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./style.css";
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
  return (
    <A href="/" className="brand" aria-label="Fortis Pharmaceuticals home">
      <span className="brand-icon">
        <img src="/fortis-logo.jpeg" alt="" />
      </span>
      <span>
        <strong>FORTIS</strong>
        <small>PHARMACEUTICALS</small>
      </span>
    </A>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Brand />
        <nav aria-label="Main navigation" className={open ? "nav open" : "nav"}>
          {nav.map(([url, name]) => (
            <A
              key={url}
              href={url}
              aria-current={location.pathname === url ? "page" : undefined}
            >
              {name}
            </A>
          ))}
        </nav>
        <A href="tel:+995322053191" className="contact-nav">
          Call pharmacy <Icon type={Phone} />
        </A>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
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
  return (
    <footer>
      <div className="footer-top wrap">
        <div>
          <Brand />
          <p>
            Individual needs.
            <br />
            Thoughtful preparation.
          </p>
        </div>
        <div>
          <small>DISCOVER</small>
          {nav.slice(1, 4).map(([h, n]) => (
            <A key={h} href={h}>
              {n}
            </A>
          ))}
        </div>
        <div>
          <small>FIND US</small>
          <A href="/contact">
            9 Givi Zhvania Street
            <br />
            Tbilisi, Georgia
          </A>
          <A href="tel:+995322053191">+995 32 205 31 91</A>
        </div>
        <div>
          <small>FOR PROFESSIONALS</small>
          <A href="https://fortislibrary.com" target="_blank" rel="noreferrer">
            Fortis Library <Icon type={ArrowUpRight} />
          </A>
          <A href="/editorial">Information & references</A>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>© {new Date().getFullYear()} Fortis Pharmaceuticals</span>
        <span>
          Compounded preparations require individual professional assessment.
        </span>
        <A href="/privacy">Privacy</A>
      </div>
    </footer>
  );
}
function DeferredProductImage({ p }) {
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
      { rootMargin: "100px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <img
      ref={ref}
      src={visible ? p.image : undefined}
      alt={`${p.name} ${p.strength}, ${p.pack} tablets - supplied packaging illustration`}
      width="1024"
      height="1536"
      decoding="async"
      style={visible ? undefined : { visibility: "hidden" }}
    />
  );
}
function Card({ p }) {
  return (
    <A href={`/products/${p.slug}`} className="product-card">
      <div className="product-image">
        <DeferredProductImage p={p} />
        <span className="round-arrow">
          <Icon type={ArrowUpRight} />
        </span>
      </div>
      <div className="product-card-bottom">
        <span className="product-category">{p.category}</span>
        <h3>{p.name}</h3>
        <div>
          <strong>{p.strength}</strong>
          <span>{p.pack} tablets</span>
        </div>
      </div>
    </A>
  );
}
function Hero() {
  return (
    <section className="simple-hero">
      <div className="wrap simple-hero-grid">
        <div className="hero-copy">
          <Eyebrow>FORTIS COMPOUNDING PHARMACY</Eyebrow>
          <h1>
            Precision
            <br />
            compounding.
          </h1>
          <p>
            Prepared in Tbilisi. Individual medicines, carefully compounded
            around the needs of each patient.
          </p>
          <div className="hero-actions">
            <Button href="/products">Explore medicines</Button>
            <A href="/compounding" className="text-link">
              Our approach <Icon type={ArrowRight} />
            </A>
          </div>
        </div>
        <figure className="simple-hero-image">
          <img
            src={products[0].image}
            alt="Original Fortis naltrexone hydrochloride 1.5 mg bottle illustration"
            width="1024"
            height="1536"
            fetchPriority="high"
          />
          <figcaption>
            Illustrative packaging. Follow your prescription.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
function Approach() {
  return (
    <section className="section wrap approach" id="approach">
      <h2>
        Medicine shaped around
        <br />
        individual needs.
      </h2>
      <div className="approach-content">
        <div>
          <p className="lead">
            When a standard preparation does not meet an individual’s needs,
            compounding opens a conversation.
          </p>
          <p>
            Fortis prepares medicines locally, using active pharmaceutical
            ingredients sourced from the US and Europe. The prescriber and
            pharmacist assess each formulation together.
          </p>
          <A href="/compounding" className="text-link">
            Discover compounding <Icon type={ArrowUpRight} />
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
                <h3>{h}</h3>
                <p>{b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Featured() {
  return (
    <section className="section featured">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <h2>Featured preparations.</h2>
          </div>
          <Button href="/products" secondary>
            View all products
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
          Illustrative packaging. Follow your prescription and pharmacist’s
          instructions. Product information is not a recommendation for
          self-treatment.
        </p>
      </div>
    </section>
  );
}
function LabTeaser() {
  return (
    <section className="section wrap company-overview">
      <Eyebrow>OUR STORY & LABORATORY</Eyebrow>
      <h2>
        Prepared locally.
        <br />
        With care at every stage.
      </h2>
      <div className="company-overview-body">
        <p>
          Fortis was founded around the needs of patients and healthcare
          professionals. Our pharmacy brings magistral and officinal compounding
          to Tbilisi, with attention to preparation, handling and storage.
        </p>
        <div>
          <h3>Inside Fortis</h3>
          <p>
            Learn about our founding vision, laboratory approach and commitment
            to professional collaboration.
          </p>
          <A href="/about" className="text-link">
            Our story & laboratory <Icon type={ArrowUpRight} />
          </A>
        </div>
      </div>
      <img
        className="company-brand"
        src="/fortis-logo.jpeg"
        alt="Fortis Pharmaceuticals / Compounding Pharmacy, in Georgian and English"
        loading="lazy"
        width="1600"
        height="533"
      />
    </section>
  );
}
function ContactBand() {
  return (
    <section className="contact-band">
      <div className="wrap">
        <div>
          <h2>
            A question about
            <br />
            individual preparation?
          </h2>
        </div>
        <Button href="/contact">Talk to Fortis</Button>
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
      <LabTeaser />
      <ContactBand />
    </>
  );
}
function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="page-intro wrap">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
function Catalog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All preparations");
  const categories = [
    "All preparations",
    ...new Set(products.map((p) => p.category)),
  ];
  const shown = products.filter(
    (p) =>
      (cat === categories[0] || p.category === cat) &&
      `${p.name} ${p.strength} ${p.category}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="THE FORTIS PORTFOLIO"
        title={
          <>
            Individual preparations.
            <br />
            <em>Clearly presented.</em>
          </>
        }
        description="Explore our portfolio by ingredient, strength or area of care. Each preparation has its own information page."
      />
      <section className="wrap catalog">
        <div className="catalog-toolbar">
          <label className="search">
            <span className="sr-only">Search products by name or strength</span>
            <Icon type={Search} />
            <input
              id="product-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or strength"
              aria-label="Search products"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search">
                <Icon type={X} />
              </button>
            )}
          </label>
          <span aria-live="polite">{shown.length} preparations</span>
        </div>
        <div className="filters" aria-label="Filter by area of care">
          {categories.map((c) => (
            <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <p className="filter-note">
          Areas of care are navigation aids; they do not establish an indication
          for a compounded preparation.
        </p>
        <div className="product-grid">
          {shown.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </div>
        {!shown.length && (
          <div className="empty">
            <h2>No preparations found.</h2>
            <p>Try another ingredient or reset the filters.</p>
            <button
              className="button"
              onClick={() => {
                setQ("");
                setCat(categories[0]);
              }}
            >
              Reset filters
            </button>
          </div>
        )}
        <p className="quiet-note">
          Illustrative packaging. Follow your prescription and pharmacist’s
          instructions. Availability and formulation details should be confirmed
          with Fortis.
        </p>
      </section>
      <ContactBand />
    </>
  );
}
function Product({ p }) {
  return (
    <>
      <div className="wrap breadcrumb">
        <A href="/products">Products</A>
        <span>/</span>
        <span>
          {p.name} · {p.strength}
        </span>
      </div>
      <section className="wrap product-detail">
        <div className="detail-visual">
          <img
            src={p.image}
            alt={`${p.name} ${p.strength}, ${p.pack} tablets - supplied packaging illustration`}
            width="1024"
            height="1536"
          />
          <p>
            Illustrative packaging. Follow your prescription and pharmacist’s
            instructions.
          </p>
        </div>
        <div className="detail-copy">
          <Eyebrow>{p.category}</Eyebrow>
          <h1>{p.name}</h1>
          <div className="detail-strength">{p.strength}</div>
          <div className="specs">
            <div>
              <small>PACK SIZE</small>
              <strong>{p.pack} tablets</strong>
            </div>
            <div>
              <small>PREPARATION</small>
              <strong>Compounded · oral</strong>
            </div>
          </div>
          <span className="tag">{p.tag}</span>
          <h2>Ingredient context</h2>
          <p>{p.context}</p>
          <div className="clinical-note">
            <h3>Clinical considerations</h3>
            <p>{p.caution}</p>
          </div>
          <h3>About this formulation</h3>
          <p>{p.note}</p>
          <Button href="/contact">Ask about this preparation</Button>
          <p className="detail-small">
            Selection, directions, excipients, release characteristics and
            beyond-use date must be confirmed by the prescribing clinician and
            dispensing pharmacist.
          </p>
        </div>
      </section>
      <section className="wrap references">
        <div>
          <Eyebrow>READ THE EVIDENCE</Eyebrow>
          <h2>Sources & perspective.</h2>
        </div>
        <div>
          {p.refs.map((key) => (
            <A
              href={sources[key].url}
              key={key}
              target="_blank"
              rel="noreferrer"
            >
              {sources[key].title}
              <Icon type={ArrowUpRight} />
            </A>
          ))}
          <p>
            These references describe ingredients or reference medicines, not
            FDA or EMA approval of Fortis compounded preparations. Archived
            labels may not reflect the latest labeling. This overview is not a
            complete safety guide or prescribing advice.
          </p>
          <A href="/editorial" className="text-link">
            How we present product information <Icon type={ArrowRight} />
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
  return (
    <div className="faq">
      {questions.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <Icon type={Plus} />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
function Compounding() {
  return (
    <>
      <PageIntro
        eyebrow="THE ART & SCIENCE OF COMPOUNDING"
        title={
          <>
            Prepared with purpose.
            <br />
            <em>Centered on the individual.</em>
          </>
        }
        description="A considered response when an individual’s pharmaceutical needs call for a tailored preparation."
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
          <h2>A prescription is the starting point.</h2>
          <p>
            People may have different requirements relating to strength,
            formulation, excipient tolerance or coexisting conditions.
            Compounding brings the prescriber and pharmacist into a conversation
            about those requirements.
          </p>
          <p>
            Fortis’s company account describes sourcing active pharmaceutical
            ingredients from the US and Europe and preparing medicines locally
            in Tbilisi. Each requested preparation requires a professional
            assessment of suitability and feasibility.
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
                <span>{n}</span>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
          <h2>Questions, answered.</h2>
          <FAQ />
        </article>
      </div>
      <ContactBand />
    </>
  );
}
function About() {
  return (
    <>
      <PageIntro
        eyebrow="ABOUT FORTIS"
        title={
          <>
            Rooted in Tbilisi.
            <br />
            <em>Focused on individual care.</em>
          </>
        }
        description="A compounding pharmacy built around the relationship between patients, prescribers and pharmacists."
      />
      <section className="wrap editorial-layout">
        <aside>
          <Eyebrow>OUR REASON FOR BEING</Eyebrow>
          <h2>
            A personal approach
            <br />
            to preparation.
          </h2>
          <p className="georgian">
            ფორტის ფარმაცევტიკალს
            <br />
            კომპოზიტური ფარმაცია
          </p>
        </aside>
        <article>
          <h2>Our story</h2>
          <p>
            Fortis was founded in response to patients’ needs, with the aim of
            preparing magistral and officinal medicines in a model inspired by
            European and American compounding pharmacies.
          </p>
          <p>
            The company’s founding vision also includes collaboration with
            healthcare professionals to support continuity of treatment in
            hospital and after discharge.
          </p>
          <blockquote lang="ka">
            მომხმარებლების ინტერესების გათვალისწინებით გადავწყვიტეთ გაგვეხსნა
            აფთიაქი, რომელიც ევროპული და ამერიკული ანალოგების მსგავსად შეძლებდა
            მედიკამენტების დამზადებას მაგისტრალური და ოფიცინალური რეცეპტის
            საფუძველზე.
          </blockquote>
          <h2 id="laboratory">Inside the laboratory</h2>
          <p>
            Fortis describes a laboratory equipped for small-batch preparation,
            with climate control, sterilization and autoclaving, and separate
            sterile and nonsterile working zones.
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
                <h3>{h}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <h2>Practice & documentation</h2>
          <p>
            The company reports permit <strong>სფსრს N00036</strong> for
            preparation and sale under officinal and magistral prescriptions.
          </p>
          <p>
            <strong>
              The Good Pharmacy Practice (GPP) certification process has
              started.
            </strong>{" "}
            Fortis is not presented on this website as GPP certified.
          </p>
          <p className="quiet-note">
            Company and laboratory descriptions are based on information
            supplied by Fortis. They are not an independent audit or
            verification of certification.
          </p>
        </article>
      </section>
      <ContactBand />
    </>
  );
}
function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="CONTACT FORTIS"
        title={
          <>
            A conversation.
            <br />
            <em>A more individual approach.</em>
          </>
        }
        description="For preparation questions, product availability or professional enquiries, speak with the pharmacy."
      />
      <section className="wrap contact-layout">
        <div>
          <A className="contact-option" href="tel:+995322053191">
            <Icon type={Phone} size={30} />
            <div>
              <small>CALL THE PHARMACY</small>
              <h2>+995 32 205 31 91</h2>
              <span>
                Speak with our team <Icon type={ArrowUpRight} />
              </span>
            </div>
          </A>
          <div className="contact-option">
            <Icon type={MapPin} size={30} />
            <div>
              <small>VISIT FORTIS</small>
              <h2>9 Givi Zhvania Street</h2>
              <p>Tbilisi, Georgia</p>
              <A
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=9+Givi+Zhvania+Street+Tbilisi"
                target="_blank"
                rel="noreferrer"
              >
                Open directions <Icon type={ArrowUpRight} />
              </A>
            </div>
          </div>
          <p className="quiet-note">
            Please call before visiting to confirm opening hours and
            availability.
          </p>
        </div>
        <div className="contact-panel">
          <Eyebrow>FOR PATIENTS & PROFESSIONALS</Eyebrow>
          <h2>
            Let’s discuss
            <br />
            what’s needed.
          </h2>
          <p>
            Our team can explain preparation requirements and help you identify
            what to discuss with your prescriber.
          </p>
          <ul>
            <li>Individual formulation enquiries</li>
            <li>Ingredient and excipient questions</li>
            <li>Product and strength availability</li>
            <li>Professional collaboration</li>
          </ul>
          <div className="contact-resource">
            <Icon type={BookOpen} />
            <A
              href="https://fortislibrary.com"
              target="_blank"
              rel="noreferrer"
            >
              Explore Fortis Library <Icon type={ArrowUpRight} />
            </A>
          </div>
        </div>
      </section>
    </>
  );
}
function Editorial() {
  return (
    <>
      <PageIntro
        eyebrow="INFORMATION & REFERENCES"
        title="Clear context. Defined limits."
      />
      <article className="wrap text-page">
        <h2>Our medical source policy</h2>
        <p>
          Ingredient context uses four selected authorities and publications:
          FDA, EMA, JAMA Dermatology and Pain Reports. Original journal articles
          may be accessed through PubMed Central. References are linked on each
          product page.
        </p>
        <h2>Ingredients and preparations are different</h2>
        <p>
          A reference medicine’s approval or study result does not establish the
          approval, equivalence, bioavailability, safety or efficacy of a
          particular Fortis compounded preparation. Strength, excipients,
          release profile and preparation method can matter. Product categories
          are navigation aids.
        </p>
        <h2>Packaging and prescribing</h2>
        <p>
          Product images are the original illustrations supplied by Fortis. They
          are not dispensing instructions. Follow only the directions issued for
          your own prescription by your clinician and pharmacist; do not use
          text shown in illustrative packaging to determine treatment, storage
          or beyond-use dates.
        </p>
        <h2>Editorial status</h2>
        <p>
          Source links checked September 10, 2026. This is a concise educational
          overview, not comprehensive prescribing information. Archived FDA
          documents are identified by year and may not be the latest approved
          labels. Clinical copy requires the pharmacy’s professional review as
          part of ongoing content maintenance.
        </p>
        <h2>Company information</h2>
        <p>
          Company background, permit details and laboratory descriptions were
          supplied by Fortis and are presented as company information, not
          independently verified regulatory findings.
        </p>
      </article>
    </>
  );
}
function Privacy() {
  return (
    <>
      <PageIntro eyebrow="PRIVACY" title="A simple information website." />
      <article className="wrap text-page">
        <p>
          This website has no checkout, patient registration or
          patient-information form. It does not ask you to upload prescriptions
          or health records.
        </p>
        <p>
          No advertising trackers or analytics scripts are added by this
          website. Hosting providers may process technical access logs to
          operate and secure the site. External links, including maps and
          reference publications, are governed by their own privacy policies.
        </p>
        <p>
          For pharmacy enquiries, call{" "}
          <A href="tel:+995322053191">+995 32 205 31 91</A>. Discuss sensitive
          health information through an appropriate channel agreed with the
          pharmacy.
        </p>
      </article>
    </>
  );
}
function App() {
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
      title = `${p.name} ${p.strength}`;
    } else {
      page = (
        <div className="wrap not-found">
          <h1>Page not found.</h1>
          <Button href="/products">Explore the portfolio</Button>
        </div>
      );
      title = "Page not found";
    }
  }
  useEffect(() => {
    document.title = `${title} | Fortis Pharmaceuticals`;
  }, [title]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{page}</main>
      <Footer />
    </>
  );
}
const root =
  import.meta.hot?.data.root || createRoot(document.getElementById("root"));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<App />);
