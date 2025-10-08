import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './navigation/AppNavigator';
import BackgroundSyncService from './services/backgroundSync';
import SyncService from './services/sync';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Initialize background sync when app starts
    const initializeBackgroundSync = async () => {
      try {
        const isAvailable = await BackgroundSyncService.isAvailable();
        if (isAvailable) {
          await BackgroundSyncService.register();
          console.log('Background sync initialized');
        } else {
          console.log('Background fetch not available on this device');
        }
      } catch (error) {
        console.error('Failed to initialize background sync:', error);
      }
    };

    initializeBackgroundSync();

    // Handle app state changes for smart sync
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, trigger smart sync
        console.log('App became active, triggering smart sync');
        await BackgroundSyncService.smartSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
