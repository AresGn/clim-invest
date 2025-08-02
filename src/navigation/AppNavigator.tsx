import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// Navigation
import TabNavigator from './TabNavigator';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import LoginScreen from '../screens/LoginScreen';

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
          // Écrans authentifiés avec navigation par onglets
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{
              headerShown: false,
              title: 'Clim-Invest',
              accessibilityLabel: 'Application principale'
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
