import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { AppNavigator } from './src/navigation/AppNavigator';
import {
  hydrateCatalogState,
  selectCatalogHydrated,
} from './src/store/catalogSlice';
import { loadPersistedCatalog } from './src/store/storage';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { store } from './src/store/store';
import { useCatalogPersistence } from './src/hooks/useCatalogPersistence';

function AppShell() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectCatalogHydrated);
  const [booting, setBooting] = useState(true);

  useCatalogPersistence();

  useEffect(() => {
    let active = true;

    (async () => {
      const persisted = await loadPersistedCatalog();

      if (!active) {
        return;
      }

      dispatch(hydrateCatalogState(persisted));
      setBooting(false);
    })();

    return () => {
      active = false;
    };
  }, [dispatch]);

  if (booting || !hydrated) {
    return (
      <View style={styles.bootContainer}>
        <ActivityIndicator size="large" color="#0D6A57" />
        <Text style={styles.bootText}>Restoring your catalog</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

function App() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          />
          <AppShell />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootContainer: {
    flex: 1,
    backgroundColor: '#F6F3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootText: {
    marginTop: 12,
    color: '#665A4F',
    fontSize: 13,
    fontWeight: '600',
  },
});
