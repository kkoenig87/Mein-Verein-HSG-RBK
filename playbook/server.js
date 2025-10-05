const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Dateien lesen/schreiben erlauben
app.use(express.json());

// Statische Dateien (Frontend)
app.use(express.static(__dirname));

// Pfad zur JSON-Datei
const playsFile = path.join(__dirname, "api", "plays.json");

// Spielzüge laden
app.get("/api/plays", (req, res) => {
  try {
    if (!fs.existsSync(playsFile)) {
      fs.writeFileSync(playsFile, "[]");
    }
    const data = fs.readFileSync(playsFile, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Fehler beim Laden:", err);
    res.status(500).json({ error: "Fehler beim Laden der Spielzüge" });
  }
});

// Spielzüge speichern (vom Admin)
app.post("/api/plays", (req, res) => {
  try {
    fs.writeFileSync(playsFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
    res.status(500).json({ error: "Fehler beim Speichern der Spielzüge" });
  }
});

// Standardseite
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "playbook.html"));
});

app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));
