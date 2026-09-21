import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, LoaderCircle, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { PosterShell, Starburst } from "../components/poster-shell";
import { ActionButton } from "../components/action-button";
import { findProjectHelp } from "../lib/project-search.functions";

export const Route = createFileRoute("/projekt-hilfe")({
  head: () => ({ meta: [
    { title: "Smarte Projekthilfe | Hobby Hopper" },
    { name: "description", content: "Projektideen eingeben und passende Inspiration sowie verfügbare Materialien finden." },
    { property: "og:title", content: "Smarte Projekthilfe | Hobby Hopper" },
    { property: "og:description", content: "Projektideen eingeben und passende Inspiration sowie Materialien finden." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProjectHelpPage,
});

function ProjectHelpPage() {
  const search = useServerFn(findProjectHelp);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true); setError(""); setResult("");
    try {
      const response = await search({ data: { query } });
      setResult(response.text);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Projekthilfe ist gerade nicht erreichbar.");
    } finally { setLoading(false); }
  }
  return <PosterShell>
    <section className="subpage-intro help-intro">
      <div className="eyebrow"><span className="shape-triangle" /> IDEE REIN / PLAN RAUS</div>
      <div className="subpage-title-row"><h1>WAS WILLST<br />DU <span>MACHEN?</span></h1><Starburst /></div>
      <p>Beschreib dein Projekt. Wir finden Vorbilder und passende Materialien aus der Community.</p>
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
      {result && <div className="ai-result"><div className="panel-bar"><span>DEIN PROJEKT-STARTER</span><Starburst /></div><pre>{result}</pre></div>}
      {!result && !loading && <div className="help-placeholder"><span>01</span><p>PROJEKT BESCHREIBEN</p><span>→</span><span>02</span><p>IDEEN & MATERIAL FINDEN</p></div>}
    </section>
  </PosterShell>;
}