<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Plan Complet MVP Clim-Invest : Application React Native avec Expo Go

## Initialisation du Projet

### Commandes de Setup Initial

```bash
# Initialisation du projet Expo
npx create-expo-app@latest ClimInvest --template blank-typescript

# Navigation vers le dossier projet
cd ClimInvest

# Installation des dépendances principales
npx expo install react-navigation/native react-navigation/native-stack react-navigation/bottom-tabs

# Installation des dépendances de navigation
npx expo install react-native-screens react-native-safe-area-context

# Installation de Redux Toolkit pour gestion d'état
npm install @reduxjs/toolkit react-redux

# Installation Firebase pour authentification et données
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# Installation pour accessibilité et UX
npm install react-native-gesture-handler react-native-reanimated
npx expo install expo-location expo-device

# Installation pour SMS et téléphonie
npx expo install expo-sms expo-contacts

# Démarrage du serveur de développement
npx expo start
```


## Architecture du Projet Optimisée

```
ClimInvest/
├── src/
│   ├── components/           # Composants réutilisables accessibles
│   │   ├── common/
│   │   │   ├── AccessibleButton.tsx
│   │   │   ├── AccessibleInput.tsx
│   │   │   └── VoiceAssistant.tsx
│   │   ├── forms/
│   │   │   ├── OnboardingForm.tsx
│   │   │   └── InsuranceCalculator.tsx
│   │   └── cards/
│   │       ├── WeatherAlert.tsx
│   │       └── CoverageCard.tsx
│   ├── screens/             # Écrans principaux
│   │   ├── OnboardingScreen.tsx
│   │   ├── RegistrationScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── PremiumCalculationScreen.tsx
│   │   ├── ClaimsScreen.tsx
│   │   └── AdminDashboard.tsx
│   ├── navigation/          # Configuration navigation
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── store/              # Redux store et slices
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── insuranceSlice.ts
│   │   │   └── weatherSlice.ts
│   ├── services/           # APIs et services externes
│   │   ├── firebaseService.ts
│   │   ├── weatherService.ts
│   │   ├── smsService.ts
│   │   └── accessibilityService.ts
│   ├── utils/              # Utilitaires et logique métier
│   │   ├── riskCalculator.ts
│   │   ├── accessibilityUtils.ts
│   │   └── constants.ts
│   ├── hooks/              # Hooks personnalisés
│   │   ├── useAccessibility.ts
│   │   ├── useWeatherData.ts
│   │   └── useVoiceInterface.ts
│   └── types/              # Types TypeScript
│       ├── insurance.ts
│       ├── weather.ts
│       └── user.ts
├── assets/                 # Assets accessibles
│   ├── images/
│   ├── icons/             # Icônes vectorielles haute résolution
│   └── sounds/            # Sons pour feedback auditif
└── app.json               # Configuration Expo
```


## Écrans Principaux avec Accessibilité

### 1. Écran d'Onboarding Accessible (OnboardingScreen.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, AccessibilityInfo } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import AccessibleButton from '../components/common/AccessibleButton';
import VoiceAssistant from '../components/common/VoiceAssistant';

export default function OnboardingScreen({ navigation }: any) {
  const { isScreenReaderEnabled, announceForAccessibility } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    announceForAccessibility("Bienvenue sur Clim-Invest. Protégez vos récoltes en 3 minutes");
  }, []);

  const steps = [
    {
      title: "Bienvenue sur Clim-Invest",
      subtitle: "Micro-assurance climatique par SMS",
      description: "Protection automatique contre sécheresses, inondations et tempêtes",
      accessibilityLabel: "Écran de bienvenue. Clim-Invest offre une micro-assurance climatique accessible par SMS pour protéger vos cultures"
    },
    {
      title: "Simple comme un SMS",
      subtitle: "Souscription en 3 minutes",
      description: "Pas besoin de banque ou de paperasse. Tout se fait par téléphone mobile",
      accessibilityLabel: "Processus simple. Souscrivez votre assurance en 3 minutes par SMS, sans compte bancaire requis"
    }
  ];

  return (
    <View 
      style={styles.container}
      accessibilityRole="main"
      accessibilityLabel="Écran principal d'accueil"
    >
      {/* Interface vocale pour utilisateurs non-lettrés */}
      <VoiceAssistant 
        text={steps[currentStep].description}
        language="fr-BF" // Français du Burkina Faso
      />

      <View style={styles.progressIndicator}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive
            ]}
            accessibilityRole="progressbar"
            accessibilityValue={{ 
              min: 0, 
              max: steps.length - 1, 
              now: currentStep 
            }}
          />
        ))}
      </View>

      <Text
        style={styles.title}
        accessibilityRole="header"
        accessibilityLevel={1}
      >
        {steps[currentStep].title}
      </Text>

      <Text
        style={styles.description}
        accessibilityLabel={steps[currentStep].accessibilityLabel}
      >
        {steps[currentStep].description}
      </Text>

      <AccessibleButton
        title={currentStep === steps.length - 1 ? "Commencer" : "Suivant"}
        onPress={() => {
          if (currentStep === steps.length - 1) {
            navigation.navigate('Registration');
          } else {
            setCurrentStep(currentStep + 1);
          }
        }}
        accessibilityHint="Appuyez pour continuer vers l'étape suivante"
        style={styles.primaryButton}
      />
    </View>
  );
}
```


### 2. Écran d'Inscription Adaptatif (RegistrationScreen.tsx)

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import AccessibleInput from '../components/common/AccessibleInput';
import AccessibleButton from '../components/common/AccessibleButton';

export default function RegistrationScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: null as any,
    cropType: '',
    farmSize: 1
  });
  const [loading, setLoading] = useState(false);

  const cropTypes = [
    { value: 'maize', label: 'Maïs', accessibilityLabel: 'Maïs, culture céréalière' },
    { value: 'cotton', label: 'Coton', accessibilityLabel: 'Coton, culture de rente' },
    { value: 'groundnut', label: 'Arachide', accessibilityLabel: 'Arachide, légumineuse oléagineuse' },
    { value: 'vegetables', label: 'Maraîchage', accessibilityLabel: 'Maraîchage, cultures légumières' }
  ];

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
          ...location.coords,
          region: address[^0]?.region || 'Région inconnue'
        }
      }));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre localisation');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegistration = useCallback(async () => {
    if (!formData.name || !formData.phone || !formData.cropType) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await dispatch(registerUser(formData));
      navigation.navigate('PremiumCalculation', { userData: formData });
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [formData, dispatch, navigation]);

  return (
    <View 
      style={styles.container}
      accessibilityRole="form"
      accessibilityLabel="Formulaire d'inscription agriculteur"
    >
      <Text 
        style={styles.header}
        accessibilityRole="header"
        accessibilityLevel={1}
      >
        Inscription Agriculteur
      </Text>

      <AccessibleInput
        label="Nom complet"
        value={formData.name}
        onChangeText={(name) => setFormData(prev => ({ ...prev, name }))}
        placeholder="Entrez votre nom"
        accessibilityLabel="Champ nom complet"
        accessibilityHint="Saisissez votre nom et prénom"
        required
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
      />

      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Localisation de votre exploitation</Text>
        {formData.location ? (
          <Text 
            style={styles.locationText}
            accessibilityLabel={`Localisation actuelle : ${formData.location.region}`}
          >
            📍 {formData.location.region}
          </Text>
        ) : (
          <AccessibleButton
            title="Obtenir ma position GPS"
            onPress={getCurrentLocation}
            loading={loading}
            accessibilityHint="Utilise le GPS pour déterminer votre zone climatique"
            style={styles.locationButton}
          />
        )}
      </View>

      <View style={styles.cropSection}>
        <Text style={styles.sectionTitle}>Type de culture principale</Text>
        {cropTypes.map((crop) => (
          <AccessibleButton
            key={crop.value}
            title={crop.label}
            onPress={() => setFormData(prev => ({ ...prev, cropType: crop.value }))}
            style={[
              styles.cropButton,
              formData.cropType === crop.value && styles.cropButtonSelected
            ]}
            accessibilityLabel={crop.accessibilityLabel}
            accessibilityRole="radio"
            accessibilityState={{ selected: formData.cropType === crop.value }}
          />
        ))}
      </View>

      <AccessibleButton
        title="Calculer ma prime d'assurance"
        onPress={handleRegistration}
        loading={loading}
        disabled={!formData.name || !formData.phone || !formData.cropType}
        accessibilityHint="Procéder au calcul personnalisé de votre prime"
        style={styles.primaryButton}
      />
    </View>
  );
}
```


### 3. Dashboard Agriculteur Intelligent (DashboardScreen.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeatherAlerts, fetchCoverageStatus } from '../store/slices/insuranceSlice';
import WeatherAlert from '../components/cards/WeatherAlert';
import CoverageCard from '../components/cards/CoverageCard';
import AccessibleButton from '../components/common/AccessibleButton';

export default function DashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { coverage, weatherAlerts, loading } = useSelector((state: any) => state.insurance);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchWeatherAlerts(user.location)),
      dispatch(fetchCoverageStatus(user.id))
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleEmergencyClaim = () => {
    navigation.navigate('Claims', { emergency: true });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          accessibilityLabel="Actualiser les données"
        />
      }
      accessibilityRole="main"
      accessibilityLabel="Tableau de bord agriculteur"
    >
      {/* En-tête utilisateur */}
      <View style={styles.header}>
        <Text 
          style={styles.welcomeText}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          Bonjour {user.name} 👋
        </Text>
        <Text 
          style={styles.statusText}
          accessibilityLabel={`Statut couverture : ${coverage.isActive ? 'Actif' : 'Inactif'}`}
        >
          {coverage.isActive ? '🛡️ Protégé' : '⚠️ Non protégé'}
        </Text>
      </View>

      {/* Carte de couverture */}
      <CoverageCard 
        coverage={coverage}
        accessibilityLabel={`Couverture assurance : ${coverage.amount} FCFA jusqu'au ${coverage.expiryDate}`}
      />

      {/* Alertes météo temps réel */}
      <View style={styles.alertsSection}>
        <Text 
          style={styles.sectionTitle}
          accessibilityRole="header"
          accessibilityLevel={2}
        >
          Alertes Météo 🌦️
        </Text>
        
        {weatherAlerts.length > 0 ? (
          weatherAlerts.map((alert: any, index: number) => (
            <WeatherAlert
              key={index}
              alert={alert}
              accessibilityLabel={`Alerte ${alert.type} : ${alert.description}`}
            />
          ))
        ) : (
          <Text 
            style={styles.noAlertsText}
            accessibilityLabel="Aucune alerte météo en cours"
          >
            ✅ Aucune alerte en cours
          </Text>
        )}
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsSection}>
        <AccessibleButton
          title="🚨 Déclarer un Sinistre"
          onPress={handleEmergencyClaim}
          style={styles.emergencyButton}
          accessibilityHint="Signaler des dégâts sur vos cultures pour indemnisation"
          accessibilityRole="button"
        />

        <AccessibleButton
          title="📊 Voir l'Historique"
          onPress={() => navigation.navigate('History')}
          style={styles.secondaryButton}
          accessibilityHint="Consulter vos paiements et réclamations passées"
        />

        <AccessibleButton
          title="⚙️ Paramètres"
          onPress={() => navigation.navigate('Settings')}
          style={styles.secondaryButton}
          accessibilityHint="Modifier vos préférences et informations"
        />
      </View>

      {/* Conseils de la semaine */}
      <View style={styles.tipsSection}>
        <Text 
          style={styles.sectionTitle}
          accessibilityRole="header"
          accessibilityLevel={2}
        >
          Conseil de la Semaine 💡
        </Text>
        <Text 
          style={styles.tipText}
          accessibilityLabel="Conseil agricole de la semaine"
        >
          Surveillez l'indice NDVI de vos cultures via satellite. Un score inférieur à 0.4 indique un stress hydrique nécessitant une irrigation d'urgence.
        </Text>
      </View>
    </ScrollView>
  );
}
```


## Services et Intégrations

### Service Météo avec APIs Ouvertes (weatherService.ts)

```typescript
import { WEATHER_API_KEY, OPENEPI_BASE_URL } from '../utils/constants';

export class WeatherService {
  // Intégration Open-Meteo (gratuit, sans clé API)
  static async getCurrentWeather(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=Africa/Ouagadougou`
      );
      
      const data = await response.json();
      return {
        current: data.current,
        daily: data.daily,
        alerts: this.generateWeatherAlerts(data)
      };
    } catch (error) {
      console.error('Erreur météo:', error);
      throw new Error('Impossible de récupérer les données météo');
    }
  }

  // Simulation données satellite NDVI
  static async getNDVIData(latitude: number, longitude: number, dateRange: string) {
    // Simulation basée sur Digital Earth Africa
    const mockNDVI = Math.random() * (0.8 - 0.2) + 0.2; // Entre 0.2 et 0.8
    
    return {
      ndvi: mockNDVI,
      status: mockNDVI < 0.4 ? 'drought_risk' : mockNDVI > 0.7 ? 'healthy' : 'moderate',
      date: new Date().toISOString(),
      source: 'Digital Earth Africa (simulation)'
    };
  }

  // Génération alertes intelligentes
  static generateWeatherAlerts(weatherData: any) {
    const alerts = [];
    const current = weatherData.current;
    
    // Alerte sécheresse
    if (current.precipitation < 1 && current.temperature_2m > 35) {
      alerts.push({
        type: 'drought',
        severity: 'high',
        title: 'Risque de Sécheresse',
        description: `Température élevée (${current.temperature_2m}°C) et absence de pluie. Surveillez vos cultures.`,
        actionRequired: true,
        compensationTrigger: current.temperature_2m > 40
      });
    }

    // Alerte inondation
    if (current.precipitation > 50) {
      alerts.push({
        type: 'flood',
        severity: 'medium',
        title: 'Risque d\'Inondation',
        description: `Précipitations importantes (${current.precipitation}mm). Protégez vos récoltes.`,
        actionRequired: true,
        compensationTrigger: current.precipitation > 100
      });
    }

    return alerts;
  }

  // Calcul de risque climatique pour pricing
  static calculateClimateRisk(location: any, cropType: string, historicalData?: any) {
    const baseRisk = {
      'maize': 0.6,
      'cotton': 0.5,
      'groundnut': 0.4,
      'vegetables': 0.7
    };

    // Facteur régional (simulation)
    const regionalFactors = {
      'Sahel': 0.9,      // Risque élevé sécheresse
      'Sudan': 0.7,      // Risque modéré
      'Guinea': 0.5      // Risque faible
    };

    const cropRisk = baseRisk[cropType as keyof typeof baseRisk] || 0.6;
    const regionRisk = regionalFactors['Sahel']; // Par défaut Sahel
    
    return Math.min(cropRisk * regionRisk, 1.0);
  }
}
```


### Composant Bouton Accessible (AccessibleButton.tsx)

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: any;
}

export default function AccessibleButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState
}: AccessibleButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
        ...accessibilityState
      }}
      // Support pour lecteurs d'écran
      importantForAccessibility="yes"
    >
      {loading ? (
        <ActivityIndicator 
          color="#FFFFFF" 
          accessibilityLabel="Chargement en cours"
        />
      ) : (
        <Text 
          style={[
            styles.buttonText,
            disabled && styles.buttonTextDisabled
          ]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Minimum pour accessibilité tactile
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#666666',
  },
});
```


## Configuration Accessibilité et Déploiement

### app.json Configuration Complète

```json
{
  "expo": {
    "name": "Clim-Invest",
    "slug": "clim-invest",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2E7D32"
    },
    "accessibility": {
      "screenReaderSupport": true,
      "highContrastSupport": true
    },
    "localization": {
      "fr": "./assets/locales/fr.json",
      "bm": "./assets/locales/bm.json"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.climinvest.app",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Clim-Invest utilise votre localisation pour calculer les risques climatiques de votre région",
        "NSMicrophoneUsageDescription": "Interface vocale pour utilisateurs non-lettrés"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2E7D32"
      },
      "package": "com.climinvest.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "SEND_SMS",
        "RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "plugins": [
      "expo-location",
      "expo-sms",
      "@react-native-firebase/app"
    ]
  }
}
```


## Fonctionnalités Avancées d'Accessibilité

### Hook useAccessibility.ts

```typescript
import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useAccessibility() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Vérifier si un lecteur d'écran est actif
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    
    // Écouter les changements d'état du lecteur d'écran
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    // Vérifier le contraste élevé (iOS uniquement)
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isInvertColorsEnabled().then(setIsHighContrastEnabled);
    }

    return () => subscription?.remove();
  }, []);

  const announceForAccessibility = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const setAccessibilityFocus = (reactTag: any) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  return {
    isScreenReaderEnabled,
    isHighContrastEnabled,
    fontSize,
    announceForAccessibility,
    setAccessibilityFocus
  };
}
```

Ce plan MVP complet offre une base solide pour développer Clim-Invest avec un focus sur l'accessibilité et l'inclusivité. L'application utilise les meilleures pratiques React Native, intègre des APIs météo gratuites, et propose une expérience utilisateur adaptée aux contextes ruraux africains avec support vocal et interfaces simplifiées.

<div style="text-align: center">⁂</div>

[^1]: https://www.youtube.com/watch?v=J2j1yk-34OY

[^2]: https://dev.to/vikrant_bhalodia/enhancing-react-native-app-accessibility-guidelines-faqs-4njd

[^3]: https://cs-docs.dtn.com/apis/weather-api

[^4]: https://docs.expo.dev/tutorial/create-your-first-app/

[^5]: https://metadesignsolutions.com/building-accessible-apps-with-react-native/

[^6]: https://openweathermap.org/api

[^7]: https://reactnative.dev/docs/0.70/environment-setup

[^8]: https://www.avironsoftware.com/blog/enhancing-accessibility-in-react-native

[^9]: https://developer.openepi.io/data-catalog/resource/4a3e1e8f-a517-4c26-9ea8-47e4970c8d32

[^10]: https://dev.to/vrinch/getting-started-with-react-native-expo-a-beginners-guide-4ae8

[^11]: https://reactnative.dev/docs/accessibility

[^12]: https://www.weather.gov/documentation/services-web-api

[^13]: https://docs.expo.dev/more/expo-cli/

[^14]: https://dev.to/yetillc/accessibility-first-in-react-native-o02

[^15]: https://open-meteo.com

[^16]: https://reactnative.dev/docs/set-up-your-environment

[^17]: https://afb.org/aw/fall2024/react-native-accessibility

[^18]: https://open-meteo.com/en/docs

[^19]: https://reactnative.dev/docs/environment-setup

[^20]: https://addjam.com/blog/2024-08-27/react-native-accessibility-guide/

[^21]: https://rnfirebase.io/auth/usage

[^22]: https://dev.to/emmyjaff/creating-a-react-native-expo-project-with-redux-toolkit-and-thunk-73k

[^23]: https://blog.logrocket.com/react-native-navigation-tutorial/

[^24]: https://www.youtube.com/watch?v=BsOik6ycGqk

[^25]: https://www.npmjs.com/package/@reduxjs/toolkit

[^26]: https://reactnavigation.org/docs/native-stack-navigator/

[^27]: https://firebase.google.com/docs/auth/web/start

[^28]: https://redux-toolkit.js.org/tutorials/quick-start

[^29]: https://docs.expo.dev/router/advanced/stack/

[^30]: https://www.youtube.com/watch?v=ONAVmsGW6-M

[^31]: https://redux.js.org/introduction/installation

[^32]: https://reactnavigation.org/docs/stack-navigator/

[^33]: https://rnfirebase.io

[^34]: https://redux-toolkit.js.org/introduction/getting-started

[^35]: https://www.youtube.com/watch?v=A39cBW-WJ7Q

[^36]: https://www.npmjs.com/package/@react-native-firebase/auth

[^37]: https://hybridheroes.de/blog/2021-01-08-redux-toolkit-react-native/

[^38]: https://reactnative.dev/docs/navigation

[^39]: https://firebase.google.com/docs/auth

[^40]: https://dev.to/theadultnoble_/how-to-use-redux-toolkit-with-react-native-2dm5

