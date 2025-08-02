import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import AccessibleInput from '../components/common/AccessibleInput';
import AccessibleButton from '../components/common/AccessibleButton';
import { COLORS, ACCESSIBILITY_SETTINGS } from '../utils/constants';
import { AppDispatch } from '../store/store';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
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
      setError('Le numéro de téléphone est requis');
      return;
    }
    
    if (!validatePhone(phone)) {
      setError('Format invalide. Utilisez: +226 XX XX XX XX');
      return;
    }

    setLoading(true);
    try {
      await dispatch(loginUser({ phone }));
      // La navigation sera gérée automatiquement par AppNavigator
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter. Veuillez réessayer.');
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
        <Text style={styles.title}>Clim-Invest</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
      </View>

      <View style={styles.form}>
        <AccessibleInput
          label="Numéro de téléphone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+226 XX XX XX XX"
          keyboardType="phone-pad"
          accessibilityLabel="Champ numéro de téléphone pour connexion"
          accessibilityHint="Entrez votre numéro de téléphone pour vous connecter"
          required
          error={error}
        />

        <AccessibleButton
          title="Se connecter"
          onPress={handleLogin}
          loading={loading}
          disabled={!phone.trim()}
          accessibilityHint="Se connecter avec votre numéro de téléphone"
          style={styles.loginButton}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <AccessibleButton
          title="Créer un nouveau compte"
          onPress={handleRegister}
          accessibilityHint="Créer un nouveau compte agriculteur"
          style={styles.registerButton}
          textStyle={styles.registerButtonText}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Micro-assurance climatique pour agriculteurs
        </Text>
        <Text style={styles.footerSubtext}>
          Protection automatique contre les risques climatiques
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
