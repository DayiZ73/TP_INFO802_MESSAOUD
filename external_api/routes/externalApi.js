const express = require('express');
const router = express.Router();
const polyline = require('@mapbox/polyline');

// Services
const { getVehiclesFromGraphQL } = require('../services/graphqlVehicleService');
const { getRouteFromCartography } = require('../services/cartographyService');
const { getChargingStations } = require('../services/chargingStationService');
const { getSoapTravelCalculation } = require('../services/soapService');

// Fonction utilitaire (Haversine)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Récupération de la liste des véhicules (GraphQL)
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Liste tous les véhicules depuis l’API GraphQL
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Tableau de véhicules
 *       500:
 *         description: Erreur serveur
 */
// ------------------
// GET /api/vehicles
// => Liste des véhicules (appelle GraphQL)
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await getVehiclesFromGraphQL();
    return res.json(vehicles);
  } catch (error) {
    console.error('Erreur GET /vehicles:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: ChargingStations
 *   description: Récupération des bornes de recharge
 */

/**
 * @swagger
 * /api/charging-stations:
 *   get:
 *     summary: Récupère les bornes de recharge dans un rayon
 *     tags: [ChargingStations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: true
 *         description: Rayon de recherche en mètres
 *     responses:
 *       200:
 *         description: Tableau de stations
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
// ------------------
// GET /api/charging-stations?lat=...&lon=...&radius=...
// => Récupère TOUTES les bornes dans un rayon
router.get('/charging-stations', async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;
    if (!lat || !lon || !radius) {
      return res.status(400).json({
        error: 'Paramètres requis : lat, lon, radius'
      });
    }
    const stations = await getChargingStations(lat, lon, radius);
    return res.json({ stations });
  } catch (error) {
    console.error('Erreur GET /charging-stations:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: PlanRoute
 *   description: Calcul d’un itinéraire complet
 */

/**
 * @swagger
 * /api/plan-route:
 *   post:
 *     summary: Calcule un itinéraire (cartographie) + stations IRVE + SOAP
 *     tags: [PlanRoute]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startCity:
 *                 type: string
 *               endCity:
 *                 type: string
 *               vehicleRange:
 *                 type: number
 *     responses:
 *       200:
 *         description: Détails du trajet + stations
 *       400:
 *         description: Mauvaise requête
 *       500:
 *         description: Erreur serveur
 */
// ------------------
// POST /api/plan-route
// Body: { startCity, endCity, vehicleRange }
router.post('/plan-route', async (req, res) => {
  try {
    const { startCity, endCity, vehicleRange } = req.body;
    if (!startCity || !endCity || !vehicleRange) {
      return res.status(400).json({
        error: 'startCity, endCity, vehicleRange requis.'
      });
    }

    const { route, startCoords, endCoords } = await getRouteFromCartography(startCity, endCity);

    const encodedPolyline = route.routes[0].geometry;
    const decodedCoords = polyline.decode(encodedPolyline);

    const autonomy = parseFloat(vehicleRange);
    if (isNaN(autonomy) || autonomy <= 10) {
      return res.status(400).json({ error: 'vehicleRange doit être > 10' });
    }

    const distanceInterval = autonomy - 10;
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

    return res.json({
      route,
      startCoords,
      endCoords,
      travelResult,
      stationsAlongRoute
    });
  } catch (error) {
    console.error('Erreur POST /plan-route:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: SoapCalc
 *   description: Calcul de temps/cout via SOAP
 */

/**
 * @swagger
 * /api/travel-calculation:
 *   post:
 *     summary: Calcule temps et coût via le service SOAP
 *     tags: [SoapCalc]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               distance:
 *                 type: number
 *               speed:
 *                 type: number
 *               autonomy:
 *                 type: number
 *               chargeTime:
 *                 type: number
 *               costPerKm:
 *                 type: number
 *     responses:
 *       200:
 *         description: Temps, coût et nb de charges
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
// ------------------
// POST /api/travel-calculation
// Body: { distance, speed, autonomy, chargeTime, costPerKm }
router.post('/travel-calculation', async (req, res) => {
  try {
    const { distance, speed, autonomy, chargeTime, costPerKm } = req.body;
    if (!distance || !speed || !autonomy || !chargeTime || !costPerKm) {
      return res.status(400).json({
        error: 'Les paramètres distance, speed, autonomy, chargeTime et costPerKm sont requis.'
      });
    }
    const soapResult = await getSoapTravelCalculation(
      parseFloat(distance),
      parseFloat(speed),
      parseFloat(autonomy),
      parseInt(chargeTime, 10),
      parseFloat(costPerKm)
    );
    return res.json(soapResult);
  } catch (error) {
    console.error('Erreur POST /travel-calculation:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
