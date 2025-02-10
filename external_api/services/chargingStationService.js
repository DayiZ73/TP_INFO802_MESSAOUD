const axios = require('axios');
const CHARGING_STATIONS_URL = process.env.CHARGING_STATIONS_URL;

async function getChargingStations(lat, lon, radius) {
  try {
    // Ex: GET http://localhost:3003/api/charging-stations?lat=...&lon=...&radius=...
    const url = `${CHARGING_STATIONS_URL}?lat=${lat}&lon=${lon}&radius=${radius}`;
    const response = await axios.get(url);
    // On suppose que ça renvoie { stations: [...] }
    return response.data.stations || [];
  } catch (error) {
    console.error('Erreur chargingStationService:', error.message);
    throw new Error('Impossible de récupérer les bornes IRVE');
  }
}

module.exports = { getChargingStations };
