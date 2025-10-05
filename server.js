const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// --- WEBPUSH KONFIGURATION ---
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
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  if (!fs.existsSync(playsFile)) fs.writeFileSync(playsFile, '[]', 'utf8');
}

// Spielzüge laden
app.get('/api/plays', (req, res) => {
  try {
    ensurePlaysFile();
    const data = fs.readFileSync(playsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Fehler beim Laden der Spielzüge:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Spielzüge' });
  }
});

// Spielzug speichern
app.post('/api/plays', (req, res) => {
  try {
    ensurePlaysFile();
    const { play } = req.body;
    let plays = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    if (play) plays.push(play);
    fs.writeFileSync(playsFile, JSON.stringify(plays, null, 2), 'utf8');
    res.json({ success: tru
