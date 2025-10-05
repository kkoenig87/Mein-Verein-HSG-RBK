const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());

// --- WEBPUSH CONFIG ---
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

// --- SPIELZUG API ---
const apiDir = path.join(__dirname, 'api');
const playsFile = path.join(apiDir, 'plays.json');

function ensurePlaysFile() {
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
  if (!fs.existsSync(playsFile)) fs.writeFileSync(playsFile, '[]', 'utf8');
}

// API: GET alle Spielzüge
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

// API: POST neuen Spielzug hinzufügen
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

// API: DELETE Spielzug per Index
app.delete('/api/plays/:id', (req, res) => {
  try {
    ensurePlaysFile();
    let plays = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    const id = parseInt(req.params.id);
    if (!isNaN(id) && id >= 0 && id < plays.length) plays.splice(id, 1);
    fs.writeFileSync(playsFile, JSON.stringify(plays, null, 2), 'utf8');
    res.json({ success: true, plays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// --- STATIC FILES ---
app.use(express.static(__dirname));

// Root → playbook.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'playbook.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
