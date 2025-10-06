const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Proxy /playbook -> dein externes Playbook-Repo (Render)
app.use('/playbook', createProxyMiddleware({
  target: 'https://hsg-playbook-render.onrender.com',
  changeOrigin: true,
  pathRewrite: { '^/playbook': '' }, // /playbook/foo -> /foo on target
  secure: true
}));

// 2) Serve existing static files from repo root (index.html, assets...)
app.use(express.static(path.join(__dirname)));

// 3) Fallback (optional) - SPA fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// === WEB PUSH (unverändert) ===
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
  subscriptions.forEach(sub =>
    webpush.sendNotification(sub, payload).catch(console.error)
  );
  res.status(200).json({ message: 'Push gesendet!' });
});

// === PLAYBOOK API ===
const apiDir = path.join(__dirname, 'api');
const playsFile = path.join(apiDir, 'plays.json');

function ensureFile() {
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
  if (!fs.existsSync(playsFile)) fs.writeFileSync(playsFile, '[]', 'utf8');
}

// GET alle Spielzüge
app.get('/api/plays', (req, res) => {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

// POST neuen Spielzug
app.post('/api/plays', (req, res) => {
  ensureFile();
  try {
    const newPlay = req.body.play;
    const plays = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    plays.push(newPlay);
    fs.writeFileSync(playsFile, JSON.stringify(plays, null, 2), 'utf8');
    console.log('Neuer Spielzug gespeichert:', newPlay.title);
    res.json({ success: true, plays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// DELETE Spielzug per Index
app.delete('/api/plays/:id', (req, res) => {
  ensureFile();
  try {
    const id = parseInt(req.params.id);
    const plays = JSON.parse(fs.readFileSync(playsFile, 'utf8'));
    if (id >= 0 && id < plays.length) {
      const removed = plays.splice(id, 1);
      console.log('Gelöschter Spielzug:', removed[0]?.title);
      fs.writeFileSync(playsFile, JSON.stringify(plays, null, 2), 'utf8');
      res.json({ success: true, plays });
    } else {
      res.status(404).json({ error: 'Index ungültig' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// Root auf playbook.html leiten
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'playbook.html'));
});

app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));