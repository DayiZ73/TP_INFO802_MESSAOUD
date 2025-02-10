const axios = require('axios');
const CARTOGRAPHY_URL = process.env.CARTOGRAPHY_URL;

/**
 * getRouteFromCartography:
 *    Appelle la route "POST /api/trajet/route" du service rest_cartography
 *    avec { startCity, endCity }.
 */
async function getRouteFromCartography(startCity, endCity) {
  try {
    const response = await axios.post(CARTOGRAPHY_URL, {
      startCity,
      endCity
    });
    return response.data; 
    // On suppose que ça renvoie { route, startCoords, endCoords }
  } catch (error) {
    console.error('Erreur cartographyService:', error.message);
    throw new Error('Impossible de récupérer le trajet depuis rest_cartography');
  }
}

module.exports = {
  getRouteFromCartography
};
