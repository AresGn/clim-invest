import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import AccessibleInput from '../components/common/AccessibleInput';
import AccessibleButton from '../components/common/AccessibleButton';
import LocationPicker from '../components/common/LocationPicker';
import { COLORS, CROP_TYPES, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { validatePhone, validateRegistrationData } from '../utils/validation';
import { AppDispatch } from '../store/store';

interface RegistrationScreenProps {
  navigation: any;
}

export default function RegistrationScreen({ navigation }: RegistrationScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: null as any,
    cropType: '',
    farmSize: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const validation = validateRegistrationData({
      name: formData.name,
      phone: formData.phone,
      farmSize: formData.farmSize,
      cropType: formData.cropType,
      location: formData.location
    });

    if (!validation.isValid) {
      const newErrors: any = {};
      validation.errors.forEach(error => {
        if (error.includes('nom')) newErrors.name = error;
        if (error.includes('téléphone')) newErrors.phone = error;
        if (error.includes('ferme')) newErrors.farmSize = error;
        if (error.includes('culture')) newErrors.cropType = error;
        if (error.includes('GPS')) newErrors.location = error;
      });
      setErrors(newErrors);

      // Afficher le premier message d'erreur
      Alert.alert('Erreur de validation', validation.errors[0]);
      return false;
    }

    setErrors({});
    return true;
  };




  const handleRegistration = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!formData.location) {
      Alert.alert('Localisation requise', 'Veuillez obtenir votre position GPS pour continuer');
      return;
    }

    setLoading(true);
    try {
      await dispatch(registerUser(formData));
      // Navigation will be handled automatically by AppNavigator when isAuthenticated becomes true
      // No need to manually navigate - Redux state change will trigger navigation
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [formData, dispatch, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessible={true}
      accessibilityLabel="Formulaire d'inscription agriculteur"
    >
      <Text
        style={styles.header}
        accessible={true}
      >
        Inscription Agriculteur
      </Text>

      <Text style={styles.subtitle}>
        Créez votre compte en quelques étapes simples
      </Text>

      <AccessibleInput
        label="Nom complet"
        value={formData.name}
        onChangeText={(name) => setFormData(prev => ({ ...prev, name }))}
        placeholder="Entrez votre nom"
        accessibilityLabel="Champ nom complet"
        accessibilityHint="Saisissez votre nom et prénom"
        required
        error={errors.name}
      />

      <AccessibleInput
        label="Numéro de téléphone"
        value={formData.phone}
        onChangeText={(phone) => setFormData(prev => ({ ...prev, phone }))}
        placeholder="+226 XX XX XX XX"
        keyboardType="phone-pad"
        accessibilityLabel="Champ numéro de téléphone"
        accessibilityHint="Numéro pour recevoir SMS et paiements Mobile Money"
        required
        error={errors.phone}
      />

      <LocationPicker
        currentLocation={formData.location}
        onLocationSelected={(location) => setFormData(prev => ({ ...prev, location }))}
        style={styles.locationSection}
      />

      <View style={styles.cropSection}>
        <Text style={styles.sectionTitle}>Type de culture principale</Text>
        {errors.cropType && (
          <Text style={styles.errorText}>{errors.cropType}</Text>
        )}
        <View style={styles.cropGrid}>
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
              // accessibilityRole="radio"
              accessibilityState={{ selected: formData.cropType === crop.value }}
            />
          ))}
        </View>
      </View>

      <AccessibleButton
        title="Créer mon compte"
        onPress={handleRegistration}
        loading={loading}
        disabled={!formData.name || !formData.phone || !formData.cropType || !formData.location}
        accessibilityHint="Créer votre compte et accéder au tableau de bord"
        style={styles.primaryButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
    marginTop: 24,
  },
  locationSection: {
    marginVertical: 16,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  locationText: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.primary,
    flex: 1,
  },
  modifyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  locationButton: {
    backgroundColor: COLORS.primary,
  },
  cropSection: {
    marginVertical: 16,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  cropButton: {
    width: '48%',
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.text.disabled,
    paddingVertical: 12,
  },
  cropButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  cropButtonText: {
    color: COLORS.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  cropButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 8,
  },
});
