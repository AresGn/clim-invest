import axios from 'axios';

// Configuration Axios robuste
const weatherAPI = axios.create({
  timeout: 15000, // 15 secondes timeout
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'ClimInvest-App/1.0'
  }
});

export class WeatherService {
  // 🔥 MÉTHODE CORRECTE - Open-Meteo Forecast API avec fallback
  static async getCurrentWeather(latitude: number, longitude: number) {
    try {
      console.log(`🌤️ Récupération météo actuelle pour (${latitude}, ${longitude})`);

      const response = await weatherAPI.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'precipitation',
            'wind_speed_10m',
            'weather_code'
          ].join(','),
          hourly: [
            'temperature_2m',
            'precipitation',
            'wind_speed_10m'
          ].join(','),
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum'
          ].join(','),
          timezone: 'auto',
          forecast_days: 7
        }
      });

      console.log('✅ Météo actuelle récupérée avec succès');
      return {
        current: response.data.current,
        hourly: response.data.hourly,
        daily: response.data.daily,
        location: {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          elevation: response.data.elevation
        }
      };
    } catch (error) {
      console.error('❌ Erreur météo actuelle Open-Meteo:', error);

      // En cas d'erreur, retourner des données par défaut
      console.log('🔄 Utilisation de données météo par défaut');
      const defaultData = this.generateDefaultWeatherData(latitude, longitude);
      return {
        current: defaultData.current,
        hourly: {
          time: [],
          temperature_2m: [],
          precipitation: [],
          wind_speed_10m: []
        },
        daily: {
          time: [],
          temperature_2m_max: [],
          temperature_2m_min: [],
          precipitation_sum: defaultData.daily.precipitation_sum
        },
        location: {
          latitude: latitude,
          longitude: longitude,
          elevation: 300
        }
      };
    }
  }

  // 🔥 MÉTHODE CORRECTE - Open-Meteo Historical API
  static async getHistoricalWeather(
    latitude: number, 
    longitude: number, 
    startDate: string, 
    endDate: string
  ) {
    try {
      console.log(`📊 Récupération données historiques ${startDate} à ${endDate}`);
      
      // Validation des dates (Open-Meteo exige le format YYYY-MM-DD)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      
      // Open-Meteo Historical API : données jusqu'à il y a 2 jours
      const maxHistoricalDate = new Date(today);
      maxHistoricalDate.setDate(today.getDate() - 2);
      
      if (end > maxHistoricalDate) {
        throw new Error(`Données historiques disponibles jusqu'au ${maxHistoricalDate.toISOString().split('T')[0]} seulement`);
      }

      const response = await weatherAPI.get('https://archive-api.open-meteo.com/v1/archive', {
        params: {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          start_date: startDate,
          end_date: endDate,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'wind_speed_10m_max'
          ].join(','),
          timezone: 'auto'
        }
      });

      console.log('✅ Données historiques récupérées avec succès');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          console.error('❌ Erreur 400 - Paramètres invalides:', error.response.data);
          throw new Error(`Paramètres invalides: ${error.response.data.reason || 'Vérifiez les dates et coordonnées'}`);
        }
        console.error('❌ Erreur données historiques Open-Meteo:', error.message);
      }
      throw new Error('Impossible de récupérer les données historiques');
    }
  }

  // 🔥 CALCUL RISQUE CLIMATIQUE SIMPLIFIÉ
  static async analyzeClimateRisk(
    latitude: number,
    longitude: number,
    cropType: string
  ) {
    try {
      console.log(`🌡️ Analyse des risques climatiques pour ${cropType} à (${latitude}, ${longitude})`);

      // Essayer d'utiliser les données météo actuelles et prévisions
      let currentWeather;
      try {
        currentWeather = await this.getCurrentWeather(latitude, longitude);
      } catch (weatherError) {
        console.warn('⚠️ Impossible de récupérer la météo, utilisation de données par défaut');
        // Utiliser des données par défaut basées sur la région
        currentWeather = this.generateDefaultWeatherData(latitude, longitude);
      }

      // Algorithme de risque basé sur les données actuelles
      const riskFactors = {
        temperature: this.calculateTemperatureRisk(currentWeather.current.temperature_2m, cropType),
        precipitation: this.calculatePrecipitationRisk(currentWeather.daily.precipitation_sum, cropType),
        wind: this.calculateWindRisk(currentWeather.current.wind_speed_10m)
      };

      const overallRisk = (riskFactors.temperature + riskFactors.precipitation + riskFactors.wind) / 3;

      console.log('✅ Analyse des risques terminée');
      return {
        overall_risk: Math.min(Math.max(overallRisk, 0), 1), // Entre 0 et 1
        factors: riskFactors,
        recommendation: this.generateRecommendation(overallRisk, cropType)
      };
    } catch (error) {
      console.error('❌ Erreur analyse des risques:', error);
      // Retourner des données par défaut au lieu de faire planter l'app
      return {
        overall_risk: 0.5, // Risque moyen par défaut
        factors: { temperature: 0.5, precipitation: 0.5, wind: 0.3 },
        recommendation: `Surveillance recommandée pour votre culture de ${cropType}`
      };
    }
  }

  // Génère des données météo par défaut pour le Burkina Faso
  private static generateDefaultWeatherData(latitude: number, longitude: number) {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    let temperature = 30;
    let precipitation = [0, 0, 0, 0, 0, 0, 0]; // 7 jours

    // Ajustements saisonniers pour le Burkina Faso
    if (month >= 6 && month <= 9) {
      // Saison des pluies
      temperature = 28;
      precipitation = [5, 10, 0, 15, 8, 0, 12];
    } else if (month >= 10 && month <= 2) {
      // Saison sèche fraîche
      temperature = 25;
    } else {
      // Saison sèche chaude
      temperature = 35;
    }

    return {
      current: {
        temperature_2m: temperature,
        relative_humidity_2m: 50,
        precipitation: 0,
        wind_speed_10m: 10
      },
      daily: {
        precipitation_sum: precipitation
      }
    };
  }

  // Calculs de risque individuels
  private static calculateTemperatureRisk(temperature: number, cropType: string): number {
    const thresholds = {
      'maize': { min: 15, max: 35 },
      'cotton': { min: 20, max: 40 },
      'groundnut': { min: 20, max: 30 },
      'vegetables': { min: 15, max: 25 }
    };
    
    const threshold = thresholds[cropType as keyof typeof thresholds] || thresholds.maize;
    
    if (temperature < threshold.min || temperature > threshold.max) {
      return 0.8; // Risque élevé
    }
    return 0.2; // Risque faible
  }

  private static calculatePrecipitationRisk(precipitationSum: number[], cropType: string): number {
    const recentPrecipitation = precipitationSum.slice(-7).reduce((a, b) => a + b, 0); // 7 derniers jours
    
    if (recentPrecipitation < 5) {
      return 0.9; // Sécheresse - risque très élevé
    } else if (recentPrecipitation > 100) {
      return 0.7; // Inondation potentielle - risque élevé
    }
    return 0.3; // Risque normal
  }

  private static calculateWindRisk(windSpeed: number): number {
    if (windSpeed > 50) {
      return 0.8; // Vents forts - risque élevé
    } else if (windSpeed > 30) {
      return 0.5; // Vents modérés
    }
    return 0.2; // Vents faibles
  }

  private static generateRecommendation(risk: number, cropType: string): string {
    if (risk > 0.7) {
      return `⚠️ ALERTE: Conditions climatiques défavorables pour ${cropType}. Surveillez vos cultures de près.`;
    } else if (risk > 0.4) {
      return `⚡ ATTENTION: Conditions météo à surveiller pour ${cropType}. Restez vigilant.`;
    }
    return `✅ FAVORABLE: Conditions climatiques actuelles favorables pour ${cropType}.`;
  }
}
