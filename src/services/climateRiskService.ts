import { openMeteoService } from './openMeteoService';
import { weatherValidationService } from './weatherValidationService';

export interface RiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskType: 'drought' | 'flood' | 'storm' | 'heat_stress' | 'multiple';
  riskScore: number; // 0-100
  triggers: {
    droughtDays: number;
    excessivePrecipitation: number;
    temperatureStress: number;
    ndviAnomaly?: number;
  };
  recommendations: string[];
  compensationEligible: boolean;
  alertLevel: 'info' | 'warning' | 'danger' | 'emergency';
}

export interface ClimateIndicators {
  consecutiveDryDays: number;
  totalPrecipitation: number;
  averageTemperature: number;
  maxTemperature: number;
  et0: number; // Évapotranspiration de référence
  precipitationAnomaly: number; // % par rapport à la normale
  temperatureAnomaly: number;
}

class ClimateRiskService {

  async analyzeRisk(
    lat: number,
    lon: number,
    cropType: string,
    farmSize: number,
    analysisDate: string = new Date().toISOString().split('T')[0]
  ): Promise<RiskAnalysis> {
    try {
      console.log(`🌡️ Analyse des risques climatiques pour ${cropType} à (${lat}, ${lon})`);

      // Récupérer les données des 30 derniers jours
      const endDate = new Date(analysisDate);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);

      const historicalData = await openMeteoService.getHistoricalWeather(
        lat, lon, 
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Calculer les indicateurs climatiques
      const indicators = this.calculateClimateIndicators(historicalData, lat);

      // Analyser les risques selon le type de culture
      const riskAnalysis = this.assessRiskByCrop(indicators, cropType, farmSize);

      console.log(`📊 Analyse terminée - Niveau de risque: ${riskAnalysis.riskLevel}`);
      return riskAnalysis;

    } catch (error) {
      console.error('❌ Erreur analyse des risques:', error);
      
      // Retourner une analyse par défaut en cas d'erreur
      return {
        riskLevel: 'medium',
        riskType: 'drought',
        riskScore: 50,
        triggers: {
          droughtDays: 0,
          excessivePrecipitation: 0,
          temperatureStress: 0
        },
        recommendations: ['Données insuffisantes - surveillance manuelle recommandée'],
        compensationEligible: false,
        alertLevel: 'warning'
      };
    }
  }

  private calculateClimateIndicators(data: any, latitude: number): ClimateIndicators {
    const precipitations = data.daily.precipitation_sum || [];
    const tempMax = data.daily.temperature_2m_max || [];
    const tempMin = data.daily.temperature_2m_min || [];
    const humidity = data.daily.relative_humidity_2m || [];
    const windSpeed = data.daily.wind_speed_10m || [];

    // Calcul des jours consécutifs sans pluie (< 1mm)
    let consecutiveDryDays = 0;
    let maxConsecutiveDryDays = 0;
    let currentDryStreak = 0;

    precipitations.forEach(precip => {
      if (precip < 1) {
        currentDryStreak++;
        maxConsecutiveDryDays = Math.max(maxConsecutiveDryDays, currentDryStreak);
      } else {
        currentDryStreak = 0;
      }
    });

    // Jours secs actuels (depuis la fin)
    for (let i = precipitations.length - 1; i >= 0; i--) {
      if (precipitations[i] < 1) {
        consecutiveDryDays++;
      } else {
        break;
      }
    }

    // Précipitations totales
    const totalPrecipitation = precipitations.reduce((sum: number, p: number) => sum + p, 0);

    // Températures moyennes
    const averageTemperature = tempMax.reduce((sum: number, temp: number, i: number) => 
      sum + (temp + tempMin[i]) / 2, 0) / tempMax.length;
    
    const maxTemperatureRecord = Math.max(...tempMax);

    // Calcul ET0 moyen
    const et0Values = tempMax.map((tMax, i) => 
      openMeteoService.calculateET0(
        tMax, 
        tempMin[i], 
        humidity[i] || 70, 
        windSpeed[i] || 2, 
        latitude, 
        new Date().getDay()
      )
    );
    const averageET0 = et0Values.reduce((sum, et0) => sum + et0, 0) / et0Values.length;

    // Anomalies (comparaison avec des normales approximatives pour le Burkina Faso)
    const normalPrecipitation = this.getNormalPrecipitation(new Date().getMonth());
    const normalTemperature = this.getNormalTemperature(new Date().getMonth());

    const precipitationAnomaly = normalPrecipitation > 0 ? 
      ((totalPrecipitation - normalPrecipitation) / normalPrecipitation) * 100 : 0;
    
    const temperatureAnomaly = normalTemperature > 0 ? 
      ((averageTemperature - normalTemperature) / normalTemperature) * 100 : 0;

    return {
      consecutiveDryDays: Math.max(consecutiveDryDays, maxConsecutiveDryDays),
      totalPrecipitation,
      averageTemperature,
      maxTemperature: maxTemperatureRecord,
      et0: averageET0,
      precipitationAnomaly,
      temperatureAnomaly
    };
  }

  private assessRiskByCrop(
    indicators: ClimateIndicators, 
    cropType: string, 
    farmSize: number
  ): RiskAnalysis {
    let riskScore = 0;
    let riskType: RiskAnalysis['riskType'] = 'drought';
    const recommendations: string[] = [];
    let compensationEligible = false;

    // Seuils spécifiques par culture
    const cropThresholds = this.getCropThresholds(cropType);

    // Analyse du risque de sécheresse
    if (indicators.consecutiveDryDays >= cropThresholds.droughtDays.critical) {
      riskScore += 40;
      riskType = 'drought';
      recommendations.push('🚨 Sécheresse critique détectée');
      recommendations.push('💧 Irrigation d\'urgence nécessaire');
      compensationEligible = true;
    } else if (indicators.consecutiveDryDays >= cropThresholds.droughtDays.warning) {
      riskScore += 25;
      recommendations.push('⚠️ Période sèche prolongée');
      recommendations.push('💧 Prévoir irrigation si possible');
    }

    // Analyse du risque d'inondation
    if (indicators.totalPrecipitation >= cropThresholds.floodPrecipitation.critical) {
      riskScore += 35;
      riskType = indicators.consecutiveDryDays > 10 ? 'multiple' : 'flood';
      recommendations.push('🌊 Risque d\'inondation élevé');
      recommendations.push('🚰 Améliorer le drainage');
      compensationEligible = true;
    }

    // Analyse du stress thermique
    if (indicators.maxTemperature >= cropThresholds.heatStress.critical) {
      riskScore += 30;
      riskType = riskType === 'drought' ? 'multiple' : 'heat_stress';
      recommendations.push('🌡️ Stress thermique critique');
      recommendations.push('🌿 Protéger les cultures du soleil');
      compensationEligible = true;
    }

    // Analyse des anomalies
    if (indicators.precipitationAnomaly < -50) {
      riskScore += 20;
      recommendations.push('📉 Déficit pluviométrique important');
    }

    if (indicators.temperatureAnomaly > 15) {
      riskScore += 15;
      recommendations.push('🌡️ Températures anormalement élevées');
    }

    // Ajustement selon la taille de l'exploitation
    if (farmSize > 5) {
      riskScore += 5; // Grandes exploitations plus vulnérables
    }

    // Détermination du niveau de risque
    let riskLevel: RiskAnalysis['riskLevel'];
    let alertLevel: RiskAnalysis['alertLevel'];

    if (riskScore >= 80) {
      riskLevel = 'critical';
      alertLevel = 'emergency';
    } else if (riskScore >= 60) {
      riskLevel = 'high';
      alertLevel = 'danger';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
      alertLevel = 'warning';
    } else {
      riskLevel = 'low';
      alertLevel = 'info';
    }

    // Recommandations générales
    if (riskLevel === 'low') {
      recommendations.push('✅ Conditions favorables aux cultures');
    }

    return {
      riskLevel,
      riskType,
      riskScore: Math.min(100, riskScore),
      triggers: {
        droughtDays: indicators.consecutiveDryDays,
        excessivePrecipitation: indicators.totalPrecipitation,
        temperatureStress: indicators.maxTemperature,
        ndviAnomaly: 0 // À implémenter avec les données satellite
      },
      recommendations,
      compensationEligible,
      alertLevel
    };
  }

  private getCropThresholds(cropType: string) {
    const thresholds = {
      'millet': {
        droughtDays: { warning: 15, critical: 25 },
        floodPrecipitation: { critical: 150 },
        heatStress: { critical: 42 }
      },
      'sorghum': {
        droughtDays: { warning: 12, critical: 20 },
        floodPrecipitation: { critical: 120 },
        heatStress: { critical: 40 }
      },
      'maize': {
        droughtDays: { warning: 10, critical: 15 },
        floodPrecipitation: { critical: 100 },
        heatStress: { critical: 38 }
      },
      'cotton': {
        droughtDays: { warning: 14, critical: 21 },
        floodPrecipitation: { critical: 130 },
        heatStress: { critical: 41 }
      },
      'groundnut': {
        droughtDays: { warning: 12, critical: 18 },
        floodPrecipitation: { critical: 110 },
        heatStress: { critical: 39 }
      },
      'cowpea': {
        droughtDays: { warning: 10, critical: 16 },
        floodPrecipitation: { critical: 90 },
        heatStress: { critical: 37 }
      },
      'sesame': {
        droughtDays: { warning: 18, critical: 28 },
        floodPrecipitation: { critical: 80 },
        heatStress: { critical: 43 }
      },
      'rice': {
        droughtDays: { warning: 5, critical: 10 },
        floodPrecipitation: { critical: 200 },
        heatStress: { critical: 36 }
      }
    };

    return thresholds[cropType as keyof typeof thresholds] || thresholds.maize;
  }

  private getNormalPrecipitation(month: number): number {
    // Précipitations normales mensuelles approximatives pour le Burkina Faso (mm)
    const normals = [5, 10, 25, 45, 85, 120, 180, 220, 150, 60, 15, 5];
    return normals[month] || 50;
  }

  private getNormalTemperature(month: number): number {
    // Températures normales mensuelles approximatives pour le Burkina Faso (°C)
    const normals = [28, 32, 36, 38, 36, 33, 30, 29, 30, 33, 32, 28];
    return normals[month] || 32;
  }
}

// Instance singleton
export const climateRiskService = new ClimateRiskService();
