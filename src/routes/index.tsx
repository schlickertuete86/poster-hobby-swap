import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { ActionButton } from "../components/action-button";
import { PosterShell } from "../components/poster-shell";
import {
  categories, colors, conditions, deliveryModes, distances, levels, listings, materials, offerKinds,
  type ListingType,
} from "../lib/catalog";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Materialbörse | Hobby Hopper" },
      { name: "description", content: "Ungenutzte Kreativmaterialien in deiner Nähe finden, anfragen und weitergeben." },
      { property: "og:title", content: "Materialbörse | Hobby Hopper" },
      { property: "og:description", content: "Ungenutzte Kreativmaterialien finden, anfragen und weitergeben." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const typeFilters: ("Alle" | ListingType)[] = ["Alle", "Angebot", "Gesuch"];

type FacetKey = "condition" | "offerKind" | "delivery" | "level" | "color" | "size" | "material";

const facets: { key: FacetKey; label: string; options: readonly string[] }[] = [
  { key: "condition", label: "ZUSTAND", options: conditions },
  { key: "offerKind", label: "ANGEBOTSART", options: offerKinds },
  { key: "delivery", label: "ORT", options: deliveryModes },
  { key: "level", label: "LEVEL", options: levels },
  { key: "color", label: "FARBE", options: colors },
  { key: "size", label: "GRÖSSE", options: sizes_() },
  { key: "material", label: "MATERIAL", options: materials },
];

function sizes_() {
  return ["Klein", "Mittel", "Groß"] as const;
}

function Index() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Alle" | ListingType>("Alle");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Record<FacetKey, string[]>>({
    condition: [], offerKind: [], delivery: [], level: [], color: [], size: [], material: [],
  });
  const [postalCode, setPostalCode] = useState("");
  const [radius, setRadius] = useState<number | null>(null);

  const activeCount =
    Object.values(selected).reduce((total, values) => total + values.length, 0) + (radius ? 1 : 0);

  function toggle(key: FacetKey, value: string) {
    setSelected((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((entry) => entry !== value) : [...current[key], value],
    }));
  }

  function resetFilters() {
    setSelected({ condition: [], offerKind: [], delivery: [], level: [], color: [], size: [], material: [] });
    setPostalCode("");
    setRadius(null);
  }

  const filtered = useMemo(
    () =>
      listings.filter((item) => {
        const haystack = `${item.title} ${item.description} ${item.category} ${item.materials.join(" ")} ${item.place} ${item.postalCode}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
        if (typeFilter !== "Alle" && item.type !== typeFilter) return false;
        if (categoryFilter && item.category !== categoryFilter) return false;
        if (selected.condition.length && !selected.condition.includes(item.condition)) return false;
        if (selected.offerKind.length && !selected.offerKind.includes(item.offerKind)) return false;
        if (selected.delivery.length && !selected.delivery.some((mode) => item.delivery.includes(mode as (typeof deliveryModes)[number]))) return false;
        if (selected.level.length && !selected.level.includes(item.level)) return false;
        if (selected.color.length && !selected.color.includes(item.color)) return false;
        if (selected.size.length && !selected.size.includes(item.size)) return false;
        if (selected.material.length && !selected.material.some((entry) => item.materials.includes(entry as (typeof materials)[number]))) return false;
        if (radius && item.distanceKm > radius) return false;
        return true;
      }),
    [query, typeFilter, categoryFilter, selected, radius],
  );

  return (
    <PosterShell>
        <section className="intro">
          <div className="eyebrow"><span className="shape-triangle" /> GEBEN / NEHMEN / TAUSCHEN / INSPIRIEREN</div>
          <h1>FINDE DEIN<br /><span>NEUES</span><br />HOBBY.</h1>
          <p>Probier dich aus. Wenn's nichts ist, gib es weiter.</p>
        </section>

        <section className="browse-panel" aria-label="Materialbörse durchsuchen">
          <div className="search-row">
            <label className="search-box">
              <Search aria-hidden="true" />
              <span className="sr-only">Material suchen</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="WAS SUCHST DU?" />
            </label>
            <button className="filter-label" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
              <SlidersHorizontal aria-hidden="true" />
              <span>FILTER{activeCount ? ` (${activeCount})` : ""}</span>
            </button>
          </div>

          <div className="filter-row" aria-label="Art des Inserats">
            {typeFilters.map((type) => (
              <button key={type} className="type-chip" aria-pressed={typeFilter === type} onClick={() => setTypeFilter(type)}>
                {type === "Alle" ? "ALLE" : type === "Angebot" ? "ANGEBOTE" : "GESUCHE"}
              </button>
            ))}
          </div>

          <div className="filter-row" aria-label="Hobby-Kategorie">
            <button className="tag-chip" aria-pressed={categoryFilter === null} onClick={() => setCategoryFilter(null)}>ALLE TAGS</button>
            {categories.map((category) => (
              <button key={category} className="tag-chip" aria-pressed={categoryFilter === category} onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}>
                {category.toUpperCase()}
              </button>
            ))}
          </div>

          {filtersOpen && (
            <div className="filter-panel" aria-label="Detailfilter">
              {facets.map((facet) => (
                <div className="filter-group" key={facet.key}>
                  <span className="filter-group-label">{facet.label}</span>
                  <div className="filter-group-chips">
                    {facet.options.map((option) => (
                      <button key={option} className="tag-chip" aria-pressed={selected[facet.key].includes(option)} onClick={() => toggle(facet.key, option)}>
                        {option.toUpperCase()}
                      </button>
                    ))}
                    {facet.key === "delivery" && (
                      <>
                        <label className="filter-input">
                          <span className="sr-only">Postleitzahl</span>
                          <input value={postalCode} inputMode="numeric" maxLength={5} placeholder="PLZ" onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, ""))} />
                        </label>
                        <label className="filter-input">
                          <span className="sr-only">Umkreis in Kilometern</span>
                          <select value={radius ?? ""} onChange={(event) => setRadius(event.target.value ? Number(event.target.value) : null)}>
                            <option value="">UMKREIS</option>
                            {distances.map((distance) => <option key={distance} value={distance}>{distance} KM</option>)}
                          </select>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div className="filter-group">
                <button className="type-chip" onClick={resetFilters}>FILTER ZURÜCKSETZEN</button>
              </div>
            </div>
          )}

          <div className="listing-heading">
            <div><span className="shape-circle" /><h2>FRISCH REINGEKOMMEN</h2></div>
            <span>{String(filtered.length).padStart(2, "0")} MATERIALIEN</span>
          </div>

          <div className="listing-grid">
            {filtered.map((item, index) => {
              const isRequested = requested.includes(item.title);
              return (
                <article className="listing-card" key={item.title}>
                  <div className="image-wrap">
                    <img src={item.image} alt={item.title} width={816} height={816} loading="lazy" />
                    <span className="listing-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`type-badge type-badge--${item.type.toLowerCase()}`}>{item.type.toUpperCase()}</span>
                  </div>
                  <div className="card-copy">
                    <div className="meta"><span>{item.category}</span><span>{item.place} · {item.distanceKm} km</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="attribute-row">
                      <span>{item.condition}</span><span>{item.offerKind}</span><span>{item.delivery.join(" / ")}</span><span>{item.level}</span>
                    </div>
                    <ActionButton onClick={() => setRequested((current) => isRequested ? current.filter((title) => title !== item.title) : [...current, item.title])} aria-pressed={isRequested}>
                      {isRequested ? "ANGEFRAGT" : item.type === "Gesuch" ? "ANBIETEN" : "ANFRAGEN"}<ArrowUpRight aria-hidden="true" />
                    </ActionButton>
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="empty-state">NICHTS GEFUNDEN. VERSUCH’S MIT EINEM ANDEREN BEGRIFF.</p>}
        </section>
    </PosterShell>
  );
}
