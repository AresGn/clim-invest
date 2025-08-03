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
      title: 'Aide et Support',
      subtitle: 'FAQ, Contact, Tutoriels',
      icon: '❓',
      onPress: () => Alert.alert('Aide', 'Contactez-nous au +226 XX XX XX XX')
    },
    {
      id: 'weather_test',
      title: 'Test APIs Météo',
      subtitle: 'Vérifier les services météorologiques',
      icon: '🧪',
      onPress: () => navigation.navigate('WeatherTest')
    },
    {
      id: 'about',
      title: 'À propos',
      subtitle: 'Version 1.0.0',
      icon: 'ℹ️',
      onPress: () => Alert.alert('À propos', 'Clim-Invest v1.0.0\nMicro-assurance climatique pour agriculteurs')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profil utilisateur */}
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
            </View>
          </View>
        )}

        {/* Options de paramètres */}
        <View style={styles.settingsSection}>
          {settingsOptions.map((option) => (
            <AccessibleButton
              key={option.id}
              title={`${option.icon} ${option.title}`}
              onPress={option.onPress}
              style={styles.settingItem}
              textStyle={styles.settingItemText}
              accessibilityLabel={`${option.title}: ${option.subtitle}`}
              accessibilityHint={`Ouvrir ${option.title}`}
            />
          ))}
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.logoutSection}>
          <AccessibleButton
            title="🚪 Se déconnecter"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
            accessibilityHint="Se déconnecter de l'application"
          />
        </View>

        {/* Informations légales */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            En utilisant Clim-Invest, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
          <Text style={styles.versionText}>
            Version 1.0.0 • © 2025 Clim-Invest
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
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
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
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 1,
    justifyContent: 'flex-start',
  },
  settingItemText: {
    color: COLORS.text.primary,
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '500',
    textAlign: 'left',
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
