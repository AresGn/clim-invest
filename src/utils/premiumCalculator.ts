/**
 * Utilitaires pour le calcul des primes d'assurance
 * Garantit que les primes ne dépassent jamais 1000 FCFA
 */

export interface PremiumCalculationParams {
  cropType: string;
  farmSize: number; // en hectares
  riskLevel: number; // 0-1
  region?: string;
}

export interface PremiumResult {
  monthlyPremium: number;
  coverageAmount: number;
  riskCategory: 'low' | 'medium' | 'high';
  explanation: string;
}

// Facteurs de risque par type de culture
const CROP_RISK_FACTORS = {
  'maize': 0.7,
  'cotton': 0.6,
  'groundnut': 0.5,
  'cowpea': 0.6,
  'sesame': 0.5,
  'rice': 0.8,
  'vegetables': 0.9,
  'millet': 0.4,
  'sorghum': 0.4
};

// Facteurs de risque par région
const REGIONAL_RISK_FACTORS = {
  'Sahel': 0.9,
  'Sudan': 0.7,
  'Guinea': 0.5,
  'Coastal': 0.6
};

// Prime de base par hectare (en FCFA)
const BASE_PREMIUM_PER_HECTARE = 200;

// Prime maximum autorisée (en FCFA)
const MAX_PREMIUM = 1000;

// Prime minimum (en FCFA)
const MIN_PREMIUM = 200;

export class PremiumCalculator {
  /**
   * Calcule la prime mensuelle d'assurance
   */
  static calculatePremium(params: PremiumCalculationParams): PremiumResult {
    const { cropType, farmSize, riskLevel, region } = params;

    // Facteur de risque de la culture
    const cropRiskFactor = CROP_RISK_FACTORS[cropType as keyof typeof CROP_RISK_FACTORS] || 0.6;
    
    // Facteur de risque régional
    const regionalRiskFactor = region ? 
      (REGIONAL_RISK_FACTORS[region as keyof typeof REGIONAL_RISK_FACTORS] || 0.7) : 0.7;

    // Calcul de base
    let basePremium = BASE_PREMIUM_PER_HECTARE * farmSize;
    
    // Application des facteurs de risque
    let adjustedPremium = basePremium * cropRiskFactor * regionalRiskFactor * (1 + riskLevel);

    // Arrondir à la dizaine supérieure
    adjustedPremium = Math.ceil(adjustedPremium / 10) * 10;

    // Appliquer les limites min/max
    const finalPremium = Math.max(MIN_PREMIUM, Math.min(MAX_PREMIUM, adjustedPremium));

    // Calcul du montant de couverture (30x la prime)
    const coverageAmount = finalPremium * 30;

    // Déterminer la catégorie de risque
    const riskCategory = this.getRiskCategory(riskLevel, cropRiskFactor, regionalRiskFactor);

    // Générer l'explication
    const explanation = this.generateExplanation(cropType, farmSize, riskCategory, finalPremium);

    return {
      monthlyPremium: finalPremium,
      coverageAmount,
      riskCategory,
      explanation
    };
  }

  /**
   * Détermine la catégorie de risque
   */
  private static getRiskCategory(
    riskLevel: number, 
    cropRiskFactor: number, 
    regionalRiskFactor: number
  ): 'low' | 'medium' | 'high' {
    const combinedRisk = riskLevel * cropRiskFactor * regionalRiskFactor;
    
    if (combinedRisk < 0.3) return 'low';
    if (combinedRisk < 0.6) return 'medium';
    return 'high';
  }

  /**
   * Génère une explication du calcul de prime
   */
  private static generateExplanation(
    cropType: string, 
    farmSize: number, 
    riskCategory: string, 
    premium: number
  ): string {
    const cropNames = {
      'maize': 'maïs',
      'cotton': 'coton',
      'groundnut': 'arachide',
      'cowpea': 'niébé',
      'sesame': 'sésame',
      'rice': 'riz',
      'vegetables': 'maraîchage',
      'millet': 'mil',
      'sorghum': 'sorgho'
    };

    const cropName = cropNames[cropType as keyof typeof cropNames] || cropType;
    
    const riskText = {
      'low': 'faible risque',
      'medium': 'risque modéré',
      'high': 'risque élevé'
    };

    return `Votre culture de ${cropName} sur ${farmSize} hectare${farmSize > 1 ? 's' : ''} présente un ${riskText[riskCategory as keyof typeof riskText]}. Prime calculée: ${premium} FCFA/mois.`;
  }

  /**
   * Calcule la prime pour différentes tailles d'exploitation
   */
  static calculatePremiumBySize(cropType: string, riskLevel: number = 0.5): Array<{
    size: number;
    premium: number;
    coverage: number;
  }> {
    const sizes = [0.5, 1, 1.5, 2, 3, 5];
    
    return sizes.map(size => {
      const result = this.calculatePremium({
        cropType,
        farmSize: size,
        riskLevel
      });
      
      return {
        size,
        premium: result.monthlyPremium,
        coverage: result.coverageAmount
      };
    });
  }

  /**
   * Valide qu'une prime respecte les limites
   */
  static validatePremium(premium: number): boolean {
    return premium >= MIN_PREMIUM && premium <= MAX_PREMIUM;
  }

  /**
   * Obtient la prime maximum autorisée
   */
  static getMaxPremium(): number {
    return MAX_PREMIUM;
  }

  /**
   * Obtient la prime minimum autorisée
   */
  static getMinPremium(): number {
    return MIN_PREMIUM;
  }

  /**
   * Formate un montant en FCFA
   */
  static formatAmount(amount: number): string {
    return `${amount.toLocaleString()} FCFA`;
  }
}
