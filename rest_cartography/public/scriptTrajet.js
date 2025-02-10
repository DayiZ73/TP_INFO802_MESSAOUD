// Initialisation de la carte
const map = L.map('map').setView([49.41461, 8.681495], 13);

// Ajouter un calque OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Fonction pour afficher l’itinéraire
const displayRoute = (routeCoordinates) => {
  // Supprimer d’éventuelles anciennes polylignes
  map.eachLayer((layer) => {
    if (layer instanceof L.Polyline && !(layer instanceof L.TileLayer)) {
      map.removeLayer(layer);
    }
  });

  // Ajouter la polyline sur la carte
  const polylineLayer = L.polyline(routeCoordinates, {
    color: 'blue',
    weight: 4,
  }).addTo(map);

  // Adapter la vue aux bornes de la polyline
  map.fitBounds(polylineLayer.getBounds());
};

// Fonction pour afficher les marqueurs pour les coordonnées
const displayMarkers = (startCoords, endCoords) => {
  // Ajouter un marqueur pour la ville de départ
  L.marker([startCoords.lat, startCoords.lon])
    .addTo(map)
    .bindPopup('Ville de départ')
    .openPopup();

  // Ajouter un marqueur pour la ville d’arrivée
  L.marker([endCoords.lat, endCoords.lon])
    .addTo(map)
    .bindPopup('Ville d’arrivée')
    .openPopup();
};

// Fonction pour gérer l'envoi du formulaire
document.getElementById('routeForm').addEventListener('submit', (e) => {
  e.preventDefault();

  // Récupérer les noms des villes
  const startCity = document.getElementById('start-city').value.trim();
  const endCity = document.getElementById('end-city').value.trim();

  // Validation basique
  if (!startCity || !endCity) {
    alert('Veuillez entrer les noms des villes.');
    return;
  }

  // Envoyer la requête pour calculer l’itinéraire
  calculateRoute(startCity, endCity);
});

const calculateRoute = async (startCity, endCity) => {
  try {
    const response = await fetch('/api/trajet/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startCity, endCity }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l’itinéraire.');
    }

    const data = await response.json();

    // Afficher l’itinéraire
    const encodedPolyline = data.route.routes[0].geometry;
    const decodedPolyline = polyline.decode(encodedPolyline);
    displayRoute(decodedPolyline);

    // Afficher les coordonnées de départ et d’arrivée
    displayMarkers(data.startCoords, data.endCoords);
  } catch (error) {
    console.error('Erreur :', error.message);
    alert('Impossible de calculer l’itinéraire.');
  }
};