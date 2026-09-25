import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ImagePlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ActionButton } from "../components/action-button";
import { PosterShell, Starburst } from "../components/poster-shell";
import { categories, colors, conditions, deliveryModes, levels, materials, offerKinds, sizes, type ListingType } from "../lib/catalog";
import { addMockListing } from "../lib/mock-listings";

export const Route = createFileRoute("/inserat-neu")({
  component: NewListingPage,
  head: () => ({ meta: [
    { title: "Inserat einstellen | Hobby Hopper" },
    { name: "description", content: "Material anbieten, tauschen, verschenken oder ein Gesuch veröffentlichen." },
    { property: "og:title", content: "Inserat einstellen | Hobby Hopper" },
    { property: "og:description", content: "Ein neues Material-Inserat bei Hobby Hopper veröffentlichen." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

type FormState = {
  listingType: ListingType; title: string; description: string; category: (typeof categories)[number];
  place: string; postalCode: string; condition: (typeof conditions)[number]; offerKind: (typeof offerKinds)[number];
  delivery: (typeof deliveryModes)[number][]; level: (typeof levels)[number]; color: (typeof colors)[number];
  size: (typeof sizes)[number]; materials: (typeof materials)[number][]; notes: string;
};

const initial: FormState = { listingType: "Angebot", title: "", description: "", category: categories[0], place: "", postalCode: "", condition: conditions[0], offerKind: offerKinds[0], delivery: [], level: levels[0], color: colors[0], size: sizes[0], materials: [], notes: "" };

function NewListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const preview = useMemo(() => photo ? URL.createObjectURL(photo) : "", [photo]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function toggleArray<K extends "delivery" | "materials">(key: K, value: FormState[K][number]) {
    setForm((current) => ({ ...current, [key]: current[key].includes(value as never) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!photo) { setMessage("BITTE FÜGE EIN FOTO HINZU."); return; }
    if (!form.delivery.length || !form.materials.length) { setMessage("WÄHLE MINDESTENS EINE ÜBERGABEART UND EIN MATERIAL."); return; }
    if (!photo.type.startsWith("image/") || photo.size > 8 * 1024 * 1024) { setMessage("DAS FOTO MUSS EIN BILD UND MAXIMAL 8 MB GROSS SEIN."); return; }
    setBusy(true); setMessage("");
    addMockListing({
      title: form.title, description: form.description, category: form.category, type: form.listingType,
      place: form.place, postalCode: form.postalCode, distanceKm: 0, condition: form.condition,
      offerKind: form.offerKind, delivery: form.delivery, level: form.level, color: form.color,
      size: form.size, materials: form.materials, image: URL.createObjectURL(photo),
    });
    await navigate({ to: "/" });
  }

  return <PosterShell>
    <section className="create-intro"><Link to="/" className="back-link"><ArrowLeft /> ZUR MATERIALBÖRSE</Link><div className="subpage-title-row"><h1>NEUES<br /><span>INSERAT.</span></h1><Starburst /></div><p>Zeig, was du weitergeben möchtest – oder sag der Community, wonach du suchst.</p></section>
    <form className="listing-form" onSubmit={submit}>
      <div className="panel-bar"><span>INSERAT ERSTELLEN</span><span>ALLE PFLICHTFELDER AUSFÜLLEN</span></div>
      <section className="form-section"><span className="form-number">01</span><div><h2>ANGEBOT ODER GESUCH?</h2><div className="choice-row">{(["Angebot", "Gesuch"] as const).map((value) => <button type="button" className="type-chip" aria-pressed={form.listingType === value} onClick={() => setForm((current) => ({ ...current, listingType: value, offerKind: value === "Gesuch" ? "Gesuch" : current.offerKind === "Gesuch" ? "Set" : current.offerKind }))} key={value}>{value.toUpperCase()}</button>)}</div></div></section>
      <section className="form-section"><span className="form-number">02</span><div className="photo-field"><h2>FOTO</h2>{preview ? <div className="photo-preview"><img src={preview} alt="Vorschau des ausgewählten Fotos" /><button type="button" onClick={() => setPhoto(null)} aria-label="Foto entfernen"><X /></button></div> : <label className="photo-drop"><ImagePlus /><strong>FOTO AUSWÄHLEN</strong><span>JPG, PNG ODER WEBP · MAX. 8 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /></label>}</div></section>
      <section className="form-section"><span className="form-number">03</span><div className="field-grid"><h2>BESCHREIBUNG</h2><label className="wide-field">TITEL<input required minLength={3} maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Z. B. AQUARELLFARBEN-SET" /></label><label className="wide-field">BESCHREIBUNG<textarea required minLength={10} maxLength={1200} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="WAS GIBST DU WEITER ODER SUCHST DU?" /></label></div></section>
      <section className="form-section"><span className="form-number">04</span><div className="field-grid"><h2>DETAILS & TAGS</h2><SelectField label="HOBBY-KATEGORIE" value={form.category} options={categories} onChange={(value) => setForm({ ...form, category: value as FormState["category"] })} /><SelectField label="ZUSTAND" value={form.condition} options={conditions} onChange={(value) => setForm({ ...form, condition: value as FormState["condition"] })} /><SelectField label="ANGEBOTSART" value={form.offerKind} options={form.listingType === "Gesuch" ? ["Gesuch"] : offerKinds.filter((item) => item !== "Gesuch")} onChange={(value) => setForm({ ...form, offerKind: value as FormState["offerKind"] })} /><SelectField label="LEVEL" value={form.level} options={levels} onChange={(value) => setForm({ ...form, level: value as FormState["level"] })} /><SelectField label="FARBE" value={form.color} options={colors} onChange={(value) => setForm({ ...form, color: value as FormState["color"] })} /><SelectField label="GRÖSSE" value={form.size} options={sizes} onChange={(value) => setForm({ ...form, size: value as FormState["size"] })} /><div className="wide-field chip-field"><span>ÜBERGABE</span><div className="choice-row">{deliveryModes.map((item) => <button type="button" key={item} className="tag-chip" aria-pressed={form.delivery.includes(item)} onClick={() => toggleArray("delivery", item)}>{item.toUpperCase()}</button>)}</div></div><div className="wide-field chip-field"><span>MATERIAL</span><div className="choice-row">{materials.map((item) => <button type="button" key={item} className="tag-chip" aria-pressed={form.materials.includes(item)} onClick={() => toggleArray("materials", item)}>{item.toUpperCase()}</button>)}</div></div></div></section>
      <section className="form-section"><span className="form-number">05</span><div className="field-grid"><h2>ORT & ÜBERGABE</h2><label>ORT<input required minLength={2} maxLength={100} value={form.place} onChange={(event) => setForm({ ...form, place: event.target.value })} /></label><label>POSTLEITZAHL<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value.replace(/\D/g, "") })} /></label><label className="wide-field">ZUSÄTZLICHE HINWEISE (OPTIONAL)<textarea maxLength={500} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Z. B. ABHOLZEITEN ODER TAUSCHWUNSCH" /></label></div></section>
      <section className="form-publish"><div><span>VORSCHAU</span><strong>{form.title || "DEIN TITEL"}</strong><p>{form.description || "Deine Beschreibung erscheint hier."}</p><div className="attribute-row"><span>{form.listingType}</span><span>{form.category}</span><span>{form.place || "Ort"}</span></div></div><ActionButton type="submit" disabled={busy}>{busy ? "WIRD VERÖFFENTLICHT …" : "JETZT VERÖFFENTLICHEN"}<ArrowUpRight /></ActionButton></section>
      {message && <p className="form-message" role="alert">{message}</p>}
    </form>
  </PosterShell>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>;
}