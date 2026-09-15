import React from "react";
import { filterDefinitions, resolveFilterSelections } from "./filter-options.js";

export function ProductFilterFields({ value = {}, onChange }) {
  return (
    <section className="admin-filter-fields">
      <h3>კატალოგის ფილტრები</h3>
      <p className="admin-hint">თითოეულ ჯგუფში შეგიძლიათ რამდენიმე ვარიანტი მონიშნოთ.</p>
      {filterDefinitions.map((definition) => {
        const { key, label, groups } = definition;
        const { selected, unmatched } = resolveFilterSelections(key, value[key]);
        return (
          <details className="admin-filter-group" key={key}>
            <summary>{label} <span>{selected.length} მონიშნული</span></summary>
            {unmatched.length > 0 && (
              <div className="admin-filter-previous">
                <p>წინა მნიშვნელობები ახალ სიაში არ არის. მონიშნეთ შესაბამისი ვარიანტები ქვემოთ; ამ ჯგუფში ახალი არჩევანი ძველ მნიშვნელობებს ჩაანაცვლებს.</p>
                <ul>{unmatched.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
            {groups.map((group) => (
              <fieldset key={group.label}>
                <legend className={group.label ? "" : "admin-sr-only"}>{group.label || label}</legend>
                <div className="admin-filter-options">
                  {group.options.map((option) => (
                    <label className="admin-toggle" key={option}>
                      <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={(event) => onChange({
                          ...value,
                          [key]: event.target.checked
                            ? [...selected, option]
                            : selected.filter((item) => item !== option),
                        })}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </details>
        );
      })}
    </section>
  );
}
