require('dotenv').config();
const express = require('express');
const path = require('path');
const vehiclesRouter = require('./routes/vehicles');

const app = express();

// Middlewares
app.use(express.json());

// Servir les fichiers statiques du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Routage pour /api/vehicles
app.use('/api/vehicles', vehiclesRouter);

// Lancer le serveur
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
