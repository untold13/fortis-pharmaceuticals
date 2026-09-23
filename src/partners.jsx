import React, { useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import partnerContent from "../content/partners.json";
import "./partners.css";

export function Partners() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase("ka");
  const groups = partnerContent.groups
    .filter((group) => category === "all" || category === group.id)
    .map((group) => ({
      ...group,
      partners: partnerContent.partners.filter((partner) =>
        partner.group === group.id &&
        [partner.name, partner.alias, partner.country].filter(Boolean).join(" ").toLocaleLowerCase("ka").includes(search),
      ),
    }))
    .filter((group) => group.partners.length);
  const total = groups.reduce((count, group) => count + group.partners.length, 0);
  return (
    <div className="partners-page wrap">
      <div className="partners-intro">
        <div>
          <div className="eyebrow">ჩვენი პარტნიორები</div>
          <h1>თანამშრომლობა,<br /><em>რომელიც გვაერთიანებს.</em></h1>
        </div>
        <p>ფორტისის პარტნიორი საერთაშორისო კომპანიები, სამედიცინო დაწესებულებები, კვლევითი ორგანიზაციები და სადაზღვევო კომპანიები.</p>
      </div>
      <div className="partners-tools">
        <div className="partners-filters" role="group" aria-label="პარტნიორების კატეგორია">
          {[{ id: "all", label: "ყველა" }, ...partnerContent.groups].map((group) => (
            <button key={group.id} type="button" aria-pressed={category === group.id} onClick={() => setCategory(group.id)}>{group.label}</button>
          ))}
        </div>
        <div className="partners-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="პარტნიორის ძიება" aria-label="პარტნიორის ძიება" />
          {query && <button type="button" aria-label="ძიების გასუფთავება" onClick={() => setQuery("")}><X size={16} aria-hidden="true" /></button>}
        </div>
      </div>
      <p className="partners-result-count" role="status">{total} პარტნიორი</p>
      {groups.map((group) => (
        <section className="partners-section" key={group.id} aria-labelledby={`partners-${group.id}`}>
          <h2 id={`partners-${group.id}`}>{group.title}</h2>
          <ul className={`partners-grid ${group.id === "international" ? "partners-grid-logos" : ""}`}>
            {group.partners.map((partner) => {
              const Tag = partner.url ? "a" : "div";
              return (
                <li key={partner.id}>
                  <Tag className={`partner-entry ${partner.logo ? "has-logo" : ""}`} {...(partner.url ? { href: partner.url, target: "_blank", rel: "noopener noreferrer", "aria-label": `${partner.name} — ${partner.linkLabel || "ოფიციალური საიტი"}, ახალ ჩანართში` } : {})}>
                    {(group.id === "international" || partner.logo) && <div className="partner-mark">{partner.logo ? <img src={partner.logo} alt="" width="220" height="88" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /> : <span>{partner.name}</span>}</div>}
                    <div className="partner-info">
                      <h3>{partner.name}</h3>
                      {partner.alias && <p>{partner.alias}</p>}
                      {partner.country && <small>{partner.country}</small>}
                    </div>
                    {partner.url && <ArrowUpRight className="partner-arrow" size={19} strokeWidth={1.5} aria-hidden="true" />}
                  </Tag>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {!total && <div className="partners-empty"><h2>პარტნიორი ვერ მოიძებნა</h2><p>სცადეთ სხვა დასახელება ან აირჩიეთ ყველა კატეგორია.</p><button type="button" onClick={() => { setQuery(""); setCategory("all"); }}>ყველა პარტნიორის ნახვა</button></div>}
    </div>
  );
}
