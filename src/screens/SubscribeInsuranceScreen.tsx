import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleInput from '../components/common/AccessibleInput';
import { COLORS, ACCESSIBILITY_SETTINGS, CROP_TYPES } from '../utils/constants';
import { PremiumCalculator } from '../utils/premiumCalculator';
import { RootState } from '../store/store';

interface SubscribeInsuranceScreenProps {
  navigation: any;
}

export default function SubscribeInsuranceScreen({ navigation }: SubscribeInsuranceScreenProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    cropType: '',
    farmSize: '1',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  const calculatePremium = () => {
    if (!formData.cropType || !formData.farmSize) return null;
    
    return PremiumCalculator.calculatePremium({
      cropType: formData.cropType,
      farmSize: parseFloat(formData.farmSize) || 1,
      riskLevel: 0.5, // Risque moyen par défaut
      region: formData.location || user?.location?.region
    });
  };

  const premiumResult = calculatePremium();

  const handleSubscribe = async () => {
    if (!formData.cropType || !formData.farmSize) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Souscription réussie !',
        `Votre nouvelle assurance pour ${formData.cropType} a été créée. Prime mensuelle: ${premiumResult?.monthlyPremium} FCFA`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la souscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle Assurance</Text>
        <Text style={styles.subtitle}>
          Protégez une autre culture ou exploitation
        </Text>
      </View>

      <View style={styles.form}>
        {/* Sélection du type de culture */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type de culture *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelector}>
            {CROP_TYPES.map((crop) => (
              <AccessibleButton
                key={crop.value}
                title={`${crop.icon} ${crop.label}`}
                onPress={() => setFormData(prev => ({ ...prev, cropType: crop.value }))}
                style={[
                  styles.cropButton,
                  formData.cropType === crop.value && styles.cropButtonSelected
                ]}
                textStyle={[
                  styles.cropButtonText,
                  formData.cropType === crop.value && styles.cropButtonTextSelected
                ]}
                accessible={true}
                accessibilityLabel={crop.accessibilityLabel}
              />
            ))}
          </ScrollView>
        </View>

        {/* Taille de l'exploitation */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Taille de l'exploitation (hectares) *</Text>
          <AccessibleInput
            value={formData.farmSize}
            onChangeText={(text) => setFormData(prev => ({ ...prev, farmSize: text }))}
            placeholder="Ex: 2"
            keyboardType="numeric"
            style={styles.input}
            accessibilityLabel="Taille de l'exploitation en hectares"
          />
        </View>

        {/* Localisation (optionnel) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Région spécifique (optionnel)</Text>
          <AccessibleInput
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="Ex: Donga, Borgou..."
            style={styles.input}
            accessibilityLabel="Région de l'exploitation"
          />
          <Text style={styles.helperText}>
            Laissez vide pour utiliser votre localisation actuelle
          </Text>
        </View>

        {/* Calcul de la prime */}
        {premiumResult && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>Votre Prime Calculée</Text>
            
            <View style={styles.premiumDetails}>
              <View style={styles.premiumRow}>
                <Text style={styles.premiumLabel}>Prime mensuelle</Text>
                <Text style={styles.premiumValue}>
                  {PremiumCalculator.formatAmount(premiumResult.monthlyPremium)}
                </Text>
              </View>
              
              <View style={styles.premiumRow}>
                <Text style={styles.premiumLabel}>Montant assuré</Text>
                <Text style={styles.premiumValue}>
                  {PremiumCalculator.formatAmount(premiumResult.coverageAmount)}
                </Text>
              </View>
              
              <View style={styles.premiumRow}>
                <Text style={styles.premiumLabel}>Niveau de risque</Text>
                <Text style={[
                  styles.premiumValue,
                  { color: premiumResult.riskCategory === 'high' ? COLORS.error : 
                           premiumResult.riskCategory === 'medium' ? COLORS.warning : COLORS.success }
                ]}>
                  {premiumResult.riskCategory === 'high' ? '🔴 Élevé' :
                   premiumResult.riskCategory === 'medium' ? '🟠 Modéré' : '🟢 Faible'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.premiumExplanation}>
              {premiumResult.explanation}
            </Text>
          </View>
        )}

        {/* Bouton de souscription */}
        <AccessibleButton
          title={loading ? "Souscription en cours..." : "Souscrire maintenant"}
          onPress={handleSubscribe}
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          disabled={loading || !premiumResult}
          accessible={true}
          accessibilityHint="Créer la nouvelle assurance avec les paramètres choisis"
        />

        {/* Information importante */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Information importante</Text>
          <Text style={styles.infoText}>
            • La prime ne dépassera jamais 1000 FCFA/mois{'\n'}
            • Indemnisation automatique en 24-72h{'\n'}
            • Paiement par Mobile Money{'\n'}
            • Aucun frais de dossier
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    borderWidth: 1,
    borderColor: COLORS.text.secondary + '30',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cropSelector: {
    flexGrow: 0,
  },
  cropButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.text.secondary + '30',
    minWidth: 100,
  },
  cropButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cropButtonText: {
    fontSize: 14,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  cropButtonTextSelected: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  premiumDetails: {
    marginBottom: 16,
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumLabel: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
  },
  premiumValue: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  premiumExplanation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 24,
  },
  subscribeButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  infoCard: {
    backgroundColor: COLORS.accent + '20',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoTitle: {
    fontSize: 16,
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
