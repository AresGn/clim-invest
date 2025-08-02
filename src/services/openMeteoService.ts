import axios, { AxiosInstance } from 'axios';
import { ENV_CONFIG } from '../config/env';

export interface OpenMeteoCurrentWeather {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
}

export interface OpenMeteoForecast {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    precipitation_probability_max: number[];
  };
}

export interface OpenMeteoHistorical {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
  };
}

class OpenMeteoService {
  private client: AxiosInstance;
  private archiveClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV_CONFIG.OPEN_METEO_BASE_URL,
      timeout: 15000,
    });

    this.archiveClient = axios.create({
      baseURL: ENV_CONFIG.OPEN_METEO_ARCHIVE_URL,
      timeout: 15000,
    });
  }

  async getCurrentWeather(lat: number, lon: number): Promise<OpenMeteoCurrentWeather> {
    try {
      const response = await this.client.get('/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'precipitation',
            'wind_speed_10m',
            'wind_direction_10m'
          ].join(','),
          timezone: 'Africa/Ouagadougou'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur météo actuelle Open-Meteo:', error);
      throw new Error('Impossible de récupérer la météo actuelle');
    }
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<OpenMeteoForecast> {
    try {
      const response = await this.client.get('/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'wind_speed_10m_max',
            'precipitation_probability_max'
          ].join(','),
          forecast_days: days,
          timezone: 'Africa/Ouagadougou'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur prévisions Open-Meteo:', error);
      throw new Error('Impossible de récupérer les prévisions');
    }
  }

  async getHistoricalWeather(
    lat: number, 
    lon: number, 
    startDate: string, 
    endDate: string
  ): Promise<OpenMeteoHistorical> {
    try {
      const response = await this.archiveClient.get('/archive', {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: startDate,
          end_date: endDate,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'relative_humidity_2m',
            'wind_speed_10m'
          ].join(','),
          timezone: 'Africa/Ouagadougou'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur données historiques Open-Meteo:', error);
      throw new Error('Impossible de récupérer les données historiques');
    }
  }

  async getPrecipitationDaily(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    try {
      const data = await this.getHistoricalWeather(lat, lon, startDate, endDate);
      return data.daily.precipitation_sum;
    } catch (error) {
      console.error('❌ Erreur précipitations Open-Meteo:', error);
      return [];
    }
  }

  // Calcul de l'évapotranspiration de référence (ET0) selon FAO-56
  calculateET0(
    tempMax: number,
    tempMin: number,
    humidity: number,
    windSpeed: number,
    latitude: number,
    dayOfYear: number
  ): number {
    try {
      const tempMean = (tempMax + tempMin) / 2;
      
      // Pression de vapeur saturante
      const es = (0.6108 * Math.exp(17.27 * tempMax / (tempMax + 237.3)) + 
                  0.6108 * Math.exp(17.27 * tempMin / (tempMin + 237.3))) / 2;
      
      // Pression de vapeur actuelle
      const ea = es * humidity / 100;
      
      // Pente de la courbe de pression de vapeur
      const delta = 4098 * es / Math.pow(tempMean + 237.3, 2);
      
      // Constante psychrométrique
      const gamma = 0.665;
      
      // Radiation extraterrestre approximative
      const dr = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
      const decl = 0.409 * Math.sin(2 * Math.PI * dayOfYear / 365 - 1.39);
      const latRad = latitude * Math.PI / 180;
      const ws = Math.acos(-Math.tan(latRad) * Math.tan(decl));
      const Ra = 24 * 60 / Math.PI * 0.082 * dr * 
                 (ws * Math.sin(latRad) * Math.sin(decl) + 
                  Math.cos(latRad) * Math.cos(decl) * Math.sin(ws));
      
      // Radiation solaire estimée (Rs = 0.16 * sqrt(tempMax - tempMin) * Ra)
      const Rs = 0.16 * Math.sqrt(Math.abs(tempMax - tempMin)) * Ra;
      
      // ET0 selon Penman-Monteith
      const et0 = (0.408 * delta * Rs + gamma * 900 / (tempMean + 273) * windSpeed * (es - ea)) /
                  (delta + gamma * (1 + 0.34 * windSpeed));
      
      return Math.max(0, et0);
    } catch (error) {
      console.error('❌ Erreur calcul ET0:', error);
      return 0;
    }
  }
}

// Instance singleton
export const openMeteoService = new OpenMeteoService();
