/**
 * Utilitaires pour la gestion des dates dans les appels API météo
 */

export class DateUtils {
  /**
   * Formate une date au format YYYY-MM-DD pour les APIs
   */
  static formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Obtient la date d'aujourd'hui au format API
   */
  static getTodayForAPI(): string {
    return this.formatDateForAPI(new Date());
  }

  /**
   * Obtient une date X jours dans le passé
   */
  static getDaysAgoForAPI(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDateForAPI(date);
  }

  /**
   * Vérifie si une date est valide pour les données historiques
   */
  static isValidHistoricalDate(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(now.getFullYear() - 2);

    // La date ne doit pas être dans le futur
    if (date > now) {
      return false;
    }

    // La date ne doit pas être trop ancienne (plus de 2 ans)
    if (date < twoYearsAgo) {
      return false;
    }

    return true;
  }

  /**
   * Obtient une plage de dates sécurisée pour les données historiques
   */
  static getSafeHistoricalDateRange(requestedStartDate: string, requestedEndDate: string): {
    startDate: string;
    endDate: string;
    isAdjusted: boolean;
  } {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    let startDate = new Date(requestedStartDate);
    let endDate = new Date(requestedEndDate);
    let isAdjusted = false;

    // Ajuster la date de fin si elle est dans le futur
    if (endDate > yesterday) {
      endDate = yesterday;
      isAdjusted = true;
    }

    // Ajuster la date de début si elle est trop ancienne
    if (startDate < oneMonthAgo) {
      startDate = oneMonthAgo;
      isAdjusted = true;
    }

    // S'assurer que la date de début n'est pas après la date de fin
    if (startDate > endDate) {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7); // 7 jours avant la date de fin
      isAdjusted = true;
    }

    return {
      startDate: this.formatDateForAPI(startDate),
      endDate: this.formatDateForAPI(endDate),
      isAdjusted
    };
  }

  /**
   * Valide les coordonnées GPS
   */
  static validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Arrondit les coordonnées à 4 décimales pour optimiser les appels API
   */
  static roundCoordinates(lat: number, lon: number): { lat: number; lon: number } {
    return {
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000
    };
  }
}
