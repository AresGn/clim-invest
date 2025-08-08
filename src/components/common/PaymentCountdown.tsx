import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { useTranslation } from '../../hooks/useTranslation';

interface PaymentCountdownProps {
  paymentDate: string; // Date du dernier paiement (format ISO)
  cycleDays?: number; // Nombre de jours dans le cycle (défaut: 30)
}

export default function PaymentCountdown({ paymentDate, cycleDays = 30 }: PaymentCountdownProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const lastPayment = new Date(paymentDate);
      const nextPayment = new Date(lastPayment);
      nextPayment.setDate(lastPayment.getDate() + cycleDays);
      
      const now = new Date();
      const difference = nextPayment.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Échéance dépassée
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculer immédiatement
    calculateTimeLeft();

    // Mettre à jour chaque seconde
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [paymentDate, cycleDays]);

  const isOverdue = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isOverdue ? t('payments.overdue') : t('payments.nextDue')}
      </Text>

      {!isOverdue ? (
        <View style={styles.countdownContainer}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeNumber}>{timeLeft.days}</Text>
            <Text style={styles.timeLabel}>{t('payments.days')}</Text>
          </View>

          <Text style={styles.separator}>:</Text>

          <View style={styles.timeBlock}>
            <Text style={styles.timeNumber}>{timeLeft.hours.toString().padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>{t('payments.hours')}</Text>
          </View>

          <Text style={styles.separator}>:</Text>

          <View style={styles.timeBlock}>
            <Text style={styles.timeNumber}>{timeLeft.minutes.toString().padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>{t('payments.minutes')}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.overdueContainer}>
          <Text style={styles.overdueText}>
            {t('payments.paymentOverdue')}
          </Text>
          <Text style={styles.overdueSubtext}>
            {t('payments.renewCoverage')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 28,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  separator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 8,
  },
  overdueContainer: {
    alignItems: 'center',
  },
  overdueText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  overdueSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
