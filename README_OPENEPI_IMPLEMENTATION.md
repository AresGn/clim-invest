# 🌍 Guide d'Implémentation OpenEPI pour ClimInvest

## 📋 Analyse : Ce qui manque dans l'application actuelle

### ✅ **Déjà implémenté** :
- Service OpenEPI de base (`src/services/openEpiService.ts`)
- Données météo actuelles et historiques (Open-Meteo + OpenEPI)
- Validation croisée des données météo
- Historique des catastrophes (EM-DAT, AFDM)
- Calcul des risques climatiques basiques

### ❌ **Manquant - Fonctionnalités critiques OpenEPI** :

#### 1. **Effet de Levier (Accès au Crédit)**
- ❌ Données pédologiques (SoilGrids, AfSoilGrids)
- ❌ Rendements agricoles historiques (FAO Global Crop Yields)
- ❌ Prix des cultures en temps réel (AMIS)
- ❌ Scoring de fiabilité agriculteur
- ❌ Interface banques/institutions financières

#### 2. **Résilience (Alertes Climatiques Avancées)**
- ❌ Prévisions météo à 10 jours (ECMWF, NOAA GFS)
- ❌ Indices de stress hydrique (ESI, CHIRPS)
- ❌ Risques d'érosion/inondation (GlobErosion, NASA Flood Mapping)
- ❌ Alertes SMS/USSD proactives
- ❌ Système de recommandations agricoles

#### 3. **Données Satellitaires**
- ❌ Indices NDVI en temps réel
- ❌ Évapotranspiration (ET₀)
- ❌ Anomalies de végétation
- ❌ Cartographie des zones à risque

---

## 🚀 Plan d'Implémentation Étape par Étape

### **Phase 1 : Fondations OpenEPI (Semaine 1-2)**

#### Étape 1.1 : Configuration OpenEPI complète
```bash
# 1. Obtenir les clés API OpenEPI
# Inscription sur https://developer.openepi.io/
# Récupérer : CLIENT_ID, CLIENT_SECRET, API_KEY

# 2. Mettre à jour .env
echo "EXPO_PUBLIC_OPENEPI_BASE_URL=https://api.openepi.io/v1" >> .env
echo "EXPO_PUBLIC_OPENEPI_CLIENT_ID=your_client_id" >> .env
echo "EXPO_PUBLIC_OPENEPI_CLIENT_SECRET=your_client_secret" >> .env
echo "EXPO_PUBLIC_OPENEPI_API_KEY=your_api_key" >> .env
```

#### Étape 1.2 : Service OpenEPI étendu
Créer `src/services/openEpiAdvancedService.ts` :

```typescript
export class OpenEpiAdvancedService {
  // Données pédologiques
  async getSoilData(lat: number, lon: number): Promise<SoilData> {
    return this.client.get('/soil/soilgrids', {
      params: { latitude: lat, longitude: lon, depth: '0-30cm' }
    });
  }

  // Rendements historiques
  async getCropYields(country: string, crop: string, years: number = 5): Promise<YieldData> {
    return this.client.get('/agriculture/yields', {
      params: { country, crop, years }
    });
  }

  // Prix des cultures
  async getCropPrices(crop: string, market: string): Promise<PriceData> {
    return this.client.get('/markets/prices', {
      params: { commodity: crop, market }
    });
  }

  // Prévisions étendues (10 jours)
  async getExtendedForecast(lat: number, lon: number): Promise<ExtendedForecast> {
    return this.client.get('/weather/forecast/extended', {
      params: { latitude: lat, longitude: lon, days: 10 }
    });
  }

  // Indices de stress hydrique
  async getWaterStressIndex(lat: number, lon: number): Promise<WaterStressData> {
    return this.client.get('/climate/water-stress', {
      params: { latitude: lat, longitude: lon }
    });
  }

  // Données NDVI satellitaires
  async getNDVIData(lat: number, lon: number, startDate: string, endDate: string): Promise<NDVIData> {
    return this.client.get('/satellite/ndvi', {
      params: { latitude: lat, longitude: lon, start_date: startDate, end_date: endDate }
    });
  }
}
```

### **Phase 2 : Effet de Levier - Scoring Crédit (Semaine 3-4)**

#### Étape 2.1 : Service de Scoring Agriculteur
Créer `src/services/creditScoringService.ts` :

```typescript
export interface FarmerCreditScore {
  overallScore: number; // 0-1000
  soilQuality: number;
  historicalYields: number;
  insuranceHistory: number;
  marketAccess: number;
  riskLevel: 'low' | 'medium' | 'high';
  creditRecommendation: string;
}

export class CreditScoringService {
  async calculateCreditScore(
    farmerId: string,
    location: { lat: number; lon: number },
    cropType: string
  ): Promise<FarmerCreditScore> {
    
    // 1. Récupérer données sol
    const soilData = await openEpiAdvanced.getSoilData(location.lat, location.lon);
    const soilScore = this.calculateSoilScore(soilData);

    // 2. Historique des rendements
    const yieldData = await openEpiAdvanced.getCropYields('Benin', cropType);
    const yieldScore = this.calculateYieldScore(yieldData, location);

    // 3. Historique d'assurance
    const insuranceHistory = await this.getInsuranceHistory(farmerId);
    const insuranceScore = this.calculateInsuranceScore(insuranceHistory);

    // 4. Accès au marché
    const marketData = await openEpiAdvanced.getCropPrices(cropType, 'Cotonou');
    const marketScore = this.calculateMarketScore(marketData, location);

    // 5. Score global
    const overallScore = Math.round(
      (soilScore * 0.3) + 
      (yieldScore * 0.25) + 
      (insuranceScore * 0.25) + 
      (marketScore * 0.2)
    );

    return {
      overallScore,
      soilQuality: soilScore,
      historicalYields: yieldScore,
      insuranceHistory: insuranceScore,
      marketAccess: marketScore,
      riskLevel: this.determineRiskLevel(overallScore),
      creditRecommendation: this.generateRecommendation(overallScore, soilData, insuranceHistory)
    };
  }
}
```

#### Étape 2.2 : Écran de Profil Crédit
Créer `src/screens/CreditProfileScreen.tsx` :

```typescript
export default function CreditProfileScreen() {
  const [creditScore, setCreditScore] = useState<FarmerCreditScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditProfile();
  }, []);

  const loadCreditProfile = async () => {
    try {
      const score = await creditScoringService.calculateCreditScore(
        user.id, 
        user.location, 
        user.cropType
      );
      setCreditScore(score);
    } catch (error) {
      console.error('Erreur chargement profil crédit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Score global */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Votre Score Crédit</Text>
        <Text style={styles.scoreValue}>{creditScore?.overallScore}/1000</Text>
        <Text style={styles.riskLevel}>
          Risque : {creditScore?.riskLevel === 'low' ? '🟢 Faible' : 
                   creditScore?.riskLevel === 'medium' ? '🟠 Modéré' : '🔴 Élevé'}
        </Text>
      </View>

      {/* Détails du scoring */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Détails du Score</Text>
        
        <View style={styles.scoreRow}>
          <Text>🌱 Qualité du sol</Text>
          <Text>{creditScore?.soilQuality}/100</Text>
        </View>
        
        <View style={styles.scoreRow}>
          <Text>📈 Rendements historiques</Text>
          <Text>{creditScore?.historicalYields}/100</Text>
        </View>
        
        <View style={styles.scoreRow}>
          <Text>🛡️ Historique assurance</Text>
          <Text>{creditScore?.insuranceHistory}/100</Text>
        </View>
        
        <View style={styles.scoreRow}>
          <Text>🏪 Accès au marché</Text>
          <Text>{creditScore?.marketAccess}/100</Text>
        </View>
      </View>

      {/* Recommandations */}
      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>💡 Recommandations</Text>
        <Text style={styles.recommendationText}>
          {creditScore?.creditRecommendation}
        </Text>
      </View>

      {/* Actions */}
      <AccessibleButton
        title="📋 Demander un Crédit"
        onPress={() => navigation.navigate('CreditApplication')}
        style={styles.creditButton}
      />
    </ScrollView>
  );
}
```

### **Phase 3 : Alertes Climatiques Avancées (Semaine 5-6)**

#### Étape 3.1 : Service d'Alertes Proactives
Créer `src/services/proactiveAlertsService.ts` :

```typescript
export interface ClimateAlert {
  id: string;
  type: 'drought' | 'flood' | 'storm' | 'heat_wave' | 'frost';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actionRequired: string;
  validUntil: string;
  affectedCrops: string[];
}

export class ProactiveAlertsService {
  async generateAlerts(
    location: { lat: number; lon: number },
    cropType: string
  ): Promise<ClimateAlert[]> {
    
    const alerts: ClimateAlert[] = [];

    // 1. Prévisions étendues (10 jours)
    const forecast = await openEpiAdvanced.getExtendedForecast(location.lat, location.lon);
    
    // 2. Indices de stress hydrique
    const waterStress = await openEpiAdvanced.getWaterStressIndex(location.lat, location.lon);
    
    // 3. Données NDVI récentes
    const ndviData = await openEpiAdvanced.getNDVIData(
      location.lat, 
      location.lon, 
      this.getDateDaysAgo(30), 
      this.getToday()
    );

    // Analyser les risques
    if (this.detectDroughtRisk(forecast, waterStress, ndviData)) {
      alerts.push({
        id: `drought_${Date.now()}`,
        type: 'drought',
        severity: 'warning',
        title: 'Risque de Sécheresse',
        message: 'Conditions sèches prévues dans les 5 prochains jours',
        actionRequired: 'Préparez l\'irrigation si possible. Paillez vos cultures.',
        validUntil: this.getDateDaysFromNow(5),
        affectedCrops: [cropType]
      });
    }

    if (this.detectFloodRisk(forecast)) {
      alerts.push({
        id: `flood_${Date.now()}`,
        type: 'flood',
        severity: 'critical',
        title: 'Risque d\'Inondation',
        message: 'Fortes pluies prévues (>100mm) dans les 48h',
        actionRequired: 'Créez des canaux de drainage. Protégez vos récoltes.',
        validUntil: this.getDateDaysFromNow(2),
        affectedCrops: [cropType]
      });
    }

    return alerts;
  }

  // Envoyer alertes par SMS
  async sendSMSAlerts(phoneNumber: string, alerts: ClimateAlert[]): Promise<void> {
    for (const alert of alerts) {
      const message = `🚨 ${alert.title}: ${alert.message}. Action: ${alert.actionRequired}`;
      await smsService.sendSMS(phoneNumber, message);
    }
  }
}
```

#### Étape 3.2 : Composant d'Alertes Temps Réel
Créer `src/components/alerts/ProactiveAlertsSection.tsx` :

```typescript
export default function ProactiveAlertsSection() {
  const [alerts, setAlerts] = useState<ClimateAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadAlerts();
    // Actualiser toutes les heures
    const interval = setInterval(loadAlerts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const newAlerts = await proactiveAlertsService.generateAlerts(
        user.location,
        user.cropType
      );
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return COLORS.error;
      case 'warning': return COLORS.warning;
      default: return COLORS.accent;
    }
  };

  const getSeverityIcon = (type: string) => {
    const icons = {
      drought: '🌵',
      flood: '🌊',
      storm: '⛈️',
      heat_wave: '🔥',
      frost: '❄️'
    };
    return icons[type as keyof typeof icons] || '⚠️';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text>Analyse des risques climatiques...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🚨 Alertes Climatiques</Text>
      
      {alerts.length === 0 ? (
        <View style={styles.noAlertsCard}>
          <Text style={styles.noAlertsText}>✅ Aucune alerte active</Text>
          <Text style={styles.noAlertsSubtext}>Conditions favorables pour vos cultures</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View 
            key={alert.id} 
            style={[
              styles.alertCard,
              { borderLeftColor: getSeverityColor(alert.severity) }
            ]}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>
                {getSeverityIcon(alert.type)}
              </Text>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <View style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(alert.severity) + '20' }
              ]}>
                <Text style={[
                  styles.severityText,
                  { color: getSeverityColor(alert.severity) }
                ]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.alertMessage}>{alert.message}</Text>
            
            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>💡 Action recommandée :</Text>
              <Text style={styles.actionText}>{alert.actionRequired}</Text>
            </View>
            
            <Text style={styles.validUntil}>
              Valide jusqu'au {new Date(alert.validUntil).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        ))
      )}
      
      <Text style={styles.lastUpdate}>
        Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
      </Text>
    </View>
  );
}
```

### **Phase 4 : Données Satellitaires NDVI (Semaine 7-8)**

#### Étape 4.1 : Service NDVI et Végétation
Créer `src/services/vegetationMonitoringService.ts` :

```typescript
export interface VegetationHealth {
  ndvi: number; // 0-1
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  anomaly: number; // -1 à +1 (par rapport à la normale)
  recommendations: string[];
}

export class VegetationMonitoringService {
  async analyzeVegetationHealth(
    location: { lat: number; lon: number },
    cropType: string
  ): Promise<VegetationHealth> {
    
    // Récupérer NDVI des 30 derniers jours
    const ndviData = await openEpiAdvanced.getNDVIData(
      location.lat,
      location.lon,
      this.getDateDaysAgo(30),
      this.getToday()
    );

    // Calculer NDVI moyen récent
    const recentNDVI = this.calculateAverageNDVI(ndviData.values.slice(-7)); // 7 derniers jours
    
    // Comparer avec la normale saisonnière
    const historicalNDVI = await this.getHistoricalNDVI(location, this.getCurrentMonth());
    const anomaly = (recentNDVI - historicalNDVI.average) / historicalNDVI.stdDev;
    
    // Déterminer le statut
    const status = this.determineVegetationStatus(recentNDVI, anomaly);
    
    // Analyser la tendance
    const trend = this.analyzeTrend(ndviData.values.slice(-14)); // 14 derniers jours
    
    // Générer recommandations
    const recommendations = this.generateVegetationRecommendations(
      status, 
      trend, 
      anomaly, 
      cropType
    );

    return {
      ndvi: recentNDVI,
      status,
      trend,
      anomaly,
      recommendations
    };
  }

  private determineVegetationStatus(ndvi: number, anomaly: number): VegetationHealth['status'] {
    if (ndvi > 0.7 && anomaly > 0.5) return 'excellent';
    if (ndvi > 0.5 && anomaly > 0) return 'good';
    if (ndvi > 0.3 && anomaly > -0.5) return 'moderate';
    if (ndvi > 0.2 && anomaly > -1) return 'poor';
    return 'critical';
  }

  private generateVegetationRecommendations(
    status: VegetationHealth['status'],
    trend: VegetationHealth['trend'],
    anomaly: number,
    cropType: string
  ): string[] {
    const recommendations: string[] = [];

    if (status === 'critical' || (status === 'poor' && trend === 'declining')) {
      recommendations.push('🚨 Situation critique : Vérifiez l\'irrigation immédiatement');
      recommendations.push('🌱 Considérez un apport d\'engrais foliaire');
      recommendations.push('🛡️ Préparez une déclaration de sinistre si nécessaire');
    }

    if (anomaly < -0.5) {
      recommendations.push('📊 Végétation en dessous de la normale saisonnière');
      recommendations.push('💧 Augmentez la fréquence d\'arrosage si possible');
    }

    if (trend === 'improving' && status === 'good') {
      recommendations.push('✅ Excellente évolution, continuez les pratiques actuelles');
      recommendations.push('🌾 Période favorable pour les traitements préventifs');
    }

    return recommendations;
  }
}
```

---

## 📱 Intégration dans l'Application

### Mise à jour du Dashboard Principal
Modifier `src/screens/DashboardScreen.tsx` :

```typescript
// Ajouter les nouveaux composants
import ProactiveAlertsSection from '../components/alerts/ProactiveAlertsSection';
import VegetationHealthCard from '../components/vegetation/VegetationHealthCard';
import CreditScoreCard from '../components/credit/CreditScoreCard';

// Dans le render
<ScrollView>
  {/* Sections existantes */}
  
  {/* Nouvelles sections OpenEPI */}
  <ProactiveAlertsSection />
  <VegetationHealthCard />
  <CreditScoreCard />
</ScrollView>
```

### Nouveau Menu de Navigation
Ajouter dans `src/navigation/TabNavigator.tsx` :

```typescript
<Tab.Screen 
  name="Insights" 
  component={InsightsScreen}
  options={{
    title: 'Analyses',
    tabBarAccessibilityLabel: 'Analyses climatiques et crédit'
  }}
/>
```

---

## 🔧 Configuration et Déploiement

### Variables d'Environnement Complètes
```bash
# OpenEPI Configuration
EXPO_PUBLIC_OPENEPI_BASE_URL=https://api.openepi.io/v1
EXPO_PUBLIC_OPENEPI_CLIENT_ID=your_client_id
EXPO_PUBLIC_OPENEPI_CLIENT_SECRET=your_client_secret
EXPO_PUBLIC_OPENEPI_API_KEY=your_api_key

# Services Externes
EXPO_PUBLIC_SOILGRIDS_API_URL=https://rest.isric.org/soilgrids/v2.0
EXPO_PUBLIC_FAO_YIELDS_API_URL=https://www.fao.org/faostat/api/v1
EXPO_PUBLIC_AMIS_PRICES_API_URL=https://amis-outlook.org/api/v1

# SMS/Notifications
EXPO_PUBLIC_SMS_GATEWAY_URL=your_sms_gateway
EXPO_PUBLIC_SMS_API_KEY=your_sms_key
```

### Installation des Dépendances
```bash
# Géolocalisation avancée
npm install expo-location expo-background-fetch

# Notifications push
npm install expo-notifications

# Graphiques pour les données
npm install react-native-chart-kit react-native-svg

# Cache pour les données satellitaires
npm install @react-native-async-storage/async-storage
```

---

## 📊 Métriques de Succès

### KPIs à Tracker
1. **Alertes Proactives** : Réduction de 50% des sinistres grâce aux alertes préventives
2. **Accès au Crédit** : 30% des utilisateurs avec score >700 obtiennent un crédit
3. **Précision NDVI** : Corrélation >80% entre NDVI et rendements réels
4. **Adoption** : 70% des utilisateurs activent les alertes SMS

### Tests de Performance
- Temps de réponse API OpenEPI : <3 secondes
- Mise à jour NDVI : Quotidienne
- Alertes temps réel : <5 minutes après détection

---

## 🚀 Prochaines Étapes

1. **Semaine 1-2** : Configuration OpenEPI + Services de base
2. **Semaine 3-4** : Scoring crédit + Interface banques
3. **Semaine 5-6** : Alertes proactives + SMS automatiques
4. **Semaine 7-8** : Monitoring végétation + NDVI
5. **Semaine 9-10** : Tests utilisateurs + Optimisations

Cette implémentation transformera ClimInvest d'une assurance réactive en un **écosystème proactif de résilience climatique** 🌱
