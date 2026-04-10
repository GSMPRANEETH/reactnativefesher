import { useEffect } from 'react';
import { AppState } from 'react-native';

import { selectCatalog } from '../store/catalogSlice';
import { useAppSelector } from '../store/hooks';
import { savePersistedCatalog } from '../store/storage';
import { store } from '../store/store';

export function useCatalogPersistence() {
  const catalog = useAppSelector(selectCatalog);

  useEffect(() => {
    if (!catalog.hydrated) {
      return;
    }

    const timer = setTimeout(() => {
      savePersistedCatalog(catalog);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [catalog]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active' && store.getState().catalog.hydrated) {
        savePersistedCatalog(store.getState().catalog);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
