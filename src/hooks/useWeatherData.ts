import { useState, useEffect } from 'react';
import { WeatherService } from '../services/weatherService';

export function useWeatherData(latitude?: number, longitude?: number) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (cropType: string = 'maize') => {
    if (!latitude || !longitude) {
      setError('Coordonnées GPS requises');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupération en parallèle (plus rapide)
      const [currentWeather, riskData] = await Promise.all([
        WeatherService.getCurrentWeather(latitude, longitude),
        WeatherService.analyzeClimateRisk(latitude, longitude, cropType)
      ]);

      setWeatherData(currentWeather);
      setRiskAnalysis(riskData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur météo inconnue';
      setError(errorMessage);
      console.error('Hook météo - Erreur:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch au montage du composant
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  return {
    weatherData,
    riskAnalysis,
    loading,
    error,
    refetch: fetchWeatherData
  };
}



