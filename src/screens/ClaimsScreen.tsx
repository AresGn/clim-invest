import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { submitClaim } from '../store/slices/insuranceSlice';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleInput from '../components/common/AccessibleInput';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState, AppDispatch } from '../store/store';

interface ClaimsScreenProps {
  navigation: any;
  route?: any;
}

export default function ClaimsScreen({ navigation, route }: ClaimsScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { coverage, loading } = useSelector((state: RootState) => state.insurance);
  
  const [claimType, setClaimType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEmergency = route?.params?.emergency || false;

  const claimTypes = [
    { value: 'drought', label: 'Sécheresse', icon: '🌵', description: 'Manque de pluie prolongé' },
    { value: 'flood', label: 'Inondation', icon: '🌊', description: 'Excès d\'eau sur les cultures' },
    { value: 'storm', label: 'Tempête', icon: '⛈️', description: 'Vents violents, grêle' },
    { value: 'other', label: 'Autre', icon: '❓', description: 'Autre type de sinistre' }
  ];

  const handleSubmitClaim = async () => {
    if (!claimType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de sinistre');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire le sinistre');
      return;
    }

    if (!coverage) {
      Alert.alert('Erreur', 'Aucune couverture active trouvée');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(submitClaim({
        userId: user?.id,
        coverageId: coverage.id,
        type: claimType as any,
        description,
        amount: coverage.amount * 0.5 // 50% de la couverture
      }));

      Alert.alert(
        'Réclamation soumise',
        'Votre réclamation a été soumise avec succès. Vous recevrez une réponse sous 48h.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre la réclamation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.title}>
          {isEmergency ? '🚨 Sinistre d\'urgence' : 'Déclarer un sinistre'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {isEmergency && (
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyText}>
              ⚡ Déclaration d'urgence activée. Votre réclamation sera traitée en priorité.
            </Text>
          </View>
        )}

        {/* Informations de couverture */}
        {coverage && (
          <View style={styles.coverageInfo}>
            <Text style={styles.sectionTitle}>Votre couverture</Text>
            <View style={styles.coverageDetails}>
              <Text style={styles.coverageAmount}>
                Montant assuré: {coverage.amount.toLocaleString()} FCFA
              </Text>
              <Text style={styles.coverageType}>
                Culture: {coverage.cropType} • {coverage.farmSize} hectares
              </Text>
            </View>
          </View>
        )}

        {/* Type de sinistre */}
        <View style={styles.claimTypeSection}>
          <Text style={styles.sectionTitle}>Type de sinistre</Text>
          <View style={styles.claimTypeGrid}>
            {claimTypes.map((type) => (
              <AccessibleButton
                key={type.value}
                title={`${type.icon}\n${type.label}\n${type.description}`}
                onPress={() => setClaimType(type.value)}
                style={[
                  styles.claimTypeButton,
                  claimType === type.value && styles.claimTypeButtonSelected
                ]}
                textStyle={[
                  styles.claimTypeText,
                  claimType === type.value && styles.claimTypeTextSelected
                ]}
                accessibilityLabel={`${type.label}: ${type.description}`}
                accessibilityState={{ selected: claimType === type.value }}
              />
            ))}
          </View>
        </View>

        {/* Description du sinistre */}
        <View style={styles.descriptionSection}>
          <AccessibleInput
            label="Description du sinistre"
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez en détail les dégâts observés sur vos cultures..."
            accessibilityLabel="Description détaillée du sinistre"
            accessibilityHint="Décrivez les dégâts pour faciliter l'évaluation"
            required
            style={styles.descriptionInput}
          />
        </View>

        {/* Informations importantes */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Informations importantes</Text>
          <Text style={styles.infoText}>
            • Votre réclamation sera évaluée sous 48h{'\n'}
            • Un expert peut visiter votre exploitation{'\n'}
            • Gardez des preuves (photos, témoins){'\n'}
            • Le paiement se fait par Mobile Money
          </Text>
        </View>

        {/* Bouton de soumission */}
        <AccessibleButton
          title={isEmergency ? "🚨 Soumettre en urgence" : "Soumettre la réclamation"}
          onPress={handleSubmitClaim}
          loading={submitting}
          disabled={!claimType || !description.trim()}
          style={[
            styles.submitButton,
            isEmergency && styles.emergencySubmitButton
          ]}
          accessibilityHint="Soumettre votre réclamation pour évaluation"
        />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emergencyBanner: {
    backgroundColor: COLORS.error + '20',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    marginBottom: 24,
  },
  emergencyText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  coverageInfo: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  coverageDetails: {
    gap: 8,
  },
  coverageAmount: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  coverageType: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  claimTypeSection: {
    marginBottom: 24,
  },
  claimTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  claimTypeButton: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.text.disabled,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  claimTypeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  claimTypeText: {
    color: COLORS.text.primary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  claimTypeTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionInput: {
    minHeight: 100,
  },
  infoBox: {
    backgroundColor: COLORS.accent + '20',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    marginBottom: 24,
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
  submitButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 32,
  },
  emergencySubmitButton: {
    backgroundColor: COLORS.error,
  },
});
