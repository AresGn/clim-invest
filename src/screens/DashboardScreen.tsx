import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCoverageStatus } from '../store/slices/insuranceSlice';
import { useWeatherData } from '../hooks/useWeatherData';
import AccessibleButton from '../components/common/AccessibleButton';
import PaymentCountdown from '../components/common/PaymentCountdown';
import DisasterHistorySection from '../components/dashboard/DisasterHistorySection';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState, AppDispatch } from '../store/store';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardScreenProps {
  navigation: any;
}

// Helper function to extract weather values from different data sources
const getWeatherValue = (weatherData: any, type: string): string => {
  if (!weatherData) return '--';

  // Handle OpenWeatherMap data structure
  if (weatherData.source === 'OpenWeatherMap' && weatherData.current) {
    switch (type) {
      case 'temperature':
        return weatherData.current.temperature?.toFixed(1) || '--';
      case 'humidity':
        return weatherData.current.humidity?.toFixed(0) || '--';
      case 'precipitation':
        return '0.0'; // Current weather doesn't include precipitation
      case 'wind_speed':
        return weatherData.current.wind_speed?.toFixed(1) || '--';
      default:
        return '--';
    }
  }

  // Handle NASA POWER data structure
  if (weatherData.source === 'NASA_POWER' && weatherData.sample_data) {
    switch (type) {
      case 'temperature':
        return weatherData.sample_data.T2M?.value?.toFixed(1) || '--';
      case 'humidity':
        return weatherData.sample_data.RH2M?.value?.toFixed(0) || '--';
      case 'precipitation':
        return weatherData.sample_data.PRECTOTCORR?.value?.toFixed(1) || '--';
      case 'wind_speed':
        return weatherData.sample_data.WS10M?.value?.toFixed(1) || '--';
      default:
        return '--';
    }
  }

  // Handle simulated data structure
  if (weatherData.source === 'SIMULATED' && weatherData.current) {
    switch (type) {
      case 'temperature':
        return weatherData.current.temperature?.toFixed(1) || '--';
      case 'humidity':
        return weatherData.current.humidity?.toFixed(0) || '--';
      case 'precipitation':
        return '0.0'; // Simulated current weather
      case 'wind_speed':
        return weatherData.current.wind_speed?.toFixed(1) || '--';
      default:
        return '--';
    }
  }

  // Fallback for any other structure
  return '--';
};



export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { coverage, loading } = useSelector((state: RootState) => state.insurance);
  const [refreshing, setRefreshing] = useState(false);

  // Using updated weather hook with hybrid service
  const { weatherData, loading: weatherLoading, error: weatherError, refetch } = useWeatherData(
    user?.location.latitude,
    user?.location.longitude
  );

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    await Promise.all([
      dispatch(fetchCoverageStatus(user.id)),
      refetch(user?.cropType || 'maize') // Recharger les données météo
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleEmergencyClaim = () => {
    navigation.navigate('Claims', { emergency: true });
  };

  const handleSubscribeInsurance = () => {
    navigation.navigate('SubscribeInsurance');
  };

  const handleReferColleague = () => {
    navigation.navigate('ReferColleague');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
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
          accessibilityLabel={t('dashboard.refreshData')}
        />
      }
      accessible={true}
      accessibilityLabel={t('dashboard.farmerDashboard')}
    >
      {/* En-tête utilisateur */}
      <View style={styles.header}>
        <Text
          style={styles.welcomeText}
          accessible={true}
        >
          Bonjour {user.name} 👋
        </Text>
        <Text
          style={styles.statusText}
          accessibilityLabel={`Statut couverture : ${coverage?.isActive ? t('dashboard.protected') : t('dashboard.notProtected')}`}
        >
          {coverage?.isActive ? t('dashboard.protected') : t('dashboard.notProtected')}
        </Text>
      </View>

      {/* Carte de couverture */}
      {coverage && (
        <View style={styles.coverageCard}>
          <Text style={styles.cardTitle}>{t('dashboard.myCoverage')}</Text>
          <View style={styles.coverageDetails}>
            <View style={styles.coverageItem}>
              <Text style={styles.coverageLabel}>{t('dashboard.insuredCrop')}</Text>
              <Text style={styles.coverageValue}>
                {coverage.cropType === 'maize' ? `🌽 ${t('crops.maize')}` :
                 coverage.cropType === 'cotton' ? `🌿 ${t('crops.cotton')}` :
                 coverage.cropType === 'groundnut' ? `🥜 ${t('crops.groundnut')}` :
                 coverage.cropType === 'cowpea' ? `🫘 ${t('crops.cowpea')}` :
                 coverage.cropType === 'rice' ? `🌾 ${t('crops.rice')}` :
                 coverage.cropType === 'millet' ? `🌾 ${t('crops.millet')}` :
                 coverage.cropType === 'sorghum' ? `🌾 ${t('crops.sorghum')}` :
                 `🌱 ${coverage.cropType}`}
              </Text>
            </View>
            <View style={styles.coverageItem}>
              <Text style={styles.coverageLabel}>Montant assuré</Text>
              <Text style={styles.coverageValue}>{coverage.amount.toLocaleString()} FCFA</Text>
            </View>
            <View style={styles.coverageItem}>
              <Text style={styles.coverageLabel}>Prime mensuelle</Text>
              <Text style={styles.coverageValue}>{coverage.premium.toLocaleString()} FCFA</Text>
            </View>
            <View style={styles.coverageItem}>
              <Text style={styles.coverageLabel}>Expire le</Text>
              <Text style={styles.coverageValue}>
                {new Date(coverage.expiryDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Chrono prochaine échéance */}
      <PaymentCountdown
        paymentDate="2025-07-19" // Date du dernier paiement (19 juillet 2025)
        cycleDays={30} // Cycle de 30 jours
      />

      {/* Current weather data - updated for hybrid service */}
      {weatherData && (
        <View style={styles.weatherSection}>
          <Text style={styles.sectionTitle}>🌤️ Weather</Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>🌡️ Temperature</Text>
              <Text style={styles.weatherValue}>
                {getWeatherValue(weatherData, 'temperature')}°C
              </Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>💧 Humidity</Text>
              <Text style={styles.weatherValue}>
                {getWeatherValue(weatherData, 'humidity')}%
              </Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>🌧️ Precipitation</Text>
              <Text style={styles.weatherValue}>
                {getWeatherValue(weatherData, 'precipitation')} mm
              </Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>💨 Wind</Text>
              <Text style={styles.weatherValue}>
                {getWeatherValue(weatherData, 'wind_speed')} km/h
              </Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>📊 Source</Text>
              <Text style={[styles.weatherValue, { fontSize: 12 }]}>
                {weatherData.source || 'Hybrid Service'}
              </Text>
            </View>
          </View>
        </View>
      )}



      {/* Recent disaster history */}
      <DisasterHistorySection />

      {/* Action principale */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>{t('dashboard.needHelp')}</Text>

        <View style={styles.actionGrid}>
          <AccessibleButton
            title={t('dashboard.declareClaim')}
            onPress={handleEmergencyClaim}
            style={styles.emergencyButton}
            accessibilityHint={t('dashboard.declareClaimHint')}
            accessible={true}
          />

          <AccessibleButton
            title={t('dashboard.subscribeInsurance')}
            onPress={handleSubscribeInsurance}
            style={styles.secondaryButton}
            accessibilityHint={t('dashboard.subscribeInsuranceHint')}
            accessible={true}
          />

          <AccessibleButton
            title={t('dashboard.referColleague')}
            onPress={handleReferColleague}
            style={styles.tertiaryButton}
            accessibilityHint={t('dashboard.referColleagueHint')}
            accessible={true}
          />
        </View>
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: 8,
  },
  statusText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  coverageCard: {
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
  coverageDetails: {
    gap: 12,
  },
  coverageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverageLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  coverageValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  weatherSection: {
    margin: 16,
  },
  weatherCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  weatherValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },

  actionsSection: {
    margin: 16,
  },
  actionGrid: {
    gap: 12,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  tertiaryButton: {
    backgroundColor: COLORS.accent,
  },
  // Risk analysis styles
  riskSection: {
    margin: 16,
  },
  riskCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  riskScore: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  risksList: {
    marginBottom: 12,
  },
  riskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  riskType: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
  },
  riskProbability: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  recommendationsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});
