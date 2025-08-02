import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import DashboardScreen from '../screens/DashboardScreen';

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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
