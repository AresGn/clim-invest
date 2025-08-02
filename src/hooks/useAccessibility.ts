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
