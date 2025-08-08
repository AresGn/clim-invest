import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';

interface SettingsIconProps {
  name: string;
  size?: number;
  color?: string;
}

export default function SettingsIcon({ 
  name, 
  size = 24, 
  color = COLORS.primary 
}: SettingsIconProps) {
  const getIconName = (settingName: string): string => {
    const iconMap = {
      profile: 'person',
      notifications: 'notifications',
      security: 'security',
      language: 'language',
      help: 'help',
      data_usage: 'bar-chart',
      about: 'info',
      logout: 'logout'
    };
    return iconMap[settingName as keyof typeof iconMap] || 'settings';
  };

  const iconName = getIconName(name);

  return (
    <Icon 
      name={iconName} 
      size={size} 
      color={color}
    />
  );
}
