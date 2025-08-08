import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AccessibleButton from './AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../../utils/constants';
import { useTranslation } from '../../hooks/useTranslation';

interface LocationPickerProps {
  onLocationSelected: (location: { latitude: number; longitude: number; region: string }) => void;
  currentLocation?: { latitude: number; longitude: number; region: string } | null;
  style?: any;
}

const BENIN_REGIONS = [
  'Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines',
  'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'
];

const REGION_COORDINATES: { [key: string]: { lat: number; lon: number } } = {
  'Alibori': { lat: 11.3, lon: 3.0 },
  'Atacora': { lat: 10.5, lon: 1.5 },
  'Atlantique': { lat: 6.5, lon: 2.3 },
  'Borgou': { lat: 9.5, lon: 2.8 },
  'Collines': { lat: 8.0, lon: 2.3 },
  'Couffo': { lat: 7.0, lon: 1.8 },
  'Donga': { lat: 9.0, lon: 1.8 },
  'Littoral': { lat: 6.4, lon: 2.3 },
  'Mono': { lat: 6.8, lon: 1.8 },
  'Ouémé': { lat: 6.8, lon: 2.6 },
  'Plateau': { lat: 7.2, lon: 2.6 },
  'Zou': { lat: 7.2, lon: 2.3 }
};

export default function LocationPicker({ onLocationSelected, currentLocation, style }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const { t } = useTranslation();

  const checkLocationServices = async (): Promise<boolean> => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'Services de localisation désactivés',
          'Veuillez activer les services de localisation dans les paramètres de votre appareil.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Sélectionner manuellement', onPress: () => setShowManualPicker(true) }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur vérification services localisation:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès à la localisation est nécessaire pour calculer les risques climatiques.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Sélectionner manuellement', onPress: () => setShowManualPicker(true) }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  };

  const getBeninRegionFromCoordinates = (lat: number, lon: number): string => {
    // Détection de région pour le Bénin et pays voisins
    if (lat >= 6.2 && lat <= 12.4 && lon >= 0.8 && lon <= 3.8) {
      if (lat >= 11.0) return 'Alibori';
      if (lat >= 10.0) return 'Borgou';
      if (lat >= 9.0) return 'Donga';
      if (lat >= 8.0) return 'Atacora';
      if (lat >= 7.5) return 'Collines';
      if (lat >= 7.0) return 'Zou';
      if (lat >= 6.5) return 'Plateau';
      return 'Ouémé';
    }
    return 'Région inconnue';
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    
    try {
      // Vérifier les services de localisation
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setLoading(false);
        return;
      }

      // Demander les permissions
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        setLoading(false);
        return;
      }

      // Obtenir la position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 20000,
        maximumAge: 300000
      });

      // Valider les coordonnées
      if (!location.coords || 
          typeof location.coords.latitude !== 'number' || 
          typeof location.coords.longitude !== 'number' ||
          Math.abs(location.coords.latitude) > 90 ||
          Math.abs(location.coords.longitude) > 180) {
        throw new Error('Coordonnées invalides reçues');
      }

      // Géocodage inverse
      let regionName = 'Région inconnue';
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (address && address.length > 0) {
          regionName = address[0]?.region ||
                      address[0]?.city ||
                      address[0]?.district ||
                      address[0]?.subregion ||
                      getBeninRegionFromCoordinates(location.coords.latitude, location.coords.longitude);
        }
      } catch (geocodeError) {
        console.warn('Géocodage échoué:', geocodeError);
        regionName = getBeninRegionFromCoordinates(location.coords.latitude, location.coords.longitude);
      }

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        region: regionName
      };

      onLocationSelected(locationData);
      Alert.alert('Succès', `Localisation obtenue: ${regionName}`);

    } catch (error: any) {
      console.error('Erreur géolocalisation:', error);
      
      let errorMessage = 'Impossible d\'obtenir votre localisation. ';
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Délai d\'attente dépassé.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage += 'Services de localisation indisponibles.';
      } else if (error.code === 'E_LOCATION_SETTINGS_UNSATISFIED') {
        errorMessage += 'Paramètres de localisation à ajuster.';
      } else {
        errorMessage += 'Erreur technique.';
      }

      Alert.alert(
        'Erreur de localisation',
        errorMessage + ' Voulez-vous sélectionner votre région manuellement ?',
        [
          { text: 'Réessayer', onPress: getCurrentLocation },
          { text: 'Sélectionner manuellement', onPress: () => setShowManualPicker(true) }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const selectManualRegion = (region: string) => {
    const coords = REGION_COORDINATES[region] || { lat: 6.4, lon: 2.3 };
    
    const locationData = {
      latitude: coords.lat,
      longitude: coords.lon,
      region: region
    };

    onLocationSelected(locationData);
    setShowManualPicker(false);
    Alert.alert('Région sélectionnée', `Votre région a été définie sur ${region}`);
  };

  if (showManualPicker) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{t('location.selectRegion')}</Text>
        <View style={styles.regionsGrid}>
          {BENIN_REGIONS.map((region) => (
            <AccessibleButton
              key={region}
              title={region}
              onPress={() => selectManualRegion(region)}
              style={styles.regionButton}
              textStyle={styles.regionButtonText}
              accessibilityHint={`Sélectionner la région ${region}`}
            />
          ))}
        </View>
        <AccessibleButton
          title={t('location.useGPS')}
          onPress={() => setShowManualPicker(false)}
          style={styles.gpsButton}
          accessibilityHint={t('location.useGPS')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>{t('location.title')}</Text>
      
      {currentLocation ? (
        <View style={styles.locationDisplay}>
          <Text style={styles.locationText}>
            📍 {currentLocation.region}
          </Text>
          <Text style={styles.coordinatesText}>
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
          <AccessibleButton
            title={t('location.modify')}
            onPress={getCurrentLocation}
            style={styles.modifyButton}
            accessibilityHint={t('location.modify')}
          />
        </View>
      ) : (
        <View style={styles.locationActions}>
          <AccessibleButton
            title={loading ? t('location.gettingLocation') : t('location.getCurrentLocation')}
            onPress={getCurrentLocation}
            loading={loading}
            disabled={loading}
            style={styles.gpsButton}
            accessibilityHint="Utiliser le GPS pour déterminer votre zone climatique"
          />
          
          <AccessibleButton
            title={t('location.selectManually')}
            onPress={() => setShowManualPicker(true)}
            style={styles.manualButton}
            accessibilityHint="Choisir votre région dans une liste"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  locationDisplay: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  locationActions: {
    gap: 12,
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  manualButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modifyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  regionButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: '30%',
  },
  regionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
