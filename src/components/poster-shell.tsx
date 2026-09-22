import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import marble from "../assets/hobby-hopper-gradient.jpg";

export function Starburst({ className = "" }: { className?: string }) {
  return <span className={`starburst ${className}`} aria-hidden="true" />;
}

export function PosterShell({ children }: { children: ReactNode }) {
  return (
    <main className="poster-page">
      <img src={marble} alt="" width={1920} height={1408} className="marble-background" />
      <div className="grain" aria-hidden="true" />
      <div className="content-scrim" aria-hidden="true" />
      <div className="site-shell">
        <header className="site-header">
          <Link to="/" className="brand" aria-label="Hobby Hopper Startseite">
            <span>HOBBY</span><span>HOPPER</span>
          </Link>
          <nav className="site-nav" aria-label="Hauptnavigation">
            <Link to="/">MATERIALBÖRSE</Link>
            <Link to="/inspiration">INSPIRATION AUS DER COMMUNITY</Link>
            <Link to="/projekt-hilfe">PROJEKTFINDER</Link>
          </nav>
          <Link to="/auth" className="account-link">ANMELDEN / REGISTRIEREN</Link>
        </header>
        {children}
      </div>
    </main>
  );
}