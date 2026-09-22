import yarn from "../assets/yarn.jpg";
import paint from "../assets/paint.jpg";
import beads from "../assets/beads.jpg";
import fabric from "../assets/fabric.jpg";
import needles from "../assets/needles.jpg";
import ribbons from "../assets/ribbons.jpg";
import tufting from "../assets/project-tufting.jpg";
import ceramics from "../assets/project-ceramics.jpg";
import patchwork from "../assets/project-patchwork.jpg";
import projectBeads from "../assets/project-beads.jpg";

export const categories = ["Handarbeit", "Malen", "Zeichnen", "Handwerken", "Stoff & Nähen", "Schmuck"] as const;
export const conditions = ["Neu", "Wie neu", "Gebraucht", "Starke Gebrauchsspuren"] as const;
export const offerKinds = ["Set", "Einzelteil(e)", "Tauschen", "Verschenken", "Gesuch", "Verkauf"] as const;
export const deliveryModes = ["Selbstabholung", "Versand"] as const;
export const levels = ["Anfänger*in", "Mit Vorwissen", "Professionell"] as const;
export const colors = ["Bunt", "Rot", "Blau", "Grün", "Natur", "Schwarz"] as const;
export const sizes = ["Klein", "Mittel", "Groß"] as const;
export const materials = [
  "Stoff", "Textil", "Garn", "Acrylfarbe", "Ölfarbe", "Wasserfarbe", "Werkzeug",
  "Malereiutensilien", "Holz", "Plastik", "Metall", "Hardware", "Glas", "Perlen",
] as const;
export const distances = [5, 10, 25, 50, 100] as const;

export type ListingType = "Angebot" | "Gesuch";

export type Listing = {
  title: string;
  description: string;
  category: (typeof categories)[number];
  type: ListingType;
  place: string;
  postalCode: string;
  distanceKm: number;
  condition: (typeof conditions)[number];
  offerKind: (typeof offerKinds)[number];
  delivery: (typeof deliveryModes)[number][];
  level: (typeof levels)[number];
  color: (typeof colors)[number];
  size: (typeof sizes)[number];
  materials: (typeof materials)[number][];
  image: string;
};

export const listings: Listing[] = [
  {
    title: "Merino-Wollreste", description: "Sieben Knäuel, kräftige Farben. Perfekt für Mützen oder kleine Webprojekte.",
    category: "Handarbeit", type: "Angebot", place: "Köln", postalCode: "50667", distanceKm: 4,
    condition: "Wie neu", offerKind: "Set", delivery: ["Selbstabholung", "Versand"], level: "Anfänger*in",
    color: "Bunt", size: "Mittel", materials: ["Garn", "Textil"], image: yarn,
  },
  {
    title: "Acrylfarben-Set", description: "Vier angebrochene Tuben. Noch reichlich Farbe für dein nächstes Bild.",
    category: "Malen", type: "Angebot", place: "Leipzig", postalCode: "04103", distanceKm: 9,
    condition: "Gebraucht", offerKind: "Verschenken", delivery: ["Selbstabholung"], level: "Anfänger*in",
    color: "Bunt", size: "Klein", materials: ["Acrylfarbe", "Malereiutensilien"], image: paint,
  },
  {
    title: "Glasperlen-Mix", description: "Bunte Einzelstücke aus alten Schmuckprojekten, circa 250 Gramm.",
    category: "Schmuck", type: "Gesuch", place: "Hamburg", postalCode: "20095", distanceKm: 21,
    condition: "Gebraucht", offerKind: "Gesuch", delivery: ["Versand"], level: "Mit Vorwissen",
    color: "Bunt", size: "Klein", materials: ["Perlen", "Glas"], image: beads,
  },
  {
    title: "Stoffreste gemustert", description: "Baumwollstücke in vielen Mustern. Ideal zum Patchworken und Applizieren.",
    category: "Stoff & Nähen", type: "Angebot", place: "München", postalCode: "80331", distanceKm: 38,
    condition: "Wie neu", offerKind: "Tauschen", delivery: ["Selbstabholung", "Versand"], level: "Mit Vorwissen",
    color: "Bunt", size: "Groß", materials: ["Stoff", "Textil"], image: fabric,
  },
  {
    title: "Stricknadel-Sammlung", description: "Rund- und Jackennadeln aus Holz in verschiedenen Stärken.",
    category: "Handarbeit", type: "Gesuch", place: "Dresden", postalCode: "01067", distanceKm: 62,
    condition: "Starke Gebrauchsspuren", offerKind: "Gesuch", delivery: ["Versand"], level: "Professionell",
    color: "Natur", size: "Klein", materials: ["Werkzeug", "Holz", "Metall"], image: needles,
  },
  {
    title: "Bänder & Borten", description: "Eine farbenfrohe Mischung für Kleidung, Geschenke und Collagen.",
    category: "Handwerken", type: "Angebot", place: "Mainz", postalCode: "55116", distanceKm: 15,
    condition: "Neu", offerKind: "Verkauf", delivery: ["Versand"], level: "Anfänger*in",
    color: "Bunt", size: "Mittel", materials: ["Textil", "Stoff"], image: ribbons,
  },
];

export type CommunityProject = {
  title: string;
  maker: string;
  tag: string;
  image: string;
  likes: number;
  materials: string;
};

export const communityProjects: CommunityProject[] = [
  { title: "TUFTING FÜR DIE WAND", maker: "MILA · KÖLN", tag: "HANDARBEIT", image: tufting, likes: 128, materials: "Garn, Tuftinggun, Trägerstoff" },
  { title: "BEMALTER PFLANZTOPF", maker: "SASKIA · LEIPZIG", tag: "MALEN", image: ceramics, likes: 94, materials: "Acrylfarbe, Pinsel, Terrakotta" },
  { title: "PATCHWORK-TASCHE", maker: "AYLIN · HAMBURG", tag: "STOFF & NÄHEN", image: patchwork, likes: 211, materials: "Stoffreste, Garn, Nähmaschine" },
  { title: "GLASPERLEN-KETTE", maker: "NOAH · MAINZ", tag: "SCHMUCK", image: projectBeads, likes: 76, materials: "Glasperlen, Schmuckdraht, Zange" },
];
