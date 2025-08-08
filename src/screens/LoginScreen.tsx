import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import AccessibleInput from '../components/common/AccessibleInput';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { AppDispatch } from '../store/store';
import { useTranslation } from '../hooks/useTranslation';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^\+226\s?\d{8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleLogin = async () => {
    setError('');

    if (!phone.trim()) {
      setError(t('auth.login.phoneRequired'));
      return;
    }

    if (!validatePhone(phone)) {
      setError(t('auth.login.invalidFormat'));
      return;
    }

    setLoading(true);
    try {
      await dispatch(loginUser({ phone }));
      // La navigation sera gérée automatiquement par AppNavigator
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.login.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Registration');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.title}>{t('auth.login.appTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.appSubtitle')}</Text>
      </View>

      <View style={styles.form}>
        <AccessibleInput
          label={t('auth.login.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('auth.login.phonePlaceholder')}
          keyboardType="phone-pad"
          accessibilityLabel={t('auth.login.phone')}
          accessibilityHint={t('auth.login.phone')}
          required
          error={error}
        />

        <AccessibleButton
          title={t('auth.login.loginButton')}
          onPress={handleLogin}
          loading={loading}
          disabled={!phone.trim()}
          accessibilityHint={t('auth.login.loginButton')}
          style={styles.loginButton}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.login.dividerText')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <AccessibleButton
          title={t('auth.login.createAccount')}
          onPress={handleRegister}
          accessibilityHint={t('auth.login.createAccount')}
          style={styles.registerButton}
          textStyle={styles.registerButtonText}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('auth.login.footerText')}
        </Text>
        <Text style={styles.footerSubtext}>
          {t('auth.login.footerSubtext')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: ACCESSIBILITY_SETTINGS.defaultFontSize,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.text.disabled,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.text.disabled,
    textAlign: 'center',
  },
});
