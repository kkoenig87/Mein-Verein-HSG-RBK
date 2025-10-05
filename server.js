const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// --- WEBPUSH CONFIG ---
const subscriptions = [];
webpush.setVapidDetails(
  'mailto:123derkai@web.de',
  'BAQc0wAaqIdZzFXjAKVPNXdFU_NllJAmJADLlutUJw7SwP9i2mYqylvdm8rQ6LrugfZ9nDgcstE2oycI3oHscnM',
  '9LfQ1GaUiQI9dqd7utJkrIbXrf1gonnWfblyccp25vs'
);

app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  console.log('Neue Subscription:', req.body);
  res.status(201).json({});
});

app.post('/send-notification', (req, res) => {
  const payload = JSON.stringify(req.body);
  subscriptions.forEach(sub => webpush.sendNotification(sub, payload).catch(console.error));
  res.status(200).json({ message: 'Push gesendet!' });
});

// --- SPIELZUG API ---
const apiDir = path.join(__dirname, 'api');
const playsFile = path.join(apiDir, 'plays.json');

function ensurePlaysFile() {
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
  if (!fs.existsSync(playsFile)) fs.writeFileSync(playsFile, '[]', 'utf8');
}

// GET
app.get('/api/plays', (req, res) => {
  ensurePlaysFile();
  try {
    const data = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error('Fehler beim Lesen:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Spielzüge' });
  }
});

// POST
app.post('/api/plays', (req, res) => {
  ensurePlaysFile();
  try {
    const newPlay = req.body.play;
    const data = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    data.push(newPlay);
    fs.writeFileSync(playsFile, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, plays: data });
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// DELETE
app.delete('/api/plays/:id', (
