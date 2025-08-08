import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useSelector } from 'react-redux';
import AccessibleButton from '../components/common/AccessibleButton';
import PaymentCountdown from '../components/common/PaymentCountdown';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState } from '../store/store';
import { useTranslation } from '../hooks/useTranslation';

interface PaymentsScreenProps {
  navigation: any;
}

export default function PaymentsScreen({ navigation }: PaymentsScreenProps) {
  const [loading, setLoading] = useState(false);
  const { coverage } = useSelector((state: RootState) => state.insurance);
  const { t } = useTranslation();

  const handlePayment = async (method: string) => {
    setLoading(true);

    // Simulation de paiement
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('payments.paymentInitiated'),
        t('payments.paymentConfirmation', { method }),
        [{ text: t('common.ok') }]
      );
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'orange',
      name: t('payments.orangeMoney'),
      image: require('../../assets/logo/orange.png'),
      description: t('payments.orangeDescription'),
      fee: t('payments.noFees')
    },
    {
      id: 'moov',
      name: t('payments.moovMoney'),
      image: require('../../assets/logo/moov.png'),
      description: t('payments.moovDescription'),
      fee: t('payments.noFees')
    },
    {
      id: 'wave',
      name: t('payments.wave'),
      image: require('../../assets/logo/wave.png'),
      description: t('payments.waveDescription'),
      fee: t('payments.noFees')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('payments.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Chrono prochaine échéance - synchronisé avec l'écran d'accueil */}
        <PaymentCountdown
          paymentDate="2025-07-19" // Date du dernier paiement (19 juillet 2025)
          cycleDays={30} // Cycle de 30 jours
        />

        {/* Informations de paiement */}
        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>{t('payments.monthlyPremium')}</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              {coverage?.premium?.toLocaleString() || '800'} FCFA
            </Text>
            <Text style={styles.amountDescription}>
              {t('payments.premiumDescription', { farmSize: coverage?.farmSize || 2 })}
            </Text>
          </View>
        </View>

        {/* Méthodes de paiement */}
        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>{t('payments.choosePaymentMethod')}</Text>
          
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethod}>
              <View style={styles.methodInfo}>
                <Image source={method.image} style={styles.methodIcon} resizeMode="contain" />
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                  <Text style={styles.methodFee}>{t('payments.fees')}: {method.fee}</Text>
                </View>
              </View>

              <AccessibleButton
                title={t('payments.payButton')}
                onPress={() => handlePayment(method.name)}
                loading={loading}
                style={styles.payButton}
                accessibilityHint={`${t('payments.payButton')} ${method.name}`}
              />
            </View>
          ))}
        </View>

        {/* Historique des paiements */}
        <View style={styles.recentPayments}>
          <Text style={styles.sectionTitle}>{t('payments.recentPayments')}</Text>

          <View style={styles.paymentHistory}>
            <View style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDay}>19</Text>
                <Text style={styles.historyMonth}>JUL</Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyTitle}>{t('payments.insurancePremium')}</Text>
                <Text style={styles.historyMethod}>{t('payments.orangeMoney')}</Text>
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
                <Text style={styles.historyTitle}>{t('payments.insurancePremium')}</Text>
                <Text style={styles.historyMethod}>{t('payments.wave')}</Text>
              </View>
              <Text style={styles.historyAmount}>
                {coverage?.premium?.toLocaleString() || '800'} FCFA
              </Text>
            </View>
          </View>
        </View>

        {/* Informations importantes */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t('payments.importantInfo')}</Text>
          <Text style={styles.infoText}>
            {t('payments.infoText')}
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
    width: 40,
    height: 40,
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
