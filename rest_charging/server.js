require('dotenv').config();
const express = require('express');
const chargingStationsRouter = require('./routes/chargingStations');

const app = express();

// Middleware JSON
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('public'));

// Routage des stations de recharge
app.use('/api/charging-stations', chargingStationsRouter);

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
