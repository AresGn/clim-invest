import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
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
      accessibilityLabel: "Écran de bienvenue. Clim-Invest offre une micro-assurance climatique accessible par SMS pour protéger vos cultures",
      emoji: "🌱"
    },
    {
      title: "Simple comme un SMS",
      subtitle: "Souscription en 3 minutes",
      description: "Pas besoin de banque ou de paperasse. Tout se fait par téléphone mobile",
      accessibilityLabel: "Processus simple. Souscrivez votre assurance en 3 minutes par SMS, sans compte bancaire requis",
      emoji: "📱"
    },
    {
      title: "Protection Intelligente",
      subtitle: "Données satellite en temps réel",
      description: "Surveillance automatique de vos cultures et indemnisation rapide en cas de sinistre",
      accessibilityLabel: "Protection intelligente utilisant des données satellite pour surveiller vos cultures automatiquement",
      emoji: "🛡️"
    }
  ];

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      navigation.navigate('Registration');
    } else {
      setCurrentStep(currentStep + 1);
      announceForAccessibility(steps[currentStep + 1].accessibilityLabel);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Registration');
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Écran principal d'accueil"
    >
      {/* Indicateur de progression */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive
            ]}
            accessible={true}
            accessibilityValue={{ 
              min: 0, 
              max: steps.length - 1, 
              now: currentStep 
            }}
          />
        ))}
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.emoji}>{steps[currentStep].emoji}</Text>
        
        <Text
          style={styles.title}
          accessible={true}
        >
          {steps[currentStep].title}
        </Text>

        <Text
          style={styles.subtitle}
          accessible={true}
        >
          {steps[currentStep].subtitle}
        </Text>

        <Text
          style={styles.description}
          accessibilityLabel={steps[currentStep].accessibilityLabel}
        >
          {steps[currentStep].description}
        </Text>
      </View>

      {/* Boutons de navigation */}
      <View style={styles.buttonContainer}>
        {currentStep < steps.length - 1 && (
          <AccessibleButton
            title="Passer"
            onPress={handleSkip}
            style={styles.skipButton}
            textStyle={styles.skipButtonText}
            accessibilityHint="Passer l'introduction et aller directement à l'inscription"
          />
        )}
        
        <AccessibleButton
          title={currentStep === steps.length - 1 ? "Commencer" : "Suivant"}
          onPress={handleNext}
          accessibilityHint="Appuyez pour continuer vers l'étape suivante"
          style={styles.primaryButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.text.disabled,
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  skipButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
