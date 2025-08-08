import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleInput from '../components/common/AccessibleInput';
import { COLORS, ACCESSIBILITY_SETTINGS, CROP_TYPES } from '../utils/constants';
import { PremiumCalculator } from '../utils/premiumCalculator';
import { RootState } from '../store/store';
import * as Location from 'expo-location';
import { useTranslation } from '../hooks/useTranslation';

interface ReferColleagueScreenProps {
  navigation: any;
}

export default function ReferColleagueScreen({ navigation }: ReferColleagueScreenProps) {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedOption, setSelectedOption] = useState<'sms' | 'form' | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cropType: '',
    farmSize: '1',
  });

  useEffect(() => {
    if (selectedOption === 'form') {
      getCurrentLocation();
    }
  }, [selectedOption]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('referColleague.permissionDenied'), t('referColleague.locationRequired'));
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error(t('referColleague.geoError'), error);
      Alert.alert(t('common.error'), t('referColleague.locationError'));
    }
  };

  const handleSMSOption = () => {
    Alert.alert(
      t('referColleague.smsRegistration'),
      t('referColleague.smsInstructions'),
      [
        {
          text: t('referColleague.call980'),
          onPress: () => Linking.openURL('tel:980')
        },
        {
          text: 'Partager par SMS',
          onPress: () => {
            const message = 'Salut ! Je te recommande Clim-Invest pour assurer tes cultures. Envoie "MON ASSURANCE AGRICOLE" au 980 ou appelle le 980. Un conseiller t\'aidera gratuitement !';
            Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
          }
        },
        { text: t('referColleague.cancel'), style: 'cancel' }
      ]
    );
  };

  const calculatePremium = () => {
    if (!formData.cropType || !formData.farmSize) return null;
    
    return PremiumCalculator.calculatePremium({
      cropType: formData.cropType,
      farmSize: parseFloat(formData.farmSize) || 1,
      riskLevel: 0.5, // Risque moyen par défaut
      region: user?.location?.region
    });
  };

  const premiumResult = calculatePremium();

  const handleFormSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.cropType || !formData.farmSize) {
      Alert.alert(t('common.error'), t('referColleague.fillRequiredFields'));
      return;
    }

    if (!location) {
      Alert.alert(t('common.error'), t('referColleague.locationRequiredError'));
      return;
    }

    setLoading(true);
    
    try {
      // Simulation d'un appel API pour créer le compte et déclencher le paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        t('referColleague.registrationSuccess'),
        t('referColleague.registrationSuccessMessage', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          premium: premiumResult?.monthlyPremium
        }),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Ici on déclencherait normalement le processus de paiement Mobile Money
              Alert.alert(
                'Paiement requis',
                `Demande de paiement Mobile Money envoyée pour ${premiumResult?.monthlyPremium} FCFA. ${formData.firstName} recevra une notification sur son téléphone.`,
                [{ text: 'Compris', onPress: () => navigation.goBack() }]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('referColleague.registrationError'));
    } finally {
      setLoading(false);
    }
  };

  if (!selectedOption) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inscrire un Collègue</Text>
          <Text style={styles.subtitle}>
            Aidez un autre agriculteur à se protéger
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Choisissez une méthode :</Text>

          {/* Option SMS/Appel */}
          <AccessibleButton
            title={t('referColleague.smsOption')}
            onPress={() => setSelectedOption('sms')}
            style={styles.optionButton}
            accessibilityHint={t('referColleague.smsOptionHint')}
          />
          
          <View style={styles.optionDescription}>
            <Text style={styles.optionDescriptionText}>
              • Votre collègue envoie un SMS au 980{'\n'}
              • Ou appelle directement le 980{'\n'}
              • Un conseiller le prend en charge{'\n'}
              • Inscription guidée par téléphone
            </Text>
          </View>

          {/* Option Formulaire */}
          <AccessibleButton
            title={t('referColleague.directOption')}
            onPress={() => setSelectedOption('form')}
            style={styles.optionButton}
            accessibilityHint={t('referColleague.directOptionHint')}
          />
          
          <View style={styles.optionDescription}>
            <Text style={styles.optionDescriptionText}>
              • Remplissez les informations maintenant{'\n'}
              • Localisation automatique GPS{'\n'}
              • Calcul immédiat de la prime{'\n'}
              • Paiement de la première prime déclenché
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (selectedOption === 'sms') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inscription par SMS/Appel</Text>
          <Text style={styles.subtitle}>
            Méthode simple et rapide
          </Text>
        </View>

        <View style={styles.instructionsContainer}>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📱 Option 1 : SMS</Text>
            <Text style={styles.instructionText}>
              Demandez à votre collègue d'envoyer :
            </Text>
            <View style={styles.smsExample}>
              <Text style={styles.smsText}>MON ASSURANCE AGRICOLE</Text>
              <Text style={styles.smsNumber}>au 980</Text>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📞 Option 2 : Appel</Text>
            <Text style={styles.instructionText}>
              Ou appelez directement le :
            </Text>
            <View style={styles.phoneExample}>
              <Text style={styles.phoneNumber}>980</Text>
            </View>
          </View>

          <View style={styles.supportCard}>
            <Text style={styles.supportTitle}>🎯 Ce qui se passe ensuite</Text>
            <Text style={styles.supportText}>
              • Un de nos collègues prendra contact{'\n'}
              • Inscription guidée par téléphone{'\n'}
              • Calcul personnalisé de la prime{'\n'}
              • Activation immédiate de l'assurance
            </Text>
          </View>

          <AccessibleButton
            title="📱 Partager par SMS"
            onPress={handleSMSOption}
            style={styles.shareButton}
            accessibilityHint="Partager les instructions par SMS"
          />

          <AccessibleButton
            title={t('referColleague.backToOptions')}
            onPress={() => setSelectedOption(null)}
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    );
  }

  // Formulaire d'inscription directe
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inscription Directe</Text>
        <Text style={styles.subtitle}>
          Remplissez les informations de votre collègue
        </Text>
      </View>

      <View style={styles.form}>
        {/* Informations personnelles */}
        <View style={styles.inputGroup}>
          <AccessibleInput
            label={t('referColleague.firstName')}
            value={formData.firstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            placeholder={t('referColleague.firstNamePlaceholder')}
            style={styles.input}
            accessibilityLabel={t('referColleague.firstNameHint')}
          />
        </View>

        <View style={styles.inputGroup}>
          <AccessibleInput
            label={t('referColleague.lastName')}
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            placeholder={t('referColleague.lastNamePlaceholder')}
            style={styles.input}
            accessibilityLabel={t('referColleague.lastNameHint')}
          />
        </View>

        {/* Localisation */}
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>📍 Localisation</Text>
          {location ? (
            <Text style={styles.locationText}>
              ✅ Position GPS obtenue{'\n'}
              Lat: {location.coords.latitude.toFixed(4)}{'\n'}
              Lon: {location.coords.longitude.toFixed(4)}
            </Text>
          ) : (
            <Text style={styles.locationText}>
              🔄 Obtention de la position GPS...
            </Text>
          )}
        </View>

        {/* Type de culture */}
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
                accessibilityLabel={crop.accessibilityLabel}
              />
            ))}
          </ScrollView>
        </View>

        {/* Taille de l'exploitation */}
        <View style={styles.inputGroup}>
          <AccessibleInput
            label={t('referColleague.farmSize')}
            value={formData.farmSize}
            onChangeText={(text) => setFormData(prev => ({ ...prev, farmSize: text }))}
            placeholder="Ex: 2"
            keyboardType="numeric"
            style={styles.input}
            accessibilityLabel={t('referColleague.farmSizeHint')}
          />
        </View>

        {/* Calcul automatique de la prime */}
        {premiumResult && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>💰 Prime Calculée Automatiquement</Text>
            
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
          </View>
        )}

        {/* Boutons d'action */}
        <AccessibleButton
          title={loading ? t('referColleague.submitButtonLoading') : t('referColleague.submitButton')}
          onPress={handleFormSubmit}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          disabled={loading || !premiumResult || !location}
          accessibilityHint={t('referColleague.submitButtonHint')}
        />

        <AccessibleButton
          title={t('referColleague.backToOptions')}
          onPress={() => setSelectedOption(null)}
          style={styles.backButton}
        />
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
  optionsContainer: {
    padding: 16,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: COLORS.secondary,
    marginBottom: 12,
  },
  optionDescription: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  optionDescriptionText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  instructionsContainer: {
    padding: 16,
  },
  instructionCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  smsExample: {
    backgroundColor: COLORS.accent + '20',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  smsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  smsNumber: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  phoneExample: {
    backgroundColor: COLORS.success + '20',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  supportCard: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: COLORS.accent,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: COLORS.text.secondary,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
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
  locationCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
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
    backgroundColor: COLORS.success + '20',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  premiumValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
});
