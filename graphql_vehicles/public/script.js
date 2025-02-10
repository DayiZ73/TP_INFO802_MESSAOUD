document.getElementById('loadBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des véhicules.");
      }
  
      const vehicles = await response.json();
      displayVehicles(vehicles);
    } catch (error) {
      console.error('Erreur :', error.message);
      alert("Impossible de récupérer la liste des véhicules.");
    }
  });
  
  function displayVehicles(vehicles) {
    const container = document.getElementById('vehicles');
    container.innerHTML = '';
  
    if (!vehicles || vehicles.length === 0) {
      container.innerHTML = '<p>Aucun véhicule trouvé.</p>';
      return;
    }
  
    vehicles.forEach(vehicle => {
      const div = document.createElement('div');
      div.classList.add('vehicle');
  
      div.innerHTML = `
        <img src="${vehicle.media?.image?.thumbnail_url || 'https://via.placeholder.com/300x150?text=Aucune+image'}" alt="Image du véhicule">
        <div class="vehicle-details">
          <h2>${vehicle.naming.make} ${vehicle.naming.model} (${vehicle.naming.chargetrip_version || 'Version inconnue'})</h2>
          <p><strong>Batterie utilisable :</strong> ${vehicle.battery?.usable_kwh ?? 'N/A'} kWh</p>
          <p><strong>Autonomie (Meilleure) :</strong> ${vehicle.range?.chargetrip_range?.best ?? 'N/A'} km</p>
          <p><strong>Autonomie (Pire) :</strong> ${vehicle.range?.chargetrip_range?.worst ?? 'N/A'} km</p>
        </div>
      `;
  
      container.appendChild(div);
    });
  }
  