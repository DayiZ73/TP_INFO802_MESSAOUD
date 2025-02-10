const express = require('express');
const router = express.Router();
const { getCoordinates } = require('../services/geocodeService');
const { getTrajet } = require('../services/trajetService');

router.post('/route', async (req, res) => {
  const { startCity, endCity } = req.body;

  if (!startCity || !endCity) {
    return res.status(400).json({
      error: 'Veuillez fournir les noms des villes de départ et d’arrivée.',
    });
  }

  try {
    // Convertir les noms des villes en coordonnées
    const startCoords = await getCoordinates(startCity);
    const endCoords = await getCoordinates(endCity);

    console.log(`Départ : ${startCity} -> Coordonnées :`, startCoords);
    console.log(`Arrivée : ${endCity} -> Coordonnées :`, endCoords);

    // Appeler le service pour calculer l’itinéraire
    const route = await getTrajet([
      [startCoords.lon, startCoords.lat],
      [endCoords.lon, endCoords.lat],
    ]);

    // Inclure les coordonnées de départ et d’arrivée dans la réponse
    res.json({
      route,
      startCoords,
      endCoords,
    });
  } catch (error) {
    console.error('Erreur lors de la requête /route :', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
