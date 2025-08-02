import axios, { AxiosInstance } from 'axios';
import { ENV_CONFIG } from '../config/env';

export interface ClimateHistoricalResponse {
  daily: {
    precipitation_sum: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
  };
  hourly?: {
    temperature_2m: number[];
    precipitation: number[];
    relative_humidity_2m: number[];
  };
}

export interface OpenEpiParams {
  variables: string[];
  bbox: [number, number, number, number]; // [lon_min, lat_min, lon_max, lat_max]
  start: string; // 'YYYY-MM-DD'
  end: string;   // 'YYYY-MM-DD'
}

class OpenEpiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: ENV_CONFIG.OPENEPI_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.client.interceptors.request.use(async (config) => {
      if (!this.accessToken) {
        await this.authenticate();
      }
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Intercepteur pour gérer l'expiration du token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.accessToken = null;
          await this.authenticate();
          // Retry la requête originale
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post(`${ENV_CONFIG.OPENEPI_BASE_URL}/auth/token`, {
        client_id: ENV_CONFIG.OPENEPI_CLIENT_ID,
        client_secret: ENV_CONFIG.OPENEPI_CLIENT_SECRET,
        grant_type: 'client_credentials'
      });

      this.accessToken = response.data.access_token;
      console.log('✅ OpenEPI authentification réussie');
    } catch (error) {
      console.error('❌ Erreur authentification OpenEPI:', error);
      throw new Error('Impossible de s\'authentifier avec OpenEPI');
    }
  }

  async getHistorical(params: OpenEpiParams): Promise<ClimateHistoricalResponse> {
    try {
      const response = await this.client.get('/climate/historical', {
        params: {
          variables: params.variables.join(','),
          bbox: params.bbox.join(','),
          start_date: params.start,
          end_date: params.end,
          format: 'json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération données OpenEPI:', error);
      throw new Error('Impossible de récupérer les données climatiques');
    }
  }

  async getCurrentWeather(lat: number, lon: number): Promise<any> {
    try {
      const response = await this.client.get('/weather/current', {
        params: {
          latitude: lat,
          longitude: lon
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur météo actuelle OpenEPI:', error);
      throw new Error('Impossible de récupérer la météo actuelle');
    }
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<any> {
    try {
      const response = await this.client.get('/weather/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          days: days
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur prévisions OpenEPI:', error);
      throw new Error('Impossible de récupérer les prévisions');
    }
  }
}

// Instance singleton
export const openEpiService = new OpenEpiService();
