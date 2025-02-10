const express = require('express');
const router = express.Router();
const { getChargingStationsNearby } = require('../services/chargingStationService');

// GET /api/charging-stations?lat=45.0&lon=5.0&radius=2000
router.get('/', async (req, res) => {
  const { lat, lon, radius } = req.query;

  // Vérification basique des paramètres
  if (!lat || !lon || !radius) {
    return res.status(400).json({
      error: 'Veuillez fournir lat, lon et radius en paramètres de requête.'
    });
  }

  try {
    const stations = await getChargingStationsNearby(lat, lon, radius);
    res.json({
      count: stations.length,
      stations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
