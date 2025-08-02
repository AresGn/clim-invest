import { openEpiService } from './openEpiService';
import { openMeteoService } from './openMeteoService';
import axios from 'axios';
import { ENV_CONFIG } from '../config/env';

export interface ValidationResult {
  openEpiData: any;
  openMeteoData: any;
  meteoBurkinaData: any;
  validation: {
    precipitationVariance: number;
    temperatureVariance: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    warnings: string[];
    recommendations: string[];
  };
}

export interface WeatherDataPoint {
  source: string;
  precipitation: number;
  temperatureMax: number;
  temperatureMin: number;
  humidity?: number;
  windSpeed?: number;
}

class WeatherValidationService {
  
  async validateWeatherData(
    lat: number, 
    lon: number, 
    date: string
  ): Promise<ValidationResult> {
    try {
      console.log(`🔍 Validation des données météo pour ${date} à (${lat}, ${lon})`);

      // Récupération des données depuis différentes sources
      const [openEpiData, openMeteoData, meteoBurkinaData] = await Promise.allSettled([
        this.getOpenEpiData(lat, lon, date),
        this.getOpenMeteoData(lat, lon, date),
        this.getMeteoBurkinaData(lat, lon, date)
      ]);

      // Extraction des valeurs pour validation
      const dataPoints: WeatherDataPoint[] = [];

      if (openEpiData.status === 'fulfilled' && openEpiData.value) {
        dataPoints.push({
          source: 'OpenEPI',
          precipitation: openEpiData.value.daily?.precipitation_sum?.[0] || 0,
          temperatureMax: openEpiData.value.daily?.temperature_2m_max?.[0] || 0,
          temperatureMin: openEpiData.value.daily?.temperature_2m_min?.[0] || 0,
          humidity: openEpiData.value.daily?.relative_humidity_2m?.[0],
          windSpeed: openEpiData.value.daily?.wind_speed_10m?.[0]
        });
      }

      if (openMeteoData.status === 'fulfilled' && openMeteoData.value) {
        dataPoints.push({
          source: 'Open-Meteo',
          precipitation: openMeteoData.value.daily?.precipitation_sum?.[0] || 0,
          temperatureMax: openMeteoData.value.daily?.temperature_2m_max?.[0] || 0,
          temperatureMin: openMeteoData.value.daily?.temperature_2m_min?.[0] || 0,
          humidity: openMeteoData.value.daily?.relative_humidity_2m?.[0],
          windSpeed: openMeteoData.value.daily?.wind_speed_10m?.[0]
        });
      }

      if (meteoBurkinaData.status === 'fulfilled' && meteoBurkinaData.value) {
        dataPoints.push({
          source: 'Météo Burkina',
          precipitation: meteoBurkinaData.value.precipitation || 0,
          temperatureMax: meteoBurkinaData.value.temperatureMax || 0,
          temperatureMin: meteoBurkinaData.value.temperatureMin || 0,
          humidity: meteoBurkinaData.value.humidity,
          windSpeed: meteoBurkinaData.value.windSpeed
        });
      }

      // Calcul des variances et validation
      const validation = this.calculateValidation(dataPoints);

      return {
        openEpiData: openEpiData.status === 'fulfilled' ? openEpiData.value : null,
        openMeteoData: openMeteoData.status === 'fulfilled' ? openMeteoData.value : null,
        meteoBurkinaData: meteoBurkinaData.status === 'fulfilled' ? meteoBurkinaData.value : null,
        validation
      };

    } catch (error) {
      console.error('❌ Erreur validation données météo:', error);
      throw new Error('Impossible de valider les données météorologiques');
    }
  }

  private async getOpenEpiData(lat: number, lon: number, date: string) {
    try {
      return await openEpiService.getHistorical({
        variables: ['precipitation_sum', 'temperature_2m_max', 'temperature_2m_min', 'relative_humidity_2m', 'wind_speed_10m'],
        bbox: [lon - 0.05, lat - 0.05, lon + 0.05, lat + 0.05],
        start: date,
        end: date
      });
    } catch (error) {
      console.warn('⚠️ Données OpenEPI non disponibles:', error);
      return null;
    }
  }

  private async getOpenMeteoData(lat: number, lon: number, date: string) {
    try {
      return await openMeteoService.getHistoricalWeather(lat, lon, date, date);
    } catch (error) {
      console.warn('⚠️ Données Open-Meteo non disponibles:', error);
      return null;
    }
  }

  private async getMeteoBurkinaData(lat: number, lon: number, date: string) {
    try {
      // Simulation d'appel à l'API Météo Burkina (WIS2)
      // En réalité, vous devrez adapter selon leur documentation
      const response = await axios.get(`${ENV_CONFIG.METEO_BURKINA_BASE_URL}/observations`, {
        params: {
          lat: lat,
          lon: lon,
          start: date,
          end: date
        },
        timeout: 10000
      });

      return response.data?.[0] || null;
    } catch (error) {
      console.warn('⚠️ Données Météo Burkina non disponibles:', error);
      return null;
    }
  }

  private calculateValidation(dataPoints: WeatherDataPoint[]) {
    if (dataPoints.length < 2) {
      return {
        precipitationVariance: 0,
        temperatureVariance: 0,
        dataQuality: 'poor' as const,
        warnings: ['Données insuffisantes pour validation'],
        recommendations: ['Vérifier la connectivité réseau', 'Réessayer plus tard']
      };
    }

    // Calcul des moyennes
    const avgPrecipitation = dataPoints.reduce((sum, dp) => sum + dp.precipitation, 0) / dataPoints.length;
    const avgTempMax = dataPoints.reduce((sum, dp) => sum + dp.temperatureMax, 0) / dataPoints.length;

    // Calcul des variances
    const precipitationVariance = dataPoints.reduce((sum, dp) => 
      sum + Math.pow(dp.precipitation - avgPrecipitation, 2), 0) / dataPoints.length;
    
    const temperatureVariance = dataPoints.reduce((sum, dp) => 
      sum + Math.pow(dp.temperatureMax - avgTempMax, 2), 0) / dataPoints.length;

    // Calcul des écarts relatifs
    const precipitationCV = avgPrecipitation > 0 ? Math.sqrt(precipitationVariance) / avgPrecipitation : 0;
    const temperatureCV = avgTempMax > 0 ? Math.sqrt(temperatureVariance) / avgTempMax : 0;

    // Détermination de la qualité des données
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (precipitationCV < 0.1 && temperatureCV < 0.05) {
      dataQuality = 'excellent';
    } else if (precipitationCV < 0.2 && temperatureCV < 0.1) {
      dataQuality = 'good';
    } else if (precipitationCV < 0.4 && temperatureCV < 0.15) {
      dataQuality = 'fair';
      warnings.push('Écarts modérés entre les sources de données');
      recommendations.push('Surveiller les tendances sur plusieurs jours');
    } else {
      dataQuality = 'poor';
      warnings.push('Écarts importants entre les sources de données');
      recommendations.push('Vérification manuelle recommandée');
      recommendations.push('Utiliser des données de stations locales si disponibles');
    }

    // Ajouter des avertissements spécifiques
    if (precipitationCV > 0.3) {
      warnings.push(`Forte variance des précipitations (${(precipitationCV * 100).toFixed(1)}%)`);
    }
    
    if (temperatureCV > 0.1) {
      warnings.push(`Variance température élevée (${(temperatureCV * 100).toFixed(1)}%)`);
    }

    return {
      precipitationVariance,
      temperatureVariance,
      dataQuality,
      warnings,
      recommendations
    };
  }

  // Méthode pour obtenir des données fiables (moyenne pondérée)
  async getReliableWeatherData(lat: number, lon: number, date: string) {
    const validation = await this.validateWeatherData(lat, lon, date);
    
    // Si la qualité est bonne, retourner la moyenne
    if (validation.validation.dataQuality === 'excellent' || validation.validation.dataQuality === 'good') {
      return {
        precipitation: this.getAverageValue([
          validation.openEpiData?.daily?.precipitation_sum?.[0],
          validation.openMeteoData?.daily?.precipitation_sum?.[0],
          validation.meteoBurkinaData?.precipitation
        ]),
        temperatureMax: this.getAverageValue([
          validation.openEpiData?.daily?.temperature_2m_max?.[0],
          validation.openMeteoData?.daily?.temperature_2m_max?.[0],
          validation.meteoBurkinaData?.temperatureMax
        ]),
        temperatureMin: this.getAverageValue([
          validation.openEpiData?.daily?.temperature_2m_min?.[0],
          validation.openMeteoData?.daily?.temperature_2m_min?.[0],
          validation.meteoBurkinaData?.temperatureMin
        ]),
        quality: validation.validation.dataQuality,
        sources: validation.validation.warnings.length === 0 ? 'multiple' : 'limited'
      };
    }

    // Sinon, privilégier Open-Meteo (plus fiable généralement)
    return {
      precipitation: validation.openMeteoData?.daily?.precipitation_sum?.[0] || 0,
      temperatureMax: validation.openMeteoData?.daily?.temperature_2m_max?.[0] || 0,
      temperatureMin: validation.openMeteoData?.daily?.temperature_2m_min?.[0] || 0,
      quality: validation.validation.dataQuality,
      sources: 'fallback'
    };
  }

  private getAverageValue(values: (number | undefined)[]): number {
    const validValues = values.filter(v => v !== undefined && v !== null) as number[];
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }
}

// Instance singleton
export const weatherValidationService = new WeatherValidationService();
