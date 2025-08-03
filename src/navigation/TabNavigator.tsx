import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import { COLORS } from '../utils/constants';

import TabBadge from '../components/common/TabBadge';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ClaimsScreen from '../screens/ClaimsScreen';

import SubscribeInsuranceScreen from '../screens/SubscribeInsuranceScreen';
import ReferColleagueScreen from '../screens/ReferColleagueScreen';
import InsightsScreen from '../screens/InsightsScreen';
import CreditApplicationScreen from '../screens/CreditApplicationScreen';
import DetailedAnalyticsScreen from '../screens/DetailedAnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard stack - includes main app features and secondary screens
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Claims" component={ClaimsScreen} />

      <Stack.Screen name="SubscribeInsurance" component={SubscribeInsuranceScreen} />
      <Stack.Screen name="ReferColleague" component={ReferColleagueScreen} />
    </Stack.Navigator>
  );
}

// Insights stack - OpenEPI analytics, credit scoring, and detailed analysis
function InsightsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InsightsMain" component={InsightsScreen} />
      <Stack.Screen name="CreditApplication" component={CreditApplicationScreen} />
      <Stack.Screen name="DetailedAnalytics" component={DetailedAnalyticsScreen} />
    </Stack.Navigator>
  );
}

// Settings stack - clean and focused
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Custom icon component with badges - consistent icons for better UX
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons = {
    Dashboard: '🏠', // Always home icon
    History: '📊', // Always chart icon
    Insights: '🔍', // Always search/analysis icon
    Payments: '💳', // Always card icon
    Settings: '⚙️' // Always settings icon
  };

  // Notification simulation (replace with real data in production)
  const notificationCounts = {
    Dashboard: 2, // Weather alerts
    History: 0,
    Insights: 1, // New analysis available
    Payments: 1, // Pending payment
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

  return (
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
        name="Insights"
        component={InsightsStack}
        options={{
          title: 'Analyses',
          tabBarAccessibilityLabel: 'Analyses agricoles et crédit'
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
  );
}
