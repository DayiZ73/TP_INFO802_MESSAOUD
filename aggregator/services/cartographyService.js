const axios = require('axios');
const CARTOGRAPHY_URL = process.env.CARTOGRAPHY_URL;

async function getRouteFromCartography(startCity, endCity) {
  try {
    const response = await axios.post(CARTOGRAPHY_URL, {
      startCity,
      endCity,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur cartographyService:', error.message);
    throw new Error('Impossible de récupérer le trajet depuis rest_cartography');
  }
}

module.exports = { getRouteFromCartography };
