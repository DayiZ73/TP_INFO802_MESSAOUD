require('dotenv').config();
const express = require('express');
const path = require('path');
const externalApiRouter = require('./routes/externalApi');
const setupSwagger = require('./swagger');

const app = express();
app.use(express.json());

// (Optionnel) Servir un dossier public si besoin
app.use(express.static(path.join(__dirname, 'public')));

// Monter le router
app.use('/api', externalApiRouter);

// Configurer Swagger
setupSwagger(app);

const port = process.env.PORT || 9100;
app.listen(port, () => {
  console.log(`External API server démarré sur le port ${port}`);
});
