const axios = require('axios');

async function getChargingStationsNearby(lat, lon, radius) {
  const baseUrl = process.env.IRVE_API_BASE_URL;
  const dataset = process.env.IRVE_DATASET || 'bornes-irve';
  const rows = 5; // Nombre de résultats à afficher

  const url = `${baseUrl}/?dataset=${dataset}&rows=${rows}&geofilter.distance=${lat},${lon},${radius}`;

  try {
    const response = await axios.get(url);
    // On récupère directement les enregistrements
    const records = response.data.records || [];

    const chargingStations = response.data.records.map((record) => {
        const fields = record.fields;
  
        return {
          id: fields.id_station || 'Unknown ID', // ID de la station
          name: fields.n_station || 'Unknown Station', // Nom de la station
          operator: fields.n_operateur || 'Unknown Operator', // Nom de l'opérateur
          accessibility: fields.accessibilite || 'Unknown Accessibility', // Accessibilité
          address: fields.ad_station || 'Unknown Address', // Adresse
          city: fields.n_enseigne || 'Unknown City', // Ville ou enseigne
          region: fields.region || 'Unknown Region', // Région
          latitude: fields.ylatitude || null, // Latitude
          longitude: fields.xlongitude || null, // Longitude
          charging_type: fields.type_prise || 'Unknown', 
          power_max: fields.puiss_max || 'Unknown', 
          distance: fields.dist ? `${parseFloat(fields.dist).toFixed(2)} m` : 'Unknown Distance', 
        };
      });
  
      return chargingStations;
  } catch (error) {
    console.error('Erreur lors de la récupération des bornes :', error);
    throw new Error('Impossible de récupérer les données IRVE');
  }
}

module.exports = {
  getChargingStationsNearby
};
