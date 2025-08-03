/**
 * Service de fallback pour les données météo
 * Fournit des données par défaut quand les APIs ne sont pas disponibles
 */

export interface FallbackWeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
}

export interface FallbackForecastData {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    precipitation_probability_max: number[];
  };
}

class WeatherFallbackService {
  /**
   * Génère des données météo par défaut basées sur la région (Burkina Faso)
   */
  generateDefaultCurrentWeather(lat: number, lon: number): FallbackWeatherData {
    // Données typiques pour le Burkina Faso selon la saison
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    
    let temperature = 30; // Température de base
    let humidity = 50;
    let precipitation = 0;
    
    // Ajustements saisonniers pour le Burkina Faso
    if (month >= 6 && month <= 9) {
      // Saison des pluies (juin-septembre)
      temperature = 28;
      humidity = 75;
      precipitation = Math.random() > 0.7 ? Math.random() * 10 : 0;
    } else if (month >= 10 && month <= 2) {
      // Saison sèche fraîche (octobre-février)
      temperature = 25;
      humidity = 30;
      precipitation = 0;
    } else {
      // Saison sèche chaude (mars-mai)
      temperature = 35;
      humidity = 25;
      precipitation = 0;
    }
    
    // Variation légère basée sur les coordonnées
    const latVariation = (lat - 12) * 0.5; // Burkina Faso centré sur 12°N
    temperature += latVariation;
    
    return {
      current: {
        temperature_2m: Math.round(temperature),
        relative_humidity_2m: Math.round(humidity),
        precipitation: Math.round(precipitation * 10) / 10,
        wind_speed_10m: Math.round((Math.random() * 10 + 5) * 10) / 10,
        wind_direction_10m: Math.round(Math.random() * 360)
      }
    };
  }

  /**
   * Génère des prévisions par défaut pour 7 jours
   */
  generateDefaultForecast(lat: number, lon: number): FallbackForecastData {
    const dates: string[] = [];
    const tempMax: number[] = [];
    const tempMin: number[] = [];
    const precipitation: number[] = [];
    const windSpeed: number[] = [];
    const precipitationProb: number[] = [];
    
    const now = new Date();
    const month = now.getMonth() + 1;
    
    // Températures de base selon la saison
    let baseTempMax = 35;
    let baseTempMin = 20;
    let baseRainChance = 0.1;
    
    if (month >= 6 && month <= 9) {
      // Saison des pluies
      baseTempMax = 30;
      baseTempMin = 22;
      baseRainChance = 0.6;
    } else if (month >= 10 && month <= 2) {
      // Saison sèche fraîche
      baseTempMax = 28;
      baseTempMin = 15;
      baseRainChance = 0.05;
    }
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
      
      // Variation aléatoire légère
      const variation = (Math.random() - 0.5) * 6;
      tempMax.push(Math.round(baseTempMax + variation));
      tempMin.push(Math.round(baseTempMin + variation));
      
      // Précipitations
      const willRain = Math.random() < baseRainChance;
      precipitation.push(willRain ? Math.round(Math.random() * 20 * 10) / 10 : 0);
      precipitationProb.push(Math.round(baseRainChance * 100 + (Math.random() - 0.5) * 20));
      
      windSpeed.push(Math.round((Math.random() * 8 + 3) * 10) / 10);
    }
    
    return {
      daily: {
        time: dates,
        temperature_2m_max: tempMax,
        temperature_2m_min: tempMin,
        precipitation_sum: precipitation,
        wind_speed_10m_max: windSpeed,
        precipitation_probability_max: precipitationProb
      }
    };
  }

  /**
   * Vérifie si nous sommes en mode hors ligne
   */
  isOfflineMode(): boolean {
    // Dans un vrai environnement, on vérifierait la connectivité réseau
    // Pour l'instant, on retourne false
    return false;
  }

  /**
   * Obtient des données météo de secours avec un message d'avertissement
   */
  getFallbackWeatherData(lat: number, lon: number): {
    current: FallbackWeatherData;
    forecast: FallbackForecastData;
    warning: string;
  } {
    console.log('🔄 Utilisation des données météo de secours');
    
    return {
      current: this.generateDefaultCurrentWeather(lat, lon),
      forecast: this.generateDefaultForecast(lat, lon),
      warning: 'Données météo estimées - Connexion limitée'
    };
  }
}

export const weatherFallbackService = new WeatherFallbackService();
