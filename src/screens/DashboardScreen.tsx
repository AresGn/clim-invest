import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeatherAlerts, fetchCoverageStatus } from '../store/slices/insuranceSlice';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState, AppDispatch } from '../store/store';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { coverage, weatherAlerts, loading } = useSelector((state: RootState) => state.insurance);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    await Promise.all([
      dispatch(fetchWeatherAlerts(user.location)),
      dispatch(fetchCoverageStatus(user.id))
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

      {/* Alertes météo temps réel */}
      <View style={styles.alertsSection}>
        <Text
          style={styles.sectionTitle}
          accessible={true}
        >
          Alertes Météo 🌦️
        </Text>
        
        {weatherAlerts.length > 0 ? (
          weatherAlerts.map((alert, index) => (
            <View
              key={index}
              style={[
                styles.alertCard,
                alert.severity === 'high' && styles.alertCardHigh,
                alert.severity === 'medium' && styles.alertCardMedium
              ]}
              accessibilityLabel={`Alerte ${alert.type} : ${alert.description}`}
            >
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertSeverity}>
                  {alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}
                </Text>
              </View>
              <Text style={styles.alertDescription}>{alert.description}</Text>
              {alert.actionRequired && (
                <AccessibleButton
                  title="Voir les recommandations"
                  onPress={() => navigation.navigate('WeatherDetails', { alert })}
                  style={styles.alertButton}
                  accessibilityHint="Voir les actions recommandées pour cette alerte"
                />
              )}
            </View>
          ))
        ) : (
          <View style={styles.noAlertsCard}>
            <Text 
              style={styles.noAlertsText}
              accessibilityLabel="Aucune alerte météo en cours"
            >
              ✅ Aucune alerte en cours
            </Text>
            <Text style={styles.noAlertsSubtext}>
              Vos cultures sont dans de bonnes conditions météorologiques
            </Text>
          </View>
        )}
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        
        <View style={styles.actionGrid}>
          <AccessibleButton
            title="🚨 Déclarer un Sinistre"
            onPress={handleEmergencyClaim}
            style={styles.emergencyButton}
            accessibilityHint="Signaler des dégâts sur vos cultures pour indemnisation"
            accessible={true}
          />

          <AccessibleButton
            title="📊 Historique"
            onPress={() => navigation.navigate('History')}
            style={styles.secondaryButton}
            accessibilityHint="Consulter vos paiements et réclamations passées"
          />

          <AccessibleButton
            title="💰 Paiements"
            onPress={() => navigation.navigate('Payments')}
            style={styles.secondaryButton}
            accessibilityHint="Gérer vos paiements et renouvellements"
          />

          <AccessibleButton
            title="⚙️ Paramètres"
            onPress={() => navigation.navigate('Settings')}
            style={styles.secondaryButton}
            accessibilityHint="Modifier vos préférences et informations"
          />
        </View>
      </View>

      {/* Conseil de la semaine */}
      <View style={styles.tipsSection}>
        <Text
          style={styles.sectionTitle}
          accessible={true}
        >
          Conseil de la Semaine 💡
        </Text>
        <View style={styles.tipCard}>
          <Text 
            style={styles.tipText}
            accessibilityLabel="Conseil agricole de la semaine"
          >
            Surveillez l'indice NDVI de vos cultures via satellite. Un score inférieur à 0.4 indique un stress hydrique nécessitant une irrigation d'urgence.
          </Text>
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
  alertsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertCardHigh: {
    borderLeftColor: COLORS.error,
  },
  alertCardMedium: {
    borderLeftColor: COLORS.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  alertSeverity: {
    fontSize: 20,
  },
  alertDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  noAlertsCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noAlertsText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 8,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
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
  tipsSection: {
    margin: 16,
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  tipText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
});
