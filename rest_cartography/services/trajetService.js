const axios = require('axios');

async function getTrajet(coordinates) {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    throw new Error('Clé API OpenRouteService manquante dans .env');
  }

  const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  try {
    const response = await axios.post(
      apiUrl,
      { coordinates },
      {
        headers: {
          Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: apiKey,
        },
      }
    );

    // Retourner les données de l'itinéraire
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l’itinéraire :', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    throw new Error('Impossible de récupérer l’itinéraire. Vérifiez les paramètres et la clé API.');
  }
}

module.exports = { getTrajet };
