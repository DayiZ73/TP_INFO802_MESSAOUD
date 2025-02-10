const express = require('express');
const router = express.Router();
const { getVehicles } = require('../services/vehiclesService');

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await getVehicles(0,20,"");
    res.json(vehicles);
  } catch (error) {
    console.error('Erreur /api/vehicles :', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
