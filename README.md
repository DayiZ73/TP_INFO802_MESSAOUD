#  TP INFO802 MESSAOUD-DJEBARA Ziyad

##  Description du projet

Ce projet est un **mini-projet académique** réalisé dans le cadre de la matière **"Architectures Orientées Service"**. Il s'agit d'une **application de planification et de suivi de trajets en véhicules électriques** basée sur une architecture **orientée services** (SOA).

L'application intègre plusieurs **microservices** indépendants qui peuvent communiquer entre eux pour :
- Calculer des itinéraires de trajet.
- Récupérer les bornes de recharge à proximité.
- Interroger une base de données GraphQL de véhicules électriques.
- Estimer le temps et le coût d'un trajet via un service SOAP.

---

##  Structure du projet

Le projet est structuré en plusieurs dossiers représentant des microservices indépendants :

```
📦 PROJET
 ├── 📂 aggregator             # Service central qui agrège les autres APIs et gère l'IHM
 ├── 📂 external_api           # API externe appelant directement tous les services et intégrant le Swagger
 ├── 📂 graphql_vehicles       # API GraphQL pour récupérer les véhicules électriques
 ├── 📂 rest_cartography       # Service REST pour calculer les itinéraires
 ├── 📂 rest_charging          # Service REST pour récupérer les bornes de recharge
 ├── 📂 soap_py                # Service SOAP pour estimer temps et coût de trajet
 └── 📜 README.md              # Documentation du projet
```

Chaque dossier contient son propre **serveur Node.js (Express) ou Python**, et communique via **HTTP (REST, GraphQL, SOAP)**.

---

## Détails des mini-APIs

### 1️ **Aggregator** (`aggregator/`)
- **Rôle :** Sert d’API centrale qui interagit avec les autres services pour simplifier les appels côté frontend. Gère également  l'IHM et l'affichage des résultat.
- **Port :** `9000`
- **Endpoints :**
  - `GET /api/vehicles` → Liste des véhicules électriques (via GraphQL)
  - `POST /api/route` → Calcul d’un itinéraire (via rest_cartography)
  - `GET /api/charging-stations` → Recherche des bornes de recharge à proximité

### 2️ **External API** (`external_api/`)
- **Rôle :** Service exposant une API externe qui regroupe les fonctionnalités de tous les microservices en renvoyant un JSON. Contient un Swagger qui communique avec les autres API.
- **Port :** `9100`
- **Endpoints :**
  - `GET /api/vehicles` → Liste des véhicules électriques
  - `POST /api/plan-route` → Calcul d'un itinéraire avec bornes
  - `GET /api/charging-stations?lat=...&lon=...` → Bornes à proximité

### 3️ **GraphQL Vehicles** (`graphql_vehicles/`)
- **Rôle :** API GraphQL interrogeant une base de données sur les véhicules électriques.
- **Port :** `3002`
- **Endpoints :**
  - `GET /api/vehicles` → Liste des véhicules

### 4️ **REST Cartography** (`rest_cartography/`)
- **Rôle :** Service REST pour récupérer les itinéraires de trajet (basé sur OpenRouteService).
- **Port :** `3001`
- **Endpoints :**
  - `POST /api/trajet/route` → Calcul de l’itinéraire entre deux villes

### 5️ **REST Charging Stations** (`rest_charging/`)
- **Rôle :** Fournit des informations sur les stations de recharge IRVE.
- **Port :** `3003`
- **Endpoints :**
  - `GET /api/charging-stations?lat=...&lon=...` → Liste des bornes à proximité

### 6️ **SOAP Service** (`soap_py/`)
- **Rôle :** Service SOAP pour calculer le **temps total et le coût du trajet** avec les recharges.
- **Port :** `8000`
- **Endpoints :**
  - `calculate_trip(distance, speed, autonomy, chargeTime, costPerKm)`

---

## Installation & Lancement

###  1. Prérequis
Avant de commencer, s'assurer d’avoir installé :
- **Node.js** (v16+) (J'utilise la v20.3.1)
- **Python** (3.8+) (J'utilise la v3.9.0)

###  2. Cloner le projet

```bash
git clone https://github.com/ton-compte/TP_INFO802_MESSAOUD.git
cd TP_INFO802_MESSAOUD
```

###  3. Installer les dépendances

Exécuter cette commande **dans chaque dossier de microservice** (exemple : `aggregator/`) :

```bash
cd aggregator
npm install
```

Faire de même pour `external_api`, `graphql_vehicles`, `rest_cartography`, `rest_charging`.

Pour `soap_py` (Python) :

```bash
cd soap_py
pip install spyne lxml zeep
```

###  4. Lancer les microservices

Chaque service se lance indépendamment (dans un terminal séparé) :

```bash
cd aggregator && npm start
cd external_api && npm start
cd graphql_vehicles && npm start
cd rest_cartography && npm start
cd rest_charging && npm start
cd soap_py && python travel_service.py
```

Si tout fonctionne, chaque service écoutera sur son port respectif.

---

##  Endpoints

| Service               | Méthode  | Endpoint                         | Description |
|-----------------------|---------|---------------------------------|-------------|
| **Aggregator**        | `GET`   | `/api/vehicles`                 | Liste des véhicules |
|                       | `POST`  | `/api/route`                    | Calcul d’un itinéraire |
|                       | `GET`   | `/api/charging-stations`        | Bornes proches |
| **External API**      | `GET`   | `/api/vehicles`                 | Liste des véhicules |
|                       | `POST`  | `/api/plan-route`               | Itinéraire complet |
|                       | `GET`   | `/api/charging-stations`        | Bornes proches |
| **GraphQL Vehicles**  | `GET`   | `/api/vehicles`                 | Récupérer les véhicules |
| **REST Cartography**  | `POST`  | `/api/trajet/route`             | Calculer un trajet |
| **REST Charging**     | `GET`   | `/api/charging-stations`        | Liste des bornes |
| **SOAP Service**      | `POST`  | `calculate_trip` (via SOAP)     | Temps & coût du trajet |

---

## Technologies utilisées

| Technologie | Usage |
|-------------|----------------|
| **Node.js** | Microservices REST & GraphQL |
| **Express.js** | API REST |
| **GraphQL** | Interrogation des véhicules |
| **OpenRouteService** | Calcul d'itinéraires |
| **IRVE OpenData** | Récupération des bornes |
| **SOAP (Spyne)** | Calcul coût/temps de trajet |

---

## Documentation API

L'application dispose d'une documentation Swagger accessible via :

- **External API** → `http://localhost:9100/api-docs`

---

## Conclusion

Ce projet illustre une **architecture orientée services** où chaque service peut être **déployé indépendamment** et **évoluer séparément**. Il démontre également l’intégration de **REST, GraphQL et SOAP** pour répondre à des besoins différents.

---

### Auteur

Développé par **MESSAOUD-DJEBARA Ziyad**  
