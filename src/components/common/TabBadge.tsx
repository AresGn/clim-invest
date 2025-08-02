import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

interface TabBadgeProps {
  count: number;
  maxCount?: number;
  style?: any;
}

export default function TabBadge({ count, maxCount = 99, style }: TabBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  badgeText: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
