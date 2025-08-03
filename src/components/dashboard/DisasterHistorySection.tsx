import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { climateDataService, DisasterSummary, DisasterEvent } from '../../services/climateDataService';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../../utils/constants';

interface DisasterHistorySectionProps {
  onDisasterPress?: (disaster: DisasterEvent) => void;
}

export default function DisasterHistorySection({ onDisasterPress }: DisasterHistorySectionProps) {
  const [disasterData, setDisasterData] = useState<DisasterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDisasterData();
  }, []);

  const loadDisasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await climateDataService.getRecentDisasters();
      setDisasterData(data);
    } catch (err) {
      setError('Impossible de charger les données');
      console.error('Erreur chargement catastrophes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return { color: COLORS.error, backgroundColor: COLORS.error + '20' };
      case 'medium':
        return { color: COLORS.warning, backgroundColor: COLORS.warning + '20' };
      default:
        return { color: COLORS.success, backgroundColor: COLORS.success + '20' };
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return '🔴 Risque Élevé';
      case 'medium':
        return '🟠 Risque Modéré';
      default:
        return '🟢 Risque Faible';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>🌍 Historique des Catastrophes</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  if (error || !disasterData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>🌍 Historique des Catastrophes</Text>
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            ⚠️ {error || 'Données indisponibles'}
          </Text>
          <TouchableOpacity onPress={loadDisasterData} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🌍 Historique des Catastrophes</Text>
      
      {/* Résumé du risque */}
      <View style={styles.riskSummary}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskTitle}>Niveau de Risque Régional</Text>
          <View style={[styles.riskBadge, getRiskLevelStyle(disasterData.riskLevel)]}>
            <Text style={[styles.riskBadgeText, { color: getRiskLevelStyle(disasterData.riskLevel).color }]}>
              {getRiskLevelText(disasterData.riskLevel)}
            </Text>
          </View>
        </View>
        <Text style={styles.riskSubtext}>
          {disasterData.totalEvents} événements recensés • Bénin, Sénégal, Niger
        </Text>
      </View>

      {/* Liste des catastrophes récentes */}
      <View style={styles.disastersList}>
        <Text style={styles.listTitle}>Événements Récents</Text>
        
        {disasterData.recentEvents.length === 0 ? (
          <View style={styles.noEventsCard}>
            <Text style={styles.noEventsText}>✅ Aucun événement majeur récent</Text>
            <Text style={styles.noEventsSubtext}>La région est relativement stable</Text>
          </View>
        ) : (
          disasterData.recentEvents.map((disaster) => (
            <TouchableOpacity
              key={disaster.id}
              style={styles.disasterCard}
              onPress={() => onDisasterPress?.(disaster)}
              accessible={true}
              accessibilityLabel={`Catastrophe ${disaster.type} en ${disaster.country}`}
            >
              <View style={styles.disasterHeader}>
                <View style={styles.disasterTypeContainer}>
                  <Text style={styles.disasterEmoji}>
                    {climateDataService.getDisasterEmoji(disaster.type)}
                  </Text>
                  <Text style={styles.disasterType}>
                    {disaster.type === 'drought' ? 'Sécheresse' :
                     disaster.type === 'flood' ? 'Inondation' :
                     disaster.type === 'storm' ? 'Tempête' : 'Cyclone'}
                  </Text>
                </View>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: climateDataService.getSeverityColor(disaster.severity) + '20' }
                ]}>
                  <Text style={[
                    styles.severityText,
                    { color: climateDataService.getSeverityColor(disaster.severity) }
                  ]}>
                    {disaster.severity === 'critical' ? 'Critique' :
                     disaster.severity === 'high' ? 'Élevé' :
                     disaster.severity === 'medium' ? 'Modéré' : 'Faible'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.disasterLocation}>
                📍 {disaster.location}, {disaster.country}
              </Text>
              
              <Text style={styles.disasterDate}>
                📅 {climateDataService.formatDisplayDate(disaster.date)}
              </Text>
              
              <View style={styles.disasterStats}>
                <Text style={styles.statText}>
                  👥 {climateDataService.formatAffectedPeople(disaster.affectedPeople)} personnes
                </Text>
                <Text style={styles.statText}>
                  💰 {climateDataService.formatEconomicLoss(disaster.economicLoss)}
                </Text>
              </View>
              
              <Text style={styles.disasterDescription} numberOfLines={2}>
                {disaster.description}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Dernière mise à jour */}
      <Text style={styles.lastUpdate}>
        Dernière mise à jour: {climateDataService.formatDisplayDate(disasterData.lastUpdate)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.text.secondary,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
  },
  errorCard: {
    backgroundColor: COLORS.error + '20',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  riskSummary: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  riskSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  disastersList: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  noEventsCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  disasterCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disasterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  disasterTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  disasterEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  disasterType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disasterLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  disasterDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  disasterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  disasterDescription: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
