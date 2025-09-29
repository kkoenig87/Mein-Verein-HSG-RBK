const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Deine VAPID-Keys
const publicVapidKey = "BAQc0wAaqIdZzFXjAKVPNXdFU_NllJAmJADLlutUJw7SwP9i2mYqylvdm8rQ6LrugfZ9nDgcstE2oycI3oHscnM";
const privateVapidKey = "9LfQ1GaUiQI9dqd7utJkrIbXrf1gonnWfblyccp25vs";

webpush.setVapidDetails(
  "mailto:deineMail@example.com",
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];

// Client kann sich registrieren
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// Test-Notification an alle schicken
app.post("/sendNotification", async (req, res) => {
  const payload = JSON.stringify({ title: "🔥 HSG RBK", body: "Test-Push läuft!" });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
  });

  res.json({ message: "Notifications sent" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Push-Server läuft auf Port ${port}`));
