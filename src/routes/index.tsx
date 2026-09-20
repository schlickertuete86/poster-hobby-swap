import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { ActionButton } from "../components/action-button";
import marble from "../assets/hobby-hopper-gradient.jpg";
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

const listings = [
  { title: "Merino-Wollreste", description: "Sieben Knäuel, kräftige Farben. Perfekt für Mützen oder kleine Webprojekte.", category: "Wolle", place: "Kreuzberg · 1,2 km", image: yarn },
  { title: "Acrylfarben-Set", description: "Vier angebrochene Tuben. Noch reichlich Farbe für dein nächstes Bild.", category: "Farbe", place: "Neukölln · 2,4 km", image: paint },
  { title: "Glasperlen-Mix", description: "Bunte Einzelstücke aus alten Schmuckprojekten, circa 250 Gramm.", category: "Perlen", place: "Wedding · 3,1 km", image: beads },
  { title: "Stoffreste gemustert", description: "Baumwollstücke in vielen Mustern. Ideal zum Patchworken und Applizieren.", category: "Stoff", place: "Moabit · 3,8 km", image: fabric },
  { title: "Stricknadel-Sammlung", description: "Rund- und Jackennadeln aus Holz in verschiedenen Stärken.", category: "Werkzeug", place: "Pankow · 4,0 km", image: needles },
  { title: "Bänder & Borten", description: "Eine farbenfrohe Mischung für Kleidung, Geschenke und Collagen.", category: "Kurzwaren", place: "Friedrichshain · 4,6 km", image: ribbons },
];

function Starburst({ className = "" }: { className?: string }) {
  return <span className={`starburst ${className}`} aria-hidden="true" />;
}

function Index() {
  const [query, setQuery] = useState("");
  const [requested, setRequested] = useState<string[]>([]);
  const filtered = useMemo(() => listings.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main className="poster-page">
      <img src={marble} alt="" width={1920} height={1408} className="marble-background" />
      <div className="grain" aria-hidden="true" />

      <div className="site-shell">
        <header className="site-header">
          <a href="/" className="brand" aria-label="Hobby Hopper Startseite">
            <span>HOBBY</span><span>HOPPER</span>
          </a>
          <div className="header-mark"><Starburst /><span className="shape-square" /></div>
          <div className="header-note">Material rein.<br />Ideen raus.</div>
        </header>

        <section className="intro">
          <div className="eyebrow"><span className="shape-triangle" /> BERLIN / MATERIALBÖRSE / 09—26</div>
          <h1>FIND DEIN<br /><span>NÄCHSTES</span><br />MATERIAL.</h1>
          <p>Was bei anderen herumliegt, kann bei dir zum Lieblingsprojekt werden.</p>
        </section>

        <section className="browse-panel" aria-label="Materialien durchsuchen">
          <div className="search-row">
            <label className="search-box">
              <Search aria-hidden="true" />
              <span className="sr-only">Material suchen</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="WAS SUCHST DU?" />
            </label>
            <div className="filter-label"><SlidersHorizontal aria-hidden="true" /><span>ALLE<br />KATEGORIEN</span></div>
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
                  </div>
                  <div className="card-copy">
                    <div className="meta"><span>{item.category}</span><span>{item.place}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <ActionButton onClick={() => setRequested((current) => isRequested ? current.filter((title) => title !== item.title) : [...current, item.title])} aria-pressed={isRequested}>
                      {isRequested ? "ANGEFRAGT" : "ANFRAGEN"}<ArrowUpRight aria-hidden="true" />
                    </ActionButton>
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="empty-state">NICHTS GEFUNDEN. VERSUCH’S MIT EINEM ANDEREN BEGRIFF.</p>}
        </section>
      </div>
    </main>
  );
}
