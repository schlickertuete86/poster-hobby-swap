# Inserat-Formular überarbeiten (5 Punkte aus dem Briefing)

## 1. Angebotsart aufteilen, "Verkauf" entfernen
- "Angebotsart" wird ersetzt durch zwei Pflichtfelder:
  - **Umfang***: Set | Einzelteil(e)
  - **Weitergabe als***: Verschenken | Tauschen
- "Verkauf" und "Gesuch" als Angebotsart verschwinden überall (Formular, Filter auf der Materialbörse, Karten-Tags, Projektfinder).
- Beispieldaten angepasst: "Bänder & Borten" → Verschenken; alle sechs Beispiel-Inserate erhalten sinnvolle Werte für Umfang und Weitergabe.
- Der Filterbereich der Materialbörse bekommt statt "Angebotsart" die zwei Gruppen "Umfang" und "Weitergabe als".

## 2. Übergabe nur einmal
- "Übergabe" wird aus Abschnitt 04 entfernt und steht nur noch in 05 "Ort & Übergabe" (Pflicht, Mehrfachauswahl).

## 3. Verzweigung Angebot / Gesuch
- **Angebot**: 1–5 Fotos Pflicht, "Zustand*" Pflicht (Einfachauswahl), Texte aus Geber-Sicht ("Was möchtest du weitergeben?"), Button "Angebot veröffentlichen".
- **Gesuch**: Foto optional ("Beispielbild"), "Akzeptierter Zustand" optional als Mehrfachauswahl, Texte aus Sucher-Sicht ("Was suchst du?"), Button "Gesuch veröffentlichen".
- Beim Wechsel bleiben gemeinsame Eingaben erhalten.

## 4. Pflichtfelder reduzieren
- Pflicht: Typ, Titel, Hobby-Kategorie, Umfang, Weitergabe als, Übergabe, PLZ (+ bei Angebot Foto und Zustand).
- Optional: Beschreibung, Level, Farbe, Größe, Material-Tags, Hinweise (Auswahlfelder erhalten eine leere Option "Keine Angabe").
- Pflichtfelder einheitlich mit * markiert.
- Kopfzeile zeigt Fortschritt live: "5 VON 8 PFLICHTFELDERN" (Gesamtzahl passt sich an Angebot/Gesuch an).

## 5. Validierung und Fehlerzustände
- Button immer klickbar; beim Klick scrollt die Seite zum ersten fehlenden Pflichtfeld, markiert es (Rahmen in Akzentfarbe) und zeigt eine konkrete Meldung darunter. Fehler verschwinden, sobald das Feld korrigiert wird.
- PLZ: genau 5 Ziffern; der Ort wird automatisch über einen kostenlosen öffentlichen PLZ-Dienst ausgefüllt, bleibt aber manuell änderbar (bei fehlendem Treffer einfach selbst eintragen).
- Foto-Upload: Mehrfachauswahl bis 5 Bilder, Vorschau-Raster mit Entfernen-Knopf pro Bild; falsches Format oder > 8 MB → Meldung direkt am Upload-Feld.
- Titel max. 60, Beschreibung max. 500 Zeichen, jeweils mit Zähler "23 / 60".

## Technische Details
- `catalog.ts`: `offerKinds` ersetzt durch `scopes` und `handoverModes`; Listing-Typ um `scope`, `handover`, `acceptedConditions?`, `images[]` erweitert (Karte zeigt erstes Bild, Gesuch ohne Bild bekommt eine grafische Platzhalterfläche).
- `inserat-neu.tsx`: Validierungsfunktion liefert Fehler-Map pro Feld; Refs pro Feld für `scrollIntoView` + Fokus; Fortschritt aus derselben Map berechnet.
- PLZ-Lookup clientseitig per fetch auf openplzapi.org, mit Abbruch bei erneuter Eingabe.
- `index.tsx`, Projektfinder-Suche und die ungenutzte Server-Datei `listings.functions.ts` auf die neuen Felder angepasst.
- Speicherung bleibt Prototyp-Mock (nur im Browser, weg nach Neuladen). Prüfung per Playwright auf Desktop und Mobil.
