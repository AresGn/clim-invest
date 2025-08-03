import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { hybridOpenEpiService } from '../services/hybridOpenEpiService';
import { SoilData, YieldData, PriceData } from '../services/openEpiAdvancedService';
import { creditScoringService, FarmerCreditScore } from '../services/creditScoringService';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState } from '../store/store';

interface InsightsScreenProps {
  navigation: any;
}

export default function InsightsScreen({ navigation }: InsightsScreenProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [yieldData, setYieldData] = useState<YieldData | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [creditScore, setCreditScore] = useState<FarmerCreditScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInsightsData();
    }
  }, [user]);

  const loadInsightsData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Charger toutes les données en parallèle avec le service hybride
      const [soil, yields, prices, credit] = await Promise.all([
        hybridOpenEpiService.getSoilData(user.location.latitude, user.location.longitude),
        hybridOpenEpiService.getCropYields('Benin', user.cropType || 'maize'),
        hybridOpenEpiService.getCropPrices(user.cropType || 'maize', 'Cotonou'),
        creditScoringService.calculateCreditScore(
          user.id,
          { lat: user.location.latitude, lon: user.location.longitude },
          user.cropType || 'maize',
          user.farmSize || 2
        )
      ]);

      setSoilData(soil);
      setYieldData(yields);
      setPriceData(prices);
      setCreditScore(credit);
    } catch (err) {
      console.error('Erreur chargement données insights:', err);
      setError('Impossible de charger les analyses. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsightsData();
    setRefreshing(false);
  };

  const getSoilQualityColor = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return COLORS.success;
      case 'good': return COLORS.primary;
      case 'moderate': return COLORS.warning;
      case 'poor': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const getSoilQualityIcon = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'moderate': return '⚠️';
      case 'poor': return '❌';
      default: return '🌱';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'high': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const getPriceTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyse de vos données agricoles...</Text>
        <Text style={styles.loadingSubtext}>
          Récupération des données pédologiques, rendements et prix du marché
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          accessibilityLabel="Actualiser les analyses"
        />
      }
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Analyses Agricoles</Text>
        <Text style={styles.subtitle}>Données OpenEPI pour votre exploitation</Text>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <AccessibleButton
            title="Réessayer"
            onPress={loadInsightsData}
            style={styles.retryButton}
          />
        </View>
      )}

      {/* Score de crédit */}
      {creditScore && (
        <View style={styles.creditScoreCard}>
          <Text style={styles.cardTitle}>💳 Score de Crédit Agricole</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{creditScore.overallScore}/1000</Text>
            <View style={[
              styles.riskBadge,
              { backgroundColor: getRiskLevelColor(creditScore.riskLevel) + '20' }
            ]}>
              <Text style={[
                styles.riskText,
                { color: getRiskLevelColor(creditScore.riskLevel) }
              ]}>
                {creditScore.riskLevel === 'low' ? 'Risque Faible' :
                 creditScore.riskLevel === 'medium' ? 'Risque Modéré' : 'Risque Élevé'}
              </Text>
            </View>
          </View>
          
          <View style={styles.creditDetails}>
            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>💰 Montant éligible</Text>
              <Text style={styles.creditValue}>
                {creditScore.eligibleAmount.toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>📊 Taux d'intérêt</Text>
              <Text style={styles.creditValue}>{creditScore.interestRate}% / an</Text>
            </View>
            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>⏱️ Durée recommandée</Text>
              <Text style={styles.creditValue}>{creditScore.repaymentPeriod} mois</Text>
            </View>
          </View>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>💡 Recommandation</Text>
            <Text style={styles.recommendationText}>
              {creditScore.creditRecommendation}
            </Text>
          </View>
        </View>
      )}

      {/* Données pédologiques */}
      {soilData && (
        <View style={styles.soilCard}>
          <Text style={styles.cardTitle}>🌱 Analyse du Sol</Text>
          <View style={styles.soilHeader}>
            <Text style={styles.soilQualityIcon}>
              {getSoilQualityIcon(soilData.suitability)}
            </Text>
            <View>
              <Text style={styles.soilQualityText}>
                Qualité: {soilData.suitability === 'excellent' ? 'Excellente' :
                         soilData.suitability === 'good' ? 'Bonne' :
                         soilData.suitability === 'moderate' ? 'Modérée' : 'Faible'}
              </Text>
              <Text style={styles.soilScore}>Score: {soilData.quality_score}/100</Text>
            </View>
          </View>

          <View style={styles.soilDetails}>
            <View style={styles.soilRow}>
              <Text style={styles.soilLabel}>🧪 pH</Text>
              <Text style={styles.soilValue}>{soilData.ph.toFixed(1)}</Text>
            </View>
            <View style={styles.soilRow}>
              <Text style={styles.soilLabel}>🍃 Matière organique</Text>
              <Text style={styles.soilValue}>{soilData.organic_carbon.toFixed(1)}%</Text>
            </View>
            <View style={styles.soilRow}>
              <Text style={styles.soilLabel}>💧 Rétention d'eau</Text>
              <Text style={styles.soilValue}>{soilData.water_holding_capacity.toFixed(0)}%</Text>
            </View>
            <View style={styles.soilRow}>
              <Text style={styles.soilLabel}>🏺 Argile</Text>
              <Text style={styles.soilValue}>{soilData.clay_content.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* Rendements historiques */}
      {yieldData && (
        <View style={styles.yieldCard}>
          <Text style={styles.cardTitle}>📈 Rendements Historiques</Text>
          <View style={styles.yieldHeader}>
            <Text style={styles.yieldValue}>
              {yieldData.average_yield.toFixed(1)} t/ha
            </Text>
            <Text style={styles.yieldTrend}>
              {yieldData.trend === 'increasing' ? '📈 En hausse' :
               yieldData.trend === 'decreasing' ? '📉 En baisse' : '➡️ Stable'}
            </Text>
          </View>
          
          <Text style={styles.yieldReliability}>
            Fiabilité des données: {yieldData.reliability_score}%
          </Text>
          
          <View style={styles.yieldHistory}>
            <Text style={styles.yieldHistoryTitle}>5 dernières années:</Text>
            {yieldData.historical_yields.slice(-3).map((year, index) => (
              <View key={year.year} style={styles.yieldHistoryRow}>
                <Text style={styles.yieldYear}>{year.year}</Text>
                <Text style={styles.yieldHistoryValue}>
                  {year.yield_tons_per_hectare.toFixed(1)} t/ha
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Prix du marché */}
      {priceData && (
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>💰 Prix du Marché</Text>
          <View style={styles.priceHeader}>
            <Text style={styles.currentPrice}>
              {priceData.current_price} {priceData.currency}/kg
            </Text>
            <Text style={styles.priceTrend}>
              {getPriceTrendIcon(priceData.trend)} {
                priceData.trend === 'rising' ? 'En hausse' :
                priceData.trend === 'falling' ? 'En baisse' : 'Stable'
              }
            </Text>
          </View>
          
          <Text style={styles.priceMarket}>Marché: {priceData.market}</Text>
          <Text style={styles.priceVolatility}>
            Volatilité: {(priceData.volatility * 100).toFixed(1)}%
          </Text>
          
          <View style={styles.priceRecommendation}>
            <Text style={styles.priceRecommendationTitle}>💡 Conseil de vente</Text>
            <Text style={styles.priceRecommendationText}>
              {priceData.trend === 'rising' 
                ? 'Attendez quelques jours, les prix montent'
                : priceData.trend === 'falling'
                ? 'Vendez rapidement, les prix baissent'
                : 'Prix stable, bon moment pour vendre'
              }
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <AccessibleButton
          title="📋 Demander un Crédit"
          onPress={() => navigation.navigate('CreditApplication')}
          style={styles.creditButton}
          accessibilityHint="Faire une demande de crédit agricole"
        />
        
        <AccessibleButton
          title="📊 Voir Plus d'Analyses"
          onPress={() => navigation.navigate('DetailedAnalytics')}
          style={styles.analyticsButton}
          accessibilityHint="Voir des analyses détaillées"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
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
  errorCard: {
    backgroundColor: COLORS.error + '20',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.error,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  creditScoreCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  creditDetails: {
    marginBottom: 16,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  creditValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recommendationCard: {
    backgroundColor: COLORS.accent + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  recommendationTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  soilCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  soilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  soilQualityIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  soilQualityText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  soilScore: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  soilDetails: {
    gap: 8,
  },
  soilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soilLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  soilValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  yieldCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  yieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  yieldValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  yieldTrend: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  yieldReliability: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  yieldHistory: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  yieldHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  yieldHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  yieldYear: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  yieldHistoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  priceTrend: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  priceMarket: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  priceVolatility: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  priceRecommendation: {
    backgroundColor: COLORS.success + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  priceRecommendationTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  priceRecommendationText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actionsSection: {
    margin: 16,
    gap: 12,
  },
  creditButton: {
    backgroundColor: COLORS.success,
  },
  analyticsButton: {
    backgroundColor: COLORS.secondary,
  },
});
