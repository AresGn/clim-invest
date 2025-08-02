import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { openMeteoService } from '../services/openMeteoService';
import { climateRiskService } from '../services/climateRiskService';
import { weatherValidationService } from '../services/weatherValidationService';
import { validateApiKeys } from '../config/env';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';

interface WeatherTestScreenProps {
  navigation: any;
}

export default function WeatherTestScreen({ navigation }: WeatherTestScreenProps) {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    const results: any[] = [];
    
    // Coordonnées de Ouagadougou pour les tests
    const lat = 12.3714;
    const lon = -1.5197;
    const today = new Date().toISOString().split('T')[0];

    try {
      // Test 1: Validation des clés API
      results.push({
        test: 'Validation des clés API',
        status: validateApiKeys() ? 'success' : 'warning',
        message: validateApiKeys() ? 'Toutes les clés sont configurées' : 'Certaines clés manquent'
      });

      // Test 2: Open-Meteo météo actuelle
      try {
        const currentWeather = await openMeteoService.getCurrentWeather(lat, lon);
        results.push({
          test: 'Open-Meteo - Météo actuelle',
          status: 'success',
          message: `Température: ${currentWeather.current.temperature_2m}°C, Humidité: ${currentWeather.current.relative_humidity_2m}%`
        });
      } catch (error) {
        results.push({
          test: 'Open-Meteo - Météo actuelle',
          status: 'error',
          message: `Erreur: ${error}`
        });
      }

      // Test 3: Open-Meteo prévisions
      try {
        const forecast = await openMeteoService.getForecast(lat, lon, 3);
        results.push({
          test: 'Open-Meteo - Prévisions',
          status: 'success',
          message: `${forecast.daily.time.length} jours de prévisions récupérés`
        });
      } catch (error) {
        results.push({
          test: 'Open-Meteo - Prévisions',
          status: 'error',
          message: `Erreur: ${error}`
        });
      }

      // Test 4: Données historiques
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const historical = await openMeteoService.getHistoricalWeather(lat, lon, yesterdayStr, yesterdayStr);
        results.push({
          test: 'Open-Meteo - Données historiques',
          status: 'success',
          message: `Précipitations hier: ${historical.daily.precipitation_sum[0]} mm`
        });
      } catch (error) {
        results.push({
          test: 'Open-Meteo - Données historiques',
          status: 'error',
          message: `Erreur: ${error}`
        });
      }

      // Test 5: Analyse des risques climatiques
      try {
        const riskAnalysis = await climateRiskService.analyzeRisk(lat, lon, 'maize', 2);
        results.push({
          test: 'Analyse des risques climatiques',
          status: riskAnalysis.riskLevel === 'critical' ? 'warning' : 'success',
          message: `Niveau: ${riskAnalysis.riskLevel}, Score: ${riskAnalysis.riskScore}/100, Type: ${riskAnalysis.riskType}`
        });
      } catch (error) {
        results.push({
          test: 'Analyse des risques climatiques',
          status: 'error',
          message: `Erreur: ${error}`
        });
      }

      // Test 6: Validation croisée des données
      try {
        const validation = await weatherValidationService.validateWeatherData(lat, lon, today);
        results.push({
          test: 'Validation croisée des données',
          status: validation.validation.dataQuality === 'poor' ? 'warning' : 'success',
          message: `Qualité: ${validation.validation.dataQuality}, Avertissements: ${validation.validation.warnings.length}`
        });
      } catch (error) {
        results.push({
          test: 'Validation croisée des données',
          status: 'error',
          message: `Erreur: ${error}`
        });
      }

      // Test 7: Calcul ET0
      try {
        const et0 = openMeteoService.calculateET0(35, 25, 60, 10, lat, new Date().getDay());
        results.push({
          test: 'Calcul évapotranspiration (ET0)',
          status: et0 > 0 ? 'success' : 'warning',
          message: `ET0 calculé: ${et0.toFixed(2)} mm/jour`
        });
      } catch (error) {
        results.push({
          test: 'Calcul évapotranspiration (ET0)',
          status: 'error',
          message: `Erreur: ${error}`
        });
      }

    } catch (error) {
      results.push({
        test: 'Test général',
        status: 'error',
        message: `Erreur générale: ${error}`
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AccessibleButton
          title="← Retour"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.title}>Test des APIs Météo</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Ce test vérifie le bon fonctionnement des APIs météorologiques et des services d'analyse climatique.
        </Text>

        <AccessibleButton
          title="🧪 Lancer les tests"
          onPress={runTests}
          loading={loading}
          style={styles.testButton}
          accessibilityHint="Lancer tous les tests des APIs météo"
        />

        {testResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Résultats des tests</Text>
            
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
                  <Text style={styles.resultTest}>{result.test}</Text>
                </View>
                <Text 
                  style={[
                    styles.resultMessage,
                    { color: getStatusColor(result.status) }
                  ]}
                >
                  {result.message}
                </Text>
              </View>
            ))}

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Résumé</Text>
              <Text style={styles.summaryText}>
                ✅ Succès: {testResults.filter(r => r.status === 'success').length}
              </Text>
              <Text style={styles.summaryText}>
                ⚠️ Avertissements: {testResults.filter(r => r.status === 'warning').length}
              </Text>
              <Text style={styles.summaryText}>
                ❌ Erreurs: {testResults.filter(r => r.status === 'error').length}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 8,
    minHeight: 40,
    marginRight: 16,
  },
  backButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  description: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 24,
  },
  resultsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  resultTest: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  summary: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
});
