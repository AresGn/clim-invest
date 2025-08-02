// API Configuration
export const WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1';
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// App Configuration
export const APP_NAME = 'Clim-Invest';
export const APP_VERSION = '1.0.0';

// Colors
export const COLORS = {
  primary: '#1B5E20',
  secondary: '#4CAF50',
  accent: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF'
  }
};

// Crop Types - Cultures de phase au Burkina Faso
export const CROP_TYPES = [
  { value: 'millet', label: 'Mil', accessibilityLabel: 'Mil, céréale résistante à la sécheresse', icon: '🌾' },
  { value: 'sorghum', label: 'Sorgho', accessibilityLabel: 'Sorgho, céréale traditionnelle', icon: '🌾' },
  { value: 'maize', label: 'Maïs', accessibilityLabel: 'Maïs, culture céréalière', icon: '🌽' },
  { value: 'cotton', label: 'Coton', accessibilityLabel: 'Coton, culture de rente', icon: '🌿' },
  { value: 'groundnut', label: 'Arachide', accessibilityLabel: 'Arachide, légumineuse oléagineuse', icon: '🥜' },
  { value: 'cowpea', label: 'Niébé', accessibilityLabel: 'Niébé, haricot local riche en protéines', icon: '🫘' },
  { value: 'sesame', label: 'Sésame', accessibilityLabel: 'Sésame, culture oléagineuse', icon: '🌱' },
  { value: 'rice', label: 'Riz', accessibilityLabel: 'Riz, culture irriguée', icon: '🌾' }
];

// Risk Calculation
export const BASE_RISK_FACTORS = {
  'maize': 0.6,
  'cotton': 0.5,
  'groundnut': 0.4,
  'vegetables': 0.7
};

export const REGIONAL_RISK_FACTORS = {
  'Sahel': 0.9,
  'Sudan': 0.7,
  'Guinea': 0.5
};

// Accessibility
export const ACCESSIBILITY_SETTINGS = {
  minimumTouchTargetSize: 48,
  defaultFontSize: 16,
  largeFontSize: 20,
  extraLargeFontSize: 24
};
