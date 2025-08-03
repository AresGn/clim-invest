/**
 * Service pour récupérer les données climatiques et historiques des catastrophes
 * Utilise les APIs documentées dans climate_data_apis.md
 */

export interface DisasterEvent {
  id: string;
  type: 'drought' | 'flood' | 'storm' | 'cyclone';
  date: string;
  location: string;
  country: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedPeople: number;
  economicLoss: number; // en USD
  description: string;
}

export interface DisasterSummary {
  totalEvents: number;
  recentEvents: DisasterEvent[];
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdate: string;
}

class ClimateDataService {
  private readonly targetCountries = ['Benin', 'Senegal', 'Niger'];

  /**
   * Récupère l'historique des catastrophes récentes pour les pays cibles
   */
  async getRecentDisasters(): Promise<DisasterSummary> {
    try {
      // Simulation des données basée sur EM-DAT et AFDM
      // En production, ceci ferait des appels réels aux APIs
      const mockDisasters: DisasterEvent[] = [
        {
          id: '1',
          type: 'drought',
          date: '2024-06-15',
          location: 'Région de Donga',
          country: 'Benin',
          severity: 'high',
          affectedPeople: 125000,
          economicLoss: 8500000,
          description: 'Sécheresse prolongée affectant les cultures de maïs'
        },
        {
          id: '2',
          type: 'flood',
          date: '2024-07-22',
          location: 'Delta du fleuve Sénégal',
          country: 'Senegal',
          severity: 'medium',
          affectedPeople: 85000,
          economicLoss: 4200000,
          description: 'Inondations dues aux fortes pluies saisonnières'
        },
        {
          id: '3',
          type: 'drought',
          date: '2024-05-10',
          location: 'Région de Tillabéri',
          country: 'Niger',
          severity: 'critical',
          affectedPeople: 200000,
          economicLoss: 12000000,
          description: 'Stress hydrique extrême, perte de 60% des récoltes'
        },
        {
          id: '4',
          type: 'storm',
          date: '2024-07-28',
          location: 'Région de Kaolack',
          country: 'Senegal',
          severity: 'medium',
          affectedPeople: 45000,
          economicLoss: 2800000,
          description: 'Tempête avec vents violents et grêle'
        }
      ];

      // Trier par date (plus récent en premier)
      const sortedDisasters = mockDisasters.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculer le niveau de risque basé sur les événements récents
      const recentHighSeverityEvents = sortedDisasters
        .filter(d => d.severity === 'high' || d.severity === 'critical')
        .filter(d => this.isRecentEvent(d.date));

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (recentHighSeverityEvents.length >= 2) {
        riskLevel = 'high';
      } else if (recentHighSeverityEvents.length === 1) {
        riskLevel = 'medium';
      }

      return {
        totalEvents: sortedDisasters.length,
        recentEvents: sortedDisasters.slice(0, 3), // Les 3 plus récents
        riskLevel,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données climatiques:', error);
      
      // Retourner des données par défaut en cas d'erreur
      return {
        totalEvents: 0,
        recentEvents: [],
        riskLevel: 'low',
        lastUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * Vérifie si un événement est récent (moins de 3 mois)
   */
  private isRecentEvent(dateString: string): boolean {
    const eventDate = new Date(dateString);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return eventDate >= threeMonthsAgo;
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Obtient l'emoji correspondant au type de catastrophe
   */
  getDisasterEmoji(type: DisasterEvent['type']): string {
    const emojiMap = {
      drought: '🌵',
      flood: '🌊',
      storm: '⛈️',
      cyclone: '🌀'
    };
    return emojiMap[type] || '⚠️';
  }

  /**
   * Obtient la couleur correspondant à la sévérité
   */
  getSeverityColor(severity: DisasterEvent['severity']): string {
    const colorMap = {
      low: '#4CAF50',      // Vert
      medium: '#FF9800',   // Orange
      high: '#F44336',     // Rouge
      critical: '#D32F2F'  // Rouge foncé
    };
    return colorMap[severity] || '#757575';
  }

  /**
   * Formate le nombre de personnes affectées
   */
  formatAffectedPeople(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  }

  /**
   * Formate les pertes économiques
   */
  formatEconomicLoss(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M USD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K USD`;
    }
    return `${amount} USD`;
  }
}

export const climateDataService = new ClimateDataService();
