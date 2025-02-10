require('dotenv').config();
const express = require('express');
const path = require('path');
const aggregatorRouter = require('./routes/aggregator');

const app = express();
app.use(express.json());

// Servir le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Routes aggregator
app.use('/api', aggregatorRouter);

// Lancer le serveur aggregator
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Aggregator server démarré sur le port ${port}`);
});
