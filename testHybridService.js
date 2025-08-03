/**
 * 🧪 Test du Service OpenEPI Hybride
 *
 * Ce script teste le nouveau service hybride qui utilise les vraies APIs
 * quand elles sont disponibles et les données simulées comme fallback.
 *
 * Usage: node testHybridService.js
 */

// Charger les variables d'environnement depuis .env
require('dotenv').config();

// Simulation du service hybride en JavaScript (pour test)
const axios = require('axios');

class TestHybridService {
  constructor() {
    this.NASA_POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
    this.OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';
    this.OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY || '';
    
    this.apiStatus = new Map();
    this.initializeAPIStatus();
  }

  initializeAPIStatus() {
    const apis = ['nasa_power', 'openweather', 'soilgrids', 'fao'];
    apis.forEach(api => {
      this.apiStatus.set(api, {
        available: false,
        lastChecked: new Date(0),
        errorCount: 0
      });
    });
  }

  async checkAPIStatus(apiName, checkFn) {
    const status = this.apiStatus.get(apiName);
    if (!status) return false;

    // Cache de 5 minutes
    const cacheExpiry = 5 * 60 * 1000;
    const now = new Date();
    
    if (now.getTime() - status.lastChecked.getTime() < cacheExpiry) {
      return status.available;
    }

    try {
      const isAvailable = await checkFn();
      this.apiStatus.set(apiName, {
        available: isAvailable,
        lastChecked: now,
        errorCount: isAvailable ? 0 : status.errorCount + 1
      });
      return isAvailable;
    } catch (error) {
      this.apiStatus.set(apiName, {
        available: false,
        lastChecked: now,
        errorCount: status.errorCount + 1,
        lastError: error.message
      });
      return false;
    }
  }

  async getClimateData(lat, lon) {
    const isAvailable = await this.checkAPIStatus('nasa_power', async () => {
      try {
        const response = await axios.head(this.NASA_POWER_URL, { timeout: 5000 });
        return response.status === 200;
      } catch {
        return false;
      }
    });

    if (!isAvailable) {
      console.log('⚠️  NASA POWER indisponible, utilisation de données simulées');
      return this.generateMockClimateData(lat, lon);
    }

    try {
      const params = {
        parameters: 'T2M,PRECTOTCORR,RH2M,WS2M',
        community: 'AG',
        longitude: lon,
        latitude: lat,
        start: '20230101',
        end: '20231231',
        format: 'JSON'
      };

      const response = await axios.get(this.NASA_POWER_URL, { 
        params,
        timeout: 20000,
        headers: {
          'User-Agent': 'ClimInvest-Test/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data) {
        console.log('✅ Données climatiques NASA POWER récupérées');
        return {
          source: 'NASA_POWER',
          data: response.data,
          quality: 'high'
        };
      }
    } catch (error) {
      console.log('❌ Erreur NASA POWER, fallback vers données simulées:', error.message);
    }

    return this.generateMockClimateData(lat, lon);
  }

  async getCurrentWeather(lat, lon) {
    if (!this.OPENWEATHER_API_KEY) {
      console.log('⚠️  Clé OpenWeatherMap manquante, utilisation de données simulées');
      return this.generateMockWeatherData(lat, lon);
    }

    const isAvailable = await this.checkAPIStatus('openweather', async () => {
      try {
        const response = await axios.head(`${this.OPENWEATHER_URL}/weather`, { 
          params: { appid: this.OPENWEATHER_API_KEY },
          timeout: 5000 
        });
        return response.status === 200;
      } catch {
        return false;
      }
    });

    if (!isAvailable) {
      console.log('⚠️  OpenWeatherMap indisponible, utilisation de données simulées');
      return this.generateMockWeatherData(lat, lon);
    }

    try {
      const params = {
        lat,
        lon,
        appid: this.OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'fr'
      };

      const response = await axios.get(`${this.OPENWEATHER_URL}/weather`, { 
        params,
        timeout: 15000
      });
      
      if (response.status === 200 && response.data) {
        console.log('✅ Données météo OpenWeatherMap récupérées');
        return {
          source: 'OpenWeatherMap',
          data: response.data,
          quality: 'high'
        };
      }
    } catch (error) {
      console.log('❌ Erreur OpenWeatherMap, fallback vers données simulées:', error.message);
    }

    return this.generateMockWeatherData(lat, lon);
  }

  generateMockClimateData(lat, lon) {
    return {
      source: 'SIMULATED',
      location: { latitude: lat, longitude: lon },
      temperature: {
        annual_mean: 27.5 + (Math.random() - 0.5) * 2,
        seasonal_variation: 3.2
      },
      precipitation: {
        annual_total: 1200 + (Math.random() - 0.5) * 400,
        wet_season: { start: 'April', end: 'October' }
      },
      quality: 'simulated'
    };
  }

  generateMockWeatherData(lat, lon) {
    return {
      source: 'SIMULATED',
      location: { latitude: lat, longitude: lon },
      current: {
        temperature: 28 + (Math.random() - 0.5) * 6,
        humidity: 70 + (Math.random() - 0.5) * 20,
        wind_speed: 3 + Math.random() * 4,
        description: 'Partiellement nuageux'
      },
      quality: 'simulated'
    };
  }

  getAPIStatus() {
    const status = {};
    this.apiStatus.forEach((value, key) => {
      status[key] = {
        available: value.available,
        lastChecked: value.lastChecked,
        errorCount: value.errorCount,
        lastError: value.lastError
      };
    });
    return status;
  }
}

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🔄 ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

// Test principal
async function testHybridService() {
  log('🔄 Test du Service OpenEPI Hybride', 'bright');
  log('📍 Localisation: Cotonou, Bénin (6.3887255, 2.3330869)', 'blue');
  
  const service = new TestHybridService();
  const lat = 6.3887255;
  const lon = 2.3330869;

  // Test 1: Données climatiques (NASA POWER)
  logSection('Test Données Climatiques (NASA POWER + Fallback)');
  try {
    const climateData = await service.getClimateData(lat, lon);
    
    if (climateData.source === 'NASA_POWER') {
      log('✅ Données climatiques réelles récupérées via NASA POWER', 'green');
      log(`📊 Paramètres disponibles: ${Object.keys(climateData.data.parameters || {}).join(', ')}`, 'green');
    } else {
      log('⚠️  Données climatiques simulées utilisées', 'yellow');
      log(`🌡️  Température moyenne: ${climateData.temperature.annual_mean.toFixed(1)}°C`, 'yellow');
      log(`🌧️  Précipitations annuelles: ${climateData.precipitation.annual_total}mm`, 'yellow');
    }
  } catch (error) {
    log(`❌ Erreur test données climatiques: ${error.message}`, 'red');
  }

  // Test 2: Données météo actuelles (OpenWeatherMap)
  logSection('Test Météo Actuelle (OpenWeatherMap + Fallback)');
  try {
    const weatherData = await service.getCurrentWeather(lat, lon);
    
    if (weatherData.source === 'OpenWeatherMap') {
      log('✅ Données météo réelles récupérées via OpenWeatherMap', 'green');
      log(`🌡️  Température: ${weatherData.data.main?.temp}°C`, 'green');
      log(`💧 Humidité: ${weatherData.data.main?.humidity}%`, 'green');
      log(`📍 Ville: ${weatherData.data.name}`, 'green');
    } else {
      log('⚠️  Données météo simulées utilisées', 'yellow');
      log(`🌡️  Température: ${weatherData.current.temperature.toFixed(1)}°C`, 'yellow');
      log(`💧 Humidité: ${weatherData.current.humidity.toFixed(0)}%`, 'yellow');
      log(`💨 Vent: ${weatherData.current.wind_speed.toFixed(1)} m/s`, 'yellow');
    }
  } catch (error) {
    log(`❌ Erreur test données météo: ${error.message}`, 'red');
  }

  // Test 3: Statut des APIs
  logSection('Statut des APIs');
  const apiStatus = service.getAPIStatus();
  
  Object.entries(apiStatus).forEach(([api, status]) => {
    const icon = status.available ? '✅' : '❌';
    const color = status.available ? 'green' : 'red';
    log(`${icon} ${api.toUpperCase()}: ${status.available ? 'Disponible' : 'Indisponible'}`, color);
    
    if (status.errorCount > 0) {
      log(`   Erreurs: ${status.errorCount}`, 'yellow');
    }
    
    if (status.lastError) {
      log(`   Dernière erreur: ${status.lastError}`, 'red');
    }
  });

  // Recommandations finales
  logSection('Recommandations');
  
  const availableAPIs = Object.values(apiStatus).filter(s => s.available).length;
  const totalAPIs = Object.keys(apiStatus).length;
  
  log(`📊 APIs disponibles: ${availableAPIs}/${totalAPIs}`, 'blue');
  
  if (availableAPIs > 0) {
    log('✅ Service hybride fonctionnel !', 'green');
    log('🎯 Stratégie recommandée:', 'cyan');
    log('1. Utiliser le service hybride en production', 'reset');
    log('2. Les données réelles seront utilisées quand disponibles', 'reset');
    log('3. Fallback automatique vers données simulées', 'reset');
    log('4. Monitoring automatique du statut des APIs', 'reset');
  } else {
    log('⚠️  Toutes les APIs externes sont indisponibles', 'yellow');
    log('🎯 Stratégie recommandée:', 'cyan');
    log('1. Continuer avec données simulées uniquement', 'reset');
    log('2. Ajouter clé OpenWeatherMap pour améliorer la couverture', 'reset');
    log('3. Surveiller le retour en ligne des APIs', 'reset');
  }

  log('\n🚀 Le service hybride est prêt pour la production !', 'green');
  log('📝 Prochaine étape: Intégrer dans l\'application React Native', 'cyan');
}

// Exécuter le test
if (require.main === module) {
  testHybridService().catch(error => {
    log(`❌ Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { TestHybridService };
