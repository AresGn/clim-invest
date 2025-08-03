import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import AccessibleButton from '../components/common/AccessibleButton';
import PaymentCountdown from '../components/common/PaymentCountdown';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState } from '../store/store';

interface PaymentsScreenProps {
  navigation: any;
}

export default function PaymentsScreen({ navigation }: PaymentsScreenProps) {
  const [loading, setLoading] = useState(false);
  const { coverage } = useSelector((state: RootState) => state.insurance);

  const handlePayment = async (method: string) => {
    setLoading(true);
    
    // Simulation de paiement
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Paiement initié',
        `Votre paiement via ${method} a été initié. Vous recevrez un SMS de confirmation.`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'orange',
      name: 'Orange Money',
      icon: '🟠',
      description: 'Paiement via Orange Money',
      fee: '0 FCFA'
    },
    {
      id: 'moov',
      name: 'Moov Money',
      icon: '🔵',
      description: 'Paiement via Moov Money',
      fee: '0 FCFA'
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: '💙',
      description: 'Paiement via Wave',
      fee: '0 FCFA'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paiements</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Chrono prochaine échéance - synchronisé avec l'écran d'accueil */}
        <PaymentCountdown
          paymentDate="2025-07-19" // Date du dernier paiement (19 juillet 2025)
          cycleDays={30} // Cycle de 30 jours
        />

        {/* Informations de paiement */}
        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>Prime mensuelle</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              {coverage?.premium?.toLocaleString() || '800'} FCFA
            </Text>
            <Text style={styles.amountDescription}>
              Prime d'assurance pour votre exploitation de {coverage?.farmSize || 2} hectares
            </Text>
          </View>
        </View>

        {/* Méthodes de paiement */}
        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>Choisir une méthode de paiement</Text>
          
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethod}>
              <View style={styles.methodInfo}>
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                  <Text style={styles.methodFee}>Frais: {method.fee}</Text>
                </View>
              </View>
              
              <AccessibleButton
                title="Payer"
                onPress={() => handlePayment(method.name)}
                loading={loading}
                style={styles.payButton}
                accessibilityHint={`Payer avec ${method.name}`}
              />
            </View>
          ))}
        </View>

        {/* Historique des paiements */}
        <View style={styles.recentPayments}>
          <Text style={styles.sectionTitle}>Paiements récents</Text>
          
          <View style={styles.paymentHistory}>
            <View style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDay}>19</Text>
                <Text style={styles.historyMonth}>JUL</Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyTitle}>Prime d'assurance</Text>
                <Text style={styles.historyMethod}>Orange Money</Text>
              </View>
              <Text style={styles.historyAmount}>
                {coverage?.premium?.toLocaleString() || '800'} FCFA
              </Text>
            </View>

            <View style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDay}>19</Text>
                <Text style={styles.historyMonth}>JUN</Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyTitle}>Prime d'assurance</Text>
                <Text style={styles.historyMethod}>Wave</Text>
              </View>
              <Text style={styles.historyAmount}>
                {coverage?.premium?.toLocaleString() || '800'} FCFA
              </Text>
            </View>
          </View>
        </View>

        {/* Informations importantes */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Informations importantes</Text>
          <Text style={styles.infoText}>
            • Votre couverture reste active tant que vos primes sont à jour{'\n'}
            • Les paiements sont sécurisés et cryptés{'\n'}
            • Vous recevrez un SMS de confirmation après chaque paiement{'\n'}
            • En cas de retard, vous avez 7 jours de grâce
          </Text>
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
    alignItems: 'center',
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
    marginBottom: 16,
  },
  paymentInfo: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  amountDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  dueDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.text.disabled,
  },
  dueDateLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  dueDateValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  paymentMethod: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  methodFee: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 40,
  },
  recentPayments: {
    marginBottom: 24,
  },
  paymentHistory: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  historyDate: {
    alignItems: 'center',
    marginRight: 16,
    width: 40,
  },
  historyDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  historyMonth: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  historyMethod: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  historyAmount: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  infoBox: {
    backgroundColor: COLORS.accent + '20',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoTitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});
