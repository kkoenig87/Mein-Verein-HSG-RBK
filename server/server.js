const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ---------------------------
// VAPID Keys für Push
// ---------------------------
const publicVapidKey = "BAQc0wAaqIdZzFXjAKVPNXdFU_NllJAmJADLlutUJw7SwP9i2mYqylvdm8rQ6LrugfZ9nDgcstE2oycI3oHscnM";
const privateVapidKey = "9LfQ1GaUiQI9dqd7utJkrIbXrf1gonnWfblyccp25vs";

webpush.setVapidDetails(
  "mailto:deineMail@example.com",
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];

// ---------------------------
// Push Subscription
// ---------------------------
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.post("/sendNotification", async (req, res) => {
  const payload = JSON.stringify({ 
    title: "🔥 HSG RBK", 
    body: "Test-Push läuft!" 
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
  });

  res.json({ message: "Notifications sent" });
});

// ---------------------------
// Bestellung (Phase 3A + C)
// ---------------------------
let orders = [];

app.post("/order", (req, res) => {
  const order = req.body;
  orders.push(order);

  // Mail verschicken
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "DEINE_GMAIL@adresse.com",
      pass: "DEIN_APP_PASSWORT" // App-Passwort aus Google Account
    }
  });

  const mailOptions = {
    from: "DEINE_GMAIL@adresse.com",
    to: "kaiuwe.koenig@web.de",
    subject: `🛒 Neue Fanartikel-Bestellung (${order.name})`,
    text: `
Neue Bestellung im Fanshop:

Name: ${order.name}
Adresse: ${order.address}
Telefon: ${order.phone}
E-Mail: ${order.email}
Versand: ${order.shipping}
Produkte: ${order.items.map(i => `${i.name} (${i.size || "-"}) x${i.qty} - ${i.price} €`).join("\n")}
Gesamtsumme: ${order.total} €
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Bestellung gespeichert, aber Mail nicht gesendet" });
    } else {
      console.log("E-Mail gesendet: " + info.response);
      res.status(201).json({ message: "Bestellung erfolgreich gespeichert & Mail verschickt" });
    }
  });
});

// ---------------------------
// Server Start
// ---------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
