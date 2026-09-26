import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ImagePlus, X } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { ActionButton } from "../components/action-button";
import { PosterShell, Starburst } from "../components/poster-shell";
import { categories, colors, conditions, deliveryModes, handoverModes, levels, materials, scopes, sizes, type ListingType } from "../lib/catalog";
import { addMockListing } from "../lib/mock-listings";

export const Route = createFileRoute("/inserat-neu")({
  component: NewListingPage,
  head: () => ({ meta: [
    { title: "Inserat einstellen | Hobby Hopper" },
    { name: "description", content: "Material verschenken, tauschen oder ein Gesuch veröffentlichen." },
    { property: "og:title", content: "Inserat einstellen | Hobby Hopper" },
    { property: "og:description", content: "Ein neues Material-Inserat bei Hobby Hopper veröffentlichen." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

type Cond = (typeof conditions)[number];
type FormState = {
  listingType: ListingType; title: string; description: string; category: "" | (typeof categories)[number];
  scope: "" | (typeof scopes)[number]; handover: "" | (typeof handoverModes)[number];
  condition: "" | Cond; acceptedConditions: Cond[];
  place: string; postalCode: string; delivery: (typeof deliveryModes)[number][];
  level: string; color: string; size: string; materials: (typeof materials)[number][]; notes: string;
};
type Photo = { file: File; url: string };
type FieldKey = "photos" | "title" | "category" | "scope" | "handover" | "condition" | "delivery" | "postalCode";

const initial: FormState = { listingType: "Angebot", title: "", description: "", category: "", scope: "", handover: "", condition: "", acceptedConditions: [], place: "", postalCode: "", delivery: [], level: "", color: "", size: "", materials: [], notes: "" };
const ORDER: FieldKey[] = ["photos", "title", "category", "scope", "handover", "condition", "delivery", "postalCode"];
const MAX_PHOTOS = 5;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function validate(form: FormState, photos: Photo[]): Partial<Record<FieldKey, string>> {
  const offer = form.listingType === "Angebot";
  const e: Partial<Record<FieldKey, string>> = {};
  if (offer && photos.length === 0) e.photos = "Füge mindestens ein Foto hinzu.";
  if (form.title.trim().length < 3) e.title = "Gib einen Titel mit mindestens 3 Zeichen ein.";
  if (!form.category) e.category = "Wähle eine Hobby-Kategorie.";
  if (!form.scope) e.scope = "Wähle, ob es ein Set oder Einzelteile sind.";
  if (!form.handover) e.handover = "Wähle Verschenken oder Tauschen.";
  if (offer && !form.condition) e.condition = "Gib den Zustand an.";
  if (!form.delivery.length) e.delivery = "Wähle mindestens eine Übergabeart.";
  if (!/^\d{5}$/.test(form.postalCode)) e.postalCode = "Gib eine gültige 5-stellige Postleitzahl ein.";
  return e;
}

function NewListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const refs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});
  const offer = form.listingType === "Angebot";

  const errors = validate(form, photos);
  const required = ORDER.filter((k) => offer || (k !== "photos" && k !== "condition"));
  const done = required.filter((k) => !errors[k]).length;
  const shown = submitted ? errors : {};

  // PLZ → Ort automatisch
  useEffect(() => {
    if (!/^\d{5}$/.test(form.postalCode)) return;
    const ctrl = new AbortController();
    fetch(`https://openplzapi.org/de/Localities?postalCode=${form.postalCode}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { name?: string }[]) => { const name = data?.[0]?.name; if (name) setForm((f) => ({ ...f, place: name })); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [form.postalCode]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((f) => ({ ...f, [key]: value })); }
  function toggle<K extends "delivery" | "materials" | "acceptedConditions">(key: K, value: FormState[K][number]) {
    setForm((f) => { const list = f[key] as string[]; return { ...f, [key]: list.includes(value) ? list.filter((i) => i !== value) : [...list, value] }; });
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotoError("");
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type)) { setPhotoError(`„${file.name}“ hat ein falsches Format. Erlaubt sind JPG, PNG oder WEBP.`); continue; }
      if (file.size > 8 * 1024 * 1024) { setPhotoError(`„${file.name}“ ist größer als 8 MB.`); continue; }
      if (next.length >= MAX_PHOTOS) { setPhotoError(`Maximal ${MAX_PHOTOS} Fotos.`); break; }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setPhotos(next);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const first = required.find((k) => errors[k]);
    if (first) {
      const el = refs.current[first];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input, select, textarea, button")?.focus({ preventScroll: true });
      return;
    }
    addMockListing({
      title: form.title.trim(), description: form.description.trim(), category: form.category as (typeof categories)[number], type: form.listingType,
      place: form.place || form.postalCode, postalCode: form.postalCode, distanceKm: 0,
      condition: offer ? (form.condition as Cond) : undefined, acceptedConditions: offer ? undefined : form.acceptedConditions,
      scope: form.scope as (typeof scopes)[number], handover: form.handover as (typeof handoverModes)[number], delivery: form.delivery,
      level: (form.level || undefined) as never, color: (form.color || undefined) as never, size: (form.size || undefined) as never,
      materials: form.materials, image: photos[0]?.url ?? "", images: photos.map((p) => p.url),
    });
    await navigate({ to: "/" });
  }

  const reg = (k: FieldKey) => (el: HTMLElement | null) => { refs.current[k] = el; };
  const cls = (k: FieldKey, base = "") => `${base} ${shown[k] ? "has-error" : ""}`.trim();

  return <PosterShell>
    <section className="create-intro"><Link to="/" className="back-link"><ArrowLeft /> ZUR MATERIALBÖRSE</Link><div className="subpage-title-row"><h1>NEUES<br /><span>{offer ? "ANGEBOT." : "GESUCH."}</span></h1><Starburst /></div><p>{offer ? "Zeig, was du weitergeben möchtest." : "Sag der Community, wonach du suchst."}</p></section>
    <form className="listing-form" onSubmit={submit} noValidate>
      <div className="panel-bar"><span>{offer ? "ANGEBOT ERSTELLEN" : "GESUCH ERSTELLEN"}</span><span>{done} VON {required.length} PFLICHTFELDERN</span></div>

      <section className="form-section"><span className="form-number">01</span><div><h2>ANGEBOT ODER GESUCH?<span className="req">*</span></h2><div className="choice-row">{(["Angebot", "Gesuch"] as const).map((v) => <button type="button" className="type-chip" aria-pressed={form.listingType === v} onClick={() => set("listingType", v)} key={v}>{v.toUpperCase()}</button>)}</div></div></section>

      <section className={cls("photos", "form-section")} ref={reg("photos")}><span className="form-number">02</span><div className="photo-field">
        <h2>{offer ? "FOTOS" : "BEISPIELBILD (OPTIONAL)"}{offer && <span className="req">*</span>}</h2>
        <div className="photo-grid">
          {photos.map((p, i) => <div className="photo-thumb" key={p.url}><img src={p.url} alt={`Foto ${i + 1}`} /><button type="button" aria-label={`Foto ${i + 1} entfernen`} onClick={() => { URL.revokeObjectURL(p.url); setPhotos(photos.filter((x) => x !== p)); }}><X /></button></div>)}
          {photos.length < MAX_PHOTOS && <label className="photo-drop"><ImagePlus /><strong>{photos.length ? "WEITERES FOTO" : "FOTO AUSWÄHLEN"}</strong><span>JPG, PNG, WEBP · MAX. 8 MB · {photos.length}/{MAX_PHOTOS}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} /></label>}
        </div>
        {photoError && <p className="field-error" role="alert">{photoError}</p>}
        {shown.photos && <p className="field-error">{shown.photos}</p>}
      </div></section>

      <section className="form-section"><span className="form-number">03</span><div className="field-grid"><h2>{offer ? "WAS MÖCHTEST DU WEITERGEBEN?" : "WAS SUCHST DU?"}</h2>
        <Field k="title" label="TITEL" required wide error={shown.title} reg={reg}>
          <input maxLength={60} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={offer ? "Z. B. AQUARELLFARBEN-SET" : "Z. B. SUCHE HÄKELNADELN"} /><span className="char-count">{form.title.length} / 60</span>
        </Field>
        <label className="wide-field">BESCHREIBUNG (OPTIONAL)<textarea maxLength={500} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={offer ? "WAS GIBST DU WEITER? MENGE, MARKE, BESONDERHEITEN …" : "WAS GENAU SUCHST DU UND WOFÜR?"} /><span className="char-count">{form.description.length} / 500</span></label>
      </div></section>

      <section className="form-section"><span className="form-number">04</span><div className="field-grid"><h2>DETAILS & TAGS</h2>
        <Field k="category" label="HOBBY-KATEGORIE" required error={shown.category} reg={reg}><Select value={form.category} options={categories} placeholder="BITTE WÄHLEN" onChange={(v) => set("category", v as FormState["category"])} /></Field>
        {offer
          ? <Field k="condition" label="ZUSTAND" required error={shown.condition} reg={reg}><Select value={form.condition} options={conditions} placeholder="BITTE WÄHLEN" onChange={(v) => set("condition", v as FormState["condition"])} /></Field>
          : <div className="wide-field chip-field"><span>AKZEPTIERTER ZUSTAND (OPTIONAL)</span><div className="choice-row">{conditions.map((c) => <button type="button" key={c} className="tag-chip" aria-pressed={form.acceptedConditions.includes(c)} onClick={() => toggle("acceptedConditions", c)}>{c.toUpperCase()}</button>)}</div></div>}
        <Field k="scope" label="UMFANG" required wide error={shown.scope} reg={reg}><div className="choice-row">{scopes.map((s) => <button type="button" key={s} className="tag-chip" aria-pressed={form.scope === s} onClick={() => set("scope", s)}>{s.toUpperCase()}</button>)}</div></Field>
        <Field k="handover" label={offer ? "WEITERGABE ALS" : "GEWÜNSCHT ALS"} required wide error={shown.handover} reg={reg}><div className="choice-row">{handoverModes.map((s) => <button type="button" key={s} className="tag-chip" aria-pressed={form.handover === s} onClick={() => set("handover", s)}>{s.toUpperCase()}</button>)}</div></Field>
        <label>LEVEL (OPTIONAL)<Select value={form.level} options={levels} placeholder="KEINE ANGABE" onChange={(v) => set("level", v)} /></label>
        <label>FARBE (OPTIONAL)<Select value={form.color} options={colors} placeholder="KEINE ANGABE" onChange={(v) => set("color", v)} /></label>
        <label>GRÖSSE (OPTIONAL)<Select value={form.size} options={sizes} placeholder="KEINE ANGABE" onChange={(v) => set("size", v)} /></label>
        <div className="wide-field chip-field"><span>MATERIAL (OPTIONAL)</span><div className="choice-row">{materials.map((m) => <button type="button" key={m} className="tag-chip" aria-pressed={form.materials.includes(m)} onClick={() => toggle("materials", m)}>{m.toUpperCase()}</button>)}</div></div>
      </div></section>

      <section className="form-section"><span className="form-number">05</span><div className="field-grid"><h2>ORT & ÜBERGABE</h2>
        <Field k="delivery" label="ÜBERGABE" required wide error={shown.delivery} reg={reg}><div className="choice-row">{deliveryModes.map((d) => <button type="button" key={d} className="tag-chip" aria-pressed={form.delivery.includes(d)} onClick={() => toggle("delivery", d)}>{d.toUpperCase()}</button>)}</div></Field>
        <Field k="postalCode" label="POSTLEITZAHL" required error={shown.postalCode} reg={reg}><input inputMode="numeric" maxLength={5} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} placeholder="Z. B. 50667" /></Field>
        <label>ORT (AUTOMATISCH AUS PLZ)<input maxLength={100} value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="WIRD AUTOMATISCH BEFÜLLT" /></label>
        <label className="wide-field">ZUSÄTZLICHE HINWEISE (OPTIONAL)<textarea maxLength={500} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder={offer ? "Z. B. ABHOLZEITEN ODER TAUSCHWUNSCH" : "Z. B. WANN DU ABHOLEN KANNST"} /></label>
      </div></section>

      <section className="form-publish"><div><span>VORSCHAU</span><strong>{form.title || "DEIN TITEL"}</strong><p>{form.description || "Deine Beschreibung erscheint hier."}</p><div className="attribute-row"><span>{form.listingType}</span>{form.category && <span>{form.category}</span>}{form.handover && <span>{form.handover}</span>}<span>{form.place || "Ort"}</span></div></div><ActionButton type="submit">{offer ? "ANGEBOT VERÖFFENTLICHEN" : "GESUCH VERÖFFENTLICHEN"}<ArrowUpRight /></ActionButton></section>
      {submitted && done < required.length && <p className="form-message" role="alert">NOCH {required.length - done} PFLICHTFELD{required.length - done === 1 ? "" : "ER"} OFFEN.</p>}
    </form>
  </PosterShell>;
}

function Field({ k, label, required, wide, error, reg, children }: { k: FieldKey; label: string; required?: boolean | undefined; wide?: boolean | undefined; error?: string | undefined; reg: (k: FieldKey) => (el: HTMLElement | null) => void; children: ReactNode }) {
  return <div ref={reg(k)} className={`chip-field ${wide ? "wide-field" : ""} ${error ? "has-error" : ""}`}>
    <span>{label}{required && <span className="req">*</span>}</span>
    {children}
    {error && <p className="field-error">{error}</p>}
  </div>;
}

function Select({ value, options, placeholder, onChange }: { value: string; options: readonly string[]; placeholder: string; onChange: (v: string) => void }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}><option value="">{placeholder}</option>{options.map((o) => <option value={o} key={o}>{o}</option>)}</select>;
}
