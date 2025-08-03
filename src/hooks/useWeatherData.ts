import { useState, useEffect } from 'react';
import { hybridOpenEpiService } from '../services/hybridOpenEpiService';

/**
 * Custom hook for weather data using hybrid OpenEPI service
 * Provides current weather and climate risk analysis with fallback support
 */
export function useWeatherData(latitude?: number, longitude?: number) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (cropType: string = 'maize') => {
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

      // Generate risk analysis from climate data
      const riskData = generateRiskAnalysis(climateData, cropType);
      setRiskAnalysis(riskData);

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
    riskAnalysis,
    loading,
    error,
    refetch: fetchWeatherData
  };
}

/**
 * Generate risk analysis from climate data
 * @param climateData - Climate data from hybrid service
 * @param cropType - Type of crop for risk assessment
 * @returns Risk analysis object
 */
function generateRiskAnalysis(climateData: any, cropType: string) {
  // Extract relevant data based on source
  let temperature = 28;
  let humidity = 70;
  let precipitation = 0;

  if (climateData.source === 'OpenWeatherMap') {
    temperature = climateData.current?.temperature || 28;
    humidity = climateData.current?.humidity || 70;
    precipitation = 0; // Current weather doesn't include precipitation
  } else if (climateData.source === 'NASA_POWER') {
    // Extract from NASA POWER data if available
    const sampleData = climateData.sample_data;
    if (sampleData?.T2M) temperature = sampleData.T2M.value;
    if (sampleData?.RH2M) humidity = sampleData.RH2M.value;
    if (sampleData?.PRECTOTCORR) precipitation = sampleData.PRECTOTCORR.value;
  } else {
    // Use simulated data
    temperature = climateData.temperature?.annual_mean || 28;
    humidity = 70;
    precipitation = climateData.precipitation?.annual_total / 365 || 3; // Daily average
  }

  // Calculate risk levels based on crop type and weather conditions
  const risks = [];

  // Temperature stress risk
  if (temperature > 35) {
    risks.push({
      type: 'heat_stress',
      level: 'high',
      probability: 80,
      description: 'High temperature stress risk for crops',
      recommendation: 'Increase irrigation and provide shade if possible'
    });
  } else if (temperature > 32) {
    risks.push({
      type: 'heat_stress',
      level: 'medium',
      probability: 50,
      description: 'Moderate temperature stress risk',
      recommendation: 'Monitor crop health and ensure adequate water supply'
    });
  }

  // Drought risk
  if (precipitation < 1) {
    risks.push({
      type: 'drought',
      level: 'high',
      probability: 70,
      description: 'Low precipitation indicates drought risk',
      recommendation: 'Implement water conservation measures'
    });
  } else if (precipitation < 2) {
    risks.push({
      type: 'drought',
      level: 'medium',
      probability: 40,
      description: 'Below average precipitation',
      recommendation: 'Monitor soil moisture levels'
    });
  }

  // Humidity-related risks
  if (humidity > 85) {
    risks.push({
      type: 'fungal_disease',
      level: 'medium',
      probability: 60,
      description: 'High humidity increases fungal disease risk',
      recommendation: 'Improve air circulation and consider fungicide application'
    });
  }

  // Overall risk assessment
  const highRisks = risks.filter(r => r.level === 'high').length;
  const mediumRisks = risks.filter(r => r.level === 'medium').length;

  let overallRisk = 'low';
  if (highRisks > 0) overallRisk = 'high';
  else if (mediumRisks > 1) overallRisk = 'medium';

  return {
    overall_risk: overallRisk,
    risk_score: Math.min(highRisks * 30 + mediumRisks * 15, 100),
    risks,
    weather_conditions: {
      temperature,
      humidity,
      precipitation
    },
    recommendations: risks.map(r => r.recommendation),
    last_updated: new Date().toISOString()
  };
}



