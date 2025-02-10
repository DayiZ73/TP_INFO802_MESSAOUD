const express = require('express');
const router = express.Router();
const polyline = require('@mapbox/polyline');
const { getRouteFromCartography } = require('../services/cartographyService');
const { getVehiclesFromGraphQL } = require('../services/graphqlVehicleService');
const { getChargingStations } = require('../services/chargingStationService');
const { getSoapTravelCalculation } = require('../services/soapService');

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon moyen de la Terre, en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance en km
}

// GET /api/vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await getVehiclesFromGraphQL();
    res.status(200).json(vehicles);
  } catch (err) {
    console.error('Erreur GET /api/vehicles:', err.message);
    res.status(500).json({ error: 'Impossible de récupérer les véhicules' });
  }
});

// POST /api/route
router.post('/route', async (req, res) => {
  try {
    const { startCity, endCity, vehicleRange } = req.body;
    if (!startCity || !endCity) {
      return res.status(400).json({ error: 'startCity et endCity sont requis.' });
    }

    const autonomy = parseFloat(vehicleRange);
    if (isNaN(autonomy) || autonomy <= 10) {
      return res.status(400).json({ error: 'L\'autonomie du véhicule doit être un nombre supérieur à 10 km.' });
    }

    // Appel service cartography => { route, startCoords, endCoords }
    const { route, startCoords, endCoords } = await getRouteFromCartography(startCity, endCity);

    const encodedPolyline = route.routes[0].geometry;
    const decodedCoords = polyline.decode(encodedPolyline);

    const distanceInterval = autonomy - 10; // km
    let currentDistance = 0;
    let lastStopDistance = 0;

    const stationsAlongRoute = [];

    for (let i = 0; i < decodedCoords.length - 1; i++) {
      const [lat1, lon1] = decodedCoords[i];
      const [lat2, lon2] = decodedCoords[i + 1];
      const segDist = haversineDistance(lat1, lon1, lat2, lon2);
      currentDistance += segDist;

      if (currentDistance - lastStopDistance >= distanceInterval) {
        let radius = 3000;
        let stations = await getChargingStations(lat2, lon2, radius);
        while (stations.length === 0 && radius < 10000) {
          radius += 1000;
          stations = await getChargingStations(lat2, lon2, radius);
        }
        if (stations.length > 0) {
          stations.sort((a, b) => {
            const distA = parseFloat(a.distance) || Infinity;
            const distB = parseFloat(b.distance) || Infinity;
            return distA - distB;
          });
          const nearestStation = stations[0];

          stationsAlongRoute.push({
            lat: lat2,
            lon: lon2,
            station: nearestStation,
          });
        }
        lastStopDistance = currentDistance;
      }
    }

    const distanceKm = route.routes[0].summary.distance / 1000;

    const speed = 90;         // km/h
    const chargeTime = 60;    // minutes (pour une recharge complète)
    const costPerKm = 0.23;   // euros par km
    const autonomyUsed = parseFloat(vehicleRange); // ou un autre champ

    const soapResult = await getSoapTravelCalculation(
      distanceKm,
      speed,
      autonomyUsed,
      chargeTime,
      costPerKm
    );
        
    const travelResult = {
      time: soapResult.time,
      cost: soapResult.cost
    };

    res.json({
      route,
      startCoords,
      endCoords,
      travelResult,
      stationsAlongRoute
    });
  } catch (err) {
    console.error('Erreur POST /api/route:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;