// Initialisation carte
const map = L.map('map').setView([45.5, 5.9], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Pour stocker polylignes + marqueurs
let routeLayers = [];

function clearMapLayers() {
  routeLayers.forEach((layer) => {
    map.removeLayer(layer);
  });
  routeLayers = [];
}

// Afficher la route sous forme de polyline
function displayRoute(encodedPolyline) {
  // Nettoyer anciennes traces
  clearMapLayers();

  const coords = polyline.decode(encodedPolyline);
  const routeLayer = L.polyline(coords, { color: 'blue', weight: 4 }).addTo(map);
  routeLayers.push(routeLayer);

  // Ajuster la vue
  map.fitBounds(routeLayer.getBounds());
}

// Petite fonction utilitaire pour ajouter un marqueur
function addMarker(lat, lon, popup) {
  const marker = L.marker([lat, lon]).bindPopup(popup).addTo(map);
  routeLayers.push(marker);
}

// Charger véhicules (inchangé, juste pour info)
async function loadVehicles() {
  try {
    const res = await fetch('/api/vehicles');
    if (!res.ok) throw new Error('Erreur chargement véhicules');
    const vehicles = await res.json();

    const vehicleSelect = document.getElementById('vehicleSelect');
    vehicleSelect.innerHTML = vehicles.map(v => {
      return `<option value='${JSON.stringify(v)}'>${v.naming.make} ${v.naming.model}</option>`;
    }).join('');

    // Afficher le premier véhicule par défaut
    if (vehicles.length > 0) {
      updateVehicleInfo(vehicles[0]);
      vehicleSelect.value = JSON.stringify(vehicles[0]);
    }
  } catch (err) {
    console.error(err.message);
  }
}

function updateVehicleInfo(vehicle) {
  document.getElementById('vehicleName').textContent = `${vehicle.naming.make} ${vehicle.naming.model}`;
  document.getElementById('vehicleRange').textContent = vehicle.range?.chargetrip_range?.best || 'N/A';
  const photoEl = document.getElementById('vehiclePhoto');
  const urlPhoto = vehicle.media?.image?.thumbnail_url || '';
  photoEl.src = urlPhoto || 'https://via.placeholder.com/200x120?text=No+Image';
}

// Planifier le trajet
async function planRoute() {
  const startCity = document.getElementById('startCity').value.trim();
  const endCity = document.getElementById('endCity').value.trim();

  const vehicleSelect = document.getElementById('vehicleSelect');
  if (!vehicleSelect.value) {
    alert('Veuillez sélectionner un véhicule.');
    return;
  }
  const vehicleObj = JSON.parse(vehicleSelect.value);
  const vehicleRange = vehicleObj.range?.chargetrip_range?.best || 0;

  if (!startCity || !endCity) {
    alert('Veuillez saisir la ville de départ et d’arrivée');
    return;
  }

  try {
    const res = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startCity, endCity, vehicleRange })
    });

    if (!res.ok) throw new Error('Erreur calc. trajet');
    const data = await res.json();
    // data => { route, startCoords, endCoords, travelResult, stationsAlongRoute }

    // (1) Afficher la route
    displayRoute(data.route.routes[0].geometry);

    // (2) Ajouter un marqueur pour départ
    addMarker(data.startCoords.lat, data.startCoords.lon, `Départ : ${startCity}`);

    // (3) Ajouter un marqueur pour arrivée
    addMarker(data.endCoords.lat, data.endCoords.lon, `Arrivée : ${endCity}`);

    // (4) Afficher les bornes "stationsAlongRoute"
    if (Array.isArray(data.stationsAlongRoute)) {
      data.stationsAlongRoute.forEach((stop, index) => {
        const station = stop.station;
        if (!station) return; // au cas où

        // Attention : structure de "station"
        // => station.latitude, station.longitude, station.name, station.address...
        const lat = station.latitude;     // ou station.ylatitude
        const lon = station.longitude;    // ou station.xlongitude
        const name = station.name || 'Borne inconnue';
        const address = station.address || 'Adresse inconnue';
        const distance = station.distance || '???';

        addMarker(
          lat,
          lon,
          `<b>Borne #${index + 1}</b><br>${name}<br>${address}<br>${distance}`
        );
      });
    }

    // (5) Mettre à jour temps/cout
    document.getElementById('timeResult').textContent = data.travelResult.time;
    document.getElementById('costResult').textContent = data.travelResult.cost;

  } catch (err) {
    console.error(err.message);
    alert('Impossible de calculer le trajet');
  }
}

// Mise à jour infos véhicule quand on change la sélection
document.getElementById('vehicleSelect').addEventListener('change', (e) => {
  if (!e.target.value) return;
  const v = JSON.parse(e.target.value);
  updateVehicleInfo(v);
});

// Init
document.getElementById('planRouteBtn').addEventListener('click', planRoute);
loadVehicles();