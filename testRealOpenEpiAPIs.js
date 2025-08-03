/**
 * 🔍 Script de test pour les vraies APIs OpenEPI
 * 
 * Ce script teste les vraies APIs OpenEPI pour identifier les problèmes
 * et voir quelles données sont disponibles.
 * 
 * Usage: node testRealOpenEpiAPIs.js
 */

const axios = require('axios');

// Configuration des APIs réelles (URLs corrigées)
const REAL_APIS = {
  // SoilGrids - API publique d'ISRIC (avec gestion d'erreurs améliorée)
  soilgrids: {
    baseUrl: 'https://rest.isric.org/soilgrids/v2.0',
    endpoints: {
      properties: '/properties/query',
      classification: '/classification/query'
    },
    requiresAuth: false,
    timeout: 30000, // Timeout augmenté
    retries: 3
  },

  // FAO FAOSTAT - API publique (URL corrigée)
  fao: {
    baseUrl: 'https://faostatservices.fao.org/api/v1', // URL corrigée
    endpoints: {
      data: '/en/data',
      domains: '/en/domains',
      dimensions: '/en/dimensions'
    },
    requiresAuth: false,
    timeout: 60000, // Timeout plus long pour FAO
    retries: 2
  },

  // OpenWeatherMap - Pour données météo complémentaires
  openweather: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    endpoints: {
      current: '/weather',
      forecast: '/forecast',
      onecall: '/onecall'
    },
    requiresAuth: true,
    apiKey: process.env.OPENWEATHERMAP_API_KEY || 'demo_key',
    timeout: 15000,
    retries: 2
  },

  // World Bank Climate Data (nouveau système CCKP)
  worldbank: {
    baseUrl: 'https://climateknowledgeportal.worldbank.org/api/v2', // URL corrigée
    endpoints: {
      country: '/country',
      data: '/data',
      climatology: '/climatology'
    },
    requiresAuth: false,
    timeout: 30000,
    retries: 2
  },

  // Alternative: NASA POWER API pour données météo/climatiques
  nasa_power: {
    baseUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    requiresAuth: false,
    timeout: 20000,
    retries: 2
  }
};

// Coordonnées de test (Cotonou, Bénin)
const TEST_LOCATION = {
  latitude: 6.3887255,
  longitude: 2.3330869,
  country: 'Benin',
  countryCode: 'BEN'
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

function logTest(testName, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'reset');
  }
}

// Fonction de retry avec backoff exponentiel
async function retryRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      log(`⏳ Tentative ${attempt}/${maxRetries} échouée, retry dans ${delay}ms...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Fonction pour vérifier le statut d'un service
async function checkServiceStatus(url) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return { available: true, status: response.status };
  } catch (error) {
    return {
      available: false,
      status: error.response?.status || 'Network Error',
      error: error.message
    };
  }
}

// Test SoilGrids API avec gestion d'erreurs améliorée
async function testSoilGridsAPI() {
  logSection('Test SoilGrids API (ISRIC)');

  // D'abord vérifier le statut du service
  const serviceStatus = await checkServiceStatus(REAL_APIS.soilgrids.baseUrl);
  if (!serviceStatus.available) {
    logTest('SoilGrids Service Status', 'FAIL',
      `Service indisponible: ${serviceStatus.status} - ${serviceStatus.error}`);
    return { success: false, error: 'Service indisponible' };
  }

  logTest('SoilGrids Service Status', 'PASS', `Service disponible (${serviceStatus.status})`);

  const requestFn = async () => {
    const url = `${REAL_APIS.soilgrids.baseUrl}${REAL_APIS.soilgrids.endpoints.properties}`;
    const params = {
      lon: TEST_LOCATION.longitude,
      lat: TEST_LOCATION.latitude,
      property: 'phh2o,soc,nitrogen,cec,clay,sand,silt',
      depth: '0-5cm,5-15cm,15-30cm',
      value: 'mean'
    };

    log(`📡 Requête: ${url}`, 'blue');
    log(`📍 Paramètres: ${JSON.stringify(params)}`, 'blue');

    return await axios.get(url, {
      params,
      timeout: REAL_APIS.soilgrids.timeout,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0',
        'Accept': 'application/json'
      }
    });
  };

  try {
    const response = await retryRequest(requestFn, REAL_APIS.soilgrids.retries);

    if (response.status === 200 && response.data) {
      logTest('SoilGrids API Data', 'PASS',
        `Status: ${response.status}, Données reçues: ${JSON.stringify(response.data).length} caractères`);

      // Analyser la structure des données
      if (response.data.properties) {
        log(`📊 Propriétés disponibles: ${Object.keys(response.data.properties).join(', ')}`, 'green');

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
    } else {
      logTest('SoilGrids API Data', 'WARN', 'Réponse vide ou invalide');
      return { success: false, error: 'Réponse invalide' };
    }

  } catch (error) {
    const errorStatus = error.response?.status || 'Network Error';
    const errorMessage = error.response?.data?.message || error.message;

    logTest('SoilGrids API Data', 'FAIL',
      `Erreur: ${errorStatus} - ${errorMessage}`);

    if (error.response?.data) {
      log(`📄 Détails erreur: ${JSON.stringify(error.response.data)}`, 'red');
    }

    // Suggestions basées sur le type d'erreur
    if (errorStatus === 500) {
      log(`💡 Suggestion: Service temporairement indisponible, réessayer plus tard`, 'yellow');
    } else if (errorStatus === 400) {
      log(`💡 Suggestion: Vérifier les paramètres de la requête`, 'yellow');
    } else if (errorStatus === 'Network Error') {
      log(`💡 Suggestion: Problème de connectivité réseau`, 'yellow');
    }

    return { success: false, error: errorMessage };
  }
}

// Test FAO FAOSTAT API avec URL corrigée
async function testFAOAPI() {
  logSection('Test FAO FAOSTAT API (URL Corrigée)');

  // Vérifier le statut du service
  const serviceStatus = await checkServiceStatus(REAL_APIS.fao.baseUrl);
  if (!serviceStatus.available) {
    logTest('FAO Service Status', 'FAIL',
      `Service indisponible: ${serviceStatus.status} - ${serviceStatus.error}`);
    return { success: false, error: 'Service indisponible' };
  }

  logTest('FAO Service Status', 'PASS', `Service disponible (${serviceStatus.status})`);

  const domainsRequestFn = async () => {
    const domainsUrl = `${REAL_APIS.fao.baseUrl}${REAL_APIS.fao.endpoints.domains}`;
    log(`📡 Requête domaines: ${domainsUrl}`, 'blue');

    return await axios.get(domainsUrl, {
      timeout: REAL_APIS.fao.timeout,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0',
        'Accept': 'application/json'
      }
    });
  };

  try {
    const domainsResponse = await retryRequest(domainsRequestFn, REAL_APIS.fao.retries);

    if (domainsResponse.status === 200) {
      logTest('FAO Domaines API', 'PASS',
        `Status: ${domainsResponse.status}, Domaines: ${domainsResponse.data?.data?.length || 0}`);

      // Chercher le domaine pour les rendements agricoles
      const cropDomain = domainsResponse.data?.data?.find(d =>
        d.code === 'QCL' || d.description?.toLowerCase().includes('crop')
      );

      if (cropDomain) {
        log(`🌾 Domaine cultures trouvé: ${cropDomain.code} - ${cropDomain.description}`, 'green');
      }
    }
    
    // Tester l'endpoint des données avec le Bénin
    const dataRequestFn = async () => {
      const dataUrl = `${REAL_APIS.fao.baseUrl}${REAL_APIS.fao.endpoints.data}`;
      const dataParams = {
        area: 'BEN', // Code Bénin
        element: '5312', // Yield
        item: '56', // Maize
        year: '2020,2021,2022',
        show_codes: true,
        show_unit: true,
        show_flags: true,
        null_values: false,
        page_size: 100
      };

      log(`📡 Requête données: ${dataUrl}`, 'blue');
      log(`📊 Paramètres: ${JSON.stringify(dataParams)}`, 'blue');

      return await axios.get(dataUrl, {
        params: dataParams,
        timeout: REAL_APIS.fao.timeout,
        headers: {
          'User-Agent': 'ClimInvest-Test/1.0',
          'Accept': 'application/json'
        }
      });
    };

    const dataResponse = await retryRequest(dataRequestFn, REAL_APIS.fao.retries);

    if (dataResponse.status === 200 && dataResponse.data?.data) {
      logTest('FAO Données API', 'PASS',
        `Status: ${dataResponse.status}, Enregistrements: ${dataResponse.data.data.length}`);

      // Afficher quelques exemples de données
      const sampleData = dataResponse.data.data.slice(0, 3);
      sampleData.forEach(record => {
        log(`📈 ${record.Year}: ${record.Value} ${record.Unit}`, 'green');
      });

      return { success: true, data: dataResponse.data };
    } else {
      logTest('FAO Données API', 'WARN', 'Pas de données trouvées');
      return { success: false, error: 'Pas de données' };
    }

  } catch (error) {
    const errorStatus = error.response?.status || 'Network Error';
    const errorMessage = error.response?.data?.message || error.message;

    logTest('FAO API Data', 'FAIL',
      `Erreur: ${errorStatus} - ${errorMessage}`);

    if (error.response?.data) {
      log(`📄 Détails erreur: ${JSON.stringify(error.response.data)}`, 'red');
    }

    // Suggestions basées sur le type d'erreur
    if (errorStatus === 'ECONNABORTED' || error.code === 'ECONNABORTED') {
      log(`💡 Suggestion: Timeout - L'API FAO peut être lente, augmenter le timeout`, 'yellow');
    } else if (errorStatus === 404) {
      log(`💡 Suggestion: Endpoint non trouvé - Vérifier la documentation FAO`, 'yellow');
    }

    return { success: false, error: errorMessage };
  }
}

// Test OpenWeatherMap API (pour données météo complémentaires)
async function testOpenWeatherAPI() {
  logSection('Test OpenWeatherMap API');
  
  if (!REAL_APIS.openweather.apiKey || REAL_APIS.openweather.apiKey === 'demo_key') {
    logTest('OpenWeatherMap API', 'WARN', 'Clé API manquante (OPENWEATHERMAP_API_KEY)');
    return { success: false, error: 'Clé API manquante' };
  }
  
  try {
    const url = `${REAL_APIS.openweather.baseUrl}${REAL_APIS.openweather.endpoints.current}`;
    const params = {
      lat: TEST_LOCATION.latitude,
      lon: TEST_LOCATION.longitude,
      appid: REAL_APIS.openweather.apiKey,
      units: 'metric',
      lang: 'fr'
    };
    
    log(`📡 Requête: ${url}`, 'blue');
    
    const response = await axios.get(url, { 
      params,
      timeout: 10000
    });
    
    if (response.status === 200 && response.data) {
      logTest('OpenWeatherMap API', 'PASS', 
        `Status: ${response.status}, Ville: ${response.data.name}, Temp: ${response.data.main?.temp}°C`);
      
      return { success: true, data: response.data };
    } else {
      logTest('OpenWeatherMap API', 'WARN', 'Réponse invalide');
      return { success: false, error: 'Réponse invalide' };
    }
    
  } catch (error) {
    logTest('OpenWeatherMap API', 'FAIL', 
      `Erreur: ${error.response?.status || 'Network'} - ${error.message}`);
    
    return { success: false, error: error.message };
  }
}

// Test World Bank Climate API (nouveau système)
async function testWorldBankAPI() {
  logSection('Test World Bank Climate API (CCKP v2)');

  const serviceStatus = await checkServiceStatus(REAL_APIS.worldbank.baseUrl);
  if (!serviceStatus.available) {
    logTest('World Bank Service Status', 'FAIL',
      `Service indisponible: ${serviceStatus.status} - ${serviceStatus.error}`);
    return { success: false, error: 'Service indisponible' };
  }

  const requestFn = async () => {
    // Essayer le nouveau format d'URL
    const url = `${REAL_APIS.worldbank.baseUrl}${REAL_APIS.worldbank.endpoints.climatology}/${TEST_LOCATION.countryCode}/pr/1991/2020`;

    log(`📡 Requête: ${url}`, 'blue');

    return await axios.get(url, {
      timeout: REAL_APIS.worldbank.timeout,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0',
        'Accept': 'application/json'
      }
    });
  };

  try {
    const response = await retryRequest(requestFn, REAL_APIS.worldbank.retries);

    if (response.status === 200 && response.data) {
      logTest('World Bank Climate API', 'PASS',
        `Status: ${response.status}, Données climatiques disponibles`);

      return { success: true, data: response.data };
    } else {
      logTest('World Bank Climate API', 'WARN', 'Réponse invalide');
      return { success: false, error: 'Réponse invalide' };
    }

  } catch (error) {
    const errorStatus = error.response?.status || 'Network Error';
    const errorMessage = error.response?.data?.message || error.message;

    logTest('World Bank Climate API', 'FAIL',
      `Erreur: ${errorStatus} - ${errorMessage}`);

    if (errorStatus === 404) {
      log(`💡 Suggestion: API déprécié - Utiliser NASA POWER comme alternative`, 'yellow');
    }

    return { success: false, error: errorMessage };
  }
}

// Test NASA POWER API (alternative robuste)
async function testNASAPowerAPI() {
  logSection('Test NASA POWER API (Alternative)');

  const requestFn = async () => {
    const params = {
      parameters: 'T2M,PRECTOTCORR,RH2M,WS2M',
      community: 'AG',
      longitude: TEST_LOCATION.longitude,
      latitude: TEST_LOCATION.latitude,
      start: '20230101',
      end: '20231231',
      format: 'JSON'
    };

    const url = REAL_APIS.nasa_power.baseUrl;
    log(`📡 Requête: ${url}`, 'blue');
    log(`📊 Paramètres: ${JSON.stringify(params)}`, 'blue');

    return await axios.get(url, {
      params,
      timeout: REAL_APIS.nasa_power.timeout,
      headers: {
        'User-Agent': 'ClimInvest-Test/1.0',
        'Accept': 'application/json'
      }
    });
  };

  try {
    const response = await retryRequest(requestFn, REAL_APIS.nasa_power.retries);

    if (response.status === 200 && response.data) {
      logTest('NASA POWER API', 'PASS',
        `Status: ${response.status}, Données météo disponibles`);

      // Analyser les paramètres disponibles
      if (response.data.parameters) {
        log(`🛰️ Paramètres disponibles: ${Object.keys(response.data.parameters).join(', ')}`, 'green');
      }

      return { success: true, data: response.data };
    } else {
      logTest('NASA POWER API', 'WARN', 'Réponse invalide');
      return { success: false, error: 'Réponse invalide' };
    }

  } catch (error) {
    const errorStatus = error.response?.status || 'Network Error';
    const errorMessage = error.response?.data?.message || error.message;

    logTest('NASA POWER API', 'FAIL',
      `Erreur: ${errorStatus} - ${errorMessage}`);

    return { success: false, error: errorMessage };
  }
}

// Fonction principale
async function runRealAPITests() {
  log('🔍 Test des vraies APIs OpenEPI et sources de données', 'bright');
  log(`📍 Localisation de test: Cotonou, Bénin (${TEST_LOCATION.latitude}, ${TEST_LOCATION.longitude})`, 'blue');
  
  const results = {
    soilgrids: null,
    fao: null,
    openweather: null,
    worldbank: null,
    nasa_power: null
  };

  // Tester chaque API avec pause entre requêtes
  log('🔄 Test des APIs en cours...', 'cyan');

  results.soilgrids = await testSoilGridsAPI();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Pause plus longue

  results.fao = await testFAOAPI();
  await new Promise(resolve => setTimeout(resolve, 2000));

  results.openweather = await testOpenWeatherAPI();
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.worldbank = await testWorldBankAPI();
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.nasa_power = await testNASAPowerAPI();
  
  // Résumé
  logSection('Résumé des Tests d\'APIs Réelles');
  
  const successCount = Object.values(results).filter(r => r?.success).length;
  const totalCount = Object.keys(results).length;
  
  log(`📊 APIs testées: ${totalCount}`, 'blue');
  log(`✅ APIs fonctionnelles: ${successCount}`, 'green');
  log(`❌ APIs non disponibles: ${totalCount - successCount}`, 'red');
  
  // Recommandations détaillées
  log('\n🎯 Recommandations par API:', 'cyan');

  if (results.soilgrids?.success) {
    log('✅ SoilGrids: Intégrer pour données pédologiques réelles', 'green');
    log('   → Utiliser comme source principale pour analyse du sol', 'reset');
  } else {
    log('❌ SoilGrids: Service temporairement indisponible', 'red');
    log('   → Continuer avec données simulées + retry automatique', 'reset');
  }

  if (results.fao?.success) {
    log('✅ FAO FAOSTAT: Intégrer pour rendements agricoles historiques', 'green');
    log('   → Utiliser pour données historiques de rendement', 'reset');
  } else {
    log('❌ FAO FAOSTAT: API non accessible avec nouvelle URL', 'red');
    log('   → Vérifier documentation officielle FAO', 'reset');
  }

  if (results.openweather?.success) {
    log('✅ OpenWeatherMap: Disponible pour données météo', 'green');
    log('   → Intégrer pour prévisions météo temps réel', 'reset');
  } else {
    log('⚠️  OpenWeatherMap: Clé API requise', 'yellow');
    log('   → Créer compte gratuit sur openweathermap.org', 'reset');
  }

  if (results.worldbank?.success) {
    log('✅ World Bank CCKP: Disponible pour données climatiques', 'green');
    log('   → Utiliser pour données climatiques historiques', 'reset');
  } else {
    log('❌ World Bank CCKP: API v2 non accessible', 'red');
    log('   → Utiliser NASA POWER comme alternative', 'reset');
  }

  if (results.nasa_power?.success) {
    log('✅ NASA POWER: Excellente alternative pour données météo/climat', 'green');
    log('   → Recommandé comme source principale pour données climatiques', 'reset');
  } else {
    log('❌ NASA POWER: Non accessible', 'red');
  }

  // Stratégie recommandée
  log('\n🚀 Stratégie d\'implémentation recommandée:', 'cyan');

  const workingAPIs = Object.values(results).filter(r => r?.success).length;

  if (workingAPIs >= 2) {
    log('✅ Implémentation hybride recommandée:', 'green');
    log('1. Intégrer les APIs fonctionnelles comme sources principales', 'reset');
    log('2. Garder les données simulées comme fallback robuste', 'reset');
    log('3. Implémenter un système de cache pour réduire les appels', 'reset');
    log('4. Ajouter monitoring et alertes pour les APIs défaillantes', 'reset');
  } else {
    log('⚠️  Implémentation avec données simulées recommandée:', 'yellow');
    log('1. Continuer avec le système de données simulées actuel', 'reset');
    log('2. Ajouter les clés API manquantes progressivement', 'reset');
    log('3. Tester périodiquement la disponibilité des APIs', 'reset');
    log('4. Migrer vers les vraies APIs quand elles sont stables', 'reset');
  }

  log('\n📋 Actions immédiates:', 'cyan');
  log('1. Créer compte OpenWeatherMap pour clé API gratuite', 'reset');
  log('2. Implémenter système de retry avec backoff exponentiel', 'reset');
  log('3. Ajouter cache Redis/local pour optimiser les performances', 'reset');
  log('4. Créer monitoring de santé des APIs externes', 'reset');
  
  return results;
}

// Exécuter les tests
if (require.main === module) {
  runRealAPITests().catch(error => {
    log(`❌ Erreur fatale lors des tests: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runRealAPITests };
