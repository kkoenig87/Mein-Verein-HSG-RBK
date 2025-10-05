const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'coach2025!';

// === Grundkonfiguration ===
app.use(bodyParser.json());
app.use(express.json());

// ===========================
// 🔔 PUSH NOTIFICATION TEIL
// ===========================
const subscriptions = [];

webpush.setVapidDetails(
  'mailto:123derkai@web.de',
  'BAQc0wAaqIdZzFXjAKVPNXdFU_NllJAmJADLlutUJw7SwP9i2mYqylvdm8rQ6LrugfZ9nDgcstE2oycI3oHscnM',
  '9LfQ1GaUiQI9dqd7utJkrIbXrf1gonnWfblyccp25vs'
);

// Subscription speichern
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Neue Subscription:', subscription);
  res.status(201).json({});
});

// Push senden
app.post('/send-notification', (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
  });

  res.status(200).json({ message: 'Push gesendet!' });
});

// ===========================
// 🧠 PLAYBOOK TEIL
// ===========================

// Verzeichnisstruktur
const playbookDir = path.join(__dirname, 'playbook');
const apiDir = path.join(playbookDir, 'api');
const playsFile = path.join(apiDir, 'plays.json');

// Sicherstellen, dass Datei existiert
function ensurePlaysFile() {
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  if (!fs.existsSync(playsFile)) fs.writeFileSync(playsFile, '[]', 'utf8');
}

// Statische Dateien ausliefern (Frontend)
app.use('/playbook', express.static(playbookDir));
app.use('/playbook/api', express.static(apiDir));

// === API: GET (alle Spielzüge) ===
app.get('/playbook/api/plays', (req, res) => {
  try {
    ensurePlaysFile();
    const data = fs.readFileSync(playsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Fehler beim GET /playbook/api/plays:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Spielzüge' });
  }
});

// === API: POST (neuer Spielzug oder gesamte Liste speichern) ===
app.post('/playbook/api/plays', (req, res) => {
  try {
    ensurePlaysFile();
    const body = req.body;
    const password = body.password || null;

    if (password !== ADMIN_PW) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let current = JSON.parse(fs.readFileSync(playsFile, 'utf8'));

    if (body.play) {
      // Einzelnen Spielzug hinzufügen
      current.push(body.play);
    } else if (Array.isArray(body.plays)) {
      // Komplette Liste überschreiben
      current = body.plays;
    }

    fs.writeFileSync(playsFile, JSON.stringi
