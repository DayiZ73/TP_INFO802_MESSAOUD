const soap = require('soap');
const SOAP_WSDL_URL = process.env.SOAP_WSDL_URL;

async function getSoapTravelCalculation(distance, speed, autonomy, chargeTime, costPerKm) {
  try {
    const client = await soap.createClientAsync(SOAP_WSDL_URL);
    const params = {
      distance_km: distance,
      avg_speed_kmh: speed,
      autonomy_km: autonomy,
      charge_time_min: chargeTime,
      cost_per_km: costPerKm,
    };

    const [result] = await client.calculate_tripAsync(params);
    console.log("Résultat complet du SOAP:", result);
    
    const soapData = result.calculate_tripResult || result;
    
    return {
      time: soapData.time,
      cost: soapData.cost,
      charges: soapData.charges,
    };
  } catch (error) {
    console.error("Erreur soapService:", error.message);
    throw new Error("Impossible de calculer temps/coût via SOAP");
  }
}

module.exports = { getSoapTravelCalculation };
