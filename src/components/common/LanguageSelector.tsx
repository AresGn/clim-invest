import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import AccessibleButton from './AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../../utils/constants';

interface LanguageSelectorProps {
  style?: any;
  showLabel?: boolean;
  onLanguageChange?: (language: string) => void;
}

export default function LanguageSelector({ 
  style, 
  showLabel = true, 
  onLanguageChange 
}: LanguageSelectorProps) {
  const { t, currentLanguage, availableLanguages, changeLanguage } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setModalVisible(false);
      onLanguageChange?.(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        'Failed to change language. Please try again.'
      );
    }
  };

  const getCurrentLanguageName = () => {
    const language = availableLanguages.find(lang => lang.code === currentLanguage);
    return language?.nativeName || 'English';
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={styles.label}>{t('auth.registration.language')}</Text>
      )}
      
      <AccessibleButton
        title={getCurrentLanguageName()}
        onPress={() => setModalVisible(true)}
        style={styles.selectorButton}
        textStyle={styles.selectorButtonText}
        accessibilityLabel={`${t('auth.registration.language')}: ${getCurrentLanguageName()}`}
        accessibilityHint={t('auth.registration.languageHelper')}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('auth.registration.selectLanguage')}
            </Text>
            
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${language.nativeName}`}
                accessibilityState={{ selected: currentLanguage === language.code }}
              >
                <Text style={[
                  styles.languageOptionText,
                  currentLanguage === language.code && styles.selectedLanguageOptionText
                ]}>
                  {language.nativeName}
                </Text>
                {currentLanguage === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            
            <AccessibleButton
              title={t('common.cancel')}
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  selectorButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorButtonText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguageOption: {
    backgroundColor: COLORS.primary,
  },
  languageOptionText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  selectedLanguageOptionText: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.text.disabled,
    marginTop: 12,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
  },
});
