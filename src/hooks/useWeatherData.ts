import { useState, useEffect, useCallback } from 'react';
import { openMeteoService } from '../services/openMeteoService';
import { climateRiskService, RiskAnalysis } from '../services/climateRiskService';
import { weatherValidationService } from '../services/weatherValidationService';

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
  forecast: {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    precipitationProbability: number;
  }[];
  riskAnalysis: RiskAnalysis | null;
  lastUpdated: string;
}

export interface UseWeatherDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en minutes
  enableRiskAnalysis?: boolean;
}

export function useWeatherData(
  latitude: number | null,
  longitude: number | null,
  cropType?: string,
  farmSize?: number,
  options: UseWeatherDataOptions = {}
) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    autoRefresh = false,
    refreshInterval = 30,
    enableRiskAnalysis = true
  } = options;

  const fetchWeatherData = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Coordonnées GPS requises');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🌤️ Récupération données météo pour (${latitude}, ${longitude})`);

      // Récupération des données actuelles et prévisions
      const [currentWeather, forecast] = await Promise.all([
        openMeteoService.getCurrentWeather(latitude, longitude),
        openMeteoService.getForecast(latitude, longitude, 7)
      ]);

      // Analyse des risques si activée et données de culture disponibles
      let riskAnalysis: RiskAnalysis | null = null;
      if (enableRiskAnalysis && cropType && farmSize) {
        try {
          riskAnalysis = await climateRiskService.analyzeRisk(
            latitude, 
            longitude, 
            cropType, 
            farmSize
          );
        } catch (riskError) {
          console.warn('⚠️ Impossible d\'analyser les risques:', riskError);
        }
      }

      // Formatage des données
      const formattedData: WeatherData = {
        current: {
          temperature: currentWeather.current.temperature_2m,
          humidity: currentWeather.current.relative_humidity_2m,
          precipitation: currentWeather.current.precipitation,
          windSpeed: currentWeather.current.wind_speed_10m
        },
        forecast: forecast.daily.time.map((date, index) => ({
          date,
          tempMax: forecast.daily.temperature_2m_max[index],
          tempMin: forecast.daily.temperature_2m_min[index],
          precipitation: forecast.daily.precipitation_sum[index],
          precipitationProbability: forecast.daily.precipitation_probability_max[index]
        })),
        riskAnalysis,
        lastUpdated: new Date().toISOString()
      };

      setWeatherData(formattedData);
      console.log('✅ Données météo récupérées avec succès');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur récupération météo:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, cropType, farmSize, enableRiskAnalysis]);

  // Validation des données météo
  const validateData = useCallback(async (date?: string) => {
    if (!latitude || !longitude) return null;

    try {
      const validationDate = date || new Date().toISOString().split('T')[0];
      return await weatherValidationService.validateWeatherData(
        latitude, 
        longitude, 
        validationDate
      );
    } catch (error) {
      console.error('❌ Erreur validation données:', error);
      return null;
    }
  }, [latitude, longitude]);

  // Obtenir des données fiables
  const getReliableData = useCallback(async (date?: string) => {
    if (!latitude || !longitude) return null;

    try {
      const validationDate = date || new Date().toISOString().split('T')[0];
      return await weatherValidationService.getReliableWeatherData(
        latitude, 
        longitude, 
        validationDate
      );
    } catch (error) {
      console.error('❌ Erreur données fiables:', error);
      return null;
    }
  }, [latitude, longitude]);

  // Effet pour le chargement initial
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [fetchWeatherData]);

  // Effet pour l'auto-refresh
  useEffect(() => {
    if (!autoRefresh || !latitude || !longitude) return;

    const interval = setInterval(() => {
      fetchWeatherData();
    }, refreshInterval * 60 * 1000); // Conversion en millisecondes

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchWeatherData]);

  return {
    weatherData,
    loading,
    error,
    refetch: fetchWeatherData,
    validateData,
    getReliableData
  };
}

// Hook spécialisé pour les alertes météo
export function useWeatherAlerts(
  latitude: number | null,
  longitude: number | null,
  cropType?: string,
  farmSize?: number
) {
  const [alerts, setAlerts] = useState<RiskAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  const checkAlerts = useCallback(async () => {
    if (!latitude || !longitude || !cropType || !farmSize) return;

    setLoading(true);
    try {
      const riskAnalysis = await climateRiskService.analyzeRisk(
        latitude, 
        longitude, 
        cropType, 
        farmSize
      );

      // Ajouter l'alerte si le niveau de risque est élevé
      if (riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') {
        setAlerts(prev => {
          // Éviter les doublons
          const exists = prev.some(alert => 
            alert.riskType === riskAnalysis.riskType && 
            alert.riskLevel === riskAnalysis.riskLevel
          );
          
          if (!exists) {
            return [...prev, riskAnalysis];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('❌ Erreur vérification alertes:', error);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, cropType, farmSize]);

  const dismissAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Vérification automatique des alertes toutes les heures
  useEffect(() => {
    if (latitude && longitude && cropType && farmSize) {
      checkAlerts();
      
      const interval = setInterval(checkAlerts, 60 * 60 * 1000); // 1 heure
      return () => clearInterval(interval);
    }
  }, [checkAlerts]);

  return {
    alerts,
    loading,
    checkAlerts,
    dismissAlert,
    clearAllAlerts
  };
}
