import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Heart, LoaderCircle, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { PosterShell, Starburst } from "../components/poster-shell";
import { ActionButton } from "../components/action-button";
import { findProjectHelp } from "../lib/project-search.functions";
import { communityProjects, listings } from "../lib/catalog";

export const Route = createFileRoute("/projekt-hilfe")({
  head: () => ({ meta: [
    { title: "Projektfinder | Hobby Hopper" },
    { name: "description", content: "Projektidee eingeben und passende Materialinserate sowie Community-Projekte finden." },
    { property: "og:title", content: "Projektfinder | Hobby Hopper" },
    { property: "og:description", content: "Projektidee eingeben und passende Materialien sowie Community-Projekte finden." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProjectHelpPage,
});

type Result = {
  ideen: string[];
  material: string[];
  ersterSchritt: string;
  listingTitles: string[];
  projectTitles: string[];
};

function ProjectHelpPage() {
  const search = useServerFn(findProjectHelp);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await search({ data: { query } });
      setResult(response as Result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Der Projektfinder ist gerade nicht erreichbar.");
    } finally { setLoading(false); }
  }

  const matchedListings = listings.filter((item) => result?.listingTitles.includes(item.title));
  const matchedProjects = communityProjects.filter((project) => result?.projectTitles.includes(project.title));

  return <PosterShell>
    <section className="subpage-intro help-intro">
      <div className="eyebrow"><span className="shape-triangle" /> IDEE REIN / PLAN RAUS</div>
      <div className="subpage-title-row"><h1>WAS WILLST<br />DU <span>MACHEN?</span></h1><Starburst /></div>
      <p>Beschreib dein Projekt. Wir durchsuchen die Materialbörse und die Community-Projekte für dich.</p>
    </section>
    <section className="help-panel">
      <form className="smart-search" onSubmit={submit}>
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="project-query">Projektidee</label>
        <input id="project-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Z. B. ICH MÖCHTE EINE PATCHWORK-TASCHE NÄHEN …" />
        <ActionButton type="submit" disabled={loading || query.trim().length < 3}>
          {loading ? <><span>SUCHT</span><LoaderCircle className="spin" /></> : <><span>LOS</span><ArrowUpRight /></>}
        </ActionButton>
      </form>
      <div className="suggestion-row" aria-label="Beispielsuchen">
        {["Linoldruck ausprobieren", "Pullover stricken", "Mosaik-Untersetzer bauen"].map((example) => <button key={example} onClick={() => setQuery(example)}>{example}</button>)}
      </div>
      {error && <p className="ai-error" role="alert">{error}</p>}

      {result && <div className="ai-result">
        <div className="panel-bar"><span>DEIN PROJEKT-STARTER</span><Starburst /></div>
        <div className="result-block">
          <h2>IDEEN</h2>
          <ul>{result.ideen.map((idea) => <li key={idea}>{idea}</li>)}</ul>
        </div>
        <div className="result-block">
          <h2>MATERIAL</h2>
          <ul>{result.material.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="result-block">
          <h2>ERSTER SCHRITT</h2>
          <p>{result.ersterSchritt}</p>
        </div>

        <div className="result-block">
          <h2>PASSENDE INSERATE AUS DER MATERIALBÖRSE</h2>
          {matchedListings.length === 0 && <p>Gerade gibt es dafür kein passendes Inserat.</p>}
          <div className="match-grid">
            {matchedListings.map((item) => <article className="match-card" key={item.title}>
              <img src={item.image} alt={item.title} width={816} height={816} loading="lazy" />
              <div>
                <span className="match-meta">{item.type.toUpperCase()} · {item.category} · {item.place}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="match-meta">{item.condition ?? "Zustand offen"} · {item.scope} · {item.handover} · {item.delivery.join(" / ")}</span>
              </div>
            </article>)}
          </div>
        </div>

        <div className="result-block">
          <h2>PASSENDE PROJEKTE AUS DER COMMUNITY</h2>
          {matchedProjects.length === 0 && <p>Noch kein passendes Community-Projekt gefunden.</p>}
          <div className="match-grid">
            {matchedProjects.map((project) => <article className="match-card" key={project.title}>
              <img src={project.image} alt={project.title} width={912} height={912} loading="lazy" />
              <div>
                <span className="match-meta">{project.tag} · {project.maker}</span>
                <h3>{project.title}</h3>
                <p>{project.materials}</p>
                <span className="match-meta"><Heart aria-hidden="true" /> {project.likes}</span>
              </div>
            </article>)}
          </div>
        </div>
      </div>}

      {!result && !loading && <div className="help-placeholder"><span>01</span><p>PROJEKT BESCHREIBEN</p><span>→</span><span>02</span><p>IDEEN & MATERIAL FINDEN</p></div>}
    </section>
  </PosterShell>;
}
