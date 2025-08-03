/**
 * 🔍 Test direct des APIs avec les bonnes URLs et paramètres
 * 
 * Basé sur la documentation officielle :
 * - NASA POWER: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
 * - SoilGrids: https://rest.isric.org/soilgrids/v2.0/docs
 */

require('dotenv').config();
const axios = require('axios');

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
  log(`🔍 ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

// Configuration
const TEST_LOCATION = {
  latitude: 6.3887255,
  longitude: 2.3330869,
  name: 'Cotonou, Bénin'
};

// Test 1: NASA POWER API (selon documentation officielle)
async function testNASAPowerAPI() {
  logSection('Test NASA POWER API (Documentation Officielle)');
  
  try {
    // URL correcte selon la documentation
    const url = 'https://power.larc.nasa.gov/api/temporal/daily/point';
    
    // Paramètres selon la documentation officielle
    const params = {
      parameters: 'T2M,PRECTOTCORR,RH2M,WS10M,ALLSKY_SFC_SW_DWN', // Température, Précipitations, Humidité, Vent, Radiation solaire
      community: 'AG', // Agriculture community
      longitude: TEST_LOCATION.longitude,
      latitude: TEST_LOCATION.latitude,
      start: '20240101', // Format YYYYMMDD
      end: '20240131',   // Janvier 2024
      format: 'JSON'
    };
    
    log(`📡 URL: ${url}`, 'blue');
    log(`📊 Paramètres: ${JSON.stringify(params, null, 2)}`, 'blue');
    
    const response = await axios.get(url, {
      params,
      timeout: 30000,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data) {
      log('✅ NASA POWER API - SUCCÈS !', 'green');
      log(`📊 Statut: ${response.status}`, 'green');
      
      // Analyser la réponse
      if (response.data.properties) {
        log(`🌍 Localisation: ${response.data.geometry?.coordinates}`, 'green');
        log(`📈 Paramètres disponibles: ${Object.keys(response.data.properties).join(', ')}`, 'green');
        
        // Afficher quelques valeurs d'exemple
        const firstParam = Object.keys(response.data.properties)[0];
        if (firstParam && response.data.properties[firstParam]) {
          const firstDate = Object.keys(response.data.properties[firstParam])[0];
          if (firstDate) {
            log(`📅 Exemple ${firstParam} (${firstDate}): ${response.data.properties[firstParam][firstDate]}`, 'green');
          }
        }
      }
      
      return { success: true, data: response.data };
    }
    
  } catch (error) {
    log('❌ NASA POWER API - ÉCHEC', 'red');
    log(`Erreur: ${error.response?.status || 'Network'} - ${error.message}`, 'red');
    
    if (error.response?.data) {
      log(`Détails: ${JSON.stringify(error.response.data)}`, 'red');
    }
    
    return { success: false, error: error.message };
  }
}

// Test 2: SoilGrids API (selon documentation officielle)
async function testSoilGridsAPI() {
  logSection('Test SoilGrids API (Documentation Officielle)');
  
  try {
    // URL correcte selon la documentation
    const url = 'https://rest.isric.org/soilgrids/v2.0/properties/query';
    
    // Paramètres selon la documentation officielle
    const params = {
      lon: TEST_LOCATION.longitude,
      lat: TEST_LOCATION.latitude,
      property: 'phh2o,soc,nitrogen,cec,clay,sand,silt', // Propriétés séparées par virgules
      depth: '0-5cm,5-15cm,15-30cm', // Profondeurs séparées par virgules
      value: 'mean' // Valeur moyenne
    };
    
    log(`📡 URL: ${url}`, 'blue');
    log(`📊 Paramètres: ${JSON.stringify(params, null, 2)}`, 'blue');
    
    const response = await axios.get(url, {
      params,
      timeout: 30000,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data) {
      log('✅ SoilGrids API - SUCCÈS !', 'green');
      log(`📊 Statut: ${response.status}`, 'green');
      
      // Analyser la réponse
      if (response.data.properties) {
        log(`🌍 Localisation: ${response.data.geometry?.coordinates}`, 'green');
        log(`🌱 Propriétés disponibles: ${Object.keys(response.data.properties).join(', ')}`, 'green');
        
        // Afficher quelques valeurs d'exemple
        const firstProperty = Object.keys(response.data.properties)[0];
        if (firstProperty && response.data.properties[firstProperty]) {
          const firstDepth = Object.keys(response.data.properties[firstProperty])[0];
          if (firstDepth) {
            const value = response.data.properties[firstProperty][firstDepth];
            log(`📈 Exemple ${firstProperty} (${firstDepth}): ${value}`, 'green');
          }
        }
      }
      
      return { success: true, data: response.data };
    }
    
  } catch (error) {
    log('❌ SoilGrids API - ÉCHEC', 'red');
    log(`Erreur: ${error.response?.status || 'Network'} - ${error.message}`, 'red');
    
    if (error.response?.data) {
      log(`Détails: ${JSON.stringify(error.response.data)}`, 'red');
    }
    
    // Suggestions basées sur l'erreur
    if (error.response?.status === 500) {
      log('💡 Suggestion: Service temporairement indisponible, réessayer plus tard', 'yellow');
    } else if (error.response?.status === 400) {
      log('💡 Suggestion: Vérifier les paramètres (lon, lat, property, depth, value)', 'yellow');
    }
    
    return { success: false, error: error.message };
  }
}

// Test 3: OpenWeatherMap API (avec clé du .env)
async function testOpenWeatherMapAPI() {
  logSection('Test OpenWeatherMap API (avec clé .env)');
  
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  
  if (!apiKey) {
    log('❌ Clé API OpenWeatherMap manquante dans .env', 'red');
    return { success: false, error: 'Clé API manquante' };
  }
  
  log(`🔑 Clé API trouvée: ${apiKey.substring(0, 8)}...`, 'blue');
  
  try {
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    
    const params = {
      lat: TEST_LOCATION.latitude,
      lon: TEST_LOCATION.longitude,
      appid: apiKey,
      units: 'metric',
      lang: 'fr'
    };
    
    log(`📡 URL: ${url}`, 'blue');
    log(`📊 Paramètres: lat=${params.lat}, lon=${params.lon}, units=${params.units}`, 'blue');
    
    const response = await axios.get(url, {
      params,
      timeout: 15000,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0'
      }
    });
    
    if (response.status === 200 && response.data) {
      log('✅ OpenWeatherMap API - SUCCÈS !', 'green');
      log(`📊 Statut: ${response.status}`, 'green');
      log(`🌍 Ville: ${response.data.name}, ${response.data.sys?.country}`, 'green');
      log(`🌡️  Température: ${response.data.main?.temp}°C`, 'green');
      log(`💧 Humidité: ${response.data.main?.humidity}%`, 'green');
      log(`☁️  Description: ${response.data.weather?.[0]?.description}`, 'green');
      
      return { success: true, data: response.data };
    }
    
  } catch (error) {
    log('❌ OpenWeatherMap API - ÉCHEC', 'red');
    log(`Erreur: ${error.response?.status || 'Network'} - ${error.message}`, 'red');
    
    if (error.response?.status === 401) {
      log('💡 Suggestion: Clé API invalide ou expirée', 'yellow');
    } else if (error.response?.status === 429) {
      log('💡 Suggestion: Limite de requêtes dépassée', 'yellow');
    }
    
    return { success: false, error: error.message };
  }
}

// Test principal
async function runDirectAPITests() {
  log('🔍 Test Direct des APIs avec Documentation Officielle', 'bright');
  log(`📍 Localisation: ${TEST_LOCATION.name} (${TEST_LOCATION.latitude}, ${TEST_LOCATION.longitude})`, 'blue');
  
  const results = {};
  
  // Test NASA POWER
  results.nasa_power = await testNASAPowerAPI();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test SoilGrids
  results.soilgrids = await testSoilGridsAPI();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test OpenWeatherMap
  results.openweather = await testOpenWeatherMapAPI();
  
  // Résumé
  logSection('Résumé des Tests Directs');
  
  const successCount = Object.values(results).filter(r => r?.success).length;
  const totalCount = Object.keys(results).length;
  
  log(`📊 APIs testées: ${totalCount}`, 'blue');
  log(`✅ APIs fonctionnelles: ${successCount}`, 'green');
  log(`❌ APIs non disponibles: ${totalCount - successCount}`, 'red');
  
  // Recommandations
  log('\n🎯 Recommandations finales:', 'cyan');
  
  if (results.nasa_power?.success) {
    log('✅ NASA POWER: Intégrer immédiatement - API fonctionnelle !', 'green');
  } else {
    log('❌ NASA POWER: Problème à résoudre', 'red');
  }
  
  if (results.soilgrids?.success) {
    log('✅ SoilGrids: Intégrer immédiatement - API fonctionnelle !', 'green');
  } else {
    log('❌ SoilGrids: Service temporairement indisponible', 'red');
  }
  
  if (results.openweather?.success) {
    log('✅ OpenWeatherMap: Intégrer immédiatement - API fonctionnelle !', 'green');
  } else {
    log('❌ OpenWeatherMap: Vérifier la clé API', 'red');
  }
  
  if (successCount >= 2) {
    log('\n🚀 EXCELLENT ! Au moins 2 APIs fonctionnent', 'green');
    log('📝 Action: Mettre à jour le service hybride avec les vraies APIs', 'cyan');
  } else {
    log('\n⚠️  Moins de 2 APIs fonctionnelles', 'yellow');
    log('📝 Action: Continuer avec données simulées + monitoring', 'cyan');
  }
  
  return results;
}

// Exécuter les tests
if (require.main === module) {
  runDirectAPITests().catch(error => {
    log(`❌ Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runDirectAPITests };
