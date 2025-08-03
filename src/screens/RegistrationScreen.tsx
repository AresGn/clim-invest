import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActionSheetIOS, Platform } from 'react-native';
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
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is needed to calculate climate risks for your farm. You can also select your region manually.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Select Manually', onPress: showManualLocationPicker }
          ]
        );
        return;
      }

      setLoading(true);

      // Get current position with timeout and accuracy settings
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // 15 seconds timeout
        maximumAge: 60000 // Accept cached location up to 1 minute old
      });

      // Get address information
      let regionName = 'Unknown Region';
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        regionName = address[0]?.region ||
                    address[0]?.city ||
                    address[0]?.district ||
                    address[0]?.subregion ||
                    'Unknown Region';
      } catch (geocodeError) {
        console.warn('Geocoding failed, using coordinates only:', geocodeError);
        // Determine region based on coordinates for Benin
        regionName = getBeninRegionFromCoordinates(location.coords.latitude, location.coords.longitude);
      }

      setFormData(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          region: regionName
        }
      }));

      Alert.alert('Success', `Location obtained: ${regionName}`);

    } catch (error: any) {
      console.error('Location error:', error);

      let errorMessage = 'Unable to get your location. ';
      let showManualOption = true;

      if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Location request timed out. Please try again or select your region manually.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage += 'Location services are unavailable. Please enable GPS and try again.';
      } else if (error.code === 'E_LOCATION_SETTINGS_UNSATISFIED') {
        errorMessage += 'Location settings need to be adjusted. Please check your GPS settings.';
      } else {
        errorMessage += 'Please try again or select your region manually.';
      }

      Alert.alert(
        'Location Error',
        errorMessage,
        [
          { text: 'Try Again', onPress: getCurrentLocation },
          { text: 'Select Manually', onPress: showManualLocationPicker }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Determine Benin region from coordinates
  const getBeninRegionFromCoordinates = (lat: number, lon: number): string => {
    // Approximate regions of Benin based on coordinates
    if (lat >= 11.5) return 'Alibori';
    if (lat >= 10.5) return 'Borgou';
    if (lat >= 9.5) return 'Atacora';
    if (lat >= 8.5) return 'Donga';
    if (lat >= 7.5) return 'Collines';
    if (lat >= 6.5) return 'Zou';
    if (lat >= 6.0) return 'Plateau';
    return 'Littoral';
  };

  // Manual location picker
  const showManualLocationPicker = useCallback(() => {
    const beninRegions = [
      'Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines',
      'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...beninRegions],
          cancelButtonIndex: 0,
          title: 'Select your region'
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const selectedRegion = beninRegions[buttonIndex - 1];
            setManualLocation(selectedRegion);
          }
        }
      );
    } else {
      // For Android, show alert with options
      Alert.alert(
        'Select Your Region',
        'Choose the region where your farm is located:',
        beninRegions.map(region => ({
          text: region,
          onPress: () => setManualLocation(region)
        })).concat([{ text: 'Cancel', style: 'cancel' }])
      );
    }
  }, []);

  // Set manual location with approximate coordinates
  const setManualLocation = (region: string) => {
    // Approximate coordinates for each region in Benin
    const regionCoordinates: { [key: string]: { lat: number, lon: number } } = {
      'Alibori': { lat: 11.8, lon: 2.8 },
      'Atacora': { lat: 10.5, lon: 1.5 },
      'Atlantique': { lat: 6.5, lon: 2.0 },
      'Borgou': { lat: 9.8, lon: 2.6 },
      'Collines': { lat: 8.0, lon: 2.3 },
      'Couffo': { lat: 7.0, lon: 1.8 },
      'Donga': { lat: 9.0, lon: 1.8 },
      'Littoral': { lat: 6.4, lon: 2.3 },
      'Mono': { lat: 6.8, lon: 1.6 },
      'Ouémé': { lat: 6.7, lon: 2.6 },
      'Plateau': { lat: 7.2, lon: 2.7 },
      'Zou': { lat: 7.2, lon: 2.2 }
    };

    const coords = regionCoordinates[region] || { lat: 6.4, lon: 2.3 }; // Default to Cotonou

    setFormData(prev => ({
      ...prev,
      location: {
        latitude: coords.lat,
        longitude: coords.lon,
        region: region
      }
    }));

    Alert.alert('Location Set', `Your region has been set to ${region}`);
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
