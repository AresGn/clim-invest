import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { RootState, AppDispatch } from '../store/store';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'profile',
      title: 'Profil',
      subtitle: 'Modifier vos informations personnelles',
      icon: '👤',
      onPress: () => Alert.alert('Profil', 'Fonctionnalité en développement')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Gérer les alertes SMS et push',
      icon: '🔔',
      onPress: () => Alert.alert('Notifications', 'Fonctionnalité en développement')
    },
    {
      id: 'security',
      title: 'Sécurité',
      subtitle: 'Mot de passe et authentification',
      icon: '🔒',
      onPress: () => Alert.alert('Sécurité', 'Fonctionnalité en développement')
    },
    {
      id: 'language',
      title: 'Langue',
      subtitle: 'Français, Mooré, Dioula',
      icon: '🌍',
      onPress: () => Alert.alert('Langue', 'Fonctionnalité en développement')
    },
    {
      id: 'help',
      title: 'Aide & Support',
      subtitle: 'FAQ, Contact, Tutoriels',
      icon: '❓',
      onPress: () => Alert.alert('Aide', 'Contactez-nous au +226 XX XX XX XX')
    },
    {
      id: 'data_usage',
      title: 'Sources de Données',
      subtitle: 'Statut API et qualité des données',
      icon: '📊',
      onPress: () => Alert.alert('Sources de Données', 'OpenEPI: ✅ Actif\nNASA POWER: ✅ Actif\nSoilGrids: ⚠️ Mode de secours')
    },
    {
      id: 'about',
      title: 'À Propos',
      subtitle: 'Version 1.0.0 - Hybrid OpenEPI',
      icon: 'ℹ️',
      onPress: () => Alert.alert('À Propos', 'ClimInvest v1.0.0\nAssurance Agricole Intelligente\nPowered by OpenEPI hybrid service')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Gérez votre compte et vos préférences</Text>
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
                <Text style={styles.statusText}>✅ Active</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings options */}
        <View style={styles.settingsSection}>
          {settingsOptions.map((option, index) => (
            <View key={option.id} style={[
              styles.settingItemContainer,
              index === settingsOptions.length - 1 && styles.lastSettingItem
            ]}>
              <AccessibleButton
                title=""
                onPress={option.onPress}
                style={styles.settingItem}
                accessibilityLabel={`${option.title}: ${option.subtitle}`}
                accessibilityHint={`Ouvrir ${option.title}`}
                accessibilityRole="button"
              >
                <View style={styles.settingItemContent}>
                  <View style={styles.settingItemLeft}>
                    <Text style={styles.settingIcon}>{option.icon}</Text>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{option.title}</Text>
                      <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={styles.settingArrow}>›</Text>
                </View>
              </AccessibleButton>
            </View>
          ))}
        </View>

        {/* Logout button */}
        <View style={styles.logoutSection}>
          <AccessibleButton
            title="🚪 Déconnexion"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
            accessibilityHint="Se déconnecter de l'application"
          />
        </View>

        {/* Legal information */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            En utilisant ClimInvest, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
          <Text style={styles.versionText}>
            Version 1.0.0 - Hybrid OpenEPI • © 2025 ClimInvest
          </Text>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.disabled + '30',
    marginBottom: 0,
  },
  settingItem: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 0,
    minHeight: 60,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  settingArrow: {
    fontSize: 20,
    color: COLORS.text.secondary,
    fontWeight: '300',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
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
});
