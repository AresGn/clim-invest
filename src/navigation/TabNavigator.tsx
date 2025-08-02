import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import FloatingActionButton from '../components/common/FloatingActionButton';
import TabBadge from '../components/common/TabBadge';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ClaimsScreen from '../screens/ClaimsScreen';
import WeatherTestScreen from '../screens/WeatherTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack pour le Dashboard (inclut les écrans secondaires)
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Claims" component={ClaimsScreen} />
      <Stack.Screen name="WeatherTest" component={WeatherTestScreen} />
    </Stack.Navigator>
  );
}

// Stack pour les Paramètres
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="WeatherTest" component={WeatherTestScreen} />
    </Stack.Navigator>
  );
}

// Composant d'icône personnalisé avec badges
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons = {
    Dashboard: focused ? '🏡' : '🏠',
    History: focused ? '📈' : '📊',
    Payments: focused ? '💳' : '💰',
    Settings: focused ? '⚙️' : '🔧'
  };

  // Simulation de notifications (à remplacer par de vraies données)
  const notificationCounts = {
    Dashboard: 2, // Alertes météo
    History: 0,
    Payments: 1, // Paiement en attente
    Settings: 0
  };

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
      position: 'relative'
    }}>
      <Text style={{
        fontSize: 22,
        opacity: focused ? 1 : 0.7
      }}>
        {icons[name as keyof typeof icons]}
      </Text>

      {/* Badge de notification */}
      <TabBadge count={notificationCounts[name as keyof typeof notificationCounts]} />
    </View>
  );
}

export default function TabNavigator() {
  const navigation = useNavigation();

  const handleEmergencyClaim = () => {
    // @ts-ignore - Navigation vers l'écran de réclamation d'urgence
    navigation.navigate('Dashboard', {
      screen: 'Claims',
      params: { emergency: true }
    });
  };

  return (
    <>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.disabled,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: 8,
          paddingTop: 8,
          height: 75,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          borderRadius: 12,
          marginHorizontal: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{
          title: 'Accueil',
          tabBarAccessibilityLabel: 'Accueil - Tableau de bord principal'
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: 'Historique',
          tabBarAccessibilityLabel: 'Historique des transactions'
        }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{
          title: 'Paiements',
          tabBarAccessibilityLabel: 'Gestion des paiements'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{
          title: 'Paramètres',
          tabBarAccessibilityLabel: 'Paramètres de l\'application'
        }}
      />
    </Tab.Navigator>

    {/* Bouton flottant pour réclamations d'urgence */}
    <FloatingActionButton
      onPress={handleEmergencyClaim}
      title="🚨"
      accessibilityLabel="Réclamation d'urgence"
      accessibilityHint="Déclarer un sinistre en urgence"
    />
  </>
  );
}
