# Mein Verein HSG RBK — Starter PWA

Dies ist die Startvorlage für die Progressive Web App des Vereines **HSG Rüsselsheim / Bauschheim / Königstädten**.

## Inhalt

- `index.html` — Hauptseite mit Navigation: Mannschaften, Veranstaltungen, Spielplan
- `calendar.html` — separater Spielplan-Widget
- `manifest.json` — PWA Manifest
- `service-worker.js` — Offline Cache & Netzwerk‑Fallback
- `offline.html` — Offline‑Fehlermeldung
- `icons/` — Platzhalter Icons (192x192, 512x512, apple‑touch‑icon)

## Wie starten

1. Dateien klonen oder herunterladen  
2. Lokalen Server starten (z. B. `python3 -m http.server 8000`)  
3. `http://localhost:8000/index.html` im Browser öffnen  
4. Service Worker prüfen (DevTools → Application → Service Workers)  
5. Deployment z. B. via GitHub Pages oder Netlify

## Deployment

Siehe GitHub Docs: Repository → Settings → Pages → Source: main branch / root → speichern  
Netlify: neues Projekt → Git Repo verbinden → Build & Deploy (für static Seiten keine “build step” nötig)

## Weitere To‑Dos

- Inhalte (Teams, Events) dynamisch machen (z. B. JSON, Google Sheets, Firebase)  
- Logo durch das Vereinslogo ersetzen  
- Styling verbessern  
- Zugriffsschutz eventuell hinzufügen  

---

Viel Erfolg & meld dich, wenn du an einem Schritt festhängst 😊