const axios = require('axios');

async function testOpenMeteoAPI() {
  try {
    console.log('🧪 Test des APIs Open-Meteo...\n');
    
    // Test météo actuelle (Ouagadougou)
    console.log('1. Test météo actuelle...');
    const currentResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: 12.3714,
        longitude: -1.5197,
        current: 'temperature_2m,precipitation',
        timezone: 'auto'
      }
    });
    
    console.log('✅ API météo actuelle fonctionne:', {
      temperature: currentResponse.data.current.temperature_2m,
      precipitation: currentResponse.data.current.precipitation
    });
    
    // Test données historiques (il y a 1 semaine)
    console.log('\n2. Test données historiques...');
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const startDate = lastWeek.toISOString().split('T')[0];
    
    const historicalResponse = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
      params: {
        latitude: 12.3714,
        longitude: -1.5197,
        start_date: startDate,
        end_date: startDate,
        daily: 'temperature_2m_max,precipitation_sum'
      }
    });
    
    console.log('✅ API données historiques fonctionne:', {
      date: startDate,
      temp_max: historicalResponse.data.daily.temperature_2m_max[0],
      precipitation: historicalResponse.data.daily.precipitation_sum[0]
    });
    
    console.log('\n🎉 Tous les tests API sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testOpenMeteoAPI();
