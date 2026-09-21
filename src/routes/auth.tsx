import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PosterShell, Starburst } from "../components/poster-shell";
import { ActionButton } from "../components/action-button";
import { supabase } from "../integrations/supabase/client";
import { lovable } from "../integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Anmelden oder registrieren | Hobby Hopper" },
    { name: "description", content: "Bei Hobby Hopper anmelden oder ein neues Community-Konto erstellen." },
    { property: "og:title", content: "Anmelden oder registrieren | Hobby Hopper" },
    { property: "og:description", content: "Teil der Hobby-Hopper-Community werden." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void supabase.auth.getUser().then(async ({ data: userData }) => {
          const user = userData.user;
          if (user) {
            await supabase.from("profiles").upsert({
              id: user.id,
              display_name: typeof user.user_metadata['display_name'] === "string" ? user.user_metadata['display_name'] : null,
            });
          }
          void navigate({ to: "/" });
        });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } } });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage("FAST GESCHAFFT: BESTÄTIGE DEINE E-MAIL.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }
    setBusy(false);
  }
  async function googleSignIn() {
    setBusy(true); setMessage("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setMessage(result.error.message); setBusy(false); }
  }
  return <PosterShell>
    <section className="auth-layout">
      <div className="auth-statement"><div className="eyebrow"><span className="shape-triangle" /> COMMUNITY / MATERIAL / IDEEN</div><h1>KOMM<br /><span>REIN.</span></h1><Starburst /></div>
      <section className="auth-panel">
        <div className="auth-tabs"><button aria-pressed={mode === "login"} onClick={() => setMode("login")}>ANMELDEN</button><button aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>REGISTRIEREN</button></div>
        <form onSubmit={submit}>
          {mode === "signup" && <label>DEIN NAME<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>}
          <label>E-MAIL<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>PASSWORT<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
          <ActionButton type="submit" disabled={busy}>{mode === "login" ? "ANMELDEN" : "KONTO ERSTELLEN"}<ArrowUpRight /></ActionButton>
        </form>
        <div className="auth-divider"><span>ODER</span></div>
        <button className="google-button" onClick={googleSignIn} disabled={busy}>MIT GOOGLE FORTFAHREN</button>
        {message && <p className="auth-message" role="status">{message}</p>}
      </section>
    </section>
  </PosterShell>;
}