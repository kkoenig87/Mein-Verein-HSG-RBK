const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// --- Push Notifications ---
const subscriptions = [];
webpush.setVapidDetails(
  'mailto:123derkai@web.de',
  'BAQc0wAaqIdZzFXjAKVPNXdFU_NllJAmJADLlutUJw7SwP9i2mYqylvdm8rQ6LrugfZ9nDgcstE2oycI3oHscnM',
  '9LfQ1GaUiQI9dqd7utJkrIbXrf1gonnWfblyccp25vs'
);
app.post('/subscribe', (req, res) => { subscriptions.push(req.body); res.status(201).json({}); });
app.post('/send-notification', (req, res) => {
  const { title, body } = req.body;
  subscriptions.forEach(sub => webpush.sendNotification(sub, JSON.stringify({ title, body })).catch(console.error));
  res.json({ message: 'Push gesendet!' });
});

// --- API für Playbook ---
const apiDir = path.join(__dirname, 'api');
const playsFile = path.join(apiDir, 'plays.json');

function ensurePlaysFile() {
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
  if (!fs.existsSync(playsFile)) fs.writeFileSync(playsFile, '[]', 'utf8');
}

// GET alle Spielzüge
app.get('/api/plays', (req, res) => {
  try {
    ensurePlaysFile();
    const data = fs.readFileSync(playsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Laden der Spielzüge' });
  }
});

// POST neuen Spielzug hinzufügen
app.post('/api/plays', (req, res) => {
  try {
    ensurePlaysFile();
    const body = req.body;
    let current = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    if (body.play) current.push(body.play);
    fs.writeFileSync(playsFile, JSON.stringify(current, null, 2), 'utf8');
    res.json({ success: true, plays: current });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// Statische Auslieferung
app.use(express.static(__dirname));

// Root → playbook.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'playbook.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
