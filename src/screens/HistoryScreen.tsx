import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { useTranslation } from '../hooks/useTranslation';

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { t } = useTranslation();

  const mockHistory = [
    {
      id: '1',
      type: 'payment',
      title: `${t('history.insurancePremium')} - ${t('history.january2025')}`,
      amount: '5,000 FCFA',
      date: '2025-01-15',
      status: t('history.paid'),
      icon: '💰'
    },
    {
      id: '2',
      type: 'claim',
      title: t('history.droughtClaim'),
      amount: '25,000 FCFA',
      date: '2024-12-20',
      status: t('history.approved'),
      icon: '🌾'
    },
    {
      id: '3',
      type: 'payment',
      title: `${t('history.insurancePremium')} - ${t('history.december2024')}`,
      amount: '5,000 FCFA',
      date: '2024-12-15',
      status: t('history.paid'),
      icon: '💰'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AccessibleButton
          title="← Retour"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
          accessibilityHint="Retourner au tableau de bord"
        />
        <Text style={styles.title}>Historique</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Transactions récentes</Text>
        
        {mockHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.itemIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDate}>
                {new Date(item.date).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            
            <View style={styles.itemRight}>
              <Text style={styles.itemAmount}>{item.amount}</Text>
              <Text style={[
                styles.itemStatus,
                item.status === t('history.paid') && styles.statusPaid,
                item.status === t('history.approved') && styles.statusApproved
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{t('history.summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('history.totalPremiumsPaid')}</Text>
            <Text style={styles.summaryValue}>10,000 FCFA</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('history.totalCompensations')}</Text>
            <Text style={styles.summaryValue}>25,000 FCFA</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>{t('history.netBenefit')}</Text>
            <Text style={styles.summaryTotalValue}>+15,000 FCFA</Text>
          </View>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPaid: {
    backgroundColor: COLORS.success + '20',
    color: COLORS.success,
  },
  statusApproved: {
    backgroundColor: COLORS.primary + '20',
    color: COLORS.primary,
  },
  summary: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.text.disabled,
    paddingTop: 12,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  summaryTotalValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});
