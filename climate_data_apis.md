# APIs et Sources de Données Climatiques pour Clim-Invest 🌍

## 1. Sources de Données Historiques de Sinistres

### **EM-DAT (Emergency Events Database)** ⭐⭐⭐
- **URL**: https://www.emdat.be/
- **Données**: Catastrophes naturelles depuis 1900 (17,000+ événements)
- **Couverture**: Afrique complète
- **Format**: Excel/CSV downloadable
- **Types**: Sécheresses, inondations, tempêtes, cyclones
- **API**: Pas d'API directe, mais données exportables
- **Coût**: Gratuit pour usage non-commercial

```javascript
// Exemple d'intégration des données EM-DAT
const emdat_data = {
  "country": "Benin",
  "disasters": [
    {
      "year": 2010,
      "type": "Flood",
      "affected_people": 680000,
      "total_damages_usd": 46000000
    },
    {
      "year": 2012,
      "type": "Drought", 
      "affected_people": 500000,
      "total_damages_usd": 15000000
    }
  ]
}
```

### **Our World in Data - Natural Disasters API** ⭐⭐⭐
- **URL**: https://ourworldindata.org/natural-disasters
- **API GitHub**: https://github.com/owid/owid-datasets
- **Format**: JSON/CSV
- **Données**: Statistiques par pays depuis 1900

```javascript
// Intégration OWID
const fetchOWIDData = async (country) => {
  const response = await fetch(`https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/Natural%20disasters%20%E2%80%93%20EM-DAT%20(2023)/Natural%20disasters%20%E2%80%93%20EM-DAT%20(2023).csv`);
  return response.text();
}
```

## 2. Données Temps Réel et Monitoring

### **African Flood and Drought Monitor (AFDM)** ⭐⭐⭐⭐
- **URL**: https://hydrology.soton.ac.uk/apps/afdm/
- **Développé par**: Princeton Climate Institute + UNESCO
- **Données**: Temps réel + historique multidécennal
- **API**: Possible via requêtes directes
- **Format**: NetCDF, GeoTIFF, JSON

```javascript
// Exemple d'intégration AFDM
const fetchAFDMData = async (lat, lon, startDate, endDate) => {
  const baseURL = 'https://hydrology.soton.ac.uk/apps/afdm/api/';
  const params = {
    lat: lat,
    lon: lon,
    start: startDate,
    end: endDate,
    variable: 'drought_index'
  };
  
  const response = await fetch(`${baseURL}getData?${new URLSearchParams(params)}`);
  return response.json();
}
```

### **Digital Earth Africa** ⭐⭐⭐⭐
- **URL**: https://digitalearthafrica.org/
- **Données**: Satellite data depuis 1984
- **API**: Open Data Cube (ODC) API
- **Coverage**: Tout le continent africain
- **Types**: NDVI, précipitations, température

```javascript
// Intégration Digital Earth Africa
const fetchDigitalEarthData = async (bbox, timeRange) => {
  const odc_api = "https://ows.digitalearth.africa/";
  const params = {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetMap',
    layers: 'ga_ls8c_fractional_cover_2',
    bbox: bbox,
    time: timeRange
  };
  
  return fetch(`${odc_api}?${new URLSearchParams(params)}`);
}
```

### **East Africa Drought Watch** ⭐⭐⭐
- **URL**: https://droughtwatch.icpac.net/
- **Région**: Afrique de l'Est
- **API**: Disponible
- **Données**: Indices de sécheresse en temps réel

## 3. APIs Météorologiques Spécialisées

### **Climate Change Knowledge Portal (World Bank)** ⭐⭐⭐
- **URL**: https://climateknowledgeportal.worldbank.org/download-data
- **API**: Disponible
- **Format**: JSON, NetCDF, Excel
- **Données**: Projections climatiques par pays

```javascript
// World Bank Climate API
const fetchClimateData = async (country, indicator) => {
  const api_url = `https://climateknowledgeportal.worldbank.org/api/v1/country/${country}/${indicator}`;
  const response = await fetch(api_url);
  return response.json();
}
```

### **ICPAC Open Data Sources** ⭐⭐⭐
- **URL**: https://www.icpac.net/open-data-sources/
- **Données**: Précipitations, température, prévisions saisonnières
- **Format**: Multiple (NetCDF, GeoTIFF, JSON)

## 4. Implémentation Node.js Recommandée

### **Structure de Base**

```javascript
// services/climateDataService.js
class ClimateDataService {
  constructor() {
    this.dataSources = {
      emdat: new EMDATService(),
      afdm: new AFDMService(),
      digitalEarth: new DigitalEarthService(),
      worldBank: new WorldBankClimateService()
    };
  }

  async getHistoricalDisasters(country, region, startYear, endYear) {
    const disasters = await this.dataSources.emdat.getDisasters({
      country,
      region, 
      startYear,
      endYear,
      types: ['drought', 'flood', 'storm']
    });
    
    return this.processDisasterData(disasters);
  }

  async getCurrentRiskLevel(lat, lon) {
    const droughtIndex = await this.dataSources.afdm.getDroughtIndex(lat, lon);
    const floodRisk = await this.dataSources.afdm.getFloodRisk(lat, lon);
    
    return this.calculateRiskScore(droughtIndex, floodRisk);
  }

  processDisasterData(disasters) {
    return disasters.map(disaster => ({
      id: disaster.id,
      type: disaster.type,
      date: disaster.date,
      location: disaster.location,
      severity: this.calculateSeverity(disaster),
      economic_loss: disaster.total_damages,
      affected_population: disaster.affected_people
    }));
  }
}
```

### **Module de Cache Redis**

```javascript
// services/cacheService.js
const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient();
  }

  async getCachedData(key) {
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setCachedData(key, data, ttl = 3600) {
    await this.client.setex(key, ttl, JSON.stringify(data));
  }
}
```

### **API Routes**

```javascript
// routes/climateData.js
const express = require('express');
const router = express.Router();
const ClimateDataService = require('../services/climateDataService');

const climateService = new ClimateDataService();

// GET /api/climate/disasters?country=benin&region=donga&years=10
router.get('/disasters', async (req, res) => {
  try {
    const { country, region, years = 10 } = req.query;
    const currentYear = new Date().getFullYear();
    
    const disasters = await climateService.getHistoricalDisasters(
      country,
      region, 
      currentYear - years,
      currentYear
    );
    
    res.json({
      success: true,
      data: disasters,
      meta: {
        country,
        region,
        period: `${currentYear - years}-${currentYear}`,
        total_events: disasters.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/climate/risk?lat=9.30&lon=2.31
router.get('/risk', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const riskData = await climateService.getCurrentRiskLevel(lat, lon);
    
    res.json({
      success: true,
      data: riskData,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

## 5. Zones Prioritaires pour Clim-Invest

### **Bénin**
- **Donga**: Sécheresses récurrentes (2012, 2016, 2019)
- **Borgou**: Variabilité pluviométrique élevée
- **Atlantique**: Inondations côtières

### **Sénégal** 
- **Kaolack**: Déficit hydrique chronique
- **Saint-Louis**: Montée des eaux
- **Tambacounda**: Sécheresses agricoles

### **Niger**
- **Delta du Niger**: Inondations + sécheresses alternées
- **Tillabéri**: Stress hydrique extrême

## 6. Métriques Clés à Tracker

```javascript
const climateTriggers = {
  drought: {
    ndvi_threshold: 0.3,        // Stress végétatif
    precipitation_deficit: 75,   // % de déficit vs normale
    consecutive_dry_days: 30     // Jours sans pluie
  },
  flood: {
    rainfall_24h: 50,           // mm en 24h
    water_level_rise: 2,        // mètres
    sentinel1_flood_area: 0.1   // km² inondée
  },
  storm: {
    wind_speed: 118,            // km/h (Cyclone cat 1)
    pressure_drop: 20,          // hPa
    precipitation_rate: 20      // mm/h
  }
}
```

Cette architecture te donne une base solide pour intégrer les données climatiques dans ton app Clim-Invest ! 🚀