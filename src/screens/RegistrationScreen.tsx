import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import AccessibleInput from '../components/common/AccessibleInput';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, CROP_TYPES, ACCESSIBILITY_SETTINGS } from '../utils/constants';
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
    const newErrors: any = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^\+226\s?\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format: +226 XX XX XX XX';
    }
    
    if (!formData.cropType) {
      newErrors.cropType = 'Veuillez sélectionner un type de culture';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisation de localisation requise pour calculer les risques climatiques');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      setFormData(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          region: address[0]?.region || 'Région inconnue'
        }
      }));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre localisation');
    } finally {
      setLoading(false);
    }
  }, []);

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
      navigation.navigate('Dashboard');
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

      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Localisation de votre exploitation</Text>
        {formData.location ? (
          <View style={styles.locationDisplay}>
            <Text 
              style={styles.locationText}
              accessibilityLabel={`Localisation actuelle : ${formData.location.region}`}
            >
              📍 {formData.location.region}
            </Text>
            <AccessibleButton
              title="Modifier"
              onPress={getCurrentLocation}
              style={styles.modifyButton}
              accessibilityHint="Modifier votre localisation"
            />
          </View>
        ) : (
          <AccessibleButton
            title="📍 Obtenir ma position GPS"
            onPress={getCurrentLocation}
            loading={loading}
            accessibilityHint="Utilise le GPS pour déterminer votre zone climatique"
            style={styles.locationButton}
          />
        )}
      </View>

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
