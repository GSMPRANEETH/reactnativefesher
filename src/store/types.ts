import type { Product } from '../types/product';

export type CatalogStatus =
  | 'idle'
  | 'loading'
  | 'loadingMore'
  | 'refreshing'
  | 'failed';

export interface PersistedCatalogState {
  query: string;
  ids: number[];
  entities: Record<number, Product>;
  page: number;
  total: number;
  selectedProductId: number | null;
  lastUpdatedAt: number | null;
}

export interface CatalogState extends PersistedCatalogState {
  hydrated: boolean;
  status: CatalogStatus;
  error: string | null;
}
