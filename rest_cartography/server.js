require('dotenv').config();
const express = require('express');
const path = require('path');
const trajetRouter = require('./routes/trajet.js');

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes pour les trajets
app.use('/api/trajet', trajetRouter);

// Lancer le serveur
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
