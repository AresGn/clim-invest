import axios, { AxiosInstance } from 'axios';
import { SoilData, YieldData, PriceData } from './openEpiAdvancedService';

/**
 * 🔄 Hybrid OpenEPI Service
 *
 * This service uses real APIs when available and simulated data as robust fallback.
 *
 * Based on test results:
 * ✅ NASA POWER: Functional (climate/weather data)
 * ✅ OpenWeatherMap: Functional (requires API key)
 * ❌ SoilGrids: Temporarily unavailable (500 errors)
 * ❌ FAO FAOSTAT: Access issues
 * ❌ World Bank: API v2 not accessible
 */

interface APIStatus {
  available: boolean;
  lastChecked: Date;
  errorCount: number;
  lastError?: string;
}

export class HybridOpenEpiService {
  private nasaPowerClient: AxiosInstance;
  private openWeatherClient: AxiosInstance;
  private apiStatus: Map<string, APIStatus> = new Map();

  // Configuration for functional APIs
  private readonly NASA_POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  private readonly OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || '';

  constructor() {
    // NASA POWER client (no auth required)
    this.nasaPowerClient = axios.create({
      timeout: 20000,
      headers: {
        'User-Agent': 'ClimInvest/1.0',
        'Accept': 'application/json'
      }
    });

    // OpenWeatherMap client
    this.openWeatherClient = axios.create({
      baseURL: this.OPENWEATHER_URL,
      timeout: 15000,
      headers: {
        'User-Agent': 'ClimInvest/1.0',
        'Accept': 'application/json'
      }
    });

    // Initialize API status tracking
    this.initializeAPIStatus();
  }

  private initializeAPIStatus() {
    const apis = ['nasa_power', 'openweather', 'soilgrids', 'fao'];
    apis.forEach(api => {
      this.apiStatus.set(api, {
        available: false,
        lastChecked: new Date(0), // Epoch pour forcer le premier check
        errorCount: 0
      });
    });
  }

  /**
   * Vérifie le statut d'une API avec cache
   */
  private async checkAPIStatus(apiName: string, checkFn: () => Promise<boolean>): Promise<boolean> {
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
        lastError: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Récupère les données météo/climatiques via NASA POWER (API FONCTIONNELLE ✅)
   */
  async getClimateData(lat: number, lon: number, startDate?: string, endDate?: string) {
    try {
      // Paramètres selon la documentation officielle NASA POWER
      const params = {
        parameters: 'T2M,PRECTOTCORR,RH2M,WS10M,ALLSKY_SFC_SW_DWN', // Température, Précipitations, Humidité, Vent, Radiation solaire
        community: 'AG', // Agriculture community
        longitude: lon,
        latitude: lat,
        start: startDate || '20240101', // Format YYYYMMDD
        end: endDate || '20240131',
        format: 'JSON'
      };

      const response = await this.nasaPowerClient.get(this.NASA_POWER_URL, { params });

      if (response.status === 200 && response.data) {
        console.log('✅ Données climatiques NASA POWER récupérées avec succès');
        return this.transformNASAData(response.data);
      }
    } catch (error) {
      console.warn('⚠️ Erreur NASA POWER API, fallback vers données simulées:', error);
    }

    // Fallback vers données simulées
    console.log('🔄 Utilisation de données climatiques simulées');
    return this.generateMockClimateData(lat, lon);
  }

  /**
   * Récupère les données météo actuelles via OpenWeatherMap (API FONCTIONNELLE ✅)
   */
  async getCurrentWeather(lat: number, lon: number) {
    if (!this.OPENWEATHER_API_KEY || this.OPENWEATHER_API_KEY === 'demo_key') {
      console.warn('⚠️ Clé OpenWeatherMap manquante, utilisation de données simulées');
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

      const response = await this.openWeatherClient.get('/weather', { params });

      if (response.status === 200 && response.data) {
        console.log('✅ Données météo OpenWeatherMap récupérées avec succès');
        return this.transformOpenWeatherData(response.data);
      }
    } catch (error) {
      console.warn('⚠️ Erreur OpenWeatherMap API, fallback vers données simulées:', error);
    }

    // Fallback vers données simulées
    console.log('🔄 Utilisation de données météo simulées');
    return this.generateMockWeatherData(lat, lon);
  }

  /**
   * Récupère les données pédologiques (SoilGrids temporairement indisponible ❌)
   */
  async getSoilData(lat: number, lon: number): Promise<SoilData> {
    // Tentative d'appel SoilGrids (peut être réactivé quand le service sera stable)
    try {
      const url = 'https://rest.isric.org/soilgrids/v2.0/properties/query';
      const params = {
        lon,
        lat,
        property: 'phh2o,soc,nitrogen,cec,clay,sand,silt',
        depth: '0-5cm,5-15cm,15-30cm',
        value: 'mean'
      };

      const response = await axios.get(url, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'ClimInvest/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 && response.data) {
        console.log('✅ Données pédologiques SoilGrids récupérées avec succès');
        return this.transformSoilGridsData(response.data);
      }
    } catch (error) {
      console.warn('⚠️ SoilGrids temporairement indisponible (erreur 500), utilisation de données simulées');
    }

    // Fallback vers données simulées (recommandé actuellement)
    console.log('🔄 Utilisation de données pédologiques simulées');
    return this.generateMockSoilData(lat, lon);
  }

  /**
   * Récupère les rendements agricoles (fallback simulé pour FAO)
   */
  async getCropYields(country: string, crop: string, years: number = 5): Promise<YieldData> {
    // FAO FAOSTAT avec problèmes d'accès selon nos tests
    console.log('📊 Utilisation de données de rendement simulées (FAO indisponible)');
    return this.generateMockYieldData(country, crop, years);
  }

  /**
   * Récupère les prix des cultures (données simulées)
   */
  async getCropPrices(crop: string, market: string): Promise<PriceData> {
    // Pas d'API publique fiable pour les prix AMIS
    console.log('💰 Utilisation de données de prix simulées');
    return this.generateMockPriceData(crop, market);
  }

  /**
   * Transforme les données NASA POWER
   */
  private transformNASAData(nasaData: any) {
    return {
      source: 'NASA_POWER',
      location: nasaData.geometry?.coordinates || [],
      parameters: nasaData.parameters || {},
      data_period: {
        start: nasaData.header?.start,
        end: nasaData.header?.end
      },
      quality: 'high'
    };
  }

  /**
   * Transforme les données OpenWeatherMap
   */
  private transformOpenWeatherData(owmData: any) {
    return {
      source: 'OpenWeatherMap',
      location: {
        name: owmData.name,
        country: owmData.sys?.country,
        coordinates: [owmData.coord?.lon, owmData.coord?.lat]
      },
      current: {
        temperature: owmData.main?.temp,
        humidity: owmData.main?.humidity,
        pressure: owmData.main?.pressure,
        wind_speed: owmData.wind?.speed,
        description: owmData.weather?.[0]?.description
      },
      quality: 'high'
    };
  }

  /**
   * Transforme les données SoilGrids en format SoilData
   */
  private transformSoilGridsData(soilGridsData: any): SoilData {
    const properties = soilGridsData.properties || {};

    // Extraire les valeurs pour la profondeur 0-5cm (première couche)
    const getFirstDepthValue = (property: string) => {
      const prop = properties[property];
      if (!prop) return 0;
      const firstDepth = Object.keys(prop)[0];
      return firstDepth ? prop[firstDepth] : 0;
    };

    const soilData: SoilData = {
      ph: getFirstDepthValue('phh2o') / 10, // SoilGrids donne pH * 10
      organic_carbon: getFirstDepthValue('soc') / 10, // g/kg -> %
      nitrogen: getFirstDepthValue('nitrogen') / 100, // cg/kg -> %
      phosphorus: getFirstDepthValue('cec') / 10, // Utiliser CEC comme proxy pour P
      potassium: 0.3, // Pas disponible dans SoilGrids, valeur par défaut
      clay_content: getFirstDepthValue('clay') / 10, // g/kg -> %
      sand_content: getFirstDepthValue('sand') / 10, // g/kg -> %
      silt_content: getFirstDepthValue('silt') / 10, // g/kg -> %
      bulk_density: 1.4, // Valeur typique, pas dans SoilGrids
      water_holding_capacity: 18, // Calculé approximativement
      quality_score: 0,
      suitability: 'good'
    };

    // Calculer le score de qualité
    soilData.quality_score = this.calculateSoilQualityScore(soilData);
    soilData.suitability = this.determineSoilSuitability(soilData.quality_score);

    return soilData;
  }

  /**
   * Génère des données climatiques simulées
   */
  private generateMockClimateData(lat: number, lon: number) {
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

  /**
   * Génère des données météo simulées
   */
  private generateMockWeatherData(lat: number, lon: number) {
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

  /**
   * Génère des données pédologiques simulées
   */
  private generateMockSoilData(lat: number, lon: number): SoilData {
    const mockData: SoilData = {
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
  }

  /**
   * Génère des données de rendement simulées
   */
  private generateMockYieldData(country: string, crop: string, years: number): YieldData {
    const currentYear = new Date().getFullYear();
    const historical_yields = [];
    
    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i;
      let baseYield = 0;
      
      switch (crop.toLowerCase()) {
        case 'maize': baseYield = 1.2; break;
        case 'cotton': baseYield = 0.8; break;
        case 'rice': baseYield = 2.5; break;
        case 'groundnut': baseYield = 1.0; break;
        case 'cowpea': baseYield = 0.6; break;
        default: baseYield = 1.0;
      }
      
      const variation = (Math.random() - 0.5) * 0.6;
      const yield_value = baseYield * (1 + variation);
      
      historical_yields.push({
        year,
        yield_tons_per_hectare: Math.round(yield_value * 100) / 100
      });
    }

    const average_yield = historical_yields.reduce((sum, y) => sum + y.yield_tons_per_hectare, 0) / historical_yields.length;
    
    const firstHalf = historical_yields.slice(0, Math.floor(years / 2));
    const secondHalf = historical_yields.slice(Math.floor(years / 2));
    const firstAvg = firstHalf.reduce((sum, y) => sum + y.yield_tons_per_hectare, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, y) => sum + y.yield_tons_per_hectare, 0) / secondHalf.length;
    
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
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
  }

  /**
   * Génère des données de prix simulées
   */
  private generateMockPriceData(crop: string, market: string): PriceData {
    let basePrice = 0;
    switch (crop.toLowerCase()) {
      case 'maize': basePrice = 200; break;
      case 'cotton': basePrice = 300; break;
      case 'rice': basePrice = 400; break;
      case 'groundnut': basePrice = 500; break;
      case 'cowpea': basePrice = 350; break;
      default: basePrice = 250;
    }

    const price_history = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + variation);
      
      price_history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price)
      });
    }

    const current_price = price_history[price_history.length - 1].price;
    const previous_price = price_history[price_history.length - 8].price;
    
    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (current_price > previous_price * 1.05) trend = 'rising';
    else if (current_price < previous_price * 0.95) trend = 'falling';

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
  }

  // Fonctions utilitaires (copiées du service original)
  private calculateSoilQualityScore(soil: SoilData): number {
    let score = 0;
    
    if (soil.ph >= 6.0 && soil.ph <= 7.0) score += 20;
    else if (soil.ph >= 5.5 && soil.ph <= 7.5) score += 15;
    else score += 5;
    
    if (soil.organic_carbon > 2.0) score += 20;
    else if (soil.organic_carbon > 1.5) score += 15;
    else if (soil.organic_carbon > 1.0) score += 10;
    else score += 5;
    
    if (soil.nitrogen > 0.2) score += 15;
    else if (soil.nitrogen > 0.15) score += 12;
    else if (soil.nitrogen > 0.1) score += 8;
    else score += 3;
    
    if (soil.phosphorus > 15) score += 15;
    else if (soil.phosphorus > 10) score += 12;
    else if (soil.phosphorus > 5) score += 8;
    else score += 3;
    
    const textureBalance = Math.abs(soil.clay_content - 30) + Math.abs(soil.sand_content - 40) + Math.abs(soil.silt_content - 30);
    if (textureBalance < 20) score += 15;
    else if (textureBalance < 40) score += 10;
    else score += 5;
    
    if (soil.water_holding_capacity > 20) score += 15;
    else if (soil.water_holding_capacity > 15) score += 12;
    else if (soil.water_holding_capacity > 10) score += 8;
    else score += 3;
    
    return Math.min(score, 100);
  }

  private determineSoilSuitability(score: number): 'excellent' | 'good' | 'moderate' | 'poor' {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 45) return 'moderate';
    return 'poor';
  }

  /**
   * Obtient le statut de toutes les APIs
   */
  getAPIStatus() {
    const status: Record<string, any> = {};
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

export const hybridOpenEpiService = new HybridOpenEpiService();
