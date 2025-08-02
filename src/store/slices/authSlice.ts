import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types/user';

// Actions asynchrones
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: Partial<User>) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      phone: userData.phone || '',
      location: userData.location || { latitude: 0, longitude: 0, region: '' },
      cropType: userData.cropType || 'maize',
      farmSize: userData.farmSize || 1,
      registrationDate: new Date().toISOString(),
      isActive: true
    };
    
    return newUser;
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { phone: string }) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retourner un utilisateur simulé
    const user: User = {
      id: '1',
      name: 'Utilisateur Test',
      phone: credentials.phone,
      location: { latitude: 12.3714, longitude: -1.5197, region: 'Ouagadougou' },
      cropType: 'maize',
      farmSize: 2,
      registrationDate: new Date().toISOString(),
      isActive: true
    };
    
    return user;
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de l\'inscription';
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la connexion';
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
