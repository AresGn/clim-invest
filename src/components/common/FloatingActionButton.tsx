import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../../utils/constants';

interface FloatingActionButtonProps {
  onPress: () => void;
  title?: string;
  icon?: string;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function FloatingActionButton({
  onPress,
  title = "🚨",
  icon,
  style,
  accessibilityLabel = "Bouton d'action rapide",
  accessibilityHint = "Appuyez pour une action rapide"
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      <Text style={styles.fabText}>
        {icon || title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 95, // Au-dessus de la barre de navigation arrondie
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 1000,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  fabText: {
    fontSize: 24,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
  },
});
