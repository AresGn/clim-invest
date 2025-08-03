import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState } from '../store/store';

interface CreditApplicationScreenProps {
  navigation: any;
}

export default function CreditApplicationScreen({ navigation }: CreditApplicationScreenProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedAmount: '',
    purpose: '',
    repaymentPeriod: '12',
    additionalInfo: ''
  });

  const handleSubmit = async () => {
    if (!formData.requestedAmount || !formData.purpose) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    
    // Simulation de soumission
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Demande soumise',
        'Votre demande de crédit a été soumise avec succès. Vous recevrez une réponse dans les 48h.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 2000);
  };

  const purposes = [
    { value: 'seeds', label: '🌱 Achat de semences' },
    { value: 'fertilizer', label: '🧪 Engrais et pesticides' },
    { value: 'equipment', label: '🚜 Équipement agricole' },
    { value: 'irrigation', label: '💧 Système d\'irrigation' },
    { value: 'storage', label: '🏪 Infrastructure de stockage' },
    { value: 'other', label: '📝 Autre (préciser)' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💳 Demande de Crédit</Text>
        <Text style={styles.subtitle}>Financement agricole adapté</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Informations utilisateur */}
        <View style={styles.userInfoCard}>
          <Text style={styles.cardTitle}>👤 Vos Informations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Région</Text>
            <Text style={styles.infoValue}>{user?.location.region}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Culture principale</Text>
            <Text style={styles.infoValue}>
              {user?.cropType === 'cowpea' ? '🫘 Niébé' :
               user?.cropType === 'maize' ? '🌽 Maïs' :
               user?.cropType === 'cotton' ? '🌿 Coton' :
               `🌱 ${user?.cropType}`}
            </Text>
          </View>
        </View>

        {/* Formulaire de demande */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>📋 Détails de la Demande</Text>
          
          {/* Montant demandé */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Montant demandé (FCFA) *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.requestedAmount}
              onChangeText={(text) => setFormData({...formData, requestedAmount: text})}
              placeholder="Ex: 50000"
              keyboardType="numeric"
              accessibilityLabel="Montant demandé en FCFA"
            />
          </View>

          {/* Objet du crédit */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🎯 Objet du crédit *</Text>
            <View style={styles.purposeOptions}>
              {purposes.map((purpose) => (
                <AccessibleButton
                  key={purpose.value}
                  title={purpose.label}
                  onPress={() => setFormData({...formData, purpose: purpose.value})}
                  style={[
                    styles.purposeButton,
                    formData.purpose === purpose.value && styles.purposeButtonSelected
                  ]}
                  textStyle={[
                    styles.purposeButtonText,
                    formData.purpose === purpose.value && styles.purposeButtonTextSelected
                  ]}
                  accessibilityHint={`Sélectionner ${purpose.label}`}
                />
              ))}
            </View>
          </View>

          {/* Période de remboursement */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>⏱️ Période de remboursement souhaitée</Text>
            <View style={styles.periodOptions}>
              {['6', '12', '18', '24'].map((months) => (
                <AccessibleButton
                  key={months}
                  title={`${months} mois`}
                  onPress={() => setFormData({...formData, repaymentPeriod: months})}
                  style={[
                    styles.periodButton,
                    formData.repaymentPeriod === months && styles.periodButtonSelected
                  ]}
                  textStyle={[
                    styles.periodButtonText,
                    formData.repaymentPeriod === months && styles.periodButtonTextSelected
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Informations supplémentaires */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📝 Informations supplémentaires</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.additionalInfo}
              onChangeText={(text) => setFormData({...formData, additionalInfo: text})}
              placeholder="Décrivez votre projet, vos besoins spécifiques..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Informations supplémentaires sur votre demande"
            />
          </View>
        </View>

        {/* Conditions */}
        <View style={styles.conditionsCard}>
          <Text style={styles.cardTitle}>📋 Conditions Générales</Text>
          <Text style={styles.conditionsText}>
            • Taux d'intérêt : 8.5% à 18% selon votre profil{'\n'}
            • Frais de dossier : 2% du montant emprunté{'\n'}
            • Garantie : Assurance récolte obligatoire{'\n'}
            • Délai de réponse : 48 heures maximum{'\n'}
            • Versement : Sous 7 jours après approbation
          </Text>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsSection}>
          <AccessibleButton
            title="📤 Soumettre la Demande"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
            accessibilityHint="Envoyer votre demande de crédit"
          />
          
          <AccessibleButton
            title="❌ Annuler"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            accessibilityHint="Annuler et retourner aux analyses"
          />
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
    backgroundColor: COLORS.success,
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  conditionsCard: {
    backgroundColor: COLORS.accent + '20',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  infoValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    borderRadius: 8,
    padding: 12,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 100,
  },
  purposeOptions: {
    gap: 8,
  },
  purposeButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  purposeButtonSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  purposeButtonText: {
    color: COLORS.text.secondary,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    textAlign: 'left',
  },
  purposeButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    paddingVertical: 12,
    borderRadius: 8,
  },
  periodButtonSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  periodButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  conditionsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.success,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
  },
});
