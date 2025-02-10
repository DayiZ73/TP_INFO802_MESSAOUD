const axios = require('axios');

async function getVehicles(page,size,search) {
  const endpoint = process.env.GRAPHQL_ENDPOINT;
  const apiKey = process.env.CHARGETRIP_API_KEY;
  const clientKey = process.env.CHARGETRIP_CLIENT_KEY;

  if (!endpoint || !apiKey) {
    throw new Error('Veuillez définir GRAPHQL_ENDPOINT et CHARGETRIP_API_KEY dans le fichier .env');
  }

  // Requête GraphQL
  const query = `query vehicleList($page: Int, $size: Int, $search: String) {
    vehicleList(
      page: $page,
      size: $size,
      search: $search,
    ) {
      id
      naming {
        make
        model
        chargetrip_version
      }
      media {
        image {
          thumbnail_url
        }
      }
      battery {
        usable_kwh
      }
      range {
        chargetrip_range {
          best
          worst
        }
      }
    }
  }`;

  const variables = {
    page,
    size, 
    search,
  };

  try {
    const response = await axios.post(
      endpoint,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientKey,
          'x-app-id': apiKey,
        },
      }
    );
    
    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      throw new Error('La requête GraphQL a retourné des erreurs.');
    }
  
    const { data } = response.data;
    return data.vehicleList; // Tableau de véhicules
  } catch (error) {
    console.error('Erreur lors de la requête GraphQL :', error.message);
    if (error.response) {
      console.error('Détails de la réponse :', error.response.data);
    }
    throw new Error('Impossible de récupérer la liste des véhicules.');
  }  
}

module.exports = { getVehicles };
