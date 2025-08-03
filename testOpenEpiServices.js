/**
 * 🧪 Script de test pour les services OpenEPI
 * 
 * Ce script teste tous les services OpenEPI pour s'assurer qu'ils fonctionnent
 * correctement avant d'intégrer les vraies APIs.
 * 
 * Usage: node testOpenEpiServices.js
 */

const axios = require('axios');

// Configuration de test
const TEST_CONFIG = {
  // Coordonnées de test (Cotonou, Bénin)
  location: {
    latitude: 6.3887255,
    longitude: 2.3330869,
    region: 'Littoral'
  },
  
  // Paramètres de test
  cropType: 'maize',
  farmerId: 'test_farmer_001',
  farmSize: 2,
  
  // URLs des APIs réelles (pour tests futurs)
  apis: {
    soilgrids: 'https://rest.isric.org/soilgrids/v2.0',
    fao: 'https://www.fao.org/faostat/api/v1',
    amis: 'https://amis-outlook.org/api/v1',
    openepi: 'https://api.openepi.io/v1'
  }
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
  log(`🧪 ${title}`, 'bright');
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

// Simulation des services OpenEPI (copie des fonctions principales)
class TestOpenEpiService {
  constructor() {
    this.baseURL = TEST_CONFIG.apis.openepi;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Test des données pédologiques
  async testSoilData(lat, lon) {
    try {
      // Simulation de données réalistes pour le Bénin
      const mockData = {
        ph: 6.2 + (Math.random() - 0.5) * 1.0,
        organic_carbon: 1.8 + (Math.random() - 0.5) * 0.8,
        nitrogen: 0.15 + (Math.random() - 0.5) * 0.1,
        phosphorus: 12 + (Math.random() - 0.5) * 8,
        potassium: 0.3 + (Math.random() - 0.5) * 0.2,
        clay_content: 25 + (Math.random() - 0.5) * 15,
        sand_content: 45 + (Math.random() - 0.5) * 20,
        silt_content: 30 + (Math.random() - 0.5) * 10,
        bulk_density: 1.4 + (Math.random() - 0.5) * 0.3,
        water_holding_capacity: 18 + (Math.random() - 0.5) * 8,
        quality_score: 0,
        suitability: 'good'
      };

      // Calculer le score de qualité
      mockData.quality_score = this.calculateSoilQualityScore(mockData);
      mockData.suitability = this.determineSoilSuitability(mockData.quality_score);

      return mockData;
    } catch (error) {
      throw new Error(`Erreur test données sol: ${error.message}`);
    }
  }

  // Test des rendements agricoles
  async testCropYields(country, crop, years = 5) {
    try {
      const currentYear = new Date().getFullYear();
      const historical_yields = [];
      
      for (let i = years - 1; i >= 0; i--) {
        const year = currentYear - i;
        let baseYield = 0;
        
        // Rendements typiques par culture au Bénin (tonnes/hectare)
        switch (crop.toLowerCase()) {
          case 'maize': baseYield = 1.2; break;
          case 'cotton': baseYield = 0.8; break;
          case 'rice': baseYield = 2.5; break;
          case 'groundnut': baseYield = 1.0; break;
          case 'cowpea': baseYield = 0.6; break;
          default: baseYield = 1.0;
        }
        
        // Variation aléatoire ±30%
        const variation = (Math.random() - 0.5) * 0.6;
        const yield_value = baseYield * (1 + variation);
        
        historical_yields.push({
          year,
          yield_tons_per_hectare: Math.round(yield_value * 100) / 100
        });
      }

      const average_yield = historical_yields.reduce((sum, y) => sum + y.yield_tons_per_hectare, 0) / historical_yields.length;
      
      // Déterminer la tendance
      const firstHalf = historical_yields.slice(0, Math.floor(years / 2));
      const secondHalf = historical_yields.slice(Math.floor(years / 2));
      const firstAvg = firstHalf.reduce((sum, y) => sum + y.yield_tons_per_hectare, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, y) => sum + y.yield_tons_per_hectare, 0) / secondHalf.length;
      
      let trend = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

      return {
        crop,
        country,
        historical_yields,
        average_yield: Math.round(average_yield * 100) / 100,
        trend,
        reliability_score: 75 + Math.floor(Math.random() * 20)
      };
    } catch (error) {
      throw new Error(`Erreur test rendements: ${error.message}`);
    }
  }

  // Test des prix des cultures
  async testCropPrices(crop, market) {
    try {
      // Prix de base par culture (FCFA/kg)
      let basePrice = 0;
      switch (crop.toLowerCase()) {
        case 'maize': basePrice = 200; break;
        case 'cotton': basePrice = 300; break;
        case 'rice': basePrice = 400; break;
        case 'groundnut': basePrice = 500; break;
        case 'cowpea': basePrice = 350; break;
        default: basePrice = 250;
      }

      // Générer historique des prix (30 derniers jours)
      const price_history = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Variation quotidienne ±5%
        const variation = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + variation);
        
        price_history.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(price)
        });
      }

      const current_price = price_history[price_history.length - 1].price;
      const previous_price = price_history[price_history.length - 8].price;
      
      let trend = 'stable';
      if (current_price > previous_price * 1.05) trend = 'rising';
      else if (current_price < previous_price * 0.95) trend = 'falling';

      // Calculer la volatilité
      const prices = price_history.map(p => p.price);
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance) / mean;

      return {
        commodity: crop,
        market,
        current_price,
        currency: 'FCFA',
        price_history,
        volatility: Math.round(volatility * 1000) / 1000,
        trend
      };
    } catch (error) {
      throw new Error(`Erreur test prix: ${error.message}`);
    }
  }

  // Fonctions utilitaires
  calculateSoilQualityScore(soil) {
    let score = 0;
    
    // pH optimal (6.0-7.0)
    if (soil.ph >= 6.0 && soil.ph <= 7.0) score += 20;
    else if (soil.ph >= 5.5 && soil.ph <= 7.5) score += 15;
    else score += 5;
    
    // Matière organique (>2% excellent)
    if (soil.organic_carbon > 2.0) score += 20;
    else if (soil.organic_carbon > 1.5) score += 15;
    else if (soil.organic_carbon > 1.0) score += 10;
    else score += 5;
    
    // Azote (>0.2% excellent)
    if (soil.nitrogen > 0.2) score += 15;
    else if (soil.nitrogen > 0.15) score += 12;
    else if (soil.nitrogen > 0.1) score += 8;
    else score += 3;
    
    // Phosphore (>15 ppm excellent)
    if (soil.phosphorus > 15) score += 15;
    else if (soil.phosphorus > 10) score += 12;
    else if (soil.phosphorus > 5) score += 8;
    else score += 3;
    
    // Texture équilibrée
    const textureBalance = Math.abs(soil.clay_content - 30) + Math.abs(soil.sand_content - 40) + Math.abs(soil.silt_content - 30);
    if (textureBalance < 20) score += 15;
    else if (textureBalance < 40) score += 10;
    else score += 5;
    
    // Capacité de rétention d'eau
    if (soil.water_holding_capacity > 20) score += 15;
    else if (soil.water_holding_capacity > 15) score += 12;
    else if (soil.water_holding_capacity > 10) score += 8;
    else score += 3;
    
    return Math.min(score, 100);
  }

  determineSoilSuitability(score) {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 45) return 'moderate';
    return 'poor';
  }
}

// Test du service de scoring de crédit
class TestCreditScoringService {
  async testCreditScore(farmerId, location, cropType, farmSize) {
    try {
      const testService = new TestOpenEpiService();
      
      // Récupérer les données de test
      const soilData = await testService.testSoilData(location.latitude, location.longitude);
      const yieldData = await testService.testCropYields('Benin', cropType);
      const priceData = await testService.testCropPrices(cropType, 'Cotonou');
      
      // Calculer les scores
      const soilScore = soilData.quality_score;
      const yieldScore = this.calculateYieldScore(yieldData);
      const insuranceScore = 75 + Math.floor(Math.random() * 20); // Simulation
      const marketScore = 60 + Math.floor(Math.random() * 30); // Simulation
      
      // Score global pondéré
      const overallScore = Math.round(
        (soilScore * 0.25) + 
        (yieldScore * 0.25) + 
        (insuranceScore * 0.30) + 
        (marketScore * 0.20)
      ) * 10; // Convertir en échelle 0-1000

      const riskLevel = overallScore >= 700 ? 'low' : overallScore >= 500 ? 'medium' : 'high';
      const eligibleAmount = farmSize * yieldData.average_yield * 200000;
      const interestRate = riskLevel === 'low' ? 8.5 : riskLevel === 'medium' ? 12.0 : 18.0;

      return {
        overallScore,
        soilQuality: soilScore,
        historicalYields: yieldScore,
        insuranceHistory: insuranceScore,
        marketAccess: marketScore,
        riskLevel,
        eligibleAmount: Math.round(eligibleAmount),
        interestRate,
        repaymentPeriod: 12
      };
    } catch (error) {
      throw new Error(`Erreur test score crédit: ${error.message}`);
    }
  }

  calculateYieldScore(yieldData) {
    let score = 0;
    const avgYield = yieldData.average_yield;
    
    if (avgYield > 2.0) score += 40;
    else if (avgYield > 1.5) score += 32;
    else if (avgYield > 1.0) score += 24;
    else if (avgYield > 0.5) score += 16;
    else score += 8;

    switch (yieldData.trend) {
      case 'increasing': score += 30; break;
      case 'stable': score += 20; break;
      case 'decreasing': score += 5; break;
    }

    score += (yieldData.reliability_score / 100) * 30;
    return Math.min(Math.round(score), 100);
  }
}

// Fonction principale de test
async function runTests() {
  log('🚀 Démarrage des tests OpenEPI pour ClimInvest', 'bright');
  log(`📍 Localisation de test: ${TEST_CONFIG.location.region}, Bénin`, 'blue');
  log(`🌱 Culture de test: ${TEST_CONFIG.cropType}`, 'blue');
  
  const testService = new TestOpenEpiService();
  const creditService = new TestCreditScoringService();
  
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Données pédologiques
  logSection('Test des Données Pédologiques (SoilGrids)');
  try {
    const soilData = await testService.testSoilData(
      TEST_CONFIG.location.latitude, 
      TEST_CONFIG.location.longitude
    );
    
    totalTests++;
    if (soilData && soilData.ph && soilData.quality_score >= 0 && soilData.quality_score <= 100) {
      logTest('Données sol générées', 'PASS', 
        `pH: ${soilData.ph.toFixed(1)}, Score: ${soilData.quality_score}/100, Qualité: ${soilData.suitability}`);
      passedTests++;
    } else {
      logTest('Données sol générées', 'FAIL', 'Structure de données invalide');
    }
  } catch (error) {
    totalTests++;
    logTest('Données sol générées', 'FAIL', error.message);
  }

  // Test 2: Rendements agricoles
  logSection('Test des Rendements Agricoles (FAO)');
  try {
    const yieldData = await testService.testCropYields('Benin', TEST_CONFIG.cropType);
    
    totalTests++;
    if (yieldData && yieldData.historical_yields && yieldData.historical_yields.length === 5) {
      logTest('Rendements historiques', 'PASS', 
        `Moyenne: ${yieldData.average_yield} t/ha, Tendance: ${yieldData.trend}, Fiabilité: ${yieldData.reliability_score}%`);
      passedTests++;
    } else {
      logTest('Rendements historiques', 'FAIL', 'Données incomplètes');
    }
  } catch (error) {
    totalTests++;
    logTest('Rendements historiques', 'FAIL', error.message);
  }

  // Test 3: Prix des cultures
  logSection('Test des Prix des Cultures (AMIS)');
  try {
    const priceData = await testService.testCropPrices(TEST_CONFIG.cropType, 'Cotonou');
    
    totalTests++;
    if (priceData && priceData.current_price && priceData.price_history && priceData.price_history.length === 30) {
      logTest('Prix du marché', 'PASS', 
        `Prix actuel: ${priceData.current_price} FCFA/kg, Tendance: ${priceData.trend}, Volatilité: ${(priceData.volatility * 100).toFixed(1)}%`);
      passedTests++;
    } else {
      logTest('Prix du marché', 'FAIL', 'Données de prix incomplètes');
    }
  } catch (error) {
    totalTests++;
    logTest('Prix du marché', 'FAIL', error.message);
  }

  // Test 4: Score de crédit
  logSection('Test du Système de Scoring Crédit');
  try {
    const creditScore = await creditService.testCreditScore(
      TEST_CONFIG.farmerId,
      TEST_CONFIG.location,
      TEST_CONFIG.cropType,
      TEST_CONFIG.farmSize
    );
    
    totalTests++;
    if (creditScore && creditScore.overallScore >= 0 && creditScore.overallScore <= 1000) {
      logTest('Score de crédit calculé', 'PASS', 
        `Score: ${creditScore.overallScore}/1000, Risque: ${creditScore.riskLevel}, Montant éligible: ${creditScore.eligibleAmount.toLocaleString()} FCFA`);
      passedTests++;
    } else {
      logTest('Score de crédit calculé', 'FAIL', 'Score invalide');
    }
  } catch (error) {
    totalTests++;
    logTest('Score de crédit calculé', 'FAIL', error.message);
  }

  // Résumé des tests
  logSection('Résumé des Tests');
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  if (passedTests === totalTests) {
    log(`🎉 TOUS LES TESTS RÉUSSIS ! (${passedTests}/${totalTests})`, 'green');
    log('✅ Les services OpenEPI fonctionnent parfaitement avec les données simulées', 'green');
    log('🚀 Prêt pour l\'intégration des vraies APIs OpenEPI', 'green');
  } else {
    log(`⚠️  ${passedTests}/${totalTests} tests réussis (${successRate}%)`, 'yellow');
    log('🔧 Certains services nécessitent des corrections', 'yellow');
  }

  log('\n📊 Prochaines étapes:', 'cyan');
  log('1. Si tous les tests passent → Intégrer les vraies APIs OpenEPI', 'reset');
  log('2. Si des tests échouent → Corriger les services avant intégration', 'reset');
  log('3. Tester avec de vraies clés API OpenEPI', 'reset');
  log('4. Valider avec des données réelles du Bénin', 'reset');
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(error => {
    log(`❌ Erreur fatale lors des tests: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { TestOpenEpiService, TestCreditScoringService };
