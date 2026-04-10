import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchCategories } from '../api/categoriesApi';
import type { CategoryInfo } from '../api/categoriesApi';

interface CategoriesState {
  items: CategoryInfo[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const loadCategories = createAsyncThunk<
  CategoryInfo[],
  void,
  { rejectValue: string }
>(
  'categories/load',
  async (_, thunkApi) => {
    try {
      return await fetchCategories();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not load categories. Please try again.';

      return thunkApi.rejectWithValue(message);
    }
  },
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadCategories.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload ??
          action.error.message ??
          'Could not load categories.';
      });
  },
});

export const selectCategories = (state: { categories: CategoriesState }) =>
  state.categories;

export default categoriesSlice.reducer;
