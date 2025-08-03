import { useState, useEffect } from 'react';
import { hybridOpenEpiService } from '../services/hybridOpenEpiService';

/**
 * Custom hook for weather data using hybrid OpenEPI service
 * Provides current weather data with fallback support
 */
export function useWeatherData(latitude?: number, longitude?: number) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    if (!latitude || !longitude) {
      setError('GPS coordinates required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch weather data using hybrid service (real APIs + fallback)
      const [currentWeather, climateData] = await Promise.all([
        hybridOpenEpiService.getCurrentWeather(latitude, longitude),
        hybridOpenEpiService.getClimateData(latitude, longitude)
      ]);

      setWeatherData(currentWeather);

      console.log('✅ Weather data fetched successfully via hybrid service');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown weather error';
      setError(errorMessage);
      console.error('Weather hook error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  return {
    weatherData,
    loading,
    error,
    refetch: fetchWeatherData
  };
}





