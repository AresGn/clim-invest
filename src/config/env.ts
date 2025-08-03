// Configuration des variables d'environnement
export const ENV_CONFIG = {
  // OpenEPI Configuration
  OPENEPI_BASE_URL: process.env.EXPO_PUBLIC_OPENEPI_BASE_URL || 'https://api.openepi.io/v1',
  OPENEPI_CLIENT_ID: process.env.EXPO_PUBLIC_OPENEPI_CLIENT_ID || '',
  OPENEPI_CLIENT_SECRET: process.env.EXPO_PUBLIC_OPENEPI_CLIENT_SECRET || '',
  OPENEPI_API_KEY: process.env.EXPO_PUBLIC_OPENEPI_API_KEY || '',

  // Services Externes OpenEPI
  SOILGRIDS_API_URL: process.env.EXPO_PUBLIC_SOILGRIDS_API_URL || 'https://rest.isric.org/soilgrids/v2.0',
  FAO_YIELDS_API_URL: process.env.EXPO_PUBLIC_FAO_YIELDS_API_URL || 'https://www.fao.org/faostat/api/v1',
  AMIS_PRICES_API_URL: process.env.EXPO_PUBLIC_AMIS_PRICES_API_URL || 'https://amis-outlook.org/api/v1',

  // Weather APIs
  OPENWEATHERMAP_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || '',
  WEATHERAPI_KEY: process.env.EXPO_PUBLIC_WEATHERAPI_KEY || '',

  // SMS/Notifications
  SMS_GATEWAY_URL: process.env.EXPO_PUBLIC_SMS_GATEWAY_URL || '',
  SMS_API_KEY: process.env.EXPO_PUBLIC_SMS_API_KEY || '',

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
