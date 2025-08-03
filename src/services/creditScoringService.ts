import { openEpiAdvancedService, SoilData, YieldData, PriceData } from './openEpiAdvancedService';

export interface FarmerCreditScore {
  overallScore: number; // 0-1000
  soilQuality: number; // 0-100
  historicalYields: number; // 0-100
  insuranceHistory: number; // 0-100
  marketAccess: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  creditRecommendation: string;
  eligibleAmount: number; // Montant éligible en FCFA
  interestRate: number; // Taux d'intérêt recommandé
  repaymentPeriod: number; // Période de remboursement en mois
}

export interface InsuranceHistory {
  totalPolicies: number;
  activePolicies: number;
  claimsSubmitted: number;
  claimsPaid: number;
  totalPremiumsPaid: number;
  paymentReliability: number; // 0-100 (% de paiements à temps)
  yearsWithInsurance: number;
}

export interface MarketAccessData {
  distanceToMarket: number; // km
  transportCost: number; // FCFA/kg
  marketPriceVariability: number; // coefficient de variation
  accessToStorage: boolean;
  accessToProcessing: boolean;
  cooperativeMembership: boolean;
}

export class CreditScoringService {
  /**
   * Calcule le score de crédit complet d'un agriculteur
   */
  async calculateCreditScore(
    farmerId: string,
    location: { lat: number; lon: number },
    cropType: string,
    farmSize: number = 2
  ): Promise<FarmerCreditScore> {
    try {
      // 1. Récupérer données sol
      const soilData = await openEpiAdvancedService.getSoilData(location.lat, location.lon);
      const soilScore = this.calculateSoilScore(soilData);

      // 2. Historique des rendements
      const yieldData = await openEpiAdvancedService.getCropYields('Benin', cropType);
      const yieldScore = this.calculateYieldScore(yieldData, location);

      // 3. Historique d'assurance (simulation)
      const insuranceHistory = await this.getInsuranceHistory(farmerId);
      const insuranceScore = this.calculateInsuranceScore(insuranceHistory);

      // 4. Accès au marché
      const marketData = await this.getMarketAccessData(location, cropType);
      const marketScore = this.calculateMarketScore(marketData);

      // 5. Score global pondéré
      const overallScore = Math.round(
        (soilScore * 0.25) + 
        (yieldScore * 0.25) + 
        (insuranceScore * 0.30) + 
        (marketScore * 0.20)
      ) * 10; // Convertir en échelle 0-1000

      const riskLevel = this.determineRiskLevel(overallScore);
      const creditRecommendation = this.generateRecommendation(overallScore, soilData, insuranceHistory, farmSize);
      const eligibleAmount = this.calculateEligibleAmount(overallScore, farmSize, yieldData.average_yield);
      const interestRate = this.calculateInterestRate(overallScore, riskLevel);
      const repaymentPeriod = this.calculateRepaymentPeriod(overallScore, cropType);

      return {
        overallScore,
        soilQuality: soilScore,
        historicalYields: yieldScore,
        insuranceHistory: insuranceScore,
        marketAccess: marketScore,
        riskLevel,
        creditRecommendation,
        eligibleAmount,
        interestRate,
        repaymentPeriod
      };
    } catch (error) {
      console.error('Erreur calcul score crédit:', error);
      throw new Error('Impossible de calculer le score de crédit');
    }
  }

  /**
   * Calcule le score basé sur la qualité du sol
   */
  private calculateSoilScore(soilData: SoilData): number {
    return soilData.quality_score;
  }

  /**
   * Calcule le score basé sur les rendements historiques
   */
  private calculateYieldScore(yieldData: YieldData, location: { lat: number; lon: number }): number {
    let score = 0;

    // Score basé sur le rendement moyen (40 points max)
    const avgYield = yieldData.average_yield;
    if (avgYield > 2.0) score += 40;
    else if (avgYield > 1.5) score += 32;
    else if (avgYield > 1.0) score += 24;
    else if (avgYield > 0.5) score += 16;
    else score += 8;

    // Score basé sur la tendance (30 points max)
    switch (yieldData.trend) {
      case 'increasing':
        score += 30;
        break;
      case 'stable':
        score += 20;
        break;
      case 'decreasing':
        score += 5;
        break;
    }

    // Score basé sur la fiabilité des données (30 points max)
    score += (yieldData.reliability_score / 100) * 30;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calcule le score basé sur l'historique d'assurance
   */
  private calculateInsuranceScore(insuranceHistory: InsuranceHistory): number {
    let score = 0;

    // Fiabilité des paiements (40 points max)
    score += (insuranceHistory.paymentReliability / 100) * 40;

    // Années d'expérience avec l'assurance (25 points max)
    const yearsScore = Math.min(insuranceHistory.yearsWithInsurance * 5, 25);
    score += yearsScore;

    // Ratio sinistres/polices (20 points max)
    const claimRatio = insuranceHistory.claimsSubmitted / Math.max(insuranceHistory.totalPolicies, 1);
    if (claimRatio < 0.1) score += 20;
    else if (claimRatio < 0.2) score += 15;
    else if (claimRatio < 0.3) score += 10;
    else score += 5;

    // Polices actives (15 points max)
    if (insuranceHistory.activePolicies > 0) score += 15;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calcule le score basé sur l'accès au marché
   */
  private calculateMarketScore(marketData: MarketAccessData): number {
    let score = 0;

    // Distance au marché (25 points max)
    if (marketData.distanceToMarket < 5) score += 25;
    else if (marketData.distanceToMarket < 10) score += 20;
    else if (marketData.distanceToMarket < 20) score += 15;
    else if (marketData.distanceToMarket < 50) score += 10;
    else score += 5;

    // Coût de transport (20 points max)
    if (marketData.transportCost < 10) score += 20;
    else if (marketData.transportCost < 25) score += 15;
    else if (marketData.transportCost < 50) score += 10;
    else score += 5;

    // Accès au stockage (20 points max)
    if (marketData.accessToStorage) score += 20;

    // Accès à la transformation (15 points max)
    if (marketData.accessToProcessing) score += 15;

    // Membre d'une coopérative (20 points max)
    if (marketData.cooperativeMembership) score += 20;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Détermine le niveau de risque
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 700) return 'low';
    if (score >= 500) return 'medium';
    return 'high';
  }

  /**
   * Génère une recommandation personnalisée
   */
  private generateRecommendation(
    score: number, 
    soilData: SoilData, 
    insuranceHistory: InsuranceHistory,
    farmSize: number
  ): string {
    if (score >= 700) {
      return `Excellent profil ! Vous êtes éligible à un crédit préférentiel. Votre sol de qualité ${soilData.suitability} et votre historique d'assurance fiable (${insuranceHistory.paymentReliability}% de paiements à temps) vous permettent d'accéder aux meilleures conditions.`;
    } else if (score >= 500) {
      return `Profil correct. Vous pouvez obtenir un crédit avec des conditions standard. Améliorez votre sol (score: ${soilData.quality_score}/100) et maintenez vos paiements d'assurance à jour pour de meilleures conditions futures.`;
    } else {
      return `Profil à améliorer. Nous recommandons de commencer par un micro-crédit. Travaillez sur l'amélioration de votre sol et souscrivez à une assurance pour augmenter votre score de crédit.`;
    }
  }

  /**
   * Calcule le montant éligible
   */
  private calculateEligibleAmount(score: number, farmSize: number, averageYield: number): number {
    const baseAmount = farmSize * averageYield * 200000; // 200,000 FCFA par tonne de rendement potentiel
    
    if (score >= 700) return Math.round(baseAmount * 1.5);
    if (score >= 500) return Math.round(baseAmount);
    return Math.round(baseAmount * 0.5);
  }

  /**
   * Calcule le taux d'intérêt recommandé
   */
  private calculateInterestRate(score: number, riskLevel: 'low' | 'medium' | 'high'): number {
    switch (riskLevel) {
      case 'low': return 8.5; // 8.5% annuel
      case 'medium': return 12.0; // 12% annuel
      case 'high': return 18.0; // 18% annuel
    }
  }

  /**
   * Calcule la période de remboursement recommandée
   */
  private calculateRepaymentPeriod(score: number, cropType: string): number {
    // Période basée sur le cycle de la culture
    let basePeriod = 12; // 12 mois par défaut
    
    switch (cropType.toLowerCase()) {
      case 'cotton':
      case 'coton':
        basePeriod = 8; // Cycle court
        break;
      case 'rice':
      case 'riz':
        basePeriod = 6; // Cycle très court
        break;
      default:
        basePeriod = 12;
    }

    // Ajuster selon le score
    if (score >= 700) return basePeriod + 6; // Plus de flexibilité
    if (score >= 500) return basePeriod;
    return Math.max(basePeriod - 3, 6); // Minimum 6 mois
  }

  /**
   * Simule l'historique d'assurance d'un agriculteur
   */
  private async getInsuranceHistory(farmerId: string): Promise<InsuranceHistory> {
    // Simulation d'un historique d'assurance réaliste
    const yearsWithInsurance = Math.floor(Math.random() * 5) + 1; // 1-5 ans
    const totalPolicies = yearsWithInsurance * (Math.floor(Math.random() * 2) + 1); // 1-2 polices par an
    const activePolicies = Math.floor(Math.random() * 2) + 1; // 1-2 polices actives
    const claimsSubmitted = Math.floor(totalPolicies * (Math.random() * 0.3)); // 0-30% de sinistres
    const claimsPaid = Math.floor(claimsSubmitted * (0.7 + Math.random() * 0.3)); // 70-100% payés
    const paymentReliability = 60 + Math.floor(Math.random() * 35); // 60-95%
    const totalPremiumsPaid = totalPolicies * (800 + Math.floor(Math.random() * 400)); // 800-1200 FCFA par police

    return {
      totalPolicies,
      activePolicies,
      claimsSubmitted,
      claimsPaid,
      totalPremiumsPaid,
      paymentReliability,
      yearsWithInsurance
    };
  }

  /**
   * Simule les données d'accès au marché
   */
  private async getMarketAccessData(location: { lat: number; lon: number }, cropType: string): Promise<MarketAccessData> {
    // Simulation basée sur la localisation (plus proche de Cotonou = meilleur accès)
    const distanceToMarket = 5 + Math.floor(Math.random() * 45); // 5-50 km
    const transportCost = Math.floor(distanceToMarket * (2 + Math.random() * 3)); // 2-5 FCFA/km/kg
    const marketPriceVariability = 0.1 + Math.random() * 0.2; // 10-30% de variabilité
    const accessToStorage = Math.random() > 0.6; // 40% ont accès au stockage
    const accessToProcessing = Math.random() > 0.8; // 20% ont accès à la transformation
    const cooperativeMembership = Math.random() > 0.5; // 50% sont membres d'une coopérative

    return {
      distanceToMarket,
      transportCost,
      marketPriceVariability,
      accessToStorage,
      accessToProcessing,
      cooperativeMembership
    };
  }
}

export const creditScoringService = new CreditScoringService();
