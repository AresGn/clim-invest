export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
  };
  daily: {
    precipitation_sum: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  alerts: WeatherAlert[];
}

export interface NDVIData {
  ndvi: number;
  status: 'drought_risk' | 'healthy' | 'moderate';
  date: string;
  source: string;
}

export interface WeatherAlert {
  type: 'drought' | 'flood' | 'storm';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionRequired: boolean;
  compensationTrigger: boolean;
}
