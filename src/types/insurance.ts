export interface Coverage {
  id: string;
  userId: string;
  amount: number;
  premium: number;
  isActive: boolean;
  startDate: string;
  expiryDate: string;
  cropType: string;
  farmSize: number;
  riskLevel: number;
}

export interface Claim {
  id: string;
  userId: string;
  coverageId: string;
  type: 'drought' | 'flood' | 'storm' | 'other';
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submissionDate: string;
  evidence?: string[];
}

export interface InsuranceState {
  coverage: Coverage | null;
  claims: Claim[];
  weatherAlerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
}

export interface WeatherAlert {
  id: string;
  type: 'drought' | 'flood' | 'storm';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionRequired: boolean;
  compensationTrigger: boolean;
  date: string;
}
