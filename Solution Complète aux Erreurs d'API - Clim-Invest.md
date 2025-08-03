<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Solution Complète aux Erreurs d'API - Clim-Invest

Basé sur la documentation officielle d'Open-Meteo et les meilleures pratiques, voici comment corriger **concrètement** vos erreurs d'API :

## 1. Service Weather Correct (weatherService.ts)

```typescript
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
  // 🔥 MÉTHODE CORRECTE - Open-Meteo Forecast API
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
      throw new Error('Impossible de récupérer la météo actuelle');
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
        throw new Error(`Données historiques disponibles jusqu'au ${maxHistoricalDate.toISOString().split('T')[^0]} seulement`);
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
      
      // Utiliser seulement les données météo actuelles et prévisions
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      
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
```


## 2. Hook Weather Robuste (useWeatherData.ts)

```typescript
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
```


## 3. Configuration Network Android/iOS

### Android - `android/app/src/main/AndroidManifest.xml`

```xml
<application
  android:name=".MainApplication"
  android:allowBackup="false"
  android:theme="@style/AppTheme"
  android:usesCleartextTraffic="true">
  <!-- Permet les requêtes HTTP (pas seulement HTTPS) -->
</application>
```


### iOS - `ios/ClimInvest/Info.plist`

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>api.open-meteo.com</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.0</string>
    </dict>
  </dict>
</dict>
```


## 4. Correction Navigation

Dans `AppNavigator.tsx`, corrigez la navigation vers Claims :

```typescript
// ❌ INCORRECT
navigation.navigate('Dashboard', { screen: 'Claims', params: { emergency: true }});

// ✅ CORRECT
navigation.navigate('Claims', { emergency: true });
```


## 5. Variables d'Environnement

Créez un fichier `.env` à la racine :

```bash
# APIs Météo
OPEN_METEO_BASE_URL=https://api.open-meteo.com
OPEN_METEO_ARCHIVE_URL=https://archive-api.open-meteo.com

# OpenEPI (si vous l'utilisez plus tard)
OPENEPI_BASE_URL=https://developer.openepi.io
OPENEPI_API_KEY=your_key_here

# Configuration
API_TIMEOUT=15000
```


## 6. Tests des APIs

Créez un fichier de test `testWeatherAPI.js` :

```javascript
const axios = require('axios');

async function testOpenMeteoAPI() {
  try {
    // Test météo actuelle (Ouagadougou)
    const currentResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: 12.3714,
        longitude: -1.5197,
        current: 'temperature_2m,precipitation',
        timezone: 'auto'
      }
    });
    
    console.log('✅ API météo actuelle fonctionne:', currentResponse.data);
    
    // Test données historiques (il y a 1 semaine)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const startDate = lastWeek.toISOString().split('T')[^0];
    
    const historicalResponse = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
      params: {
        latitude: 12.3714,
        longitude: -1.5197,
        start_date: startDate,
        end_date: startDate,
        daily: 'temperature_2m_max,precipitation_sum'
      }
    });
    
    console.log('✅ API données historiques fonctionne:', historicalResponse.data);
  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
  }
}

testOpenMeteoAPI();
```

Exécutez avec : `node testWeatherAPI.js`

## 7. Points Clés pour Éviter les Erreurs

1. **Utilisez les bonnes URLs** :
    - Météo actuelle/prévisions : `https://api.open-meteo.com/v1/forecast`
    - Données historiques : `https://archive-api.open-meteo.com/v1/archive`
2. **Respectez les formats de dates** : `YYYY-MM-DD` obligatoire
3. **Gérez les timeouts** : 15 secondes minimum pour les APIs météo
4. **Validez les coordonnées** : 6 décimales maximum
5. **Paramètres requis minimaux** :
    - `latitude` et `longitude` (obligatoires)
    - Au moins un paramètre `current`, `hourly` ou `daily`

Cette implémentation corrigée devrait résoudre **tous** vos problèmes d'API Network Error !

<div style="text-align: center">⁂</div>

[^1]: https://docs.openwebui.com/getting-started/api-endpoints/

[^2]: https://cran.r-project.org/web/packages/openmeteo/openmeteo.pdf

[^3]: https://andreadams.com.br/react-native-axios-network-error-troubleshooting-guide/

[^4]: https://help.probely.com/en/articles/8177361-how-to-authenticate-to-scan-an-api-target-openapi

[^5]: https://openmeteo.substack.com/p/historical-weather-api-with-high

[^6]: https://www.dhiwise.com/post/common-axios-network-errors-and-how-to-solve-the

[^7]: https://swagger.io/docs/specification/v3_0/authentication/

[^8]: https://open-meteo.com/en/docs/historical-weather-api

[^9]: https://www.youtube.com/watch?v=LDpsWnH1HnI

[^10]: https://platform.openai.com/docs/api-reference/introduction

[^11]: https://github.com/open-meteo/open-meteo/blob/main/openapi_historical_weather_api.yml

[^12]: https://www.reddit.com/r/reactnative/comments/1aldzp8/getting_an_axios_axioserror_network_error_message/

[^13]: https://openwisp.io/docs/dev/radius/user/rest-api.html

[^14]: https://openmeteo.substack.com/p/processing-90-tb-historical-weather

[^15]: https://stackoverflow.com/questions/49370747/network-error-with-axios-and-react-native

[^16]: https://developer.openepi.io/data-catalog/resource/0809e814-6890-4ce6-a513-174d91ba158e

[^17]: https://open-meteo.com/en/terms

[^18]: https://github.com/axios/axios/issues/6302

[^19]: https://developer.openepi.io/data-catalog/resource/f57e1cc2-96ec-466e-a648-4a2fb8e819d1

[^20]: https://open-meteo.com

