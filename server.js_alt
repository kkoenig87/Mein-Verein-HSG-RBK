const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());

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

app.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));
