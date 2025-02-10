const axios = require('axios');

async function getCoordinates(cityName) {
  const apiUrl = process.env.GEOCODE_API_URL;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        q: cityName,
        format: 'json',
        limit: 1,
      },
    });

    if (response.data.length === 0) {
      throw new Error(`Impossible de trouver la ville : ${cityName}`);
    }

    // Retourner les coordonnées (latitude et longitude)
    const { lat, lon } = response.data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  } catch (error) {
    console.error(`Erreur lors du géocodage de "${cityName}" :`, error.message);
    throw new Error(`Échec du géocodage pour la ville : ${cityName}`);
  }
}

module.exports = { getCoordinates };
