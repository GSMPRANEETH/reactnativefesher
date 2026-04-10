import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CatalogState, PersistedCatalogState } from './types';

const STORAGE_KEY = 'rnf.catalog.state.v1';

export function toPersistedState(state: CatalogState): PersistedCatalogState {
  return {
    query: state.query,
    ids: state.ids,
    entities: state.entities,
    page: state.page,
    total: state.total,
    selectedProductId: state.selectedProductId,
    lastUpdatedAt: state.lastUpdatedAt,
  };
}

export async function savePersistedCatalog(state: CatalogState) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(toPersistedState(state)),
    );
  } catch {
    return;
  }
}

export async function loadPersistedCatalog(): Promise<Partial<PersistedCatalogState> | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as Partial<PersistedCatalogState>;
  } catch {
    return null;
  }
}
