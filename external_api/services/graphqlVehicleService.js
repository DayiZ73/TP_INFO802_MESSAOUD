const axios = require('axios');
const GRAPHQL_VEHICLES_URL = process.env.GRAPHQL_VEHICLES_URL;

async function getVehiclesFromGraphQL() {
  // Ici, on suppose que l’endpoint "GET /api/vehicles" renvoie un tableau de véhicules
  try {
    const response = await axios.get(GRAPHQL_VEHICLES_URL);
    return response.data; // un tableau
  } catch (error) {
    console.error('Erreur graphqlVehicleService:', error.message);
    throw new Error('Impossible de récupérer la liste des véhicules (GraphQL).');
  }
}

module.exports = {
  getVehiclesFromGraphQL
};
