import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../../utils/constants';

interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  required?: boolean;
  error?: string;
  style?: any;
}

export default function AccessibleInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  accessibilityLabel,
  accessibilityHint,
  required = false,
  error,
  style
}: AccessibleInputProps) {
  return (
    <View style={[styles.container, style]}>
      <Text
        style={[styles.label, required && styles.labelRequired]}
        accessible={true}
      >
        {label}{required && ' *'}
      </Text>
      
      <TextInput
        style={[
          styles.input,
          error && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        accessible={true}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityRequired={required}
        placeholderTextColor={COLORS.text.secondary}
      />
      
      {error && (
        <Text
          style={styles.errorText}
          accessible={true}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  labelRequired: {
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    backgroundColor: COLORS.surface,
    minHeight: ACCESSIBILITY_SETTINGS.minimumTouchTargetSize,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
});
