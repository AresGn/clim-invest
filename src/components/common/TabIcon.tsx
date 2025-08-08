import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';

interface TabIconProps {
  name: string;
  focused: boolean;
  badgeCount?: number;
}

export default function TabIcon({ name, focused, badgeCount = 0 }: TabIconProps) {
  const getIconName = (tabName: string): string => {
    const iconMap = {
      Dashboard: 'home',
      History: 'history',
      Insights: 'analytics',
      Payments: 'payment',
      Settings: 'settings'
    };
    return iconMap[tabName as keyof typeof iconMap] || 'help';
  };

  const iconName = getIconName(name);
  const iconSize = 24;
  const iconColor = focused ? COLORS.primary : COLORS.text.disabled;

  return (
    <View style={styles.container}>
      <Icon 
        name={iconName} 
        size={iconSize} 
        color={iconColor}
        style={[
          styles.icon,
          focused && styles.iconFocused
        ]}
      />
      
      {/* Badge de notification */}
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 32,
    height: 32,
  },
  icon: {
    opacity: 0.7,
  },
  iconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  badgeText: {
    color: COLORS.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
