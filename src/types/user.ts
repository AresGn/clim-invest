export interface User {
  id: string;
  name: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
    region: string;
  };
  cropType: 'maize' | 'cotton' | 'groundnut' | 'vegetables';
  farmSize: number;
  registrationDate: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
