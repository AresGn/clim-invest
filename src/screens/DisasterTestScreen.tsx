import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import DisasterHistorySection from '../components/dashboard/DisasterHistorySection';
import { COLORS } from '../utils/constants';
import { DisasterEvent } from '../services/climateDataService';

export default function DisasterTestScreen() {
  const handleDisasterPress = (disaster: DisasterEvent) => {
    console.log('Catastrophe sélectionnée:', disaster);
    // Ici on pourrait naviguer vers un écran de détails
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test - Historique des Catastrophes</Text>
        <Text style={styles.subtitle}>
          Données pour Bénin, Sénégal et Niger
        </Text>
      </View>
      
      <DisasterHistorySection onDisasterPress={handleDisasterPress} />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📊 Données basées sur EM-DAT et AFDM APIs
        </Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
