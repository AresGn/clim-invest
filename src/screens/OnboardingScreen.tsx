import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { isScreenReaderEnabled, announceForAccessibility } = useAccessibility();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    announceForAccessibility(t('onboarding.welcomeAnnouncement'));
  }, [t]);

  const steps = [
    {
      title: t('onboarding.step1.title'),
      subtitle: t('onboarding.step1.subtitle'),
      description: t('onboarding.step1.description'),
      accessibilityLabel: t('onboarding.step1.accessibilityLabel'),
      emoji: "🌱"
    },
    {
      title: t('onboarding.step2.title'),
      subtitle: t('onboarding.step2.subtitle'),
      description: t('onboarding.step2.description'),
      accessibilityLabel: t('onboarding.step2.accessibilityLabel'),
      emoji: "📱"
    },
    {
      title: t('onboarding.step3.title'),
      subtitle: t('onboarding.step3.subtitle'),
      description: t('onboarding.step3.description'),
      accessibilityLabel: t('onboarding.step3.accessibilityLabel'),
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

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={t('accessibility.welcomeScreen')}
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
            title={t('onboarding.skip')}
            onPress={handleSkip}
            style={styles.skipButton}
            textStyle={styles.skipButtonText}
            accessibilityHint={t('onboarding.skip')}
          />
        )}

        <AccessibleButton
          title={currentStep === steps.length - 1 ? t('onboarding.start') : t('onboarding.next')}
          onPress={handleNext}
          accessibilityHint={t('onboarding.next')}
          style={styles.primaryButton}
        />

        {currentStep === steps.length - 1 && (
          <AccessibleButton
            title={t('onboarding.hasAccount')}
            onPress={handleLogin}
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
            accessibilityHint={t('onboarding.hasAccount')}
          />
        )}
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
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
});
