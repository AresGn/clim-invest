import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Coverage, Claim, InsuranceState, WeatherAlert } from '../../types/insurance';

// Actions asynchrones
export const fetchCoverageStatus = createAsyncThunk(
  'insurance/fetchCoverageStatus',
  async (userId: string) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const coverage: Coverage = {
      id: Date.now().toString(),
      userId,
      amount: 30000, // 30,000 FCFA
      premium: 800,   // 800 FCFA (maximum 1000 FCFA)
      isActive: true,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      cropType: 'maize',
      farmSize: 2,
      riskLevel: 0.6
    };
    
    return coverage;
  }
);

export const fetchWeatherAlerts = createAsyncThunk(
  'insurance/fetchWeatherAlerts',
  async (location: { latitude: number; longitude: number }) => {
    // Simulation d'un appel API météo
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const alerts: WeatherAlert[] = [
      {
        id: '1',
        type: 'drought',
        severity: 'medium',
        title: 'Risque de Sécheresse',
        description: 'Température élevée (38°C) et absence de pluie depuis 5 jours. Surveillez vos cultures.',
        actionRequired: true,
        compensationTrigger: false,
        date: new Date().toISOString()
      }
    ];
    
    return alerts;
  }
);

export const submitClaim = createAsyncThunk(
  'insurance/submitClaim',
  async (claimData: Partial<Claim>) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newClaim: Claim = {
      id: Date.now().toString(),
      userId: claimData.userId || '',
      coverageId: claimData.coverageId || '',
      type: claimData.type || 'drought',
      description: claimData.description || '',
      amount: claimData.amount || 0,
      status: 'pending',
      submissionDate: new Date().toISOString(),
      evidence: claimData.evidence || []
    };
    
    return newClaim;
  }
);

const initialState: InsuranceState = {
  coverage: null,
  claims: [],
  weatherAlerts: [],
  loading: false,
  error: null
};

const insuranceSlice = createSlice({
  name: 'insurance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addWeatherAlert: (state, action: PayloadAction<WeatherAlert>) => {
      state.weatherAlerts.push(action.payload);
    },
    removeWeatherAlert: (state, action: PayloadAction<string>) => {
      state.weatherAlerts = state.weatherAlerts.filter(
        alert => alert.id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coverage Status
      .addCase(fetchCoverageStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoverageStatus.fulfilled, (state, action: PayloadAction<Coverage>) => {
        state.loading = false;
        state.coverage = action.payload;
      })
      .addCase(fetchCoverageStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement de la couverture';
      })
      // Fetch Weather Alerts
      .addCase(fetchWeatherAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeatherAlerts.fulfilled, (state, action: PayloadAction<WeatherAlert[]>) => {
        state.loading = false;
        state.weatherAlerts = action.payload;
      })
      .addCase(fetchWeatherAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des alertes météo';
      })
      // Submit Claim
      .addCase(submitClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitClaim.fulfilled, (state, action: PayloadAction<Claim>) => {
        state.loading = false;
        state.claims.push(action.payload);
      })
      .addCase(submitClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la soumission de la réclamation';
      });
  }
});

export const { clearError, addWeatherAlert, removeWeatherAlert } = insuranceSlice.actions;
export default insuranceSlice.reducer;
