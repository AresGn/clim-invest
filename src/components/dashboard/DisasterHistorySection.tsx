import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { climateDataService, DisasterSummary, DisasterEvent } from '../../services/climateDataService';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../../utils/constants';

interface DisasterHistorySectionProps {
  onDisasterPress?: (disaster: DisasterEvent) => void;
}

export default function DisasterHistorySection({ onDisasterPress }: DisasterHistorySectionProps) {
  const [disasterData, setDisasterData] = useState<DisasterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('recent');

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

  const getFilteredEvents = () => {
    if (!disasterData) return [];

    return disasterData.recentEvents.filter(event => {
      const countryMatch = selectedCountry === 'all' || event.country.toLowerCase() === selectedCountry.toLowerCase();
      const typeMatch = selectedType === 'all' || event.type === selectedType;

      // Filtrage par période (pour l'instant, on garde tous les événements récents)
      const periodMatch = selectedPeriod === 'recent';

      return countryMatch && typeMatch && periodMatch;
    });
  };

  const renderFilterButton = (
    currentValue: string,
    value: string,
    label: string,
    onPress: (value: string) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentValue === value && styles.filterButtonActive
      ]}
      onPress={() => onPress(value)}
      accessible={true}
      accessibilityLabel={`Filtre ${label}`}
      accessibilityHint={`Filtrer par ${label}`}
      accessibilityRole="button"
    >
      <Text style={[
        styles.filterButtonText,
        currentValue === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDisasterCard = ({ item }: { item: DisasterEvent }) => (
    <TouchableOpacity
      style={styles.slideCard}
      onPress={() => onDisasterPress?.(item)}
      accessible={true}
      accessibilityLabel={`Catastrophe ${item.type} en ${item.country}`}
    >
      <View style={styles.slideHeader}>
        <View style={styles.slideTypeContainer}>
          <Text style={styles.slideEmoji}>
            {climateDataService.getDisasterEmoji(item.type)}
          </Text>
          <Text style={styles.slideType}>
            {item.type === 'drought' ? 'Sécheresse' :
             item.type === 'flood' ? 'Inondation' :
             item.type === 'storm' ? 'Tempête' : 'Cyclone'}
          </Text>
        </View>
        <View style={[
          styles.slideSeverityBadge,
          { backgroundColor: climateDataService.getSeverityColor(item.severity) + '20' }
        ]}>
          <Text style={[
            styles.slideSeverityText,
            { color: climateDataService.getSeverityColor(item.severity) }
          ]}>
            {item.severity === 'critical' ? 'Critique' :
             item.severity === 'high' ? 'Élevé' :
             item.severity === 'medium' ? 'Modéré' : 'Faible'}
          </Text>
        </View>
      </View>

      <Text style={styles.slideLocation}>
        📍 {item.location}
      </Text>

      <Text style={styles.slideCountry}>
        🏴 {item.country}
      </Text>

      <Text style={styles.slideDate}>
        📅 {climateDataService.formatDisplayDate(item.date)}
      </Text>

      <View style={styles.slideStats}>
        <Text style={styles.slideStatText}>
          👥 {climateDataService.formatAffectedPeople(item.affectedPeople)}
        </Text>
        <Text style={styles.slideStatText}>
          💰 {climateDataService.formatEconomicLoss(item.economicLoss)}
        </Text>
      </View>

      <Text style={styles.slideDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

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

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtrer par :</Text>

        {/* Filtre par pays */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Pays :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton(selectedCountry, 'all', 'Tous', setSelectedCountry)}
            {renderFilterButton(selectedCountry, 'benin', 'Bénin', setSelectedCountry)}
            {renderFilterButton(selectedCountry, 'senegal', 'Sénégal', setSelectedCountry)}
            {renderFilterButton(selectedCountry, 'niger', 'Niger', setSelectedCountry)}
          </ScrollView>
        </View>

        {/* Filtre par type */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Type :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton(selectedType, 'all', 'Tous', setSelectedType)}
            {renderFilterButton(selectedType, 'drought', 'Sécheresse', setSelectedType)}
            {renderFilterButton(selectedType, 'flood', 'Inondation', setSelectedType)}
            {renderFilterButton(selectedType, 'storm', 'Tempête', setSelectedType)}
          </ScrollView>
        </View>
      </View>

      {/* Slides des catastrophes récentes */}
      <View style={styles.disastersList}>
        <Text style={styles.listTitle}>Événements Récents</Text>

        {getFilteredEvents().length === 0 ? (
          <View style={styles.noEventsCard}>
            <Text style={styles.noEventsText}>✅ Aucun événement trouvé</Text>
            <Text style={styles.noEventsSubtext}>
              {selectedCountry !== 'all' || selectedType !== 'all'
                ? 'Essayez de modifier les filtres'
                : 'La région est relativement stable'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredEvents()}
            renderItem={renderDisasterCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={280}
            decelerationRate="fast"
            contentContainerStyle={styles.slidesContainer}
          />
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
  // Styles pour les filtres
  filtersContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 10,
    fontWeight: '600',
  },
  filterScroll: {
    flexGrow: 0,
    paddingVertical: 4,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.text.secondary + '40',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  // Styles pour les slides
  slidesContainer: {
    paddingHorizontal: 8,
  },
  slideCard: {
    backgroundColor: COLORS.surface,
    width: 260,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slideEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  slideType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  slideSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slideSeverityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  slideLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  slideCountry: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  slideDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  slideStats: {
    marginBottom: 12,
  },
  slideStatText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  slideDescription: {
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
});
