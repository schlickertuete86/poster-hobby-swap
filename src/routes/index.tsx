import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { ActionButton } from "../components/action-button";
import { PosterShell } from "../components/poster-shell";
import yarn from "../assets/yarn.jpg";
import paint from "../assets/paint.jpg";
import beads from "../assets/beads.jpg";
import fabric from "../assets/fabric.jpg";
import needles from "../assets/needles.jpg";
import ribbons from "../assets/ribbons.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Materialien entdecken | Hobby Hopper" },
      { name: "description", content: "Ungenutzte Kreativmaterialien in deiner Nähe finden, anfragen und weitergeben." },
      { property: "og:title", content: "Materialien entdecken | Hobby Hopper" },
      { property: "og:description", content: "Ungenutzte Kreativmaterialien finden, anfragen und weitergeben." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type ListingType = "Angebot" | "Gesuch";

const categories = ["Handarbeit", "Malen", "Zeichnen", "Handwerken", "Stoff & Nähen", "Schmuck"] as const;

const listings: { title: string; description: string; category: (typeof categories)[number]; type: ListingType; place: string; image: string }[] = [
  { title: "Merino-Wollreste", description: "Sieben Knäuel, kräftige Farben. Perfekt für Mützen oder kleine Webprojekte.", category: "Handarbeit", type: "Angebot", place: "Kreuzberg · 1,2 km", image: yarn },
  { title: "Acrylfarben-Set", description: "Vier angebrochene Tuben. Noch reichlich Farbe für dein nächstes Bild.", category: "Malen", type: "Angebot", place: "Neukölln · 2,4 km", image: paint },
  { title: "Glasperlen-Mix", description: "Bunte Einzelstücke aus alten Schmuckprojekten, circa 250 Gramm.", category: "Schmuck", type: "Gesuch", place: "Wedding · 3,1 km", image: beads },
  { title: "Stoffreste gemustert", description: "Baumwollstücke in vielen Mustern. Ideal zum Patchworken und Applizieren.", category: "Stoff & Nähen", type: "Angebot", place: "Moabit · 3,8 km", image: fabric },
  { title: "Stricknadel-Sammlung", description: "Rund- und Jackennadeln aus Holz in verschiedenen Stärken.", category: "Handarbeit", type: "Gesuch", place: "Pankow · 4,0 km", image: needles },
  { title: "Bänder & Borten", description: "Eine farbenfrohe Mischung für Kleidung, Geschenke und Collagen.", category: "Handwerken", type: "Angebot", place: "Friedrichshain · 4,6 km", image: ribbons },
];

const typeFilters: ("Alle" | ListingType)[] = ["Alle", "Angebot", "Gesuch"];

function Index() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Alle" | ListingType>("Alle");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>([]);
  const filtered = useMemo(
    () =>
      listings.filter((item) => {
        const matchesQuery = `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === "Alle" || item.type === typeFilter;
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesQuery && matchesType && matchesCategory;
      }),
    [query, typeFilter, categoryFilter],
  );

  return (
    <PosterShell>
        <section className="intro">
          <div className="eyebrow"><span className="shape-triangle" /> GEBEN / NEHMEN / TAUSCHEN / INSPIRIEREN</div>
          <h1>FINDE DEIN<br /><span>NEUES</span><br />HOBBY.</h1>
          <p>Probier dich aus. Wenn's nichts ist, gib es weiter.</p>
        </section>

        <section className="browse-panel" aria-label="Materialien durchsuchen">
          <div className="search-row">
            <label className="search-box">
              <Search aria-hidden="true" />
              <span className="sr-only">Material suchen</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="WAS SUCHST DU?" />
            </label>
            <div className="filter-label"><SlidersHorizontal aria-hidden="true" /><span>FILTER</span></div>
          </div>

          <div className="filter-row" aria-label="Art des Inserats">
            {typeFilters.map((type) => (
              <button key={type} className="type-chip" aria-pressed={typeFilter === type} onClick={() => setTypeFilter(type)}>
                {type === "Alle" ? "ALLE" : type === "Angebot" ? "ANGEBOTE" : "GESUCHE"}
              </button>
            ))}
          </div>

          <div className="filter-row" aria-label="Kategorien">
            <button className="tag-chip" aria-pressed={categoryFilter === null} onClick={() => setCategoryFilter(null)}>ALLE TAGS</button>
            {categories.map((category) => (
              <button key={category} className="tag-chip" aria-pressed={categoryFilter === category} onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}>
                {category.toUpperCase()}
              </button>
            ))}
          </div>

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
                    <div className="meta"><span>{item.category}</span><span>{item.place}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
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
