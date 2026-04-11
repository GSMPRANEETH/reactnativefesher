import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { fetchProducts } from '../api/productsApi';
import type { Product } from '../types/product';
import type { CatalogState, PersistedCatalogState } from './types';

const PAGE_SIZE = 20;

const initialState: CatalogState = {
  query: '',
  ids: [],
  entities: {},
  page: 0,
  total: 0,
  selectedProductId: null,
  lastUpdatedAt: null,
  hydrated: false,
  status: 'idle',
  error: null,
};

function mergeIds(current: number[], incoming: Product[]) {
  const next = [...current];
  const seen = new Set(current);

  for (const product of incoming) {
    if (!seen.has(product.id)) {
      seen.add(product.id);
      next.push(product.id);
    }
  }

  return next;
}

function mergeEntities(
  current: Record<number, Product>,
  incoming: Product[],
): Record<number, Product> {
  const next = { ...current };

  for (const product of incoming) {
    next[product.id] = product;
  }

  return next;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load products. Please try again.';
}

export const fetchCatalogPage = createAsyncThunk(
  'catalog/fetchPage',
  async (args: { query: string; page: number; replace: boolean }, thunkApi) => {
    try {
      return await fetchProducts({
        query: args.query,
        page: args.page,
        limit: PAGE_SIZE,
      });
    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  },
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    hydrateCatalogState(
      state,
      action: PayloadAction<Partial<PersistedCatalogState> | null>,
    ) {
      if (action.payload) {
        state.query = action.payload.query ?? '';
        state.ids = Array.isArray(action.payload.ids) ? action.payload.ids : [];
        state.entities = action.payload.entities ?? {};
        state.page = action.payload.page ?? 0;
        state.total = action.payload.total ?? 0;
        state.selectedProductId = action.payload.selectedProductId ?? null;
        state.lastUpdatedAt = action.payload.lastUpdatedAt ?? null;
      }

      state.hydrated = true;
      state.status = 'idle';
      state.error = null;
    },
    setCatalogQuery(state, action: PayloadAction<string>) {
      const next = action.payload.trim();

      if (next === state.query) {
        return;
      }

      state.query = next;
      state.selectedProductId = null;
      state.ids = [];
      state.entities = {};
      state.page = 0;
      state.total = 0;
      state.error = null;
      state.status = 'idle';
    },
    selectProductId(state, action: PayloadAction<number | null>) {
      state.selectedProductId = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCatalogPage.pending, (state, action) => {
        if (action.meta.arg.replace && state.ids.length > 0) {
          state.status = 'refreshing';
        } else if (action.meta.arg.page > 1) {
          state.status = 'loadingMore';
        } else {
          state.status = 'loading';
        }

        state.error = null;
      })
      .addCase(fetchCatalogPage.fulfilled, (state, action) => {
        if (action.meta.arg.query.trim() !== state.query) {
          return;
        }

        const items = action.payload.products;

        if (action.meta.arg.replace) {
          const retainedProduct =
            state.selectedProductId !== null
              ? state.entities[state.selectedProductId]
              : undefined;

          state.ids = items.map(item => item.id);
          state.entities = mergeEntities(
            retainedProduct ? { [retainedProduct.id]: retainedProduct } : {},
            items,
          );
        } else {
          state.ids = mergeIds(state.ids, items);
          state.entities = mergeEntities(state.entities, items);
        }

        state.page = action.meta.arg.page;
        state.total = action.payload.total;
        state.lastUpdatedAt = Date.now();
        state.status = 'idle';
        state.error = null;
      })
      .addCase(fetchCatalogPage.rejected, (state, action) => {
        if (action.meta.arg.query.trim() !== state.query) {
          return;
        }

        state.status = 'failed';
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          'Could not load products. Please try again.';
      });
  },
});

export const { hydrateCatalogState, setCatalogQuery, selectProductId } =
  catalogSlice.actions;

export const selectCatalog = (state: { catalog: CatalogState }) =>
  state.catalog;
const selectCatalogIds = (state: { catalog: CatalogState }) =>
  state.catalog.ids;
const selectCatalogEntities = (state: { catalog: CatalogState }) =>
  state.catalog.entities;
const selectSelectedProductId = (state: { catalog: CatalogState }) =>
  state.catalog.selectedProductId;
const selectCatalogTotal = (state: { catalog: CatalogState }) =>
  state.catalog.total;
export const selectCatalogHydrated = (state: { catalog: CatalogState }) =>
  state.catalog.hydrated;
export const selectCatalogHasMore = createSelector(
  [selectCatalogIds, selectCatalogTotal],
  (ids, total) => ids.length < total,
);
export const selectVisibleProducts = createSelector(
  [selectCatalogIds, selectCatalogEntities],
  (ids, entities) =>
    ids
      .map(id => entities[id])
      .filter((item): item is Product => Boolean(item)),
);
export const selectSelectedProduct = createSelector(
  [selectSelectedProductId, selectCatalogEntities],
  (selectedId, entities) => {
    if (selectedId === null) {
      return null;
    }

    return entities[selectedId] ?? null;
  },
);
export const selectProductById = (
  state: { catalog: CatalogState },
  productId: number,
) => state.catalog.entities[productId] ?? null;

export default catalogSlice.reducer;
