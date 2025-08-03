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
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Edit your personal information',
      icon: '👤',
      onPress: () => Alert.alert('Profile', 'Feature in development')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage SMS and push alerts',
      icon: '🔔',
      onPress: () => Alert.alert('Notifications', 'Feature in development')
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Password and authentication',
      icon: '🔒',
      onPress: () => Alert.alert('Security', 'Feature in development')
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'French, Mooré, Dioula',
      icon: '🌍',
      onPress: () => Alert.alert('Language', 'Feature in development')
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQ, Contact, Tutorials',
      icon: '❓',
      onPress: () => Alert.alert('Help', 'Contact us at +226 XX XX XX XX')
    },
    {
      id: 'data_usage',
      title: 'Data Sources',
      subtitle: 'API status and data quality',
      icon: '📊',
      onPress: () => Alert.alert('Data Sources', 'NASA POWER: ✅ Active\nOpenWeatherMap: ✅ Active\nSoilGrids: ⚠️ Fallback mode')
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'Version 1.0.0 - Hybrid OpenEPI',
      icon: 'ℹ️',
      onPress: () => Alert.alert('About', 'ClimInvest v1.0.0\nSmart Agricultural Insurance\nPowered by OpenEPI hybrid service')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
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
          {settingsOptions.map((option) => (
            <View key={option.id} style={styles.settingItemContainer}>
              <AccessibleButton
                title=""
                onPress={option.onPress}
                style={styles.settingItem}
                accessibilityLabel={`${option.title}: ${option.subtitle}`}
                accessibilityHint={`Open ${option.title}`}
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
            title="🚪 Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
            accessibilityHint="Logout from the application"
          />
        </View>

        {/* Legal information */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            By using ClimInvest, you agree to our terms of service and privacy policy.
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
    borderBottomColor: COLORS.background,
  },
  settingItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 0,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  settingArrow: {
    fontSize: 20,
    color: COLORS.text.disabled,
    fontWeight: '300',
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
