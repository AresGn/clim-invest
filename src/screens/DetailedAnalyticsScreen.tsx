import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState } from '../store/store';

interface DetailedAnalyticsScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function DetailedAnalyticsScreen({ navigation }: DetailedAnalyticsScreenProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedTab, setSelectedTab] = useState<'soil' | 'yield' | 'market' | 'climate'>('soil');

  const tabs = [
    { id: 'soil', label: '🌱 Sol', title: 'Analyse Pédologique' },
    { id: 'yield', label: '📈 Rendements', title: 'Historique des Rendements' },
    { id: 'market', label: '💰 Marché', title: 'Analyse du Marché' },
    { id: 'climate', label: '🌤️ Climat', title: 'Risques Climatiques' }
  ];

  const soilAnalysis = {
    ph: { value: 6.2, status: 'optimal', recommendation: 'pH idéal pour la plupart des cultures' },
    organic_matter: { value: 1.8, status: 'moderate', recommendation: 'Ajoutez du compost pour améliorer' },
    nitrogen: { value: 0.15, status: 'good', recommendation: 'Niveau satisfaisant' },
    phosphorus: { value: 12, status: 'low', recommendation: 'Apport de phosphore recommandé' },
    potassium: { value: 0.3, status: 'good', recommendation: 'Niveau correct' }
  };

  const yieldAnalysis = {
    current_season: { expected: 1.2, actual: 0.0, progress: 65 },
    last_5_years: [
      { year: 2024, yield: 1.1, weather_impact: 'Sécheresse modérée' },
      { year: 2023, yield: 1.3, weather_impact: 'Conditions favorables' },
      { year: 2022, yield: 0.9, weather_impact: 'Inondations' },
      { year: 2021, yield: 1.2, weather_impact: 'Conditions normales' },
      { year: 2020, yield: 1.0, weather_impact: 'Sécheresse sévère' }
    ],
    benchmark: { regional: 1.1, national: 1.0, optimal: 1.8 }
  };

  const marketAnalysis = {
    current_price: 350,
    price_forecast: {
      next_week: { min: 340, max: 360, trend: 'stable' },
      next_month: { min: 330, max: 380, trend: 'rising' },
      harvest_season: { min: 280, max: 320, trend: 'falling' }
    },
    best_selling_time: 'Dans 2-3 semaines',
    market_access: {
      distance_to_market: 15,
      transport_cost: 25,
      storage_available: true,
      cooperative_member: false
    }
  };

  const climateAnalysis = {
    current_risks: [
      { type: 'drought', probability: 30, impact: 'medium', timeframe: '2 semaines' },
      { type: 'heat_wave', probability: 45, impact: 'low', timeframe: '1 semaine' }
    ],
    seasonal_outlook: {
      rainfall: { expected: 850, normal: 900, status: 'below_normal' },
      temperature: { expected: 28.5, normal: 27.8, status: 'above_normal' }
    },
    adaptation_recommendations: [
      'Irrigation d\'appoint recommandée',
      'Paillage pour conserver l\'humidité',
      'Surveillance accrue des parasites'
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': case 'good': return COLORS.success;
      case 'moderate': return COLORS.warning;
      case 'low': case 'poor': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const renderSoilAnalysis = () => (
    <View style={styles.analysisContent}>
      <Text style={styles.analysisDescription}>
        Analyse détaillée de la composition et de la qualité de votre sol
      </Text>
      
      {Object.entries(soilAnalysis).map(([key, data]) => (
        <View key={key} style={styles.parameterCard}>
          <View style={styles.parameterHeader}>
            <Text style={styles.parameterName}>
              {key === 'ph' ? 'pH du sol' :
               key === 'organic_matter' ? 'Matière organique' :
               key === 'nitrogen' ? 'Azote' :
               key === 'phosphorus' ? 'Phosphore' : 'Potassium'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>
                {data.status === 'optimal' ? 'Optimal' :
                 data.status === 'good' ? 'Bon' :
                 data.status === 'moderate' ? 'Modéré' : 'Faible'}
              </Text>
            </View>
          </View>
          <Text style={styles.parameterValue}>
            {data.value}{key === 'ph' ? '' : key === 'organic_matter' ? '%' : key === 'nitrogen' ? '%' : ' ppm'}
          </Text>
          <Text style={styles.parameterRecommendation}>
            💡 {data.recommendation}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderYieldAnalysis = () => (
    <View style={styles.analysisContent}>
      <Text style={styles.analysisDescription}>
        Analyse des rendements passés et prévisions pour la saison actuelle
      </Text>
      
      {/* Saison actuelle */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>🌱 Saison Actuelle (2025)</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${yieldAnalysis.current_season.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{yieldAnalysis.current_season.progress}% de croissance</Text>
        </View>
        <Text style={styles.parameterValue}>
          Rendement attendu: {yieldAnalysis.current_season.expected} t/ha
        </Text>
      </View>

      {/* Historique */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>📊 Historique 5 ans</Text>
        {yieldAnalysis.last_5_years.map((year) => (
          <View key={year.year} style={styles.yearRow}>
            <Text style={styles.yearLabel}>{year.year}</Text>
            <Text style={styles.yearYield}>{year.yield} t/ha</Text>
            <Text style={styles.yearImpact}>{year.weather_impact}</Text>
          </View>
        ))}
      </View>

      {/* Comparaisons */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>🎯 Comparaisons</Text>
        <View style={styles.benchmarkRow}>
          <Text style={styles.benchmarkLabel}>Votre moyenne</Text>
          <Text style={styles.benchmarkValue}>1.1 t/ha</Text>
        </View>
        <View style={styles.benchmarkRow}>
          <Text style={styles.benchmarkLabel}>Moyenne régionale</Text>
          <Text style={styles.benchmarkValue}>{yieldAnalysis.benchmark.regional} t/ha</Text>
        </View>
        <View style={styles.benchmarkRow}>
          <Text style={styles.benchmarkLabel}>Potentiel optimal</Text>
          <Text style={styles.benchmarkValue}>{yieldAnalysis.benchmark.optimal} t/ha</Text>
        </View>
      </View>
    </View>
  );

  const renderMarketAnalysis = () => (
    <View style={styles.analysisContent}>
      <Text style={styles.analysisDescription}>
        Analyse des prix et recommandations de commercialisation
      </Text>
      
      {/* Prix actuel */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>💰 Prix Actuel</Text>
        <Text style={styles.currentPrice}>{marketAnalysis.current_price} FCFA/kg</Text>
        <Text style={styles.bestTime}>
          🎯 Meilleur moment pour vendre: {marketAnalysis.best_selling_time}
        </Text>
      </View>

      {/* Prévisions */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>📈 Prévisions de Prix</Text>
        {Object.entries(marketAnalysis.price_forecast).map(([period, forecast]) => (
          <View key={period} style={styles.forecastRow}>
            <Text style={styles.forecastPeriod}>
              {period === 'next_week' ? 'Semaine prochaine' :
               period === 'next_month' ? 'Mois prochain' : 'Saison des récoltes'}
            </Text>
            <Text style={styles.forecastRange}>
              {forecast.min}-{forecast.max} FCFA/kg
            </Text>
            <Text style={[styles.forecastTrend, { color: 
              forecast.trend === 'rising' ? COLORS.success :
              forecast.trend === 'falling' ? COLORS.error : COLORS.warning
            }]}>
              {forecast.trend === 'rising' ? '📈' :
               forecast.trend === 'falling' ? '📉' : '➡️'}
            </Text>
          </View>
        ))}
      </View>

      {/* Accès au marché */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>🚚 Accès au Marché</Text>
        <View style={styles.marketAccessRow}>
          <Text style={styles.accessLabel}>Distance au marché</Text>
          <Text style={styles.accessValue}>{marketAnalysis.market_access.distance_to_market} km</Text>
        </View>
        <View style={styles.marketAccessRow}>
          <Text style={styles.accessLabel}>Coût de transport</Text>
          <Text style={styles.accessValue}>{marketAnalysis.market_access.transport_cost} FCFA/kg</Text>
        </View>
        <View style={styles.marketAccessRow}>
          <Text style={styles.accessLabel}>Stockage disponible</Text>
          <Text style={[styles.accessValue, { color: marketAnalysis.market_access.storage_available ? COLORS.success : COLORS.error }]}>
            {marketAnalysis.market_access.storage_available ? '✅ Oui' : '❌ Non'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderClimateAnalysis = () => (
    <View style={styles.analysisContent}>
      <Text style={styles.analysisDescription}>
        Évaluation des risques climatiques et recommandations d'adaptation
      </Text>
      
      {/* Risques actuels */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>⚠️ Risques Actuels</Text>
        {climateAnalysis.current_risks.map((risk, index) => (
          <View key={index} style={styles.riskRow}>
            <Text style={styles.riskType}>
              {risk.type === 'drought' ? '🌵 Sécheresse' : '🔥 Vague de chaleur'}
            </Text>
            <Text style={styles.riskProbability}>{risk.probability}%</Text>
            <Text style={styles.riskTimeframe}>{risk.timeframe}</Text>
          </View>
        ))}
      </View>

      {/* Perspectives saisonnières */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>🌦️ Perspectives Saisonnières</Text>
        <View style={styles.outlookRow}>
          <Text style={styles.outlookLabel}>Précipitations attendues</Text>
          <Text style={styles.outlookValue}>
            {climateAnalysis.seasonal_outlook.rainfall.expected}mm 
            (normale: {climateAnalysis.seasonal_outlook.rainfall.normal}mm)
          </Text>
        </View>
        <View style={styles.outlookRow}>
          <Text style={styles.outlookLabel}>Température moyenne</Text>
          <Text style={styles.outlookValue}>
            {climateAnalysis.seasonal_outlook.temperature.expected}°C 
            (normale: {climateAnalysis.seasonal_outlook.temperature.normal}°C)
          </Text>
        </View>
      </View>

      {/* Recommandations */}
      <View style={styles.parameterCard}>
        <Text style={styles.parameterName}>💡 Recommandations d'Adaptation</Text>
        {climateAnalysis.adaptation_recommendations.map((rec, index) => (
          <Text key={index} style={styles.recommendation}>
            • {rec}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analyses Détaillées</Text>
        <Text style={styles.subtitle}>Données approfondies pour votre exploitation</Text>
      </View>

      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <AccessibleButton
              key={tab.id}
              title={tab.label}
              onPress={() => setSelectedTab(tab.id as any)}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.tabActive
              ]}
              textStyle={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive
              ]}
            />
          ))}
        </ScrollView>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          {tabs.find(t => t.id === selectedTab)?.title}
        </Text>
        
        {selectedTab === 'soil' && renderSoilAnalysis()}
        {selectedTab === 'yield' && renderYieldAnalysis()}
        {selectedTab === 'market' && renderMarketAnalysis()}
        {selectedTab === 'climate' && renderClimateAnalysis()}
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
    backgroundColor: COLORS.secondary,
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  tabsContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.disabled,
  },
  tab: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  analysisContent: {
    gap: 16,
  },
  analysisDescription: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  parameterCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parameterName: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  parameterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  parameterRecommendation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.text.disabled,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  yearLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  yearYield: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  yearImpact: {
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 2,
    textAlign: 'right',
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  benchmarkLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  benchmarkValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
  },
  bestTime: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  forecastPeriod: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 2,
  },
  forecastRange: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 2,
    textAlign: 'center',
  },
  forecastTrend: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  marketAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accessLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  accessValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  riskType: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 2,
  },
  riskProbability: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
    flex: 1,
    textAlign: 'center',
  },
  riskTimeframe: {
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 1,
    textAlign: 'right',
  },
  outlookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  outlookLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
  },
  outlookValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  recommendation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
});
