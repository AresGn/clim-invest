import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import AccessibleButton from '../components/common/AccessibleButton';
import LanguageSelector from '../components/common/LanguageSelector';
import SettingsIcon from '../components/common/SettingsIcon';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState, AppDispatch } from '../store/store';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'profile',
      title: t('settings.profile'),
      subtitle: t('settings.profileSubtitle'),
      icon: 'profile',
      onPress: () => Alert.alert(t('settings.profile'), t('common.developmentFeature'))
    },
    {
      id: 'notifications',
      title: t('settings.notifications'),
      subtitle: t('settings.notificationsSubtitle'),
      icon: 'notifications',
      onPress: () => Alert.alert(t('settings.notifications'), t('common.developmentFeature'))
    },
    {
      id: 'security',
      title: t('settings.security'),
      subtitle: t('settings.securitySubtitle'),
      icon: 'security',
      onPress: () => Alert.alert(t('settings.security'), t('common.developmentFeature'))
    },
    {
      id: 'language',
      title: t('settings.language'),
      subtitle: t('settings.languageSubtitle'),
      icon: 'language',
      onPress: () => setShowLanguageModal(true)
    },
    {
      id: 'help',
      title: t('settings.help'),
      subtitle: t('settings.helpSubtitle'),
      icon: '❓',
      onPress: () => Alert.alert(t('settings.help'), t('settings.helpMessage'))
    },
    {
      id: 'data_usage',
      title: t('settings.dataUsage'),
      subtitle: t('settings.dataUsageSubtitle'),
      icon: '📊',
      onPress: () => Alert.alert(t('settings.dataUsage'), t('settings.dataUsageMessage'))
    },
    {
      id: 'about',
      title: t('settings.aboutTitle'),
      subtitle: t('settings.versionText'),
      icon: 'ℹ️',
      onPress: () => Alert.alert(t('settings.aboutTitle'), t('settings.aboutMessage'))
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User profile section */}
        {user && (
          <View style={styles.userProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              <Text style={styles.userLocation}>📍 {user.location.region}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✅ {t('settings.userStatus')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings options */}
        <View style={styles.settingsSection}>
          {settingsOptions.map((option, index) => (
            <View key={option.id} style={styles.settingItemContainer}>
              <AccessibleButton
                title={option.title}
                onPress={option.onPress}
                style={styles.settingButton}
                textStyle={styles.settingButtonText}
                accessibilityLabel={`${option.title}: ${option.subtitle}`}
                accessibilityHint={`Ouvrir ${option.title}`}
                accessibilityRole="button"
              />
              <Text style={styles.settingSubtitleText}>{option.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Logout button */}
        <View style={styles.logoutSection}>
          <AccessibleButton
            title={`${t('settings.logout')}`}
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
            accessibilityHint="Se déconnecter de l'application"
          />
        </View>

        {/* Legal information */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            {t('settings.legalText')}
          </Text>
          <Text style={styles.versionText}>
            {t('settings.versionText')}
          </Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('settings.language')}
            </Text>

            <LanguageSelector
              showLabel={false}
              onLanguageChange={() => {
                setShowLanguageModal(false);
              }}
            />

            <AccessibleButton
              title={t('common.close')}
              onPress={() => setShowLanguageModal(false)}
              style={styles.closeButton}
              textStyle={styles.closeButtonText}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userProfile: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItemContainer: {
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
  },
  settingButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
  },
  settingSubtitleText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },


  logoutSection: {
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderWidth: 0,
  },
  logoutButtonText: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  legalSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  legalText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.text.disabled,
    textAlign: 'center',
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
  closeButton: {
    backgroundColor: COLORS.text.disabled,
    marginTop: 12,
  },
  closeButtonText: {
    color: COLORS.text.primary,
  },
});
