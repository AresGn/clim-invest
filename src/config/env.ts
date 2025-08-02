// Configuration des variables d'environnement
export const ENV_CONFIG = {
  // OpenEPI Configuration
  OPENEPI_BASE_URL: process.env.EXPO_PUBLIC_OPENEPI_BASE_URL || 'https://api.openepi.io',
  OPENEPI_CLIENT_ID: process.env.EXPO_PUBLIC_OPENEPI_CLIENT_ID || '',
  OPENEPI_CLIENT_SECRET: process.env.EXPO_PUBLIC_OPENEPI_CLIENT_SECRET || '',

  // Weather APIs
  OPENWEATHERMAP_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || '',
  WEATHERAPI_KEY: process.env.EXPO_PUBLIC_WEATHERAPI_KEY || '',

  // Open-Meteo (pas de clé requise)
  OPEN_METEO_BASE_URL: 'https://api.open-meteo.com/v1',
  OPEN_METEO_ARCHIVE_URL: 'https://archive-api.open-meteo.com/v1',

  // Météo Burkina (WIS2)
  METEO_BURKINA_BASE_URL: 'https://wis2.meteoburkina.bf/oapi',

  // NASA Earthdata (pour NDVI)
  NASA_EARTHDATA_BASE_URL: 'https://earthdata.nasa.gov/api',
};

// Validation des clés API requises
export const validateApiKeys = () => {
  const requiredKeys = [
    'OPENEPI_CLIENT_ID',
    'OPENEPI_CLIENT_SECRET',
    'OPENWEATHERMAP_API_KEY',
    'WEATHERAPI_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Clés API manquantes:', missingKeys);
    return false;
  }
  
  console.log('✅ Toutes les clés API sont configurées');
  return true;
};
