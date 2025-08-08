import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store/store';
import { loadUserFromStorage } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';
import './src/localization/i18n'; // Initialize i18n

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Charger l'utilisateur depuis le stockage local au démarrage
    dispatch(loadUserFromStorage() as any);
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
