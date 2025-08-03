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

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { coverage, loading } = useSelector((state: RootState) => state.insurance);
  const [refreshing, setRefreshing] = useState(false);

  // Utilisation du nouveau hook météo robuste
  const { weatherData, riskAnalysis, loading: weatherLoading, error: weatherError, refetch } = useWeatherData(
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
          accessibilityLabel="Actualiser les données"
        />
      }
      accessible={true}
      accessibilityLabel="Tableau de bord agriculteur"
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
          accessibilityLabel={`Statut couverture : ${coverage?.isActive ? 'Actif' : 'Inactif'}`}
        >
          {coverage?.isActive ? '🛡️ Protégé' : '⚠️ Non protégé'}
        </Text>
      </View>

      {/* Carte de couverture */}
      {coverage && (
        <View style={styles.coverageCard}>
          <Text style={styles.cardTitle}>Ma Couverture</Text>
          <View style={styles.coverageDetails}>
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

      {/* Données météo actuelles */}
      {weatherData && (
        <View style={styles.weatherSection}>
          <Text style={styles.sectionTitle}>🌤️ Météo</Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>🌡️ Température</Text>
              <Text style={styles.weatherValue}>{weatherData.current.temperature_2m?.toFixed(1) || '--'}°C</Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>💧 Humidité</Text>
              <Text style={styles.weatherValue}>{weatherData.current.relative_humidity_2m?.toFixed(0) || '--'}%</Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>🌧️ Pluie</Text>
              <Text style={styles.weatherValue}>{weatherData.current.precipitation?.toFixed(1) || '--'} mm</Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>💨 Vent</Text>
              <Text style={styles.weatherValue}>{weatherData.current.wind_speed_10m?.toFixed(1) || '--'} km/h</Text>
            </View>
          </View>
        </View>
      )}

      {/* Historique des catastrophes récentes */}
      <DisasterHistorySection />

      {/* Action principale */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>🚨 Besoin d'aide ?</Text>

        <View style={styles.actionGrid}>
          <AccessibleButton
            title="🚨 Déclarer un Sinistre"
            onPress={handleEmergencyClaim}
            style={styles.emergencyButton}
            accessibilityHint="Signaler des dégâts sur vos cultures pour indemnisation"
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
});
