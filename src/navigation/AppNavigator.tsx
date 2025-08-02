import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ClaimsScreen from '../screens/ClaimsScreen';
import WeatherTestScreen from '../screens/WeatherTestScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Écrans non authentifiés
          <>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{
                title: 'Bienvenue',
                accessibilityLabel: 'Écran de bienvenue'
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Connexion',
                accessibilityLabel: 'Écran de connexion',
                headerShown: true,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="Registration"
              component={RegistrationScreen}
              options={{
                title: 'Inscription',
                accessibilityLabel: 'Écran d\'inscription',
                headerShown: true,
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          // Écrans authentifiés
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                title: 'Tableau de bord',
                accessibilityLabel: 'Tableau de bord principal'
              }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                title: 'Historique',
                accessibilityLabel: 'Historique des transactions'
              }}
            />
            <Stack.Screen
              name="Payments"
              component={PaymentsScreen}
              options={{
                title: 'Paiements',
                accessibilityLabel: 'Gestion des paiements'
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Paramètres',
                accessibilityLabel: 'Paramètres de l\'application'
              }}
            />
            <Stack.Screen
              name="Claims"
              component={ClaimsScreen}
              options={{
                title: 'Réclamations',
                accessibilityLabel: 'Déclarer un sinistre'
              }}
            />
            <Stack.Screen
              name="WeatherTest"
              component={WeatherTestScreen}
              options={{
                title: 'Test APIs Météo',
                accessibilityLabel: 'Test des APIs météorologiques'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
