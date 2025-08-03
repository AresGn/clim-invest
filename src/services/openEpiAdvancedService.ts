import axios, { AxiosInstance } from 'axios';

// Types pour les données OpenEPI avancées
export interface SoilData {
  ph: number;
  organic_carbon: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  clay_content: number;
  sand_content: number;
  silt_content: number;
  bulk_density: number;
  water_holding_capacity: number;
  quality_score: number; // 0-100
  suitability: 'excellent' | 'good' | 'moderate' | 'poor';
}

export interface YieldData {
  crop: string;
  country: string;
  historical_yields: {
    year: number;
    yield_tons_per_hectare: number;
  }[];
  average_yield: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  reliability_score: number; // 0-100
}

export interface PriceData {
  commodity: string;
  market: string;
  current_price: number;
  currency: string;
  price_history: {
    date: string;
    price: number;
  }[];
  volatility: number;
  trend: 'rising' | 'stable' | 'falling';
}

export interface ExtendedForecast {
  location: { lat: number; lon: number };
  daily_forecasts: {
    date: string;
    temperature_max: number;
    temperature_min: number;
    precipitation: number;
    humidity: number;
    wind_speed: number;
    weather_code: number;
    risk_level: 'low' | 'medium' | 'high';
  }[];
}

export interface WaterStressData {
  current_index: number; // 0-1 (0 = no stress, 1 = extreme stress)
  status: 'normal' | 'mild_stress' | 'moderate_stress' | 'severe_stress' | 'extreme_stress';
  historical_average: number;
  anomaly: number; // -1 à +1
  recommendations: string[];
}

export interface NDVIData {
  location: { lat: number; lon: number };
  values: {
    date: string;
    ndvi: number;
  }[];
  current_ndvi: number;
  vegetation_health: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

export class OpenEpiAdvancedService {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_OPENEPI_BASE_URL || 'https://api.openepi.io/v1';
    this.apiKey = process.env.EXPO_PUBLIC_OPENEPI_API_KEY || '';

    // Pour le développement, on utilise des données simulées
    // En production, décommentez les lignes ci-dessous pour utiliser les vraies APIs
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Récupère les données pédologiques (SoilGrids, AfSoilGrids)
   */
  async getSoilData(lat: number, lon: number): Promise<SoilData> {
    // Pour le développement, on utilise directement des données simulées
    // En production, décommentez le try/catch pour utiliser les vraies APIs

    // Simulation de données réalistes pour le Bénin
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
   * Récupère les rendements agricoles historiques (FAO Global Crop Yields)
   */
  async getCropYields(country: string, crop: string, years: number = 5): Promise<YieldData> {
    // Pour le développement, on utilise directement des données simulées
    return this.generateMockYieldData(country, crop, years);
  }

  /**
   * Génère des données de rendement simulées réalistes
   */
  private generateMockYieldData(country: string, crop: string, years: number): YieldData {
    const currentYear = new Date().getFullYear();
    const historical_yields = [];

    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i;
      let baseYield = 0;

      // Rendements typiques par culture au Bénin (tonnes/hectare)
      switch (crop.toLowerCase()) {
        case 'maize':
        case 'maïs':
          baseYield = 1.2;
          break;
        case 'cotton':
        case 'coton':
          baseYield = 0.8;
          break;
        case 'rice':
        case 'riz':
          baseYield = 2.5;
          break;
        case 'groundnut':
        case 'arachide':
          baseYield = 1.0;
          break;
        case 'cowpea':
        case 'niébé':
          baseYield = 0.6;
          break;
        default:
          baseYield = 1.0;
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

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (secondAvg > firstAvg * 1.1) trend = 'increasing';
    else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

    return {
      crop,
      country,
      historical_yields,
      average_yield: Math.round(average_yield * 100) / 100,
      trend,
      reliability_score: 75 + Math.floor(Math.random() * 20) // 75-95%
    };
  }

  /**
   * Récupère les prix des cultures en temps réel (AMIS)
   */
  async getCropPrices(crop: string, market: string): Promise<PriceData> {
    // Pour le développement, on utilise directement des données simulées
    return this.generateMockPriceData(crop, market);
  }

  /**
   * Génère des données de prix simulées réalistes
   */
  private generateMockPriceData(crop: string, market: string): PriceData {
    // Simulation de prix réalistes pour le marché béninois (FCFA/kg)
    let basePrice = 0;
    switch (crop.toLowerCase()) {
      case 'maize':
      case 'maïs':
        basePrice = 200;
        break;
      case 'cotton':
      case 'coton':
        basePrice = 300;
        break;
      case 'rice':
      case 'riz':
        basePrice = 400;
        break;
      case 'groundnut':
      case 'arachide':
        basePrice = 500;
        break;
      case 'cowpea':
      case 'niébé':
        basePrice = 350;
        break;
      default:
        basePrice = 250;
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
    const previous_price = price_history[price_history.length - 8].price; // 7 jours avant

    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (current_price > previous_price * 1.05) trend = 'rising';
    else if (current_price < previous_price * 0.95) trend = 'falling';

    // Calculer la volatilité (écart-type des prix)
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

  /**
   * Calcule le score de qualité du sol
   */
  private calculateSoilQualityScore(soil: SoilData): number {
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

  /**
   * Détermine la qualité du sol
   */
  private determineSoilSuitability(score: number): 'excellent' | 'good' | 'moderate' | 'poor' {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 45) return 'moderate';
    return 'poor';
  }
}

export const openEpiAdvancedService = new OpenEpiAdvancedService();
