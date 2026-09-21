import { createFileRoute } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { PosterShell, Starburst } from "../components/poster-shell";
import tufting from "../assets/project-tufting.jpg";
import ceramics from "../assets/project-ceramics.jpg";
import patchwork from "../assets/project-patchwork.jpg";
import beads from "../assets/project-beads.jpg";

export const Route = createFileRoute("/inspiration")({
  head: () => ({ meta: [
    { title: "Community-Inspiration | Hobby Hopper" },
    { name: "description", content: "Fertige kreative Projekte aus der Hobby-Hopper-Community entdecken." },
    { property: "og:title", content: "Community-Inspiration | Hobby Hopper" },
    { property: "og:description", content: "Fertige kreative Projekte aus der Hobby-Hopper-Community entdecken." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: InspirationPage,
});

const projects = [
  { title: "TUFTING FÜR DIE WAND", maker: "MILA · KÖLN", tag: "HANDARBEIT", image: tufting, likes: 128 },
  { title: "BEMALTER PFLANZTOPF", maker: "SASKIA · LEIPZIG", tag: "MALEN", image: ceramics, likes: 94 },
  { title: "PATCHWORK-TASCHE", maker: "AYLIN · HAMBURG", tag: "STOFF & NÄHEN", image: patchwork, likes: 211 },
  { title: "GLASPERLEN-KETTE", maker: "NOAH · MAINZ", tag: "SCHMUCK", image: beads, likes: 76 },
];

function InspirationPage() {
  return <PosterShell>
    <section className="subpage-intro">
      <div className="eyebrow"><span className="shape-triangle" /> VON DER COMMUNITY / FÜR DICH</div>
      <div className="subpage-title-row"><h1>FERTIG.<br /><span>ZEIGEN.</span></h1><Starburst /></div>
      <p>Was aus geteiltem Material werden kann. Echte Projekte, neue Ideen.</p>
    </section>
    <section className="feed-panel" aria-label="Fertige Projekte der Community">
      <div className="panel-bar"><span>COMMUNITY-FEED</span><button className="square-icon-button" title="Projekt hinzufügen" aria-label="Projekt hinzufügen"><Plus /></button></div>
      <div className="project-feed">
        {projects.map((project, index) => <article className="project-card" key={project.title}>
          <div className="project-image"><img src={project.image} alt={project.title} width={912} height={912} loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span></div>
          <div className="project-meta"><span>{project.tag}</span><span>{project.maker}</span></div>
          <div className="project-caption"><h2>{project.title}</h2><span><Heart aria-hidden="true" /> {project.likes}</span></div>
        </article>)}
      </div>
    </section>
  </PosterShell>;
}